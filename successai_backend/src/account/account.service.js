import HttpErrors from 'http-errors';
import Account from './models/account.model.js';
import Provider from './enum/provider.enum.js';
import * as azureService from '../common/services/azure.service.js';
import * as googleService from '../common/services/google.service.js';
import * as campaignsService from "../campaigns/campaign.service.js";
import * as dnsService from '../dns/dns.service.js';
import WarmupStatus from "./enum/warmup-status.enum.js";
import {
  ImapFlow
} from 'imapflow';
import SMTPConnection from 'nodemailer/lib/smtp-connection/index.js';
import {
  flatObject
} from '../common/utils/utils.js';
import AccountStatus from './enum/account-status.enum.js';
import _ from 'lodash';
import AccountWarmupStats from './models/account_warmup_stats.js';
import moment from 'moment';
import logger from '../common/utils/logger.js';
import client from '../intercom/intercom-client.js';
import { checkEmailConfig } from '../../src/common/services/smtp.service.js'
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {createAccountOnEmailEngine} from './migrationToEmailEngine.js'
import EmailEngine from './models/email_engine_instances.js';

export async function connectAccount(email, data) {
  const accountExists = await Account.findOne({
    email
  });
  if (accountExists) throw new HttpErrors.BadRequest('Account already exists');
  return Account.create(data);
}

export async function lastEmailEngineCredentials(){
  const emailEngine = await EmailEngine.findOne().sort({ createdAt: -1 });
  return emailEngine;
}

// async function reconnectAccount(reconnect, email, user, update) {
//   if (reconnect.toLowerCase() !== email.toLowerCase())
//     throw new HttpErrors.BadRequest('Invalid account');
//   const account = await Account.findOne({
//     email
//   });
//   if (!account) throw new HttpErrors.NotFound('Account not found');
//   if (!account.createdBy.equals(user._id)) throw new HttpErrors.Forbidden();
//   account.set(update);
//   account.status = AccountStatus.Connected;
//   return account.save();
// }

export async function connectMicrosoftAccount(code, user, reconnect) {
  const {
    name,
    email,
    accessToken,
    refreshToken
  } = await azureService.getTokenByCode(code);
  const [firstName, lastName] = name.split(' ');

  const oauth2 = {
    accessToken: accessToken,
    refreshToken: refreshToken,
    auth: {
      "user": email
    }
  }

  if (reconnect) {
    return reconnectRequestWithOauth('microsoft', reconnect, email, user, oauth2, {
      name: {
        first: firstName,
        last: lastName
      },
      email,
      microsoftRefreshToken: refreshToken,
      provider: Provider.Microsoft_OAuth,
      createdBy: user,
    });
  } else {
    return connectionRequestWithOauth('microsoft', name, email, oauth2, {
      name: {
        first: firstName,
        last: lastName,
      },
      email,
      microsoftRefreshToken: refreshToken,
      provider: Provider.Microsoft_OAuth,
      warmup: {
        filterTag: user.warmupTag
      },
      createdBy: user,
    });
  }

  // if (reconnect) {
  //   return reconnectAccount(reconnect, email, user, {
  //     name: {
  //       first: firstName,
  //       last: lastName
  //     },
  //     email,
  //     microsoftRefreshToken: refreshToken,
  //     provider: Provider.Microsoft_OAuth,
  //     createdBy: user,
  //   });
  // }

  // return connectAccount(email, {
  //   name: {
  //     first: firstName,
  //     last: lastName,
  //   },
  //   email,
  //   microsoftRefreshToken: refreshToken,
  //   provider: Provider.Microsoft_OAuth,
  //   warmup: {
  //     filterTag: user.warmupTag
  //   },
  //   createdBy: user,
  // });
}

export async function connectCustomImapSmtpAccount(data, user, reconnect) {
  const { email, name, imap, smtp } = data;

  // const {password, host, port} = imap;
  // const {host, port} = smtp;

  const customImap = {
    host: imap?.host,
    port: imap?.port,
    secure: imap?.port == 993,
    disabled: false,
    auth: {
      user: email,
      pass: imap?.password
    }
  }
  const customSmtp = {
    host: smtp?.host,
    port: smtp?.port,
    secure: smtp?.port == 465 ? true : false,
    auth: {
      user: email,
      pass: smtp?.password
    }
  };  

  if (reconnect) {
    return reconnectRequestWithImapSmtp(reconnect, email, customImap, customSmtp, user,{
      name,
      email,
      imap,
      smtp,
      provider: Provider.Custom_Imap_Smtp,
      createdBy: user
    });
  } else {
    return connectionRequestWithImapSmtp(name, email, customImap, customSmtp, _.merge(data, {
      warmup: {
        filterTag: user.warmupTag
      },
      provider: Provider.Custom_Imap_Smtp,
      createdBy: user,
    }));
  }






  // if (reconnect) {
  //   return reconnectAccount(reconnect, email, user, {
  //     ...data,
  //     provider: Provider.Custom_Imap_Smtp,
  //   });
  // }

  // return connectAccount(
  //   email,
  //   _.merge(data, {
  //     warmup: {
  //       filterTag: user.warmupTag
  //     },
  //     provider: Provider.Custom_Imap_Smtp,
  //     createdBy: user,
  //   })
  // );
}

