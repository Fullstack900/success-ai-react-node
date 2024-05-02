import axios from 'axios';
import LeadsSearch from './models/leads-search.model.js';
import LeadsCampaign from './models/leads-campaign.model.js';
import SearchType from './enum/search-type.enum.js';
import HttpErrors from 'http-errors';
import LeadFind from './enum/lead-find.enum.js';
import LeadStatus from './enum/lead-status.enum.js';
import * as billingService from '../billing/billing.service.js';
import * as campaignService from '../campaigns/campaign.service.js';
import { flatObject } from '../common/utils/utils.js';
import * as uniboxService from '../unibox/unibox.service.js';
import * as utils from '../common/utils/utils.js';
import mongoose from 'mongoose';
import Campaign from '../campaigns/models/campaign.model.js';
import CampaignStatus from '../campaigns/enum/campaign-status.enum.js';
import logger from '../common/utils/logger.js';
import LeadsUsage from './models/lead-usage.model.js';
import LeadSaved from './models/leads.saved.model.js';
import LeadCampaignSaved from './models/leads.saved.campaign.model.js';
import * as warmupService from '../warmup/warmup.service.js'
import * as accountService from '../account/account.service.js'
import User from '../user/models/user.model.js'
import _ from 'lodash';
import Bottleneck from "bottleneck";
import RocketReachApiUsage from '../../src/user/models/rocketReach-api-usage.model.js'
import {bulkLookupQueue, bulkLookupQueueLimit} from '../workers/leadWorker.js';
import PlanUsage from "../billing/models/plan-usage.model.js";
import { createRequest, updateRequest } from '../monitor/monitor.service.js';

const createNameFromQuery = (query) =>
  Object.values(query).flat().slice(0, 3).join(', ');

const cache = new Map();

export async function find(data, user) {
  const url = "https://api.apollo.io/v1/mixed_people/search"
  const apiKey = process.env.APOLLO_IO_API_KEY;
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "api_key": apiKey,
  };

  data.page = data.start; // Assuming 'page' is a valid parameter in your data object
  data.per_page = data.page_size; // Assuming 'per_page' is a valid parameter in your data object
  data.api_key = apiKey;
  data.order_by = "score";
  const cacheKey = JSON.stringify(data);

  if (data.query.current_title) {
    data.query.current_title = data.query.current_title.map(title => `'${title}'`);
  }

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
   
    const qKeywordsValue = data?.query?.name && data.query.name.length > 0
    ? data.query.name[0]
    : null;
    const qKeyCountryValue = data?.query?.geo && data.query.geo.length > 0
    ? data.query.geo
    : null;
    const qKeyJobTitleValue = data?.query?.current_title && data.query.current_title.length > 0
    ? data?.query?.current_title.map(title => title.replace(/^'+|'+$/g, ''))
    : null;

    const qKeyDepartmentValue = data?.query?.department && data?.query?.department?.length > 0
    ? data?.query?.department
    : null;

    const qKeyDomainValue = data?.query?.link && data.query.link.length > 0
    ? data.query.link[0]
    : null;

    const qKeyEmployesValue = data?.query?.company_size && data?.query?.company_size?.length > 0
    ? data?.query?.company_size
    : null;

    const qKeyOrganizationIdValue = data?.query?.keyword && data?.query?.keyword?.length > 0
    ? data?.query?.keyword
    : null;

    const qKeyOrganizationEmployerIdValue = data?.query?.employer && data?.query?.employer?.length > 0
    ? data?.query?.employer
    : null;
    
    const qKeyOrganizationLocationsValue = data?.query?.oGeo && data.query.oGeo.length > 0
    ? data?.query?.oGeo
    : null;

    const allChildren = qKeyOrganizationLocationsValue
    ? qKeyOrganizationLocationsValue.flatMap(item => item.children)
    : [];

    const newData  = {
    api_key: apiKey,
    q_keywords: qKeywordsValue,
    person_locations: qKeyCountryValue,
    // person_titles:qKeyDepartmentValue,
    person_department_or_subdepartments:qKeyDepartmentValue,
    person_seniorities:qKeyJobTitleValue,
    q_organization_domains:qKeyDomainValue,
    organization_num_employees_ranges:qKeyEmployesValue,
    organization_ids:qKeyOrganizationIdValue || qKeyOrganizationEmployerIdValue,
    organization_locations:allChildren,
    page: data?.page,
    per_page: data?.per_page || data?.totalSelected,
  }
  const { data: result } = await axios.post(url, newData, { headers });
  // await RocketReachApiUsage.findOneAndUpdate({ user: user._id }, { $inc: { searchPerson: 1 } }, { upsert: true });
  cache.set(cacheKey, result);
  if (data?.all_results) {
    const { pagination, people } = await fetchAllLeads(url, data,newData, { headers }, user);
    return {
      pagination: pagination,
      people: people,
    };
  }
  const { pagination,  people } = result;
  // return result;
  return { pagination, people };
}


