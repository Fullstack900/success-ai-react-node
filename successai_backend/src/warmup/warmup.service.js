import crypto from 'crypto';
import _ from 'lodash';
import * as accountService from "../account/account.service.js";
import nodemailer from 'nodemailer';
import * as azureService from '../common/services/azure.service.js';
import * as googleService from '../common/services/google.service.js';
import * as openaiService from '../common/services/openai.service.js';
import * as smtpService from '../common/services/smtp.service.js';
import * as utils from '../common/utils/utils.js';
import * as emailEngineApi from "./warmupEmailEngineApis.js"
import { getAccountImapSettings, accountStatFindOneAndUpdate } from '../account/account.service.js';
import { getMailboxList, getEmailsCount } from "../common/services/imap.service.js";
import Domain from './models/domain-dkim.modal.js';
import Account from '../account/models/account.model.js';
import WarmupStatus from '../account/enum/warmup-status.enum.js';
import Provider from '../account/enum/provider.enum.js';
import Setting from '../account/enum/warmup-setting-type.js';
import emailSubjects from './data/email-subjects.json' assert { type: 'json' };
import emailGreeting from './data/email-greeting.json' assert { type: 'json' };
import AccountStatus from '../account/enum/account-status.enum.js';
import WarmupEmail from './models/warmup-email.model.js';
import moment from 'moment';
import logger from '../common/utils/logger.js';
import Handlebars from 'handlebars';
import { ImapFlow } from 'imapflow';
import { Readable } from 'stream';
import AccountWarmupStats from '../account/models/account_warmup_stats.js';
import WarmupBlocklist from './models/warmup-blocklist.model.js';
import mongoose from 'mongoose';
import Joi from 'joi';
import blocklistImportType from './enum/blocklist-import-type.enum.js';
import fetch from 'node-fetch';
import { getDomainFromEmail, removeStringBetweenPlusAndAt } from '../common/utils/utils.js';
import HttpErrors from 'http-errors';
import momentTZ from "moment-timezone"
// import User from "../user/models/user.model.js";
import UserPlan from '../billing/models/user-plan.model.js';
import { warmupSettings } from '../account/warmup.settings.js';
import { sendEmailEngineMail } from '../common/utils/emailEngineMail.js';
import { addOrUpdateEmailAnalytics } from '../monitor/monitor.service.js';
import QueuedWarmup from './models/queued-warmup-email.model.js';
// import { generateIntercomEvent } from '../common/utils/intercom.js';
// import Constants from '../common/utils/constants.js';
export async function startWarmup() {
  const filter = {
    status: AccountStatus.Connected,
    'warmup.status': WarmupStatus.Enabled,
  };

  const day = moment().format('dddd');
  if (day === 'Saturday' || day === 'Sunday') {
    filter['warmup.advanceSetting.weekdayOnly'] = { $ne: true };
  }

  let skip = 0;
  let limit = 100;
  let total = await Account.countDocuments(filter);
  while (skip < total) {
    const accounts = await Account.find(filter).skip(skip).limit(limit);

     const responses = await Promise.allSettled(accounts.map(warmupAccount));

     const userSums = {};

    responses.forEach(response => {
      const { status, value } = response || {};
      if (status === "fulfilled" && value?.type === 'Warmup') {
        const { userId, warmupMailSent } = value;
        const userIdString = String(userId);

        if (!userSums[userIdString]) {
          userSums[userIdString] = 0;
        }
        userSums[userIdString] += warmupMailSent;
      }
    });

  const userSumsArray = Object.entries(userSums).map(([userId, sum]) => ({
    userId: userId,
    sum: sum
  }));
  const promises = userSumsArray.map(async ({ userId, sum }) => {
    const result = await addOrUpdateEmailAnalytics({_id: userId}, sum, "Warmup");
    return result;
  });
  await Promise.all(promises);
    skip += accounts.length;
  }
  
  return total;
}

async function warmupAccount(account) {
  const { totalSend } = await getTotalSendAnyReplyCount(account);
  if (totalSend < 1) return;

  const recipients = await Account.aggregate([
    {
      $match: {
        'warmup.status': WarmupStatus.Enabled,
        'warmup.filterTag': { $ne: account.warmup.filterTag },
      },
    },
    {
      $sample: { size: 1 },
    },
  ]);
  // const user = await User.findById(account.createdBy);
  // if (user){
  //   await generateIntercomEvent(
  //     user.email,
  //     Constants.WARMUP_INITIATED,
  //     {},
  //     user._id
  //   );
  // }
  const res = await sendMail(account, recipients);
  // if (user){
  //   await generateIntercomEvent(
  //     user.email,
  //     Constants.WARMUP_SUCCESSFUL,
  //     {},
  //     user._id
  //   );
  // }
  return res;
}

async function getTotalSendAnyReplyCount(account) {
  const { increasePerDay, limitPerDay, replyRate, slowWarmupDisabled } =
    account.warmup.basicSetting;
  const lastDaySent = await getLastDaySentEmailCount(account);
  const todayAlreadyReplied = await getTodayAlreadyRepliedEmailCount(account);
  const todayAlreadySent =
    (await getTodayAlreadySentEmailCount(account)) - todayAlreadyReplied;

  const sendLimit = slowWarmupDisabled
    ? limitPerDay
    : lastDaySent + increasePerDay;

  const todaySendLimit = limitPerDay > sendLimit ? sendLimit : limitPerDay;

  const replyLimit = Math.round((todaySendLimit * replyRate) / 100);

  const received_count = await getTodaysReceived(account);

  const todayReplyLimit = (received_count > replyLimit) ? replyLimit : received_count
  
  const totalSend = todaySendLimit - todayReplyLimit;  

  const processTime = await processWarmup(todaySendLimit, todayAlreadyReplied + todayAlreadySent)

  if (!processTime) return {
    totalSend: 0,
    totalReply: 0,
  };

  if ((todayAlreadyReplied + todayAlreadySent) >= todaySendLimit)
    return {
      totalSend: 0,
      totalReply: 0,
    };

  return {
    totalSend: totalSend - todayAlreadySent,
    totalReply: todayReplyLimit - todayAlreadyReplied,
  };
}

async function getTodaysReceived(account) {

  const data = await AccountWarmupStats.findOne({
    emailId: account._id,
    createdAt: { $gte: moment().startOf("day") }
  })

  if (!data)
    return 0
  else
    return data.received_count

}