export async function connectGoogleAccount(code, user, reconnect) {
  const {
    name,
    email,
    accessToken,
    refreshToken
  } = await googleService.getTokenByCode(
    code
  );

  const [firstName, lastName] = name.split(' ');


  const oauth2 = {
    accessToken: accessToken,
    refreshToken: refreshToken,
    auth: {
      "user": email
    }
  }

  if (reconnect) {
    return reconnectRequestWithOauth('google' ,reconnect, email, user, oauth2, {
      name: {
        first: firstName,
        last: lastName,
      },
      email,
      googleRefreshToken: refreshToken,
      provider: Provider.Google_OAuth,
      createdBy: user,
    });
  } else {
    return connectionRequestWithOauth('google' ,name, email, oauth2, {
      name: {
        first: firstName,
        last: lastName,
      },
      email,
      provider: Provider.Google_OAuth,
      warmup: {
        filterTag: user.warmupTag
      },
      googleRefreshToken: refreshToken,
      createdBy: user,
    })
  }

  // return reconnectAccount(reconnect, email, user, {
  //   name: {
  //     first: firstName,
  //     last: lastName,
  //   },
  //   email,
  //   googleRefreshToken: refreshToken,
  //   provider: Provider.Google_OAuth,
  //   createdBy: user,
  // });



  // return connectAccount(email, {
  //   name: {
  //     first: firstName,
  //     last: lastName,
  //   },
  //   email,
  //   provider: Provider.Google_OAuth,
  //   warmup: {
  //     filterTag: user.warmupTag
  //   },
  //   googleRefreshToken: refreshToken,
  //   createdBy: user,
  // });
}


async function connectionRequestWithOauth( providerSerivce ,name, email, oauth2, dataForMongo) {
  const {accessToken , microsoftProvider, googleProvider , ip: EMAIL_ENGINE_URL, _id: emailEngineInstance} = await lastEmailEngineCredentials();
  oauth2.provider = providerSerivce == 'microsoft' ?  microsoftProvider :  googleProvider;
  const accountExists = await Account.findOne({
    email
  });
  if (accountExists) throw new HttpErrors.BadRequest('Account already exists');
  let data = {
    account: uuidv4(),
    name: name,
    email,
    oauth2
  };

  const url = `${EMAIL_ENGINE_URL}/v1/account`;
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data,
  };
  try {
    const result = await axios(config);
    const emailEngineAccountIdData = {
      emailEngineAccountId: result?.data?.account,
      connectionWith: emailEngineInstance
    };
    const mergedData = { ...dataForMongo, ...emailEngineAccountIdData };
    return await Account.create(mergedData);
  } catch (err) {
    throw new HttpErrors.BadRequest('Error connecting account');
  }
}

async function reconnectRequestWithOauth(providerSerivce ,reconnect, email, user, oauth2, update) {
  if (reconnect.toLowerCase() !== email.toLowerCase())
    throw new HttpErrors.BadRequest('Invalid account');
  let account;
   account = await Account.findOne({
    email
  }).populate('connectionWith');
  if(account.emailEngineAccountId === null){
    const minServer = await getMinTotalAccountsEmailEngineInstance();
    await createAccountOnEmailEngine(account?._id, minServer);
    account = await Account.findOne({
      email
    }).populate('connectionWith');  
  }
  const {accessToken, microsoftProvider, googleProvider, ip: EMAIL_ENGINE_URL} = account.connectionWith;
  oauth2.provider = providerSerivce == 'microsoft' ?  microsoftProvider :  googleProvider;
  if (!account) throw new HttpErrors.NotFound('Account not found');
  if (!account.createdBy.equals(user._id)) throw new HttpErrors.Forbidden();

  let data = {
    oauth2
  };

  const url = `${EMAIL_ENGINE_URL}/v1/account/${account.emailEngineAccountId}`;
  let config = {
    method: 'put',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data,
  };

  try {
    const res = await axios(config);
    console.log(res);
    // await reconnectOnExistingCrendentials(account.emailEngineAccountId);
    account.set(update);
    account.status = AccountStatus.Connected;
    return await account.save();
  } catch (err) {
    const e_account = await deleteAccountFromEmailEngine(account?.emailEngineAccountId, account?.connectionWith);
    if(e_account.data.deleted == true) {
      await Account.updateOne({ _id: account._id }, { $set: {'warmup.status': AccountStatus.Paused, emailEngineAccountId: null } });
      await decreaseTotalAccountsForId(account.connectionWith);
    }
    throw new HttpErrors.BadRequest('Error Reconnecting Account');
  }

}




