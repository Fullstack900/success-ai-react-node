import Joi from 'joi';
import HttpErrors from 'http-errors';

export function validateBlockListEmail(req, res, next) {
    const { error } = Joi.object({
        type: Joi.string().valid("Manual", "CSV", "Google", "Google_Link").required(),
        emails: Joi.array().when('type', {
            is: "Manual,CSV",
            then: Joi.required()
        }),
        link: Joi.string().when('type', {
            is: "Google",
            then: Joi.required()
        }),
    }).unknown(true).validate(req.body);
    if (error) throw new HttpErrors.BadRequest(error.details[0].message);
    next();
}