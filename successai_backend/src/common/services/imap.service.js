import { ImapFlow } from 'imapflow';
import { MAILBOXES } from '../../constants/index.js';
import logger from '../utils/logger.js';
import { apiRequestForSpamCount, apiRequestForGetMailboxes } from "../../warmup/warmupEmailEngineApis.js"

export const getMailboxList = async ({ emailEngineAccountId, mailbox }) => {
	try {
		const mailboxList = await apiRequestForGetMailboxes(emailEngineAccountId);
		const mailboxMapping = MAILBOXES[mailbox?.toLowerCase()];
		if (!mailboxMapping) {
			throw new Error('No Mapping for corresponding mailbox');
		}
		let mailBoxPath = '';
		for (const iterator of mailboxList) {
			const mailboxName = iterator.name;
			if (mailboxMapping.includes(mailboxName.toLowerCase())) {
				mailBoxPath = iterator.path;
			}
		}
		if (!mailBoxPath) {
			throw new Error('No mailbox found for the account');
		}
		return mailBoxPath;
	} catch (err) {
		// logger.error('Error:', err);
	}
};


// export const getMailboxList = async ({ client, mailbox }) => {
// 	try {
// 		const mailboxList = await client.list();
// 		const mailboxMapping = MAILBOXES[mailbox?.toLowerCase()];
// 		if (!mailboxMapping) {
// 			throw new Error('No Mapping for corresponding mailbox');
// 		}
// 		let mailBoxPath = '';
// 		for (const iterator of mailboxList) {
// 			const mailboxName = iterator.name;
// 			if (mailboxMapping.includes(mailboxName.toLowerCase())) {
// 				mailBoxPath = iterator.path;
// 			}
// 		}
// 		if (!mailBoxPath) {
// 			throw new Error('No mailbox found for the account');
// 		}
// 		return mailBoxPath;
// 	} catch (err) {
// 		// logger.error('Error:', err);
// 	}
// };

export const getEmailsCount = async ({ emailEngineAccountId, searchParam, mailBox }) => {
	try {
		  let searchEamilCount = 0;
		  if (searchParam?.or?.length) {
			  for (const iterator of searchParam?.or) {
				const {subject, from, to, on} = iterator
				const uids = await apiRequestForSpamCount(emailEngineAccountId, mailBox, to, from, subject, on);
				  if (uids?.length > 0) {
					  searchEamilCount = uids.length;
					  break;
				  }
			  }
		  } 
		//   else {
		// 	const uids = await apiRequestForSpamCount(emailEngineAccountId, mailBox, searchParam);
		// 	  searchEamilCount = uids.length;
		//   }
		  return searchEamilCount;
	} catch (err) {
	  // logger.error('Error:', err);
	} 
  };

// export const getEmailsCount = async ({ client, searchParam, mailBox }) => {
//   let lock = await client.getMailboxLock(mailBox);
//   try {
// 		let searchEamilCount = 0;
// 		if (searchParam?.or?.length) {
// 			for (const iterator of searchParam?.or) {
// 				const uids = await client.search(iterator, { uid: true });
// 				if (uids?.length > 0) {
// 					searchEamilCount = uids.length;
// 					break;
// 				}
// 			}
// 		} else {
// 			const uids = await client.search(searchParam, { uid: true });
// 			searchEamilCount = uids.length;
// 		}
// 		return searchEamilCount;
//   } catch (err) {
//     // logger.error('Error:', err);
//   } finally {
//     lock.release();
//   }
// };


