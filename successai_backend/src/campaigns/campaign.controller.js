import moment from "moment-timezone";
import * as campaignsService from "./campaign.service.js";
import CampaignStatus from "./enum/campaign-status.enum.js";
import SortBy from "./enum/sort-by.enum.js";
import HttpErrors from "http-errors";
import * as billingService from "../billing/billing.service.js";
import * as uniboxService from "../unibox/unibox.service.js";
import * as utils from "../common/utils/utils.js";
import mongoose from "mongoose";
import * as warmupsService from "../warmup/warmup.service.js";
export async function createCampaign(req, res) {
  const campaign = await campaignsService.createCampaign(
    req.body.name,
    req.user,
    req.body.tz,
    req.body.tzFormat
  );
  res.send({ message: "Campaign created", campaign });
}

export async function getCampaign(req, res) {
  const campaign = await campaignsService.getCampaignById(req.params.id);
  if (!campaign) throw new HttpErrors.NotFound("Campaign not found");
  res.send(campaign);
}

export async function getCampaigns(req, res) {
  const {
    search,
    filter,
    sortBy = SortBy.Date,
    offset = 0,
    limit = 15,
    unibox = false,
    zone
  } = req.query;

  const query = {
    name: new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i"),
    createdBy: req.user,
  };

  if (filter) query.status = filter;

  const options = {
    offset,
    limit,
    sort: sortBy,
    collation: { locale: "en", strength: 2 },
  };
  let start;
  let end;
  if (!unibox) {
    start = moment().tz(zone).subtract(7, 'days').valueOf();
    end = moment().tz(zone).valueOf();
  }

  if (unibox) {
    const campaigns = await campaignsService.getAllCampaign(query, options);
    const campaignsdata = campaigns.map((campaign) => campaign._id);
    const campaignsIds = campaignsdata;
    // console.log("campaign",campaignsIds);
    const filters = {};
    let { perPage = 1000, page = 1, campaignId } = req.query;
    perPage = Number(perPage);
    page = Number(page);
    if (campaignId)
      filters.campaignId = new mongoose.Types.ObjectId(campaignsIds);
    // uniboxService.updateEmailReplies({ filters });
    const { emailList, totalEmailCount } = await uniboxService.getInboxEmails({
      filters,
      perPage,
      page,
      user: req.user,
    });
    if (!emailList) throw new HttpErrors.NotFound("emails not found");

    // campaign_id is present in emailList
    // _id is present in compaign id

    const updatedEmail = campaigns.map((campaign) => {
      const filteredEmails = emailList.filter(
        (email) => email?.campaign_id?.toString() === campaign._id.toString()
      );
      let unreadCount = 0;
      filteredEmails.map((emailObj) => {
        if (emailObj?.portal_email_opened == false && emailObj?.leads) {
          unreadCount = unreadCount + 1;
        }
      });
      return {
        ...campaign,
        // emails: filteredEmails,
        unread_count: unreadCount
      };
    });

    return res.send({ updatedEmail });
  }

  const campaigns = await campaignsService.getCampaignsPaginated(
    query,
    options
  );
  
  await Promise.all(
    campaigns.docs.map(async (campaign) => {
      campaign.analytics = await campaignsService.getCampaignAnalyticsGraphData(
        campaign._id,
        start,
        end,
        zone
      );
      campaign.schedules = await campaignsService.getSchedule({ campaign: campaign._id, });
    })
  );

  res.send(campaigns);
}

export async function getCampaignNames(req, res) {
  const campaigns = await campaignsService.getCampaignNames(req.user);
  res.send(campaigns);
}

export async function getAccountAnalytics(req, res) {
  const { start, end, filter } = req.query;
  const data = await campaignsService.getAccountAnalytics(
    req.user._id,
    start,
    end,
    filter
  );
  res.send(data);
}

export async function getCampaignAnalyticsGraphData(req, res) {
  const { start, end, userTimezone } = req.query;
  const data = await campaignsService.getCampaignAnalyticsGraphData(
    req.params.id,
    start,
    end,
    userTimezone
  );
  res.send(data);
}

export async function updateCampaign(req, res) {
  const updatedCampaign = await campaignsService.updateCampaign(
    req.params.id,
    req.body
  );
  res.send({ message: "Campaign updated", campaign: updatedCampaign });
}

export async function pauseCampaign(req, res) {
  const updatedCampaign = await campaignsService.updateCampaign(req.params.id, {
    status: CampaignStatus.Paused,
  });
  res.send({ message: "Campaign paused", campaign: updatedCampaign });
}

