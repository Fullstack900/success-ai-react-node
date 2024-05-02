import path from 'path';
import fs from 'fs';
import { htmlToText } from 'html-to-text';
import moment from 'moment';

export function searchFile(
  startPath,
  filter,
  depth,
  callback,
  folderDepth = 0
) {
  if (!fs.existsSync(startPath)) return;

  if (depth && !folderDepth) {
    folderDepth = 1;
  }

  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory() && (!folderDepth || depth > folderDepth)) {
      folderDepth += 1;
      searchFile(filename, filter, depth, callback, folderDepth); //recurse
      folderDepth -= 1;
    } else if (filter.test(filename)) {
      callback(filename);
    }
  }
}

export function getDomainFromEmail(email) {
  const domain = email.split('@')[1];
  return domain;
}

export function flatObject(obj) {
  const result = {};
  const iterate = (obj, ck) => {
    Object.keys(obj).forEach((key) => {
      const rk = ck ? `${ck}.${key}` : key;

      if (typeof obj[key] !== 'object' || Array.isArray(obj[key])) {
        result[rk] = obj[key];
      }

      if (
        typeof obj[key] === 'object' &&
        !Array.isArray(obj[key]) &&
        obj[key] !== null
      ) {
        iterate(obj[key], rk);
      }
    });
  };
  iterate(obj);
  return result;
}

export function removeStringBetweenPlusAndAt(email) {
  const atIndex = email.indexOf('@');
  const plusIndex = email.indexOf('+');

  if (plusIndex !== -1 && atIndex !== -1) {
    const modifiedEmail =
      email.substring(0, plusIndex) + email.substring(atIndex);
    return modifiedEmail;
  } else {
    return email; // Return the original email if '+' or '@' are not found
  }
}

export function changeStringToUpperCaseAndBreak(string) {

  const words = string.split(/(?=[A-Z])/);
  const outputString = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return outputString

}

// export function replaceVariables(template, data) {

//   const regex = /{{(.*?)}}/g;

//   const replacedString = template.replace(regex, (match, variable) => {

//     variable = variable.trim();
//     if (data[variable]) {
//       return data[variable];
//     } else {
//       return "";
//     }
//   });

//   return replacedString;
// }

export function replaceVariables(template, leadData, senderData) {
  const regex = /{{(.*?)}}/g;

  const replacedString = template.replace(regex, (match, variable) => {
    variable = variable.trim();

    if (variable === 'signature'|| variable === 'senderName') {
      return senderData[variable] !== undefined && senderData[variable] !== null
        ? senderData[variable]
        : '';
    } else if (leadData[variable] !== undefined && leadData[variable] !== null) {
      return leadData[variable];
    } else if (variable in leadData && typeof leadData[variable] !== 'object') {
      return leadData[variable];
    } else if (leadData.variables) {
      const leadVariable = leadData.variables.find(
        (v) => v.variableTitle === variable
      );
      return leadVariable ? (leadVariable.variableValue !== null ? leadVariable.variableValue : '') : '';
    } else if (senderData[variable] !== undefined && senderData[variable] !== null) {
      return senderData[variable];
    } else {
      return "";
    }
  });

  // Remove any remaining 'undefined' strings
  const cleanedString = replacedString.replace(/undefined/g, '');
  return cleanedString;
}

export function ensureHttpsUrl(url) {

  if (!/^https:\/\//i.test(url)) {
    url = "https://" + url;
  }
  return url;
}

export function isGmailOrYahooEmail(email) {
  const gmailRegex = /@gmail\.com$/;
  const yahooRegex = /@yahoo\.com$/;

  return gmailRegex.test(email) || yahooRegex.test(email);
}

export function extractEmailsFromString(text) {
  const emailPattern = /[\w.-]+@[\w.-]+\.[A-Za-z]{2,4}/g;
  const emails = text.match(emailPattern) || [];
  return emails;
}

export function countString(str) {
  const specialCharsRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/g;
  str = str.replace(specialCharsRegex, "").replace("  ", " ");
  const words = str.split(/\s+/); // Split the string by whitespace characters
  return words.length
}

export function convertHtmlToText(html) {
  const result = htmlToText(html, {
    singleNewLineParagraphs: true,
    ignoreImage: true,
    formatters: {
      anchor: (el, walk, builder, opts) => {
        builder.openBlock();
        walk(el.children, builder);
        builder.closeBlock();
      },
    },
  });
  return result;
}

export function convertToTextAsHtml(html) {
  let textAsHtml = html
      .replace(/<div id="Zm-_Id_-Sgn"[\s\S]*?<\/div>/g, '')
      .replace(/<div id="Zm-_Id_-Sgn1"[\s\S]*?<\/br>/g, '')
      .replace(/<\/?div.*?>/g, '')  
      .replace(/<br>/g, '<br/>')   
      .replace(/<img(.*?)>/g, '')  
      .replace(/----/g, '')  
      .replace(/---/g, ':');
  return textAsHtml;
}

export function convertTimestampToTimezone(timestamp, timezone) {
  // Create a Moment.js object from the timestamp
  const numberTime = Number(timestamp)
  const momentDate = moment(numberTime);

  // Set the timezone
  momentDate.tz(timezone);

  // Return the timestamp in milliseconds in the specified timezone
  const date = momentDate.valueOf();
  return date;
}