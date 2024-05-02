import HttpErrors from 'http-errors';
import * as userService from '../../user/user.service.js';
import * as tokenService from '../../token/token.service.js';

export default async function checkEmailVerified(req, res, next) {
    const { emailVerified } = req.user
    if (emailVerified) {
        return next()
    }
    throw new HttpErrors.Unauthorized('Email not verified!');
}
