import Joi from 'joi';
import HttpErrors from 'http-errors';

export function validateGetToken(req, res, next) {
    const { error } = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
    }).validate(req.body);
    if (error) throw new HttpErrors.BadRequest(error.details[0].message);
    next();
}

export function validateNotification(req, res, next) {
    const { error } = Joi.object({
        action: Joi.string().valid('activate', 'enhance_tier', 'reduce_tier', 'refund').required(),
        plan_id: Joi.string().required(),
        uuid: Joi.string().required(),
        activation_email: Joi.string().required(),
        invoice_item_uuid: Joi.string(),
    }).validate(req.body);

    if (error) {
        throw new HttpErrors.BadRequest(error.details[0].message);
    }

    next();
}