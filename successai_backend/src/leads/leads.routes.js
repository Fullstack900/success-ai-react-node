import express from "express";
import auth from "../common/middleware/auth.middleware.js";
import * as leadsController from "./leads.controller.js";
import {
  validateAddLeadsToCampaign,
  validateCreateSearch,
  validateFindLeads,
  validateUpdateSearch,
} from "./leads.validator.js";
import isUserSearch from "./middleware/is-user-search.middleware.js";
import checkAvailableLeadCredit from "./middleware/is-available-lead-balance.middlware.js";
import isUserCampaign from "../campaigns/middleware/is-user-campaign.middleware.js";
import isLeadAvailable from "./middleware/is-lead-available.middlware.js";
import checkEmailVerified from "../common/middleware/verified.middleware.js";

const router = express.Router();


router.post(
"/suggestions",
[auth, checkEmailVerified],
leadsController.suggestions
);

router.post(
  "/find",
  [auth, checkEmailVerified, validateFindLeads],
  leadsController.find
);

router.post(
  "/searchCompany",
  [auth, checkEmailVerified],
  leadsController.searchCompany
);

router.post(
  "/lookup",
  [auth, checkEmailVerified, checkAvailableLeadCredit],
  leadsController.leadsLookup
);

router.get(
  "/searches",
  [auth, checkEmailVerified],
  leadsController.getSearches
);
router.get(
  "/searches/saved",
  [auth, checkEmailVerified],
  leadsController.getSavedSearches
);
router.post(
  "/searches/saved",
  [auth, checkEmailVerified, validateCreateSearch],
  leadsController.createSavedSearch
);
router.put(
  "/searches/:id",
  [auth, checkEmailVerified, isUserSearch, validateUpdateSearch],
  leadsController.updateSearch
);
router.delete(
  "/searches/:id",
  [auth, checkEmailVerified, isUserSearch],
  leadsController.deleteSearch
);
router.post(
  "/add-to-campaign",
  [
    auth,
    checkEmailVerified,
    validateAddLeadsToCampaign,
    checkAvailableLeadCredit,
  ],
  leadsController.addToCampaign
);

router.get(
  "/:id",
  [auth, checkEmailVerified, isUserCampaign],
  leadsController.getLeads
);
router.put(
  "/:id",
  [auth, checkEmailVerified, isLeadAvailable],
  leadsController.editLead
);
router.delete("/", [auth, checkEmailVerified], leadsController.deleteLead);
router.get(
  "/lead/usage",
  [auth, checkEmailVerified],
  leadsController.getLeadUsage
);
router.get(
  "/saved/files",
  [auth, checkEmailVerified],
  leadsController.getSaveDownloadFile
);
router.post(
  "/save/csv",
  [auth, checkEmailVerified],
  leadsController.saveDownloadFile
);

router.post(
  "/move-to-campaign/:id",
  [auth, checkEmailVerified, isUserCampaign],
  leadsController.moveToCampaign
);

router.post('/bulk_people_lookup_webhook', leadsController.bulk_people_lookup_webhook);

router.delete("/email", [auth, checkEmailVerified], leadsController.deleteEmailLead);

export default router;
