import Joi from 'joi';
import HttpErrors from 'http-errors';

export function validateUpdatePlan(req, res, next) {
  const { error } = Joi.object({
    priceId: Joi.string().required(),
  }).validate(req.body);
  if (error) throw new HttpErrors.BadRequest(error.details[0].message);
  next();
}
