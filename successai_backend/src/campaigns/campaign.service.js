import CampaignSchedule from "./models/campaign-schedule.model.js";
import CampaignSequence from "./models/campaign-sequence.model.js";
import CampaignActivity from "./models/campaign-activity.model.js";
import Campaign from "./models/campaign.model.js";
import Template from "./models/templates.models.js";
import HttpErrors from "http-errors";
import * as billingService from "../billing/billing.service.js";
import * as openaiService from "../common/services/openai.service.js";
import * as leadsService from "../leads/leads.service.js";
import Variables from "./enum/campaign-variables.js";
import LeadsCampaign from "../leads/models/leads-campaign.model.js";
import * as utils from "../common/utils/utils.js";
import CampaignStatus from "./enum/campaign-status.enum.js";
import CampaignActivityType from "./enum/campaign-activity-type.enum.js";
import CampaignEmail from "./models/campaign-email.model.js";
import moment from "moment-timezone";
import LinkTrack from "./models/campaign-link-track.models.js";
import * as accountService from "../account/account.service.js";
import { v4 as uuidv4 } from "uuid";
import {
  sendCampaignEmail,
  checkEmailConfig,
  sendTestEmail
} from "../common/services/smtp.service.js";
import jsdom from "jsdom";
import { ImapFlow } from "imapflow";
import mailparser from "mailparser";
import LeadStatus from "../leads/enum/lead-status.enum.js";
import logger from "../common/utils/logger.js";
import mongoose from "mongoose";
import Account from "../account/models/account.model.js";
import * as warmupService from '../warmup/warmup.service.js';
import * as uniboxService from "../unibox/unibox.service.js";
import * as mailerService from "../mailer/mailer.service.js"
import _ from "lodash";
import Provider from "../account/enum/provider.enum.js";
import CampaignEmailLabel from './models/campaign-email-label.model.js';
import User from "../user/models/user.model.js";
import UserPlan from "../billing/models/user-plan.model.js";
import { addOrUpdateEmailAnalytics } from "../monitor/monitor.service.js";
import WarmupEmail from "../warmup/models/warmup-email.model.js";
import QueueCampaign from "./models/queue-campagin.model.js";
import ErrorLog from "./models/email-error-logs.model.js";
// import Constants from "../common/utils/constants.js";
// import { generateIntercomEvent } from "../common/utils/intercom.js";
const { JSDOM } = jsdom;

export async function createCampaign(name, user, tz, tzFormat) {
  const options = {
    emailAccounts: [],
    dailyMaxLimit: "20",
    stopOnReply: true,
    stopOnAutoReply: true,
    trackOpen: true,
    trackClickedLink: false,
    textOnly: false,
  };

  const startDate = moment.tz(new Date(), tz).startOf("day").toDate();
  const endDate = moment.tz(new Date(), tz).add(1, "days").endOf("day").toDate();
  const campaign = await Campaign.create({
    name,
    options,
    createdBy: user,
    startDate,
    endDate,
  });
  await createSchedule(
    {
      name: "Default",
      isDefault: true,
      from: "9:00 AM",
      to: "6:00 PM",
      timezone: tzFormat,
    },
    campaign,
    user
  );
  await populateCampaignSchedule(campaign)
  return campaign;
}

export async function getCampaignById(id) {
  return Campaign.findById(id).populate("schedules").populate("sequences");
}

export function getCampaign(filter) {
  return Campaign.findOne(filter);
}

export function getCampaignNames(user) {
  return Campaign.find({ createdBy: user }).select("name");
}

export function getAllCampaign(query, options) {
  return Campaign.find(query).sort({ createdAt: -1 });
}

export function getAllCampaignById(query, email) {
  return Campaign.find({
    ...query,
    'options.emailAccounts': email,
  }).sort({ createdAt: -1 });
}



export async function getAccountAnalytics(id, start, end, filter) {
  const startDate = new Date(parseInt(start));
  const endDate = new Date(parseInt(end));
  const query = {};

  query.createdBy = id;

  switch (filter) {
    case CampaignStatus.Paused:
      query.status = CampaignStatus.Paused;
      break;

    case CampaignStatus.Completed:
      query.status = CampaignStatus.Completed;
      break;

    case CampaignStatus.Active:
      query.status = CampaignStatus.Active;
      break;
  }

  const campaigns = await Campaign.find(query).select("_id");

  const graph = await CampaignActivity.aggregate([
    {
      $match: {
        campaign_id: { $in: campaigns.map((campaign) => campaign._id) },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        sent: {
          $sum: { $cond: { if: { $eq: ["$type", "sent"] }, then: 1, else: 0 } },
        },
        open: {
          $sum: { $cond: { if: { $eq: ["$type", "open"] }, then: 1, else: 0 } },
        },
        uniqueOpen: {
          $sum: {
            $cond: { if: { $eq: ["$type", "unique_open"] }, then: 1, else: 0 },
          },
        },
        reply: {
          $sum: {
            $cond: { if: { $eq: ["$type", "reply"] }, then: 1, else: 0 },
          },
        },
        click: {
          $sum: {
            $cond: { if: { $eq: ["$type", "click"] }, then: 1, else: 0 },
          },
        },
        uniqueClick: {
          $sum: {
            $cond: { if: { $eq: ["$type", "unique_click"] }, then: 1, else: 0 },
          },
        },
      },
    },
  ]);

  const total = await CampaignActivity.aggregate([
    {
      $match: {
        campaign_id: { $in: campaigns.map((campaign) => campaign._id) },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        sent: {
          $sum: { $cond: { if: { $eq: ["$type", "sent"] }, then: 1, else: 0 } },
        },
        open: {
          $sum: { $cond: { if: { $eq: ["$type", "open"] }, then: 1, else: 0 } },
        },
        reply: {
          $sum: {
            $cond: { if: { $eq: ["$type", "reply"] }, then: 1, else: 0 },
          },
        },
        click: {
          $sum: {
            $cond: { if: { $eq: ["$type", "click"] }, then: 1, else: 0 },
          },
        },
        opportunities: {
          $addToSet: {
            $cond: {
              if: { $eq: ["$type", "reply"] },
              then: "$lead_id",
              else: "$$REMOVE",
            },
          },
        },
      },
    },
    {
      $addFields: {
        opportunities: { $size: "$opportunities" },
      },
    },
  ]);

  return { graph, total: total[0] };
}

export async function getCampaignAnalyticsGraphData(id, start, end, userTimezone) {
  let startDate = utils.convertTimestampToTimezone(start, userTimezone);
  let endDate = utils.convertTimestampToTimezone(end, userTimezone)
  startDate = moment(parseInt(startDate)).startOf("day").toDate();
  endDate = moment(parseInt(endDate)).endOf("day").toDate();
  const graph = await CampaignActivity.aggregate([
    {
      $match: {
        campaign_id: new mongoose.Types.ObjectId(id),
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: userTimezone } },
        sent: {
          $sum: { $cond: { if: { $eq: ["$type", "sent"] }, then: 1, else: 0 } },
        },
        open: {
          $sum: { $cond: { if: { $eq: ["$type", "open"] }, then: 1, else: 0 } },
        },
        uniqueOpen: {
          $sum: {
            $cond: { if: { $eq: ["$type", "unique_open"] }, then: 1, else: 0 },
          },
        },
        reply: {
          $sum: {
            $cond: { if: { $eq: ["$type", "reply"] }, then: 1, else: 0 },
          },
        },
        click: {
          $sum: {
            $cond: { if: { $eq: ["$type", "click"] }, then: 1, else: 0 },
          },
        },
        uniqueClick: {
          $sum: {
            $cond: { if: { $eq: ["$type", "unique_click"] }, then: 1, else: 0 },
          },
        },
      },
    },
  ]);

  const total = await CampaignActivity.aggregate([
    {
      $match: {
        campaign_id: new mongoose.Types.ObjectId(id),
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        sent: {
          $sum: { $cond: { if: { $eq: ["$type", "sent"] }, then: 1, else: 0 } },
        },
        open: {
          $sum: { $cond: { if: { $eq: ["$type", "open"] }, then: 1, else: 0 } },
        },
        reply: {
          $sum: {
            $cond: { if: { $eq: ["$type", "reply"] }, then: 1, else: 0 },
          },
        },
        click: {
          $sum: {
            $cond: { if: { $eq: ["$type", "click"] }, then: 1, else: 0 },
          },
        },
        opportunities: {
          $addToSet: {
            $cond: {
              if: { $eq: ["$type", "reply"] },
              then: "$lead_id",
              else: "$$REMOVE",
            },
          },
        },
      },
    },
    {
      $addFields: {
        opportunities: { $size: "$opportunities" },
      },
    },
  ]);

  return { start, end, graph, total: total[0] };
}

export function getCampaignsPaginated(query, options) {
  return Campaign.paginate(query, options);
}

export async function getCampaignStats(campaign) {
  let sent = 0;
  let open = 0;
  let replied = 0;
  const campaignEmail = await CampaignEmail.find({
    campaign,
  });

  if (campaignEmail.length <= 0)
    return {
      sent,
      open,
      replied,
    };

  sent = campaignEmail.length;
  const totalOpen = campaignEmail.filter((item) => item.email_opened === true);
  //const totalReply = campaignEmail.filter(item => item.replies.length > 1)

  return {
    sent,
    open: totalOpen.length,
    replied: replied,
  };
}

export async function updateCampaign(id, update) {

  if (update?.startDate)
    update.startDate = moment.tz(update?.startDate, update.tz).toDate();

  if (update?.endDate)
    update.endDate = moment.tz(update?.endDate, update.tz).toDate();
  console.log("updating campaign..........", id);
  const campaign = await Campaign.findByIdAndUpdate(id, update, { new: true });
  if (campaign.status != CampaignStatus.Error) {
    campaign.campainErrorEmailSent = false;
    campaign.save();
  }
  if (!campaign) throw new HttpErrors.NotFound("Campaign not found");
  await populateCampaignSchedule(campaign)
  return campaign;
}