export async function resumeCampaign(req, res) {
  const { monthlyEmails } = await billingService.findUserPlanUsage(req.user);
  if (monthlyEmails < 1)
    throw new HttpErrors.BadRequest(
      "Insufficient balance left for montly emails"
    );
  const updatedCampaign = await campaignsService.updateCampaign(req.params.id, {
    status: CampaignStatus.Active,
    errorMsg: "",
  });
  res.send({ message: "Campaign resumed", campaign: updatedCampaign });
}

export async function deleteCampaign(req, res) {
  const campaign = await campaignsService.deleteCampaign(req.params.id);
  res.send({ message: "Campaign deleted", campaign });
}

export async function createLeads(req, res) {
  const createdLeads = await campaignsService.createLeads(
    req.body,
    req.params.id,
    req.user._id
  );
  const {
    leadsResponse,
    blockLeadsCount,
    bouncedLeadsCount
  } = createdLeads;
  res.send({
    message: `${leadsResponse.length} Lead(s) added and ${bouncedLeadsCount} bounced lead(s) skipped.`,
    createdLeads: leadsResponse,
    blockLeadsCount
  });
}

export async function duplicateCheck(req, res) {
  const createdLeads = await campaignsService.duplicateCheck(
    req.body,
    req.params.id,
    req.user._id
  );
  res.send({ createdLeads });
}

