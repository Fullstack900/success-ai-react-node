import {
  Box,
  Typography,
  Unstable_Grid2 as Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  LinearProgress,
  CircularProgress,
  IconButton,
  TableContainer,
  TableBody,
  TableCell,
  Table,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DonutSmallRounded, DownloadOutlined, Close } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  useGetCurrentPlanQuery,
  useUpdatePlanMutation,
  useBillingUsageQuery,
  useGetPaymentMethodQuery,
  useUpdatePaymentMutation,
  useInvoicesQuery,
} from "src/services/billing-service.js";
import { config } from "src/config.js";
import { toast } from "react-hot-toast";
import { GrowthIcon } from "src/assets/general/GrowthIcon";
import { Total } from "src/assets/campaignDetailsLeads/Total";
import { CheckCircleIcon } from "src/assets/general/CheckCircleIcon";
import { useGetLeadsUsageQuery, useGetSavedFilesQuery } from "src/services/leads-service";
import { downloadCsv } from "src/utils/util";
import moment from "moment";
import { useGetMeQuery } from "src/services/user-service";

import { useGetAccountAnalyticsMutation } from "src/services/campaign-service";
import PlanCard from "./PlanCard";
const UpdatePlanDialog = (props) => {
  const { open, handleClose } = props;
  return (
    <>
      {" "}
      <Dialog open={open} onClose={handleClose} sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}>
        <DialogTitle>
          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 700,
              lineHeight: "30px",
              color: "#28287B",
            }}
          >
            Great decision!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "28px",
              color: "#8181B0",
            }}
          >
            {" "}
            Are you ready to scale your campaigns and purchase this plan?
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 3 }}>
            {" "}
            <Button onClick={handleClose} variant="contained" fullWidth>
              Yes Purchase!!
            </Button>
            <Button onClick={handleClose} variant="outlined" fullWidth sx={{ ml: 2 }}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Features = ({ type, plan }) => {
  const generateWarmupFeature = (plan) => {
    let activeLeads, emails, AIcredits, support;
    switch (plan) {
      case "growth":
        activeLeads = "1,200";
        emails = "6,000";
        AIcredits = "2,500";
        support = "Live Chat";
        break;
      case "skyrocket":
        activeLeads = "50,000";
        emails = "200,000";
        AIcredits = "7,500";
        support = "Premium";
        break;
      case "enterprise":
        activeLeads = "500,000";
        emails = "1,000,000";
        AIcredits = "30,000";
        support = "Premium";
        break;
      default:
        activeLeads = "50";
        emails = "100";
        AIcredits = "50";
        support = "Live Chat";
        break;
    }
    return [
      { icon: <CheckCircleIcon />, text: "Unlimited Email Accounts" },
      { icon: <CheckCircleIcon />, text: "Unlimited Email Warmup" },
      { icon: <CheckCircleIcon />, text: `${activeLeads} Active Leads` },
      { icon: <CheckCircleIcon />, text: `${emails} Emails Monthly` },
      { icon: <CheckCircleIcon />, text: `${AIcredits} AI Writer credits` },
      { icon: <CheckCircleIcon />, text: `${support} Support` },
    ];
  };
  const generateLeadsFeature = (plan) => {
    let qualityLeads, support;
    switch (plan) {
      case "skyrocket":
        qualityLeads = "1,200";
        support = "Live Chat";
        break;
      case "growth":
        qualityLeads = "3,200";
        support = "Premium";
        break;
      case "10xscale":
        qualityLeads = "10,000";
        support = "Premium";
        break;
      default:
        qualityLeads = "30";
        support = "Live Chat";
        break;
    }
    return [
      { icon: <CheckCircleIcon />, text: `Each Month: ${qualityLeads} Quality Leads` },
      { icon: <CheckCircleIcon />, text: "Pay For Verified Leads Only" },
      { icon: <CheckCircleIcon />, text: "Precise & Advanced Filter Tools" },
      { icon: <CheckCircleIcon />, text: "Data Enrichment" },

      { icon: <CheckCircleIcon />, text: `${support} Support` },
    ];
  };
  const featureList = type === "warmup" ? generateWarmupFeature(plan) : generateLeadsFeature(plan);
  return (
    <Box>
      <Typography sx={{ fontWeight: "700", fontSize: "14px", color: "#28287B" }}>
        Includes
      </Typography>
      <Box>
        {featureList.map((feature, index) => (
          <Typography
            key={index}
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "5px",
              py: 1,
            }}
          >
            {feature.icon}
            <Typography sx={{ color: "#28287B", fontSize: "13px", fontWeight: "500" }}>
              {" "}
              {feature.text}
            </Typography>
          </Typography>
        ))}
        {/* <Typography
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "5px",
            py: 1,
          }}
        >
          <CheckCircleIcon />{" "}
          <Typography sx={{ color: "#28287B", fontSize: "13px", fontWeight: "500" }}>
            {" "}
            25,000 Uploaded Contacts
          </Typography>
        </Typography>
        <Typography
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "5px",
            py: 1,
          }}
        >
          <CheckCircleIcon />{" "}
          <Typography sx={{ color: "#28287B", fontSize: "13px", fontWeight: "500" }}>
            {" "}
            Global block list
          </Typography>
        </Typography>
        <Typography
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "5px",
            py: 1,
          }}
        >
          <CheckCircleIcon />{" "}
          <Typography sx={{ color: "#28287B", fontSize: "13px", fontWeight: "500" }}>
            {" "}
            Team accounts
          </Typography>
        </Typography>
        <Typography
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "5px",
            py: 1,
          }}
        >
          <CheckCircleIcon />{" "}
          <Typography sx={{ color: "#28287B", fontSize: "13px", fontWeight: "500" }}>
            {" "}
            125,000 Emails
          </Typography>
        </Typography> */}
      </Box>
    </Box>
  );
};

