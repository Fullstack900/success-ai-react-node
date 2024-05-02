import {
  EmailTwoTone,
  Fireplace,
  FolderSpecial,
  InsertEmoticon,
  MoveToInbox,
} from "@mui/icons-material";
import { Box, Divider, FormControlLabel, Grid, Switch, Typography, Tooltip } from "@mui/material";
import { EmailDrawerDisabledHero } from "src/assets/EmailDrawerDisabledHero";
import ReactApexChart from "react-apexcharts";
import { useEffect, useState } from "react";
import {
  usePauseWarmupMutation,
  useEnableWarmupMutation,
  accountUpdated,
} from "src/services/account-service.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { getWeekdays, getDayName, last7dates } from "src/utils/util.js";
import { styled } from "@mui/material/styles";
import { EDSuperbHero } from "src/assets/emailAccounts/emailDrawer/EDSuperbHero";
import { EDWarmupEmailsSent } from "src/assets/emailAccounts/emailDrawer/EDWarmupEmailsSent";
import { EDEmailsReceived } from "src/assets/emailAccounts/emailDrawer/EDEmailsReceived";
import { EDLandedInbox } from "src/assets/emailAccounts/emailDrawer/EDLandedInbox";
import { EDSavedSpam } from "src/assets/emailAccounts/emailDrawer/EDSavedSpam";
import { EDStar } from "src/assets/emailAccounts/emailDrawer/EDStar";
import { useGetMeQuery } from "src/services/user-service";
import { useUpdateIntercomMutation } from "src/services/intercom-service";

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

