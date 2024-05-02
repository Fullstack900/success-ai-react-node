import Joi from 'joi';
import HttpErrors from 'http-errors';

export function validateRegister(req, res, next) {
  const { error } = Joi.object({
    name: Joi.object({
      first: Joi.string().required(),
      last: Joi.string().required(),
    }).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    sumo: Joi.string().allow('', null),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}
export function ValidateAppSumo(req, res, next) {
  const { error } = Joi.object({
    name: Joi.object({
      first: Joi.string().required(),
      last: Joi.string().required(),
    }).required(),
    password: Joi.string().min(8).required(),
    licence : Joi.string().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateResendVerify(req, res, next) {
  const { error } = Joi.object({
    email: Joi.string().email().lowercase().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateVerify(req, res, next) {
  const { error } = Joi.object({
    token: Joi.string().required(),
    skipUpdate: Joi.boolean(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateLogin(req, res, next) {
  const { error } = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateForgotPassword(req, res, next) {
  const { error } = Joi.object({
    email: Joi.string().email().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateResetPassword(req, res, next) {
  const { error } = Joi.object({
    newPassword: Joi.string().min(8).required(),
    confirmNewPassword: Joi.ref('newPassword'),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}