async function sendMail(sender, recipients) {
  let warmupMailSent = 0;
  for (const recipient of recipients) {

    if (sender?.warmup?.basicSetting?.alertBlock) {
      const isBlocked = await searchEmailInBlocklist(recipient.email);
      if (isBlocked)
        continue;
    }
    warmupMailSent = warmupMailSent + 1;
    let subject = getRandomSubject({ name: recipient.name.first });

    let emailGreet = getRandomGreeting({ name: recipient.name.first }) + '\n\n'
    let { body } = await openaiService.generateWarmupEmail(subject)

    let htmlBody = body;

    htmlBody += '\n\n' + sender.name.first + " " + sender.name.last
    const tags = `${sender.warmup.filterTag}-${recipient.warmup.filterTag}`;
    subject += ' | ' + tags;

    htmlBody = emailGreet + htmlBody + '\n\n' + tags;

    //condition for warmup custom domain 
    if (sender.customDomain.isEnable && sender.warmup.advanceSetting.customTrackingDomain && sender.customDomain.name !== "") {
      const url = await utils.ensureHttpsUrl(sender.customDomain.name)
      htmlBody += `<br><br><img src="${url}" width="1" height="1" border="0" alt="" />`;
    }

    let info;

    // console.log(sender.email, recipient.email, subject, htmlBody);

    let data = {
      to: [
        {
          name: recipient.name.first,
          address: recipient.email,
        },
      ],
      subject: subject,
      text: body,
      html: htmlBody,
    };
    
    try {
      info = await sendEmailEngineMail(sender.emailEngineAccountId, data)
      if(info.messageId) {
        await QueuedWarmup.create({
          from: sender,
          to: recipient,
          subject,
          body,
          messageId: info.messageId,
        });
      }

    } catch (error) {
      if(error.message.indexOf(502) > -1 || error.message.indexOf(500) > -1){
        return
      }
      if(error?.response?.data?.error?.message) {
        sender.warmup.error = error?.response?.data?.error?.message 
      } else if(error?.response?.statusText) {
        sender.warmup.error = error?.response?.statusText
      } else {
        sender.warmup.error = error?.response?.status
      }
      // const user = await User.findById(sender.createdBy);
      // if(user){
      //   await generateIntercomEvent(
      //     user.email,
      //     Constants.WARMUP_STOP,
      //     {error: sender.warmup.error},
      //     user._id
      //   );
      // }
      sender.warmup.warmupRejectTotal += 1;
      await sender.save();
      // if (account.warmup.warmupRejectTotal >= warmupSettings.sendingErrorCount) {
      //   account.warmup.status = WarmupStatus.Paused;
      //   account.status = AccountStatus.Disconnected;
      //   await account.save();
      //   await WarmupEmail.deleteMany({ to: account._id, stats_loaded: false });
      // }
      // logger.error(account.email, error);
    }
    // if (sender.provider === Provider.Microsoft_OAuth) {
    //   console.log(`microsft`);
    //   info = await azureService.sendMail(
    //     sender.name.first + " " + sender.name.last + " <" + sender.email + ">",
    //     recipient.email,
    //     sender.microsoftRefreshToken,
    //     { subject, body }
    //   );
    // } else if (sender.provider === Provider.Google_OAuth) {
    //   console.log(`google`);
    //   info = await googleService.sendMail(
    //     sender.name.first + " " + sender.name.last + " <" + sender.email + ">",
    //     recipient.email,
    //     sender.googleRefreshToken,
    //     { subject, body }
    //   );
    // } else {
    //   console.log(`smtp`);
    //   info = await smtpService.sendMail(
    //     sender.name.first + " " + sender.name.last + " <" + sender.email + ">",
    //     recipient.email,
    //     sender.smtp,
    //     { subject, body }
    //   );
    // }
  }

  return {userId: sender?.createdBy, warmupMailSent, type: "Warmup"}
}

export async function emailSending_webhook(outLookData) {
  try {
    let queuedWarmup;
    const messageIdToSearch = outLookData?.originalMessageId || outLookData?.messageId;
    queuedWarmup = await QueuedWarmup.findOne({ messageId: messageIdToSearch });
    if(queuedWarmup){
      if(queuedWarmup?.inReplyTo){
        await WarmupEmail.create({
          from: queuedWarmup.from,
          to: queuedWarmup.to,
          subject: queuedWarmup.subject,
          body: queuedWarmup.body,
          inReplyTo: queuedWarmup.inReplyTo,
          messageId: queuedWarmup.messageId,
        });
        await WarmupEmail.findByIdAndUpdate(queuedWarmup.inReplyTo, { isReplied: true });
      } else {
        await WarmupEmail.create({
          from: queuedWarmup.from,
          to: queuedWarmup.to,
          subject: queuedWarmup.subject,
          body: queuedWarmup.body,
          messageId: queuedWarmup.messageId,
        });
      }
    await QueuedWarmup.deleteOne({ _id: queuedWarmup._id });
  }
  } catch (error) {
      console.error('Error updating email in webhook:', error);
      throw error;
  }
}

function getRandomSubject(data) {
  const subject = emailSubjects[crypto.randomInt(emailSubjects.length)];
  const template = Handlebars.compile(subject);
  return template(data);
}

function getRandomGreeting(data) {
  const start = emailGreeting[crypto.randomInt(emailGreeting.length)];
  const template = Handlebars.compile(start);
  return template(data);
}

function getTodayAlreadySentEmailCount(account) {
  return WarmupEmail.countDocuments({
    from: account,
    sentAt: {
      $gt: moment().startOf('day'),
      $lt: moment().endOf('day'),
    },
  });
}

function getTodayAlreadyRepliedEmailCount(account) {
  return WarmupEmail.countDocuments({
    from: account,
    inReplyTo: { $exists: true },
    sentAt: {
      $gt: moment().startOf('day'),
      $lt: moment().endOf('day'),
    },
  });
}

function getLastDaySentEmailCount(account) {
  const day = moment().format('dddd');

  let subtractDays = 1;

  if (account.warmup.advanceSetting.weekdayOnly && day === 'Monday')
    subtractDays = 3;

  return WarmupEmail.countDocuments({
    from: account,
    sentAt: {
      $gt: moment().startOf('day').subtract(subtractDays, 'day'),
      $lt: moment()
        .startOf('day')
        .subtract(subtractDays - 1, 'day'),
    },
  });
}

export async function startWarmupReply() {
  const filter = {
    status: AccountStatus.Connected,
    'warmup.status': WarmupStatus.Enabled,
  };

  const day = moment().format('dddd');
  if (day === 'Saturday' || day === 'Sunday') {
    filter['warmup.advanceSetting.weekdayOnly'] = { $ne: true };
  }

  let skip = 0;
  let limit = 10;
  let total = await Account.countDocuments(filter);

  while (skip < total) {
    const accounts = await Account.find(filter).skip(skip).limit(limit);
    await Promise.allSettled(accounts.map(replyEmail));
    skip += accounts.length;
  }
  
  return total;
}

async function replyEmail(account) {
  const { totalReply } = await getTotalSendAnyReplyCount(account);
  if (totalReply < 1) return;

  const warmupEmails = await WarmupEmail.aggregate([
    {
      $match: {
        to: account._id,
        messageId: { $exists: true },
        isReplied: false,
      },
    },
    {
      $sample: { size: 1 },
    },
    {
      $lookup: {
        as: 'from',
        from: 'accounts',
        localField: 'from',
        foreignField: '_id',
      },
    },
    {
      $unwind: '$from',
    },
  ]);

  await sendReplyMail(account, warmupEmails);
}
// export async function sendReplyMail(sender, mails) {
//   const mydata = [];


//   for (const mail of mails) {

//     const recipient = mail.from;
//     if (sender?.warmup?.basicSetting?.alertBlock) {
//       const isBlocked = await searchEmailInBlocklist(recipient.email);
//       if (isBlocked)
//         continue;
//     }

//     //condition for warmup custom domain 
//     if (sender.warmup.customDomain.isEnable && sender.warmup.customDomain.name !== "") {
//       const url = await utils.ensureHttpsUrl(sender.warmup.customDomain.name);
//     }
//     let emailGreet = getRandomGreeting({ name: mail.from.name.first }) + '\n\n'
//     let { body } = await openaiService.generateWarmupEmailReply(mail.body);

//     const tags = `tags`;
//     body = body + '\n\n' + tags;

//     const subject = mail.subject;
//     const inReplyTo = mail.messageId;

//     let info;
//     console.log(body);
//     mydata.push(body);
//   }
//   return mydata;
// }


