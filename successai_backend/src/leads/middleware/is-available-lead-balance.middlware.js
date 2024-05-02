import * as billingService from '../../billing/billing.service.js';
import HttpErrors from 'http-errors';

export default async function checkAvailableLeadCredit(req, res, next) {
  const { leads } = req.body;
  const { leadsCredits } = await billingService.findUserPlanUsage(req.user);

  if (leadsCredits < leads.length) {
    throw new HttpErrors.BadRequest('Insufficient lead credits');
  }

  next();
}
