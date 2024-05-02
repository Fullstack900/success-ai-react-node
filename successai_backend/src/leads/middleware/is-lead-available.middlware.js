import * as leadService from '../leads.service.js';
import HttpErrors from 'http-errors';

export default async function isLeadAvailable(req, res, next) {
  const search = await leadService.getLead({
    _id: req.params.id,
  });
  if (!search) throw new HttpErrors.NotFound('Lead not found');
  next();
}