export async function updateTest(id, update) {
  const testEmailAccounts = update?.testOptions?.testEmailAccounts;

  if (testEmailAccounts !== undefined) {
    console.log("updates test campaign..........", id);
    const campaign = await Campaign.findByIdAndUpdate(
      id,
      { $set: { "test.testEmailAccounts": testEmailAccounts } },
      { new: true }
    );

    if (!campaign) throw new HttpErrors.NotFound("Campaign not found");
    return campaign;
  } else {
    throw new HttpErrors.BadRequest("testEmailAccounts field is required for update");
  }
}

export async function deleteCampaign(id) {
  const campaign = await Campaign.findByIdAndDelete(id);
  if (!campaign) throw new HttpErrors.NotFound("Campaign not found");
  await CampaignSchedule.deleteMany({ campaign });
  await CampaignSequence.deleteMany({ campaign });
  await LeadsCampaign.deleteMany({ campaign })
  await CampaignActivity.deleteMany({ campaign_id: campaign })
  return campaign;
}

export async function createLeads(data, campaign, user) {
  let { leads } = data;
  const value = data.value
  let blockedLeads = 0;
  let bounceLeads = 0;
  const blocklistEmails = await warmupService.getBlockListEmailByUser(user);
  const bouncedLeadEmails = await leadsService.getBouncedEmails()
const filterLeads = _.compact(
  leads.map((data) => {
    const leadData = {
      ...data,
      campaign,
      createdBy: user,
    };

    if (value === true) {
      leadData.test = true;
    }

    if (data.remainingData) {
      const remainingDataVariables = Object.entries(data.remainingData).map(([variableTitle, variableValue]) => ({
        variableTitle,
        variableValue,
      }));

      if (leadData.variables) {
        leadData.variables = leadData.variables.concat(remainingDataVariables);
      } else {
        leadData.variables = remainingDataVariables;
      }
    }
    if(!value){
      if (blocklistEmails.includes(data.email)) {
        blockedLeads = blockedLeads + 1;
        return null;
      } else if (bouncedLeadEmails.includes(data.email)) {
        bounceLeads = bounceLeads + 1;
        return null;
      } else {
        return leadData;
      }
    } else{
      return leadData;
    }
  })
  );
  const totalLeadsToAdded = filterLeads.length;
  await checkActiveLeadsCount(user, totalLeadsToAdded);

  const leadsResponse = await LeadsCampaign.insertMany(filterLeads);
  return {
    leadsResponse,
    blockLeadsCount: blockedLeads,
    bouncedLeadsCount: bounceLeads,
  }
}

export async function duplicateCheck(data, campaign, user) {
  const { leads: leadsData, checkDuplicates, stats } = data;
  const emails = leadsData.map((lead) => lead.email);

  let filteredLeads;

  if (checkDuplicates) {
    const existingLeads = await LeadsCampaign.find({
      email: { $in: emails },
      createdBy: user,
    }).select("email");

    filteredLeads = leadsData.filter(
      (lead) =>
        !existingLeads.some((existingLead) => existingLead.email === lead.email)
    );

  } else {
    const existingLeads = await LeadsCampaign.find({
      email: { $in: emails },
      campaign,
    }).select("email");

    filteredLeads = leadsData.filter(
      (lead) =>
        !existingLeads.some((existingLead) => existingLead.email === lead.email)
    );
  }
    //To calculate unique emails accross all campaigns
    const uniqueEmails1 = new Set(filteredLeads.map(obj => obj.email));
    const emailsNotInSecondArray = emails.filter(email => !uniqueEmails1.has(email));
    const emailCampaignCount = new Set(emailsNotInSecondArray).size;

    // Create a Set to store unique emails
    const duplicateEmailsCount = Object.values(
      emails.reduce((counts, email) => {
        counts[email] = (counts[email] || 0) + 1;
        return counts;
      }, {})
    ).filter(count => count >= 2).length;

  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  let leads = _.compact(
    filteredLeads.map((data) => {
      if (data.email)
        if (emailRegex.test(data.email))
          return {
            ...data,
            campaign,
            createdBy: user,
          };
        else return null;
    })
  );

  leads = Array.from(new Map(leads.map(lead => [lead.email, lead])).values());
  const uploadedCount = leads.length;
  return {emailCampaignCount,duplicateEmailsCount, uploadedCount, leads};
}

export async function checkActiveLeadsCount(user, addedLeads) {
  const { activeLeads } = await billingService.findUserPlanUsage(user);
  const usedActiveLeads = await uniboxService.getUserLeadsCount({ user });
  const totalLeads = usedActiveLeads + addedLeads;
  if (totalLeads > activeLeads) {
    throw new HttpErrors.BadRequest("Insufficient active leads credit balance");
  }
}

export async function getLeadsPaginated(query, options) {
  // Comment below line to improve performance as we are not using returned values
  // await getVariables(query.campaign)
  const leadsIds = await leadsService.getLeadsIds(query.campaign);
  const total = leadsIds.length
  const campaignEmails = await CampaignEmail.find({
    campaign_id: query.campaign,
    lead_id: { $in: leadsIds },
  })
    .select(["lead_id", "sequence_id", "sequence_step", "createdAt"])
    .sort({ createdAt: -1 });
  const paginatedLeads =  await LeadsCampaign.paginate(query, options);

  const filteredLeads = paginatedLeads.total;
  const mergedData = paginatedLeads.docs.filter(lead => !lead.test).map((lead) => {
    const correspondingEmail = campaignEmails.find((email) => email?.lead_id.toString() === lead?._id.toString());
  
    if (correspondingEmail) {
      return {
        ...lead.toObject(),
        sequence_id: correspondingEmail.sequence_id,
        sequence_step: correspondingEmail.sequence_step,
        emailCreatedAt: correspondingEmail.createdAt,
      };
    } 
    return lead.toObject();
  });  
 const {limit, offset} = options;
  return {docs: mergedData, total, limit, offset, filteredLeads};
}

export async function createSequence(data, campaign, user) {
  const step = (await CampaignSequence.countDocuments({ campaign })) + 1;
  return CampaignSequence.create({ ...data, step, campaign, createdBy: user });
}

export async function copySequence(id) {
  const sequence = await CampaignSequence.findById(id);
  if (!sequence) throw new HttpErrors.NotFound("Sequence not found");

  const copy = await CampaignSequence.create({
    step: sequence.step + 1,
    subject: sequence.subject,
    body: sequence.body,
    waitDays: sequence.waitDays,
    campaign: sequence.campaign,
    createdBy: sequence.createdBy,
  });

  // update steps
  await CampaignSequence.updateMany(
    {
      _id: { $ne: copy._id },
      step: { $gte: copy.step },
      campaign: copy.campaign,
    },
    {
      $inc: { step: 1 },
    }
  );

  return copy;
}

export function getSequence(filter) {
  return CampaignSequence.findOne(filter);
}

export function getLastSequence(filter) {
  return CampaignSequence.findOne(filter, { step: 1 }).sort({ step: -1 });
}

export async function updateSequence(id, update) {
  const sequence = await CampaignSequence.findByIdAndUpdate(id, update, {
    new: true,
  });
  if (!sequence) throw new HttpErrors.NotFound("Sequence not found");
  return sequence;
}

export async function updateSequenceOrder(campaign, { fromStep, toStep }) {
  if (fromStep === toStep) {
    throw new HttpErrors.BadRequest("From and to step must be different");
  }

  const sequenceCount = await CampaignSequence.countDocuments({ campaign });
  if (fromStep > sequenceCount || toStep > sequenceCount) {
    throw new HttpErrors.BadRequest("Invalid from and to step");
  }

  const sequence = await CampaignSequence.findOne({ step: fromStep, campaign });
  if (!sequence) throw new HttpErrors.NotFound("Sequence not found");
  
  const campaignData = await Campaign.findById(campaign);

  if (campaignData.isLaunched)
    throw new HttpErrors.BadRequest(
      "Unable to update order for launched campaigns"
    );

  if (fromStep < toStep) {
    await CampaignSequence.updateMany(
      {
        step: { $gt: fromStep, $lte: toStep },
        campaign,
      },
      {
        $inc: { step: -1 },
      }
    );
  }

  if (fromStep > toStep) {
    await CampaignSequence.updateMany(
      {
        step: { $gte: toStep, $lt: fromStep },
        campaign,
      },
      {
        $inc: { step: 1 },
      }
    );
  }

  sequence.step = toStep;
  await sequence.save();
}

export async function deleteSequence(id) {
  const sequence = await CampaignSequence.findByIdAndDelete(id);
  if (!sequence) throw new HttpErrors.NotFound("Sequence not found");

  // update steps
  await CampaignSequence.updateMany(
    {
      step: { $gt: sequence.step },
      campaign: sequence.campaign,
    },
    {
      $inc: { step: -1 },
    }
  );

  return sequence;
}

export function createSchedule(data, campaign, user) {
  return CampaignSchedule.create({
    ...data,
    campaign,
    createdBy: user,
  });
}

export function getSchedule(filter) {
  return CampaignSchedule.findOne(filter);
}

export async function updateSchedule(id, update) {
  const schedule = await CampaignSchedule.findByIdAndUpdate(id, update, {
    new: true,
  });
  if (!schedule) throw new HttpErrors.NotFound("Schedule not found");
  await CampaignSchedule.updateMany(
    {
      _id: { $ne: schedule._id },
      campaign: schedule.campaign,
      isDefault: true,
    },
    { isDefault: false },
    { new: true }
  );
  const campaign = await Campaign.findById({_id: schedule?.campaign})
  await populateCampaignSchedule(campaign)
  return schedule;
}

