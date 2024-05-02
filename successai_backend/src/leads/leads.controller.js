import SearchType from './enum/search-type.enum.js';
import * as leadService from './leads.service.js';

export async function find(req, res) {
  try {
    const result = await leadService.find({
      order_by: 'popularity',
      ...req.body,
    }, req.user);

    await leadService.createRecentSearch(req.body.query, req.user);

    res.send(result);
  } catch (error) {
    res.status(error).send(error);
  }
}

export async function searchCompany(req, res) {
  try {
    const result = await leadService.searchCompany({
      order_by: 'popularity',
      ...req.body,
    }, req.user);

    await leadService.createRecentSearch(req.body.query, req.user);

    res.send(result);
  } catch (error) {
    res.status(error.response.status).send(error.response.data);
  }
}

export async function suggestions(req, res) {
  const result = await leadService.suggestions(req.body.category, req.body.name, req.user);
  res.send({ result, message: "Suggestions sent successfully" });
}

export async function leadsLookup(req, res) {
  try {
    const result = await leadService.leadsLookup(req.body.leads,req.body.name,req.user);
    res.send(result);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send({ message: 'Internal Server Error' });
  }
}

export async function createSavedSearch(req, res) {
  const search = await leadService.createSavedSearch(req.body, req.user._id);
  res.send({ message: 'Search saved', search });
}

export async function getSearches(req, res) {
  const saved = await leadService.getSearches({
    type: SearchType.Saved,
    user: req.user,
  });

  const recent = await leadService.getSearches({
    type: SearchType.Recent,
    user: req.user,
  });

  res.send({ saved, recent });
}

export async function getSavedSearches(req, res) {
  const savedSearches = await leadService.getSavedSearches(req.user);
  res.send(savedSearches);
}

export async function editLead(req, res) {
  // console.log(`reqjundlkjsadlk`, req.body)
  const leads = await leadService.editLead(req.params.id, req.body)
  res.send({ message: "Lead edit successfully", leads });
}

export async function updateSearch(req, res) {
  const search = await leadService.updateSearch(req.params.id, req.body);
  res.send({ message: 'Search updated', search });
}

export async function deleteSearch(req, res) {
  const search = await leadService.deleteSearch(req.params.id);
  res.send({ message: 'Search deleted', search });
}

export async function addToCampaign(req, res) {
  const leads = await leadService.addToCampaign(req.body, req.user);
  res.send({ message: leads});
    // `${leads.saved} lead(s) added to campaign \n ${leads.skipNotVerified + leads.duplicateSkip} leads skipped`, leads });
}

export async function moveToCampaign(req, res) {
  const lead = await leadService.moveToCampaign(req.params.id, req.body);
  res.send({ message: 'Lead moved successfully', lead });
}

export async function getLeads(req, res) {
  const leads = await leadService.getLeadsData(req.params.id);
  res.send(leads);
}

export async function deleteLead(req, res) {
  const lead = await leadService.deleteLead(req.body);
  res.send({ message: 'Lead deleted', lead });
}

export async function getLeadUsage(req, res) {
  const leadUsage = await leadService.getLeadUsage(req.user);
  res.send(leadUsage);
}

export async function saveDownloadFile(req, res) {
  const leadSave = await leadService.saveDownloadFile(req.user, req.body)
  res.send(leadSave)
}

export async function getSaveDownloadFile(req, res) {
  const downloadFiles = await leadService.getSaveDownloadFile(req.user)
  res.send(downloadFiles)
}


export async function deleteEmailLead(req, res) {

  const deletelead = await leadService.deleteEmailLead(req.body, req.user)
  res.send({ message: "Lead deleted Successfully" })

}

function getHeaderValue(headers, key) {
  const keyIndex = headers.indexOf(key);
  return keyIndex !== -1 ? headers[keyIndex + 1] : null;
}

export async function bulk_people_lookup_webhook(req, res) {
  try {
    // console.log(`Complete`, req.complete);
    const rrRequestId = getHeaderValue(req.rawHeaders, 'Rr-Request-Id');

    const leads = await leadService.processBulkLookupLeads(req.body, rrRequestId);
    res.status(200).send("Successful")
  } catch (error) {
    // console.error("Error in webhook:", error);
    res.status(500).send("Internal Server Error");
  }
}