async function sendReplyMail(sender, mails) {
  for (const mail of mails) {

    const recipient = mail.from;
    if (sender?.warmup?.basicSetting?.alertBlock) {
      const isBlocked = await searchEmailInBlocklist(recipient.email);
      if (isBlocked)
        continue;
    }
    let emailGreet = getRandomGreeting({ name: recipient.name.first }) + '\n\n'
    let { body } = await openaiService.generateWarmupEmailReply(mail.body);
    let htmlBody = body;

    htmlBody += '\n\n' + sender.name.first + " " + sender.name.last
    // subject += ' | ' + tags;
    const tags = `${sender.warmup.filterTag}-${recipient.warmup.filterTag}`;
    htmlBody = emailGreet + htmlBody + '\n\n' + tags;
    
    // body = emailGreet + body + '\n' + sender.name.first + " " + sender.name.last + '\n\n' + tags;
    const subject = mail.subject;
    const inReplyTo = mail.messageId;

    let info;
    try{
      let data = {
        to: [
          {
            name: recipient.name.first,
            address: recipient.email,
          },
        ],
        replyTo: [
          {
            name: recipient.name.first,
            address: recipient.email,
          },
        ],
        messageId: inReplyTo,
        subject: subject,
        text: body,
        html: htmlBody,
      };
      info = await sendEmailEngineMail(sender?.emailEngineAccountId, data);
      if(info.messageId) {
        await QueuedWarmup.create({
          from: sender,
          to: recipient,
          subject,
          body,
          inReplyTo: mail,
          messageId: info.messageId,
        });
      }
    } catch(error){
      // console.log(`WarmUp Email not sent`);
    }

    // if (sender.provider === Provider.Microsoft_OAuth) {
    //   info = await azureService.sendMail(
    //     sender.name.first + " " + sender.name.last + " <" + sender.email + ">",
    //     recipient.email,
    //     sender.microsoftRefreshToken,
    //     { subject, body, inReplyTo }
    //   );
    // } else if (sender.provider === Provider.Google_OAuth) {
    //   info = await googleService.sendMail(
    //     sender.name.first + " " + sender.name.last + " <" + sender.email + ">",
    //     recipient.email,
    //     sender.googleRefreshToken,
    //     { subject, body, inReplyTo }
    //   );
    // } else {
    //   info = await smtpService.sendMail(
    //     sender.name.first + " " + sender.name.last + " <" + sender.email + ">",
    //     recipient.email,
    //     sender.smtp,
    //     { subject, body, inReplyTo }
    //   );
    // }
  }
}

export async function startReadEmulation() {
  const filter = {
    status: AccountStatus.Connected,
    'warmup.status': WarmupStatus.Enabled,
    'warmup.advanceSetting.readEmulation': true,
  };

  let skip = 0;
  let limit = 10;
  let total = await Account.countDocuments(filter);

  while (skip < total) {
    const accounts = await Account.find(filter).skip(skip).limit(limit);
    await Promise.all(accounts.map(readEmulation));
    skip += accounts.length;
  }

  return total;
}

// async function readEmulation(account) {
//   const sentMails = await WarmupEmail.find({ from: account }).populate('to');

//   for (const sentMail of sentMails) {
//     const { email, provider, googleRefreshToken, microsoftRefreshToken, imap } =
//       account;

//     let client;

//     if (provider === Provider.Google_OAuth) {
//       const { accessToken } = await googleService.getTokenByRefreshToken(
//         googleRefreshToken
//       );

//       client = new ImapFlow({
//         host: 'imap.gmail.com',
//         port: 993,
//         auth: {
//           user: email,
//           accessToken,
//         },
//         secure: true,
//         logger: false,
//       });
//     } else if (provider === Provider.Microsoft_OAuth) {
//       const { accessToken } = await azureService.getTokenByRefreshToken(
//         microsoftRefreshToken
//       );

//       client = new ImapFlow({
//         host: 'outlook.office365.com',
//         port: 993,
//         auth: {
//           user: email,
//           accessToken,
//         },
//         secure: true,
//         logger: false,
//       });
//     } else {
//       client = new ImapFlow({
//         host: imap.host,
//         port: imap.port,
//         auth: {
//           user: imap.username,
//           pass: imap.password,
//         },
//         secure: true,
//         logger: false,
//       });
//     }

//     await client.connect();

//     let lock = await client.getMailboxLock('INBOX');
//     try {
//       const messages = client.fetch(
//         { subject: sentMail.subject },
//         { bodyParts: ['TEXT'] }
//       );
//       for await (const message of messages) {
//         const stream = Readable.from(message.bodyParts.get('text'));
//         stream.on('data', (data) => { });
//       }
//     } finally {
//       lock.release();
//     }

//     await client.logout();
//   }
// }

async function readEmulation(account) {
  const sentMails = await WarmupEmail.find({ from: account }).populate('to');

  for (const sentMail of sentMails) {
    const from = account?.email;
    const to = sentMail?.to?.email;
    const subject = sentMail?.subject;
    const emailEngineAccountId = sentMail?.to?.emailEngineAccountId;
    try {
      let message;
      const inboxMailBox = await getMailboxList({ emailEngineAccountId, mailbox: 'INBOX' });
      const spamMailBox = await getMailboxList({ emailEngineAccountId, mailbox: 'Spam' });

       message =  await emailEngineApi.apiRequestForChangeFlag(emailEngineAccountId, inboxMailBox, to, from,  subject, "Seen") 
      if (!message){
        message =  await emailEngineApi.apiRequestForChangeFlag(emailEngineAccountId, spamMailBox, to, from,  subject, "Seen")  
      }
    } catch(err){
      console.log(`error`, err)
    }
  }
}

export async function updateUserInboxSpamCount() {
  // Get warmupemails sent today and fetch to accounts
  const today = new Date();
  const warmUpSendToday = await WarmupEmail.aggregate([
    {
      $match: {
        $or: [
          { stats_loaded: { $exists: false } },
          { stats_loaded: false }
        ],
        $expr: {
          $and: [
            {
              $eq: [
                {
                  $dateToString: {
                    date: '$sentAt',
                    format: '%d-%m-%Y',
                  },
                },
                {
                  $dateToString: {
                    format: '%d-%m-%Y',
                    date: today,
                  },
                },
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        from: 1,
        to: 1,
        _id: 1,
        subject: 1,
        messageId: 1
      },
    },
    {
      $lookup: {
        from: 'accounts',
        let: { toId: '$to' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$toId'] },
            },
          },
          {
            $project: {
              email: 1,
              _id: 0,
              warmup: 1,
            },
          },
        ],
        as: 'toAccount',
      },
    },
    {
      $unwind: {
        path: '$toAccount',
      },
    },
    {
      $lookup: {
        from: 'accounts',
        let: { fromId: '$from' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$fromId'] },
            },
          },
          {
            $project: {
              warmup: 1,
              email: 1,
              _id: 0,
            },
          },
        ],
        as: 'fromAccount',
      },
    },
    {
      $unwind: {
        path: '$fromAccount',
      },
    },
  ]);
  // const today = moment().add(1, 'days').format('DD-MMM-YYYY');
  // console.log(warmUpSendToday.length);
  const idValues = warmUpSendToday.map(obj => obj._id);
  const [
    // fromAccountSentCount,
    // fromAccountInboxCount,
    fromAccountSpamCount,
    // emailReceivedInAccountCount,
  ] = await Promise.all([
    // getFromAccountEmailCount({warmUpSendToday, today, category: 'sent'}),
    // getFromAccountEmailCount({warmUpSendToday, today, category: 'inbox'}),
    getFromAccountEmailCount({ warmUpSendToday, today, category: 'spam' }),
    // getEmailReceivedInAccountCount({warmUpSendToday, today}),
  ]);

  await WarmupEmail.updateMany({ _id: { $in: idValues } }, { $set: { stats_loaded: true } });

}

async function getFromAccountEmailCount({ warmUpSendToday, today, category }) {
  const userSent = new Map();

  for (const iterator of warmUpSendToday) {
    let toEmail = iterator.toAccount.email;
    let fromEmail = iterator.fromAccount.email;
    const subject = iterator.subject;
    const messageId = iterator.messageId.replace('<', '').replace('>', '');

    if (fromEmail.includes('+')) {
      fromEmail = removeStringBetweenPlusAndAt(fromEmail);
    }

    if (toEmail.includes('+')) {
      toEmail = removeStringBetweenPlusAndAt(toEmail);
    }

    // const imapConfig = await getAccountImapSettings({ email: category === 'sent' ? iterator.fromAccount.email : iterator.toAccount.email });
    const email = { email: category === 'sent' ? iterator.fromAccount.email : iterator.toAccount.email };
    let count = 0;
    if (email) {
      const searchParam = {
        or: [
          {
            subject,
            from: fromEmail,
            to: toEmail,
            on: today
          },
          { header: { "Message-ID": messageId } },
          {
            subject,
            from: fromEmail,
            to: toEmail,
            on: moment(today).format('YYYY-MM-DD')
          },
          {
            subject,
            from: fromEmail,
            to: toEmail,
            on: moment(today).format('MM-DD-YYYY')
          },
        ]
      };
      switch (category) {
        // case 'sent':
        //   count = (await getEmailCountFormUserSend({ imapConfig, searchParam }))?.sentCount || 0;
        //   break;
        // case 'inbox':
        //   count = (await getEmailCountFormUserInbox({ imapConfig, searchParam }))?.inboxCount || 0;
        //   break;
        // case 'success.ai warmup':
        //   count = (await getEmailCountFormUserInbox({ imapConfig, searchParam }))?.inboxCount || 0;
        //   break;
        case 'spam':
          count = (await getEmailCountFormUserSpam({ email, searchParam }))?.spamCount || 0;
          break;
      }
    }

    const key = iterator.fromAccount.email;
    userSent.set(key, (userSent.get(key) || 0) + count);
  }

  const startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);
  // console.log(`${category}_count:`, userSent)
  for (let [key, value] of userSent) {
    const account = await Account.findOne({ email: key });
    if (account) {
      const query = { email: key, emailId: account._id, createdAt: { $gte: startDate, $lte: endDate } };
      const update = { $inc: { [`${category}_count`]: value } };  // change to inc before deployment
      await accountStatFindOneAndUpdate(query, update);
    }
  }
}

