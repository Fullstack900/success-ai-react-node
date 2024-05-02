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
import { Logo } from "src/components/logo";
import { Add, Logout } from "@mui/icons-material";
import { removeAuthToken, useLogoutMutation } from "src/services/auth-service.js";
import { setUser, useGetMeQuery } from "src/services/user-service.js";
import { TNNotification } from "src/assets/topnav/TNNotification";
import { DropDown } from "src/assets/general/DropDown";
import { useGetCurrentPlanQuery } from "src/services/billing-service.js";
import { useDispatch } from "react-redux";
import SubscriptionChecker from "./SubscriptionChecker";
import { config } from "src/config";
const TOP_NAV_HEIGHT = 64;

export const TopNav = () => {
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
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          // backgroundColor: "rgba(16, 24, 40, 0.95)",
          color: "common.white",
          position: "fixed",
          width: "100%",
          zIndex: (theme) => theme.zIndex.appBar,
          pr: buttonClicked && 1.9,
          // boxShadow: "0px -8px 26px 0px rgba(0, 0, 0, 0.15)",
          borderBottom: "1px solid #E6E6E6",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            minHeight: TOP_NAV_HEIGHT,
            px: 3,
          }}
        >
          <Stack alignItems="center" direction="row" spacing={3}>
            <Box
              component={RouterLink}
              to="/"
              sx={{
                // display: "inline-flex",
                // height: 24,
                // width: 24,
                ml: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "150px",
                height: "30px",
                // backgroundColor: "red",
              }}
            >
              <Logo />
            </Box>
          </Stack>
          <Stack alignItems="center" direction="row" spacing={2}>
            {/* <IconButton onClick={handleClick4}>
              <Help />
            </IconButton> */}
            <IconButton onClick={handleClick3}>
              <TNNotification />
            </IconButton>
            {/* <IconButton
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#101828",
                backgroundColor: "#98A2B3",
                "&:hover": {
                  backgroundColor: "#98A2B3",
                },
              }}
              onClick={handleClick2}
            >
              M
            </IconButton> */}
            <Button
              sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}
              onClick={handleClick}
            >
              <Avatar
                sx={{
                  backgroundColor: "#8DA9C4",
                  width: 35,
                  height: 35,
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
                }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "18px",
                    letterSpacing: "0em",
                    color: "#28287B",
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
                    color: "#8181B0",
                  }}
                >
                  {user?.email}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <DropDown />
              </Box>
              {/*
              <Typography
                sx={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, ml: 1 }}
              >
                {user?.name?.first} {user?.name?.last}
              </Typography> */}
            </Button>
          </Stack>
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
          <Button fullWidth sx={{ py: 2 }} onClick={() => navigate("/settings/billing")}>
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
