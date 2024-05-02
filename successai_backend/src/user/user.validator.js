import Joi from 'joi';
import HttpErrors from 'http-errors';

export function validateUpdate(req, res, next) {
  const { error } = Joi.object({
    name: Joi.object({
      first: Joi.string(),
      last: Joi.string(),
    }).required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateSendEmailVerifyCode(req, res, next) {
  const { error } = Joi.object({
    email: Joi.string().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}
export function validateReplyEmailCode(req, res, next) {
  const { error } = Joi.object({
    code: Joi.string().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateUpdateEmail(req, res, next) {
  const { error } = Joi.object({
    code: Joi.string().required(),
    email: Joi.string().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateUpdatePassword(req, res, next) {
  const { error } = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
    confirmNewPassword: Joi.ref('newPassword'),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}