export async function getLeads(req, res) {
  const { search, filter, offset = 0, limit = 15 } = req.query;

  const query = {
    $or: [
      { firstName: new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
      { lastName: new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
      { email: new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
    ],
    campaign: req.params.id,
  };

  if (filter) query.status = filter;

  const options = { offset, limit };

  const leads = await campaignsService.getLeadsPaginated(query, options);

  res.send(leads);
}

export async function createSequence(req, res) {
  const sequence = await campaignsService.createSequence(
    req.body,
    req.params.id,
    req.user._id
  );
  res.send({ message: "Sequence created", sequence });
}

export async function copySequence(req, res) {
  const sequence = await campaignsService.copySequence(req.params.id);
  res.send({ message: "Sequence copied", sequence });
}

export async function updateSequence(req, res) {
  const sequence = await campaignsService.updateSequence(
    req.params.id,
    req.body
  );
  res.send({ message: "Sequence updated", sequence });
}

export async function updateSequenceOrder(req, res) {
  await campaignsService.updateSequenceOrder(req.params.id, req.body);
  res.send({ message: "Sequence order updated" });
}

export async function deleteSequence(req, res) {
  const sequence = await campaignsService.deleteSequence(req.params.id);
  res.send({ message: "Sequence deleted", sequence });
}

export async function createSchedule(req, res) {
  const schedule = await campaignsService.createSchedule(
    req.body,
    req.params.id,
    req.user._id
  );
  res.send({ message: "Schedule created", schedule });
}

export async function updateSchedule(req, res) {
  const schedule = await campaignsService.updateSchedule(
    req.params.id,
    req.body
  );
  res.send({ message: "Schedule updated", schedule });
}

export async function deleteSchedule(req, res) {
  const schedule = await campaignsService.deleteSchedule(req.params.id);
  res.send({ message: "Schedule deleted", schedule });
}

export async function getTemplates(req, res) {
  const templates = await campaignsService.getTemplates();
  res.send(templates);
}

export async function createTemplates(req, res) {
  const templates = await campaignsService.createTemplates(req.body, req.user);
  res.send({
    message: "Template Created",
    templates,
  });
}

export async function setOptions(req, res) {
  const { campaignID, options } = req.body;
  const optionsUpdate = await campaignsService.setOptions(campaignID, options);
  res.send({
    message: "Configuration updated",
  });
}

export async function setTestOptions(req, res) {
  const { campaignID, test } = req.body;
  const optionsUpdate = await campaignsService.setTestptions(campaignID, test);
  res.send({
    message: "Email Sent",
  });
}

export async function getEmailBody(req, res) {
  const { prompt } = req.body;
  const body = await campaignsService.getEmailBody(prompt, req.user);
  res.send({
    body,
  });
}

export async function optimizeEmailBody(req, res) {
  const { email } = req.body;
  const body = await campaignsService.optimizeEmailBody(email, req.user);
  res.send({
    body,
  });
}

export async function getVariables(req, res) {
  const variables = await campaignsService.getVariables(req.params.id);
  res.send({
    variables,
  });
}

export async function launchCampaign(req, res) {
  const { monthlyEmails } = await billingService.findUserPlanUsage(req.user);
  if (monthlyEmails < 1)
    throw new HttpErrors.BadRequest(
      "Insufficient balance left for montly emails"
    );
  const launch = await campaignsService.launchCampaign(req.params.id, req.body.step, req.body.reciepient);
  return res.send({ message: "Campaign launched successfully", launch });
}

export async function getOpenTrack(req, res) {
  try {
    await campaignsService.getOpenTrack(req.params.id);
    return res.send({ message: "Email open successfully" });
  } catch (err) {
    return res.send({ message: "Email open successfully" });
  }
}

export async function getUnsubTrack(req, res) {
  try {
    const url = await campaignsService.getUnsubTrack(req.params.id);
    res.redirect(url);
  } catch (err) {
    res.redirect(url);
  }
}

export async function getClickTrack(req, res) {
  const clickTrackResult = await campaignsService.getClickTrack(
    req.params.id,
    req.params.mongoDBId
  );

  if (clickTrackResult && clickTrackResult.redirectLink) {
    const url = await utils.ensureHttpsUrl(clickTrackResult.redirectLink)
    return res.redirect(url);
  } else {
    // console.log('RedirectLink not found');
  }
}

// export async function generateDynamicContent(req, res) {
//   const dynamicContent = await campaignsService.findBounceMail();
//   res.send({ dynamicContent });
// }

export async function getCampaignAnalytics(req, res) {
  const { filters, limit = 10, offset = 0, search, type } = req.query;
  const [stepsAnalytics, campaignActivity] = await Promise.all([
    campaignsService.getCampaignStepsAnalytics(
      req.params.id
    ),
    campaignsService.getCampaignActivity(
      req.params.id,
      {
        filters,
        limit,
        offset,
        search,
        type
      }
    ),
  ])
  // const stepsAnalytics = await campaignsService.getCampaignStepsAnalytics(
  //   req.params.id
  // );
  // const campaignActivity = await campaignsService.getCampaignActivity(
  //   req.params.id,
  //   {
  //     filters,
  //     limit,
  //     offset,
  //     search,
  //   }
  // );
  res.send({ message: "Campaign Analytics", stepsAnalytics, campaignActivity });
}

export async function getAnalytics(req, res) {
  const { filter } = req.query;
  const [campaignAnalytics, accountAnalytics] = await Promise.all([
    campaignsService.fetchAnalyticsByCampaign(
      req.user,
      filter
    ),
    campaignsService.fetchAnalyticsByAccount(
      req.user
    ),
  ])
  // const campaignAnalytics = await campaignsService.fetchAnalyticsByCampaign(
  //   req.user,
  //   filter
  // );
  // const accountAnalytics = await campaignsService.fetchAnalyticsByAccount(
  //   req.user
  // );

  res.send({ campaignAnalytics, accountAnalytics });
}

export async function createLabel(req, res) {
  const label = await campaignsService.createLabel(req.body, req.user);
  res.send({ message: "Label created" });
}

export async function getLabels(req, res) {
  let labels = await campaignsService.getLables(req.user);
  const labeldata = labels.map((label) => label._id);
  const labelIds = labeldata;
  const filters = {};
  let { perPage = 1000, page = 1, label } = req.query;
  perPage = Number(perPage);
  page = Number(page);
  if (label) filters.label = new mongoose.Types.ObjectId(labelIds);
  // uniboxService.updateEmailReplies({ filters });
  const { emailList, totalEmailCount } = await uniboxService.getInboxEmails({
    filters,
    perPage,
    page,
    user: req.user,
  });

  if (!emailList) throw new HttpErrors.NotFound("emails not found");

  const updatedLabels = labels.map((label) => {
    const filteredEmails = emailList.filter(
      (email) => email?.label?.toString() === label?._id.toString()
    );
    let unreadCount = 0;
    filteredEmails.map((emailObj) => {
      if (emailObj.email_opened == false) {
        unreadCount = unreadCount + 1;
      }
    });

    return {
      ...label._doc,
      details: filteredEmails,
      unread_count: unreadCount,
    };
  });

  labels = updatedLabels;
  res.send({ labels });
}

export async function updateCampaignEmail(req, res) {
  const updatelabel = await campaignsService.updateCampaignEmail(
    req.params.campaignEmailId,
    req.params.labelId
  );
  res.send({ message: "Label updated" });
}

export async function findBounceMail_webhook(req, res){
  await campaignsService.findBounceMail(req?.body?.data)
  res.status(200).send('Received')
}

export async function emailSending_webhook(req, res) {
  try {
    try {
      await warmupsService.emailSending_webhook(req?.body?.data);
    } catch (error) {
      console.error('Error in emailSending_webhook (warmupsService):', error);
    }

    try {
      await campaignsService.emailSending_webhook(req?.body?.data);
    } catch (error) {
      console.error('Error in emailSending_webhook (campaignsService):', error);
    }

    res.status(200).send('Sent');
  } catch (error) {
    console.error('Error in emailSending_webhook:', error);
  }
}

export async function emailRejection_webhook(req, res){
  await campaignsService.emailRejection_webhook(req?.body);
  res.status(200).send('Received')
}

