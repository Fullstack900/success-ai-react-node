import bcrypt from 'bcrypt';
import HttpErrors from 'http-errors';
import Appsumo from './models/appsumo.model.js';
import Productlicence from './models/productlicence.model.js';
import * as tokenService from '../token/token.service.js';
import Action from './enum/activation.enum.js';
import Coupon from "./models/coupon.model.js";
import { getPlanInfo } from "./utils/getPlan.js";
import User from '../user/models/user.model.js';
import PlanUsage from '../billing/models/plan-usage.model.js';
import DefaultUsage from '../billing/enum/default-usage.js';
import * as intercomService from "../intercom/intercom.service.js";
import moment from 'moment';
import { generateIntercomEvent } from '../common/utils/intercom.js';
import { successTierPlans } from './utils/getPlan.js';
import Plan from '../billing/models/plan.model.js';
import UserPlan from '../billing/models/user-plan.model.js';
import { findUserPlanUsage } from '../billing/billing.service.js';


export async function getAccessToken({ username, password }) {
    
    const user =  username === process.env.APP_SUMO_USER;
    if (!user) throw new HttpErrors.Unauthorized('Invalid username or password');

    const isValidPassword = password === process.env.APP_SUMO_SECRECT;
    if (!isValidPassword) {
      throw new HttpErrors.Unauthorized('Invalid username or password');
  }
    const accessToken = tokenService.generateAppSumoAccessToken(username);    
    return accessToken;
}

export async function licenceUpdate(user, activationData) {
    const findExist = await Productlicence.findOne({
        uuid: activationData?.uuid
    });
   
    if(findExist &&  activationData.action === Action.Activate){
        throw new HttpErrors.BadRequest('This lincence key already exists');

    }
    let licence =''

    if (findExist) {
        licence = await Productlicence.findByIdAndUpdate(findExist._id, activationData, { new: true })
        const user = await User.findOne({ appSumoCode: activationData?.uuid });
        const planData = getPlanInfo(activationData?.plan_id)
        let attribute = {};
        if (user) {
          const {
            intercomEvent, intercomUser
          } = await generateIntercomEvent(user.email, "Appsumo Plan Update", {}, user._id);
          if(activationData?.action === "refund"){
          user.isAppSumoRefund =true;
          attribute = { 
            id: intercomUser.id,
            customAttributes: {
              AppSumoPlan: "refund",
            } 
          };

          const userPlan = await UserPlan.findOne({user: user})

          let leadsPlan;
          let sendingWarmupPlan;
          if(userPlan?.subscription?.leads && userPlan?.subscription?.leads?.active){
             leadsPlan = await Plan.findOne({
              priceId: userPlan.subscription.leads.planId,
            });
          }
          if(userPlan?.subscription?.sendingWarmup && userPlan?.subscription?.sendingWarmup?.active){
            sendingWarmupPlan = await Plan.findOne({
              priceId: userPlan.subscription.sendingWarmup.planId,
            });
          }

          await PlanUsage.findOneAndUpdate(
            { user: user },
            {
              activeLeads: sendingWarmupPlan?.features?.activeLeads || DefaultUsage.activeLeads,
              monthlyEmails: sendingWarmupPlan?.features?.monthlyEmails || DefaultUsage.monthlyEmails,
              aiWriterCredits: sendingWarmupPlan?.features?.aiWriterCredits || DefaultUsage.aiWriterCredits,
              leadsCredits: leadsPlan?.features?.monthlyLeads || DefaultUsage.leadsCredits,
              freeTrialExpiresAt: moment().add(15, "days"),
            })
           }else {
                await PlanUsage.findOneAndUpdate(
                  { user: user },
                  {
                    activeLeads: planData.activeLeads,
                    monthlyEmails: planData.EmailsPerMonth,
                    aiWriterCredits: planData.AIContentPerMonth,
                    leadsCredits: planData.leadsCreditsPerMonth,
                  })
            attribute = {
              id: intercomUser.id,
              customAttributes: {
                AppSumoPlan: successTierPlans[activationData?.plan_id] || activationData?.plan_id,
              }
            };
            user.isAppSumoRefund =false;
          }
          user.assignedPlan = activationData?.plan_id;
          await user.save();
          await intercomService.createIntercomAttribute(attribute);
          await intercomService.createIntercomEvent(intercomEvent);
        } 
       
    } else {
        const emailExists =  await Productlicence.findOne({
            activation_email: activationData?.activation_email?.toLowerCase()
        });
        const user = await User.findOne({ email:  activationData?.activation_email?.toLowerCase()});
        if(user){
          throw new HttpErrors.BadRequest('A User is Already Register with this email.');
        }
       
        if(emailExists){
            throw new HttpErrors.BadRequest('A User is Already Register with this email.');
        }
        licence = await Productlicence.create(activationData);
    }

    if (!licence) {
        throw new HttpErrors.Unauthorized('Error while storing activation data');
    }

    let message = '';

    switch (licence.action) {
        case Action.Activate: {
            message = 'product activated';
            break;
        }
        case Action.EnahanceTier: {
            message = 'product enhanced';
            break;
        }
        case Action.ReduceTier: {
            message = 'product reduced';
            break;
        }
        case Action.Refund: {
            message = 'product refunded';
            break;
        }
        case Action.Update: {
            message = 'product updated';
            break;
        }
        default: {
            message = "Unhandled action";
            break;
        }
    }
    const response =  licence.action == Action.Activate ?  { message:message, redirect_url: `https://app.success.ai/validate?sumo=${licence?.uuid}&source=appsumo` } : { message }
    return response;
}

export async function findById(id){
    const findExist = await Appsumo.findById(id);
    return findExist;
}

