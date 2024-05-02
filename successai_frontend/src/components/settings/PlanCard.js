import React from "react";
import { Box, Typography, Button } from "@mui/material"; // assuming you are using Material-UI components
import { GrowthIcon } from "src/assets/general/GrowthIcon";


const PlanCard = ({
  title,
  price,
  billingMonthly,
  handleUpdatePlanClick,
  isCurrentPlan,
  planId,
  isPlanUpdating,
}) => {
  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "60%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <GrowthIcon /> {/* Assuming GrowthIcon is imported */}
          </Box>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "26px",
              color: "#28287B",
              ml: 1.5,
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 700,
            lineHeight: "20px",
            color: "#0071F6",
            border: "1px solid #E4E4E5",
            borderRadius: "8px",
            px: 2,
            py: 1.5,
            my: 1.5,
          }}
        >
          ${price}/month
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          width: "40%",
        }}
      >
        <Button
          variant={
            billingMonthly
              ? isCurrentPlan
                ? "outlined"
                : "contained"
              : isCurrentPlan
              ? "outlined"
              : "contained"
          }
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: "18px",
            borderRadius: "8px",
            px: 2,
            py: 1.5,
          }}
          disabled={isPlanUpdating}
          onClick={() => handleUpdatePlanClick(planId)}
        >
          {isCurrentPlan ? "Current Plan" : "Update Plan"}
        </Button>
      </Box>
    </Box>
  );
};

export default PlanCard;
