import { EmailClient } from '@azure/communication-email';
import path from 'path';
import logger from '../common/utils/logger.js';
import fs from 'fs/promises';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import * as tokenService from '../token/token.service.js';

async function sendMail({ to, subject, template, context }) {
  const emailClient = new EmailClient(process.env.SMTP_CONNECTION_STRING);

  const htmlContent = await renderTemplate(template, context);

  const message = {
    senderAddress: process.env.SMTP_FROM,
    content: {
      subject,
      html: htmlContent,
    },
    recipients: {
      to: [
        {
          address: to,
        },
      ],
    },
  };

  const poller = await emailClient.beginSend(message);
  const info = await poller.pollUntilDone();

  return info;
}

async function renderTemplate(template, context) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const templatePath = path.join(__dirname, 'templates', `${template}.hbs`);
  const content = await fs.readFile(templatePath, 'utf-8');
  const htmlContent = Handlebars.compile(content)(context);
  return htmlContent;
}

export async function sendEmailVerificationMail(user) {
  const token = tokenService.generateLoginToken(user._id);
  const link = `${process.env.CLIENT_APP_VERIFY_AUTH_URL}?token=${token}`;

  await sendMail({
    to: user.email,
    subject: 'Verify your Success.ai account',
    template: 'email-verification',
    context: {
      link,
    },
  });

  logger.info(`Email verification mail sent to ${user.email}`);
}

export async function sendErrorsCampaignStatsMail(user, body, userCampaigns=null) {
  await sendMail({
    to: user.email,
    subject: 'Campaign Error Notification',
    template: 'camp-error-stats',
    context: {
      body,
    },
  });

  for (let campaign of userCampaigns) {
    campaign.campainErrorEmailSent = true;
    campaign.save();
  }
  logger.info(`Campaign error notification mail sent to ${user.email}`);
}


export async function sendForgotPasswordMail(user) {
  const token = tokenService.generateLoginToken(user._id);
  const link = `${process.env.CLIENT_APP_VERIFY_AUTH_URL}?token=${token}&pwreset=true`;

  await sendMail({
    to: user.email,
    subject: 'Reset your Success.ai Password',
    template: 'reset-password',
    context: {
      link,
    },
  });

  logger.info(`Reset Password mail sent to ${user.email}`);
}

export async function sendCodeMail(email, code) {
  await sendMail({
    to: email,
    subject: 'Your Success.ai verification Code',
    template: 'verification-code',
    context: {
      code,
    },
  });

  logger.info(`Verification Code mail sent to ${email}`);
}

export async function sendVerifyReplyEmail(email,code) {
  
  const link = `${process.env.BASE_URL}/verifyReplyEmail?code=${code}`;
  await sendMail({
    to: email,
    subject: 'Verify your Success.ai Compaign Email',
    template: 'email-verification',
    context: {
      link,
    },
  });

  logger.info(`Email verification mail sent to ${user.email}`);
}
