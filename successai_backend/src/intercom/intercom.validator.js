import Joi from "joi";

export function validateNotification(req, res, next) {
  const { error } = Joi.object({
    user: Joi.string().required(),
    attribute: Joi.string().required(),
  }).validate(req.body);

  if (error) {
    throw new HttpErrors.BadRequest(error.details[0].message);
  }

  next();
}
