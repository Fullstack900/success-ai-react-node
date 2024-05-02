import axios from "axios";
import moment from "moment";
import { config } from "src/config";

export function convertToNestedObject(obj) {
  const result = {};

  for (const key in obj) {
    const parts = key.split(".");
    let nestedObj = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!nestedObj[part]) {
        nestedObj[part] = i === parts.length - 1 ? obj[key] : {};
      }
      nestedObj = nestedObj[part];
    }
  }

  return result;
}

export function countStatus(dataToCheck, key) {
  const filteredData = dataToCheck.filter((data) => data[key] === true);
  return filteredData?.length;
}
export function isFreeTrialExpired(freeTrialExpiresAt) {
  // Parse the freeTrialExpiresAt string using Moment.js
  const expiresAt = moment(freeTrialExpiresAt);

  // Get the current date using Moment.js
  const currentDate = moment();

  // Compare the two dates
  if (currentDate.isAfter(expiresAt)) {
    // The current date is after the expiration date
    return false;
  } else {
    // The free trial is still valid
    return true;
  }
}
export function daysLeftInFreeTrial(freeTrialExpiresAt) {
  // Parse the freeTrialExpiresAt string using Moment.js
  const expiresAt = moment(freeTrialExpiresAt);

  // Get the current date using Moment.js
  const currentDate = moment();

  // Calculate the difference in days
  const daysLeft = expiresAt.diff(currentDate, "days");

  return daysLeft;
}
export function filterObject(object) {
  const result = {};
  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      const element = object[key];
      if (!element) continue;
      if (Array.isArray(element) && !element.length) continue;
      result[key] = element;
    }
  }
  return result;
}

export function getWeekdays() {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const currentDay = weekdays[new Date().getDay()];

  while (currentDay !== weekdays[weekdays.length - 1]) {
    weekdays.push(weekdays.shift());
  }

  return weekdays;
}

export function getDayName(dateString) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const d = new Date(dateString);
  const dayName = days[d.getDay()];
  return dayName;
}

export function last7dates() {
  // Get today's date
  const today = new Date();

  // Create an array to store the last 7 dates
  const last7Dates = [];

  // Iterate over the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    last7Dates.push(`${month}/${day}/${year}`);
  }

  return last7Dates;
}

export function createCsv(data) {
  const header = Object.keys(data[0]).join(",");
  return data.reduce((acc, current) => {
    const row = Object.values(current).map((v) => {
      if (typeof v === "string" && v.includes(",")) {
        return `"${v}"`;
      } else if (v === null || v === undefined || v === "") {
        return ""; // Treat null, undefined, and empty values as empty strings
      } else {
        return String(v); // Convert non-string values to strings
      }
    });
    return acc + "\n" + row.join(",");
  }, header);
}

export function downloadCsv(filename, data, lead = false) {
  try {
    const file = new Blob([createCsv(data)], { type: "text/csv;charset=utf-8" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = filename + ".csv";
    document.body.appendChild(element);
    element.click();
    element.remove();
  } catch (err) {
    console.log(err);
  }
}

export async function fetchGoogleSheet(link) {
  const sheetID = link.split("/d/")[1].split("/edit")[0];
  const range = 'A1:ZZ';
  const apiKey = config.GOOGLE_SHEET_KEY;

  try {
    const sheetInfoEndpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}?key=${apiKey}`;
    const sheetInfoResponse = await axios.get(sheetInfoEndpoint);
    const sheetInfo = sheetInfoResponse.data;

    const sheetCount = sheetInfo.sheets.length;

    if (sheetCount > 1) {
      return {
        error: true,
        message: 'More than one sheet found. This function supports only single-sheet documents.'
      };
    }

    const valuesEndpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${range}?key=${apiKey}`;
    const valuesResponse = await axios.get(valuesEndpoint);
    const data = valuesResponse.data;

    if (!data.values || data.values.length === 0) {
      return {
        error: true,
        message: 'No data found in the sheet.'
      };
    }

    const columns = data.values[0].map(column => column || 'NA');

    const rows = data.values.slice(1).map(row => row.map(cell => cell || 'NA'));

    const filteredColumns = columns.filter((column, index) => {
      const isColumnEmpty = rows.every(row => row[index] === 'NA');
      return !isColumnEmpty;
    });

    const filteredRows = rows.map(row => {
      return row.filter((cell, index) => filteredColumns.includes(columns[index]));
    });

    return { columns: filteredColumns, rows: filteredRows };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      error: true,
      message: 'Error fetching data from the sheet.'
    };
  }
}


export const uploadImage = async (url, avatar) => {
  try {
    const response = await axios.put(url, avatar);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
};

export function generateDates(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const labels = [];

  while (startDate <= endDate) {
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const label = `${year}-${month}-${day}`;
    labels.push(label);
    startDate.setDate(startDate.getDate() + 1);
  }

  return labels;
}

window.generateDayLabels = generateDates;
