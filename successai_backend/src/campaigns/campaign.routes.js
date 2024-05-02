import express from 'express';
import auth from '../common/middleware/auth.middleware.js';
import * as campaignController from './campaign.controller.js';
import {
  validateCreateLeads,
  validateCreateSequence,
  validateGetCampaigns,
  validateGetLeads,
  validateUpdateSchedule,
  validateUpdateSequence,
  validateUpdateSequenceOrder,
} from './campaign.validator.js';
import isUserCampaign from './middleware/is-user-campaign.middleware.js';
import isUserSchedule from './middleware/is-user-schedule.middleware.js';
import isUserSequence from './middleware/is-user-sequence.middleware.js';
import checkEmailVerified from '../common/middleware/verified.middleware.js';

const router = express.Router();

router.post('/', auth, campaignController.createCampaign);
router.get('/', [auth, validateGetCampaigns], campaignController.getCampaigns);
router.get('/analytics', [auth], campaignController.getAccountAnalytics);
router.get('/names', [auth], campaignController.getCampaignNames);
router.get('/:id', [auth,isUserCampaign], campaignController.getCampaign);
router.get('/:id/analytics', [auth], campaignController.getCampaignAnalyticsGraphData);
router.put('/:id', [auth, isUserCampaign], campaignController.updateCampaign);
router.put(
  '/:id/pause',
  [auth, isUserCampaign],
  campaignController.pauseCampaign
);
router.put(
  '/:id/resume',
  [auth, isUserCampaign],
  campaignController.resumeCampaign
);
router.delete(
  '/:id',
  [auth, isUserCampaign],
  campaignController.deleteCampaign
);

router.post(
  '/:id/leads',
  [auth, isUserCampaign],
  campaignController.createLeads
);

router.post(
  '/:id/duplicate/leads',
  [auth, isUserCampaign],
  campaignController.duplicateCheck
);

router.get(
  '/:id/leads',
  [auth, isUserCampaign, validateGetLeads],
  campaignController.getLeads
);

router.post(
  '/:id/sequences',
  [auth, isUserCampaign, validateCreateSequence],
  campaignController.createSequence
);
router.put(
  '/:id/sequences/order',
  [auth, isUserCampaign, validateUpdateSequenceOrder],
  campaignController.updateSequenceOrder
);
router.post(
  '/sequences/:id/copy',
  [auth, isUserSequence],
  campaignController.copySequence
);
router.put(
  '/sequences/:id',
  [auth, isUserSequence, validateUpdateSequence],
  campaignController.updateSequence
);
router.delete(
  '/sequences/:id',
  [auth, isUserSequence],
  campaignController.deleteSequence
);

router.post(
  '/:id/schedules',
  [auth, isUserCampaign],
  campaignController.createSchedule
);
router.put(
  '/schedules/:id',
  [auth, isUserSchedule, validateUpdateSchedule],
  campaignController.updateSchedule
);

router.delete(
  '/schedules/:id',
  [auth, isUserSchedule],
  campaignController.deleteSchedule
);

router.get('/get_templates/:id', auth, campaignController.getTemplates);
router.post('/templates', auth, campaignController.createTemplates);
router.post('/set/options', auth, campaignController.setOptions);
router.post('/set/testOptions', auth, campaignController.setTestOptions);

router.post('/write_email', auth, campaignController.getEmailBody);
router.post('/optimize_email', auth, campaignController.optimizeEmailBody);
router.post(
  '/launch/:id',
  [auth, isUserCampaign,checkEmailVerified],
  campaignController.launchCampaign
);
router.get(
  '/get-variables/:id',
  [auth, isUserCampaign],
  campaignController.getVariables
);
router.get('/track/:id', campaignController.getOpenTrack);
router.get('/track/clicked/:id/:mongoDBId', campaignController.getClickTrack);
router.get('/track/unsubscribe/:id', campaignController.getUnsubTrack);
// router.post('/generate', campaignController.generateDynamicContent);
router.get('/get_campaign_analytics/:id', [auth,isUserCampaign], campaignController.getCampaignAnalytics);
router.get('/analytics/stats', auth, campaignController.getAnalytics);

router.post('/create/label', auth, campaignController.createLabel)
router.get('/get/label', auth, campaignController.getLabels)
router.put('/updatelabel/:campaignEmailId/:labelId', auth, campaignController.updateCampaignEmail)
router.post('/bounce-mails', campaignController.findBounceMail_webhook)
router.post('/email-sending-webhook', campaignController.emailSending_webhook)
router.post('/email-rejection-error', campaignController.emailRejection_webhook)

export default router;
