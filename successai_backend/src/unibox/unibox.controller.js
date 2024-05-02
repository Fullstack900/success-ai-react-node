import * as uniboxService from "./unibox.service.js";
import mongoose from "mongoose";
import HttpErrors from "http-errors";

export async function getAllEmails(req, res) {
  let { campaignId, accountId, perPage = 500, page = 1, label, time_period } = req.query;
  const filters = {};
  const timePeriodMap = {
    last_365_days: 365,
    last_180_days: 180,
    last_90_days: 90,
    last_30_days: 30,
    last_7_days: 7,
  };

  const calculateStartDate = (days) => {
    const currentDate = new Date();
    return new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000);
  };

  if (timePeriodMap[time_period]) {
    filters.createdAt = {
      $gte: calculateStartDate(timePeriodMap[time_period]),
    };
  } else {
    filters.createdAt = {
      $gte: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000),
    };
  }

  perPage = Number(perPage);
  page = Number(page);
  if (campaignId) filters.campaign_id = new mongoose.Types.ObjectId(campaignId);
  if (accountId) filters.from = new mongoose.Types.ObjectId(accountId);
  if (label) filters.label = new mongoose.Types.ObjectId(label);
  // await uniboxService.updateEmailReplies({ filters });
  const { emailList, totalEmailCount } = await uniboxService.getInboxEmails({
    filters,
    perPage,
    page,
    user: req.user,
  });


  if (!emailList) throw new HttpErrors.NotFound("emails not found");
  res.send({ docs: emailList, totalEmailCount, perPage, page });
}

export async function sendEmailReplies(req, res) {
  const sentReply = await uniboxService.sendEmailReplies(req.body);
  res.send({ message: "Reply send successfully" });
}

export async function deleteEmails(req, res) {
  const deleteEmails = await uniboxService.deleteEmails(req.params.id)
  res.send({ message: "Email deleted successfully" })
}

export async function getEmailReplies(req, res) {
  let { campaignEmailId } = req.query;
  // const filters = {
  //   _id: new mongoose.Types.ObjectId(campaignEmailId),
  // };
  // await uniboxService.updateAllRepliedEmails(campaignEmailId);
  let { replies } = await uniboxService.getEmailRepliesFromDB({
    filters: { campaignEmailId },
  });
  // if (replies.length == 0) {
  //   // await uniboxService.updateEmailReplies({ filters });
  //   replies = await uniboxService.getEmailRepliesFromDB({
  //     filters: { campaignEmailId },
  //   });
  // } else {
  //   // uniboxService.updateEmailReplies({ filters });
  // }
  if (!replies) throw new HttpErrors.NotFound("reply emails not found");
  res.send({ docs: replies });
}

export async function sendEmailForward(req, res) {
  const fordward = await uniboxService.sendEmailForward(req.body);
  res.send({ message: "Forward email sent" });
}

export async function openEmails(req, res) {
  const id = req.params.id
  const value = req.body.value
  const OpenedEmail = await uniboxService.OpenedEmails(id, value)
  res.send({ message: "Email Opened successfully" })
}

export async function email_reply_webhook(req, res){
  const isBounce = req?.body?.data?.isBounce;
  if(!isBounce){
    await uniboxService.getEmailUpdated(req?.body)
  }
  res.status(200).send('Received')
}
