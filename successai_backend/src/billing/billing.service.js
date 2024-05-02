import Stripe from "stripe";
import Plan from "./models/plan.model.js";
import UserPlan from "./models/user-plan.model.js";
import BillingCategory from "./enum/billing-category.js";
import BillingPeriod from "./enum/billing-period.enum.js";
import DefaultUsage from "./enum/default-usage.js";
import PlanUsage from "./models/plan-usage.model.js";
import moment from "moment";
import HttpErrors from "http-errors";
import { getUserUsageByCoupon } from "../appsumo/appsumo.service.js";
import { getUserById } from "../user/user.service.js";
import { getPlanInfo } from "../appsumo/utils/getPlan.js";
import User from "../user/models/user.model.js";
import Productlicence from "../appsumo/models/productlicence.model.js";
import { generateIntercomEvent } from '../common/utils/intercom.js';
import * as intercomService from "../intercom/intercom.service.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export function getStripe() {
  return stripe;
}

export function getPlan(filter) {
  return Plan.findOne(filter);
}

export function getUserPlan(filter) {
  return UserPlan.findOne(filter);
}

export async function createUserPlan(user, sumo) {
  const customer = await stripe.customers.create({
    name: user.name.first + " " + user.name.last,
    email: user.email,
    metadata: { customer_key: user?.email },
  });

  const userPlan = new UserPlan({
    user,
    stripeCustomerId: customer.id,
    freeTrialExpiresAt: sumo
      ? moment(user.createdAt).add(5, "years")
      : moment(user.createdAt).add(15, "days"),
    subscription: {
      sendingWarmup: null,
      leads: null,
    },
  });

  await userPlan.save();
  await createUserUsage(user, sumo);
  return customer?.id;
}

export async function updateUserEmail(stripeCustomerId, email) {
  try {
    const customer = await stripe.customers.update(stripeCustomerId, {
      email: email,
      metadata: { customer_key: email },
    });

    return customer;
  } catch (error) {
    throw error;
  }
}


export async function createAppSumoUserPlan(user, data) {
  const customer = await stripe.customers.create({
    name: user.name.first + " " + user.name.last,
    email: user.email,
  });

  const userPlan = new UserPlan({
    user,
    stripeCustomerId: customer.id,
    freeTrialExpiresAt: moment(user.createdAt).add(15, "days"),
    subscription: {
      sendingWarmup: null,
      leads: null,
    },
  });

  await userPlan.save();
  await createUserUsage(user, data);
}

