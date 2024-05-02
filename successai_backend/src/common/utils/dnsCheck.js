import dns from "dns";
import logger from "./logger.js";
import sslChecker from "ssl-checker";
import HttpErrors from "http-errors";
import { dkimSelectorsArray } from "../../constants/index.js";
import _ from "lodash";
import Domain from "../../warmup/models/domain-dkim.modal.js";

async function getSPFRecord(domain) {
  try {
    const records = await dns.promises.resolveTxt(domain);
    const spfRecords = records.find((record) =>
      record.join("").includes("v=spf1")
    );
    return spfRecords;
  } catch (err) {
    // logger.error('Error fetching SPF record:', err);
    return [];
  }
}

async function getDKIMRecord(domain, selector = "default") {
  try {
    const dkimRecords = [];
    let dkimSelector = null;
    const domainData = await Domain.findOne({ domain });
    if (domainData) {
      const domainSelecor = domainData.dkimSelector;
      let selector = domainSelecor.pop();
      const recordName = `${selector}._domainkey.${domain}`;
      try {
        // console.log(selector)
        const txtRecords = await dns.promises.resolveTxt(recordName);
        for (const txtRecord of txtRecords) {
          dkimRecords.push(txtRecord.join(""));
          dkimSelector = selector;
        }
      } catch (err) {
        // console.log(err);
        return [];
      }
      const advisory = dkimSelector
        ? "DKIM record found."
        : "No DKIM record found.";
      return [
        {
          Name: domain,
          DkimRecord: dkimRecords,
          DkimSelector: dkimSelector,
          DKIMAdvisory: advisory,
        },
      ];
    } else {
      const dkimSelectors = _.uniq(dkimSelectorsArray);

      for (const selector of dkimSelectors) {
        const recordName = `${selector}._domainkey.${domain}`;
        try {
          const txtRecords = await dns.promises.resolveTxt(recordName);
          for (const txtRecord of txtRecords) {
            dkimRecords.push(txtRecord.join(""));
            dkimSelector = selector;
          }
        } catch (err) {
          // if (err.code !== 'ENODATA') {
          //     throw err;
          // }
        }

        if (dkimSelector) {
          break;
        }
      }

      const advisory = dkimSelector
        ? "DKIM record found."
        : "No DKIM record found.";

      return [
        {
          Name: domain,
          DkimRecord: dkimRecords,
          DkimSelector: dkimSelector,
          DKIMAdvisory: advisory,
        },
      ];
    }
  } catch (err) {
    // logger.error('Error fetching DKIM record:', err);
    return [];
  }
}

async function getCname(domain) {
  try {
    const domainData = await Domain.findOne({ domain });
    const records = await dns.promises.resolveCname(domain);
    return records;
  } catch (err) {
    throw new HttpErrors.BadRequest("Please check your custom domain");
  }
}

async function checkDnss(hostname) {
  try {
    const cname = await getCname(hostname);

    if (cname && cname[0] === process.env.CNAME_VALUE) {
      return { cname: cname, status: true };
    } else {
      throw new HttpErrors.BadRequest("Please check your custom domain");
    }
  } catch (error) {
    // console.error("Error in checkDns:", error);
    throw new HttpErrors.InternalServerError("Please check your custom domain");
  }
}

async function getDMARCRecord(domain) {
  try {
    const records = await dns.promises.resolveTxt(`_dmarc.${domain}`);
    return records;
  } catch (err) {
    // logger.error("Error fetching DMARC record:", err);
    return [];
  }
}

async function getMXRecords(domain) {
  try {
    const records = await dns.promises.resolveMx(domain);
    return records;
  } catch (err) {
    // logger.error('Error fetching MX records:', err);
    return [];
  }
}

async function getSSLStatus(hostname) {
  try {
    const record = await sslChecker(hostname);
    return record;
  } catch (err) {
    throw new HttpErrors.BadRequest("Please check ssl of your custom domain");
  }
}

export {
  getSPFRecord,
  getDKIMRecord,
  getDMARCRecord,
  getMXRecords,
  getCname,
  checkDnss,
  getSSLStatus,
};