// async function getEmailReceivedInAccountCount({ warmUpSendToday, today }) {
//   const userSent = new Map();
//   for (const iterator of warmUpSendToday) {
//     let toEmail = iterator.toAccount.email;
//     let fromEmail = iterator.fromAccount.email;
//     const toAccountTag = iterator.toAccount.warmup.filterTag;

//     if (fromEmail.indexOf('+') > -1) {
//       fromEmail = removeStringBetweenPlusAndAt(fromEmail);
//     }
//     if (toEmail.indexOf('+') > -1) {
//       toEmail = removeStringBetweenPlusAndAt(toEmail);
//     }
//     // const subject = iterator.subject;
//     const imapConfig = await getAccountImapSettings({
//       email: iterator.toAccount.email,
//     });
//     let spamCount = 0;
//     let messageId = iterator.messageId.replace('<','').replace('>','');
//     if (imapConfig) {
//       const data = await getEmailCountFormUserReceived({
//         imapConfig,
//         searchParam: {
//           or: [
//             {
//               subject: toAccountTag,
//               on: today,
//             },
//             {header : {"Message-ID" : messageId}},
//             {
//               subject: toAccountTag,
//               on: moment(today).format('YYYY-MM-DD')
//             },
//             {
//               subject: toAccountTag,
//               on: moment(today).format('MM-DD-YYYY')
//             },
//           ]
//         },
//       });
//       spamCount = data?.total;
//     }
//     const key = iterator.toAccount.email;
//     userSent.set(key, spamCount);
//   }
//   const startDate = new Date(today);
//   startDate.setHours(0, 0, 0, 0);
//   const endDate = new Date(today);
//   endDate.setHours(23, 59, 59, 999);
//   console.log('received_count',userSent);
//   for (let [key, value] of userSent) {
//     const account = await Account.findOne({ email: key });
//     const query = { email: key, emailId: account._id, createdAt: { $gte: startDate, $lte: endDate } };
//     const update = { $set: { received_count: value } };
//     await accountStatFindOneAndUpdate(query, update);
//   }
// }

export async function advanceSettingShowMore() {

  let skip = 0;
  let limit = 1000;
  let total = await Account.countDocuments();

  while (skip < total) {
    const accounts = await Account.find(
      { status: AccountStatus.Connected }
    ).skip(skip).limit(limit);
    for await (let element of accounts) {
      await warmupAdvanceAccount(element);
    }
    skip += accounts.length;
  }
  return total;
}

export async function warmupLabelMove() {

  let skip = 0;
  let limit = 1000;
  let total = await Account.countDocuments();

  while (skip < total) {
    const accounts = await Account.find(
      { status: AccountStatus.Connected }
    ).skip(skip).limit(limit);
    for await (let element of accounts) {
      await movetolabelfolder(element._id)
    }
    skip += accounts.length;
  }
  return total;
}


export async function warmupAdvanceAccount(account) {
  const { openRate, spamProtectionRate, markImportantRate } =
    account.warmup.advanceSetting;
  const { _id } = account;

  await markNotSpam(spamProtectionRate, _id);
  await markOpen(openRate, _id);
  await markAsImportant(markImportantRate, _id);
}

// export async function markOpen(openRate, _id) {
//   const notOpen = await WarmupEmail.find({
//     from: _id,
//     isOpen: false,
//   });

//   if (notOpen.length <= 0) {
//     return;
//   }

//   const totalOpen = Math.round((notOpen.length * openRate) / 100)

//   if (totalOpen === 0)
//     return

//   let currentCount = 0;

//   for await (let element of notOpen) {
//     const account = await Account.findOne({
//       _id: element.to,
//     });

//     if (!account) {
//       continue;
//     }

//     let messageId = element.messageId
//     let subject = element.subject

//     subject = subject.replaceAll('Re:', '')
//     messageId = messageId.replace('<', '').replace('>', '');

//     const status = await changeFlag(account, messageId, subject, Setting.OPEN);

//     if (status)
//       await WarmupEmail.findByIdAndUpdate(element._id, { isOpen: true });

//     currentCount++;

//     if (currentCount === totalOpen) return;
//   }
// }

export async function markOpen(openRate, _id) {
  const notOpen = await WarmupEmail.find({
    from: _id,
    isOpen: false,
  });

  if (notOpen.length <= 0) {
    return;
  }
  
  const totalOpen = Math.round((notOpen.length * openRate) / 100)

  if (totalOpen === 0)
    return

  let currentCount = 0;

  for await (let element of notOpen) {
    const account = await Account.findOne({
      _id: element.to,
    });

    if (!account) {
      continue;
    }

    let from = element.from;
    let subject = element.subject
    subject = subject.replaceAll('Re:', '')

    const status = await changeFlag(account, from , subject, Setting.OPEN);

    if (status)
      await WarmupEmail.findByIdAndUpdate(element._id, { isOpen: true });

    currentCount++;

    if (currentCount === totalOpen) return;
  }
}

// export async function movetolabelfolder(_id) {

//   const notMoved = await WarmupEmail.find({
//     from: _id,
//     isMoved: false,
//   }).sort({ sentAt: -1 });

//   if (notMoved.length <= 0) {
//     return;
//   }
//   // console.log("count", notMoved.length)
//   for await (let element of notMoved) {
//     // console.log(element.to)
//     const account = await Account.findOne({
//       _id: element.to,
//     });

//     if (!account) {
//       continue;
//     }
//     // console.log("email", account.email)
//     let messageId = element.messageId
//     let subject = element.subject

//     subject = subject.replaceAll('Re:', '')
//     messageId = messageId.replace('<', '').replace('>', '');

//     const status = await changeFlag(account, messageId, subject, Setting.Move);

//     if (status)
//       await WarmupEmail.findByIdAndUpdate(element._id, { isMoved: true });

//   }
// }

// export async function markNotSpam(spamProtectionRate, _id) {
//   const inSpam = await WarmupEmail.find({
//     from: _id,
//     isSpamProtect: false,
//   });

//   if (inSpam.length <= 0) {
//     return;
//   }

//   const totalSpam = Math.round((inSpam.length * spamProtectionRate) / 100)
//   if (totalSpam === 0)
//     return

//   let currentCount = 0;
//   // console.log("count", inSpam.length)
//   for await (let element of inSpam) {

//     const account = await Account.findOne({
//       _id: element.to,
//     });

//     if (!account) {
//       continue;
//     }

//     let messageId = element.messageId
//     let subject = element.subject

//     subject = subject.replaceAll('Re:', '')
//     messageId = messageId.replace('<', '').replace('>', '');

//     const status = await changeFlag(account, messageId, subject, Setting.SPAM);

//     if (status.status)
//       await WarmupEmail.findByIdAndUpdate(element._id, { isSpamProtect: true });

//     currentCount += status.count;

//     if (currentCount === totalSpam) return;
//   }
// }

