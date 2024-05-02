import { useState } from "react";
import { HighlightOff } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, Tab, Tabs, Typography } from "@mui/material";
import PropTypes from "prop-types";
import WarmupTab from "./WarmupTab.js";
import SettingTab from "./SettingTab.js";
import { EACloseIcon } from "src/assets/emailAccounts/EACloseIcon.js";

const scrollbarStyle = {
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
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: "90%", overflowY: "auto", overflowX: "hidden", ...scrollbarStyle }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const EmailDrawer = ({ account, onClose, tabValue }) => {
  const [value, setValue] = useState(tabValue);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
          height: "100%",
          p: 3,
          overflow: "hidden",

          ...scrollbarStyle,
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: "28px",
              color: "#28287B",
            }}
          >
            Email settings
          </Typography>
          <IconButton onClick={onClose}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <EACloseIcon />
            </Box>
          </IconButton>
        </Box>
        <Typography
          sx={{
            color: "#28287B",
            textAlign: "left",
            width: "100%",
            mt: 3,
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: "20px",
          }}
        >
          {account.email}
        </Typography>
        <Box
          sx={{
            width: "100%",
            mt: 2,
            height: "100%",
            overflow: "hidden",
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
              mb: 3,
            }}
          >
            <Grid item xs={6}>
              <Button
                // variant="contained"
                fullWidth
                sx={{
                  backgroundColor: value === 0 ? "white" : "transparent",
                  color: value === 0 ? "#0071F6" : "#8181B0",
                  "&:hover": {
                    backgroundColor: value === 0 ? "white" : "transparent",
                  },
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "20px",
                  letterSpacing: "0em",
                  boxShadow: value === 0 && "0px 1px 2px 0px #1018280F",
                  borderRadius: "5px",
                  // mr: 0.5,
                  py: 1,
                }}
                onClick={() => {
                  setValue(0);
                }}
              >
                Warmup
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                // variant="contained"
                fullWidth
                sx={{
                  backgroundColor: value === 1 ? "white" : "transparent",
                  color: value === 1 ? "#0071F6" : "#8181B0",
                  "&:hover": {
                    backgroundColor: value === 1 ? "white" : "transparent",
                  },
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "20px",
                  letterSpacing: "0em",
                  boxShadow: value === 1 && "0px 1px 2px 0px #1018280F",
                  borderRadius: "5px",
                  // mr: 0.5,
                  py: 1,
                }}
                onClick={() => {
                  setValue(1);
                }}
              >
                Settings
              </Button>
            </Grid>
          </Grid>
          <TabPanel
            value={value}
            index={0}
            style={{ height: "90%", overflow: "hidden", ...scrollbarStyle }}
          >
            <WarmupTab account={account} />
          </TabPanel>
          <TabPanel
            value={value}
            index={1}
            style={{ height: "90%", overflow: "hidden", ...scrollbarStyle }}
          >
            <SettingTab account={account} />
          </TabPanel>
        </Box>
      </Box>
    </>
  );
};

export default EmailDrawer;
