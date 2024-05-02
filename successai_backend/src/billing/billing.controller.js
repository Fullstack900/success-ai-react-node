import logger from "../common/utils/logger.js";
import * as billingService from "./billing.service.js";
import * as uniboxService from "../unibox/unibox.service.js";
import HttpErrors from "http-errors";
import PlanUsage from "./models/plan-usage.model.js";

export async function getCurrentPlan(req, res) {
  const userPlan = await billingService.getUserPlan({ user: req.user });
  if (!userPlan) throw new HttpErrors.NotFound("Plan not found");
  res.send({plan: userPlan,user:req.user});
}

export async function getUserDefaultPaymentMethod(req, res) {
  const paymentMethods = await billingService.getUserPaymentMethod({
    user: req.user,
  });
  if (!paymentMethods || paymentMethods.length == 0)
    throw new HttpErrors.NotFound("Payment method not found");
  res.send(paymentMethods);
}

export async function createStripPortalSession(req, res) {
  const redirectUrl = await billingService.createStripeSession({
    user: req.user,
  });
  if (!redirectUrl) throw new HttpErrors.NotFound("Something went wrong...");
  res.send({ url: redirectUrl });
}

export async function getLeadsCredits(req, res) {
  const { leadsCredits, activeLeads, aiWriterCredits, monthlyEmails } =
    await billingService.findUserPlanUsage(req.user);
  const usedActiveLeads = await uniboxService.getUserLeadsCount({
    user: req.user,
  });
  const planUsage = await PlanUsage.findOne({ user: req.user }).select('dailyLeadsCredits');
  if (!leadsCredits && !usedActiveLeads)
    throw new HttpErrors.NotFound("Lead credits not found");
  const { usedEmailCredit, usedAiCredit, montlyEmailCredit, aiWriterLimit } =
    await billingService.findUserPlan(req.user, aiWriterCredits, monthlyEmails);
  res.send({
    leadsCredits,
    usedActiveLeads,
    activeLeads,
    usedEmailCredit,
    usedAiCredit,
    montlyEmailCredit,
    aiWriterLimit,
    dailyLeadsCredits: planUsage.dailyLeadsCredits,
  });
}

export async function createCheckoutSession(req, res) {
  const plan = await billingService.getPlan(req.body);
  if (!plan) throw new HttpErrors.NotFound("Plan not found");

  const session = await billingService.createCheckoutSession(req.user, plan);
  res.send({ url: session.url });
}

export async function updatePlan(req, res) {
  const plan = await billingService.getPlan(req.body);
  if (!plan) throw new HttpErrors.NotFound("Plan not found");

  const result = await billingService.updatePlan(req.user, plan);

  res.send(result);
}

export async function stripeWebhook(req, res) {
  const stripe = billingService.getStripe();
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // logger.error(err.message);
    throw new HttpErrors.BadRequest(`Webhook Error: ${err.message}`);
  }

  await billingService.handleWebhookEvent(event);
  // Return a 200 response to acknowledge receipt of the event
  res.send();
}

export async function cancelAllSubscriptions(req, res) {
  const redirectUrl = await billingService.cancelUserSubscriptions({
    user: req.user,
  });
  if (!redirectUrl) throw new HttpErrors.NotFound("Something went wrong...");
  res.send({ success: true });
}

export async function cancelSubscriptions(req, res) {
  const subscriptionId = req.params.id;
  const subscription = await billingService.cancelStripeSubscriptions(
    subscriptionId
  );
  if (!subscription) throw new HttpErrors.NotFound("Something went wrong...");
  res.send({ success: true });
}

export async function getUserInvoices(req, res) {
  const invoices = await billingService.getAllUserInvoices(req.user);
  res.send(invoices);
}
