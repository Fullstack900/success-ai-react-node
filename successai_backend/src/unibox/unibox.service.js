import { ImapFlow } from "imapflow";
import { getAccountImapSettings } from "../account/account.service.js";
import { getMailboxList } from "../common/services/imap.service.js";
import mailparser from "mailparser";
import logger from "../common/utils/logger.js";
import * as accountService from "../account/account.service.js";
import CampaignEmail from "../campaigns/models/campaign-email.model.js";
import CampaignReply from "../campaigns/models/campaign-reply.model.js";
import CampaignActivity from "../campaigns/models/campaign-activity.model.js";
import moment from "moment";
import HttpErrors from "http-errors";
import * as utils from "../common/utils/utils.js";
import CampaignActivityType from "../campaigns/enum/campaign-activity-type.enum.js";
import { createActivity } from "../campaigns/campaign.service.js";
import Campaign from "../campaigns/models/campaign.model.js";
import LeadsCampaign from "../leads/models/leads-campaign.model.js";
import * as campaignService from "../campaigns/campaign.service.js";
import {
  sendCampaignEmail,
  checkEmailConfig,
} from "../common/services/smtp.service.js";
import Account from "../account/models/account.model.js";

// export async function getEmailReply({ email, messageId, from, subject }) {
//   const imapConfig = await getAccountImapSettings({
//     email,
//   });
//   // messageId = messageId.replace('<', '').replace('>', '');
//   if (imapConfig) {
//     const searchParam = {
//       from,
//       or: [
//         { subject: subject || "No Subject" },
//         { header: { "In-Reply-To": messageId } },
//       ],
//     };

//     const data = await getEmailReplies({
//       imapConfig,
//       searchParam,
//     });
//     return data;
//   }
// }

// const getEmailReplies = async ({ imapConfig = {}, searchParam }) => {
//   imapConfig.logger = false;
//   const client = new ImapFlow(imapConfig);
//   let connection = false;
//   let sentmailBox;
//   try {
//     await client.connect();
//     connection = true;
//   }
//   catch {
//     // console.error("1111 email_replies Error while connecting the client")
//   }
//   if (connection) {
//     let mailBoxListFetched = false;
//     try {
//       sentmailBox = await getMailboxList({ client, mailbox: "INBOX" });
//       mailBoxListFetched = true;
//     }
//     catch {
//       // console.error("2222 email_replies Error while getting the mailbox list")
//     }
//     if (mailBoxListFetched) {
//       try {
//         const emailThread = await getEmailThread({
//           client,
//           searchParam,
//           mailBox: sentmailBox,
//         });
//         return {
//           emailThread,
//         };
//       }
//       catch {
//         // console.error("3333 email_replies Error while getting the email thread")
//       }
//       finally {
//         await client.logout();
//       }
//     } 
//   }
// };

// const getEmailThread = async ({ client, searchParam, mailBox }) => {
//   // let lock = await client.getMailboxLock(mailBox);
//   await client.mailboxOpen(mailBox);
//   try {
//     const simpleParser = mailparser.simpleParser;

//     const data = [];
//     for await (let msg of client.fetch(searchParam, {
//       headers: true,
//       source: true,
//     })) {
//       let message_preview = await simpleParser(msg.source);
//       const replyObj = {
//         bodyText: message_preview.text,
//         bodyTextHtml: message_preview.textAsHtml,
//         subject: message_preview.subject,
//         to: message_preview.to.text,
//         from: message_preview.from.text,
//         messageId: message_preview.messageId,
//         inReplyTo: message_preview.inReplyTo,
//         date: message_preview.date,
//       };
//       data.push(replyObj);
//     }
//     return data;
//   } catch (err) {
//     // console.error("Error:", err);
//   } finally {
//     // lock.release();
//     await client.mailboxClose();
//   }
// };

