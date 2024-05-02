import Joi from "joi";
import HttpErrors from "http-errors";

export function validateToken(req, res, next) {
  const { error } = Joi.object({
    id: Joi.string().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateRegister(req, res, next) {
  const { error } = Joi.object({
    name: Joi.object({
      first: Joi.string().required(),
      last: Joi.string().required(),
    }).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateVerify(req, res, next) {
  const { error } = Joi.object({
    token: Joi.string().required(),
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

export function validateGetUsers(req, res, next) {
  const { error } = Joi.object({
    search: Joi.string(),
    sortBy: Joi.string(),
    order: Joi.string(),
    page: Joi.number().integer().min(0),
    limit: Joi.number().integer().min(0).max(100),
    userType: Joi.string(),
    start: Joi.number().integer().min(0),
    end: Joi.number().integer().min(0),
  }).validate(req.query);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateUpdatePassword(req, res, next) {
  const { error } = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
    confirmNewPassword: Joi.ref("newPassword"),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

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

export function validateAppSumoRegister(req, res, next) {
  const { error } = Joi.object({
    username: Joi.string().lowercase().required(),
    password: Joi.string().min(8).required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}

export function validateAddCoupons(req, res, next) {
  const { error } = Joi.object({
    priceId: Joi.string().required(),
    coupons: Joi.array().items(Joi.string())
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}
