import React, { useState, useEffect } from "react";
import UniboxPage from "./unibox.js";
import CrmPage from "./crmPage.js";
import { Tab, Tabs, Box } from "@mui/material";
import { SBSearch } from "src/assets/sidebar/SBSearch";

const InboxCrm = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    const storedTab = localStorage.getItem("selectedTab");
    if (storedTab) {
      setSelectedTab(parseInt(storedTab, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedTab", selectedTab);
  }, [selectedTab]);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab
          sx={{
            fontSize: "20px",
            fontWeight: "bold",
          }}
          label="InboxHub"
        />
        <Tab
          sx={{
            fontSize: "20px",
            fontWeight: "bold",
          }}
          label="CRM"
        />
      </Tabs>
      <Box>
        {selectedTab === 0 && <UniboxPage />}
        {selectedTab === 1 && <CrmPage />}
      </Box>
    </Box>
  );
};

export default InboxCrm;