export async function deleteSchedule(id) {
  const schedule = await CampaignSchedule.findByIdAndDelete(id);
  if (!schedule) throw new HttpErrors.NotFound("Schedule not found");
  await CampaignSchedule.findOneAndUpdate(
    {
      campaign: schedule.campaign,
    },
    {
      $set: { isDefault: true },
    }
  );
  const campaign = await Campaign.findById({_id: schedule?.campaign})
  await populateCampaignSchedule(campaign)
  return schedule;
}

export async function getTemplates() { 
  const template = await Template.find();
  return template;
}

export async function setOptions(campaignID, options) {
  return updateCampaign(campaignID, {
    options,
  });
}
export async function setTestptions(campaignID, testOptions) {
  return updateTest(campaignID, {
    testOptions,
  });
}

export async function getEmailBody(prompt, user) {
  const { aiWriterCredits } = await billingService.findUserPlanUsage(user);
  if (aiWriterCredits < 1)
    throw new HttpErrors.BadRequest("Insufficient ai credit left");
  const body = await openaiService.generateEmail(prompt);
  await billingService.updateUserUsage(user, {
    aiWriterCredits: aiWriterCredits - 1,
  });
  return body;
}

export async function optimizeEmailBody(email, user) {
  const { aiWriterCredits } = await billingService.findUserPlanUsage(user);
  if (aiWriterCredits < 1)
    throw new HttpErrors.BadRequest("Insufficient ai credit left");
  const body = await openaiService.optimizeEmail(email);
  await billingService.updateUserUsage(user, {
    aiWriterCredits: aiWriterCredits - 1,
  });
  return body;
}

export async function getVariables(id) {
  const leads = await leadsService.getLeads(id);
  // add customfield in campaign variable 
  const customVariablesSet = new Set();

  leads.forEach((item) => {
    item.variables.forEach((vari) => {
      customVariablesSet.add(vari.variableTitle);
    });
  });

  const uniqueCustomVariables = Array.from(customVariablesSet);

  uniqueCustomVariables.forEach((variable, index) => {
    const isLast = index === uniqueCustomVariables.length - 1;
  });

  const mergedVariables = [...Variables, ...uniqueCustomVariables];
  const dependentVariables = checkKeysNotNullAndNotEmptyArray(leads, mergedVariables);
  const conditionallyIncludedVariables = [];

  if (leads.length === 0) {
    conditionallyIncludedVariables.push(
      { key: "Signature", value: "{{signature}}" },
      { key: "Sender Name", value: "{{senderName}}" }
    );
  }

  if (leads.length === 0) {
    return conditionallyIncludedVariables
  } else {
    return dependentVariables
  }
}

function checkKeysNotNullAndNotEmptyArray(dataArray, keysToCheck) {
  const uniqueKeys = [];
  const variables = [];

  for (const data of dataArray) {
    for (let key in keysToCheck) {
      const keyValue = data[keysToCheck[key]];
      if (
        keyValue !== null &&
        keyValue !== "" &&
        !uniqueKeys.includes(keysToCheck[key])
      ) {
        uniqueKeys.push(keysToCheck[key]);
      }
    }
    if (
      uniqueKeys.every((value) => keysToCheck.includes(value)) &&
      uniqueKeys.length === keysToCheck.length
    )
      break;
  }
  uniqueKeys.forEach(async (elemnent) => {
    const formattedKey = await utils.changeStringToUpperCaseAndBreak(elemnent);
    variables.push({ key: formattedKey, value: "{{" + elemnent + "}}" });

  });

  return variables;
}

export async function getOpenTrack(id) {
  const { campaign_id, sequence_id, lead_id, from, sequence_step, _id } =
    await CampaignEmail.findOneAndUpdate(
      {
        unique_id: id,
        email_opened: false,
        email_bounced: false,
      },
      {
        email_opened: true,
        email_opened_on: moment().toDate(),
      }
    );

  return createActivity({
    campaign_id,
    sequence_id,
    lead_id,
    type: CampaignActivityType.Opened,
    account_id: from,
    sequence_step,
    campaign_email_id: _id,
  });
}

export async function getUnsubTrack(id) {
  const data = await CampaignEmail.findOneAndUpdate(
    { unique_id: id, email_unsub: false },
    {
      email_unsub: true,
      email_unsub_on: moment().toDate(),
    }
  );

  if (!data) {
    return process.env.CLIENT_APP_UNSUBS_URL;
  }

  const { campaign_id, sequence_id, lead_id, from, sequence_step, _id } = data;

  await leadsService.updateLead(lead_id, {
    status: LeadStatus.Unsubscribe,
  });

  await createActivity({
    campaign_id,
    sequence_id,
    lead_id,
    type: CampaignActivityType.Unsubscribe,
    account_id: from,
    sequence_step,
    campaign_email_id: _id,
  });

  return process.env.CLIENT_APP_UNSUBS_URL;
}

export async function getClickTrack(id, mongoDbId) {
  const data = await CampaignEmail.findOneAndUpdate(
    {
      unique_id: id,
      email_clicked: false,
    },
    {
      email_clicked: true,
      email_clicked_on: moment().toDate(),
    }
  );

  if (!data) {
    return LinkTrack.findByIdAndUpdate(mongoDbId, {
      isRedirect: true,
    });
  }

  const { campaign_id, sequence_id, lead_id, from, sequence_step, _id } = data;

  await createActivity({
    campaign_id,
    sequence_id,
    lead_id,
    type: CampaignActivityType.Click,
    account_id: from,
    sequence_step,
    campaign_email_id: _id,
  });

  return LinkTrack.findByIdAndUpdate(mongoDbId, {
    isRedirect: true,
  });
}

export async function getDynamicSequence(data) {
  const { id, campaignId, leadId, sequenceId, customDomainLink = null, senderEmail } = data;
  const { options } = await Campaign.findById(campaignId);
  const { subject, body, step } = await CampaignSequence.findById(sequenceId);

  let dynamicSubject = "";
if (subject === "" && step > 1) {
  let currentStep = step - 1;
  let foundSubject = false;

  while (currentStep >= 1 && !foundSubject) {
    const sequence = await CampaignSequence.findOne({
      campaign: campaignId,
      step: currentStep,
    });

    if (sequence && sequence.subject !== "") {
      dynamicSubject = sequence.subject;
      foundSubject = true;
    } else {
      currentStep--;
    }
  }

  if (!foundSubject) {
    dynamicSubject = "";
  }
} else {
  dynamicSubject = subject;
}
  const lead = await leadsService.getLead(leadId);
  const account = await Account.findOne({ email: senderEmail }, 'name signature').exec()

  const senderName = account.name.first + ' ' + account.name.last;
  const signature = account.signature;

  const senderData = { senderName: senderName, signature: signature }

  let subjectConverted = await utils.replaceVariables(dynamicSubject, lead, senderData);

  let bodyConverted = await utils.replaceVariables(body, lead, senderData);

  let trackingLink = process.env.TRACKING_LINK;
  if (customDomainLink) {
    trackingLink = await utils.ensureHttpsUrl(customDomainLink);
  }
  // const idBase64 = Buffer.from(id, 'utf-8').toString('base64');
  // const shortenedId = idBase64.substring(0, 8);
  // const unsubLink = `${trackingLink}unsubscribe/${shortenedId}`;
  const unsubLink = `${trackingLink}/api/campaigns/track/unsubscribe/${id}`;
  bodyConverted = await replaceLinks(id, bodyConverted, options.trackClickedLink, trackingLink, unsubLink);
  
  if (options.trackOpen && !options.textOnly) {
    bodyConverted += `<br><br><img src="${trackingLink}/api/campaigns/track/${id}" width="1" height="1" border="0" alt="" />`;
  }

  return {
    subject: subjectConverted,
    body: bodyConverted,
    type: options.textOnly ? "text" : "html",
  };
}

export async function replaceLinks(id, inputString, trackClick, trackingLink, unsubLink = "") {
  const dom = new JSDOM(inputString);
  const doc = dom.window.document;
  const anchorTags = doc.querySelectorAll("a");
  if (!anchorTags) return inputString;

  for (const anchor of anchorTags) {

    if (anchor.getAttribute("href") === "UNSUBSCRIBE") {
      anchor.setAttribute("href", unsubLink);
      continue;
    }

    if (trackClick) {
      const { _id } = await LinkTrack.create({
        redirectLink: anchor.getAttribute("href"),
      });
      
      const link = trackingLink + "/api/campaigns/track/clicked/" + id + "/" + _id;
      anchor.setAttribute("href", link);

    }
  }

  // Serialize the modified DOM back to an HTML string
  const modifiedHtmlString = dom.serialize();
  return modifiedHtmlString;
}

// export async function findBounceMail() {
//   const campaignData = await CampaignEmail.find({
//     email_bounced: false,
//   }).sort("-createdAt");

//   for (const campaign of campaignData) {
//     const lead = await leadsService.getLead(campaign.lead_id);

//     const data = await accountService.findById(campaign.from);
//     if (!data) continue;
//     const { email } = data;
//     const config = await accountService.getAccountImapSettings({ email });
//     const client = new ImapFlow(config);
//     await client.connect();
//     await client.mailboxOpen("INBOX");
//     const message = campaign.message_id.replaceAll("<", "").replaceAll(">", "");
//     let searchParam = {
//       on: new Date(),
//     };
//     if (data.provider == Provider.Microsoft_OAuth) {
//       searchParam.text = `X-Microsoft-Original-Message-ID: ${campaign.message_id}`;
//     } else {
//       searchParam.or = [
//         {
//           subject: "Delivery Status Notification (Delay)",
//           body: lead.email,
//         },
//         {
//           subject: "Delivery Status Notification (Failure)",
//           body: lead.email,
//         },
//         {
//           header: { "X-Failed-Recipients": lead.email },
//         },
//       ];
//     }
//     const searchResults = await client.search(searchParam);
//     if (searchResults?.length > 0) {
//       const { campaign_id, sequence_id, lead_id, from, sequence_step, _id } =
//         await CampaignEmail.findByIdAndUpdate(campaign._id, {
//           email_bounced: true,
//           email_bounced_on: moment().toDate(),
//           email_opened: false,
//           email_bounce_checked: true,
//         });

