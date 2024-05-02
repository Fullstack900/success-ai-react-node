export function getPlanInfo(planName) {
  if (planName === "AppSumo Tier 1"  || planName === "successai_tier1") {
    return {
      activeLeads: 1200,
      EmailsPerMonth: 6000,
      AIContentPerMonth: 2500,
      leadsCreditsPerMonth:30
    };
  } else if (planName === "AppSumo Tier 2"   || planName === "successai_tier2") {
    return {
      activeLeads: 50000,
      EmailsPerMonth: 200000,
      AIContentPerMonth: 7500,
      leadsCreditsPerMonth:60
    };
  } else if (planName === "AppSumo Tier 3"   || planName === "successai_tier3") {
    return {
      activeLeads: 150000,
      EmailsPerMonth: 400000,
      AIContentPerMonth: 15000,
      leadsCreditsPerMonth:100
    };
  } else if (planName === "AppSumo Tier 4"   || planName === "successai_tier4") {
    return {
      activeLeads: 500000,
      EmailsPerMonth: 1000000,
      AIContentPerMonth: 30000,
      leadsCreditsPerMonth:250
      
    };
  } else {
    // Handle other cases or return null/undefined if no match
    return null;
  }
}

export const successTierPlans = { successai_tier1: "SuccessAi Tier 1", successai_tier2: "SuccessAi Tier 2", successai_tier3: "SuccessAi Tier 3", successai_tier4: "SuccessAi Tier 4" };