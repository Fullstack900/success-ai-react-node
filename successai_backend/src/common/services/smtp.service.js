import nodemailer from "nodemailer";
import axios from "axios";
import { sendEmailEngineMail } from "../utils/emailEngineMail.js";
import { lastEmailEngineCredentials } from "../../account/account.service.js";

export function sendMail(from, to, smtp, { subject, body, inReplyTo }) {
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
  });

  return transport.sendMail({
    from,
    to,
    subject,
    text: body,
    inReplyTo,
  });
}

export async function sendCampaignEmail({ emailData = {}, emailEngineAccountId, messageText, previousMessage }) {
  // const transport = nodemailer.createTransport({ ...smtpConfig });
  const name = emailData?.name;
  const textType = emailData?.type;
  let from =
    name?.first + " " + name?.last + " " + "<" + emailData?.fromEmail + ">";
  if (from.includes("undefined")) {
    from = emailData?.senderName + " " + "<" + emailData?.fromEmail + ">";
  }
  const to = emailData?.to;
  const subject = emailData?.subject;
  const body = emailData?.body;
  const inReplyTo = emailData?.inReplyTo;
  const replyTo = emailData?.replyTo;
  const envelope = {
    from: emailData?.fromEmail, // Specify the return path here
    to,
  };
  const reference = {
    message: messageText,
    action: "reply",
  }
  const mailData = { from, to, subject, inReplyTo };
  if (textType === "html") {
    mailData.html = body;
  } else {
    const plainText = body.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "");
    mailData.text = plainText.trim();
  }
  const headers = {
    References: previousMessage
 }

  if (replyTo) mailData["replyTo"] = replyTo;
  
  let data = {
      to: [
        {
          address: emailData?.to,
        },
      ],
      subject: subject,
      text: mailData.text,
      html: mailData.html,
    };

  if(messageText) {
    data.reference = reference;
  }

  if(previousMessage) {
    data.headers = headers;
  }
  return await sendEmailEngineMail(emailEngineAccountId, data);
}

export async function checkEmailConfig(smtpConfig = {}) {
  console.log(`h`, smtpConfig)
  try {
    let smtp;
    if(smtpConfig?.auth?.pass){
      smtp = {
        auth: {
          user: smtpConfig?.auth?.user,
          pass: smtpConfig?.auth?.pass,
        },
        host: smtpConfig?.host,
        port: smtpConfig?.port,
        secure: smtpConfig?.port == 465,
      }
    } else{ 
     smtp = {
      auth: {
        user: smtpConfig?.auth?.user,
        accessToken: smtpConfig?.auth?.accessToken,
      },
      host: smtpConfig?.host,
      port: smtpConfig?.port,
      secure: smtpConfig?.port == 465,
    }
  }
  let data = {
    smtp
  };
  const {accessToken , ip: EMAIL_ENGINE_URL} = await lastEmailEngineCredentials();
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${EMAIL_ENGINE_URL}/v1/verifyAccount?access_token=${accessToken}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);
  const isSucceed = response.data.smtp.success;
  return isSucceed;

  // const transporter = nodemailer.createTransport(smtpConfig);
  // await transporter.verify();
  // return true; // Configuration is valid
  } catch (error) {
    console.error('Error verifying email configuration:', error?.response?.data);
    // return false; // Configuration is not valid
  }
} 

export function sendTestEmail({ smtpConfig = {}, emailData = {}}) {
  const transport = nodemailer.createTransport({...smtpConfig});
  const from = emailData?.from[0];
  const to = emailData?.to;
  const subject = emailData?.subject;
  const body = emailData?.body;
  const mailData = { 
    from, 
    to, 
    subject, 
  };
    const plainText = body.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '');
    mailData.text = plainText.trim();
  return transport.sendMail(mailData);
}