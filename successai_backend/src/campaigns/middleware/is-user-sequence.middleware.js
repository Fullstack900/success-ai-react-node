import * as campaignService from '../campaign.service.js';
import HttpErrors from 'http-errors';

export default async function isUserSequence(req, res, next) {
  const campaign = await campaignService.getSequence({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!campaign) throw new HttpErrors.NotFound('Sequence not found');
  next();
}