export async function connectGoogleImapSmtp(data, user, reconnect) {
  const {
    name,
    email,
    password
  } = data;

  const imap = {
    username: email,
    password,
    host: 'imap.gmail.com',
    port: 993,
  };

  const smtp = {
    username: email,
    password,
    host: 'smtp.gmail.com',
    port: 587,
  };

  const imapForEmailEngine = {
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    disabled: false,
    auth: {
      user: email,
      pass: password
    }
  }
  const smtpForEmailEngine = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: email,
      pass: password
    }
  }

  const test = await testImapThroughEmailEngine(imapForEmailEngine);
  if (test.data.imap.success == false) {
    throw new HttpErrors.BadRequest('Invalid credentials');
  }


  if (reconnect) {
    return reconnectRequestWithImapSmtp(reconnect, email, imapForEmailEngine, smtpForEmailEngine, user, {
      name,
      email,
      imap,
      smtp,
      provider: Provider.Google_Imap_Smtp,
      createdBy: user
    });

  } else {
    return connectionRequestWithImapSmtp(name, email, imapForEmailEngine, smtpForEmailEngine, {
      name,
      email,
      imap,
      smtp,
      provider: Provider.Google_Imap_Smtp,
      warmup: {
        filterTag: user.warmupTag
      },
      createdBy: user,
    });
  }


  // try {
  //   await testImap(imap);
  // } catch (error) {
  //   throw new HttpErrors.BadRequest('Invalid credentials');
  // }

  // if (reconnect) {
  //   return reconnectAccount(reconnect, email, user, {
  //     name,
  //     email,
  //     imap,
  //     smtp,
  //     provider: Provider.Google_Imap_Smtp,
  //     createdBy: user
  //   });
  // }

  // return connectAccount(email, {
  //   name,
  //   email,
  //   imap,
  //   smtp,
  //   provider: Provider.Google_Imap_Smtp,
  //   warmup: {
  //     filterTag: user.warmupTag
  //   },
  //   createdBy: user,
  // });
}




export async function testImapThroughEmailEngine(imap) {
  const {accessToken , ip: EMAIL_ENGINE_URL} = await lastEmailEngineCredentials();
  let data = {
    imap
  };
  const apiKey = accessToken;
  const url = `${EMAIL_ENGINE_URL}/v1/verifyAccount`;
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'x-ee-timeout': 120000,
    },
    data,
  };

  return await axios(config);
}

export async function testSmtpThroughEmailEngine(smtp) {
  const {accessToken , ip: EMAIL_ENGINE_URL} = await lastEmailEngineCredentials();

  let data = {
    smtp
  };
  const apiKey = accessToken;
  const url = `${EMAIL_ENGINE_URL}/v1/verifyAccount`;
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'x-ee-timeout': 120000,
    },
    data,
  };
  return await axios(config);
}

export async function testSmtpImapThroughEmailEngine(smtp, imap) {
  const {accessToken , ip: EMAIL_ENGINE_URL} = await lastEmailEngineCredentials();

  let data = {
    smtp,
    imap
  };
  const apiKey = accessToken;
  const url = `${EMAIL_ENGINE_URL}/v1/verifyAccount`;
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'x-ee-timeout': 30000,
    },
    data,
  };
  return await axios(config);
}



async function connectionRequestWithImapSmtp(name, email, imap, smtp, dataForMongo) {
  const {accessToken , ip: EMAIL_ENGINE_URL, _id: emailEngineInstance} = await lastEmailEngineCredentials();
  const accountExists = await Account.findOne({
    email
  });
  if (accountExists) throw new HttpErrors.BadRequest('Account already exists');

  let data = {
    account: uuidv4(),
    name: `${name?.first} ${name?.last}`,
    email,
    imap,
    smtp,
  };
  const apiKey = accessToken;
  const url = `${EMAIL_ENGINE_URL}/v1/account`;
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    data,
  };
  try {
    const result = await axios(config);
    const emailEngineAccountIdData = {
      emailEngineAccountId: result?.data?.account,
      connectionWith: emailEngineInstance
    };
    const mergedData = { ...dataForMongo, ...emailEngineAccountIdData };
    return await Account.create(mergedData);
  } catch (err) {
    throw new HttpErrors.BadRequest('Error connecting account');
  }
}


