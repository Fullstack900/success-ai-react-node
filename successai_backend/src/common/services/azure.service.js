import axios from 'axios';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import * as utils from '../utils/utils.js'

export async function getTokenByCode(code) {
  const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  const data = {
    code,
    client_id: process.env.MICROSOFT_OAUTH_CLIENT_ID,
    client_secret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
    redirect_uri: process.env.MICROSOFT_OAUTH_REDIRECT_URI,
    scope: process.env.MICROSOFT_OAUTH_SCOPE,
    grant_type: 'authorization_code',
  };
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

  const { data: response } = await axios.post(url, data, { headers });

  const decodedIdToken = jwt.decode(response.id_token);

  const allData =  {
    name: decodedIdToken.name,
    email: decodedIdToken.email,
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
  };
  return allData;
}

export async function getTokenByRefreshToken(token, account = null) {
  const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  const data = {
    refresh_token: token,
    client_id: process.env.MICROSOFT_OAUTH_CLIENT_ID,
    client_secret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
    scope: process.env.MICROSOFT_OAUTH_SCOPE,
    grant_type: 'refresh_token',
  };
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const { data: response } = await axios.post(url, data, { headers });
  return { accessToken: response.access_token };
}

export async function sendMail(from, to, refreshToken, { subject, body, inReplyTo }) {
  const { accessToken } = await getTokenByRefreshToken(refreshToken);

  const user = await utils.extractEmailsFromString(from)
  const transport = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      type: 'OAuth2',
      user : user[0],
      accessToken,
      refreshToken,
      clientId: process.env.MICROSOFT_OAUTH_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
    },
  });

  const option = { from, to, subject, text: body, inReplyTo };

  return transport.sendMail(option);
}
