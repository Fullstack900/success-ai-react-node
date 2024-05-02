import Joi from 'joi';
import HttpErrors from 'http-errors';
import SortBy from './enum/sort-by.enum.js';
import CampaignStatus from './enum/campaign-status.enum.js';
import LeadStatus from '../leads/enum/lead-status.enum.js';

export function validateGetCampaigns(req, res, next) {
  const { error } = Joi.object({
    search: Joi.string(),
    filter: Joi.string().valid(...Object.values(CampaignStatus)),
    sortBy: Joi.string().valid(...Object.values(SortBy)),
    offset: Joi.number().integer().min(0),
    limit: Joi.number().integer().min(0),
    unibox: Joi.boolean(),
    zone: Joi.string()
  }).validate(req.query);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateCreateLeads(req, res, next) {
  const { error } = Joi.object({
    leads: Joi.array()
      .items(
        Joi.object({
          // email: Joi.string().email().error((errors) => {
          //   const index = errors[0].path[1];
          //   return new Error(`The "email" field at row ${index} should be a valid email address`);
          // }),
          email: Joi.string(),
          firstName: Joi.string(),
          lastName: Joi.string(),
          iceBreaker: Joi.string(),
          companyName: Joi.string(),
          phone: Joi.string(),
          website: Joi.string(),
          variables: Joi.array().items(
            Joi.object({
              variableTitle: Joi.string().allow("", null).optional(),
              variableValue: Joi.string().allow("", null).optional(),
            })
          ),
        })
      )
      .required(),
    checkDuplicates: Joi.boolean().required(),
  }).validate(req.body);
  if (error) {
    if (error.details) {
      throw new HttpErrors.BadRequest(error.details[0].message)
    } else {
      throw new HttpErrors.BadRequest(error.message)
    }
  };
  next();
}

export function validateGetLeads(req, res, next) {
  const { error } = Joi.object({
    search: Joi.string(),
    filter: Joi.string().valid(...Object.values(LeadStatus)),
    offset: Joi.number().integer().min(0),
    limit: Joi.number().integer().min(0),
  }).validate(req.query);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateCreateSequence(req, res, next) {
  const { error } = Joi.object({
    subject: Joi.string().allow(""),
    body: Joi.string().required(),
    waitDays: Joi.number().integer(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateUpdateSequence(req, res, next) {
  const { error } = Joi.object({
    subject: Joi.string().allow(""),
    body: Joi.string(),
    waitDays: Joi.number().integer(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateUpdateSequenceOrder(req, res, next) {
  const { error } = Joi.object({
    fromStep: Joi.number().integer().min(1).required(),
    toStep: Joi.number().integer().min(1).required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateUpdateSchedule(req, res, next) {
  const { error } = Joi.object({
    name: Joi.string(),
    sun: Joi.boolean(),
    mon: Joi.boolean(),
    tue: Joi.boolean(),
    wed: Joi.boolean(),
    thu: Joi.boolean(),
    fri: Joi.boolean(),
    sat: Joi.boolean(),
    from: Joi.string(),
    to: Joi.string(),
    timezone: Joi.string(),
    isDefault: Joi.boolean(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}