async function reconnectRequestWithImapSmtp(reconnect, email, imap, smtp, user, update) {
  if (reconnect.toLowerCase() !== email.toLowerCase())
    throw new HttpErrors.BadRequest('Invalid account');
  let account;
  account = await Account.findOne({
    email
  }).populate('connectionWith');
  if(account.emailEngineAccountId === null){
    const minServer = await getMinTotalAccountsEmailEngineInstance();
    await createAccountOnEmailEngine(account?._id, minServer);
    account = await Account.findOne({
      email
    }).populate('connectionWith');  
  }
  const {accessToken, ip: EMAIL_ENGINE_URL} = account.connectionWith;
  if (!account) throw new HttpErrors.NotFound('Account not found');
  if (!account.createdBy.equals(user._id)) throw new HttpErrors.Forbidden();
  const name = account?.name;

  let data = {
    name: `${name?.first} ${name?.last}`,
    email,
    imap,
    smtp,
  };

  const url = `${EMAIL_ENGINE_URL}/v1/account/${account.emailEngineAccountId}`;
  let config = {
    method: 'put',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data,
  };

  try {
    const resut = await axios(config);
    // await reconnectOnExistingCrendentials(account.emailEngineAccountId);
    account.set(update);
    account.status = AccountStatus.Connected;
    return await account.save();
  } catch (err) {
    const e_account = await deleteAccountFromEmailEngine(account?.emailEngineAccountId, account?.connectionWith);
    if(e_account.data.deleted == true) {
      await Account.updateOne({ _id: account._id }, { $set: {'warmup.status': AccountStatus.Paused, emailEngineAccountId: null } });
      await decreaseTotalAccountsForId(account.connectionWith);
    }
    throw new HttpErrors.BadRequest('Error Reconnecting Account');
  }
}




export function getPaginated(query, options) {
  return Account.paginate(query, options);
}

export function getAll(filter) {
  return Account.find(filter);
}

export function getAllAdmin(id) {
  return Account.find({ createdBy: id });
}

export function findOne(filter) {
  return Account.findOne(filter);
}

export function findById(id) {
  return Account.findById(id);
}

export async function deleteOne(id, user) {
  const accountData = await Account.findById(id).populate('connectionWith');
  
  let account = null;
  if (accountData.emailEngineAccountId !== null) {
    const e_account = await deleteAccountFromEmailEngine(accountData.emailEngineAccountId, accountData.connectionWith);
    if (e_account.data.deleted) {
      await decreaseTotalAccountsForId(accountData.connectionWith);
    }
  }

  account = await Account.deleteOne(id);
  if (!account) throw new HttpErrors.NotFound('Account not found');

  const query = { createdBy: user };
  const campaigns = await campaignsService.getAllCampaignById(query, accountData.email);

  const promises = campaigns.map(async (item) => {
    const index = item.options.emailAccounts.indexOf(accountData.email);
    if (index !== -1) {
      item.options.emailAccounts.splice(index, 1);
      await campaignsService.setOptions(item._id, item.options);
    }
  });
  
  await Promise.all(promises);
  
  return account;
}

export async function deleteAccountFromEmailEngine(id, connectionWith) {
  const {ip: EMAIL_ENGINE_URL, accessToken} = connectionWith;
  const apiKey = accessToken
  const url = `${EMAIL_ENGINE_URL}/v1/account/${id}`;
  let config = {
    method: 'delete',
    url: url,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };
  return await axios(config);
}

export async function deleteMany(filter) {
  const accounts = await Account.find(filter).select(['email']);
  const emails = accounts.map((account) => account.email);
  await Account.deleteMany(filter);
  await AccountWarmupStats.deleteMany({
    email: {
      $in: emails
    }
  });
}



export async function decreaseTotalAccountsForId(connectionWith){
  await EmailEngine.updateOne({_id: connectionWith}, {$inc: {totalAccounts: -1}});
}

export async function increaseTotalAccountsForId(connectionWith){
  await EmailEngine.updateOne({_id: connectionWith}, {$inc: {totalAccounts: 1}});
}

export async function getMinTotalAccountsEmailEngineInstance() {
  const servers = await EmailEngine.find({});
  const minServer = _.minBy(servers, function(s) { return s.totalAccounts});
  return minServer;
}

export async function update(id, accountData) {

  if (accountData?.customDomain?.isEnable && accountData?.customDomain?.name !== "") {
    await dnsService.checkDns(accountData.customDomain.name)
    await dnsService.checkSSL(accountData.customDomain.name)
  }

  const account = await Account.findByIdAndUpdate(id, flatObject(accountData), {
    new: true,
  }).populate('connectionWith');
  
  if (!account) throw new HttpErrors.NotFound('Account not found');
  if(accountData.status === "paused" && account.emailEngineAccountId !== null){
    const e_account = await deleteAccountFromEmailEngine(account.emailEngineAccountId, account.connectionWith);
    if(e_account.data.deleted == true) {
      await Account.updateOne({ _id: account._id }, { $set: { emailEngineAccountId: null } });
      await decreaseTotalAccountsForId(account.connectionWith);
    }
  }
  if(accountData.status === "connected"){
    const minServer = await getMinTotalAccountsEmailEngineInstance();
    await createAccountOnEmailEngine(id, minServer);
  }

  return account;
}

