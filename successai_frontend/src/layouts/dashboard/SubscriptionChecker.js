import React, { useEffect } from "react";
import { useGetCurrentPlanQuery } from "src/services/billing-service.js";
import { useGetMeQuery } from "src/services/user-service";

const SubscriptionChecker = ({ navigate }) => {
  const { data: currentPlan } = useGetCurrentPlanQuery();
  const { data: user } = useGetMeQuery();

  useEffect(() => {
    const checkSubscriptionStatus = () => {
      if (!currentPlan) return;
      const haveFreeTrial = new Date(currentPlan.freeTrialExpiresAt).getTime() > Date.now();
      if (haveFreeTrial) return;

      const haveSubscription =
        currentPlan?.subscription?.sendingWarmup?.active ||
        currentPlan?.subscription?.leads?.active ||
        (user?.assignedPlan && user?.assignedPlan.length > 0 && !user?.isAppSumoRefund);

      const expiresSubscription =
        currentPlan?.subscription?.sendingWarmup?.expiresAt ||
        currentPlan?.subscription?.leads?.expiresAt;

      const date = new Date();
      const currentDate = date.toISOString();
      const freeTrialExpiresSubscription = currentPlan.freeTrialExpiresAt;
      if (haveSubscription) return;

      if (
        expiresSubscription ? expiresSubscription : freeTrialExpiresSubscription !== currentDate
      ) {
        navigate("/settings/expired");
      }
    };

    checkSubscriptionStatus();
  }, [currentPlan, navigate, user?.assignedPlan]);

  return null;
};

export default SubscriptionChecker;
