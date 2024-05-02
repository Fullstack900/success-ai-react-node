import axios from 'axios';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import * as utils from '../utils/utils.js'

export async function getTokenByCode(code) {
  const url = process.env.GMAIL_OAUTH_AUTHORIZATION_URL;
  const data = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
    grant_type: 'authorization_code',
  });
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

  const { data: response } = await axios.post(url, data, { headers });

  const decodedIdToken = jwt.decode(response.id_token);

  return {
    name: decodedIdToken.name,
    email: decodedIdToken.email,
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
  };
}

export async function getTokenByRefreshToken(token) {
  const url = process.env.GMAIL_OAUTH_AUTHORIZATION_URL;
  const data = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    refresh_token: token,
    grant_type: 'refresh_token',
  });
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

  const { data: response } = await axios.post(url, data, { headers });

  return { accessToken: response.access_token };
}

export async function sendMail(
  from,
  to,
  refreshToken,
  { subject, body, inReplyTo }
) {
  const accessToken = await getTokenByRefreshToken(refreshToken);
  const user = await utils.extractEmailsFromString(from)
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: user[0],
      accessToken,
      refreshToken,
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    },
  });

  const option = { from, to, subject, text: body, inReplyTo};

  return transport.sendMail(option);
}