export async function updatePlan(user, plan) {
  let userPlan = await UserPlan.findOne({ user });
  try {
    if (
      plan.category === BillingCategory.SendingWarmup &&
      userPlan?.subscription?.sendingWarmup
    ) {
      const subscription = await stripe.subscriptions.retrieve(
        userPlan.subscription.sendingWarmup.id
      );
      const currentPlan = await Plan.findOne({ priceId: userPlan?.subscription?.sendingWarmup?.planId });
      const subscriptionItemId = subscription.items.data[0].id;

      const updated = await stripe.subscriptions.update(
        userPlan.subscription.sendingWarmup.id,
        {
          items: [{ id: subscriptionItemId, price: plan.priceId }],
          billing_cycle_anchor: "now",
          metadata:{
            type: 'Manually'
          }
        }
      );

      userPlan.subscription.sendingWarmup.planId = updated.plan.id;
      userPlan.subscription.sendingWarmup.active = updated.plan.active;
      userPlan.subscription.sendingWarmup.expiresAt = new Date(
        updated.current_period_end * 1000
      );
      userPlan.subscription.sendingWarmup.resetDate = moment()
        .add(30, "days")
        .toDate();
      userPlan.subscription.sendingWarmup.planType = plan.billingPeriod;
      const newPlan = await Plan.findOne({ priceId: updated.plan.id });
      const planUsageByUser = await findUserPlanUsage(userPlan.user);
      await updateUserUsage(userPlan.user, {
        activeLeads: newPlan.features.activeLeads,
        monthlyEmails: newPlan.features.monthlyEmails - currentPlan.features.monthlyEmails + planUsageByUser.monthlyEmails,
        aiWriterCredits: newPlan.features.aiWriterCredits - currentPlan.features.aiWriterCredits + planUsageByUser.aiWriterCredits,
      });
      await userPlan.save();
      return true;
    } else if (
      plan.category === BillingCategory.Leads &&
      userPlan?.subscription?.leads
    ) {
      const currentPlan = await Plan.findOne({ priceId: userPlan?.subscription?.leads?.planId });
      const subscription = await stripe.subscriptions.retrieve(
        userPlan.subscription.leads.id
      );
      const subscriptionItemId = subscription.items.data[0].id;

      const updated = await stripe.subscriptions.update(
        userPlan.subscription.leads.id,
        {
          items: [{ id: subscriptionItemId, price: plan.priceId }],
          billing_cycle_anchor: "now",
        }
      );

      userPlan.subscription.leads.planId = updated.plan.id;
      userPlan.subscription.leads.active = updated.plan.active;
      userPlan.subscription.leads.expiresAt = new Date(
        updated.current_period_end * 1000
      );
      userPlan.subscription.leads.resetDate = moment().add(30, "days").toDate();
      userPlan.subscription.leads.planType = plan.billingPeriod;
      const newPlan = await Plan.findOne({ priceId: updated.plan.id });
      const planUsageByUser = await findUserPlanUsage(userPlan.user);
      const usedCredits = currentPlan.features.monthlyLeads - planUsageByUser.leadsCredits;
      await updateUserUsage(userPlan.user, {
        leadsCredits: newPlan.features.monthlyLeads - usedCredits
      });
      await userPlan.save();
      return true;
    } else {
      let stripeCustomerId;
      if (!userPlan && user?.appSumoCode && user?.assignedPlan) {
        stripeCustomerId = await createUserPlan(user, user?.assignedPlan);
      } else {
        stripeCustomerId = userPlan.stripeCustomerId;
      }
      const session = await createCheckoutSession(
        stripeCustomerId,
        plan.priceId
      );
      return { url: session.url };
    }
  } catch (e) {
    // console.log(e);
    if (e.code === "resource_missing") {
      return {
        errorMsg:
          "No attached default payment method. Please consider adding a default payment method",
      };
    } else {
      return { errorMsg: "Issue in updating plan. Contact support." };
    }
  }
}

