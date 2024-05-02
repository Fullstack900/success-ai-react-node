import * as leadService from '../leads.service.js';
import HttpErrors from 'http-errors';

export default async function isUserSearch(req, res, next) {
  const search = await leadService.getSearch({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!search) throw new HttpErrors.NotFound('Search not found');
  next();
}
