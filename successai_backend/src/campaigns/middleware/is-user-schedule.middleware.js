import * as campaignService from '../campaign.service.js';
import HttpErrors from 'http-errors';

export default async function isUserSchedule(req, res, next) {
  const campaign = await campaignService.getSchedule({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!campaign) throw new HttpErrors.NotFound('Schedule not found');
  next();
}