//       await leadsService.updateLead(lead_id, {
//         status: LeadStatus.Bounced,
//       });

//       await createActivity({
//         campaign_id,
//         sequence_id,
//         lead_id,
//         type: CampaignActivityType.Bounce,
//         account_id: from,
//         sequence_step,
//         campaign_email_id: _id,
//       });
//     } else {
//       const update = await CampaignEmail.findByIdAndUpdate(campaign._id, {
//         email_bounce_checked: true,
//       });
//     }
//   }
//   // logger.log("bounce email complete");
// }

export async function findBounceMail(bouncedMail) {
    try {
        if (!bouncedMail || !bouncedMail.messageId) {
            throw new Error('Invalid input: bouncedMail must contain a valid messageId');
        }
        const emailExist =   await CampaignEmail.findOne({ message_id: bouncedMail.messageId });
        if(emailExist){
          const { campaign_id, sequence_id, lead_id, from, sequence_step, _id } =
              await CampaignEmail.findOneAndUpdate({ message_id: bouncedMail.messageId }, {
                  email_bounced: true,
                  email_bounced_on: moment().toDate(),
                  email_opened: false,
                  email_bounce_checked: true,
              });

          await leadsService.updateLead(lead_id, {
              status: LeadStatus.Bounced,
          });

          await createActivity({
              campaign_id,
              sequence_id,
              lead_id,
              type: CampaignActivityType.Bounce,
              account_id: from,
              sequence_step,
              campaign_email_id: _id,
          });
      } else {
          const message = bouncedMail?.response?.message;
          if (/DNS Error|550-5\.1\.1|550 5\.1\.1/.test(message)){
          const warmupExist = await WarmupEmail.findOne({ 
              messageId: bouncedMail.messageId,
              bounceCheck: false
            });
          if(warmupExist){
            await Account.findOneAndUpdate(
              { _id: warmupExist.to },
              { $inc: { "warmup.warmupBounceCount": 1 } }
            );
            const updatedAccount = await Account.findOneAndUpdate(
              { _id: warmupExist.to, "warmup.warmupBounceCount": { $gte: 9 } },
              { $set: {
                "warmup.warmupDisable": true,
                "warmup.status": "paused"
              } },
              { new: true }
            );

            await WarmupEmail.findOneAndUpdate(
              { 
                messageId: bouncedMail.messageId,
                bounceCheck: false
              },
              { 
                $set: { bounceCheck: true } 
              },
              { 
                new: true
              }
            );
            
          }
        }
      }
    } catch (error) {
        console.error('Error finding bounce mail:', error);
        throw error;
    }
}

export async function leadCampaignStatus(campaign_id) {
  // const sequenceCount = await CampaignSequence.countDocuments({
  //   campaign: campaign_id,
  // });

  let stats = {
    total: 0,
    completed: 0,
    bounced: 0,
    unsubscribe: 0,
    contacted: 0,
  };
  // console.log(new Date())
  const leads = await leadsService.getLeadsStatus(campaign_id);
  // console.log(new Date())
  const total = leads.length;

  if (leads.length > 0) {
    // leads.forEach(async (lead) => {
    //   const leadMailSend = await CampaignEmail.countDocuments({
    //     campaign: campaign_id,
    //     lead_id: lead._id,
    //   });
    //   const { email_clicked, email_opened, email_replied } =
    //     await CampaignEmail.find({
    //       lead_id: lead._id,
    //     })
    //       .skip(leadMailSend - 1)
    //       .limit(1)
    //       .toArray();

    //   lead.email_opened = email_opened;
    //   lead.email_clicked = email_clicked;
    //   lead.email_replied = email_replied;
    // });

    // const completed = leads.filter(
    //   (item) => item.status === LeadStatus.Completed
    // );
    // const bounced = leads.filter((item) => item.status === LeadStatus.Bounced);
    // const contacted = leads.filter(
    //   (item) => item.status === LeadStatus.Contacted
    // );
    // const unsubscribe = leads.filter(
    //   (item) => item.status === LeadStatus.Unsubscribe
    // );
    let completed = [];
    let bounced = [];
    let contacted = [];
    let unsubscribe = [];
    for (const item of leads) {
      if (item.status === LeadStatus.Completed) {
        completed.push(item);
      }
      if (item.status === LeadStatus.Bounced) {
        bounced.push(item);
      }
      if (item.status === LeadStatus.Contacted) {
        contacted.push(item);
      }
      if (item.status === LeadStatus.Unsubscribe) {
        unsubscribe.push(item);
      }
    }

    stats = {
      total,
      completed: completed.length,
      bounced: bounced.length,
      unsubscribe: unsubscribe.length,
      contacted: contacted.length,
    };
  }
  return {
    // leads,
    stats,
  };
}

export async function createTemplates(data, user) { }

// export async function launchCampaign(id, step, reciepient) {
//   const schedule = await CampaignSchedule.findOne({
//     campaign: id,
//     isDefault: true,
//   });
//   if (!schedule) throw new HttpErrors.NotFound("Save your schedule first");

//   const sequences = await CampaignSequence.find({ campaign: id });
//   if (!sequences.length)
//     throw new HttpErrors.NotFound("Save your sequences first");

//   const leads = await leadsService.getLeads(id);
//   if (!leads.length) throw new HttpErrors.NotFound("Add your leads first");

//   const campaign = await Campaign.findById(id);

//   if (campaign.startDate === "" || campaign.endDate === "")
//     throw new HttpErrors.NotFound("Add start end date first");

//     const leadsData = await leadsService.getLeads(id);
//     const hasTestLead = leadsData.some(lead => lead.test === true && lead.status === 'not contacted');
//     if (!hasTestLead) {
//     if (campaign.options.emailAccounts <= 0)
//     throw new HttpErrors.NotFound("Select at least one email to use");
//     }

//    let launch;
//    if (!hasTestLead) {
//     console.log("updatez campaign........", id);
//      launch = await Campaign.findByIdAndUpdate(id, {
//        status: CampaignStatus.Active,
//        errorMsg: "",
//        isLaunched: true,
//      });
//    }
//    await Promise.all(leadsData.map(async (lead) => {  
//     if(lead.test === true && lead.status === 'not contacted'){
//       launch = await processCampaignMail(campaign, step);
//       return;
//     }   
//   }));
//   if (!hasTestLead) {
//     await populateCampaignSchedule(campaign)
//   }
//   return launch;
// }

export async function launchCampaign(id, step, reciepient) {
  const schedule = await CampaignSchedule.findOne({
    campaign: id,
    isDefault: true,
  });
  if (!schedule) throw new HttpErrors.NotFound("Save your schedule first");

  const sequences = await CampaignSequence.find({ campaign: id });
  if (!sequences.length)
    throw new HttpErrors.NotFound("Save your sequences first");
  if(!reciepient){
    const leads = await leadsService.getLeads(id);
    if (!leads.length) throw new HttpErrors.NotFound("Add your leads first");
  }
  const campaign = await Campaign.findById(id);

  if (campaign.startDate === "" || campaign.endDate === "")
    throw new HttpErrors.NotFound("Add start end date first");

    if (!reciepient) {
    if (campaign.options.emailAccounts <= 0)
    throw new HttpErrors.NotFound("Select at least one email to use");
    }

   let launch;
   if (!reciepient) {
    console.log("updatez campaign........", id);
     launch = await Campaign.findByIdAndUpdate(id, {
       status: CampaignStatus.Active,
       errorMsg: "",
       isLaunched: true,
     });
   }
   if(reciepient){
      const sequence = await CampaignSequence.findOne({ campaign: id, step: step });
      launch = await testEmail(campaign, sequence, reciepient)
   }
  if (!reciepient) {
    await populateCampaignSchedule(campaign)
  }
  return launch;
}

export async function testEmail(campaign, sequence, to) {
  const from =  campaign?.test?.testEmailAccounts;
  const smtpConfig = await accountService.getAccountSmtpSettingsForTest({
    email: from[0],
  });
  let message;
  if (!smtpConfig) {
    message = `SMTP config not found for ${from[0]}`;
    return message;
  }
  const body = sequence?.body;
  const subject = sequence?.subject;
  
  const emailData = {
    from,
    to,
    subject,
    body, 
  }

   const data = await sendTestEmail({
    smtpConfig,
    emailData,
  });
  if(data?.messageId){
    message = "Email Sent"
  }
  return message;
}

export async function emailSending_webhook(outLookData) {
  try {
    if (!outLookData) return;

    let queueCampaign;
    const messageIdToSearch = outLookData?.originalMessageId || outLookData.messageId;
    queueCampaign = await QueueCampaign.findOne({ message_id: messageIdToSearch });

    const existingCampaignEmail = await CampaignEmail.findOne({ message_id: outLookData?.messageId });
    if (existingCampaignEmail) {
      return;
    }

    if(queueCampaign){
      const campaignEmail = await CampaignEmail.create({
        unique_id: queueCampaign?.unique_id,
        subject: queueCampaign?.subject,
        body: queueCampaign?.body,
        from: queueCampaign?.from,
        campaign_id: queueCampaign?.campaign_id,
        lead_id: queueCampaign?.lead_id,
        sequence_id: queueCampaign?.sequence_id,
        label: queueCampaign?.label,
        sequence_step: queueCampaign?.sequence_step,
        message_id: outLookData?.messageId
      })

      await leadsService.updateLead(queueCampaign?.lead_id, {
        status: LeadStatus.Contacted,
      });

      await createActivity({
        campaign_id: campaignEmail.campaign_id,
        sequence_id: campaignEmail.sequence_id,
        lead_id: campaignEmail.lead_id,
        type: CampaignActivityType.Sent,
        account_id: campaignEmail.from,
        sequence_step: campaignEmail.sequence_step,
        campaign_email_id: campaignEmail._id,
      });
    }
    await QueueCampaign.deleteOne({ _id: queueCampaign?._id });
  } catch (error) {
      console.error('Error updating email in webhook:', error);
      throw error;
  }
}