// export async function markAsImportant(markImportantRate, _id) {
//   const markImportant = await WarmupEmail.find({
//     from: _id,
//     isMarkImportant: false,
//   });

//   if (markImportant.length <= 0) {
//     return;
//   }

//   const totalImportant = Math.round((markImportant.length * markImportantRate) / 100
//   );

//   if (totalImportant === 0)
//     return

//   let currentCount = 0;

//   for await (let element of markImportant) {
//     const account = await Account.findOne({
//       _id: element.to,
//     });

//     if (!account) {
//       continue;
//     }

//     let messageId = element.messageId
//     let subject = element.subject

//     subject = subject.replaceAll('Re:', '')
//     messageId = messageId.replace('<', '').replace('>', '');

//     const status = await changeFlag(account, messageId, subject, Setting.IMPORTANT);
//     if (status) {
//       await WarmupEmail.findByIdAndUpdate(element._id, {
//         isMarkImportant: true,
//       });
//     }

//     currentCount++;

//     if (currentCount === totalImportant) return;
//   }
// }

// export async function changeFlag(account, messageId, subject, type) {

//   const {
//     provider,
//     googleRefreshToken,
//     imap,
//     microsoftRefreshToken,
//     _id,
//     email,
//   } = account;

//   let client;
//   let markSeen;
//   let markImportant;
//   let markNotSpam;
//   let moveToFolder;
//   try {
//     if (provider === Provider.Google_OAuth) {
//       const { accessToken } = await googleService.getTokenByRefreshToken(
//         googleRefreshToken
//       );

//       client = new ImapFlow({
//         host: 'imap.gmail.com',
//         port: 993,
//         auth: {
//           user: email,
//           accessToken,
//         },
//         secure: true,
//         logger: false,
//       });
//     } else if (provider === Provider.Microsoft_OAuth) {
//       const { accessToken } = await azureService.getTokenByRefreshToken(
//         microsoftRefreshToken
//       );

//       client = new ImapFlow({
//         host: 'outlook.office365.com',
//         port: 993,
//         auth: {
//           user: email,
//           accessToken,
//         },
//         secure: true,
//         logger: false,
//       });
//     } else {
//       client = new ImapFlow({
//         host: imap.host,
//         port: imap.port,
//         auth: {
//           user: imap.username,
//           pass: imap.password,
//         },
//         secure: true,
//         logger: false,
//       });
//     }

//     await client.connect();
//   } catch (error) {
//     return true;
//   }

//   // console.log("Login account " + account.email)

//   try {

//     if (type === Setting.OPEN) {

//       let lock = await client.mailboxOpen('INBOX');

//       let search = await client.search({
//         seen: true,
//         or: [
//           { header: { "Message-ID": messageId } }
//         ]
//       })

//       if (search.length > 0) {
//         // console.log("Already seen : inbox")
//         await client.logout();
//         return true;
//       }

//       markSeen = await client.messageFlagsAdd({ subject }, ['\\Seen']);

//       // console.log("Move to open : " + markSeen)

//       await client.logout();
//       return markSeen;
//     } else if (type === Setting.IMPORTANT) {
//       let lock = await client.mailboxOpen('INBOX');

//       let search = await client.search({
//         flagged: true,
//         or: [
//           { header: { "Message-ID": messageId } }
//         ]
//       })

//       if (search.length > 0) {
//         // console.log("Already flagged : inbox")
//         await client.logout();
//         return true;
//       }

//       markImportant = await client.messageFlagsAdd({ subject }, ['\\Flagged']);

//       // console.log("Move to important : " + markImportant)
//       await client.logout();
//       return markImportant;
//     } else if (type === Setting.SPAM) {

//       const inbox = await getMailboxList({ client, mailbox: 'Inbox' });
//       const path = await getMailboxList({ client, mailbox: 'Spam' });
//       const label = Provider.WarmupLabel
//       let lock;
//       let search;

//       //Check inbox
//       lock = await client.mailboxOpen(inbox);
//       search = await client.search({
//         or: [
//           { header: { "Message-ID": messageId } }
//         ]
//       })
//       if (search.length > 0) {
//         // console.log("Already exist : inbox")
//         await client.logout();
//         return { status: true, count: 0 };
//       }
//       await client.mailboxClose();

//       lock = await client.mailboxOpen(path);
//       markNotSpam = await client.messageMove({
//         or: [
//           { header: { "Message-ID": messageId } }
//         ]
//       }, inbox);
//       // console.log("Move to spam : " + markNotSpam)
//       await client.logout();
//       return { status: markNotSpam, count: 1 };
//     } else if (type === Setting.Move) {

//       let mailbox
//       const path = await getMailboxList({ client, mailbox: 'Inbox' });
//       try {
//         mailbox = await client.mailboxOpen(Provider.WarmupLabel)
//       } catch (error) {
//         await client.mailboxCreate(Provider.WarmupLabel);
//         mailbox = await client.mailboxOpen(Provider.WarmupLabel);
//       }

//       const search = await client.search({
//         or: [
//           { header: { "Message-ID": messageId } }
//         ]
//       })
//       if (search.length > 0) {
//         await client.logout();
//         return true;
//       }
//       await client.mailboxClose();

//       let lock = await client.mailboxOpen(path);
//       moveToFolder = await client.messageCopy({
//         or: [
//           { header: { "Message-ID": messageId } },
//           {
//             subject,
//           }
//         ]
//       }, Provider.WarmupLabel);
//       // console.log("Moved to " + moveToFolder)
//       await client.logout();
//       if (moveToFolder)
//         return true;
//       else
//         return false;
//     }
//   } catch (err) {
//     return true;
//   }
// }

export async function movetolabelfolder(_id) {

  const notMoved = await WarmupEmail.find({
    from: _id,
    isMoved: false,
  }).sort({ sentAt: -1 });

  if (notMoved.length <= 0) {
    return;
  }
  // console.log("count", notMoved.length)
  for await (let element of notMoved) {
    const account = await Account.findOne({
      _id: element.to,
    });

    if (!account) {
      continue;
    }
    // console.log("email", account.email)
    let from = element.from;
    let subject = element.subject

    subject = subject.replaceAll('Re:', '')

    const status = await changeFlag(account, from, subject, Setting.Move);

    if (status)
      await WarmupEmail.findByIdAndUpdate(element._id, { isMoved: true });

  }
}

export async function markNotSpam(spamProtectionRate, _id) {
  const inSpam = await WarmupEmail.find({
    from: _id,
    isSpamProtect: false,
  });

  if (inSpam.length <= 0) {
    return;
  }

  const totalSpam = Math.round((inSpam.length * spamProtectionRate) / 100)
  if (totalSpam === 0)
    return

  let currentCount = 0;
  // console.log("count", inSpam.length)
  for await (let element of inSpam) {

    const account = await Account.findOne({
      _id: element.to,
    });

    if (!account) {
      continue;
    }

    let from = element.from;
    let subject = element.subject

    subject = subject.replaceAll('Re:', '')
    const status = await changeFlag(account, from , subject, Setting.SPAM);

    if (status.status)
      await WarmupEmail.findByIdAndUpdate(element._id, { isSpamProtect: true });

    currentCount += status.count;

    if (currentCount === totalSpam) return;
  }
}

export async function markAsImportant(markImportantRate, _id) {
  const markImportant = await WarmupEmail.find({
    from: _id,
    isMarkImportant: false,
  });

  if (markImportant.length <= 0) {
    return;
  }

  const totalImportant = Math.round((markImportant.length * markImportantRate) / 100
  );

  if (totalImportant === 0)
    return

  let currentCount = 0;

  for await (let element of markImportant) {
    const account = await Account.findOne({
      _id: element.to,
    });

    if (!account) {
      continue;
    }

    let from = element.from;
    let subject = element.subject

    subject = subject.replaceAll('Re:', '')

    const status = await changeFlag(account, from , subject, Setting.IMPORTANT);
    if (status) {
      await WarmupEmail.findByIdAndUpdate(element._id, {
        isMarkImportant: true,
      });
    }

    currentCount++;

    if (currentCount === totalImportant) return;
  }
}