export async function createCheckoutSession(customerId, priceId) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    success_url: `${process.env.STRIPE_REDIRECT_URL}?success=true`,
    cancel_url: `${process.env.STRIPE_REDIRECT_URL}?success=false`,
  });
  return session;
}
export async function addCouponsToStripe(coupons) {
  const session = await stripe.coupons.create({});
}
export async function handleWebhookEvent(event) {
  const eventType = event.type;
  const data = event.data.object;

  const plan = await Plan.findOne({ priceId: data.plan?.id });
  const userPlan = await UserPlan.findOne({
    stripeCustomerId: data.customer,
  });
  let user;
  if (userPlan){
    user = await User.findById(userPlan.user);
  }
  switch (eventType) {
    case "customer.subscription.created":
      //console.log("customer.subscription.updated");
      const subscriptionCreate = {
        id: data.id,
        planId: data.plan.id,
        active: data.plan.active,
        resetDate: moment().add(30, "days").toDate(),
        planType: plan.billingPeriod,
        expiresAt: new Date(data.current_period_end * 1000),
      };
      let isAppSumoUser = false;
      
      let activeLeadsOnCreate = plan.features.activeLeads;
      let monthlyEmailsOnCreate = plan.features.monthlyEmails;
      let aiWriterCreditsOnCreate = plan.features.aiWriterCredits;
      let monthlyLeadsOnCreate = plan.features.monthlyLeads;
      if (user?.appSumoCode && !user?.isAppSumoRefund) {
        isAppSumoUser = true;
        const appsumoUsage = getPlanInfo(user?.assignedPlan);
        activeLeadsOnCreate = activeLeadsOnCreate + (appsumoUsage.activeLeads || 0);
        monthlyEmailsOnCreate = monthlyEmailsOnCreate + (appsumoUsage.EmailsPerMonth || 0);
        aiWriterCreditsOnCreate = aiWriterCreditsOnCreate + (appsumoUsage.AIContentPerMonth || 0);
        monthlyLeadsOnCreate = monthlyLeadsOnCreate + (appsumoUsage.leadsCreditsPerMonth || 0);
      }

      if (plan.category === BillingCategory.SendingWarmup) {
        userPlan.subscription.sendingWarmup = subscriptionCreate;
        const updateUsage = await updateUserUsage(userPlan.user, {
          activeLeads: activeLeadsOnCreate,
          monthlyEmails: monthlyEmailsOnCreate,
          aiWriterCredits: aiWriterCreditsOnCreate,
        });

        if (!updateUsage) {
          await createUsageForPlan(userPlan.user, {
            activeLeads: activeLeadsOnCreate,
            monthlyEmails: monthlyEmailsOnCreate,
            aiWriterCredits: aiWriterCreditsOnCreate,
            leadsCredits: isAppSumoUser ? monthlyLeadsOnCreate - plan.features.monthlyLeads : DefaultUsage.leadsCredits,
          });
        }
      }

      if (plan.category === BillingCategory.Leads) {
        userPlan.subscription.leads = subscriptionCreate;
        const updateUsage = await updateUserUsage(userPlan.user, {
          leadsCredits: plan.features.monthlyLeads,
        });

        if (!updateUsage) {
          await createUsageForPlan(userPlan.user, {
            leadsCredits: monthlyLeadsOnCreate,
            activeLeads: isAppSumoUser ? activeLeadsOnCreate - plan.features.activeLeads : DefaultUsage.activeLeads,
            monthlyEmails: isAppSumoUser ? monthlyEmailsOnCreate - plan.features.monthlyEmails : DefaultUsage.monthlyEmails,
            aiWriterCredits: isAppSumoUser ? aiWriterCreditsOnCreate - plan.features.aiWriterCredits : DefaultUsage.aiWriterCredits,
          });
        }
      }

      await userPlan.save();
      break;
    case "customer.subscription.updated":
      //console.log("customer.subscription.updated");
      const subscription = {
        id: data.id,
        planId: data.plan.id,
        active: data.plan.active,
        resetDate: moment().add(30, "days").toDate(),
        planType: plan.billingPeriod,
        expiresAt: new Date(data.current_period_end * 1000),
      };
      const currentUserUsage = await findUserPlanUsage(userPlan.user);
      let activeLeads = 0;
      let monthlyEmails = 0;
      let aiWriterCredits = 0;
      let monthlyLeads = 0
      if(data.status !== "canceled") {
        if (event?.metadata?.type === "Manually") {
          activeLeads = currentUserUsage?.activeLeads || plan.features.activeLeads;
          monthlyEmails = currentUserUsage?.monthlyEmails || plan.features.monthlyEmails;
          aiWriterCredits = currentUserUsage?.aiWriterCredits || plan.features.aiWriterCredits;
          monthlyLeads = currentUserUsage?.leadsCredits || plan.features.monthlyLeads;
        } else {
          activeLeads = plan.features.activeLeads;
          monthlyEmails = plan.features.monthlyEmails;
          aiWriterCredits = plan.features.aiWriterCredits;
          monthlyLeads = plan.features.monthlyLeads;
        }
        if (user?.appSumoCode && !user?.isAppSumoRefund && !currentUserUsage) {
          const appsumoUsage = getPlanInfo(user?.assignedPlan);
          if (!currentUserUsage){
            activeLeads = activeLeads + (appsumoUsage?.activeLeads || 0);
            monthlyEmails = monthlyEmails + (appsumoUsage?.EmailsPerMonth || 0);
            aiWriterCredits = aiWriterCredits + (appsumoUsage?.AIContentPerMonth || 0);
            monthlyLeads = monthlyLeads + (appsumoUsage?.leadsCreditsPerMonth || 0);
          } else {

            // Total credits
            const totalActiveLeads = appsumoData.activeLeads + (plan.features.activeLeads || 0);
            const totalMonthlyEmailss = appsumoData.EmailsPerMonth + (plan.features.monthlyEmails || 0);
            const totalAiWriterCredits = appsumoData.AIContentPerMonth + (plan.features.aiWriterCredits || 0);
            const totalLeadsCredits = appsumoData.leadsCreditsPerMonth + (plan.features.monthlyLeads || 0);

            activeLeads = Math.min(currentUserUsage?.activeLeads + (plan.features.activeLeads + 0), totalActiveLeads);
            monthlyEmails = Math.min(currentUserUsage?.monthlyEmails + (plan.features.monthlyEmails + 0), totalMonthlyEmailss);
            aiWriterCredits = Math.min(currentUserUsage?.aiWriterCredits + (plan.features.aiWriterCredits + 0), totalAiWriterCredits);
            monthlyLeads = Math.min(currentUserUsage?.leadsCredits + (plan.features.monthlyLeads + 0), totalLeadsCredits);
          }
        }
      } else if (user?.appSumoCode && !user?.isAppSumoRefund){
        const appsumoUsage = getPlanInfo(user?.assignedPlan);
        activeLeads = appsumoUsage?.activeLeads || 0;
        monthlyEmails = appsumoUsage?.EmailsPerMonth || 0;
        aiWriterCredits = appsumoUsage?.AIContentPerMonth || 0;
        monthlyLeads = appsumoUsage?.leadsCreditsPerMonth || 0;
      }

      if (plan.category === BillingCategory.SendingWarmup) {
        userPlan.subscription.sendingWarmup =
          data.status !== "canceled" ? subscription : null;
        const updateUsage = await updateUserUsage(userPlan.user, {
          activeLeads: activeLeads,
          monthlyEmails: monthlyEmails,
          aiWriterCredits: aiWriterCredits,
        });

        if (!updateUsage) {
          await createUsageForPlan(userPlan.user, {
            activeLeads: activeLeads,
            monthlyEmails: monthlyEmails,
            aiWriterCredits: aiWriterCredits,
            leadsCredits: DefaultUsage.leadsCredits,
          });
        }
      }

      if (plan.category === BillingCategory.Leads) {
        userPlan.subscription.leads =
          data.status !== "canceled" ? subscription : null;
        const updateUsage = await updateUserUsage(userPlan.user, {
          leadsCredits: monthlyLeads,
        });

        if (!updateUsage) {
          await createUsageForPlan(userPlan.user, {
            leadsCredits: monthlyLeads,
            activeLeads: DefaultUsage.activeLeads,
            monthlyEmails: DefaultUsage.monthlyEmails,
            aiWriterCredits: DefaultUsage.aiWriterCredits,
          });
        }
      }

      await userPlan.save();
      break;
    case "customer.subscription.deleted":
      let activeLeadsOnDelete = 0;
      let monthlyEmailsOnDelete = 0;
      let aiWriterCreditsOnDelete = 0;
      let monthlyLeadsOnDelete = 0
      if (user?.appSumoCode && !user?.isAppSumoRefund) {
        const appsumoUsage = getPlanInfo(user?.assignedPlan);
        activeLeadsOnDelete = appsumoUsage.activeLeads || 0;
        monthlyEmailsOnDelete = appsumoUsage.EmailsPerMonth || 0;
        aiWriterCreditsOnDelete = appsumoUsage.AIContentPerMonth || 0;
        monthlyLeadsOnDelete = appsumoUsage.leadsCreditsPerMonth || 0;
      }
      if (plan.category === BillingCategory.SendingWarmup) {
        userPlan.subscription.sendingWarmup = null;
        const updateUsage = await updateUserUsage(userPlan.user, {
          activeLeads: activeLeadsOnDelete,
          monthlyEmails: monthlyEmailsOnDelete,
          aiWriterCredits: aiWriterCreditsOnDelete,
        });

        if (!updateUsage) {
          await createUsageForPlan(userPlan.user, {
            activeLeads: activeLeadsOnDelete,
            monthlyEmails: monthlyEmailsOnDelete,
            aiWriterCredits: aiWriterCreditsOnDelete,
            leadsCredits: monthlyLeadsOnDelete,
          });
        }
      }

      if (plan.category === BillingCategory.Leads) {
        userPlan.subscription.leads = null;
        const updateUsage = await updateUserUsage(userPlan.user, {
          leadsCredits: monthlyLeadsOnDelete,
        });

        if (!updateUsage) {
          await createUsageForPlan(userPlan.user, {
            activeLeads: activeLeadsOnDelete,
            monthlyEmails: monthlyEmailsOnDelete,
            aiWriterCredits: aiWriterCreditsOnDelete,
            leadsCredits: monthlyLeadsOnDelete,
          });
        }
      }
      await userPlan.save();
      break;
    case "invoice.payment_failed":
      //console.log("invoice.payment_failed");
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      // console.log('Payment failed', data);
      break;
    default:
    // Unhandled event type
  }
}

