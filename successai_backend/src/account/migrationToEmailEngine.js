import Account from "../account/models/account.model.js";
import Campaign from '../campaigns/models/campaign.model.js';
import AccountStatus from './enum/account-status.enum.js';
import axios from 'axios';
import { v4 as uuidv4 } from "uuid";
import Provider from "../account/enum/provider.enum.js";
import { decreaseTotalAccountsForId, deleteAccountFromEmailEngine, increaseTotalAccountsForId, lastEmailEngineCredentials } from './account.service.js';
import { setOptions } from '../campaigns/campaign.service.js';
import EmailEngine from "./models/email_engine_instances.js";
// import _ from "mongoose-paginate-v2";
import _ from 'lodash';

export async function migrateData(){
  const {accessToken: ACCESS_TOKEN , microsoftProvider: EMAIL_ENGINE_MICROSOFT_PROVIDER, googleProvider: EMAIL_ENGINE_GOOGLE_PROVIDER , ip: EMAIL_ENGINE_URL} = await lastEmailEngineCredentials();
  const accounts = await Account.find({ status: { $ne: 'paused' } });
    for (const account of accounts) {
      const name = account.name;
      const uniqueId = uuidv4();
      if (account.provider === Provider.Microsoft_OAuth) {
        console.log('Microsoft_OAuth');
        let data = {
          account: uniqueId,
          name: `${name?.first} ${name?.last}`,
          email: account.email,
          oauth2 : {
            provider: EMAIL_ENGINE_MICROSOFT_PROVIDER,
            refreshToken: account.microsoftRefreshToken,
            auth: {
              "user": account.email
            }
          }
        };
        const accessToken = ACCESS_TOKEN;
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
            const res = await axios(config);
            await Account.updateOne({ _id: account._id }, { $set: { emailEngineAccountId: uniqueId,  migrated: true } });
        } catch(err){};

      }
      
      else if (account.provider === Provider.Google_OAuth) {
        console.log('Google_OAuth');
          let data = {
            account: uniqueId,
            name: `${name?.first} ${name?.last}`,
            email: account.email,
            oauth2 : {
              provider: EMAIL_ENGINE_GOOGLE_PROVIDER,
              refreshToken: account.googleRefreshToken,
              auth: {
                "user": account.email
              }
            }
          };
          const accessToken = ACCESS_TOKEN;
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
          try{
          const res = await axios(config);
          await Account.updateOne({ _id: account._id }, { $set: { emailEngineAccountId: uniqueId,  migrated: true } });
        } catch(error){};
          
  
        }
       else if (account.provider == Provider.Google_Imap_Smtp){
        console.log('Google_Imap_Smtp');
          const imapForEmailEngine = {
            host: account.imap.host,
            port: account.imap.port,
            secure: account.imap.port == 993,
            disabled: false,
            auth: {
              user: account.imap.username,
              pass: account.imap.password
            }
          }
          const smtpForEmailEngine = {
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.port == 465 ? true : false,
            auth: {
              user: account.smtp.username,
              pass: account.smtp.password
            }
          }
          let data = {
            account: uniqueId,
            name: `${name?.first} ${name?.last}`,
            email: account.email,
            imap: imapForEmailEngine ,
            smtp: smtpForEmailEngine,
          };
          const apiKey = ACCESS_TOKEN;
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
          await Account.updateOne({ _id: account._id }, { $set: { emailEngineAccountId: uniqueId,  migrated: true } });
        } catch(err){}
      }  
      else if (account.provider == Provider.Custom_Imap_Smtp) {
        console.log('Custom_Imap_Smtp');
        const imapForEmailEngine = {
          host: account.imap.host,
          port: account.imap.port,
          secure: account.imap.port == 993,
          disabled: false,
          auth: {
            user: account.imap.username,
            pass: account.imap.password
          }
        }
        const smtpForEmailEngine = {
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.port == 465 ? true : false,
          auth: {
            user: account.smtp.username,
            pass: account.smtp.password
          }
        }
  
          let data = {
            account: uniqueId,
            name: `${name?.first} ${name?.last}`,
            email: account.email,
            imap: imapForEmailEngine,
            smtp: smtpForEmailEngine,
          };
          const apiKey = ACCESS_TOKEN;
          const url = `${EMAIL_ENGINE_URL}/v1/account`;
          let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: url,
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'x-ee-timeout': '1000000'
            },
            data,
          };
          try{
          const result = await axios(config);
          await Account.updateOne({ _id: account._id }, { $set: { emailEngineAccountId: uniqueId,  migrated: true } });
            } catch(error) {}
      }
  
    }
  }