export async function changeFlag(account, from,  subject, type) {

  const to = account?.email;
  const emailEngineAccountId = account?.emailEngineAccountId
  const fromEmail = await Account.findById({_id: from}, {email: 1})
  let markSeen;
  let markImportant;
  let markNotSpam;
  let moveToFolder;

  try {

    if (type === Setting.OPEN) {

      let search = await emailEngineApi.apiRequestForSearchMesssag(emailEngineAccountId, "INBOX", to, fromEmail?.email,  subject, Setting.OPEN)
      if (search.length > 0) {
        // console.log("Already seen : inbox")
        return true;
      }

      markSeen = await emailEngineApi.apiRequestForChangeFlag(emailEngineAccountId, "INBOX", to, fromEmail?.email,  subject, "Seen");
      // console.log("Move to open : " + markSeen)

      return markSeen;
    
    } else if (type === Setting.IMPORTANT) {

      let search = await emailEngineApi.apiRequestForSearchMesssag(emailEngineAccountId, "INBOX", to, fromEmail?.email, subject, Setting.IMPORTANT)

      if (search.length > 0) {
        // console.log("Already flagged : inbox")
        return true;
      }

      markImportant = await emailEngineApi.apiRequestForChangeFlag(emailEngineAccountId, "INBOX", to, fromEmail?.email,  subject, "Flagged");

      // console.log("Move to important : " + markImportant)
      return markImportant;
    } else if (type === Setting.SPAM) {

      const inbox = await getMailboxList({ emailEngineAccountId, mailbox: 'Inbox' });
      const path = await getMailboxList({ emailEngineAccountId, mailbox: 'Spam' });
      let search;

       search = await emailEngineApi.apiRequestForSearchMesssag(emailEngineAccountId, inbox, to, fromEmail?.email, subject)

      if (search.length > 0) {
        // console.log("Already exist : inbox")
        return { status: true, count: 0 };
      }

      markNotSpam = await emailEngineApi.apiRequestForMoveToInbox(emailEngineAccountId, path, to, fromEmail?.email, subject)
      // console.log("Move to inbox : " + markNotSpam)
      return { status: markNotSpam, count: 1 }; 
    } else if (type === Setting.Move) {

      const path = await getMailboxList({ emailEngineAccountId, mailbox: 'Inbox' });
      try {
        const folder = await emailEngineApi.apiRequestForFolderCreation(emailEngineAccountId, Provider.WarmupLabel);
      } catch (error) {
        console.log(`error`, error)
      }
      const folder = Provider.WarmupLabel;
     const search = await emailEngineApi.apiRequestForSearchMesssag(emailEngineAccountId, folder, to, fromEmail?.email, subject);
      if (search.length > 0) {
        return true;
      }

      moveToFolder = await emailEngineApi.apiRequestForMoveMessage(emailEngineAccountId, path, to, fromEmail?.email, subject)
      // console.log("Moved to " + moveToFolder)
      if (moveToFolder)
        return true;
      else
        return false;
    }
  } catch (err) {
    return true;
  }
}

const getEmailCountFormUserSpam = async ({ email, searchParam }) => {
  try {
    const account = await Account.findOne(email, {emailEngineAccountId: 1})
    const emailEngineAccountId = account?.emailEngineAccountId;
    const sentmailBox = await getMailboxList({ emailEngineAccountId, mailbox: 'Spam' });
    const spamCount = await getEmailsCount({
      emailEngineAccountId,
      searchParam,
      mailBox: sentmailBox,
    });

    return {
      spamCount,
    };
  } catch (err) {
    // console.error(`Error with account : ${imapConfig.auth.user}`, err);
    return {};
  }
};

// const getEmailCountFormUserReceived = async ({
//   imapConfig = {},
//   searchParam,
// }) => {
//   imapConfig.logger = false;
//   const client = new ImapFlow(imapConfig);

//   try {
//     await client.connect();
//     const sentmailBoxI = await getMailboxList({ client, mailbox: 'INBOX' });
//     const inboxCount = await getEmailsCount({
//       client,
//       searchParam,
//       mailBox: sentmailBoxI,
//     });
//     const sentmailBoxS = await getMailboxList({ client, mailbox: 'Spam' });
//     const spamCount = await getEmailsCount({
//       client,
//       searchParam,
//       mailBox: sentmailBoxS,
//     });
//     return {
//       inboxCount,
//       spamCount,
//       total: inboxCount + spamCount,
//     };
//   } catch (err) {
//     console.error(`Error with account : ${imapConfig.auth.user}`, err);
//     return {};
//   } finally {
//     client.logout();
//   }
// };

// export async function updateDkimSelector() {
//   const today = new Date();
//   const warmUpSendToday = await WarmupEmail.aggregate([
//     {
//       $match: {
//         $expr: {
//           $and: [
//             {
//               $eq: [
//                 {
//                   $dateToString: {
//                     date: '$sentAt',
//                     format: '%d-%m-%Y',
//                   },
//                 },
//                 {
//                   $dateToString: {
//                     format: '%d-%m-%Y',
//                     date: today,
//                   },
//                 },
//               ],
//             },
//           ],
//         },
//       },
//     },
//     {
//       $project: {
//         from: 1,
//         to: 1,
//         _id: 0,
//         subject: 1,
//       },
//     },
//     {
//       $lookup: {
//         from: 'accounts',
//         let: { toId: '$to' },
//         pipeline: [
//           {
//             $match: {
//               $expr: { $eq: ['$_id', '$$toId'] },
//             },
//           },
//           {
//             $project: {
//               email: 1,
//               _id: 0,
//               warmup: 1,
//             },
//           },
//         ],
//         as: 'toAccount',
//       },
//     },
//     {
//       $unwind: {
//         path: '$toAccount',
//       },
//     },
//     {
//       $lookup: {
//         from: 'accounts',
//         let: { fromId: '$from' },
//         pipeline: [
//           {
//             $match: {
//               $expr: { $eq: ['$_id', '$$fromId'] },
//             },
//           },
//           {
//             $project: {
//               warmup: 1,
//               email: 1,
//               _id: 0,
//             },
//           },
//         ],
//         as: 'fromAccount',
//       },
//     },
//     {
//       $unwind: {
//         path: '$fromAccount',
//       },
//     },
//     {
//       $group: {
//         _id: '$fromAccount.email',
//         subject: {
//           $last: '$subject',
//         },
//         toAccount: {
//           $last: '$toAccount',
//         },
//         fromAccount: {
//           $last: '$fromAccount',
//         },
//       },
//     },
//   ]);
//   for (const iterator of warmUpSendToday) {
//     let toEmail = iterator.toAccount.email;
//     let fromEmail = iterator.fromAccount.email;

//     if (fromEmail.indexOf('+') > -1) {
//       fromEmail = removeStringBetweenPlusAndAt(fromEmail);
//     }
//     if (toEmail.indexOf('+') > -1) {
//       toEmail = removeStringBetweenPlusAndAt(toEmail);
//     }
//     const subject = iterator.subject;
//     const imapConfig = await getAccountImapSettings({
//       email: iterator.toAccount.email,
//     });
//     if (imapConfig) {
//       const data = await getDKIMSelectorFromEmail({
//         imapConfig,
//         searchParam: {
//           subject,
//           on: today,
//           from: fromEmail,
//           to: toEmail,
//         },
//       });
//       if (data?.length) {
//         const uniqArray = _.uniqBy(data, 'domain');
//         for (const iterator of uniqArray) {
//           Domain.findOneAndUpdate(
//             { domain: iterator.domain },
//             { $addToSet: { dkimSelector: iterator.selector } },
//             { upsert: true }
//           ).then((res) => {
//             // console.log(res);
//           });
//         }
//       }
//     }
//   }
// }