export async function updateUserUsage(user, update) {
  return PlanUsage.findOneAndUpdate({ user }, update);
}

export async function createUserUsage(user, sumo) {
  if (sumo) {
    const userUsage = getPlanInfo(sumo);
    return PlanUsage.create({
      user,
      activeLeads: userUsage.activeLeads,
      monthlyEmails: userUsage.EmailsPerMonth,
      aiWriterCredits: userUsage.AIContentPerMonth,
      leadsCredits: DefaultUsage.leadsCredits,
    });
  }
  return PlanUsage.create({
    user,
    activeLeads: DefaultUsage.activeLeads,
    monthlyEmails: DefaultUsage.monthlyEmails,
    aiWriterCredits: DefaultUsage.aiWriterCredits,
    leadsCredits: DefaultUsage.leadsCredits,
  });
}

export async function createAppSumoUserUsage(user, PlanData) {
  const userUsage = getPlanInfo(PlanData?.data?.plan_id);
  return PlanUsage.create({
    user,
    activeLeads: userUsage.activeLeads,
    monthlyEmails: userUsage.EmailsPerMonth,
    aiWriterCredits: userUsage.AIContentPerMonth,
    leadsCredits: userUsage.leadsCreditsPerMonth,
  });
}

export async function createUsageForPlan(user, plan) {
  return PlanUsage.create({
    user,
    ...plan,
  });
}
// no credit left from lead
export async function findUserPlanUsage(user) {
  return PlanUsage.findOne({
    user,
  });
}

