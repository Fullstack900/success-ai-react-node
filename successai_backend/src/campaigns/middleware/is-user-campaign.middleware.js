import * as campaignService from '../campaign.service.js';
import HttpErrors from 'http-errors';

export default async function isUserCampaign(req, res, next) {
  const campaign = await campaignService.getCampaign({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!campaign) throw new HttpErrors.NotFound('Campaign not found');
  next();
}