export async function populateEmailEngineModel(){
  const instance = await EmailEngine.create({
    "name": "Engine 2",
    "ip": 'http://52.186.168.115:4000',
    "accessToken": "9cd9f70cac4c44c674170c5365bd202d46c613deb7e794b089143721aa43e301",
    "microsoftProvider": 'AAABjpntsnsAAAAC',
    'googleProvider': 'AAABjpnspGQAAAAB',
    'totalAccounts': 0
  });
  } 
  
  export async function referenceExistingRecords(){
    const emailEngine = await EmailEngine.findOne().select('_id');
    const result = await Account.updateMany({}, { $set: { connectionWith: emailEngine._id } });
    console.log(result);
  } 



// export async function correctingRecords(){

// const accounts = await Account.find({'smtp.port': 465});
// console.log(`count`, accounts?.length)

//     accounts.map(async (account) => {
//       console.log(`account`, account)
//         let data = {
//           smtp:{
//           host: account?.smtp?.host,
//           port: account?.smtp?.port,
//           secure: true,
//           auth: {
//             user: account?.smtp?.username,
//             pass: account?.smtp?.password
//           }
//         }
//         };

//         const accessToken = process.env.ACCESS_TOKEN;
//         const url = `${process.env.EMAIL_ENGINE_URL}/v1/account/${account.emailEngineAccountId}`;
//         let config = {
//             method: 'put',
//             maxBodyLength: Infinity,
//             url: url,
//             headers: {
//             'Authorization': `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//             },
//             data,
//         };

//         try {
//             const resut = await axios(config);
//             console.log(`result`, resut?.data)
//           } catch (err) {
//             console.log(`err`, err?.response.data)
//             throw new HttpErrors.BadRequest('Error Reconnecting Account');
//           }
// })

// }

