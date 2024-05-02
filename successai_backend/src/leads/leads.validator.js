import Joi from 'joi';
import HttpErrors from 'http-errors';

export function validateFindLeads(req, res, next) {
  const { error } = Joi.object({
    all_results: Joi.boolean(),
    start: Joi.number().integer().min(1),
    end: Joi.number().integer().min(1),
    page_size: Joi.number().integer(),
    query: Joi.object().required(),
    totalSelected: Joi.number(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateCreateSearch(req, res, next) {
  const { error } = Joi.object({
    name: Joi.string().required(),
    query: Joi.object().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateUpdateSearch(req, res, next) {
  const { error } = Joi.object({
    name: Joi.string(),
    query: Joi.object(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateAddLeadsToCampaign(req, res, next) {
  const { error } = Joi.object({
    campaignId: Joi.string().required(),
    leads: Joi.array().min(1).required(),
    checkDuplicates: Joi.boolean(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}