export async function emailRejection_webhook(rejectedEmail) {
  try {
    if (!rejectedEmail) return;

    const account = await Account.findOne({ emailEngineAccountId: rejectedEmail.account });
    if (!account) return;

    let recipient;
    const messageId = rejectedEmail.data?.messageId;

    const existingErrorLog = await ErrorLog.findOne({ messageId: messageId });
    if (existingErrorLog) {
      return;
    }

    const warmupEmail = await WarmupEmail.findOne({ messageId: messageId });
    if (warmupEmail) {
      recipient = await Account.findOne({ _id: warmupEmail.to });
    } else {
      const campaignEmail = await CampaignEmail.findOne({ message_id: messageId });
      if (campaignEmail) {
        recipient = await LeadsCampaign.findOne({ _id: campaignEmail.lead_id });
      }
    }
    console.log(`recipient`, recipient?.email)
    let error = rejectedEmail.data?.error;
    if(error.includes('Visit')){
       error = error ? error.split(' Visit')[0].trim() : 'Unknown Error';
    }
    if (account && recipient) {
      await ErrorLog.create({
        from: account.email,
        to: recipient.email,
        timestamp: rejectedEmail.date,
        errorMessage: error,
        emailAccount: account,
        messageId: messageId
      });
    }
  } catch (error) {
    console.error('Error handling rejected email:', error);
  }
}

export async function getCampaignAccountDetails(
  campaignAccounts,
  counter,
  emailSentByAccount = 0
) {

  let message = null;
  let accountExhousted = false;
  let accountToUse = null;
  for (let i = counter; i < campaignAccounts.length; i++) {
    accountExhousted = false;
    accountToUse = await accountService.findOne({
      email: campaignAccounts[i],
    });
    if (!accountToUse) continue;
    if (accountToUse.status === 'paused') {
      message = `Account is paused: ${campaignAccounts[i]}`;
       continue;
    }
    const emailSentCount = await CampaignEmail.countDocuments({
      from: accountToUse._id,
      createdAt: { $gte: moment().startOf("day") },
    });

    if (
      emailSentCount + emailSentByAccount >=
      accountToUse.campaign.dailyLimit
    ) {
      message = `Account max email send from ${campaignAccounts[i]}`;
      accountExhousted = true;
      emailSentByAccount = 0
      continue;
    }

    if (!accountToUse) {
      message = `Account details not found for ${campaignAccounts[i]}`;
      continue;
    }

    if (accountToUse.campaign.dailyLimit <= 0) {
      message = `Daily limit is less than or equal to 0 for ${campaignAccounts[i]}`;
      continue;
    }

    const smtpConfig = await accountService.getAccountSmtpSettings({
      email: campaignAccounts[i],
    });
    if (!smtpConfig) {
      message = `SMTP config not found for ${campaignAccounts[i]}`;
      continue;
    }
    const isConfigValid = await checkEmailConfig(smtpConfig);
    if (!isConfigValid) {
      message = `SMTP config not valid for ${campaignAccounts[i]}`;
      continue;
    }
    return {
      accountToUse,
      smtpConfig,
      counter: i,
      status: true,
      emailSentCount,
      accountExhousted,
    };
  }
  return { status: false, message, accountExhousted, accountToUse };
}

export async function leadReplyCount(leadId) {
  const automaticReplyCount = await CampaignEmail.countDocuments({
    lead_id: leadId,
    automatic_reply: true,
  });
  const emailRepliedCount = await CampaignEmail.countDocuments({
    lead_id: leadId,
    email_replied: true,
  });
  return { automaticReplyCount, emailRepliedCount };
}

let senderLastSentTime = {};

export async function populateAllCampaignSchedules() {
  logger.log(`start campaign cron function Start, ${new Date()}`);
  const filter = {
    isLaunched: true,
    status: "active",
  };
  const campaignList = await Campaign.find(filter);
  for (let campaign of campaignList) {
    await populateCampaignSchedule(campaign)
  }
}

const enumerateDaysBetweenDates = function(startDate, endDate) {
  let dates = [];

  let currDate = moment(startDate).startOf('day');
  let lastDate = moment(endDate).startOf('day').add(1, 'days');

  while(currDate.diff(lastDate) < 0) {
      dates.push(currDate.clone().toDate());
      currDate.add(1, 'days')
    }
  return dates;
};
export async function populateCampaignSchedule(campaign) {
  const campaignSchedule = await CampaignSchedule.findOne({
    isDefault: true,
    campaign: campaign
  });
  let activeScheduleObjArr = [] 
  const dates  = enumerateDaysBetweenDates(campaign.startDate, campaign.endDate)
  for (let currDate of dates) {
    const timeZoneStr = campaignSchedule.timezone.split(' ')[0];
    let from = campaignSchedule.from;
    let to = campaignSchedule.to;
    let fromTime = moment(moment(from, 'HH:mm A').format());
    let toTime = moment(moment(to, "HH:mm A").format());
    
    let newFromTime = moment(currDate).toDate() 
    newFromTime.setHours(fromTime.hours());
    newFromTime.setMinutes(fromTime.minutes());
    newFromTime = moment(newFromTime).tz(timeZoneStr, true);

    let newToTime = moment(currDate).toDate();
    newToTime.setHours(toTime.hours());
    newToTime.setMinutes(toTime.minutes());
    newToTime = moment(newToTime).tz(timeZoneStr, true);
    
    // let toTime = moment(moment(to, 'HH:mm A').format()).tz(timeZoneStr, true);
    activeScheduleObjArr.push({
      From: newFromTime,
      To: newToTime
    })
  }
  campaign.activeSchedule = activeScheduleObjArr;
  await campaign.save();
}

  export async function getAccountsWithAppSumoRefund() {
  try {
    const users = await User.find({
      isAppSumoRefund: true
    }).lean();

    const userIds = users.map(user => user._id);
    console.log('Total userIds have isAppSumoRefund = true',userIds.length)
    const accounts = await Account.find({
      createdBy: { $in: userIds }
    }).lean();

    const updatedAccounts = [];

    for (const account of accounts) {
      let updated = false;

      if (account.status === 'connected') {
        account.status = 'paused';
        updated = true;
      }

      if (account.warmup && account.warmup.status === 'enabled') {
        account.warmup.status = 'paused';
        updated = true;
      }

      if (updated) {
        updatedAccounts.push(account);
      }
    }
    if (updatedAccounts.length > 0) {
      await Promise.all(updatedAccounts.map(async (account) => {
        await Account.updateOne({ _id: account._id }, { $set: { status: account.status, 'warmup.status': account.warmup.status } });
      }));
    }

    console.log("Accounts from Users with AppSumo Refund:", updatedAccounts.length);

    return updatedAccounts;
  } catch (error) {
    console.error("Error retrieving accounts from users with AppSumo refund:", error);
    throw error;
  }
}


export async function getAccountsWithAppSumoRefundDisable() {
  try {
    const users = await User.find({
      isAppSumoRefund: true
    }).lean();

    const updatedAccounts = [];

    for (const user of users) {
      const userId = user._id;
      const accounts = await Account.find({
        createdBy: userId
      }).lean();

      const accountsLength = accounts.length;

      for (let i = 0; i < accountsLength; i++) {
        const account = accounts[i];
        let updated = false;

        if (account.status === 'connected') {
          account.status = 'paused';
          updated = true;
        }

        if (account.warmup && account.warmup.status === 'enabled') {
          account.warmup.status = 'paused';
          updated = true;
        }

        if (accountsLength > 2) {
          if (i < 2) {
            account.freeUserOtherAccounts = false;
          } else {
            account.freeUserOtherAccounts = true;
          }
          updated = true;
        }

        if (updated) {
          updatedAccounts.push(account);
        }
      }
    }

    if (updatedAccounts.length > 0) {
      await Promise.all(updatedAccounts.map(async (account) => {
        await Account.updateOne({ _id: account._id }, { $set: { status: account.status, 'warmup.status': account.warmup.status, freeUserOtherAccounts: account.freeUserOtherAccounts } });
      }));
    }

    console.log("Accounts from Users with AppSumo Refund:", updatedAccounts.length);

    return updatedAccounts;
  } catch (error) {
    console.error("Error retrieving accounts from users with AppSumo refund:", error);
    throw error;
  }
}
export async function processCampaignSchedule() {
  // logger.log(`start campaign cron function Start, ${new Date()}`);
  const today = moment().toDate();
  const filter = {
    isLaunched: true,
    status: "active",
    'activeSchedule.From': { $lte: today },
    'activeSchedule.To': { $gte: today }
  };
  senderLastSentTime = {}
  const campaignList = await Campaign.find(filter);
  
  for (let campaign of campaignList) {
    // console.log("1")
    // const user = await User.findById(campaign.createdBy);
    // if (user) {
    //    generateIntercomEvent(
    //     user.email,
    //     Constants.CAMPAIGN_STARTED,
    //     {campaign},
    //     user._id
    //   );
     
    // }

    processCampaignMail(campaign)
   
    // if (user) {
    //    generateIntercomEvent(
    //       user.email,
    //       Constants.CAMPAIGN_SUCCESSFUL,
    //       {
    //         errorDetails: {
    //           message: emailAccountDetails?.message,
    //         },
    //       },
    //       user._id
    //     );
  
    //   }

  }
  // logger.log(
  //   `End campaign cron function Start, ${new Date()}, Total email sent: ${campaignEmailToBeSent.length
  //   }`
  // );
}

