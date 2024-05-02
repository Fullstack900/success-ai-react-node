import { Box, Typography } from "@mui/material";
import BillingAndUsage from "./BillingAndUsage.js";
import { useGetCurrentPlanQuery } from "src/services/billing-service.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMeQuery } from "src/services/user-service";

const Page = () => {
  const { data: currentPlan } = useGetCurrentPlanQuery();
  const { data: user } = useGetMeQuery();
  const navigate = useNavigate();
  const [type, setType] = useState("");

  useEffect(() => {
    const expiresSubscription =
      currentPlan?.subscription?.sendingWarmup?.expiresAt ||
      currentPlan?.subscription?.leads?.expiresAt;
    const date = new Date();
    const currentDate = date.toISOString();
    const freeTrialExpiresSubscription = currentPlan?.freeTrialExpiresAt;
    const haveSubscription =
      currentPlan?.subscription?.sendingWarmup?.active ||
      currentPlan?.subscription?.leads?.active ||
      (user?.assignedPlan && user?.assignedPlan.length > 0 && !user?.isAppSumoRefund);

    if (haveSubscription) {
      navigate("/");
      return;
    } else {
      if (new Date(freeTrialExpiresSubscription) > new Date(currentDate)) {
        navigate("/");
        return;
      }
    }

    if (expiresSubscription) {
      if (new Date(currentDate) > new Date(expiresSubscription)) {
        setType("subscription");
      }
    } else {
      if (new Date(currentDate) > new Date(freeTrialExpiresSubscription)) {
        setType("trial");
      }
    }
  }, [currentPlan, navigate, user?.assignedPlan]);

  return type === "" ? (
    <></>
  ) : (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        p: 8,
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "85%",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              width: "75%",
              flexDirection: "column",
              mb: 3,
            }}
          >
            {" "}
            <Typography
              sx={{
                // color: "#28287B",
                // fontSize: "32px",
                // fontWeight: 700,
                // lineHeight: "40px",
                // letterSpacing: "0px",
                color: "#28287B",
                fontSize: "24px",
                fontWeight: 900,
                lineHeight: "32px",
                letterSpacing: "0px",
              }}
            >
              {type === "trial"
                ? "Hey there! 🌱 Your 14-day free trial has come to an end."
                : type === "subscription"
                ? "Hey there! 🌱 Your subscription has come to an end."
                : "Hey there! 🌱"}
            </Typography>
            <Typography
              sx={{
                color: "#8181B0",
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "24px",
                letterSpacing: "0px",
                mt: 2,
              }}
            >
              We've been so excited to be part of your growth journey so far. At Success.ai, we're
              more than just a tool - we're your partners in infinite growth. Our dedicated team
              works around the clock to put over 700 million verified leads right at your
              fingertips.
            </Typography>
            <Typography
              sx={{
                color: "#8181B0",
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "24px",
                letterSpacing: "0px",

                mt: 2,
              }}
            >
              We genuinely want to see you thrive, and we're here for you 24/7. For the cost of a
              daily cup of coffee, you can continue to harness the full power of Success.ai every
              day for an entire month.
            </Typography>
            <Typography
              sx={{
                color: "#28287B",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: "24px",
                letterSpacing: "0px",
                mt: 3,
              }}
            >
              🚀 <span style={{ fontWeight: 900 }}>Join us on this journey!</span> Dive back in and
              let's achieve greatness together.
            </Typography>
          </Box>

          <BillingAndUsage mode="trial" />
        </Box>
      </Box>
    </Box>
  );
};

export default Page;
