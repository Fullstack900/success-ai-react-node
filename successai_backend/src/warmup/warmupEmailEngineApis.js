import axios from "axios";
import Setting from '../account/enum/warmup-setting-type.js';
import Provider from '../account/enum/provider.enum.js';
import Account from "../account/models/account.model.js";

export async function apiRequestForSearchMesssag(accountId, mailBox, to, from,  subject, type) {
  const account = await Account.findOne({emailEngineAccountId: accountId}).populate('connectionWith')
  const {ip: EMAIL_ENGINE_URL, accessToken} = account.connectionWith

      const searchCriteria = {
        search: { from, to, subject }
      };

      if (type === Setting.OPEN) searchCriteria.search.seen = "true";
      else if (type === Setting.IMPORTANT) searchCriteria.search.flagged = "true";
      const apiKey = accessToken;
      const url = `${EMAIL_ENGINE_URL}/v1/account/${accountId}/search?path=${mailBox}&pageSize=1`;
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'x-ee-timeout': 60000,
        },
        data: searchCriteria
      };
      try {
        const result = await axios(config);
        const count = result?.data?.messages;
        return count
      } catch (err) {
       console.log(`error`, err)
      }
  }

  export async function apiRequestForSpamCount(accountId, mailBox, to, from,  subject, on, type) {
    const account = await Account.findOne({emailEngineAccountId: accountId}).populate('connectionWith');
    const {ip: EMAIL_ENGINE_URL, accessToken} = account.connectionWith;

    const searchCriteria = {
      search: { from, to, subject, sentSince: on }
    };

    if (type === Setting.OPEN) searchCriteria.search.seen = "true";
    else if (type === Setting.IMPORTANT) searchCriteria.search.flagged = "true";
    const apiKey = accessToken;
    const url = `${EMAIL_ENGINE_URL}/v1/account/${accountId}/search?path=${mailBox}&pageSize=1`;
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'x-ee-timeout': 60000,
      },
      data: searchCriteria
    };
    try {
      const result = await axios(config);
      const count = result?.data?.messages;
      console.log('From:', count);

      return count
    } catch (err) {
     console.log(`error`, err.response.data)
    }
  }

  export async function apiRequestForChangeFlag(accountId, mailBox, to, from,  subject, flag) {
    const account = await Account.findOne({emailEngineAccountId: accountId}).populate('connectionWith')
    const {ip: EMAIL_ENGINE_URL, accessToken} = account.connectionWith;

    let data = {
        search: {
          from,
          to,
          subject
        },
        update: {
          flags: {
            add: [
              `\\${flag}`
            ]
          }
        }
  }
  const apiKey = accessToken;  
  const url = `${EMAIL_ENGINE_URL}/v1/account/${accountId}/messages?path=${mailBox}`;
    let config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'x-ee-timeout': 60000,
      },
      data,
    };
    try {
      const result = await axios(config);
      const addFlag = result?.data?.flags.add;
      return addFlag;
    } catch (err) {
     console.log(`error`, err)
    }
  }
  
  export async function apiRequestForMoveToInbox(accountId, mailBox, to, from,  subject) {
    const account = await Account.findOne({emailEngineAccountId: accountId}).populate('connectionWith');
    const {ip: EMAIL_ENGINE_URL, accessToken} = account.connectionWith;

    let data = {
        search: {
          from,
          to,
          subject
        },
    path: 'INBOX'
  }
  const apiKey = accessToken;  
  const url = `${EMAIL_ENGINE_URL}/v1/account/${accountId}/messages/move?path=${mailBox}`;
    let config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'x-ee-timeout': 60000,
      },
      data,
    };
    try {
      const result = await axios(config);
      const moveSpam = result?.data;
      return moveSpam;
    } catch (err) {
     console.log(`error`, err)
    }
  }
  
  export async function apiRequestForMoveMessage(accountId, mailBox, to, from,  subject) {
    const account = await Account.findOne({emailEngineAccountId: accountId}).populate('connectionWith')
    const {ip: EMAIL_ENGINE_URL, accessToken} = account.connectionWith

    let data = {
        search: {
          from,
          to,
          subject
        },
    path: Provider.WarmupLabel
  }
  const apiKey = accessToken;  
  const url = `${EMAIL_ENGINE_URL}/v1/account/${accountId}/messages/move?path=${mailBox}`;
    let config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'x-ee-timeout': 60000,
      },
      data,
    };
    try {
      const result = await axios(config);
      const move = result?.data;
      return move;
    } catch (err) {
     console.log(`error`, err)
    }
  }
  
  export async function apiRequestForFolderCreation(accountId, folder){
    const account = await Account.findOne({emailEngineAccountId: accountId}).populate('connectionWith');
    const {ip: EMAIL_ENGINE_URL, accessToken} = account.connectionWith;
    
    const data = {
      path: [
        folder
      ]
    }
  
    const apiKey = accessToken;
      const url = `${EMAIL_ENGINE_URL}/v1/account/${accountId}/mailbox`;
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'x-ee-timeout': 60000,
        },
        data,
      };
      try {
        const result = await axios(config);
        return result?.data;
      } catch (err) {
       console.log(`error`, err)
      }
  }
  
  export async function apiRequestForMesssagesInfo(accountId, messageId) {
    const account = await Account.findOne({emailEngineAccountId: accountId}).populate('connectionWith')
    const {ip: EMAIL_ENGINE_URL, accessToken} = account.connectionWith

      const apiKey = accessToken;
      const url = `${EMAIL_ENGINE_URL}/v1/account/${accountId}/message/${messageId}`;
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'x-ee-timeout': 60000,
        }
      };
      try {
        const result = await axios(config);
        const message = result?.data;
        return message;
      } catch (err) {
       console.log(`error`, err)
      }
  }

  export async function apiRequestForGetMailboxes(accountId) {
    const account = await Account.findOne({emailEngineAccountId: accountId}).populate('connectionWith');
    const {ip: EMAIL_ENGINE_URL, accessToken} = account.connectionWith;

    const apiKey = accessToken;
    const url = `${EMAIL_ENGINE_URL}/v1/account/${accountId}/mailboxes`;
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: url,
      headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'x-ee-timeout': 60000,
      }
    };
    try {
      const result = await axios(config);
      const mailBoxes = result?.data?.mailboxes
      
      return mailBoxes;
    } catch (err) {
     console.log(`error`, err)
    }
  }