export async function resetYearlyPlanData() {
  const resetSendingWarmup = await UserPlan.find({
    "subscription.sendingWarmup.resetDate": { $lte: moment().endOf("day") },
    "subscription.sendingWarmup.planType": BillingPeriod.Yearly,
  }).populate('user');
  const nextResetDate = moment().add(30, "days").toDate();

  for await (const element of resetSendingWarmup) {
    if (element.user.isAppSumoRefund || !element.user.assignedPlan){
      const plan = await Plan.findOne({
        priceId: element.subscription.sendingWarmup.planId,
      });
      
      await PlanUsage.findOneAndUpdate(
        { user: element.user },
        {
          activeLeads: plan.features.activeLeads,
          monthlyEmails: plan.features.monthlyEmails,
          aiWriterCredits: plan.features.aiWriterCredits,
        }
      );

      await UserPlan.findByIdAndUpdate(element._id, {
        "subscription.sendingWarmup.resetDate": nextResetDate,
      });
    }
  }

  const resetLeads = await UserPlan.find({
    "subscription.leads.resetDate": { $lte: moment().endOf("day") },
    "subscription.leads.planType": BillingPeriod.Yearly,
  }).populate('user');

  for await (const element of resetLeads) {
    if (element.user.isAppSumoRefund || !element.user.assignedPlan) {
      const plan = await Plan.findOne({
        priceId: element.subscription.leads.planId,
      });

      await PlanUsage.findOneAndUpdate(
        { user: element.user },
        {
          leadsCredits: plan.features.monthlyLeads,
        }
      );

      await UserPlan.findByIdAndUpdate(element._id, {
        "subscription.leads.resetDate": nextResetDate,
      });
    }
  }

  return true;
}

