import TfaCode from './models/tfa-code.model.js';
import HttpErrors from 'http-errors';
import * as crypto from 'crypto';
import * as mailerService from '../mailer/mailer.service.js';
import * as tokenService from '../token/token.service.js';

export async function sendCode(user) {
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  mailerService.sendCodeMail(user.email, code);
  await TfaCode.deleteMany({ user });
  return TfaCode.create({ user, code });
}

export async function verifyCode(user, code) {
  const tfaCode = await TfaCode.findOne({ user, code });
  if (!tfaCode) throw new HttpErrors.BadRequest('Invalid Code');
  await tfaCode.deleteOne();
  const tfaToken = tokenService.generateTfaToken(user._id);
  return tfaToken;
}
