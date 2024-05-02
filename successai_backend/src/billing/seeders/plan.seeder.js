import BillingCategory from "../enum/billing-category.js";
import BillingPeriod from "../enum/billing-period.enum.js";
import SubscriptionType from "../enum/subscription-type.enum.js";
import Plan from "../models/plan.model.js";
import logger from "../../common/utils/logger.js";

const {
  SENDING_WARMUP_MONTHLY_GROWTH_PRICE_ID,
  SENDING_WARMUP_MONTHLY_SKYROCKET_PRICE_ID,
  SENDING_WARMUP_MONTHLY_SCALE_PRICE_ID,
  SENDING_WARMUP_YEARLY_GROWTH_PRICE_ID,
  SENDING_WARMUP_YEARLY_SKYROCKET_PRICE_ID,
  SENDING_WARMUP_YEARLY_SCALE_PRICE_ID,
  LEADS_MONTHLY_SKYROCKET_PRICE_ID,
  LEADS_MONTHLY_GROWTH_PRICE_ID,
  LEADS_MONTHLY_SCALE_PRICE_ID,
  LEADS_YEARLY_SKYROCKET_PRICE_ID,
  LEADS_YEARLY_GROWTH_PRICE_ID,
  LEADS_YEARLY_SCALE_PRICE_ID,
} = process.env;

const plans = [
  {
    priceId: SENDING_WARMUP_MONTHLY_GROWTH_PRICE_ID,
    category: BillingCategory.SendingWarmup,
    billingPeriod: BillingPeriod.Monthly,
    subscriptionType: SubscriptionType.Growth,
    price: 33,
    features: {
      emailAccounts: Infinity,
      emailWarmups: Infinity,
      activeLeads: 1200,
      monthlyEmails: 6000,
      aiWriterCredits: 2500,
      leadsCredits: 30,
      premiumSupport: true,
    },
  },
  {
    priceId: SENDING_WARMUP_MONTHLY_SKYROCKET_PRICE_ID,
    category: BillingCategory.SendingWarmup,
    billingPeriod: BillingPeriod.Monthly,
    subscriptionType: SubscriptionType.Skyrocket,
    price: 77,
    features: {
      emailAccounts: Infinity,
      emailWarmups: Infinity,
      activeLeads: 50_000,
      monthlyEmails: 200_000,
      aiWriterCredits: 7500,
      leadsCredits: 30,
      liveChatSupport: true,
    },
  },
  {
    priceId: SENDING_WARMUP_MONTHLY_SCALE_PRICE_ID,
    category: BillingCategory.SendingWarmup,
    billingPeriod: BillingPeriod.Monthly,
    subscriptionType: SubscriptionType.Scale,
    price: 297,
    features: {
      emailAccounts: Infinity,
      emailWarmups: Infinity,
      activeLeads: 500_000,
      monthlyEmails: 1000_000,
      aiWriterCredits: 30_000,
      leadsCredits: 30,
      premiumSupport: true,
    },
  },
  {
    priceId: SENDING_WARMUP_YEARLY_GROWTH_PRICE_ID,
    category: BillingCategory.SendingWarmup,
    billingPeriod: BillingPeriod.Yearly,
    subscriptionType: SubscriptionType.Growth,
    price: 276,
    features: {
      emailAccounts: Infinity,
      emailWarmups: Infinity,
      activeLeads: 1200,
      monthlyEmails: 6000,
      aiWriterCredits: 2500,
      leadsCredits: 30,
      premiumSupport: true,
    },
  },
  {
    priceId: SENDING_WARMUP_YEARLY_SKYROCKET_PRICE_ID,
    category: BillingCategory.SendingWarmup,
    billingPeriod: BillingPeriod.Yearly,
    subscriptionType: SubscriptionType.Skyrocket,
    price: 636,
    features: {
      emailAccounts: Infinity,
      emailWarmups: Infinity,
      activeLeads: 50_000,
      monthlyEmails: 200_000,
      aiWriterCredits: 7500,
      leadsCredits: 30,
      liveChatSupport: true,
    },
  },
  {
    priceId: SENDING_WARMUP_YEARLY_SCALE_PRICE_ID,
    category: BillingCategory.SendingWarmup,
    billingPeriod: BillingPeriod.Yearly,
    subscriptionType: SubscriptionType.Scale,
    price: 2484,
    features: {
      emailAccounts: Infinity,
      emailWarmups: Infinity,
      activeLeads: 500_000,
      monthlyEmails: 1000_000,
      aiWriterCredits: 30_000,
      leadsCredits: 30,
      premiumSupport: true,
    },
  },
  {
    priceId: LEADS_MONTHLY_GROWTH_PRICE_ID,
    category: BillingCategory.Leads,
    billingPeriod: BillingPeriod.Monthly,
    subscriptionType: SubscriptionType.Growth,

    price: 44,
    features: {
      monthlyLeads: 1200,
      verifiedLeadsOnly: true,
      advanceFilterTools: true,
      dataEnrichment: true,
      liveChatSupport: true,
    },
  },
  {
    priceId: LEADS_MONTHLY_SKYROCKET_PRICE_ID,
    category: BillingCategory.Leads,
    billingPeriod: BillingPeriod.Monthly,
    subscriptionType: SubscriptionType.Skyrocket,
    price: 111,
    features: {
      monthlyLeads: 3200,
      verifiedLeadsOnly: true,
      advanceFilterTools: true,
      dataEnrichment: true,
      liveChatSupport: true,
    },
  },
  {
    priceId: LEADS_MONTHLY_SCALE_PRICE_ID,
    category: BillingCategory.Leads,
    billingPeriod: BillingPeriod.Monthly,
    subscriptionType: SubscriptionType.Scale,
    price: 194,
    features: {
      monthlyLeads: 10_000,
      verifiedLeadsOnly: true,
      advanceFilterTools: true,
      dataEnrichment: true,
      liveChatSupport: true,
    },
  },
  {
    priceId: LEADS_YEARLY_GROWTH_PRICE_ID,
    category: BillingCategory.Leads,
    billingPeriod: BillingPeriod.Yearly,
    subscriptionType: SubscriptionType.Growth,
    price: 372,
    features: {
      monthlyLeads: 1200,
      verifiedLeadsOnly: true,
      advanceFilterTools: true,
      dataEnrichment: true,
      liveChatSupport: true,
    },
  },
  {
    priceId: LEADS_YEARLY_SKYROCKET_PRICE_ID,
    category: BillingCategory.Leads,
    billingPeriod: BillingPeriod.Yearly,
    subscriptionType: SubscriptionType.Skyrocket,
    price: 924,
    features: {
      monthlyLeads: 3200,
      verifiedLeadsOnly: true,
      advanceFilterTools: true,
      dataEnrichment: true,
      liveChatSupport: true,
    },
  },
  {
    priceId: LEADS_YEARLY_SCALE_PRICE_ID,
    category: BillingCategory.Leads,
    billingPeriod: BillingPeriod.Yearly,
    subscriptionType: SubscriptionType.Scale,
    price: 1632,
    features: {
      monthlyLeads: 10_000,
      verifiedLeadsOnly: true,
      advanceFilterTools: true,
      dataEnrichment: true,
      liveChatSupport: true,
    },
  },
];

export default async function seedPlans(reinsert = false) {
  if (reinsert) await Plan.deleteMany({});
  const count = await Plan.countDocuments();
  if (count === 0) {
    logger.log("Seeding Plan Documents");
    await Plan.insertMany(plans);
  }
}