export async function searchCompany(data, user) {
  const url = "https://api.apollo.io/api/v1/mixed_companies/search";
  const apiKey = process.env.APOLLO_IO_API_KEY;

  const headers = { 
  "Content-Type": "application/json",
  "Cache-Control": "no-cache",
  "api_key": apiKey, 
};

  data.page = data.start; 
  data.per_page = data.page_size; 
  data.api_key = apiKey;
 
  
  data.order_by = "score";
  const cacheKey = JSON.stringify(data);
  if(data.query.naics_code){
    data.query.naics_code = data.query.naics_code?.filter(code => /^\d+$/.test(code));
  }

  if(data.query.sic_code){
    data.query.sic_code = data.query.sic_code?.filter(code => /^\d+$/.test(code));
  }

  const organizationName = data?.query?.name && data?.query?.name?.length > 0 ? data?.query?.name[0] : null;
  const organizationLocation = data?.query?.geo && data?.query?.geo?.length > 0 ? data?.query?.geo : null;
  const organizationNotLocationsKeyword = data?.query?.nGeo && data?.query?.nGeo?.length > 0 ? data?.query?.nGeo : null;
 
  const allChildrens = organizationNotLocationsKeyword
  ? organizationNotLocationsKeyword.flatMap(item => item.children)
  : [];
 
 const organizationKeyword = data?.query?.industry && data?.query?.industry?.length > 0 ? data?.query?.industry : null; 
 const  organizationIdsKeyword = data?.query?.keyword && data?.query?.keyword?.length > 0 ? data?.query?.keyword : null;
 const organizationNumEmployeesRangesKeyword = data?.query?.employees && data?.query?.employees?.length > 0 ? data?.query?.employees : null;
 
 const newData ={
  api_key:apiKey,
  q_organization_name: organizationName,
  organization_locations:organizationLocation,
  organization_not_locations:allChildrens,
  q_organization_keyword_tags:organizationKeyword,
  organization_ids:organizationIdsKeyword,
  organization_num_employees_ranges:organizationNumEmployeesRangesKeyword,
  page: data?.start,
  per_page:data?.page_size
 }
  const { data: result } = await axios.post(url, newData, { headers });
  result.companies = result.organizations; //add a check 
  await RocketReachApiUsage.findOneAndUpdate({ user: user._id },{ $inc: { searchCompany: 1 } },{ upsert: true } );
  const {pagination, companies} = result
  return {pagination, companies};
}

// export async function searchCompany(data, user) {
//   // const url = "https://api.rocketreach.co/api/v2/lookupCompany?domain=google";
//   const url = "https://api.rocketreach.co/api/v2/searchCompany";
//   const apiKey = process.env.ROCKET_REACH_API_KEY;
//   const headers = { "x-api-key": apiKey };
//   data.order_by = "score";

//   if(data.query.naics_code){
//     data.query.naics_code = data.query.naics_code?.filter(code => /^\d+$/.test(code));
//   }

//   if(data.query.sic_code){
//     data.query.sic_code = data.query.sic_code?.filter(code => /^\d+$/.test(code));
//   }

//   const { data: result } = await axios.post(url, data, { headers });
//   await RocketReachApiUsage.findOneAndUpdate({ user: user._id },{ $inc: { searchCompany: 1 } },{ upsert: true } );
//   // const { data: result } = await axios.get(url, { headers });

//   return result;
// }

export async function lookup(id, user) {
  const url = `https://api.rocketreach.co/api/v2/person/lookup?id=${id}`;
  const apiKey = process.env.ROCKET_REACH_API_KEY;
  const headers = { "x-api-key": apiKey };
  try {
    const { data: result } = await axios.get(url, { headers });
    await RocketReachApiUsage.findOneAndUpdate({ user: user._id },{ $inc: { personLookup: 1 } },{ upsert: true } );
    return result;
  } catch (err) {
    throw new HttpErrors.BadRequest(err.response.data.detail);
  }
}

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 200,
});

// async function apiRequestForBulk(ids, user, retryCount = 3, delay = 5000) {
//   let data = {
//     "queries": ids,
//     "profile_list": "API Bulk Lookup",
//     "webhook_id": process.env.BULK_LOOKUP_WEBHOOK_ID,
//   };

//   const apiKey = process.env.ROCKET_REACH_API_KEY;
//   const url = 'https://api.rocketreach.co/api/v2/bulkLookup';
//   let config = {
//     method: 'post',
//     maxBodyLength: Infinity,
//     url: url,
//     headers: {
//       'Api-Key': apiKey,
//       'Content-Type': 'application/json',
//     },
//     data: data,
//   };

//   try {
//     const result = await axios(config);
//     await RocketReachApiUsage.findOneAndUpdate({ user: user._id },{ $inc: { bulkLookup: 1 } },{ upsert: true } );
//     await storeData(result, user);
//   } catch (err) {
//     // console.error('Error making API request:', err);

//     if (err.response && err.response.status === 429 && retryCount > 0) {
//       await new Promise(resolve => setTimeout(resolve, delay));

//       await apiRequestForBulk(ids, user, retryCount - 1, delay);
//       // console.log('API rate limit exceeded, waiting for the next available slot...');
//     } else {
//       // console.error('Unhandled error:', err);
//     }
//   }
// }
// https://api.apollo.io/api/v1/people/bulk_match

export async function useBouncer(dataArray) {
const apikey = process.env.USEBOUNCER_API_KEY;
const url = 'https://api.usebouncer.com/v1.1/email/verify/batch';
let options = {
  method: 'post',
  headers: {
    'x-api-key': apikey,
    'Content-Type': 'application/json'
  },
  body: dataArray,
}
try{
  const { data: result } = await axios.post(url, options.body, { headers: options.headers });
  console.log(result);
}catch(e){
  console.log('----------------ee-------------',e)
}
}