export async function register(appsumoDetails) {
    const { username, password } = appsumoDetails;
    const userNameExists = await Appsumo.findOne({ username });
    if (userNameExists) throw new HttpErrors.BadRequest("UserName already exists");
    appsumoDetails.password = await bcrypt.hash(password, 10);
    const appSumoUser = await Appsumo.create(appsumoDetails);

    return appSumoUser;
}

export async function checkIsValidCoupon(coupon) {
  const findExist = await Coupon.findOne({ code: coupon });
  if (!findExist) {
    return { error: true, errorMessage: "Coupon not found" };
  }
  if (findExist) {
    if (findExist?.isDeleted) {
      return { error: true, errorMessage: "Coupon is already Used" };
    }
    return { error: false, coupon: findExist };
  }
}

export async function checkIsValidLicence(licence) {
    const emailExists =  await Productlicence.findOne({
        uuid: licence
    });

    if (!emailExists) {
      return { error: true, errorMessage: "Licence Not Found" };
    }
    if (emailExists) {
      if (emailExists?.user) {
        return { error: true, errorMessage: "This Licence is Already Used" };
      }
      return { error: false, data: emailExists };
    }
  }

export async function getUserUsageByCoupon(coupon) {
  const findExist = await Coupon.findOne({ code: coupon });
  const userUsage = getPlanInfo(findExist?.priceId);
  return userUsage;
}

export async function deleteCoupon(coupon) {
  const findExist = await Coupon.findOne({ code: coupon });
  findExist.isDeleted = true;
  await findExist.save();
}

export async function updateAppSumoPlan(req) {
  const {
    userId,
    appsumoPlan,
    appSumoCode,
    isNew
  } = req.body;
  if (userId) {
    const user = await User.findById(userId);
    if(!isNew){
     await Productlicence.findOneAndUpdate({ uuid: appSumoCode }, { plan_id: appsumoPlan });
     await User.findByIdAndUpdate(userId, { assignedPlan: appsumoPlan });
    } else {
      const activationData = {
        action: 'activate',
        plan_id: appsumoPlan,
        activation_email: user.email,
        invoice_item_uuid: appSumoCode,
        uuid: appSumoCode,
      }
      await Productlicence.create(activationData);
      await User.findByIdAndUpdate(userId, { assignedPlan: appsumoPlan, appSumoCode: appSumoCode });
    }

    const {
      intercomEvent, intercomUser
    } = await generateIntercomEvent(user.email, "Appsumo Plan Update", {}, user._id);
    let attribute = {
      id: intercomUser?.id,
      customAttributes: {
        AppSumoPlan: successTierPlans[appsumoPlan],
      }
    };
    const planInfo = getPlanInfo(appsumoPlan);
    const userPlan = await UserPlan.findOne({
      user: {
        _id: userId
      }
    });

    const currentUserUsage = await findUserPlanUsage(user);
    let activeLeads = 0;
    let monthlyEmails = 0;
    let aiWriterCredits = 0;
    let monthlyLeads = 0;

    let sendingWarmupPlan;
    let leadsPlan;
    if (userPlan && userPlan?.subscription?.sendingWarmup) {
      sendingWarmupPlan = await Plan.findOne({ priceId: userPlan.subscription.sendingWarmup?.planId });
    }
    if (userPlan && userPlan?.subscription?.leads) {
      leadsPlan = await Plan.findOne({ priceId: userPlan.subscription.leads?.planId });
    }
    if (!currentUserUsage) {
      activeLeads = planInfo.activeLeads || 0;
      monthlyEmails = planInfo.EmailsPerMonth || 0;
      aiWriterCredits = planInfo.AIContentPerMonth || 0;
      monthlyLeads = planInfo.leadsCreditsPerMonth || 0;
      await PlanUsage.create({
        user: user,
        activeLeads: activeLeads,
        monthlyEmails: monthlyEmails,
        aiWriterCredits: aiWriterCredits,
        leadsCredits: monthlyLeads,
      });
    } else {
      const totalActiveLeads = planInfo.activeLeads + (sendingWarmupPlan?.features?.activeLeads || 0);
      const totalMonthlyEmails = planInfo.EmailsPerMonth + (sendingWarmupPlan?.features?.monthlyEmails || 0);
      const totalAiWriterCredits = planInfo.AIContentPerMonth + (sendingWarmupPlan?.features.aiWriterCredits || 0);
      const totalLeadsCredits = planInfo.leadsCreditsPerMonth + (leadsPlan?.features?.monthlyLeads || 0);

      activeLeads = Math.min(currentUserUsage?.activeLeads + (planInfo?.activeLeads + 0), totalActiveLeads);
      monthlyEmails = Math.min(currentUserUsage?.monthlyEmails + (planInfo?.EmailsPerMonth + 0), totalMonthlyEmails);
      aiWriterCredits = Math.min(currentUserUsage?.aiWriterCredits + (planInfo?.AIContentPerMonth + 0), totalAiWriterCredits);
      monthlyLeads = Math.min(currentUserUsage?.leadsCredits + (planInfo?.leadsCreditsPerMonth + 0), totalLeadsCredits);
      
      await PlanUsage.findOneAndUpdate({ user }, {
        activeLeads: activeLeads,
        monthlyEmails: monthlyEmails,
        aiWriterCredits: aiWriterCredits,
        leadsCredits: monthlyLeads,
      })
    }
    if(intercomUser) {
      await intercomService.createIntercomAttribute(attribute);
      await intercomService.createIntercomEvent(intercomEvent);
    }
    return {message: "AppSumo plan has been successfully updated!"}
  }
}