// export async function updateEmailReplies({ filters = {} }) {
//   try {
//     const campaignsList = await CampaignEmail.aggregate([
//       { $match: filters },
//       {
//         $project: {
//           lead_id: 1,
//           campaign_id: 1,
//           message_id: 1,
//           from: 1,
//           sequence_step: 1,
//           sequence_id: 1,
//           updatedAt : 1,
//           subject: 1,
//         },
//       },
//       {
//         $lookup: {
//           from: "accounts",
//           let: { toId: "$from" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$_id", "$$toId"] },
//               },
//             },
//             {
//               $project: {
//                 email: 1,
//                 replyTo: 1,
//               },
//             },
//           ],
//           as: "fromAccount",
//         },
//       },
//       {
//         $unwind: { path: "$fromAccount", preserveNullAndEmptyArrays: false },
//       },
//       {
//         $lookup: {
//           from: "leads_campaign",
//           let: { toId: "$lead_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$_id", "$$toId"] },
//               },
//             },
//             {
//               $project: {
//                 email: 1,
//               },
//             },
//           ],
//           as: "leadEmails",
//         },
//       },
//       {
//         $unwind: { path: "$leadEmails", preserveNullAndEmptyArrays: false },
//       },
//       {
//         $sort : {updatedAt : -1}
//       },
//       {'$group': {
//         '_id': '$campaign_id', // Grouping by _id field
//         'documents': {
//           '$push': '$$ROOT' // Pushing the entire document into an array
//         }
//       }}
//     ]);
//     for (const campaign of campaignsList) {
//       try {
//         runForEachCampaign(campaign)
//       } catch(e) {
//         // logger.log(e);
//         continue;
//       }
//     }
//     return false;
//   } catch (e) {
//     // console.log(e);
//     // logger.log(e);
//   }
// }
// export async function runForEachCampaign(campaignData) {
//   const emailList = campaignData?.documents;
//   if(emailList.length) {
//     for (const campaign of emailList) {
//       try {
//         await getEmailUpdated(campaign);
//         // console.log(new Date())
//       } catch(e) {
//         // logger.log(e);
//         continue;
//       }
//     }
//   }
// }
// Test5 Deployment 
// export async function getEmailUpdated(campaign) {
//   const email = campaign?.fromAccount?.replyTo
//     ? campaign?.fromAccount?.replyTo
//     : campaign?.fromAccount?.email;
//   const messageId = campaign.message_id;
//   if (email && messageId) {
//     const emailReplies = await getEmailReply({
//       email,
//       messageId,
//       from: campaign?.leadEmails?.email,
//       subject: campaign?.subject,
//     });

//     if (emailReplies?.emailThread?.length) {
//       const replyIds = [];
//       const replies = emailReplies?.emailThread;
//       let automatic_reply = false;

//       for (const iterator of replies) {
//         const reply = {
//           ...iterator,
//           accountId: campaign?.fromAccount?._id,
//           campaignEmailId: campaign._id,
//           campaignId: campaign.campaign_id,
//           reply_on: iterator.date,
//         };
//         const addReply = await CampaignReply.findOneAndUpdate(
//           { message_id: iterator.messageId },
//           { $set: reply },
//           {
//             upsert: true,
//             returnOriginal: false,
//             rawResult: true,
//           }
//         );
//         const updatedDocumentId = addReply._id;

//         if (iterator.subject.includes("Automatic reply")) {
//           automatic_reply = true;
//         }

//         replyIds.push(updatedDocumentId);

//         if (!addReply.lastErrorObject.updatedExisting) {
//           // Set isDeleted to false when new replies are added
//           await CampaignEmail.findOneAndUpdate(
//             {
//               _id: campaign._id,
//               email_replied: false,
//             },
//             {
//               $set: {
//                 email_replied: true,
//                 email_replied_on: moment().toDate(),
//                 automatic_reply,
//                 // isDeleted: false,
//               },
//             }
//           );

//           await createActivity({
//             campaign_id: campaign.campaign_id,
//             sequence_id: campaign.sequence_id,
//             lead_id: campaign.lead_id,
//             type: CampaignActivityType.Reply,
//             account_id: campaign?.fromAccount?._id,
//             sequence_step: campaign.sequence_step,
//             campaign_email_id: campaign._id,
//           });
//         }
//       }

//       // Set isDeleted to false when new replies are added
//       await CampaignEmail.findOneAndUpdate(
//         {
//           _id: campaign._id,
//         },
//         {
//           $addToSet: { replies: [...replyIds] },
//           // $set: { isDeleted: false },
//         }
//       );
//      }
//     // else {
//     //   // Handle case when all replies are deleted
//     //   await CampaignEmail.findOneAndUpdate(
//     //     {
//     //       _id: campaign._id,
//     //     },
//     //     {
//     //       $set: { isDeleted: true },
//     //     }
//     //   );
//     // }
//   }
// }