export async function verifyEmail(lead) {
  
  try {
    const emailValue = lead?.email;

    const apikey = process.env.USEBOUNCER_API_KEY;

    const url = `https://api.usebouncer.com/v1.1/email/verify?email=${encodeURIComponent(emailValue)}`;

    const options = {
      method: 'GET',
      headers: {
        'x-api-key': apikey,
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, options);

    if (response.ok) {
      const result = await response.json();
      // console.log('Verification result:', result);
      return result; // Return the result
    } else {
      console.error('Error:', response.status, response.statusText);
      return null; // or handle error case accordingly
    }
  } catch (error) {
    console.error('Exception:', error);
    return null; // or handle error case accordingly
  }
}
export async function verifyDownloadEmail(lead) {  
  try {
    const emailValue = lead[0]?.email;

    const apikey = process.env.USEBOUNCER_API_KEY;

    const url = `https://api.usebouncer.com/v1.1/email/verify?email=${encodeURIComponent(emailValue)}`;

    const options = {
      method: 'GET',
      headers: {
        'x-api-key': apikey,
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, options);

    if (response.ok) {
      const result = await response.json();
      return result; // Return the result
    } else {
      console.error('Error:', response.status, response.statusText);
      return null; // or handle error case accordingly
    }
  } catch (error) {
    console.error('Exception:', error);
    return null; // or handle error case accordingly
  }
}



async function apiRequestForBulk(ids, user, apolloCampaign = false, campaign, retryCount = 3, delay = 5000, requestId) {

  const apiKey = process.env.APOLLO_IO_API_KEY;
  // const url = 'https://api.apollo.io/api/v1/people/bulk_match';
  const url = 'https://api.apollo.io/v1/people/match';
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "reveal_personal_emails": true,
      "api_key": apiKey,
    },
    data: {
      api_key: apiKey,
      reveal_personal_emails: true,
      id: ids[0]?.id, // Assuming ids is an array of details
    },
  };
  try {
    if(apolloCampaign){
      const result = await axios(config);
      await storeCampaignData(result?.data, user, campaign, requestId);
    
    
    }else{
      const result = await axios(config);
      await storeData(result?.data, user, requestId);
    }
   // await RocketReachApiUsage.findOneAndUpdate({ user: user._id },{ $inc: { bulkLookup: 1 } },{ upsert: true } );
  } catch (err) {
    console.error('Error making API request:', err);

    if (err.response && err.response.status === 429 && retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      if(apolloCampaign){
        console.log(`in retry`)
      await apiRequestForBulk(ids, user, apolloCampaign = true ,retryCount - 1, delay);

      }else{
        console.log(`again retry`)
      await apiRequestForBulk(ids, user, apolloCampaign = false ,retryCount - 1, delay);
      }
    } else {
      console.error('Unhandled error:', err);
    }
  }
}

export async function Bulklookup(ids, user, apolloCampaign, campaign, requestId) {
  return limiter.schedule(() => apiRequestForBulk(ids, user, apolloCampaign, campaign, 3, 5000, requestId));
}

export async function suggestions(category,name, user) {
  const url = `https://rocketreach.co/v2/services/search/suggestions?limit=5&${category}=${name}`;

  
  const apiKey = process.env.ROCKET_REACH_API_KEY;
  const headers = { "x-api-key": apiKey };
  try {
    const { data: result } = await axios.get(url, { headers });
    await RocketReachApiUsage.findOneAndUpdate({ user: user._id },{ $inc: { searchSuggestions: 1 } },{ upsert: true } );
    return result;
  } catch (err) {
    throw new HttpErrors.BadRequest(err.response.data.detail);
  }
}

export async function createRecentSearch(query, user) {
  const search = await LeadsSearch.create({
    name: createNameFromQuery(query),
    query,
    type: SearchType.Recent,
    user,
  });

  const searchesToDelete = await LeadsSearch.find({
    type: SearchType.Recent,
    user,
  })
    .select("_id")
    .sort("-createdAt")
    .skip(3);

  await LeadsSearch.deleteMany({ _id: { $in: searchesToDelete } });

  return search;
}

export function createSavedSearch(data, user) {
  return LeadsSearch.create({ ...data, type: SearchType.Saved, user });
}

export function getSearch(filter) {
  return LeadsSearch.find(filter);
}

export function getSearches(filter) {
  return LeadsSearch.find(filter).sort("-createdAt").limit(3);
}

export function editLead(id, data) {
  return LeadsCampaign.findByIdAndUpdate(id, flatObject(data));
}

export function getSavedSearches(user) {
  return LeadsSearch.find({ type: SearchType.Saved, user }).sort("-createdAt");
}

export async function updateSearch(id, update) {
  const search = await LeadsSearch.findByIdAndUpdate(id, update, { new: true });
  if (!search) throw new HttpErrors.NotFound("Search not found");
  return search;
}

export async function deleteSearch(id) {
  const search = await LeadsSearch.findByIdAndDelete(id);
  if (!search) throw new HttpErrors.NotFound("Search not found");
  return search;
}

export async function getLeads(id) {
  return LeadsCampaign.find({
    campaign: id,
  });
}

export async function getLeadsIds(id) {
  const leadIds = await LeadsCampaign.aggregate([
    {
      $match: { campaign: new mongoose.Types.ObjectId(id), test: false }
    },
    {
      $group: {
        _id: null,
        leadIds: { $addToSet: { $toString: "$_id" } }
      }
    },
    {
      $project: {
        _id: 0,
        leadIds: 1
      }
    }
  ]);
  if (leadIds.length > 0) {
    return leadIds[0].leadIds;
  }
  return [];
}