export async function createAccountOnEmailEngine(id, connectionWith){
  const account = await Account.findById({ _id: id }).populate('connectionWith');
  const {accessToken: ACCESS_TOKEN , microsoftProvider: EMAIL_ENGINE_MICROSOFT_PROVIDER, googleProvider: EMAIL_ENGINE_GOOGLE_PROVIDER , ip: EMAIL_ENGINE_URL} = connectionWith;
    const name = account.name;
    const uniqueId = uuidv4();
    if (account.provider === Provider.Microsoft_OAuth) {
      console.log('Microsoft_OAuth');
      let data = {
        account: uniqueId,
        name: `${name?.first} ${name?.last}`,
        email: account.email,
        oauth2 : {
          provider: EMAIL_ENGINE_MICROSOFT_PROVIDER,
          refreshToken: account.microsoftRefreshToken,
          auth: {
            "user": account.email
          }
        }
      };
      const accessToken = ACCESS_TOKEN;
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
          const res = await axios(config);
          const record = await Account.updateOne({ _id: account._id }, { $set: { emailEngineAccountId: uniqueId,  migrated: true, connectionWith: connectionWith._id } });
          await increaseTotalAccountsForId(account.connectionWith);
      } catch(err){console.log(err)};

    }
    
    else if (account.provider === Provider.Google_OAuth) {
      console.log('Google_OAuth');
        let data = {
          account: uniqueId,
          name: `${name?.first} ${name?.last}`,
          email: account.email,
          oauth2 : {
            provider: EMAIL_ENGINE_GOOGLE_PROVIDER,
            refreshToken: account.googleRefreshToken,
            auth: {
              "user": account.email
            }
          }
        };
        const accessToken = ACCESS_TOKEN;
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
        try{
        const res = await axios(config);
        const record = await Account.updateOne({ _id: account._id }, { $set: { emailEngineAccountId: uniqueId,  migrated: true, connectionWith: connectionWith._id  } });
        await increaseTotalAccountsForId(account.connectionWith);
      } catch(error){console.log('err', error)};
        

      }
     else if (account.provider == Provider.Google_Imap_Smtp){
      console.log('Google_Imap_Smtp');
        const imapForEmailEngine = {
          host: account.imap.host,
          port: account.imap.port,
          secure: account.imap.port == 993,
          disabled: false,
          auth: {
            user: account.imap.username,
            pass: account.imap.password
          }
        }
        const smtpForEmailEngine = {
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.port == 465 ? true : false,
          auth: {
            user: account.smtp.username,
            pass: account.smtp.password
          }
        }
        let data = {
          account: uniqueId,
          name: `${name?.first} ${name?.last}`,
          email: account.email,
          imap: imapForEmailEngine ,
          smtp: smtpForEmailEngine,
        };
        const apiKey = ACCESS_TOKEN;
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
        const record = await Account.updateOne({ _id: account._id }, { $set: { emailEngineAccountId: uniqueId,  migrated: true, connectionWith: connectionWith._id  } });
        await increaseTotalAccountsForId(account.connectionWith);
      } catch(err){console.log(err)}
    }  
    else if (account.provider == Provider.Custom_Imap_Smtp) {
      console.log('Custom_Imap_Smtp');
      const imapForEmailEngine = {
        host: account.imap.host,
        port: account.imap.port,
        secure: account.imap.port == 993,
        disabled: false,
        auth: {
          user: account.imap.username,
          pass: account.imap.password
        }
      }
      const smtpForEmailEngine = {
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.port == 465 ? true : false,
        auth: {
          user: account.smtp.username,
          pass: account.smtp.password
        }
      }

        let data = {
          account: uniqueId,
          name: `${name?.first} ${name?.last}`,
          email: account.email,
          imap: imapForEmailEngine,
          smtp: smtpForEmailEngine,
        };
        const apiKey = ACCESS_TOKEN;
        const url = `${EMAIL_ENGINE_URL}/v1/account`;
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: url,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'x-ee-timeout': '1000000'
          },
          data,
        };
        try{
        const result = await axios(config);
        const record = await Account.updateOne({ _id: account._id }, { $set: { emailEngineAccountId: uniqueId,  migrated: true, connectionWith: connectionWith._id  } });
        await increaseTotalAccountsForId(account.connectionWith);
      } catch(error) {console.log(error)}
    }
}

export async function removePausedEmailAccounts() {
  try {
    const accounts = await Account.find({ status: "paused" }).populate('connectionWith');
    await Promise.all(accounts.map(async (account) => {
      console.log('account', account);
      try {
        const e_account = await deleteAccountFromEmailEngine(account.emailEngineAccountId, account.connectionWith);
        console.log(`deleted`, e_account.data.deleted);

        if (e_account.data.deleted) {
          await Account.updateOne({ _id: account._id }, { $set: { emailEngineAccountId: null } });
          await decreaseTotalAccountsForId(account.connectionWith);
          const campaigns = await Campaign.find({ 'options.emailAccounts': account.email });

          const promises = campaigns.map(async (item) => {
            const index = item.options.emailAccounts.findIndex((email) => email === account.email);
            if (index !== -1) {
              item.options.emailAccounts.splice(index, 1);
              await setOptions(item._id, item.options);
            }
          });

          await Promise.all(promises);
        }
      } catch (error) {
        console.error("Error processing account:", error?.response?.data);
      }
    }));
  } catch (error) {
    console.error("Error fetching accounts:", error?.response?.data);
  }
}