export async function updatePausedAccounts() {
 const data = await Account.updateMany({ status: 'paused' }, { $set: { emailEngineAccountId: null } });
 console.log(`data`, data)
}


export async function getWarmupStats(emails) {
  const stats = await AccountWarmupStats.aggregate([{
    $match: {
      emailId: { $in: emails },
      createdAt: {
        $gte: moment().startOf('day').subtract(6, 'days').toDate(),
        $lte: moment().endOf('day').toDate(),
      },
    },
  },
  {
    $group: {
      _id: '$email',
      sent_count: {
        $sum: {
          $add: ['$inbox_count', '$spam_count']
        }
      },
      inbox_count: {
        $sum: '$inbox_count'
      },
      spam_count: {
        $sum: '$spam_count'
      },
      received_count: {
        $sum: '$received_count'
      },
      last7Days: {
        $push: {
          k: { $dateToString: { format: '%m/%d/%Y', date: '$createdAt' } },
          v: {
            spam_count: '$spam_count',
            inbox_count: '$inbox_count',
            sent_count: { $add: ['$inbox_count', '$spam_count'] }
          }
        }
      },
    },
  },
  {
    $addFields: {
      last7Days: {
        $arrayToObject: '$last7Days'
      }
    }
  },
  ]);

  stats.forEach((stat) => {
    stat.health_score = parseInt((stat.inbox_count * 100) / stat.sent_count);
  });

  return stats;
}

export async function testImap(imapCredentials, account) {
  const {
    username,
    password,
    host,
    port
  } = imapCredentials;

  const imap = new ImapFlow({
    auth: {
      user: username,
      pass: password
    },
    host,
    port,
    logger: false,
  });

  try {
    await imap.connect();
    imap.close();
    return { message: 'Successful Imap Connection', status_code: 200 };
  } catch (error) {
    await updateAccount(account.emailEngineAccountId, true)
    return { message: 'Imap Failed', status_code: 422 };
  }
}

export async function testSmtp(smtpCredentials, account) {
  const {
    username,
    password,
    host,
    port
  } = smtpCredentials;

  const connection = new SMTPConnection({
    host,
    port,
  });

  const connect = () =>
    new Promise((resolve, reject) => {
      connection.connect(function (err) {
        if (err) reject(err);
        resolve();
      });
      connection.on('error', reject);
    });

  const login = (auth) =>
    new Promise((resolve, reject) => {
      connection.login(auth, function (err) {
        if (err) reject(err);
        resolve();
      });
      connection.on('error', reject);
    });

  try {
    await connect();
    await login({
      user: username,
      pass: password,
    });
    connection.close();
    return { message: 'Successful SMTP connection', status_code: 200 };
  } catch (error) {
    await updateAccount(account.emailEngineAccountId, true)
    return { message: 'SMTP Failed', status_code: 422 };
  }
}