// function convertToTextAsHtml(html) {
//     let textAsHtml = html
//         .replace(/<\/?div.*?>/g, '') 
//         .replace(/<br>/g, '<br/>')  
//         .replace(/<img(.*?)>/g, '');  
//     return textAsHtml;
// }

export async function getEmailUpdated(replies) {
  try {
    const { data } = replies;
    const messageId = data?.inReplyTo;
    const messageText = data?.text?.id;
    let campaign;

    campaign = await CampaignEmail.findOneAndUpdate({ message_id: messageId }, { $set: { portal_email_opened: false } });

    if (!campaign) {
      const campaignReply = await CampaignReply.findOne({ message_id: messageId }, { campaignEmailId: 1 });
      if (campaignReply) {
        campaign = await CampaignEmail.findOneAndUpdate({ _id: campaignReply.campaignEmailId }, { $set: { portal_email_opened: false } });
      }
    }

    if (messageId && campaign) {
      const textAsHtml = utils.convertToTextAsHtml(data?.text?.html);
      const from = `"${data?.from?.name}" <${data?.from?.address}>`;
      const recipient = data?.to[0];
      const to = `"${recipient.name}" <${recipient.address}>`;
      const subject = data?.subject.split(':')[1].trim();
      const replyIds = [];
      let automaticReply = false;

      const reply = {
        bodyText: data?.text?.plain,
        bodyTextHtml: textAsHtml,
        accountId: campaign.from,
        campaignEmailId: campaign._id,
        campaignId: campaign.campaign_id,
        date: replies.date,
        from: from,
        inReplyTo: messageId,
        reply_on: replies.date,
        subject: subject,
        to: to,
        message_text: messageText
      };

      const addReply = await CampaignReply.findOneAndUpdate(
        { message_id: data?.messageId },
        { $set: reply },
        { upsert: true, returnOriginal: false, rawResult: true }
      );

      const updatedDocumentId = addReply._id;

      if (data?.subject.includes("Automatic reply")) {
        automaticReply = true;
      }

      replyIds.push(updatedDocumentId);

      await CampaignEmail.findOneAndUpdate(
        { message_id: messageId, email_replied: false },
        { $set: { is_reply: true, email_replied: true, email_replied_on: moment().toDate(), automatic_reply: automaticReply } }
      );

      if(!campaign.is_reply) {
        await createActivity({
          campaign_id: campaign.campaign_id,
          sequence_id: campaign.sequence_id,
          lead_id: campaign.lead_id,
          type: CampaignActivityType.Reply,
          account_id: campaign.from,
          sequence_step: campaign.sequence_step,
          campaign_email_id: campaign._id,
        });
      }

      await CampaignEmail.findOneAndUpdate(
        { message_id: messageId },
        { $addToSet: { replies: [...replyIds] } }
      );
    }
  } catch (error) {
    console.error("Error in getEmailUpdated:", error);
  }
}

export async function getInboxEmails({ filters = {}, perPage, page, user }) {
  try {
    const campaigns = await Campaign.find({ createdBy: user._id })
      .select(["_id"])
      .exec();
    const campaignIds = campaigns.map((document) => document._id);
    const query = {
      campaign_id: { $in: campaignIds },
      email_replied: true,
      isDeleted: { $ne: true },
      ...filters,
    };
    // First, perform an aggregation to get the total count.
    const totalEmailCount = await CampaignEmail.aggregate([
      { $match: query }, // Apply your filters here
    ]);
    const emailList = await CampaignEmail.aggregate([
      { $match: query },
      {
        $project: {
          unique_id: 1,
          subject: 1,
          body: 1,
          from: 1,
          campaign_id: 1,
          lead_id: 1,
          sequence_id: 1,
          email_clicked: 1,
          email_opened: 1,
          message_id: 1,
          createdAt: 1,
          lead_id: 1,
          label: 1,
          portal_email_opened: 1
        },
      },
      {
        $lookup: {
          from: "accounts",
          let: { toId: "$from" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$toId"] },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
              },
            },
          ],
          as: "fromAccount",
        },
      },
      {
        $unwind: { path: "$fromAccount", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "leads_campaign",
          let: { toId: "$lead_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$toId"] },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                firstName: 1,
                lastName: 1
              },
            },
          ],
          as: "leads",
        },
      },
      {
        $unwind: { path: "$leads", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    return { emailList, totalEmailCount: totalEmailCount.length };
  } catch (e) {
    // logger.log(e);
  }
}