export async function removeConnectedEmailAccounts() {
  try {
    const accounts = await Account.find({ status: "connected", 'warmup.status': { $in: ["paused", "pause"] } }).populate('connectionWith');
    console.log(`accounts`, accounts.length);

    for (const account of accounts) {
      try {
        const campaigns = await Campaign.find({ 'options.emailAccounts': account.email });

        if (campaigns.length === 0) {
          const e_account = await deleteAccountFromEmailEngine(account.emailEngineAccountId, account.connectionWith);
          console.log(`deleted`, e_account.data.deleted);
          if (e_account.data.deleted) {
            await Account.findByIdAndUpdate({ _id: account._id }, { status: AccountStatus.Paused, emailEngineAccountId: null });
            await decreaseTotalAccountsForId(account.connectionWith);
          }
        }
      } catch (error) {
        console.error("Error processing account:", error?.response?.data);
      }
    }
  } catch (error) {
    console.error("Error fetching accounts:", error?.response?.data);
  }
}



export async function redistribute_accounts(servers) {
  let maxServer = _.maxBy(servers, function(s) { return s.totalAccounts});
  let minServer = _.minBy(servers, function(s) { return s.totalAccounts});
  let account = await Account.findOne({connectionWith: maxServer, emailEngineAccountId: { "$nin": [ null, "" ] } } ).limit(1);
  console.log("****************************")
  console.log("maxServer=====", maxServer.totalAccounts);
  console.log("minServer=====", minServer.totalAccounts);
  console.log("account email====== ", account.email);
  
  const resp = await deleteAccountFromEmailEngine(account.emailEngineAccountId, maxServer)
  // console.log(resp); 
  if (resp.data.deleted == true) {
    console.log("AAAAAA")
    maxServer.totalAccounts -= 1
    await decreaseTotalAccountsForId(maxServer);
    await createAccountOnEmailEngine(account.id, minServer);
    minServer.totalAccounts += 1
    await increaseTotalAccountsForId(minServer);
  }
  return servers;
}
export async function divideAccounts() {
  // console.log('calling')
  var servers = await EmailEngine.find({  });
  while (true) {
    let maxServer = _.maxBy(servers, function(s) { return s.totalAccounts});
    let minServer = _.minBy(servers, function(s) { return s.totalAccounts});
    // console.log(maxServer);
    // console.log(minServer);
    if (maxServer.totalAccounts - minServer.totalAccounts <= 50) {
      break;
    }
    servers = await redistribute_accounts(servers);
    // console.log("servers", servers);
  }
}
export async function removeErrorEmailAccounts() {
  try {
    const accounts = await Account.find({ eEngineStatus: { $in: ['authenticationError', 'connectError'] } }).populate('connectionWith');
    console.log(`accounts`, accounts.length);

    for (const account of accounts) {
      try {
          const e_account = await deleteAccountFromEmailEngine(account.emailEngineAccountId, account.connectionWith);
          console.log(`deleted`, e_account.data.deleted);
          if (e_account.data.deleted) {
            await Account.findByIdAndUpdate({ _id: account._id }, { status: AccountStatus.Paused, emailEngineAccountId: null ,'warmup.status': AccountStatus.Paused });
          }
      } catch (error) {
        console.error("Error processing account:", error?.response?.data);
      }
    }
  } catch (error) {
    console.error("Error fetching accounts:", error?.response?.data);
  }
}

export async function deleteAll() {
  const accounts = await Account.find().populate('connectionWith');
  accounts.map(async(account) => {
    if (account.emailEngineAccountId !== null) {
      const e_account = await deleteAccountFromEmailEngine(account.emailEngineAccountId, account.connectionWith);
      if (e_account.data.deleted) {
        await decreaseTotalAccountsForId(account.connectionWith);
      }
    }
  })
}