export async function testSmtpImap(id) {
  let smtp_response;
  let imap_response;
  let account;
  account = await Account.findById({ _id: id }).populate('connectionWith');
  if(account.emailEngineAccountId === null){
    const minServer = await getMinTotalAccountsEmailEngineInstance();
    await createAccountOnEmailEngine(id, minServer);
    account = await Account.findById({ _id: id }).populate('connectionWith');
  }

  if (!account?.smtp || !account?.imap) {
    const IMAP = await getAccountImapSettings({ email: account.email });
    const SMTP = await getAccountSmtpSettings({ email: account.email });

    if(SMTP.error){
      smtp_response = {message: 'Failed smtp connection with an error description', status_code: 422};
      imap_response = {message: "Failed imap connection with an error description", status_code: 422};
      await removeAccountOnEmailEngine(account.emailEngineAccountId, account);
      return ([smtp_response, imap_response]);
    }  
    const { host: smtpHost, port: smtpPort, auth: smtpauth} =  SMTP;
    const { host: imapHost, port: imapPort, auth: imapauth} =  IMAP;

    const result = await testSmtpImapThroughEmailEngine({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort == 465 ? true : false,
      auth: {
        user: smtpauth.user,
        accessToken: smtpauth.accessToken
      },
    }, {
      host: imapHost,
      port: imapPort,
      secure: imapPort == 993,
      auth: imapauth,
    });
  
  if(result.data.smtp.success){
    smtp_response = {message: "Successfull smtp connection", status_code: 200};
  } else {
    smtp_response = {message: "Failed smtp connection", status_code: 422};

  }

  if(result?.data.imap.success){
    imap_response = {message: "Successfull imap connection", status_code: 200};
  } else {
    imap_response = {message: "Failed imap connection", status_code: 422};
    
  }
    if(imap_response.status_code == 422 || smtp_response.status_code == 422) {
      await updateAccount(account.emailEngineAccountId, true)
      await removeAccountOnEmailEngine(account.emailEngineAccountId, account)   
    }else if(imap_response.status_code == 200 && smtp_response.status_code == 200){
      await updateAccount(account.emailEngineAccountId, false)
    }
    return ([smtp_response, imap_response]);
  } else {
    const { host: smtpHost, port: smtpPort, username: smtpUsername, password: smtpPassword } =  account.smtp;
    const { host: imapHost, port: imapPort, username: imapUsername, password: imapPassword } =  account.imap;

    const result = await testSmtpImapThroughEmailEngine({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort == 465 ? true : false,
      auth: {
        user: smtpUsername,
        pass: smtpPassword
      }
    },{
      host: imapHost,
      port: imapPort,
      secure: imapPort == 993,
      auth: {
        user: imapUsername,
        pass: imapPassword
      }
    });

    if(result.data.smtp.success){
      smtp_response = {message: "Successfull smtp connection", status_code: 200};
    } else {
      smtp_response = {message: "Failed smtp connection", status_code: 422};
    
    }
  
    if(result.data.imap.success){
      imap_response = {message: "Successfull imap connection", status_code: 200};
    } else {
      imap_response = {message: "Failed imap connection", status_code: 422};
      
    }

    if(imap_response.status_code == 422 || smtp_response.status_code == 422) {
      await updateAccount(account.emailEngineAccountId, true)
      await removeAccountOnEmailEngine(account.emailEngineAccountId, account)   
    }else if(imap_response.status_code == 200 && smtp_response.status_code == 200){
      await updateAccount(account.emailEngineAccountId, false)
    }
    return ([smtp_response, imap_response]);
  }
}
export async function removeAccountOnEmailEngine(id, account) {
  try {
      if (account?.status !== "paused"){
        const e_account = await deleteAccountFromEmailEngine(id, account?.connectionWith);
        console.log(`e_account.data.deleted`, e_account.data.deleted)
        if(e_account.data.deleted == true) {
          await Account.updateOne({ _id: account._id }, { $set: {  'warmup.status': AccountStatus.Paused, emailEngineAccountId: null } });
          await decreaseTotalAccountsForId(account.connectionWith);
        }
      }
    } catch (error) {
      console.error(`Error updating account:`, error);
    } 
}

export async function updateAccount(id, value, account) {
  try {
    let updatedAccount = {};
    if (!value) {
      updatedAccount = await Account.findOneAndUpdate(
        {emailEngineAccountId: id},
        { status: AccountStatus.Connected },
        { new: true }
      );
    } else {
      updatedAccount = await Account.findOneAndUpdate(
        {emailEngineAccountId: id},
        { status: AccountStatus.Reconnect },
        { new: true }
      );    
    }
    if (!updatedAccount) {
      console.log(`Account with ID ${id} not found`);
      return null;
    }
    return updatedAccount;
  } catch (error) {
    console.error('Error updating account:', error.message);
    throw error;
  }
}

export async function createLabel(account) {

  const {
    provider,
    googleRefreshToken,
    imap,
    microsoftRefreshToken,
    email,
  } = account;

  let client;
  try {
    if (provider === Provider.Google_OAuth) {
      const {
        accessToken
      } = await googleService.getTokenByRefreshToken(
        googleRefreshToken
      );

      client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        auth: {
          user: email,
          accessToken,
        },
        secure: true,
        logger: false,
      });
    } else if (provider === Provider.Microsoft_OAuth) {
      const {
        accessToken
      } = await azureService.getTokenByRefreshToken(
        microsoftRefreshToken
      );

      client = new ImapFlow({
        host: 'outlook.office365.com',
        port: 993,
        auth: {
          user: email,
          accessToken,
        },
        secure: true,
        logger: false,
      });
    } else {
      client = new ImapFlow({
        host: imap.host,
        port: imap.port,
        auth: {
          user: imap.username,
          pass: imap.password,
        },
        secure: true,
        logger: false,
      });
    }

    await client.connect();
    try {
      const mailBox = await client.mailboxOpen(Provider.WarmupLabel)
      if (!mailBox.exists)
        await client.mailboxCreate(Provider.WarmupLabel);
    } catch (error) {
      await client.mailboxCreate(Provider.WarmupLabel);
    }

    await client.logout();

  } catch (error) {
    return false;
  }
}

export async function accountStatFindOneAndUpdate(query, update) {
  try {
    const data = await AccountWarmupStats.findOneAndUpdate(
      query,
      update,
      { upsert: true }
    );
    return data;
  } catch (e) {
    // logger.error(key, error);
  }
}