const WarmupTab = ({ account }) => {
  const dispatch = useDispatch();
  const last7Days = account.warmupStats?.last7Days ? account.warmupStats?.last7Days : {};
  const spamSeries = [];
  const InboxSeries = [];
  for (const iterator of last7dates().reverse()) {
    const stats = last7Days[iterator];
    const spamCount = stats?.spam_count ? stats.spam_count : 0;
    const inboxCount = stats?.inbox_count ? stats.inbox_count : 0;
    if (stats) {
      spamSeries.push({ x: getDayName(iterator), y: spamCount });
      InboxSeries.push({ x: getDayName(iterator), y: inboxCount });
    } else {
      spamSeries.push({ x: getDayName(iterator), y: spamCount });
      InboxSeries.push({ x: getDayName(iterator), y: inboxCount });
    }
  }
  const series = [
    {
      name: "Emails Landed in Spam",
      group: "spam",
      data: spamSeries,
    },
    {
      name: "Landed in inbox",
      group: "sent",
      data: InboxSeries,
    },
  ];

  const [options] = useState({
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      // toolbar: {
      //   show: true,
      // },
      zoom: {
        enabled: true,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 2,
        // dataLabels: {
        //   total: {
        //     enabled: true,
        //     style: {
        //       fontSize: "13px",
        //       fontWeight: 900,
        //     },
        //   },
        // },
      },
    },
    xaxis: {
      type: "day",
      categories: getWeekdays(),
    },
    legend: {
      position: "right",
      offsetY: 40,
    },
    fill: {
      opacity: 1,
    },
    colors: ["#EB755A", "#82ED92"],
  });

  const [warmupStatus, setWarmupStatus] = useState(account.warmup.status);
  const [enableWarmup] = useEnableWarmupMutation();
  const [pauseWarmup] = usePauseWarmupMutation();
  const { data: user, refetch: refetchUser } = useGetMeQuery();
  const [updateIntercom] = useUpdateIntercomMutation();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsTooltipOpen(true);
  };

  const handleMouseLeave = () => {
    setIsTooltipOpen(false);
  };

  useEffect(() => {
    setWarmupStatus(account.warmup.status);
  }, [account]);

  const handleEnableWarmup = async () => {
    if (account.status === "paused") {
      toast.error("Please resume your account first.");
      return;
    }
    else{
      const toastId = toast.loading("Loading...", { duration: Infinity });
      const { message, account: updatedAccount } = await enableWarmup(account._id).unwrap();
      window.Intercom('trackEvent', "Email account warmup initiated");
      dispatch(accountUpdated(updatedAccount));
      await updateIntercom({ user: user._id, attribute: "warmedup_email_accounts" })
      setWarmupStatus("enabled");
      toast.success(message, { id: toastId, duration: 2000 });
    }
  };

  const handlePauseWarmup = async () => {
    const toastId = toast.loading("Loading...", { duration: Infinity });
    const { message, account: updatedAccount } = await pauseWarmup(account._id).unwrap();
    dispatch(accountUpdated(updatedAccount));
    await updateIntercom({ user: user._id, attribute: "warmedup_email_accounts" })
    setWarmupStatus("paused");
    toast.success(message, { id: toastId, duration: 2000 });
  };
  return (
    <>
      {warmupStatus !== "disabled" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {" "}
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 500,
              lineHeight: "16px",
              color: "#28287B",
            }}
          >
            Enable warmup for this account to check its performance 
          </Typography>
          <FormControlLabel
           onMouseEnter={handleMouseEnter}
           onMouseLeave={handleMouseLeave}
          sx={{ m: 0 }}
          control={
            <Tooltip
              title = {account.warmup.warmupDisable ? "Your Warmup is currently inactive." : "Resume your account"}
              placement="top" onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              sx={{ textAlign: "center" }}
              arrow
              open={isTooltipOpen && (account.status === "paused" || account.warmup.warmupDisable)}
            >
            <span>
              <IOSSwitch
                sx={{}}
                // name={name}
                checked={warmupStatus === "enabled" && true}
                disabled={account.warmup.warmupDisable === true || warmupStatus === "disabled"}
                onChange={() => {
                  warmupStatus === "enabled" ? handlePauseWarmup() : handleEnableWarmup();
                }}
              />
            </span>
          </Tooltip>
          }
        />
         
          {/* <Box
            sx={{
              width: "200px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "40px",
              borderRadius: 1,
              border: "1px solid gray",
            }}
          >
            <Box
              sx={{
                width: "100px",
                height: "100%",
                backgroundColor: warmupStatus === "enabled" ? "white" : "#465571",
                borderTopLeftRadius: 5,
                borderBottomLeftRadius: 5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={handlePauseWarmup}
            >
              <Typography
                sx={{ fontWeight: "600", color: warmupStatus === "enabled" ? "#aaaaaa" : "white" }}
              >
                Disable
              </Typography>
            </Box>
            <Box
              sx={{
                width: "100px",
                height: "100%",
                backgroundColor: warmupStatus === "enabled" ? "#216fed" : "white",
                borderTopRightRadius: 5,
                borderBottomRightRadius: 5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={handleEnableWarmup}
            >
              <Typography
                sx={{ fontWeight: "600", color: warmupStatus === "enabled" ? "white" : "#aaaaaa" }}
              >
                Enable
              </Typography>
            </Box>
          </Box> */}
        </Box>
      )}

      {warmupStatus !== "enabled" ? (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            mt: 2,
            visibility: "hidden",
          }}
        >
          <Typography sx={{ fontSize: "18px", mb: 4 }}>
            Enable warmup for this account to check its performance
          </Typography>
          <EmailDrawerDisabledHero />
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
            <Grid container spacing={2} sx={{ mt: 2, mb: 5 }}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    width: "100%",
                    borderRadius: "12px",
                    p: 3,
                    border: "1px solid #E4E4E5",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "16px",
                      color: "#28287B",
                    }}
                  >
                    Warmup deliverability - past week
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",

                      width: "100%",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        width: "fit-content",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* <EDSuperbHero /> */}
                      <EDStar />
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "20px",
                          fontWeight: 700,
                          lineHeight: "25px",
                          color: "#28287B",
                        }}
                      >
                        { account.warmupStats?.health_score >= 75 && account.warmupStats?.health_score <= 100 ?  "Excellent  Results!" :
                        account.warmupStats?.health_score >= 50 && account.warmupStats?.health_score <= 75 ? " Good  Results!":
                        account.warmupStats?.health_score >= 25 && account.warmupStats?.health_score <= 50 ?  "Medium  Results!" :
                        "Poor  Results!"                        
                         }
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "20px",
                          color: "#8181B0",
                          mt: 1,
                        }}
                      >
                        {account.warmupStats?.health_score || 0}% of your warmup emails successfully
                        landed in the inbox.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    width: "100%",
                    borderRadius: "12px",
                    p: 3,
                    border: "1px solid #E4E4E5",
                    height: "100%",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "13px", fontWeight: 400, lineHeight: "16px", color: "#28287B" }}
                  >
                    Summary - last week
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        lineHeight: "20px",
                        color: "#28287B",
                        display: "flex",
                        alignItems: "center",
                        // mx: 2,
                        justifyContent: "flex-start",
                        // width: "5ch",
                        width: { xs: "100%", sm: "25%" },
                        mt: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          mr: 1,
                          gap: 2,
                        }}
                      >
                        <EDWarmupEmailsSent />
                      </Box>
                      <Box>
                        <Typography sx={{ color: "#8181B0", fontWeight: "400", fontSize: "13px" }}>
                          {" "}
                          Warmup Emails Sent
                        </Typography>
                        <Typography sx={{ color: "#28287B", fontWeight: "700", fontSize: "14px" }}>
                          {" "}
                          {account.warmupStats?.sent_count ?? 0}
                        </Typography>
                      </Box>
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        lineHeight: "20px",
                        color: "#28287B",
                        display: "flex",
                        alignItems: "center",
                        // mx: 2,
                        justifyContent: "flex-start",
                        // width: "5ch",
                        mt: 2,
                        width: { xs: "100%", sm: "25%" },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mr: 1,
                        }}
                      >
                        <EDLandedInbox />
                      </Box>

                      <Box>
                        <Typography sx={{ color: "#8181B0", fontWeight: "400", fontSize: "13px" }}>
                          {" "}
                          Landed in Inbox
                        </Typography>
                        <Typography sx={{ color: "#28287B", fontWeight: "700", fontSize: "14px" }}>
                          {" "}
                          {account.warmupStats?.inbox_count ?? 0}{" "}
                        </Typography>
                      </Box>
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        lineHeight: "20px",
                        color: "#28287B",
                        display: "flex",
                        justifyContent: "flex-start",
                        // width: "5ch",
                        alignItems: "center",
                        // mx: 2,
                        mt: 2,
                        width: { xs: "100%", sm: "25%" },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mr: 1,
                        }}
                      >
                        <EDSavedSpam />
                      </Box>

                      <Box>
                        <Typography sx={{ color: "#8181B0", fontWeight: "400", fontSize: "13px" }}>
                          {" "}
                          Saved from spam
                        </Typography>
                        <Typography sx={{ color: "#28287B", fontWeight: "700", fontSize: "14px" }}>
                          {" "}
                          {account.warmupStats?.spam_count ?? 0}{" "}
                        </Typography>
                      </Box>
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        lineHeight: "20px",
                        color: "#28287B",
                        display: "flex",
                        justifyContent: "flex-start",
                        // width: "5ch",
                        alignItems: "center",
                        // mx: 2,
                        mt: 2,
                        width: { xs: "100%", sm: "25%" },
                        // mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mr: 1,
                        }}
                      >
                        <EDEmailsReceived />
                      </Box>
                      <Box>
                        <Typography sx={{ color: "#8181B0", fontWeight: "400", fontSize: "13px" }}>
                          {" "}
                          Warmup Emails Received
                        </Typography>
                        <Typography sx={{ color: "#28287B", fontWeight: "700", fontSize: "14px" }}>
                          {" "}
                          {account.warmupStats?.received_count ?? 0}{" "}
                        </Typography>
                      </Box>
                    </Typography>
                  </Box>
                  {/* <Divider sx={{ my: 2 }} /> */}
                </Box>
              </Grid>
              <Grid item xs={12}>
                {" "}
                <Box
                  sx={{
                    width: "100%",
                    borderRadius: "12px",
                    p: 3,
                    border: "1px solid #E4E4E5",
                    height: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "18px",
                      color: "#28287B",
                    }}
                  >
                    Summary of Warmup Emails Sent
                  </Typography>
                  <ReactApexChart options={options} series={series} type="bar" height={280} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </>
  );
};

export default WarmupTab;
