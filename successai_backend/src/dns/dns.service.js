import HttpErrors from 'http-errors';
import {
  getSPFRecord,
  getDKIMRecord,
  getDMARCRecord,
  getMXRecords,
  getCname,checkDnss,
  getSSLStatus
} from '../common/utils/dnsCheck.js';
import { getDomainFromEmail } from '../common/utils/utils.js';
import _ from 'lodash';

export async function vitals(accounts) {
  try {
    const failure_list = [];
    const success_list = [];
    const domains = [];

    accounts.forEach((element) => {
      domains.push(getDomainFromEmail(element));
    });

    for (const domain of _.uniq(domains)) {
      const obj = {
        domain: domain,
        allPass: false,
        mx: false,
        spf: false,
        dkim: false,
        dmarc: false,
      };
      const spf = await getSPFRecord(domain);
      const dmarc = await getDMARCRecord(domain);
      const mx = await getMXRecords(domain);
      const dkim = await getDKIMRecord(domain);

      if (spf?.length && dkim?.length && dmarc?.length && mx?.length) {
        obj.allPass = true;
      }

      if (spf?.length) {
        obj.spf = true;
      }
      if (dkim?.length) {
        obj.dkim = true;
      }
      if (dmarc?.length) {
        obj.dmarc = true;
      }
      if (mx?.length) {
        obj.mx = true;
      }

      if (obj.allPass) {
        success_list.push(obj);
      } else {
        failure_list.push(obj);
      }
    }

    return { failure_list, success_list };
  } catch (err) {
    throw new HttpErrors[400]();
  }
}

export async function checkDns(hostname) {

  const cname = await checkDnss(hostname);
  const result = await checkDnss(hostname);
  const cnameValue = result.cname[0];
  if(cnameValue === process.env.CNAME_VALUE)
    return {cname : cname, status : true }
  else 
    throw new HttpErrors.BadRequest("Please check your custom domain")

}

export async function checkSSL(hostname) {
  const ssl = await getSSLStatus(hostname);
  if(ssl.valid)
    return ssl.valid
  else
    throw new HttpErrors.BadRequest("SSL is not valid for this domain")

}