export async function getAllLeads() {
  try {
    const bounceLeads = await LeadsCampaign.find({ status: 'bounced' });

    return bounceLeads;
  } catch (error) {
    // console.error('Error retrieving leads:', error);
    throw error;
  }
}

export async function getBouncedEmails() {
  try {
    const bounceLeads = await LeadsCampaign.aggregate([
      {
        $match: { status: 'bounced' }
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

    return bounceLeads.length > 0 ? bounceLeads[0].emails : [];
  } catch (error) {
    console.error('Error retrieving bounced emails:', error);
  }
}

export async function getLeadsStatus(id) {
  return LeadsCampaign.find({
    campaign: id,
  }).select(['status']);
}

export async function getLeadsData(id) {
  return campaignService.leadCampaignStatus(id);
}

export async function getLead(id) {
  return LeadsCampaign.findById(id);
}

export async function deleteLead(data) {
  const { leads } = data;
  return LeadsCampaign.deleteMany({ _id: { $in: leads } });
}

export async function deleteLeadById(id) {
  try {
    const result = await LeadsCampaign.deleteOne({ _id: id });

    return result; 
  } catch (error) {
    // console.error(`Error deleting lead:`, error);
    throw error; 
  }
}

export async function storeCampaignData(result, user, campaign, requestId) {
  try {
    const responseId = result?.person?.id;
    const sortedLead = result?.person;
    const savedData = await LeadCampaignSaved.findOne({
      user: user._id,
      campaign,
      leadIds: { $ne: [] },
      leadIds: { $in: [responseId] }
    });
    let deductCredits = 0;


    if (savedData) {
      const matchingLead = savedData.leadIds.includes(responseId);

      if (matchingLead) {
        savedData.data = [...savedData.data, sortedLead];

        await LeadCampaignSaved.findOneAndUpdate(
          { _id: savedData._id, __v: savedData.__v },
          { $set: { data: savedData.data } },
          { new: true }
        );
        const totalLeadsCount = savedData.data.length;
        const expectedLeadsCount = savedData.leadIds.length;
        if (totalLeadsCount === expectedLeadsCount) {
          await LeadCampaignSaved.findOneAndUpdate(
            { _id: savedData._id, __v: savedData.__v },
            { $set: { status: 'done', leadIds: [] } },
            { new: true }
          );

        const { creditCounts } = await savedLeadsToCampaign(user, campaign, requestId)
        deductCredits = deductCredits + creditCounts;
      }
    } 
    
    updateRequest(requestId, { usedCredits: deductCredits }, true);
  }
  } catch (error) {
    console.error("Error in storeData:", error);
    throw new HttpErrors.BadRequest(error);
  }
}

export async function savedLeadsToCampaign (user, campaign, requestId){
  let skipNotVerified = 0;
  let saved = 0;
  let creditCounts = 0;
  let skipNullEmail = 0;
  const campaignData = await LeadCampaignSaved.find({
    user: user._id,
    campaign,
    status: "done",
    data: { $ne: [] },
  });
  
  const dataArray = campaignData[0].data;
  const leadCampaign = campaignData[0].campaign;
  const _id = campaignData[0]._id;
  for (const lead of dataArray) {
    try {
      if (lead?.email !== null) {
        const fetchLeads = await fetchLeadData(lead);
        const result = await verifyEmail(lead);
        if (result.status === 'deliverable' ) {
          await saveToCampaign(leadCampaign, user, fetchLeads);
          await checkActiveLeadsCount(user);
          await deductLeadCredit(user);
          saved++;
          creditCounts = creditCounts + 1;
        } else {
          skipNotVerified++;
        }
      } else {
        skipNotVerified++;
      }
    } catch (error) {
      console.error('Error processing lead:', error);
      }
  }
  
  // for (const lead of dataArray) {
  //   if(lead?.email !== null){
  //     const fetchLeads = await fetchLeadData(lead);

  //     await saveToCampaign(leadCampaign, user, fetchLeads);
  //     await checkActiveLeadsCount(user);
  //     await deductLeadCredit(user);
  //     saved++;
  //   } else {
  //     skipNotVerified++;
  //   }
  // }
  const amount = "-" + saved;
  await addLeadUsage(user, amount);
  await LeadCampaignSaved.findByIdAndDelete(_id);
  return {creditCounts};
  // return { skipNotVerified, saved, duplicateSkip };

}

// await deductLeadCredit(user);

export async function storeData(result, user, requestId) {
  try {
    const  responseIds = result?.person?.id;
    const { sortedLeads , skipLeads} = await dataSorting(result?.person, user, requestId);
    const savedData = await LeadSaved.find({
      user: user._id,
      leadIds: { $ne: [] },
      leadIds: { $in: responseIds } 
    });

    let deductCredits = 0;
    
    for (const savedDoc of savedData) {
      // const matchingLeads = responseIds.filter((id) => savedDoc.leadIds.includes(id));
      // const matchingLeads = responseIds.filter(id => savedDoc.leadIds.includes(id));
      // if (matchingLeads.length > 0) {
        const result = await verifyDownloadEmail(sortedLeads);
        if (result.status === 'deliverable' ) {
          savedDoc.data = [sortedLeads[0], ...savedDoc.data];
          savedDoc.skipLeads = (savedDoc.skipLeads || 0) + skipLeads;
          await deductLeadCredit(user);
          // if anyonce changes logic of deduct leads, update below as well.
          deductCredits = deductCredits + 1;
        }
        await LeadSaved.findOneAndUpdate(
          { _id: savedDoc._id, __v: savedDoc.__v },
          {
            $set: {
                data: savedDoc.data,
                skipLeads: savedDoc.skipLeads,
            },
        },
        { new: true }
        );
      // }
      const totalLeadsCount = savedDoc.data.length + savedDoc.skipLeads;
      const expectedLeadsCount = savedDoc.leadIds.length;
      if (totalLeadsCount == expectedLeadsCount) {
        await LeadSaved.findOneAndUpdate(
          { _id: savedDoc._id, __v: savedDoc.__v },
          { $set: { status: 'done', leadIds: [] } },
          { new: true }
        );
      }
    }
    updateRequest(requestId, { usedCredits: deductCredits }, true);
  } catch (error) {
    console.error("Error in storeData:", error);
    throw new HttpErrors.BadRequest(error.response.data.detail);
  }
}

// await deductLeadCredit(user);


// export async function storeData(result, user) {
//   try {
//     const rrRequestId = result.headers['rr-request-id'];

//     const dataObject = JSON.parse(result.config.data);
//     const queriesArray = dataObject.queries;
//     let responseIds;
//     if (Array.isArray(queriesArray)) {
//       responseIds = queriesArray.map(query => query.id);
//     }
//     const savedData = await LeadSaved.find({ user: user._id, leadIds: { $ne: [] }, data: { $eq: [] } });
//     for (const savedDoc of savedData) {
//       const matchingLeads = responseIds.filter((id) => savedDoc.leadIds.includes(id));
//       if (matchingLeads.length > 0) {
//         savedDoc.requestIds = [...savedDoc.requestIds, rrRequestId];
//         await LeadSaved.findOneAndUpdate(
//           { _id: savedDoc._id, __v: savedDoc.__v },
//           { $set: { requestIds: savedDoc.requestIds } },
//           { new: true }
//         );
//       }
//     } 
//   } catch (error) {
//     console.error("Error in storeData:", error);
//     throw new HttpErrors.BadRequest(error.response.data.detail);
//   }
// }


export async function updateMany(filter, data) {
  return LeadsCampaign.updateMany(filter, flatObject(data), {
    new: true,
  });
}

export async function updateLead(id, data) {
  return LeadsCampaign.findByIdAndUpdate(id, flatObject(data), {
    new: true,
  });
}
export async function moveToCampaign(campaign, data) {
  const { leads } = data;
  return updateMany(
    { _id: { $in: leads } },
    { campaign, status: LeadStatus.NotContacted }
  );
}

export async function addToCampaign(data, user) {
  const { campaignId, leads, checkDuplicates } = data;
  const campaign = await campaignService.getCampaign({
    _id: campaignId,
    createdBy: user._id,
  });
  if (!campaign) throw new HttpErrors.NotFound("Campaign not found");

  // let skipNotVerified = 0;
  // let saved = 0;
  // let duplicateSkip = 0;

  const saveLeads = await checkAlreadyExist(
    campaign,
    user,
    leads,
    checkDuplicates
  );

  await LeadCampaignSaved.create({
    user,
    campaign,
    status: "pending",
    leadIds: saveLeads,
  });

  if (checkDuplicates) {
    duplicateSkip = leads.length - saveLeads.length;
  }
  const chunkSize = 1;
  const apolloCampaign = true;
  let campaignData;
  const monitorRequest = await createRequest({user, requestType: "Add to Campaign",  status: "In Progress", leadsCount: saveLeads?.length, totalRequest: Math.ceil(saveLeads?.length/chunkSize)})
  try {
    for (let i = 0; i < saveLeads.length; i += chunkSize) {
     const chunkIds = saveLeads.slice(i, i + chunkSize).map(id => ({id : id}))
     campaignData =  await Bulklookup(chunkIds, user, apolloCampaign, campaign, monitorRequest.id);
    }
  } catch (error) {
    console.error('Error processing data:', error.message);
  }

  // for (const lead of campaignData) {
  //   // const leadEmail = await leadEmails(leadData.emails)
    
  //   // if (leadEmail ||
  //   //   (leadData.recommended_professional_email &&
  //   //     leadData.recommended_professional_email !== "") ||
  //   //     (leadData.current_work_email && leadData.current_work_email !== "")
  //   //     ) {
  //   //       const email = leadEmail || leadData.recommended_professional_email ||
  //   //       leadData.current_work_email;
  //         // const fetchLeads = await fetchLeadData(leadData, email);
  //    if(lead?.email !== null){
  //     const fetchLeads = await fetchLeadData(lead);
  //     await saveToCampaign(campaign, user, fetchLeads);
  //     await checkActiveLeadsCount(user);
  //     await deductLeadCredit(user);
  //     saved++;
  //   } else {
  //     skipNotVerified++;
  //   }
  // }
  // const amount = "-" + saved;
  // await addLeadUsage(user, amount);

  // return { skipNotVerified, saved, duplicateSkip };
  const leadUsage = await LeadsUsage.findOne({ user }).sort({ createdAt: -1 });
  const insertedAmount = leadUsage ? leadUsage.amount.replace('-', '') : null;
  const message = `${insertedAmount} Leads Importing in Process...`
  return message;
}

export async function checkActiveLeadsCount(user) {
  const { activeLeads } = await billingService.findUserPlanUsage(user);
  const usedActiveLeads = await uniboxService.getUserLeadsCount({ user });

  if (usedActiveLeads >= activeLeads) {
    throw new HttpErrors.BadRequest("Insufficient active leads credit balance");
  }
}

export function verifyLeads(array, key, value) {
  if (array.length <= 0) return false;

  return array.some((item) => item[key] === value);
}

export async function checkAlreadyExist(
  campaign,
  createdBy,
  leads,
  checkDuplicateInAll = false
) {
  let leadArray = [];
  for (const lead of leads) {
    if (checkDuplicateInAll) {
      let findAllLead = await LeadsCampaign.findOne({
        createdBy,
        leadId: lead,
      });

      if (!findAllLead) {
        leadArray.push(lead);
      }
    } else {
      let findLead = await LeadsCampaign.findOne({
        campaign,
        createdBy,
        leadId: lead,
      });

      if (!findLead) {
        leadArray.push(lead);
      }
    }
  }

  return leadArray;
}

export async function saveToCampaign(campaign, createdBy, fetchLeads) {
  return LeadsCampaign.create({ campaign, createdBy, ...fetchLeads });
}

export async function fetchLeadData(leadData) {
  // const parts = leadData.name.split(" ");
  // let firstName = "";
  // let lastName = "";

  // if (parts.length === 1) {
  //   firstName = parts[0];
  // } else {
  //   firstName = parts[0];
  //   lastName = parts.slice(1).join(" ");
  // }

  // const phone = await findPhone(leadData.phones);

  const data = {
    leadId: leadData.id,
    firstName: leadData.first_name,
    lastName: leadData.last_name,
    email: leadData.email,
    phone: leadData?.organization?.phone,
    location: leadData?.country,
    companyName: leadData?.organization?.name,
    title: leadData?.title,
    // website: leadData.current_employer_website,
  };

  return data;
}

export async function findPhone(array) {
  if (array.length <= 0) return "";

  let key = LeadFind.PhoneKey;
  let value = LeadFind.Verify;
  let foundItem = array.find((item) => item[key] === value);

  if (foundItem) return foundItem["number"];
  else return array[0]["number"];
}

// export async function deductLeadCredit(user) {
//   const { leadsCredits,dailyLeadsCredits } = await billingService.findUserPlanUsage(user);
//   return billingService.updateUserUsage(user, {
//     leadsCredits: leadsCredits - 1,
//     dailyLeadsCredits : dailyLeadsCredits - 1,
//   });
// }
export async function deductLeadCredit(user) {
  const planUsage = await billingService.findUserPlanUsage(user);

  if (!planUsage || !planUsage.dailyLeadsCredits) {
    await billingService.updateUserUsage(user, {
      dailyLeadsCredits: 500,
    });
  }

  const { leadsCredits, dailyLeadsCredits } = await billingService.findUserPlanUsage(user);

  return billingService.updateUserUsage(user, {
    leadsCredits: leadsCredits - 1,
    dailyLeadsCredits: dailyLeadsCredits - 1,
  });
}



const filterLeadData = (lead) => {
  return {
    name: lead?.name ? lead?.name : "",
    first_name: lead?.first_name ? lead?.first_name : "",
    last_name: lead?.last_name ? lead?.last_name : "",
    email: lead?.email ? lead?.email : "",
    email_status: lead?.email_status ? lead?.email_status : "",
    title: lead?.title ? lead?.title : "",
    company: lead?.organization?.name ? lead?.organization?.name : "",
    industry: lead?.organization?.industry ? lead?.organization?.industry : "",
    phones: lead?.phone ? lead?.phone : "",
    location: lead?.city ? lead?.city : "",
    profile_pic: lead?.profile_pic ? lead?.profile_pic : "",
    linkedin_url: lead?.linkedin_url ? lead?.linkedin_url : "",
    // current_title: lead?.current_title ? lead?.current_title : "",
    // normalized_title: lead?.normalized_title ? lead?.normalized_title : "",
    // current_employer: lead?.current_employer ? lead?.current_employer : "",
    // current_employer_id: lead?.current_employer_id
    //   ? lead?.current_employer_id
    //   : "",
    // current_employer_domain: lead?.current_employer_domain
    //   ? lead?.current_employer_id
    //   : "",
    // current_employer_website: lead?.current_employer_website
    //   ? lead?.current_employer_id
    //   : "",
    // birth_year: lead?.birth_year ? lead?.birth_year : "",
    // recommended_personal_email: lead?.recommended_personal_email
    //   ? lead?.recommended_personal_email
    //   : "",
    // recommended_professional_email: lead?.recommended_professional_email
    //   ? lead?.recommended_professional_email
    //   : "",
    // current_work_email: lead?.current_work_email
    //   ? lead?.current_work_email
    //   : "",
    // current_employer_linkedin_url: lead?.current_employer_linkedin_url
    //   ? lead?.current_employer_linkedin_url
    //   : "",
  };
};

export async function leadsLookup(ids, name, user) {
  const jobData = { ids, user };

  try {
    await LeadSaved.create({
      user,
      name,
      status: "pending",
      leadIds: ids,
    });
    const chunkSize = 1; // Needs to update when chunksize changed
    const monitorRequestId = await createRequest({user, requestType: "Bulk Lookup",  status: "In Progress", leadsCount: ids?.length, totalRequest: Math.ceil(ids?.length/ chunkSize) })
    if(ids.length > 100) {
      await bulkLookupQueue.add('bulkLookupJob', {...jobData, requestId: monitorRequestId?._id }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
      { removeOnComplete: true, removeOnFail: 1000 },
      );
  } else {
      await bulkLookupQueueLimit.add('bulkLookupJobLimit', {...jobData, requestId: monitorRequestId?._id}, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
      { removeOnComplete: true, removeOnFail: 1000 },
      );
  }

    return { message: 'Importing leads: In progress...' };
  } catch (error) {
    console.error('Error in leadsLookup:', error.message);
    throw error;
  }
}

export async function leadsCsvStatusUpdate() {
  try{
    // logger.log(`start updatingCsvStatus cron function Start, ${new Date()}`);
    const ONE_HOUR_IN_MS = 60 * 60 * 1000;
    const oneHourAgo = new Date(Date.now() - ONE_HOUR_IN_MS);

    const query = {
      $and: [
        { status: 'pending' },
        { updatedAt: { $lt: oneHourAgo } }
      ]
    };
      const csvList = await LeadSaved.updateMany(query, { $set: { status: 'done', leadIds: [] } });
      // logger.log(`End updatingCsvStatus cron function Start, ${new Date()}`);
  }catch(e){
    // console.error('An error occurred:', e);
    // logger.log(`Error updatingCsvStatus cron function: ${e}`);
  }
}

export async function dailyLeadsCreditsStatusUpdate() {
  try{
    await PlanUsage.updateMany({}, { $set: { dailyLeadsCredits: 500 } });
    console.log('Daily Leads Credits updated successfully for all users.');
  }catch(error){
    console.error('Error updating Daily Leads Credits:', error);
  }
}

export async function leadsCampaignStatusUpdate() {
  try {
    const campaignList = await Campaign.find();
    for (let campaign of campaignList) {
      const allLeads = await LeadsCampaign.find({
        campaign: campaign._id,
        status: {
          $in: [
            LeadStatus.Contacted,
            LeadStatus.NotContacted,
            LeadStatus.Completed,
          ],
        },
      });
      let isCampaignSequenceCompleted = true;
      for (let lead of allLeads) {
        if (lead.status === LeadStatus.Completed) continue;
        let isLeadSequenceCompleted = true;
        const campaignSequence = await campaignService.getLastSequence({
          campaign: lead.campaign,
        });
        const leadSequence = await campaignService.getLeadLastSequence(
          lead._id,
          lead.campaign
        );
        if (
          campaignSequence &&
          leadSequence &&
          campaignSequence?.step === leadSequence?.sequence_step
        ) {
          const leadsResult = await LeadsCampaign.findByIdAndUpdate(
            lead._id,
            {
              status: LeadStatus.Completed,
            },
            { new: true }
          );
        } else {
          isLeadSequenceCompleted = false;
          isCampaignSequenceCompleted = false;
        }
      }
      if (allLeads.length > 0 && isCampaignSequenceCompleted) {
        const campaignResult = await campaignService.updateCampaign(
          campaign._id,
          {
            status: CampaignStatus.Completed,
          }
        );
      } else {
        // console.log("Campaign not completed");
      }
    }
  } catch (error) {
    // logger.log(error);
  }
}

export async function addLeadUsage(user, amount) {
  return LeadsUsage.create({
    user,
    amount,
  });
}

export async function getLeadUsage(user) {
  const leads = await LeadsUsage.find({
    user: user,
  }).sort("-createdAt");

  const leadsDate = _.compact(
    leads.map((data) => {
      if (data.amount !== "-0")
        return {
          data,
        };
      else return null;
    })
  );

  return leadsDate;
}

export async function saveDownloadFile(user, data) {
  return LeadSaved.create({
    user,
    ...data,
  });
}

export async function getSaveDownloadFile(user) {
  return LeadSaved.find({
    user: user,
  }).sort("-createdAt");
}

export async function deleteEmailLead(data, user) {

  try {
    const { email, allCampaign = false, allDomain = false, blocklist = false } = data

    const ids = await LeadsCampaign.find({
      email
    }).select("_id")

    let emailIds = []

    ids.forEach((element) => {
      emailIds.push(element._id)
    })

    await uniboxService.deleteMultipleEmails(emailIds)

    if (allDomain) {
      const domain = await utils.getDomainFromEmail(email)
      await LeadsCampaign.deleteMany({
        email: { $regex: new RegExp(`@${domain}$`, 'i') },
        createdBy: user
      })
    }

    if (allCampaign) {
      await LeadsCampaign.deleteMany({
        email,
        createdBy: user
      })
    }

    if (blocklist) {
      await warmupService.createBlocklist(email, user)
    }

    return true
  } catch (err) {
    throw new HttpErrors.BadRequest("Something went wrong.")
  }

}

export async function leadEmails(emails){

  const invalidEmailGrades = ['B', 'C', 'D', 'E', 'F']; // allow only A
  const excEmailGradesPattern = new RegExp(
    `${invalidEmailGrades.join('|')}`,
    'i',
  );

  const defaultExcEmailDomsList = [
    'aol',
    'gmail',
    'hotmail',
    'icloud',
    'laposte',
    'live',
    'mac',
    'msn',
    'outlook',
    'sina',
    'yahoo',
    'zoho',
  ];
  const excEmailDomsPattern = new RegExp(
    `${defaultExcEmailDomsList.join('|')}`,
    'i',
  );

  emails = emails.filter(
    (emailObj) =>
      emailObj.smtp_valid !== 'invalid' &&
      // !invalidEmailGrades.includes(emailObj.grade)
      !excEmailGradesPattern.test(emailObj.grade) &&
      // emailObj.type === 'professional',
      !excEmailDomsPattern.test(emailObj.email.split('@')[1]),
  );
  emails.sort((a, b) => {
    if (a.grade === b.grade) {
      if (a.type === 'professional') return -1;
      if (b.type === 'professional') return 1;
      return 0;
    }
    if (a.grade > b.grade) return 1;
    if (a.grade < b.grade) return -1;
  });

  if(emails.length >= 1 )
    return emails[0]?.email
  else 
    return null

}

function getResponseTImeInSeconds(createdAt) {
  const createdDate = new Date(createdAt);
  const currentDate = new Date();
  const differenceInMilliseconds = currentDate - createdDate;
  return differenceInMilliseconds / 1000;
}

export async function processBulkLookupLeads(leads, requestId) {
  try {
    const savedData = await LeadSaved.findOne({
      requestIds: { $in: requestId },
      leadIds: { $ne: [] } 
    });
    const { sortedLeads, skipLeads } = await dataSorting(leads, savedData.user, requestId);

      const isRequestIdPresent = savedData?.requestIds?.includes(requestId) || false;
      if (isRequestIdPresent) {
        savedData.data = [...savedData.data, ...sortedLeads];
        savedData.skipLeads = (savedData.skipLeads || 0) + skipLeads;

        await LeadSaved.findOneAndUpdate(
          { _id: savedData._id, __v: savedData.__v },
          { $set: { data: savedData.data, skipLeads: savedData.skipLeads } },
          { new: true }
        );
      }
      const totalLeadsCount = savedData.data.length + savedData.skipLeads;
      const expectedLeadsCount = savedData.leadIds.length;
      if (totalLeadsCount == expectedLeadsCount) {
        await LeadSaved.findOneAndUpdate(
          { _id: savedData._id, __v: savedData.__v },
          { $set: { status: 'done', leadIds: [] } },
          { new: true }
        );
      }
    } catch (error) {
    // console.error('Error:', error);
  }
}

export async function dataSorting(leadsData, user) {
try{
  // if(leadsData != undefined && leadsData.length > 0) {
  const sortedLeads = [];
  let skipLeads = 0;
  let filterLeads;
  // const userData = await User.findById({_id: user})
  // for (const lead of leadsData) {
      if(leadsData.email !== null){
        // sortedLeads.push(filterLeadData(leadsData));
        filterLeads =  filterLeadData(leadsData);
        sortedLeads.push(filterLeads);
        // await deductLeadCredit(user);
    } else {
      skipLeads = skipLeads + 1;
    }
  // // }
    const amount = "-" + sortedLeads.length;
    await addLeadUsage(user, amount);
    return {sortedLeads, skipLeads };
//  }
} catch(e){
  console.log(`err`, e);
}
}



// export async function dataSorting(leadsData, user) {
//   if (!Array.isArray(leadsData) || leadsData.length === 0) {
//     console.error("Invalid or empty leads data provided.");
//     return { sortedLeads: [], skipLeads: 0 };
//   }

//   const sortedLeads = [];
//   let skipLeads = 0;

//   // for (const lead of leadsData) {
//     if (leadsData && leadsData.email !== null) {
//       const leaddata = sortedLeads.push(filterLeadData(leadsData));
//       console.log(`leaddata`,leaddata);
//       await deductLeadCredit(user);
//     } else {
//       skipLeads++;
//     }
//   // }

//   const amount = "-" + sortedLeads.length;
//   await addLeadUsage(user, amount);

//   return { sortedLeads, skipLeads };
// }

async function fetchAllLeads(url, data,newData, headers, user){
  const pageSize = 100; // adjust this based on your pagination size
  let responseFromRequest = null;
  let allLeads = [];

  // Start fetching with initial parameters
  let start = 1;

  // let newData = {
  //   order_by: "score",
  //   page_size: pageSize,
  //   query: data?.query,
  // }

  while(true){
      const remainingCount = data?.totalSelected - allLeads?.length;
      // Added cases for rocket reach limitation on start, as it has to be less than 10000
      if(remainingCount < 100 ){
        if((start + remainingCount) >= 10000 || start >= 10000){
          break;
        }
        newData = {...newData, page_size: remainingCount}
      }
      const { data: results } = await axios.post(url, {...newData, start}, headers);
      await RocketReachApiUsage.findOneAndUpdate({ user: user._id },{ $inc: { searchPerson: 1 } },{ upsert: true } );
      const { pagination, people } = results;

      // set pagination data 
      responseFromRequest = results;

      // Add fetched profiles to the result array
      allLeads = allLeads.concat(people);

      // Update start for the next iteration
      start = pagination.next;

      // If end param is passed, break the loop if start is greater than end
      if(data?.end && start > data?.end){
        allLeads = allLeads.slice(0, data?.end);
        break;
      }

      // Check if we have reached the end
      if (people?.length == 0 || allLeads?.length >= data.totalSelected) {
        break;
      }
  }

  return {
    pagination: {
      start: 1,
      next: responseFromRequest?.pagination?.next,
      total: responseFromRequest?.pagination?.total
    },
    people: allLeads
  }

}
