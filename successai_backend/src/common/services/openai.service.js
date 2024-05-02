import { Configuration, OpenAIApi } from 'openai';
import spam from '../data/spam.json' assert { type: 'json' };
import * as utils from '../utils/utils.js';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const format = (body) =>
  body
    .replaceAll(/\[.*?\]/g, '')
    .replaceAll('. ', '.\n\n')
    .replaceAll(/\n{1,}/g, '\n\n');


async function getTextResponse(prompt) {
  const chatCompletion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  return chatCompletion.data.choices[0].message.content;
}

export async function generateWarmupEmail(subject) {
  const emailBody = await getTextResponse(
    `Write a plagiarism-free professional email body without a subject, and no "dear," "hello," or "hi" is required in the body of the email. It should be not more than 50 words based on the ${subject} and conclude with "With thanks" or "Best regards." Ensure that the reply does not generate a greeting or any name or variables. And if any, don't add the word "undefined" in the body.`
  );

  if (typeof emailBody === 'string') {
    const count = await utils.countString(emailBody);
    if (count > 50) {
      return generateWarmupEmail(subject);
    }

    return {
      subject,
      body: format(emailBody),
    };
  } else {
    throw new Error('Invalid email body response');
  }
}



export async function generateWarmupEmailReply(emailBody) {

  const body = await getTextResponse(
    `Write a plagiarism-free professional email reply based on the body content of the email, ${emailBody} not more that 40 words. Conclude with "With thanks" or "Best regards." Ensure that the reply does not generate a greeting and any name or variables or certainly in email body`
  );

  const count = await utils.countString(body)
  if (count > 50) {
    await generateWarmupEmailReply(emailBody)
    return {
      body: format(body),
    };
  }

  return {
    body: format(body),
  };
}

export async function generateEmail(prompt) {
  const email = await getTextResponse(
    `Give me subject and email of ${prompt} in 200 words and subject must be less than 4 words also please do not include I hope this email finds you well`
  );
  return email.replaceAll("I hope this email finds you well. ", "").replaceAll('\n', "<br>");
}

export async function optimizeEmail(email) {
  const optimized = await getTextResponse(
    `This is my email - ${email} please optimized it and give answer must be less than 110 words, reading time must be less than 0.8 minutes and replace the spam words like ${spam} to different words also please do not include I hope this email finds you well.`
  );
  return optimized.replaceAll("I hope this email finds you well. ", "").replaceAll('\n', "<br>");
}
