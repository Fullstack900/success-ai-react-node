import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { Add, Logout } from "@mui/icons-material";
import { removeAuthToken, useLogoutMutation } from "src/services/auth-service.js";
import { setUser, useGetMeQuery } from "src/services/user-service.js";
import SBMenu from "src/assets/sidebar/SBMenu";
import { useDispatch } from "react-redux";

import { useGetCurrentPlanQuery } from "src/services/billing-service.js";
import SubscriptionChecker from "./SubscriptionChecker";
import { config } from "src/config";
const SideNavFooter = ({ navMenuOpen, isMobile }) => {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const { data: user } = useGetMeQuery();
  const dispatch = useDispatch();
  const { data: currentPlan } = useGetCurrentPlanQuery();

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [anchorEl3, setAnchorEl3] = useState(null);
  const [anchorEl4, setAnchorEl4] = useState(null);
  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    if (user) {
      window.intercomSettings = {
        app_id: config.INTERCOM_APP_ID,
        name: user.name.first + " " + user.name.last,
        email: user.email,
      };
      dispatch(setUser(user));
    }
  }, [user]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setButtonClicked(!buttonClicked);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setButtonClicked(!buttonClicked);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
    setButtonClicked(!buttonClicked);
  };
  const handleClick3 = (event) => {
    setAnchorEl3(event.currentTarget);
    setButtonClicked(!buttonClicked);
  };
  const handleClose3 = () => {
    setAnchorEl3(null);
    setButtonClicked(!buttonClicked);
  };
  const handleClose4 = () => {
    setAnchorEl4(null);
    setButtonClicked(!buttonClicked);
  };

  const open = Boolean(anchorEl);
  const open2 = Boolean(anchorEl2);
  const open3 = Boolean(anchorEl3);
  const open4 = Boolean(anchorEl4);
  const id = open ? "simple-popover" : undefined;

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    await logout().unwrap();
    removeAuthToken();
    window.location.href = "/login";
  };

  return (
    <>
      <SubscriptionChecker navigate={navigate} />
      <Box
        component="header"
        sx={{
          color: "common.white",

          zIndex: (theme) => theme.zIndex.appBar,
          pr: buttonClicked && 1.9,
        }}
      >
        <Stack
          direction="row"
          justifyContent={navMenuOpen || isMobile ? "space-between" : "flex-start"}
          sx={{ mb: isMobile ? 2 : 0 }}
        >
          {navMenuOpen || isMobile ? (
            <Stack alignItems="center" direction="row" spacing={2}>
              <Avatar
                sx={{
                  backgroundColor: "#8DA9C4",
                  width: 40,
                  height: 40,
                  color: "#fff",
                }}
              >
                {user?.name?.first.charAt(0).toUpperCase()}
                {user?.name?.last.charAt(0).toUpperCase()}
              </Avatar>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  flexDirection: "column",
                  mx: 1,
                  width: 130,
                  overflow: "hidden",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "18px",
                    letterSpacing: "0em",
                    color: "#FFFFFF",
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {" "}
                  {user?.name?.first} {user?.name?.last}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "16px",
                    letterSpacing: "0em",
                    color: "#FFFFFF",
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.email}
                </Typography>
              </Box>
              <IconButton onClick={handleClick}>
                <SBMenu />
              </IconButton>
            </Stack>
          ) : (
            <Avatar
              onClick={handleClick}
              sx={{
                backgroundColor: "#8DA9C4",
                width: 40,
                height: 40,
                color: "#fff",
                ml: 0.5,
              }}
            >
              {user?.name?.first.charAt(0).toUpperCase()}
              {user?.name?.last.charAt(0).toUpperCase()}
            </Avatar>
          )}
        </Stack>
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: 200,
          }}
        >
          <Button fullWidth sx={{ py: 2 }} onClick={() => navigate("/settings/profile")}>
            Settings
          </Button>
          <Button fullWidth sx={{ py: 2 }} onClick={handleLogout}>
            Logout
            {isLogoutLoading ? (
              <CircularProgress color="inherit" size={20} sx={{ ml: 1 }} />
            ) : (
              <Logout fontSize="small" sx={{ ml: 1 }} />
            )}
          </Button>
        </Box>
      </Popover>
      <Popover
        id={id}
        open={open4}
        anchorEl={anchorEl4}
        onClose={handleClose4}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: 200,
          }}
        >
          <Button fullWidth sx={{ py: 2 }}>
            Help
          </Button>
        </Box>
      </Popover>
      <Popover
        id={id}
        open={open3}
        anchorEl={anchorEl3}
        onClose={handleClose3}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: 200,
          }}
        >
          <Typography sx={{ p: 2, fontSize: "14px", fontWeight: 600 }}>No notifications</Typography>
        </Box>
      </Popover>
      <Popover
        id={id}
        open={open2}
        anchorEl={anchorEl2}
        onClose={handleClose2}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: 200,
          }}
        >
          <TextField
            fullWidth
            sx={{
              "& div": { borderRadius: 0, p: 1.5, px: 5 },
              "& div fieldset": { borderRadius: 0 },
            }}
            placeholder="Search"
            variant="filled"
          />
          <Button
            fullWidth
            sx={{ py: 2, backgroundColor: "#BCEBDA", borderRadius: 0, color: "#101828" }}
          >
            My Organization
          </Button>
          <Button fullWidth sx={{ py: 2, color: "#101828" }}>
            <Add fontSize="small" sx={{ mr: 1, color: "#101828" }} /> Create Workspace
          </Button>
        </Box>
      </Popover>
    </>
  );
};
export default SideNavFooter;