export async function getAccountImapSettings({ email }) {
  const imapConfig = {};
  const account = await Account.findOne({ email: email });
  if (account?.provider === Provider.Custom_Imap_Smtp) {
    imapConfig.auth = { user: email, pass: account.imap.password };
    imapConfig.host = account.imap.host;
    imapConfig.port = account.imap.port;
    imapConfig.secure = account.imap.port == 993;
    // continue;
  } else if (account?.provider === Provider.Microsoft_OAuth) {
    try {
      const { accessToken } = await azureService.getTokenByRefreshToken(
        account.microsoftRefreshToken
      );
      imapConfig.auth = { user: email, accessToken: accessToken };
      imapConfig.host = 'outlook.office365.com'; // IMAP server hostname
      imapConfig.port = 993; // IMAP server port (usually 993 for SSL/TLS)
      imapConfig.secure = true;
    } catch (e) {
      // console.log(email, 'error in microsoft auth');
      return false;
    }
  } else if (account?.provider === Provider.Google_OAuth) {
    const { accessToken } = await googleService.getTokenByRefreshToken(account.googleRefreshToken);
    imapConfig.auth = { user: email, accessToken: accessToken };
    imapConfig.host = 'imap.gmail.com'; // IMAP server hostname
    imapConfig.port = 993; // IMAP server port (usually 993 for SSL/TLS)
    imapConfig.secure = true;
    // continue;
  } else if (account?.provider === Provider.Google_Imap_Smtp) {
    imapConfig.auth = { user: email, pass: account.imap.password };
    imapConfig.host = account.imap.host;
    imapConfig.port = account.imap.port;
    imapConfig.secure = account.imap.port == 993;
    // continue;
  } else {
    // logger.log('no account.provider', account?.provider, email);
    return false;
  }
  return imapConfig;
}

export async function findCustomDomain(emailAccounts) {

  if (emailAccounts.length) throw new HttpErrors.BadRequest('Account not found');
  const account = Account.find({
    email: {
      $in: emailAccounts
    }
  })
}

export async function getAccountSmtpSettings({ email }) {
  let smtpConfig = null;
  // console.log("email......", email);
  try {
    const account = await Account.findOne({ email: email });
    // console.log("account......", account.name);
    if (account.provider === Provider.Microsoft_OAuth) {
      const refresh_token = account.microsoftRefreshToken;
      // console.log("refresh token....", refresh_token);
      const { accessToken } = await azureService.getTokenByRefreshToken(refresh_token, account);
      // console.log("got access token....", accessToken);
      smtpConfig = {
        service: 'hotmail',
        host: "smtp.office365.com",
        port: 587,
        auth: {
          type: 'OAuth2',
          user: account.email,
          accessToken,
          refreshToken: refresh_token,
          clientId: process.env.MICROSOFT_OAUTH_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
        },
      }
      // console.log("smtp config found....", smtpConfig);
    } else if (account.provider === Provider.Google_OAuth) {
      const refreshToken = account.googleRefreshToken;
      const { accessToken } = await googleService.getTokenByRefreshToken(refreshToken);
      smtpConfig = {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          type: 'OAuth2',
          user: account.email,
          accessToken,
          refreshToken,
          clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
          clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        },
      }
    } else {
      smtpConfig = {
        host: account.smtp.host,
        port: account.smtp.port,
        auth: {
          user: account.smtp.username,
          pass: account.smtp.password,
        },
      }
    }
    return smtpConfig;
  } catch (e) {
    return smtpConfig = {
      error: e.response.data.error_description
    };
  }
}

export async function updateEmailEngineAccountStatus() {
  try {
    for (let i = 0; i < 5; i++) {
      const accounts = await getAccountsInformation(i);
      console.log(`Data obtained from iteration ${i + 1}:`, accounts.length);
      
      for (const account of accounts) {
        await Account.updateOne({ emailEngineAccountId: account?.account }, { $set: { eEngineStatus: account?.state } });
      }
    }
  } catch (error) {
    console.error(`Error fetching accounts:`, error);
  }
}

async function getAccountsInformation(num) {
  try {
    const accessToken = process.env.ACCESS_TOKEN;
    const url = `${process.env.EMAIL_ENGINE_URL}/v1/accounts?page=${num}&pageSize=1000`;
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-ee-timeout': 60000,
      }
    };
    const response = await axios(config);
    return response?.data?.accounts;
  } catch (error) {
    console.error(`Error fetching account information:`, error?.response?.data);
    throw error;
  }
}

