import jwt from 'jsonwebtoken';
import TokenType from './enum/token-type.enum.js';
import TokenExp from './enum/token-exp.enum.js';

export function generateAuthToken(userId,warmupTag) {
  return generate({ userId, warmupTag }, TokenType.Auth, TokenExp.Auth);
}

export function verifyAuthToken(token) {
  return verify(token, TokenType.Auth);
}

export function generateLoginToken(userId) {
  return generate({ userId }, TokenType.Login, TokenExp.Login);
}

export function verifyLoginToken(token) {
  return verify(token, TokenType.Login);
}

export function generateTfaToken(userId) {
  return generate({ userId }, TokenType.Tfa, TokenExp.Tfa);
}

export function verifyTfaToken(token) {
  return verify(token, TokenType.Tfa);
}

function generate(payload, type, expiresIn) {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ ...payload, type }, secret, { expiresIn });
}

function verify(token, type) {
  const secret = process.env.JWT_SECRET;
  const payload = jwt.verify(token, secret);
  if (payload.type !== type) throw new Error('Token type mismatch');
  return payload;
}

export function generateAppSumoAccessToken(userId) {
  return generate({ userId }, TokenType.Auth, TokenExp.Auth);
}