export async function updateDkimSelector() {
  const today = new Date();
  const warmUpSendToday = await WarmupEmail.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            {
              $eq: [
                {
                  $dateToString: {
                    date: '$sentAt',
                    format: '%d-%m-%Y',
                  },
                },
                {
                  $dateToString: {
                    format: '%d-%m-%Y',
                    date: today,
                  },
                },
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        from: 1,
        to: 1,
        _id: 0,
        subject: 1,
      },
    },
    {
      $lookup: {
        from: 'accounts',
        let: { toId: '$to' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$toId'] },
            },
          },
          {
            $project: {
              email: 1,
              _id: 0,
              warmup: 1,
            },
          },
        ],
        as: 'toAccount',
      },
    },
    {
      $unwind: {
        path: '$toAccount',
      },
    },
    {
      $lookup: {
        from: 'accounts',
        let: { fromId: '$from' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$fromId'] },
            },
          },
          {
            $project: {
              warmup: 1,
              email: 1,
              _id: 0,
            },
          },
        ],
        as: 'fromAccount',
      },
    },
    {
      $unwind: {
        path: '$fromAccount',
      },
    },
    {
      $group: {
        _id: '$fromAccount.email',
        subject: {
          $last: '$subject',
        },
        toAccount: {
          $last: '$toAccount',
        },
        fromAccount: {
          $last: '$fromAccount',
        },
      },
    },
  ]);
  for (const iterator of warmUpSendToday) {
    let toEmail = iterator.toAccount.email;
    let fromEmail = iterator.fromAccount.email;
    
    if (fromEmail.indexOf('+') > -1) {
      fromEmail = removeStringBetweenPlusAndAt(fromEmail);
    }
    if (toEmail.indexOf('+') > -1) {
      toEmail = removeStringBetweenPlusAndAt(toEmail);
    }
    const subject = iterator.subject;

    const email = iterator.toAccount.email;
    const account = await Account.findOne({email: email}, {emailEngineAccountId: 1})
    const emailEngineAccountId = account.emailEngineAccountId;
    if (emailEngineAccountId) {
      const data = await getDKIMSelectorFromEmail({
        emailEngineAccountId,
        searchParam: {
          subject,
          on: today,
          from: fromEmail,
          to: toEmail,
        },
      });
      if (data?.length) {
        const uniqArray = _.uniqBy(data, 'domain');
        for (const iterator of uniqArray) {
          Domain.findOneAndUpdate(
            { domain: iterator.domain },
            { $addToSet: { dkimSelector: iterator.selector } },
            { upsert: true }
          ).then((res) => {
            console.log(`final`,res);
          });
        }
      }
    }
  }
}

// const getDKIMSelectorFromEmail = async ({ imapConfig = {}, searchParam }) => {
//   imapConfig.logger = false;
//   const client = new ImapFlow(imapConfig);

//   try {
//     await client.connect();
//     const inboxMailBox = await getMailboxList({ client, mailbox: 'INBOX' });
//     const spamMailBox = await getMailboxList({ client, mailbox: 'Spam' });
//     let getDkimData = await getEmailDKIMData({
//       client,
//       searchParam,
//       mailBox: inboxMailBox,
//     });
//     if (!getDkimData.length) {
//       getDkimData = await getEmailDKIMData({
//         client,
//         searchParam,
//         mailBox: spamMailBox,
//       });
//     }
//     return getDkimData;
//   } catch (err) {
//     // console.error(`Error with account : ${imapConfig.auth.user}`, err);
//     return {};
//   } finally {
//     await client.logout();
//   }
// };


const getDKIMSelectorFromEmail = async ({ emailEngineAccountId, searchParam }) => {
  try {
    const inboxMailBox = await getMailboxList({ emailEngineAccountId, mailbox: 'INBOX' });
    const spamMailBox = await getMailboxList({ emailEngineAccountId, mailbox: 'Spam' });
    let getDkimData = await getEmailDKIMData({
      emailEngineAccountId,
      searchParam,
      mailBox: inboxMailBox,
    });
    if (!getDkimData.length) {
      getDkimData = await getEmailDKIMData({
        emailEngineAccountId,
        searchParam,
        mailBox: spamMailBox,
      });
    }
    return getDkimData;
  } catch (err) {
    // console.error(`Error with account : ${imapConfig.auth.user}`, err);
    return {};
  } 
};

// const getEmailDKIMData = async function ({ client, searchParam, mailBox }) {
//   let lock = await client.getMailboxLock(mailBox);
//   try {
//     let dkimSelector = [];
//     const uids = await client.search(searchParam);
//     for (const uid of uids) {
//       const message = await client.fetchOne(uid, {
//         envelope: true,
//         headers: true,
//       });
//       const headerString = message.headers?.toString('utf-8');
//       console.log(`header`, headerString)
//       //get dkim signature
//       const dkimSelectorPattern = /DKIM-Signature:[\s\S]*?s=([^;\s]+)/i;

//       // Match the selector using the pattern
//       const match = headerString.match(dkimSelectorPattern);
//       console.log(`match`, match)
//       const sValue = match ? match[1].trim() : null;
//       console.log(`sv`, sValue)
//       const domain = getDomainFromEmail(message.envelope.from[0].address);
//       const data = {
//         domain: domain,
//         selector: sValue,
//       };
//       console.log(`data`, data)
//       dkimSelector.push(data);
//     }

//     return dkimSelector;
//   } catch (err) {
//     // console.error('Error:', err);
//   } finally {
//     lock.release();
//   }
// };

const getEmailDKIMData = async function ({ emailEngineAccountId, searchParam, mailBox }) {
  try {
    let dkimSelector = [];
    const {subject, from, to} = searchParam
    const uids = await emailEngineApi.apiRequestForSearchMesssag(emailEngineAccountId, mailBox, to, from,  subject)
    for (const uid of uids) {
      const textId = uid?.text?.id
      const message = await emailEngineApi.apiRequestForMesssagesInfo(emailEngineAccountId, textId);

      const dkimSignatureHeader = message?.headers['dkim-signature'][0];

      const dkimSignatureMatch = dkimSignatureHeader.match(/d=([^\s;]+)/);
      const domain = dkimSignatureMatch ? dkimSignatureMatch[1] : null;
      
      const dkimSignatureSMatch = dkimSignatureHeader.match(/s=([^\s;]+)/);
      const sValue = dkimSignatureSMatch ? dkimSignatureSMatch[1] : null;

      const data = {
        domain: domain,
        selector: sValue,
      };
      dkimSelector.push(data);
    }
    return dkimSelector;
  } catch (err) {
    console.error('Error:', err);
  } 
};