export async function processErrorEmail() {
  // logger.log(`start sendingError cron function Start, ${new Date()}`);

  const filter = {
    isLaunched: true,
    status: "error",
    campainErrorEmailSent: false,
  };

  const campaignList = await Campaign.find(filter);

  const campaignsByUser = {};
  for (let campaign of campaignList) {
    const userId = campaign.createdBy;

    if (!campaignsByUser[userId]) {
      campaignsByUser[userId] = [];
    }

    campaignsByUser[userId].push(campaign);
  }

  for (let userId in campaignsByUser) {
    if (campaignsByUser.hasOwnProperty(userId)) {

      const user = await User.findById(userId);
      if (!user) continue;
      const plan = await UserPlan.findOne({ user: user._id });
      if (!plan) continue;
      const haveFreeTrial = new Date(plan.freeTrialExpiresAt).getTime() > Date.now();
      const expiresSubscription = plan?.subscription?.sendingWarmup?.expiresAt || plan?.subscription?.leads?.expiresAt;
      const haveSubscription = new Date(expiresSubscription).getTime() > Date.now();
      if(haveSubscription || haveFreeTrial) {
        const userCampaigns = campaignsByUser[userId];
        if(user != null) {
          let body = '<ol>';
          for (let campaign of userCampaigns) {
            body += `<li>${campaign.name} - ${campaign.errorMsg}</li>`;
          } 
          body += '</ol>';
          await mailerService.sendErrorsCampaignStatsMail(user,body,userCampaigns);
        }
      }
    }
  }

}

async function compileCampaignEmails(campaignEmailToBeSent) {
  for (const campaignEmail of campaignEmailToBeSent) {
    if (!campaignEmail.smtpConfig) continue;
    try{
      // `isRead` should be made false as soon as it tries to send mail,
      // rather than in case of it being un_successful, this way it wont retry with an account with no error.
      // await LeadsCampaign.findByIdAndUpdate(campaignEmail.lead_id, {
      //   isRead: false
      // });
      let previousMessage = {};
    try {
      if (campaignEmail?.sequence_step > 1) {  
           previousMessage = await CampaignEmail.findOne({ 
              campaign_id: campaignEmail?.campaign_id, 
              subject: campaignEmail.subject,
              sequence_step: campaignEmail.sequence_step - 1,
              lead_id: campaignEmail.lead_id,
          }, { message_id: 1 });
      if(!previousMessage){
        previousMessage = {};
        }
      }
    } catch (error) {
        console.error("An error occurred while querying the database:", error);
    }
    const account = await Account.findById(campaignEmail.from)
    const emailSentCount = await CampaignEmail.countDocuments({
      from: account._id,
      createdAt: { $gte: moment().startOf("day") },
    });
    const haveLimit = emailSentCount < account?.campaign?.dailyLimit
      if(haveLimit){
        const message = await sendCampaignEmail({
          emailData: campaignEmail,
          emailEngineAccountId: account.emailEngineAccountId,
          messageText: "",
          previousMessage: previousMessage.message_id
        });
    
        if (message) {
          const lead =  await leadsService.getLead(campaignEmail.lead_id)
          let campaignEmailData
          if(lead !== null && lead.test !== true){
            campaignEmailData = await QueueCampaign.create({
            ...campaignEmail,
            message_id: message.messageId,
          });
          }
          // await leadsService.updateLead(campaignEmail.lead_id, {
          //   status: LeadStatus.Contacted,
          // });
          await LeadsCampaign.findByIdAndUpdate(campaignEmail.lead_id, {
            isRead: false
          });
      } else {
        await LeadsCampaign.findByIdAndUpdate(campaignEmail.lead_id, {
          isRead: false
        });
      }
      //  if (lead !== null && lead.test !== true) {
      //    await createActivity({
      //   campaign_id: campaignEmail.campaign_id,
      //   sequence_id: campaignEmail.sequence_id,
      //   lead_id: campaignEmail.lead_id,
      //   type: CampaignActivityType.Sent,
      //   account_id: campaignEmail.from,
      //   sequence_step: campaignEmail.sequence_step,
      //   campaign_email_id: campaignEmailData._id,
      // });
    // } else {
      // console.log("Lead is null. Skipping createActivity.");
    // }
      }
  }
    catch(e)
    { 
      await LeadsCampaign.findByIdAndUpdate(campaignEmail.lead_id, {
        isRead: false
      });
      return {
        error: e.response,
        fromEmail: campaignEmail.fromEmail
      };
    }
  }
}

async function checkCampaignsToSendEmail(campaigns, waitLimit) {
  for (const campaignkey in campaigns) {
    const campaignEmailToBeSent = campaigns[campaignkey];
    const emailAccountWithError = await compileCampaignEmails(campaignEmailToBeSent);
    // await sleep(waitLimit);
    return emailAccountWithError;
  }
  }

 function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createActivity(data) {
  return CampaignActivity.create({ ...data });
}

export async function getCampaignStepsAnalytics(campaign_id) {
  try {
    const query = { campaign_id: new mongoose.Types.ObjectId(campaign_id) };
    const stepsAnalytics = await CampaignEmail.aggregate([
      { $match: query },
      {
          $project: {
              email_opened: 1,
              email_clicked: 1,
              email_replied: 1,
              replies: 1,
              lead_id: 1,
              sequence_step: 1,
              createdAt: { $dateToString: { format: "%m/%d/%Y", date: "$createdAt" } }
          },
      },
      {
          $group: {
              _id: { sequence_step: "$sequence_step", createdAt: "$createdAt" },
              sent: { $sum: 1 }, // Count total documents for each sequence_step and date
              opened: { $sum: { $cond: ["$email_opened", 1, 0] } }, // Count opened documents (where opened is true)
              link_clicked: { $sum: { $cond: ["$email_clicked", 1, 0] } }, // Count documents with link clicks (where link_clicked is true)
              replied: { $sum: { $cond: ["$email_replied", 1, 0] } }, // Count documents with replies (where count > 0)
              opportunities: {
                  $addToSet: {
                      $cond: {
                          if: { $gt: [{ $size: "$replies" }, 0] },
                          then: "$campaign_emails.lead_id",
                          else: null,
                      },
                  },
              },
          },
      },
      {
          $group: {
              _id: "$_id.sequence_step",
              sent: { $sum: "$sent" },
              dates: {
                  $push: {
                      created_at: "$_id.createdAt",
                      sent: "$sent",
                      opened: "$opened",
                      link_clicked: "$link_clicked",
                      replied: "$replied",
                      opportunities: {
                          $size: {
                              $filter: {
                                  input: "$opportunities",
                                  as: "d",
                                  cond: { $ne: ["$$d", null] },
                              },
                          },
                      },
                      opened_percentage: { $cond: [{ $eq: ["$sent", 0] }, 0, { $multiply: [{ $divide: ["$opened", "$sent"] }, 100] }] },
                      replied_percentage: { $cond: [{ $eq: ["$sent", 0] }, 0, { $multiply: [{ $divide: ["$replied", "$sent"] }, 100] }] }
                  }
              }
          }
      },
      {
          $project: {
              _id: 1,
              dates: 1,
              sent: 1,
              opened: 1,
              link_clicked: 1,
              replied: 1,
              opened_percentage: 1,
              replied_percentage: 1
          }
      },
      {
          $sort: { _id: 1 }
      }
  ]);
  
  console.log(stepsAnalytics);
  
    return stepsAnalytics;
  } catch (e) {
    // logger.log(e);
  }
}

