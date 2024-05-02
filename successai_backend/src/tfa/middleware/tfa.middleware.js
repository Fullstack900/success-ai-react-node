import HttpErrors from 'http-errors';
import * as tokenService from '../../token/token.service.js';

export default async function tfa(req, res, next) {
  const { tfaToken } = req.body;
  if (!tfaToken) throw new HttpErrors.BadRequest('2FA token is required');

  let userId;

  try {
    ({ userId } = tokenService.verifyTfaToken(tfaToken));
  } catch (error) {
    throw new HttpErrors.BadRequest('Invalid 2FA token');
  }

  if (!req.user._id.equals(userId)) {
    throw new HttpErrors.BadRequest('Invalid 2FA token');
  }

  delete req.body.tfaToken;

  next();
}
