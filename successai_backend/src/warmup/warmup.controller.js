import * as warmupService from './warmup.service.js';
import HttpErrors from 'http-errors';
import csv from 'csv-parser';
import fs from 'fs';

export async function warmup(req, res) {
  const total = await warmupService.startWarmup();
  res.send({ total });
}
//TESTBYPS
// export async function sendmail(req, res) {
//   const sender = {
//     warmup: {
//       basicSetting: {
//         alertBlock: true,
//       },
//       customDomain: {
//         isEnable: true,
//         name: 'yourcustomdomain.com',
//       },
//       filterTag: 'mytag',
//     },

//   };

//   const mails = [
//     {
//       from: {
//         email: 'rahul.gupta@example.com',
//         name: {
//           first: 'Rahul',
//           last: 'Gupta',
//         },
//       },
//       subject: 'Travel Itinerary for Next Month',
//       messageId: '98765',
//       body: `
//   Thank you for confirming your travel dates.

//   If you have any questions or require any changes, please let me know.

//   Looking forward to your trip.`,
//     }
//   ];
//   const data = await warmupService.sendReplyMail(sender, mails);
//   res.send({ data });
// }
//TESTBYPS
export async function addBlocklistEmails(req, res) {
  const {
    type,
    link,
    emails
  } = req.body;
  let emailArray = []
  if (type === "Google_Link") {
    emailArray = await warmupService.fetchGoogleSheet(link);
    if (!emailArray || emailArray.length == 0)
      throw new HttpErrors.BadRequest('Something went wrong while reading google sheet...');
  } else {
    emailArray = emails
  }

  const docs = await warmupService.makeBlocklistDocs({
    emails: emailArray,
    userId: req.user.id,
    link: link,
    type: type
  });
  if (!docs || docs.length == 0)
    throw new HttpErrors.BadRequest('Something went wrong...');

  const result = await warmupService.addBlocklistEmails(docs, req.user);
  if (!result)
    throw new HttpErrors.BadRequest('Something went wrong...');

  res.send({ totalAdded: result, message: "Blocklist email created" });
}

export async function parseCSVFile(file) {
  try {
    const result = []
    const csvData = file.buffer.toString('utf8');
    // Use the csv-parser to process the data from the buffer
    csv({ headers: false })
      .on('data', (data) => {
        result.push(data[0]);
      })
      .write(csvData); // Parse the CSV data from the buffer
    // console.log({ result });
    return result
  } catch (error) {
    return false;
  }

}

export async function getBlocklistEmails(req, res) {
  const { limit = 10, offset = 0, search } = req.query;

  const query = {
    email: new RegExp(search?.replace(/[^a-zA-Z0-9]/g, '\\$&'), 'i'),
    createdBy: req.user,
  };
  const options = { limit, sort: "-createdAt" };
  options.offset = parseInt(offset)
  const emails = await warmupService.getBlockList(query, options);

  res.send(emails);
}

export async function deleteBlockList(req, res) {
  const { lists } = req.body;
  const deleteBlocklist = await warmupService.deleteBlockList(lists)
  res.send({ message: "Blocklist email deleted successfully" });
}
