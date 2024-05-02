import * as tfaService from './tfa.service.js';

export async function sendCode(req, res) {
  await tfaService.sendCode(req.user);
  res.send({ message: 'Code Sent' });
}

export async function verifyCode(req, res) {
  const { code } = req.body;
  const tfaToken = await tfaService.verifyCode(req.user, code);
  res.send({ tfaToken });
}