async function reconnectOnExistingCrendentials(id) {
  let data = {
    reconnect: true,
  };

  const accessToken = process.env.ACCESS_TOKEN;
  const url = `${process.env.EMAIL_ENGINE_URL}/v1/account/${id}/reconnect`;
  let config = {
    method: 'put',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data,
  };
  const resut = await axios(config);
}

export async function updateEmailAccounts(data) {
  const { accountInfo } = data;
  const account = await Account.findByIdAndUpdate(accountInfo?._id, accountInfo, {
    new: true,
  });
  if (!account) throw new HttpErrors.NotFound('Account not found');
  return account;
}

export async function getAccountAnalytics(userId, search, start, end) {
  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy"
      }
    },
    {
      $unwind: "$createdBy"
    }
  ];

  if (start && end) {
    const startDate = new Date(parseInt(start));
    const endDate = new Date(parseInt(end));
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    pipeline.push({
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    });
  }
  
  if (userId || search) {
    const matchStage = {};
  
    if (userId) {
      matchStage["createdBy._id"] = mongoose.Types.ObjectId(userId);
    }
  
    if (search) {
      const regexString = search.replace(/[^a-zA-Z0-9]/g, "\\$&");
      const searchRegex = new RegExp(regexString, "i");
  
      matchStage.$or = [
        { email: searchRegex },
        { "createdBy.email": searchRegex }
      ];
    }
  
    pipeline.push({ $match: matchStage });
  }
  
  pipeline.push({
    $group: {
      _id: null,
      totalCount: { $sum: 1 },
      countPaused: {
        $sum: {
          $cond: { if: { $eq: ["$status", AccountStatus.Paused] }, then: 1, else: 0 }
        }
      },
      countHasErrors: {
        $sum: {
          $cond: {
            if: { $in: ["$status", [AccountStatus.Reconnect, AccountStatus.Disconnected]] },
            then: 1,
            else: 0
          }
        }
      },
      countNoCustomTrackingDomain: {
        $sum: {
          $cond: { if: { $eq: ["$customDomain.isEnable", false] }, then: 1, else: 0 }
        }
      },
      countWarmupActive: {
        $sum: {
          $cond: { if: { $eq: ["$warmup.status", WarmupStatus.Enabled] }, then: 1, else: 0 }
        }
      },
      countWarmupPaused: {
        $sum: {
          $cond: { if: { $eq: ["$warmup.status", WarmupStatus.Paused] }, then: 1, else: 0 }
        }
      },
      countWarmupHasErrors: {
        $sum: {
          $cond: { if: { $eq: ["$warmup.status", WarmupStatus.Disabled] }, then: 1, else: 0 }
        }
      }
    }
  });
  
  const accountsCount = await Account.aggregate(pipeline);
  if(accountsCount?.length > 0){
    return  accountsCount[0];
  }
  return {};
}

export async function getExportAccounts(query) {
  return await Account.find(query);
}

export async function getDKIMDataofAccount(data){
  const { email } = data;
  const options = {
    method: 'POST',
    url: process.env.RAPID_API_URL,
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': process.env.RAPID_API_KEY,
      'X-RapidAPI-Host': 'email-records-mx-dkim-spf-dmarc-txt-smtp.p.rapidapi.com'
    },
    data: {
      email: email,
    }
  };
  
  try {
    const response = await axios.request(options);
    return response?.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getAccountSmtpSettingsForTest({ email }) {
  let smtpConfig = null;
  // console.log("email......", email);
  try {
    const account = await Account.findOne({ email: email });
    // console.log("account......", account.name);
    if (account.provider === Provider.Microsoft_OAuth) {
      const refresh_token = account.microsoftRefreshToken;
      // console.log("refresh token....", refresh_token);
      const { accessToken } = await azureService.getTokenByRefreshToken(refresh_token, account);
      // console.log("got access token....", accessToken);
      smtpConfig = {
        service: 'hotmail',
        auth: {
          type: 'OAuth2',
          user: account.email,
          accessToken,
          refreshToken: refresh_token,
          clientId: process.env.MICROSOFT_OAUTH_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
        },
      }
      // console.log("smtp config found....", smtpConfig);
    } else if (account.provider === Provider.Google_OAuth) {
      const refreshToken = account.googleRefreshToken;
      const { accessToken } = await googleService.getTokenByRefreshToken(refreshToken);
      smtpConfig = {
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: account.email,
          accessToken,
          refreshToken,
          clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
          clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        },
      }
    } else {
      smtpConfig = {
        host: account.smtp.host,
        port: account.smtp.port,
        auth: {
          user: account.smtp.username,
          pass: account.smtp.password,
        },
      }
    }
    return smtpConfig;
  } catch(e) {
    console.log("exception......", e)
    console.log("exception2......", e.stack);
    console.log("inside catch....", email)
    // logger.error('error in provider details', email)
    // logger.error('error in provider details', e)
    return smtpConfig;
  }
}
