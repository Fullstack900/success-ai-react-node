import SettingTab from "./SettingTab.js";

const { HighlightOff } = require("@mui/icons-material");
const { Box, IconButton, Typography } = require("@mui/material");

const BulkSettingEmailDrawer = ({ accountIds, onClose }) => {
  const account = {
    // name: {
    //   first: "",
    //   last: "",
    // },
    // replyTo: "",
    // campaign: {
    //   dailyLimit: 50,
    //   waitTime: 1,
    // },
    // customDomain: {
    //   isEnable: false,
    //   name: undefined,
    // },
    warmup: {
      // basicSetting: {
      //   increasePerDay: 1,
      //   slowWarmupDisabled: false,
      //   limitPerDay: 20,
      //   replyRate: 30,
      //   alertBlock: true,
      // },
      // advanceSetting: {
      //   weekdayOnly: false,
      //   readEmulation: false,
      //   customTrackingDomain: false,
      //   openRate: 100,
      //   spamProtectionRate: 100,
      //   markImportantRate: 100,
      // },
    },
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          width: "50vw",
          p: 3,
          px: 7,
        }}
      >
        <Box sx={{ display: "flex", width: "100%", flexDirection: "row-reverse" }}>
          <IconButton onClick={onClose}>
            <HighlightOff fontSize="large" />
          </IconButton>
        </Box>
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 600,
            color: "gray",
            textAlign: "left",
            width: "100%",
            ml: 4,
          }}
        ></Typography>{" "}
        <Box sx={{ p: 3, width: "100%" }}>
          <SettingTab bulkUpdate accountIds={accountIds} account={account} />
        </Box>
      </Box>
    </>
  );
};

export default BulkSettingEmailDrawer;