const BillingAndUsage = (props) => {
  const { mode } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [leadCreditDialogOpen, setLeadCreditDialogOpen] = useState(false);
  const [leadCreditTab, setLeadCreditTab] = useState("");
  const [billingMonthly, setBillingMonthly] = useState(true);
  // const [billingYearly, setBillingYearly] = useState(true);
  const [isPlanUpdating, setIsPlanUpdating] = useState(false);
  const [UpdatePayment] = useUpdatePaymentMutation();
  const { data: currentPlan, refetch: refetchCurrentPlan } = useGetCurrentPlanQuery();
  const { data: user, refetch: refetchUser } = useGetMeQuery();

  const { data, isLoading: isCardLoading } = useGetPaymentMethodQuery();
  let payment = data?.length > 0 ? data[0] : [];

  const [updatePlan] = useUpdatePlanMutation();

  const { data: usage, isLoading: isLoadingUsage, refetch: refetchUsage } = useBillingUsageQuery();

  const activeLeadsExceeded =  Math.abs(usage?.usedActiveLeads) >= usage?.activeLeads;
  const emailCreditExceeded = Math.abs(usage?.usedEmailCredit) >= usage?.montlyEmailCredit;
  const aiCreditExceeded = Math.abs(usage?.usedAiCredit) >= usage?.aiWriterLimit;
  const {
    data: invoices,
    isLoading: isLoadingInvoice,
    refetch: refetchInvoice,
  } = useInvoicesQuery();
  const { data: leadUsage, refetch: refetchLeadUsage } = useGetLeadsUsageQuery();
  const { data: downloadFiles, refetch: refetchSavedFiles } = useGetSavedFilesQuery();
  useEffect(() => {
    refetchUsage();
    refetchInvoice();
    refetchLeadUsage();
    refetchSavedFiles();
  }, [refetchUsage, refetchInvoice, refetchSavedFiles, refetchLeadUsage]);

  const handleUpdatePlanClick = async (priceId) => {
    if (isCurrentSendingWarmupPlan(priceId) || isCurrentLeadsPlan(priceId)) return;

    const toastId = toast.loading("Updating...", { duration: Infinity });
    setIsPlanUpdating(true);
    const session = await updatePlan({ priceId }).unwrap();
    if (session.url) {
      window.location.href = session.url;
    } else if (session.errorMsg) {
      toast.error(session.errorMsg, { id: toastId, duration: 5000 });
    } else {
      toast.success("Plan Updated", { id: toastId, duration: 2000 });
      await refetchCurrentPlan();
      refetchUsage();
    }
    setIsPlanUpdating(false);
  };

  const handelDowloadCsv = (item) => {
    downloadCsv(item.name, item.data);
  };

  const isCurrentSendingWarmupPlan = (priceId) => {
    return currentPlan?.subscription?.sendingWarmup?.planId === priceId;
  };

  const handelBillingCheckout = async () => {
    const { data: url } = await UpdatePayment();
    window.location.href = url;
  };

  const isCurrentLeadsPlan = (priceId) => {
    return currentPlan?.subscription?.leads?.planId === priceId;
  };

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [handleUpdate, setHandleUpdate] = useState();
  const scrollBarStyle = {
    // width
    "&::-webkit-scrollbar": {
      width: "14px",
    },

    // Track
    "&::-webkit-scrollbar-track": {
      borderRadius: "60px",
    },

    // /* Handle */
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#E4E4E5",
      borderRadius: "10px",
      border: "4px solid rgba(0, 0, 0, 0)",
      backgroundClip: "padding-box",
    },

    // /* Handle on hover */
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "#d5d5d5",
    },
  };

  const [getAccountAnalytics] = useGetAccountAnalyticsMutation();
  const [totalEmailSent, setTotalEmailSent] = useState(0);
  const [freeDate, setFreeDate] = useState(null);
  const [paidDate, setPaidDate] = useState(null);
  const fetchGraphData = useCallback(async () => {
    if (currentPlan?.subscription?.sendingWarmup?.expiresAt) {
      const expiresAtValueOne = new Date(currentPlan?.subscription?.sendingWarmup?.expiresAt); // Replace with your actual date
      const expiresAtDateNo = new Date(expiresAtValueOne);
      expiresAtDateNo.setMonth(expiresAtDateNo.getMonth() - 1);
      const expiresAtDate = new Date(expiresAtDateNo.toISOString());
      setPaidDate(expiresAtDate);
      const startDate = expiresAtDate.toISOString();
      const startMonth = expiresAtDate.getMonth() + 1;
      const startDateNum = expiresAtDate.getDate();
      const startYear = expiresAtDate.getFullYear();

      const expiresAtValue = new Date(currentPlan?.subscription?.sendingWarmup?.expiresAt); // Replace with your actual date
      const endDate = expiresAtValue;
      const endMonth = endDate.getMonth() + 1;
      const endDateNum = endDate.getDate();
      const endYear = endDate.getFullYear();

      const startDateString = `${startYear}-${startMonth < 10 ? "0" + startMonth : startMonth}-${
        startDateNum < 10 ? "0" + startDateNum : startDateNum
      }`;
      const endDateString = `${endYear}-${endMonth < 10 ? "0" + endMonth : endMonth}-${
        endDateNum < 10 ? "0" + endDateNum : endDateNum
      }`;

      const start = new Date(startDateString).getTime();
      const end = new Date(endDateString).getTime();

      try {
        const { graph } = await getAccountAnalytics({
          start,
          end,
        }).unwrap();
        let totalSent = 0;

        if (Array.isArray(graph)) {
          for (const data of graph) {
            totalSent += data.sent || 0;
          }
        }

        setTotalEmailSent(totalSent);
      } catch (error) {
        console.error("Error fetching graph data", error);
      }
    } else {
      const expiresAtValueFree = new Date(currentPlan?.freeTrialExpiresAt); // Replace with your actual date
      const expiresAtDateNoFree = new Date(expiresAtValueFree);
      expiresAtDateNoFree.setMonth(expiresAtDateNoFree.getMonth() - 1);
      const expiresAtDateFree = new Date(expiresAtDateNoFree.toISOString());
      setFreeDate(expiresAtDateFree);
      const startDate = expiresAtDateFree.toISOString();
      const startMonth = expiresAtDateFree.getMonth() + 1;
      const startDateNum = expiresAtDateFree.getDate();
      const startYear = expiresAtDateFree.getFullYear();

      const expiresAtValue = new Date(currentPlan?.freeTrialExpiresAt); // Replace with your actual date
      const endDate = expiresAtValue;
      const endMonth = endDate.getMonth() + 1;
      const endDateNum = endDate.getDate();
      const endYear = endDate.getFullYear();

      const startDateString = `${startYear}-${startMonth < 10 ? "0" + startMonth : startMonth}-${
        startDateNum < 10 ? "0" + startDateNum : startDateNum
      }`;
      const endDateString = `${endYear}-${endMonth < 10 ? "0" + endMonth : endMonth}-${
        endDateNum < 10 ? "0" + endDateNum : endDateNum
      }`;

      const start = new Date(startDateString).getTime();
      const end = new Date(endDateString).getTime();

      try {
        const { graph } = await getAccountAnalytics({
          start,
          end,
        }).unwrap();
        let totalSent = 0;

        if (Array.isArray(graph)) {
          for (const data of graph) {
            totalSent += data.sent || 0;
          }
        }
        setTotalEmailSent(totalSent);
      } catch (error) {
        console.error("Error fetching graph data", error);
      }
    }
  }, [getAccountAnalytics, currentPlan]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  const credits = usage?.leadsCredits?.toLocaleString() || 0;
  const usedAiCredit = usage?.usedAiCredit?.toLocaleString() || 0;
  const aiWriterLimit = usage?.aiWriterLimit?.toLocaleString() || 0;
  const montlyEmailCredit = usage?.montlyEmailCredit?.toLocaleString() || 0;
  const usedActiveLeads = usage?.usedActiveLeads?.toLocaleString() || 0;
  const activeLeads = usage?.activeLeads?.toLocaleString() || 0;
  const emailSentCount = usage?.usedEmailCredit.toLocaleString() || 0;
  return (
    <>
      {user?.assignedPlan && user?.assignedPlan.length > 0 && !user?.isAppSumoRefund && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            boxShadow: "0px 12px 15px 0px #4B71970D",
            borderRadius: "12px",
            backgroundColor: "white",
            width: "100%",
            p: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "26px",
              color: "#28287B",
              ml: 1.5,
            }}
          >
            You are Currently On App Sumo {user?.assignedPlan} plan.
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            boxShadow: "0px 12px 15px 0px #4B71970D",
            borderRadius: "12px",
            backgroundColor: "white",
            width: "100%",
            p: { xs: 1, sm: 2, md: 3 },
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
            <Grid
              container
              sx={{
                backgroundColor: "#F2F4F6",
                width: "100%",
                borderRadius: "8px",
                p: 0.4,
                border: "1px solid #F2F4F7",
              }}
            >
              <Grid item xs={6}>
                <Button
                  // variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor:
                      mode === "trial"
                        ? billingMonthly
                          ? "#0071F6"
                          : "transparent"
                        : billingMonthly
                        ? "white"
                        : "transparent",
                    color:
                      mode === "trial"
                        ? billingMonthly
                          ? "#fff"
                          : "#28287B"
                        : billingMonthly
                        ? "#0071F6"
                        : "#8181B0",
                    "&:hover": {
                      backgroundColor:
                        mode === "trial"
                          ? billingMonthly
                            ? "#0071F6"
                            : "transparent"
                          : billingMonthly
                          ? "white"
                          : "transparent",
                    },
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    letterSpacing: "0em",
                    boxShadow: billingMonthly && "0px 1px 2px 0px #1018280F",
                    borderRadius: "5px",
                    // mr: 0.5,
                    py: 1,
                    height: "100%",
                  }}
                  onClick={() => {
                    setBillingMonthly(true);
                  }}
                >
                  Monthly billing
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  // variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor:
                      mode === "trial"
                        ? !billingMonthly
                          ? "#0071F6"
                          : "transparent"
                        : !billingMonthly
                        ? "white"
                        : "transparent",
                    color:
                      mode === "trial"
                        ? !billingMonthly
                          ? "#fff"
                          : "#28287B"
                        : !billingMonthly
                        ? "#0071F6"
                        : "#8181B0",
                    "&:hover": {
                      backgroundColor:
                        mode === "trial"
                          ? !billingMonthly
                            ? "#0071F6"
                            : "transparent"
                          : !billingMonthly
                          ? "white"
                          : "transparent",
                    },
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    letterSpacing: "0em",
                    boxShadow: !billingMonthly && "0px 1px 2px 0px #1018280F",
                    borderRadius: "5px",
                    // mr: 0.5,
                    py: 1,
                  }}
                  onClick={() => {
                    setBillingMonthly(false);
                  }}
                >
                  Annual billing (Save 30%)
                </Button>
              </Grid>
            </Grid>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px",
                border: "1px solid #E4E4E5",
                p: 3,
                mt: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    color: "#28287B",
                  }}
                >
                  Sending & Warmup
                </Typography>
              </Box>
              <Grid container columnSpacing={3} rowSpacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "8px",
                      border: "1px solid #3F4FF8",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <PlanCard
                      title="Growth"
                      price={billingMonthly ? "33" : "23"}
                      billingMonthly={billingMonthly}
                      handleUpdatePlanClick={handleUpdatePlanClick}
                      isCurrentPlan={isCurrentSendingWarmupPlan(
                        billingMonthly
                          ? config.SENDING_WARMUP_MONTHLY_GROWTH_PRICE_ID
                          : config.SENDING_WARMUP_YEARLY_GROWTH_PRICE_ID
                      )}
                      planId={
                        billingMonthly
                          ? config.SENDING_WARMUP_MONTHLY_GROWTH_PRICE_ID
                          : config.SENDING_WARMUP_YEARLY_GROWTH_PRICE_ID
                      }
                      isPlanUpdating={isPlanUpdating}
                    />
                    <Features type="warmup" plan="growth" />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "8px",
                      border: "1px solid #3F4FF8",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <PlanCard
                      title="Skyrocket"
                      price={billingMonthly ? "77" : "53"}
                      billingMonthly={billingMonthly}
                      handleUpdatePlanClick={handleUpdatePlanClick}
                      isCurrentPlan={isCurrentSendingWarmupPlan(
                        billingMonthly
                          ? config.SENDING_WARMUP_MONTHLY_SKYROCKET_PRICE_ID
                          : config.SENDING_WARMUP_YEARLY_SKYROCKET_PRICE_ID
                      )}
                      planId={
                        billingMonthly
                          ? config.SENDING_WARMUP_MONTHLY_SKYROCKET_PRICE_ID
                          : config.SENDING_WARMUP_YEARLY_SKYROCKET_PRICE_ID
                      }
                      isPlanUpdating={isPlanUpdating}
                    />
                    <Features type="warmup" plan="skyrocket" />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "8px",
                      border: "1px solid #3F4FF8",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <PlanCard
                      title="10X Scale"
                      price={billingMonthly ? "297" : "207"}
                      billingMonthly={billingMonthly}
                      handleUpdatePlanClick={handleUpdatePlanClick}
                      isCurrentPlan={isCurrentSendingWarmupPlan(
                        billingMonthly
                          ? config.SENDING_WARMUP_MONTHLY_SCALE_PRICE_ID
                          : config.SENDING_WARMUP_YEARLY_SCALE_PRICE_ID
                      )}
                      planId={
                        billingMonthly
                          ? config.SENDING_WARMUP_MONTHLY_SCALE_PRICE_ID
                          : config.SENDING_WARMUP_YEARLY_SCALE_PRICE_ID
                      }
                      isPlanUpdating={isPlanUpdating}
                    />
                    <Features type="warmup" plan="enterprise" />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px",
                border: "1px solid #E4E4E5",
                mt: 3,
                p: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    color: "#28287B",
                  }}
                >
                  Lead Finder
                </Typography>
              </Box>
              <Grid container columnSpacing={3} rowSpacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "8px",
                      border: "1px solid #3F4FF8",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <PlanCard
                      title="Growth Lead"
                      price={billingMonthly ? "44" : "31"}
                      billingMonthly={billingMonthly}
                      handleUpdatePlanClick={handleUpdatePlanClick}
                      isCurrentPlan={isCurrentLeadsPlan(
                        billingMonthly
                          ? config.LEADS_MONTHLY_SKYROCKET_PRICE_ID
                          : config.LEADS_YEARLY_SKYROCKET_PRICE_ID
                      )}
                      planId={
                        billingMonthly
                          ? config.LEADS_MONTHLY_SKYROCKET_PRICE_ID
                          : config.LEADS_YEARLY_SKYROCKET_PRICE_ID
                      }
                      isPlanUpdating={isPlanUpdating}
                    />
                    <Features type="leads" plan="skyrocket" />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "8px",
                      border: "1px solid #3F4FF8",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <PlanCard
                      title="Skyrocket Leads"
                      price={billingMonthly ? "111" : "77"}
                      billingMonthly={billingMonthly}
                      handleUpdatePlanClick={handleUpdatePlanClick}
                      isCurrentPlan={isCurrentLeadsPlan(
                        billingMonthly
                          ? config.LEADS_MONTHLY_GROWTH_PRICE_ID
                          : config.LEADS_YEARLY_GROWTH_PRICE_ID
                      )}
                      planId={
                        billingMonthly
                          ? config.LEADS_MONTHLY_GROWTH_PRICE_ID
                          : config.LEADS_YEARLY_GROWTH_PRICE_ID
                      }
                      isPlanUpdating={isPlanUpdating}
                    />
                    <Features type="leads" plan="growth" />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "8px",
                      border: "1px solid #3F4FF8",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <PlanCard
                      title="10X Scale Leads"
                      price={billingMonthly ? "194" : "136"}
                      billingMonthly={billingMonthly}
                      handleUpdatePlanClick={handleUpdatePlanClick}
                      isCurrentPlan={isCurrentLeadsPlan(
                        billingMonthly
                          ? config.LEADS_MONTHLY_SCALE_PRICE_ID
                          : config.LEADS_YEARLY_SCALE_PRICE_ID
                      )}
                      planId={
                        billingMonthly
                          ? config.LEADS_MONTHLY_SCALE_PRICE_ID
                          : config.LEADS_YEARLY_SCALE_PRICE_ID
                      }
                      isPlanUpdating={isPlanUpdating}
                    />
                    <Features type="leads" plan="10xscale" />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
        {mode !== "trial" && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                flexDirection: "column",
                boxShadow: "0px 12px 15px 0px #4B71970D",
                borderRadius: "12px",
                backgroundColor: "white",
                width: "100%",
                p: 3,
                mt: 3,
                border: activeLeadsExceeded ? "1px solid red" : "none",
              }}
            >
              {" "}
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "24px",
                  color: "#28287B",
                }}
              >
                Active Contacts
              </Typography>
              {isLoadingUsage ? (
                <CircularProgress size={25} thickness={5} />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography
                    sx={{
                      mt: 2,
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      color: "#28287B",
                    }}
                  >
                    {activeLeadsExceeded ? activeLeads : usedActiveLeads}/{activeLeads}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 2,
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      color: "red",
                      display: activeLeadsExceeded ? "block" : "none",
                    }}
                  >
                    (You have exceeded the limit for uploading contacts)
                  </Typography>
                </Box>
              )}
              <Box sx={{ width: "100%", mt: 2 }}>
                {" "}
                <LinearProgress
                  variant="determinate"
                  value={((usage?.usedActiveLeads || 0) / usage?.activeLeads) * 100}
                />
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                flexDirection: "column",
                boxShadow: "0px 12px 15px 0px #4B71970D",
                borderRadius: "12px",
                backgroundColor: "white",
                width: "100%",
                p: 3,
                mt: 3,
                border: emailCreditExceeded ? "1px solid red" : "none",
              }}
            >
              {" "}
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "24px",
                  color: "#28287B",
                }}
              >
                Sent emails
              </Typography>
              {isLoadingUsage ? (
                <CircularProgress size={25} thickness={5} />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography
                    sx={{
                      mt: 2,
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      color: "#28287B",
                    }}
                  >
                    {/* {usage?.usedEmailCredit.toLocaleString()} */}
                    {emailCreditExceeded ? montlyEmailCredit : emailSentCount}/{montlyEmailCredit}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 2,
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      color: "red",
                      display: emailCreditExceeded ? "block" : "none",
                    }}
                  >
                    (You have used up all of your email credits)
                  </Typography>
                </Box>
              )}
              <Box sx={{ width: "100%", mt: 2 }}>
                {" "}
                <LinearProgress
                  variant="determinate"
                  value={(usage?.usedEmailCredit / usage?.montlyEmailCredit) * 100}
                />
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                flexDirection: "column",
                boxShadow: "0px 12px 15px 0px #4B71970D",
                borderRadius: "12px",
                backgroundColor: "white",
                width: "100%",
                p: 3,
                mt: 3,
                border: aiCreditExceeded ? "1px solid red" : "none",
              }}
            >
              {" "}
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "24px",
                  color: "#28287B",
                }}
              >
                Used AI writer credits
              </Typography>
              {isLoadingUsage ? (
                <CircularProgress size={25} thickness={5} />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography
                    sx={{
                      mt: 2,
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      color: "#28287B",
                    }}
                  >
                    {aiCreditExceeded ? aiWriterLimit : usedAiCredit}/{aiWriterLimit}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 2,
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      color: "red",
                      display: aiCreditExceeded ? "block" : "none",
                    }}
                  >
                    (You have used up all of your AI writer credits)
                  </Typography>
                </Box>
              )}
              <Box sx={{ width: "100%", mt: 2 }}>
                {" "}
                <LinearProgress
                  variant="determinate"
                  value={(usage?.usedAiCredit / usage?.aiWriterLimit) * 100}
                />
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                flexDirection: "column",
                boxShadow: "0px 12px 15px 0px #4B71970D",
                borderRadius: "12px",
                backgroundColor: "white",
                width: "100%",
                p: 3,
                mt: 3,
              }}
            >
              {" "}
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "24px",
                  color: "#28287B",
                  mb: 3,
                }}
              >
                Lead Finder Usage Overview
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  rowGap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    width: { xs: "100%", sm: "260px" },
                    p: 1.5,
                    border: "1px solid #E4E4E5",
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {" "}
                    <Total />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      width: { xs: "calc(100% - 44px)", sm: "fit-content" },
                      justifyContent: { xs: "space-between", sm: "center" },
                      alignItems: { xs: "center", sm: "flex-start" },
                      flexDirection: { xs: "row-reverse", sm: "column" },
                      ml: 1.5,
                    }}
                  >
                    {isLoadingUsage ? (
                      <CircularProgress size={25} thickness={5} />
                    ) : (
                      <Typography
                        sx={{
                          fontSize: "20px",
                          color: "#28287B",
                          fontWeight: 700,
                          lineHeight: "25.2px",
                        }}
                      >
                        {usage?.leadsCredits > 0 ? credits : 0}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        fontWeight: 400,
                        fontSize: "13px",
                        lineHeight: "16.38px",
                        color: "#8181B0",
                        mt: 0.5,
                      }}
                    >
                      Total leads balance left
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "row", sm: "column" },
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    width: { xs: "100%", sm: "fit-content" },
                  }}
                >
                  <Button
                    onClick={() => {
                      setLeadCreditDialogOpen(true);
                      setLeadCreditTab("usage");
                    }}
                  >
                    {isMobile ? "Leads Usage" : "View Leads Usage"}
                  </Button>
                  <Button
                    onClick={() => {
                      setLeadCreditDialogOpen(true);
                      setLeadCreditTab("download summary");
                    }}
                  >
                    {isMobile ? "Downloads Summary" : "Lead Finder Downloads Summary"}
                  </Button>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                flexDirection: "column",
                boxShadow: "0px 12px 15px 0px #4B71970D",
                borderRadius: "12px",
                backgroundColor: "white",
                width: "100%",
                p: 3,
                mt: 3,
              }}
            >
              {" "}
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "24px",
                  color: "#28287B",
                  mb: 3,
                }}
              >
                Payment method
              </Typography>
              {isCardLoading ? (
                <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 10 }}
                >
                  <CircularProgress size={25} thickness={5} />
                  <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#4e88e6", ml: 2 }}>
                    Loading...
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    width: { xs: "100%", sm: "40%" },
                    p: 2,
                    border: "1px solid #E4E4E5",
                    borderRadius: "8px",
                    flexDirection: "column",
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "16.38px",
                      color: "#8181B0",
                      mb: 0.5,
                    }}
                  >
                    Card information
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 700,
                      lineHeight: "20px",
                      color: "#28287B",
                      mb: 3,
                    }}
                  >
                    {payment?.brand?.toUpperCase()} Ending in {payment?.last4}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "16.38px",
                      color: "#8181B0",
                      mb: 0.5,
                    }}
                  >
                    Name on card
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 700,
                      lineHeight: "20px",
                      color: "#28287B",
                    }}
                  >
                    {payment?.name}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  width: { xs: "100%", sm: "40%" },
                }}
              >
                {" "}
                {!isCardLoading ? (
                  <Button onClick={handelBillingCheckout} variant="outlined">
                    Update credit card
                  </Button>
                ) : (
                  " "
                )}
              </Box>
            </Box>
            {
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  flexDirection: "column",
                  boxShadow: "0px 12px 15px 0px #4B71970D",
                  borderRadius: "12px",
                  backgroundColor: "white",
                  width: "100%",
                  p: 3,
                  mt: 3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: "24px",
                    color: "#28287B",
                    mb: 3,
                  }}
                >
                  Invoice
                </Typography>
                <Grid
                  container
                  sx={{ width: "100%", maxHeight: "500px", overflowY: "auto", ...scrollBarStyle }}
                >
                  {invoices?.map((invoice) => (
                    <Grid
                      item
                      xs={12}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: "50%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "16px",
                            fontWeight: 500,
                            lineHeight: "20px",
                            color: "#28287B",
                          }}
                        >
                          {/* {invoice.createdAt} */}
                          {moment(invoice.createdAt).format("MM/DD/YYYY")}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: "50%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Button>
                          <Link to={invoice.pdfUrl} target="_blank">
                            Download
                          </Link>
                        </Button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    borderTop: `1px solid ${theme.palette.grey[300]}`,
                    pt: 2,
                    mt: 2,
                    gap: 2,
                  }}
                >
                  <Typography
                    sx={{ fontSize: "16px", fontWeight: 700, lineHeight: "20px", color: "#28287B" }}
                  >
                    Total entries :
                  </Typography>{" "}
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      color: theme.palette.primary.main,
                    }}
                  >
                    {invoices?.length || 0}
                  </Typography>
                </Box>
              </Box>
            }
          </>
        )}
      </Box>
      <UpdatePlanDialog open={open} handleClose={handleClose} />
      <Dialog
        open={leadCreditDialogOpen}
        onClose={() => setLeadCreditDialogOpen(false)}
        sx={{
          backgroundColor: "rgba(4, 4, 30, 0.5)",
          "& .MuiDialog-paper": { height: { xs: "100%", sm: "90vh" } },
        }}
        fullScreen={isMobile}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            width: { xs: "100%", sm: "500px" },
            py: 3,
            px: 3,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                lineHeight: "28px",
                letterSpacing: "0em",
                color: "#28287B",
              }}
            >
              {leadCreditTab === "usage" ? "Lead Usage" : "Lead finder download summary"}
            </Typography>
            <IconButton onClick={() => setLeadCreditDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              mt: 2,
              height: { xs: "85vh", sm: "75vh" },
              overflow: "hidden",
              border: `1px solid ${theme.palette.grey[300]}`,
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",

                width: "100%",
                height: "100%",
              }}
            >
              <TableContainer component={Paper} sx={{ height: "100%", ...scrollBarStyle }}>
                <Table aria-label="simple table" sx={{ borderCollapse: "revert" }}>
                  {leadCreditTab === "usage" ? (
                    <TableBody>
                      {leadUsage?.map((item) => (
                        <TableRow
                          key={item?.data?._id}
                          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                lineHeight: "16px",
                                letterSpacing: "0em",
                                color: "#8181B0",
                              }}
                            >
                              {item?.data?.amount !== 0 ? item?.data?.amount : -1}
                            </Typography>
                          </TableCell>
                          <TableCell align="left">
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                lineHeight: "16px",
                                letterSpacing: "0em",
                                color: "#28287B",
                              }}
                            >
                              {item?.data?.type}
                            </Typography>
                          </TableCell>
                          <TableCell align="left">
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                lineHeight: "16px",
                                letterSpacing: "0em",
                                color: "#28287B",
                              }}
                            >
                              {/* {new Date(item?.data?.createdAt).toDateString()} */}
                              {moment(item?.data?.createdAt).format("MM/DD/YYYY")}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  ) : (
                    <TableBody>
                      {downloadFiles?.map((item) => (
                        <TableRow
                          key={item._id}
                          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                lineHeight: "16px",
                                letterSpacing: "0em",
                                color: "#28287B",
                              }}
                            >
                              {item.name}
                            </Typography>
                            {/* <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                lineHeight: "16px",
                                letterSpacing: "0em",
                                color: "#8181B0",
                              }}
                            >
                              1 lead
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                lineHeight: "16px",
                                letterSpacing: "0em",
                                color: "#8181B0",
                              }}
                            >
                              Push to campaign
                            </Typography> */}
                          </TableCell>
                          <TableCell align="left">
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                lineHeight: "16px",
                                letterSpacing: "0em",
                                color: "#28287B",
                              }}
                            >
                              {/* {new Date(item.createdAt).toDateString()} */}
                              {moment(item.createdAt).format("MM/DD/YYYY")}
                            </Typography>
                          </TableCell>
                          <TableCell align="left">
                            <IconButton
                              sx={{
                                color: "#28287B",
                              }}
                              onClick={() => handelDowloadCsv(item)}
                            >
                              <DownloadOutlined />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default BillingAndUsage;
