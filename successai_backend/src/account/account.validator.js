import Joi from 'joi';
import HttpErrors from 'http-errors';
import SearchFilter from './enum/search-filter.enum.js';

export function validateConnectGoogleAccount(req, res, next) {
  const { error } = Joi.object({
    code: Joi.string().required().error(new Error('Gmail oauth required')),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.message);
  next();
}

export function validateConnectMicrosoftAccount(req, res, next) {
  const { error } = Joi.object({
    code: Joi.string().required().error(new Error('Outlook oauth required')),
    update: Joi.boolean(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.message);
  next();
}

export function validateConnectGoogleImapSmtp(req, res, next) {
  const { error } = Joi.object({
    name: Joi.object({
      first: Joi.string().allow('').optional(),
      last: Joi.string().allow('').optional(),
    }),
    email: Joi.string().lowercase().email().required(),
    // signature: Joi.string(),
    password: Joi.string().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateConnectCustomImapSmtpAccount(req, res, next) {
  const { error } = Joi.object({
    name: Joi.object({
      first: Joi.string().allow('').optional(),
      last: Joi.string().allow('').optional(),
    }),
    email: Joi.string().lowercase().email().required(),
    // signature: Joi.string(),
    imap: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      host: Joi.string().required(),
      port: Joi.number().integer().required(),
    }).required(),
    smtp: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      host: Joi.string().required(),
      port: Joi.number().integer().required(),
    }).required(),
    replyTo: Joi.string().email().allow(''),
    campaign: Joi.object({
      dailyLimit: Joi.number().integer(),
      waitTime: Joi.number().integer(),
    }),
    warmup: Joi.object({
      enabled: Joi.boolean(),
      basicSetting: Joi.object({
        increasePerDay: Joi.number().integer().min(1).max(4),
        slowWarmupDisabled: Joi.boolean(),
        limitPerDay: Joi.number().integer().min(1).max(50),
        replyRate: Joi.number().integer().min(0).max(100),
        alertBlock: Joi.boolean(),
      }),
      advanceSetting: Joi.object({
        weekdayOnly: Joi.boolean(),
        readEmulation: Joi.boolean(),
        customTrackingDomain: Joi.boolean(),
        openRate: Joi.number().integer().min(0).max(100),
        spamProtectionRate: Joi.number().integer().min(0).max(100),
        markImportantRate: Joi.number().integer().min(0).max(100),
      }),
    }),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateGetAll(req, res, next) {
  const { error } = Joi.object({
    search: Joi.string(),
    filter: Joi.string().valid(...Object.values(SearchFilter)),
    offset: Joi.number().integer().min(0),
    limit: Joi.number().integer().min(0),
    unibox: Joi.boolean(),
  }).validate(req.query);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateUpdate(req, res, next) {
  const originalSignature = req.body.signature;
  const { error } = Joi.object({
    name: Joi.object({
      first: Joi.string().allow('').optional(),
      last: Joi.string().allow('').optional(),
    }),
    accountStatus: Joi.boolean(),
    signature: Joi.string().allow('', null),
    replyTo: Joi.string().email().allow('', null).label('Reply to'),
    campaign: Joi.object({
      dailyLimit: Joi.number().integer(),
      waitTime: Joi.number().integer(),
    }),
    customDomain: Joi.object({
      isEnable: Joi.boolean(),
      name: Joi.string().allow(''),
    }),
    warmup: Joi.object({
      basicSetting: Joi.object({
        increasePerDay: Joi.number().integer().min(1).max(4),
        slowWarmupDisabled: Joi.boolean(),
        limitPerDay: Joi.number().integer().min(1).max(50),
        replyRate: Joi.number().integer().min(0).max(100),
        alertBlock: Joi.boolean(),
      }),
      advanceSetting: Joi.object({
        weekdayOnly: Joi.boolean(),
        readEmulation: Joi.boolean(),
        customTrackingDomain: Joi.boolean(),
        openRate: Joi.number().integer().min(0).max(100),
        spamProtectionRate: Joi.number().integer().min(0).max(100),
        markImportantRate: Joi.number().integer().min(0).max(100),
      }),
    }),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  // next();
  if (req.body.signature === null || req.body.signature === '') {
    req.body.signature = null;
  } else {
    req.body.signature = originalSignature;
  }

  next();
}

export function validateBulkDelete(req, res, next) {
  const { error } = Joi.object({
    deleteAll: Joi.boolean(),
    ids: Joi.array().items(Joi.string()).min(1),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateTestImapOrSmtp(req, res, next) {
  const { error } = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    host: Joi.string().required(),
    port: Joi.number().integer().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}