export async function resetAppsumoPlandata() {
  try {
    const responses = await User.aggregate([
      {
        $match: {
          isAppSumoRefund: false,
          assignedPlan: { $ne: null },
          appSumoCode: { $ne: null }
        }
      },
      {
        $lookup: {
          from: 'user_plans',
          localField: '_id',
          foreignField: 'user',
          as: 'userPlan'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          appSumoCode: 1,
          assignedPlan: 1,
          createdAt: 1,
          isAppSumoRefund: 1,
          userPlan: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$userPlan',
                  as: 'plan',
                  cond: {
                    $and: [
                      { $eq: ['$$plan.user', '$_id'] },
                    ]
                  }
                }
              },
              0
            ]
          },
        }
      }
    ]);
    const nextResetDate = moment().add(30, "days").toDate();
    for await (const element of responses) {
      const currentUsage = await PlanUsage.findOne({ user: element });
      const sendingWarmup = element?.userPlan?.subscription?.sendingWarmup;
      const leadsPlan = element?.userPlan?.subscription?.leads;
      let sendingWarmupData = {};
      let leadsData = {};
      const appsumoData = getPlanInfo(element?.assignedPlan);

      if (sendingWarmup) {
        sendingWarmupData = await Plan.findOne({
          priceId: sendingWarmup.planId,
        });
      }

      if (leadsPlan) {
        leadsData = await Plan.findOne({
          priceId: leadsPlan.planId,
        });
      }

      const endOfDay = moment().endOf('day');

      // Total credits
      const totalActiveLeads = appsumoData.activeLeads + (sendingWarmupData?.features?.activeLeads || 0);
      const totalMonthlyEmailss = appsumoData.EmailsPerMonth + (sendingWarmupData?.features?.monthlyEmails || 0);
      const totalAiWriterCredits = appsumoData.AIContentPerMonth + (sendingWarmupData?.features?.aiWriterCredits || 0);
      const totalLeadsCredits = appsumoData.leadsCreditsPerMonth + (leadsData?.features?.monthlyLeads || 0);

      // Update for AppsumoPlans
      const appsumoLicence = await Productlicence.findOne({ uuid: element?.appSumoCode });
      let considerDate = appsumoLicence?.plan_reset_date;
      if(!considerDate){
        if(endOfDay.diff(moment(appsumoLicence?.createdAt), 'days') >= 30){
          considerDate = appsumoLicence?.createdAt;
        } else {
          considerDate = null;
        }
      }

      if (considerDate && moment(considerDate).isSameOrBefore(endOfDay) && appsumoLicence?.action === 'activate') {
        const { intercomEvent } = await generateIntercomEvent(element.email, "Appsumo Plan Renewed", {}, element._id)
        await PlanUsage.findOneAndUpdate(
          { user: element },
          {
            activeLeads: Math.min(currentUsage?.activeLeads + appsumoData.activeLeads, totalActiveLeads),
            monthlyEmails: Math.min(currentUsage?.monthlyEmails + appsumoData.EmailsPerMonth, totalMonthlyEmailss),
            aiWriterCredits: Math.min(currentUsage?.aiWriterCredits + appsumoData.AIContentPerMonth, totalAiWriterCredits),
            leadsCredits: Math.min(currentUsage?.leadsCredits + appsumoData.leadsCreditsPerMonth, totalLeadsCredits),
          }
        );

        await Productlicence.findOneAndUpdate(appsumoLicence?._id, {
          plan_reset_date: nextResetDate,
        })
        if(intercomEvent){
          await intercomService.createIntercomEvent(intercomEvent);
        }
      }
      // Update for SendingWarmup
      if (sendingWarmup && moment(sendingWarmup?.resetDate).isSameOrBefore(endOfDay) && sendingWarmup?.planType === BillingPeriod.Yearly) {
        await PlanUsage.findOneAndUpdate(
          { user: element },
          {
            activeLeads: Math.min(currentUsage?.activeLeads + sendingWarmupData?.features?.activeLeads, totalActiveLeads),
            monthlyEmails: Math.min(currentUsage?.monthlyEmails + sendingWarmupData?.features?.monthlyEmails, totalMonthlyEmailss),
            aiWriterCredits: Math.min(currentUsage?.aiWriterCredits + sendingWarmupData?.features?.aiWriterCredits, totalAiWriterCredits),
          }
        );

        await UserPlan.findByIdAndUpdate(element?.userPlan._id, {
          "subscription.sendingWarmup.resetDate": nextResetDate,
        });
      }

      // Update for leadsPlan
      if (leadsPlan && moment(leadsPlan?.resetDate).isSameOrBefore(endOfDay) && leadsPlan?.planType === BillingPeriod.Yearly) {
        await PlanUsage.findOneAndUpdate(
          { user: element },
          {
            leadsCredits: Math.min(currentUsage?.aiWriterCredits + leadsData?.features?.monthlyLeads, totalLeadsCredits),
          }
        );

        await UserPlan.findByIdAndUpdate(element?.userPlan?._id, {
          "subscription.leads.resetDate": nextResetDate,
        });
      }
    }
    return true;
  } catch (error) {
    // console.error(error);
    return null;
  }
}