export async function fetchAnalyticsByAccount(user) {
  try {
    const query = { createdBy: user._id };
    const accountAnalytics = await Account.aggregate([
      {
        $match: query,
      },
      {
        $project: {
          email: 1,
        },
      },
      {
        $lookup: {
          from: "campaign_emails",
          localField: "_id",
          foreignField: "from",
          as: "campaign_emails",
        },
      },
      {
        $unwind: {
          path: "$campaign_emails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "campaign_emails.replies": {
            $cond: {
              if: "$campaign_emails.replies",
              then: "$campaign_emails.replies",
              else: [],
            },
          },
          score: {
            $cond: {
              if: { $gt: ["$sent", 0] },
              then: {
                $multiply: [{ $divide: ["$replied", "$sent"] }, 100],
              },
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          email: { $last: "$email" },
          sent: {
            $sum: {
              $cond: ["$campaign_emails.message_id", 1, 0],
            },
          },
          opened: {
            $sum: {
              $cond: ["$campaign_emails.email_opened", 1, 0],
            },
          },
          link_clicked: {
            $sum: {
              $cond: ["$campaign_emails.email_clicked", 1, 0],
            },
          },
          replied: {
            $sum: {
              $cond: ["$campaign_emails.email_replied", 1, 0],
            },
          },
        },
      },
      {
        $addFields: {
          score: {
            $cond: {
              if: { $gt: ["$sent", 0] },
              then: {
                $round: [
                  {
                    $multiply: [{ $divide: ["$replied", "$sent"] }, 100],
                  },
                  2,
                ],
              },
              else: 0,
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    return accountAnalytics;
  } catch (e) {
    // logger.log(e);
  }
}

export async function fetchAnalyticsByCampaign(user, filter) {
  try {
    let query;
    if (filter) query = { createdBy: user._id, status: filter };
    else query = { createdBy: user._id, status: { $ne: CampaignStatus.Draft } };

    const campaignAnalytics = await Campaign.aggregate([
      {
        $match: query,
      },
      {
        $project: {
          name: 1,
          status: 1,
        },
      },
      {
        $lookup: {
          from: "campaign_emails",
          localField: "_id",
          foreignField: "campaign_id",
          as: "campaign_emails",
        },
      },
      {
        $unwind: {
          path: "$campaign_emails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "campaign_emails.replies": {
            $cond: {
              if: "$campaign_emails.replies",
              then: "$campaign_emails.replies",
              else: [],
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          campaign_name: { $last: "$name" },
          campaign_status: { $last: "$status" },
          sent: {
            $sum: {
              $cond: ["$campaign_emails.message_id", 1, 0],
            },
          },
          opened: {
            $sum: {
              $cond: ["$campaign_emails.email_opened", 1, 0],
            },
          },
          link_clicked: {
            $sum: {
              $cond: ["$campaign_emails.email_clicked", 1, 0],
            },
          },
          replied: {
            $sum: {
              $cond: ["$campaign_emails.email_replied", 1, 0],
            },
          },
          opportunities: {
            $addToSet: {
              $cond: {
                if: {
                  $gt: [
                    {
                      $size: "$campaign_emails.replies",
                    },
                    0,
                  ],
                },
                then: "$campaign_emails.lead_id",
                else: null,
              },
            },
          },
        },
      },
      {
        $addFields: {
          opportunities: {
            $size: {
              $filter: {
                input: "$opportunities",
                as: "d",
                cond: {
                  $ne: ["$$d", null],
                },
              },
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    return campaignAnalytics;
  } catch (e) {
    // logger.log(e);
  }
}

export async function getCampaignActivity(
  campaign_id,
  { filters, limit, offset, search, type }
) {
  try {
    offset = parseInt(offset);
    limit = parseInt(limit);
    const query = { campaign_id: new mongoose.Types.ObjectId(campaign_id) };
    let searchParam = {};
    if (search && search !== "") {
      searchParam = {
        email: {
          $regex: new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i"),
        },
      };
    }

    let typeParam = {};
    if (type !== null && type) {
      typeParam = { "type": type };
    }

    let activityPipeline = [
      { $match: query },
      {
        $lookup: {
          from: "accounts",
          let: { toId: "$account_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$toId"] },
              },
            },
            {
              $project: {
                email: 1,
              },
            },
          ],
          as: "toAccount",
        },
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
                email: 1,
                firstName: 1,
                lastName: 1,
                status: 1,
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
        $unwind: { path: "$toAccount", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $addFields: {
          email: "$leads.email",
        },
      },
      {
        $match: {
          $and: [
            searchParam,
            typeParam,
            { leads: { $ne: null } }, // Filter out documents where leads is null
            {
              $or: [
                { "leads.status": { $ne: LeadStatus.Bounced } }, // Filter out documents with LeadStatus.Bounced
                { type: { $ne: CampaignActivityType.Opened } }, // Filter out documents with CampaignActivityType.Opened
              ],
            },
          ],
        },
      },
    ];

    // Add $skip and $limit stages for pagination
    if (offset) {
      activityPipeline.push({ $skip: offset });
    }
    if (limit) {
      activityPipeline.push({ $limit: limit });
    }

    let activity = await CampaignActivity.aggregate(activityPipeline);

    let totalCount = await CampaignActivity.aggregate([
      { $match: query },
      { $count: "total" },
    ]);

    totalCount = totalCount.length > 0 ? totalCount[0].total : 0;

    return {
      activity,
      total: totalCount,
      offset: activity.length,
      limit,
    };
  } catch (e) {
    // Handle error
  }
}



export async function getCamapaignSendCount(emails) {
  return CampaignEmail.aggregate([
    {
      $match: {
        from: { $in: emails },
        createdAt: {
          $gte: moment().startOf("day").toDate(),
        },
      },
    },
    {
      $group: {
        _id: "$from",
        campaignSend: {
          $sum: {
            $cond: ["$message_id", 1, 0],
          },
        },
      },
    },
  ]);
}

export async function getLeadLastSequence(leadId, campaignId) {
  return CampaignEmail.findOne({
    lead_id: leadId,
    campaign_id: campaignId
  }, {
    sequence_step: 1
  })
    .sort({ sequence_step: -1 });
}

export async function createLabel(data, user) {
  return CampaignEmailLabel.create({ ...data, createdBy: user })
}

export async function getLables(user) {
  return CampaignEmailLabel.find({
    $or: [
      { createdBy: { $exists: false } },
      { createdBy: user }
    ]
  })
}

export async function UpdateMontlyEmailCount(user){
  const { monthlyEmails } = await billingService.findUserPlanUsage(user);
  await billingService.updateUserUsage(user, {
    monthlyEmails: monthlyEmails - 1,
  });
  addOrUpdateEmailAnalytics(user, 1, "Campaign");
}

export async function updateCampaignEmail(id, label) {
  const campaign = await CampaignEmail.findByIdAndUpdate(id, { label })
  await LeadsCampaign.findByIdAndUpdate(campaign.lead_id, { label })
  return true
}

export async function processCampaignMail(campaign, initialStep = null, errorAccount = []) {

  const campaignEmailToBeSent = []
  const filteredDataTrue = [];
  const filteredDataFalse = [];

  const alreadySentToday = await CampaignEmail.countDocuments({
    campaign_id: campaign?._id,
    createdAt: { $gte: moment().startOf("day") },
  });
 
  if (alreadySentToday >= parseInt(campaign?.options?.dailyMaxLimit))
    return;
 
  const { stopOnAutoReply, stopOnReply } = campaign?.options;
  const { monthlyEmails } = await billingService.findUserPlanUsage(
    campaign?.createdBy
  );

  const scheduleFilter = {
    isDefault: true,
    campaign: campaign?._id,
  };
  const sequenceFilter = {
    campaign: campaign?._id,
  };
  const leadsFilter = {
    campaign: campaign?._id,
    status: {
      $in: [LeadStatus.NotContacted, LeadStatus.Contacted],
    },
    $or: [
      { isRead: { $exists: false } },
      { isRead: false }
    ]
  };
  const leadsList = await LeadsCampaign.find(leadsFilter);
  const leadWithTest = leadsList.find((item) => item.test === true);

  if (monthlyEmails < 1) {
    console.log("monthlyEmails < 1.......");
    if (!leadWithTest) {
      await updateCampaign(campaign?._id, {
        status: CampaignStatus.Error,
        errorMsg: "Monthly sending limit exhausted",
      });
    } else {
      const message = "Monthly sending limit exhausted";
      // await leadsService.deleteLeadById(leadWithTest._id);
      return message;
    }

 //   const user = await User.findById(campaign.createdBy);
    // if (user) {
    //    generateIntercomEvent(
    //     user.email,
    //    Constants.CAMPAIGN_STOP,
    //     {
    //       campaign,
    //       errorDetails: {
    //         message:  "Monthly sending limit exhausted" ,
    //       },
    //     },
    //     user._id
    //   );
    // }
    return;
  }
  
  let campaignAccounts = campaign?.options?.emailAccounts;
  if (errorAccount.length > 0) {
    campaignAccounts = campaignAccounts.filter(email => !errorAccount.includes(email));
  }

  if (!leadWithTest && campaignAccounts.length == 0) {
    await updateCampaign(campaign._id, {
      status: CampaignStatus.Error,
      errorMsg: "Selected email account(s) has error(s)",
    });
    // const user = await User.findById(campaign.createdBy);
    // if (user) {
    //    generateIntercomEvent(
    //     user.email,
    //    Constants.CAMPAIGN_STOP,
    //     {
    //       campaign,
    //       errorDetails: {
    //         message:'Selected email account(s) has error(s)',
    //       },
    //     },
    //     user._id
    //   );
    // }
    return;
  }

  if (leadWithTest) {
    campaignAccounts = campaign?.test?.testEmailAccounts;
  }

  if (!campaignAccounts.length) return;
  let campainAccountToUse = null;
  let smtpConfig = null;
  let emailAlreadySentByAccount = 0;
  let emailAccountCounter = 0;
  let emailAccountDetails = await getCampaignAccountDetails(
    campaignAccounts,
    emailAccountCounter
    );
  if (emailAccountDetails?.accountExhousted) {
    const message = emailAccountDetails?.message;
    // await leadsService.deleteLeadById(leadWithTest._id);
    return message;
  } 
  if (!emailAccountDetails?.status) {
    console.log("return with error ---------1-1-1-1------",emailAccountDetails?.message);
    if(emailAccountDetails?.message.includes("SMTP config")){
      try {
        const query = { email: emailAccountDetails?.accountToUse?.email };
        const update = { $set: { accountError: emailAccountDetails?.message } };
        const options = { new: true };

        await Account.findOneAndUpdate(query, update, options);
        const index = campaign.options.emailAccounts.findIndex((email)=>(email==emailAccountDetails?.accountToUse?.email))
        campaign.options.emailAccounts.splice(index,1)

        await setOptions(campaign._id, campaign.options)
      }
      catch(err){
        console.log(err);
      }
    }
    if(!leadWithTest){
      if(campaignAccounts.length == 0) {
        await updateCampaign(campaign._id, {
          status: CampaignStatus.Error,
          errorMsg: emailAccountDetails?.message,
        });
      }
    } else {
      const message = emailAccountDetails?.message;
      // await leadsService.deleteLeadById(leadWithTest._id);
      return message;
    }
    console.log("return with error --------------", emailAccountDetails?.message);
    return;
  }
  campainAccountToUse = emailAccountDetails.accountToUse;
  smtpConfig = emailAccountDetails.smtpConfig;
  emailAccountCounter = emailAccountDetails.counter;
  emailAlreadySentByAccount = emailAccountDetails.emailSentCount;
  const scheduleList = await CampaignSchedule.findOne(scheduleFilter);
  const sequencesList = await CampaignSequence.find(sequenceFilter).sort({
    step: 1,
  });
  if (scheduleList?.from && scheduleList?.to && scheduleList?.timezone) {
      const timezone = scheduleList?.timezone.split(" ")[0];
      // condition based on sequence day and time based on time zone
      const day = moment.tz(timezone).format("ddd");
      const currentTime = moment(
        moment.tz(timezone).format("h:mm A"),
        "hh:mm A"
      );
      const rangeStartTime = moment(scheduleList?.from, "hh:mm A");
      const rangeEndTime = moment(scheduleList?.to, "hh:mm A");
      const numberOfHours = rangeEndTime.diff(rangeStartTime, 'hours');
      const isWithinRange = currentTime.isBetween(rangeStartTime, rangeEndTime);
    if(!leadWithTest) {
      if (!scheduleList[day.toLowerCase()]) return;
      if (!isWithinRange) return;
    }
    let emailAccountDailyLimit =
    campainAccountToUse?.campaign?.dailyLimit || 0;
      let emailSentByAccount = 0;
      let currentUsage = 0;
    const blocklist = await warmupService.getBlockList({
      createdBy: campaign.createdBy
    });
  
    const blocklistEmails = blocklist.docs.map((block) => block.email);
    
    let filteredLeadsList = leadsList.filter((lead) => !blocklistEmails.includes(lead.email));
    
    filteredLeadsList.forEach(item => {
      if (item.status === 'not contacted' && item.test === true) {
          filteredDataTrue.push(item);
        } else if (item.test === false)  {
          filteredDataFalse.push(item);
        }        
      });
      
      filteredLeadsList =  filteredDataTrue.length > 0 ?  filteredDataTrue : filteredDataFalse

    for (const lead of filteredLeadsList) {
      
      const replyCount = await leadReplyCount(lead._id);
      if (
        (replyCount?.automaticReplyCount > 0 && stopOnAutoReply) ||
        (replyCount?.emailRepliedCount > 0 && stopOnReply)
      ) {
        continue;
      }
      const totalCampaign =
        campaignEmailToBeSent.filter((c) => c.campaign_id === campaign._id) ??
        [];
      if (
        alreadySentToday + totalCampaign.length <
        parseInt(campaign?.options?.dailyMaxLimit)
      ) {
        if (
          emailSentByAccount + emailAlreadySentByAccount ===
          emailAccountDailyLimit &&
          emailAccountCounter < campaignAccounts.length
        ) {
          emailAccountDetails = await getCampaignAccountDetails(
            campaignAccounts,
            emailAccountCounter,
            emailSentByAccount
          );
          if (emailAccountDetails?.accountExhousted) break;
          if (!emailAccountDetails?.status) {
            if(emailAccountDetails?.message.includes("SMTP config")){
              try {
                const query = { email: emailAccountDetails?.accountToUse?.email };
                const update = { $set: { accountError: emailAccountDetails?.message } };
                const options = { new: true };

                await Account.findOneAndUpdate(query, update, options);
                const index = campaign.options.emailAccounts.findIndex((email)=>(email==emailAccountDetails?.accountToUse?.email))
                campaign.options.emailAccounts.splice(index,1)

                await setOptions(campaign._id, campaign.options)
              }
              catch(err){
                console.log(err);
              }
            }
            console.log("return with error -----00000---------",emailAccountDetails?.message);
            if (!leadWithTest) {
              if(campaignAccounts.length == 0) {
                const updatedCampaign = await updateCampaign(campaign._id, {
                  status: CampaignStatus.Error,
                  errorMsg: emailAccountDetails?.message,
                });
              }
              // const user = await User.findById(campaign.createdBy);
              // if (user) {
              //    generateIntercomEvent(
              //     user.email,
              //    Constants.CAMPAIGN_STOP,
              //     {
              //       campaign,
              //       errorDetails: {
              //         message: emailAccountDetails?.message ? emailAccountDetails?.message :'uncaught exception line 2147',
              //       },
              //     },
              //     user._id
              //   );
              // }
            }

            else {
              const message = emailAccountDetails?.message;
              // await leadsService.deleteLeadById(leadWithTest._id);
              return message;
            }
            console.log("return with error -----111---------",emailAccountDetails?.message);
            break;
          }
          emailAlreadySentByAccount = emailAccountDetails?.emailSentCount;
          emailSentByAccount = 0;
          campainAccountToUse = emailAccountDetails.accountToUse;
          smtpConfig = emailAccountDetails.smtpConfig;
          emailAccountCounter = emailAccountDetails.counter;
          emailAccountDailyLimit =
            campainAccountToUse?.campaign?.dailyLimit || 0;
        }
        const campaign_ID = campaign._id.toHexString();
        const lead_ID = lead._id.toHexString();
        const campaignEmailSent = await CampaignEmail.findOne({
          campaign_id: campaign_ID,
          lead_id: lead_ID
         })
          .select(["sequence_id", "sequence_step", "createdAt"])
          .sort({ createdAt: -1 })
          .limit(1);

        let step = initialStep ?? 1;
        let lastEmailSentOn = null;
        if (campaignEmailSent) {
          step = campaignEmailSent.sequence_step + 1;
          lastEmailSentOn = campaignEmailSent.createdAt;
        }
        let sequence = sequencesList.find(
          (sequence) => sequence.step === step
        );
        if (!sequence) continue;
        // add condition to add delay by n no of days defined in sequence
        if (lastEmailSentOn) {
          const today = moment().toDate();
          const delayDays = sequence?.waitDays;
          const nextEmailDate = moment(campaignEmailSent.createdAt)
            .add(delayDays, "days")
            .toDate();
          if (today <= nextEmailDate) {
            continue;
          }
        }
        const uniqueId = uuidv4();

        const emailSchedules = await getDynamicSequence({
          id: uniqueId,
          campaignId: campaign._id,
          leadId: lead._id,
          sequenceId: sequence._id,
          customDomainLink: campainAccountToUse?.customDomain?.name,
          senderEmail: campainAccountToUse?.email
        });
        if (monthlyEmails < 1) {
          console.log("monthlyEmails < 1 line 2055");
          if (!leadWithTest) {
            await updateCampaign(campaign._id, {
              status: CampaignStatus.Error,
              errorMsg: "Monthly sending limit exhausted",
            });
          }
          else {
            const message = "Monthly sending limit exhausted";
            // await leadsService.deleteLeadById(leadWithTest._id);
            return message;
          }
          continue;
        }

        const scheduleEmailObject = {
          to: lead.email,
          fromEmail: campainAccountToUse.email,
          type: emailSchedules.type,
          name: campainAccountToUse.name,
          // for campaign email collection
          unique_id: uniqueId,
          subject: emailSchedules.subject,
          body: emailSchedules.body,
          from: campainAccountToUse._id,
          campaign_id: campaign._id,
          lead_id: lead._id,
          sequence_id: sequence._id,
          sequence_step: sequence.step,
          smtpConfig,
          replyTo: campainAccountToUse?.replyTo || null,
        };
        const dailyCampaignEmail = campaign?.options?.dailyMaxLimit;
        // the processCampaignSchedule cronjob run after 15 minutes so we are using value of 3 (not using 4 because sometimes because of server load it does not send and then daily limit is not hit.)
        const emailsPerHour = dailyCampaignEmail / (numberOfHours * 3);
        let campaignEmailToBeSentLimit = Math.round(emailsPerHour);
        campaignEmailToBeSentLimit = Math.max(campaignEmailToBeSentLimit, 10);

        if (campaignEmailToBeSent.length >= campaignEmailToBeSentLimit)
          break;

        campaignEmailToBeSent.push(scheduleEmailObject);
        emailSentByAccount++;

        await LeadsCampaign.findByIdAndUpdate(lead._id, {
          isRead: true
        });

        currentUsage++;
        if(!lead?.test) {
        await UpdateMontlyEmailCount(campaign.createdBy) 
      }
      } else {
        break;
      }
    }
  }

  if (!campaignEmailToBeSent) return;
  const resultObject = {};
  campaignEmailToBeSent.forEach((item) => {
    const { from, campaign_id } = item;
    if (!resultObject[from]) {
      resultObject[from] = {};
    }
    if (!resultObject[from][campaign_id]) {
      resultObject[from][campaign_id] = [];
    }
    resultObject[from][campaign_id].push(item);
  });
  for (const element in resultObject) {
    const accountId = element;
    const campaigns = resultObject[accountId];
    const accountDetails = await Account.findOne({_id: accountId}).select("campaign email").exec();
    const waitLimit = accountDetails?.campaign?.waitTime ? accountDetails?.campaign?.waitTime * 60 * 1000 : 0;

        const senderEmail = accountDetails.email;
        let sleepStatus = false;
        if (!leadWithTest) {
          if (senderLastSentTime[senderEmail]) {
                  const wait = senderLastSentTime[senderEmail]
                  senderLastSentTime[senderEmail] = senderLastSentTime[senderEmail] + waitLimit;
                  await sleep(wait);
                  sleepStatus = true;
          }
          if(!sleepStatus){
            senderLastSentTime[senderEmail] = waitLimit;
          }
        }

        const error = await checkCampaignsToSendEmail(campaigns);
        if (error) {
          errorAccount.push(error.fromEmail)
          const query = { email: error.fromEmail };
          const update = { $set: { accountError: error.error } };
          const options = { new: true };
    
          await Account.findOneAndUpdate(query, update, options);
    
          const index = campaign.options.emailAccounts.findIndex((email)=>(email==error.fromEmail))
          campaign.options.emailAccounts.splice(index,1)
    
          await setOptions(campaign._id, campaign.options)
    
          processCampaignMail(campaign, initialStep = null, errorAccount);
        }
    }
  for (const lead of filteredDataTrue) {
    try {
      await leadsService.deleteLeadById(lead._id);
      const message = "Email Sent"
      return message
      // console.log(`Lead with ID ${lead._id} deleted successfully.`);
    } catch (error) {
      // console.error(`Error deleting lead with ID ${lead._id}:`, error);
    }
  }
}
