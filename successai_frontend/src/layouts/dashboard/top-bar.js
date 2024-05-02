import * as React from "react";
import AppBar from "@mui/material/AppBar";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";

import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Logo } from "src/components/logo";

const drawerWidth = 240;
const topNavHeight = 64;

const TopBar = ({ handleDrawerToggle }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100vw",
        height: topNavHeight,
        display: { xs: "block", lg: "none" },
      }}
    >
      <Toolbar sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            ml: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "150px",
            height: "30px",
          }}
        >
          <Logo color="white" logoTextColor="white" />
        </Box>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { lg: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