export const updateSentReceivedCountStat = async () => {
  console.log("starting warmup stats crunching");
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  try {
    const getCount = await WarmupEmail.aggregate([
      {
        $match: { sentAt: { $gt: startDate, $lt: endDate } },
      },
      {
        $facet: {
          sentArray: [
            {
              $group: {
                _id: "$from",
                count: { $sum: 1 }
              }
            }
          ],
          receivedArray: [
            {
              $group: {
                _id: "$to",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ])
    if (getCount.length) {
      const sentArray = getCount[0].sentArray;
      const ReceivedArray = getCount[0].receivedArray;

      await Promise.all([
        updateCountStats(sentArray, 'sent_count', startDate, endDate),
        updateCountStats(ReceivedArray, 'received_count', startDate, endDate)
      ]);


      // const [sentArray, receivedArray] = getCount[0];

      // for (let sent of sentArray) {
      //   const account = await Account.findOne({ _id: sent._id }).select('email');
      //   if (account) {
      //     const query = { email: account.email, emailId: sent._id, createdAt: { $gte: startDate, $lte: endDate } };
      //     // console.log("warmup stats crunching::::update sent count:::222222");
      //     const update = { $set: { [`sent_count`]: sent.count } };  // change to inc before deployment
      //     await accountStatFindOneAndUpdate(query, update);
      //   }
      // }
      // for (let received of ReceivedArray) {
      //   const account = await Account.findOne({ _id: received._id }).select('email');
      //   if (account) {
      //     const query = { email: account.email, emailId: received._id, createdAt: { $gte: startDate, $lte: endDate } };
      //     // console.log("warmup stats crunching::::update received count:::33333");
      //     const update = { $set: { [`received_count`]: received.count } };
      //     await accountStatFindOneAndUpdate(query, update);
      //   }
      // }

    }

    const setGetStats = await AccountWarmupStats.find({ createdAt: { $gt: startDate, $lt: endDate } })
        .select(["_id", "sent_count", "spam_count"])
        .exec();

      await Promise.all(setGetStats.map(async iterator => {
        const inboxCount = iterator.sent_count - iterator.spam_count;
        if (inboxCount > 0) {
          await accountStatFindOneAndUpdate({ _id: iterator._id }, { $set: { inbox_count: inboxCount } });
        }
      }));
  
    // const setGetStats = await AccountWarmupStats.find({ createdAt: { $gt: startDate, $lt: endDate } }).select(["sent_count", "spam_count"]).exec();

    // for (const iterator of setGetStats) {
    //   const query = { _id: iterator._id, };
    //   const inboxCount = iterator.sent_count - iterator.spam_count;
    //   if (inboxCount > 0) {
    //     // console.log("warmup stats crunching::::update inbox count:::44444");
    //     const update = { $set: { [`inbox_count`]: inboxCount } };
    //     await accountStatFindOneAndUpdate(query, update);
    //   }
    // }
  } catch (error) {
    console.error("Error in updateSentReceivedCountStat:", error);
    // Handle or log the error appropriately
  }
}

async function updateCountStats(array, fieldName, startDate, endDate) {
  await Promise.all(array.map(async item => {
    const account = await Account.findOne({ _id: item._id }).select('email');
    if (account) {
      const query = {
        email: account.email,
        emailId: item._id,
        createdAt: { $gte: startDate, $lte: endDate }
      };
      const update = { $set: { [fieldName]: item.count } };
      await accountStatFindOneAndUpdate(query, update);
    }
  }));
}


export async function addBlocklistEmails(docs = []) {
  try {
    const result = await WarmupBlocklist.insertMany(docs);
    return result;
  } catch (error) {
    return false;
  }
}

export async function makeBlocklistDocs({ emails = [], userId, link, type }) {

  const docs = []
  emails = emails.map((lead) => lead.email);

  const existingEmailCount = await WarmupBlocklist.countDocuments({
    email: { $in: emails },
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  if (existingEmailCount) {
    throw new HttpErrors.BadRequest(`${existingEmailCount} emails already exists in this blocklist`);
  }

  for (let email of emails) {
    const isValid = await isValidEmail(email);
    if (isValid) {
      const doc = {
        email,
        type: blocklistImportType[type],
        createdBy: new mongoose.Types.ObjectId(userId)
      }
      if (link)
        doc.link = link;
      docs.push(doc);
    } else {
      throw new HttpErrors.BadRequest(`Invalid Email`);
    }
  }
  return docs;
}

async function isValidEmail(email) {
  const emailSchema = Joi.string().email().required();
  const validationResult = emailSchema.validate(email);
  if (validationResult.error) {
    return false;
  } else {
    return true;
  }
}

export async function fetchGoogleSheet(link) {
  try {
    const url = new URL(link);
    url.hash = "";
    url.pathname = url.pathname.replace("edit", "gviz/tq");
    const response = await fetch(url.toString());
    const responseText = await response.text();

    const responseJSON = JSON.parse(
      responseText.replace("/*O_o*/\ngoogle.visualization.Query.setResponse(", "").replace(");", "")
    );

    const rows = [];
    responseJSON.table.rows.forEach(function (row) {
      const rowArray = [];
      row.c.forEach(function (prop) {
        prop?.v && rowArray.push(prop.v);
      });
      rows.push(rowArray[0]);
    });

    return validateEmails(rows)
  } catch (error) {
    // console.log(error);
    return false;
  }
}

function validateEmails(emails) {
  const emailValidationRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  let results = [];

  emails.forEach((email) => {
    const isValid = emailValidationRegex.test(email);
    if (isValid)
      results.push({ email })
  });

  return results;
}

export async function getBlockList(query, options) {
  return WarmupBlocklist.paginate(query, options);
}

export async function getBlockListEmailByUser(user) {
  try {
    const blockLeads = await WarmupBlocklist.aggregate([
      {
        $match: { createdBy: user }
      },
      {
        $group: {
          _id: null,
          emails: { $push: '$email' }
        }
      },
      {
        $project: {
          _id: 0,
          emails: 1
        }
      }
    ]);

    return blockLeads.length > 0 ? blockLeads[0].emails : [];
  } catch (error) {
    console.error('Error retrieving blocked emails:', error);
  }
}

export async function deleteBlockList(lists) {
  return WarmupBlocklist.deleteMany({
    _id: {
      $in: lists
    }
  })
}

export async function searchEmailInBlocklist(email) {
  const docCount = await WarmupBlocklist.countDocuments(
    {
      email
    }
  );
  if (docCount > 0)
    return true
  else
    return false;
}



// export async function processWarmup(warmupLimit, totalEmailSent) {

//   const startTime = "05:00:00";
//   const endTime = "20:00:00";

//   // Calculate the time difference in seconds between startTime and endTime
//   const start = new Date();
//   start.setHours(parseInt(startTime.split(":")[0], 10));
//   start.setMinutes(parseInt(startTime.split(":")[1], 10));
//   start.setSeconds(parseInt(startTime.split(":")[2], 10));

//   const end = new Date();
//   end.setHours(parseInt(endTime.split(":")[0], 10));
//   end.setMinutes(parseInt(endTime.split(":")[1], 10));
//   end.setSeconds(parseInt(endTime.split(":")[2], 10));

//   const timeDifferenceInSeconds = (end - start) / 1000; // Convert milliseconds to seconds

//   // Calculate the time interval between each number
//   const timeInterval = timeDifferenceInSeconds / warmupLimit;

//   const processTime = [];

//   // Print numbers evenly distributed within the specified time range
//   for (let i = 0; i < warmupLimit; i++) {
//     const currentTime = new Date(start.getTime() + i * timeInterval * 1000); // Convert seconds back to milliseconds
//     const hours = currentTime.getHours();
//     const minutes = currentTime.getMinutes();
//     const seconds = currentTime.getSeconds();
//     const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//     processTime.push(currentTime.toISOString())
//   }

//   if (new Date() >= new Date(processTime[totalEmailSent])) {
//     return true;
//   } else {
//     return false;
//   }
// }

export async function processWarmup(warmupLimit, totalEmailSent) {

  const startTime = new Date().setHours(5, 0, 0, 0);
  const endTime = new Date().setHours(19, 30, 0, 0);

  const timeDifferenceInSeconds = Math.abs(endTime - startTime) / 1000;

  // Calculate the time interval between each number
  const timeInterval = timeDifferenceInSeconds / warmupLimit;

  const processTime = [];

  // Print numbers evenly distributed within the specified time range
  for (let i = 0; i < warmupLimit; i++) {
    const currentTime = moment(startTime).add(i * timeInterval, 'seconds');
    const formattedTime = currentTime.format('HH:mm:ss');
    // console.log({ start: currentTime.toISOString() });
    processTime.push(currentTime.utc());
  }

  if (moment().utc().isSameOrAfter(moment(processTime[totalEmailSent]))) {
    return true;
  } else {
    return false;
  }
}

export async function createBlocklist(email, user) {
  return WarmupBlocklist.create({ email, type: blocklistImportType.Manual, createdBy: user })
}

export async function warmupStop() {

  const users = await UserPlan.find({
    freeTrialExpiresAt: { $lt: moment().toDate() },
    "subscription.sendingWarmup": null
  }).select('user')

  const ids = users.map((user) => user.user._id)

  const data = await Account.updateMany({
    createdBy: { $in: ids }
  }, {
    status: AccountStatus.Paused,
    "warmup.status": WarmupStatus.Paused
  }, { new: true })
  // users.forEach(async (user) => {
  //   await generateIntercomEvent(
  //     user.email,
  //     Constants.WARMUP_STOP,
  //     {},
  //     user._id
  //   );
  // });

  return true
}