export async function getUserPaymentMethod(user) {
  try {
    const userPlan = await getUserPlan(user);
    const customer = await stripe.customers.retrieve(userPlan.stripeCustomerId);
    // const paymentMethod = await stripe.customers.retrievePaymentMethod(
    //   userPlan.stripeCustomerId,
    //   customer.default_source
    // );
    const getPaymentMethods = await stripe.customers.listPaymentMethods(
      userPlan.stripeCustomerId,
      { type: "card", limit: 100 }
    );

    const paymentMethods = getPaymentMethods.data.map((paymentMethod) => {
      const newPaymentMethod = {
        id: paymentMethod.id,
        name: paymentMethod.billing_details.name,
        last4: paymentMethod.card.last4,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
        brand: paymentMethod.card.brand,
      };
      if (paymentMethod.id === customer.default_source) {
        newPaymentMethod.isDefault = true;
      } else {
        newPaymentMethod.isDefault = false;
      }
      return newPaymentMethod;
    });
    paymentMethods.sort(
      (a, b) => (b.isDefault ? 1 : -1) - (a.isDefault ? 1 : -1)
    );
    return paymentMethods;
  } catch (error) {
    return false;
  }
}

export async function createStripeSession(user) {
  try {
    const userPlan = await getUserPlan(user);
    const session = await stripe.billingPortal.sessions.create({
      customer: userPlan.stripeCustomerId,
      return_url: `${process.env.STRIPE_REDIRECT_URL}`,
    });
    return session.url;
  } catch (error) {
    return false;
  }
}

export async function cancelUserSubscriptions(user) {
  try {
    const subscriptions = await getStripeSubscriptions(user);
    const cancelledSubscription = await Promise.all(
      subscriptions.map(async (subscription) => {
        return await cancelStripeSubscriptions(subscription.id);
      })
    );
    return cancelledSubscription;
  } catch (error) {
    return false;
  }
}

export async function cancelStripeSubscriptions(subscriptionId) {
  try {
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );
    return canceledSubscription;
  } catch (error) {
    return false;
  }
}

export async function getStripeSubscriptions(user, status = "active") {
  try {
    const userPlan = await getUserPlan(user);
    const subscriptions = await stripe.subscriptions.list({
      customer: userPlan.stripeCustomerId,
      status,
    });
    return subscriptions.data;
  } catch (error) {
    return false;
  }
}

export async function findUserPlan(user, aiCredit, emailCredit) {
  const userPlan = await UserPlan.findOne({ user });
  
  if (userPlan?.subscription?.sendingWarmup) {
    const { planId } = userPlan?.subscription?.sendingWarmup;

    const plan = await Plan.findOne({
      priceId: planId,
    });

    if (!plan) throw new HttpErrors.NotFound("Plans not found");
    const { monthlyEmails, aiWriterCredits } = plan.features;
    if (user?.assignedPlan && !user?.isAppSumoRefund) {
      const planData = getPlanInfo(user?.assignedPlan);
      const usedEmailCredit = monthlyEmails + planData.EmailsPerMonth - emailCredit;
      const usedAiCredit = aiWriterCredits + planData.AIContentPerMonth - aiCredit;
      return {
        usedEmailCredit,
        usedAiCredit,
        montlyEmailCredit: monthlyEmails + planData.EmailsPerMonth,
        aiWriterLimit: aiWriterCredits + planData.AIContentPerMonth,
      };
    }
    const usedEmailCredit = monthlyEmails - emailCredit;
    const usedAiCredit = aiWriterCredits - aiCredit;
    return {
      usedEmailCredit,
      usedAiCredit,
      montlyEmailCredit: monthlyEmails,
      aiWriterLimit: aiWriterCredits,
    };
  } else {
    if (user?.assignedPlan && !user?.isAppSumoRefund) {
      const planData = getPlanInfo(user?.assignedPlan);
      const monthlyEmails = planData.EmailsPerMonth;
      const aiWriterCredits = planData.AIContentPerMonth;
      const usedEmailCredit = monthlyEmails - emailCredit;
      const usedAiCredit = aiWriterCredits - aiCredit;
      return {
        usedEmailCredit,
        usedAiCredit,
        montlyEmailCredit: monthlyEmails,
        aiWriterLimit: aiWriterCredits,
      };
    }

    const { monthlyEmails, aiWriterCredits } = DefaultUsage;
    const usedEmailCredit = monthlyEmails - emailCredit;
    const usedAiCredit = aiWriterCredits - aiCredit;
    return {
      usedEmailCredit: usedEmailCredit ? usedEmailCredit : 0,
      usedAiCredit: usedAiCredit ? usedAiCredit : 0,
      montlyEmailCredit: monthlyEmails,
      aiWriterLimit: aiWriterCredits,
    };
  }
}

