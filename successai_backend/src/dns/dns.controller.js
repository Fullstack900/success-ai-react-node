import * as dnsService from './dns.service.js';

export async function vitals(req, res) {
  const { accounts } = req.body;
  const dnsRecord = await dnsService.vitals(accounts);
  setTimeout(() => res.send({ dnsRecord }), 5000)
  
}

export async function checkDns(req, res) {
  const { hostname } = req.body
  const check = await dnsService.checkDns(hostname)
  res.send(check)

}

export async function checkSSL(req, res) {
  const { hostname } = req.body
  const ssl = await dnsService.checkSSL(hostname)
  res.send({
    ssl,
  })

}

export async function checkSSLApproval(req, res) {
  res.sendStatus(200);
}