export async function getmyInboxEmails({ filters = {}, user }) {
  try {
    const campaigns = await Campaign.find({ createdBy: user._id })
      .select(["_id"])
      .exec();
    const campaignIds = campaigns.map((document) => document._id);
    const query = {
      campaign_id: { $in: campaignIds },
      email_replied: true,
      isDeleted: { $ne: true },
      ...filters,
    };
    // First, perform an aggregation to get the total count.
    const totalEmailCount = await CampaignEmail.aggregate([
      { $match: query }, // Apply your filters here
    ]);
    const emailList = await CampaignEmail.aggregate([
      { $match: query },
      {
        $project: {
          unique_id: 1,
          from: 1,
          campaign_id: 1,
          lead_id: 1,
          email_clicked: 1,
          email_opened: 1,
          portal_email_opened: 1
        },
      },
      {
        $lookup: {
          from: "accounts",
          let: { toId: "$from" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$toId"] },
              },
            },
            {
              $project: {
                _id: 1,
                email: 1,
              },
            },
          ],
          as: "fromAccount",
        },
      },
      {
        $unwind: { path: "$fromAccount", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "leads_campaign",
          let: { toId: "$lead_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$toId"] },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
              },
            },
          ],
          as: "leads",
        },
      },
      {
        $unwind: { path: "$leads", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    return { emailList, totalEmailCount: totalEmailCount.length };
  } catch (e) {
    // logger.log(e);
  }
}


export async function getEmailRepliesFromDB({ filters = {} }) {
  try {
    const replies = await CampaignReply.find(filters, {
      bodyText: 1,
      bodyTextHtml: 1,
      subject: 1,
      to: 1,
      from: 1,
      messageId: "$message_id",
      inReplyTo: 1,
      date: 1,
      accountId: 1,
      campaignEmailId: 1,
      campaignId: 1,
      _id: 0,
    }).sort({ date: -1 });
    return { replies };
  } catch (e) {
    // logger.log(e);
  }
}

export async function getUserLeadsCount({ user }) {
  try {
    const campaigns = await Campaign.find({ createdBy: user._id })
      .select(["_id"])
      .exec();
    const campaignIds = campaigns.map((document) => document._id);
    const query = {
      campaign: { $in: campaignIds },
    };
    // First, perform an aggregation to get the total count.
    const totalEmailCount = await LeadsCampaign.aggregate([
      { $match: query },
      { $count: "emailCount" }
    ]);
    return totalEmailCount[0]?.emailCount ? totalEmailCount[0]?.emailCount : 0;
  } catch (e) {
    // logger.log(e);
  }
}

export async function sendEmailReplies(data) {
  const {
    to,
    subject,
    from,
    inReplyTo,
    messageId,
    body,
    bodyTextHtml,
    accountId,
    campaignEmailId,
    campaignId,
  } = data;
  const reply = await CampaignReply.findOne({message_id: messageId}, {message_text: 1});
  const email = await utils.extractEmailsFromString(to);
  const fromEmail = await utils.extractEmailsFromString(from);
  const account = await Account.findOne({ email: email }, 'name signature').exec()
  const senderName = account?.name.first + ' ' + account?.name.last;
  const smtpConfig = await accountService.getAccountSmtpSettings({
    email: email[0],
  });
  if (!smtpConfig) {
    throw new HttpErrors.NotFound(`SMTP config not found for ${email[0]}`);
  }

  const isConfigValid = await checkEmailConfig(smtpConfig);
  if (!isConfigValid) {
    throw new HttpErrors.BadRequest(`SMTP config not valid for ${email[0]}`);
  }

  try {
    const messageSenderName = senderName;
    const account = await Account.findOne({email: email[0]}, {emailEngineAccountId: 1});
    const message = await sendCampaignEmail({
      emailData: {
        type: "html",
        fromEmail: email[0],
        to: fromEmail[0],
        subject,
        body: body,
        inReplyTo: messageId,
        name: messageSenderName,
      },
      emailEngineAccountId: account?.emailEngineAccountId,
      messageText: reply?.message_text,
    });

    const textBody = utils.convertHtmlToText(body);

    return CampaignReply.create({
      bodyText: textBody,
      bodyTextHtml: body,
      subject: subject,
      to: from,
      from: email[0],
      message_id: message.messageId,
      inReplyTo: inReplyTo,
      date: moment().toDate(),
      accountId,
      campaignEmailId,
      campaignId,
      isReplied: true,
    });
  } catch (err) {
    throw new HttpErrors.BadRequest(`SMTP config not valid for ${email[0]}`);
  }
}