export async function getAllUserInvoices(user) {
  try {
    const userPlan = await getUserPlan({ user });
    const invoices = await stripe.invoices.list({
      limit: 100,
      customer: userPlan.stripeCustomerId,
    });
    const invoiceLinks = invoices.data.map((invoice) => {
      return {
        invoiceNumber: invoice.number,
        pdfUrl: invoice.invoice_pdf,
        createdAt: moment
          .unix(parseInt(invoice.created))
          .format("ddd MMM D YYYY"),
      };
    });

    return invoiceLinks;
  } catch (error) {
    throw new HttpErrors.BadRequest("Error fetching user invoices:");
  }
}

export async function cancelSubscription(user, planId) {
  try {
    let userPlan = await getUserPlan(user);
    if (!userPlan) {
      throw new Error("User plan not found");
    }
    const subscriptions = await stripe.subscriptions.list({
      customer: userPlan.stripeCustomerId,
      status: "active",
    });

    const selectedSubscription = subscriptions?.data?.find(
      (cur) => cur?.plan?.id === planId
    );
    if (!selectedSubscription) {
      throw new Error("Subscription not found");
    }

    const canceledSubscription = await stripe.subscriptions.cancel(
      selectedSubscription.id
    );
    if (!canceledSubscription.status === "canceled") {
      throw new Error("Failed to cancel subscription");
    }

    if (userPlan.subscription) {
      if (userPlan.subscription.sendingWarmup?.planId === planId) {
        userPlan.subscription.sendingWarmup = null;
      } else if (userPlan.subscription.leads?.planId === planId) {
        userPlan.subscription.leads = null;
      }
    }
    const updatedUserPlan = await userPlan.save();
    return updatedUserPlan;
  } catch (error) {
    // console.error(error);
    throw new HttpErrors.BadRequest("Error while canceling user subcription:");
  }
}

export async function getUserSubscriptions(
  customerId,
  limit = 100,
  created,
  startingAfter,
  endingBefore
) {
  try {
    const stripeSubscription = await stripe.invoices.list({
      customer: customerId,
      expand: ["total_count"],
      ...(startingAfter && { starting_after: startingAfter }),
      ...(endingBefore && { ending_before: endingBefore }),
      ...(created && { created }),
      limit,
    });

    return stripeSubscription;
  } catch (e) {
    throw new HttpErrors.BadRequest("Error while retrieving user invoices");
  }
}

export async function getRevenueData(start, end) {
  let query;
  let allInvoices = [];
  let nextPageToken = null;

  if (start && end) {
    query = `created>${Math.round(
      Number(start) / 1000
    )} AND created<${Math.round(
      Number(end) / 1000
    )} AND status:"paid" AND total>0`;
  } else {
    query = 'status:"paid" AND total>0';
  }
  do {
    try {
      const response = await stripe.invoices.search({
        query: query,
        limit: 100,
        ...(nextPageToken && { page: nextPageToken }),
      });

      allInvoices.push(...response.data);
      nextPageToken = response.has_more ? response.next_page : null;
    } catch (error) {
      throw new HttpErrors.BadRequest(
        "Error while retrieving invoices for revenue"
      );
    }
  } while (nextPageToken);

  return allInvoices;
}