export async function updateAllRepliedEmails(id) {
  const campaigns = await CampaignReply.find({
    campaignEmailId: id,
    isReplied: true,
  });

  for (const campaign of campaigns) {
    const from = await utils.extractEmailsFromString(campaign.to);
    const emailReplies = await getEmailReply({
      email: campaign.from,
      messageId: campaign.message_id,
      from,
      subject: campaign?.subject
    });
    if (emailReplies?.emailThread?.length) {
      const replyIds = [];
      const replies = emailReplies?.emailThread;
      for (const iterator of replies) {
        const reply = {
          ...iterator,
          accountId: campaign?.accountId,
          campaignEmailId: campaign.campaignEmailId,
          campaignId: campaign.campaignId,
          reply_on: iterator.date,
        };
        const addReply = await CampaignReply.findOneAndUpdate(
          { message_id: iterator.messageId },
          { $set: reply },
          {
            upsert: true, // Creates the document if it doesn't exist
            returnOriginal: false,
            rawResult: true,
          }
        );
        const updatedDocumentId = addReply._id;
        replyIds.push(updatedDocumentId);
      }

      await CampaignEmail.findOneAndUpdate(
        {
          _id: campaign.campaignId,
        },
        {
          $addToSet: { replies: [...replyIds] },
        }
      );
    }
  }
}

export async function sendEmailForward(data) {
  const { subject, forwardEmail, body, fromAccount, _id, campaign_id } = data;
  
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  if (!emailRegex.test(forwardEmail))
    throw new HttpErrors.BadRequest("Email is not valid");

  const fwdsubject =
    "Fwd: " + subject.replaceAll("Re: ", "").replaceAll("Fwd: ", "");
  const { email } = await accountService.findOne({
    _id: fromAccount._id,
  });
  const smtpConfig = await accountService.getAccountSmtpSettings({ email });
  if (!smtpConfig) {
    throw new HttpErrors.NotFound(`SMTP config not found for ${email}`);
  }

  const isConfigValid = await checkEmailConfig(smtpConfig);
  if (!isConfigValid) {
    throw new HttpErrors.BadRequest(`SMTP config not valid for ${email}`);
  }
  const account = await Account.findOne({ email: email }, 'name signature emailEngineAccountId').exec()
  const senderName = account?.name.first + ' ' + account?.name.last;
  try {
    const message = await sendCampaignEmail({
      emailData: {
        type: "html",
        fromEmail: email,
        to: forwardEmail,
        subject: fwdsubject,
        body: body,
        name: senderName,
      },
      emailEngineAccountId: account?.emailEngineAccountId,
    });

    const textBody = utils.convertHtmlToText(body);

    return CampaignReply.create({
      bodyText: textBody,
      bodyTextHtml: body,
      subject: fwdsubject,
      to: forwardEmail,
      from: email,
      message_id: message.messageId,
      inReplyTo: "",
      date: moment().toDate(),
      accountId: fromAccount._id,
      campaignEmailId: _id,
      campaignId: campaign_id
    })
  } catch (err) {
    throw new HttpErrors.BadRequest(`SMTP config not valid for ${email[0]}`)
  }
}

export async function deleteEmails(id) {
  return CampaignEmail.findByIdAndUpdate(id, { isDeleted: true })
}

export async function OpenedEmails(id, value) {
  return CampaignEmail.findByIdAndUpdate(id, { portal_email_opened: value })
}

export async function deleteMultipleEmails(ids) {
  return CampaignEmail.updateMany({
    lead_id: { $in: ids }
  }, { isDeleted: true })
}
