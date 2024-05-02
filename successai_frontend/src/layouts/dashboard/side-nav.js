import React, { useMemo, useState, useEffect, useContext } from "react";
import { Link as RouterLink, matchPath, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  alpha,
  Stack,
  Typography,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { items } from "./config";
import { BorderRight, CloseOutlined } from "@mui/icons-material";
import { Logo } from "src/components/logo";
import SideNavFooter from "./side-nav-footer";
import { useDispatch, useSelector } from "react-redux";
import { useGetCampaignsQuery } from "src/services/campaign-service";
import { useGetAllLabelsQuery } from "src/services/campaign-service.js";
import { LogoSymbol } from "src/components/logoSymbol";
import {
  useGetMeQuery,
} from "src/services/user-service.js";
import { useNavigate } from "react-router";

const SIDE_NAV_WIDTH = 264;
const TOP_NAV_HEIGHT = 64;
const scrollBarStyle = {
  // width
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },

  // Track
  "&::-webkit-scrollbar-track": {
    borderRadius: "60px",
  },

  // /* Handle */
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: "10px",
    border: "3px solid rgba(0, 0, 0, 0)",
    backgroundClip: "padding-box",
  },

  // /* Handle on hover */
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
};

const openedMixin = (theme) => ({
  width: SIDE_NAV_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(8)} + 1px)`,
});

export const SideNav = ({ mobileMenuOpen, setMobileMenuOpen, navMenuOpen }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const actualTotalCount = useSelector((state) => state.inboxhub.actualTotalCount);

  const actualTotalCountValue = actualTotalCount;

  const { data: campaignData } = useGetCampaignsQuery({
    unibox: true,
  });

  const memoizedCampaignData = campaignData;

  const { data: statusLabels } = useGetAllLabelsQuery();
  const memoizedStatusLabels = useMemo(() => statusLabels, [statusLabels]);

  const [totalLabel, setTotalLabel] = useState(0);
  const accountData = useSelector((state) => state.accounts);

  const memoizedAccountData = accountData;
  const [totalCount, setTotalCount] = useState(0);
  const [totalInboxCount, setTotalInboxCount] = useState(0);

  useEffect(() => {
    let inboxCount = 0;
    let campaignDatacount = 0;
    memoizedCampaignData?.updatedEmail?.forEach((i) => {
      campaignDatacount = campaignDatacount + i.unread_count;
    });

    memoizedAccountData?.forEach((i) => {
      if (i.stats) {
        const filteredStats = i.stats.filter(
          (item) => item.portal_email_opened === false && item.from === i._id
        );
        inboxCount += filteredStats.length;
      }
    });

    let count = 0;

    memoizedStatusLabels?.labels?.forEach((i) => {
      count = count + i.unread_count;
    });

    setTotalCount(campaignDatacount);
    setTotalInboxCount(inboxCount);
    setTotalLabel(count);
  }, [campaignData, memoizedAccountData, statusLabels]);

  const actualTotalCountApi = totalCount ;
  const navigate = useNavigate();

  const { data: user, refetch: refetchUser } = useGetMeQuery();
  
  useEffect(() => {
    const fetchData = async () => {
      await refetchUser();
      if (user?.firstLogin === true) {
        navigate("/loginProtection");
      }
    };
      fetchData();
  }, [user?.firstLogin === true, refetchUser]);

  return (
    <Drawer
      open={isMobile ? mobileMenuOpen : navMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      variant={isMobile ? "temporary" : "permanent"}
      sx={{
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        width: SIDE_NAV_WIDTH,
        flexShrink: 0,
        // "& .MuiDrawer-paper": {
        //   boxSizing: "border-box",
        //   width: SIDE_NAV_WIDTH,
        //   borderWidth: 0,
        // },
        ...(navMenuOpen &&
          !isMobile && {
            ...openedMixin(theme),
            "& .MuiDrawer-paper": openedMixin(theme),
          }),
        ...(!navMenuOpen &&
          !isMobile && {
            ...closedMixin(theme),
            "& .MuiDrawer-paper": closedMixin(theme),
          }),
      }}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.primary.main,
          //backgroundColor: "#2B38C6",
          display: "flex",
          flexDirection: "column",
          // height: `calc(100% - ${TOP_NAV_HEIGHT}px)`,
          height: "100%",
          // p: 1,

          // width: navMenuOpen ? SIDE_NAV_WIDTH : `calc(${theme.spacing(7)} + 1px)`,
          zIndex: (theme) => theme.zIndex.appBar - 100,

          // borderRight: `1px solid ${theme.palette.primary.main}`,
          border: "none",
        },
      }}
    >
      {isMobile && (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            onClick={() => setMobileMenuOpen(false)}
            sx={{ color: theme.palette.primary.contrastText }}
          >
            <CloseOutlined />
          </IconButton>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          px: 1,
          py: { xs: 0, md: 3 },
          overflowY: { xs: "auto", lg: "hidden" },
          ":hover": {
            overflowY: "auto",
          },
          overflowX: "hidden",

          ...scrollBarStyle,
        }}
      >
        <Stack spacing={4}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              // display: "inline-flex",
              // height: 24,
              // width: 24,
              // ml: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "150px",
              height: "30px",
              px: 1,
              // backgroundColor: "red",
            }}
          >
            {navMenuOpen || isMobile ? (
              <Logo color="white" logoTextColor="white" />
            ) : (
              <LogoSymbol color="white" />
            )}
          </Box>
          <Stack spacing={1}>
            <Typography
              sx={{
                color: alpha(theme.palette.primary.contrastText, 0.5),
                fontWeight: "700",
                fontSize: "12px",
                px: 1,
              }}
            >
              MENU
            </Typography>
            <List sx={{ width: "100%", m: 0, p: 0, px: navMenuOpen || isMobile ? 0 : "4px" }}>
              {items.map((item) => {
                const active = matchPath({ path: item.href, end: true }, location.pathname);
                return (
                  <ListItem
                    id={item.id}
                    disablePadding
                    component={RouterLink}
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{
                      // flexDirection: "column",
                      // px: "16px",
                      pb: { xs: "10px", md: "16px" },
                      zIndex: 999,
                    }}
                  >
                    {" "}
                    <Tooltip title="" placement="right" arrow>
                      <Box
                        sx={{
                          display: "flex",
                          //justifyContent: navMenuOpen || isMobile ? "flex-start" : "center",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          // backgroundColor: active && "rgb(33, 111, 237, 1)",
                          backgroundColor: active && alpha(theme.palette.background.paper, 0.2),
                          // px: 2,
                          borderRadius: "10px",
                          px: 1,
                          minWidth: "40px",
                          width: "100%",
                          "&:hover": {
                            backgroundColor: !active && alpha(theme.palette.background.paper, 0.05),
                          },
                        }}
                      >
                        {" "}
                        <ListItemIcon
                          sx={{
                            minWidth: "auto",
                            color: theme.palette.primary.contrastText,
                            py: "8px",
                          }}
                        >
                          {item.icon(active)}
                        </ListItemIcon>{" "}
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            variant: "caption",
                            sx: {
                              color: theme.palette.primary.contrastText,
                              fontSize: "14px",
                              fontWeight: 700,
                              lineHeight: "18px",
                              letterSpacing: "0px",
                              textAlign: "left",
                              ml: 1,

                              // fontWeight: active && 600,
                            },
                          }}
                          sx={{ ml: 1, display: navMenuOpen || isMobile ? "block" : "none" }}
                        />
                        {item.label === "InboxHub" &&
                          actualTotalCount !== 0 &&
                          actualTotalCountApi !== 0 && (
                            <Box
                              sx={{
                                minWidth: "1.6em",
                                height: "1.6em",
                                borderRadius: "0.8em",
                                border: "0.05em solid white",
                                backgroundColor: theme.palette.primary.contrastText,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: "0.8em",
                                fontWeight: "700",
                                color: theme.palette.primary.main,
                                padding: "5px",
                              }}
                            >
                              {actualTotalCountValue == null
                                ? actualTotalCountApi
                                : actualTotalCountValue}
                            </Box>
                          )}
                      </Box>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
          </Stack>
        </Stack>

        <Stack spacing={2} sx={{ px: navMenuOpen || isMobile ? 1 : 0 }}>
          <Typography
            sx={{
              color: alpha(theme.palette.primary.contrastText, 0.5),
              fontWeight: "700",
              fontSize: "12px",
            }}
          >
            PROFILE
          </Typography>
          <SideNavFooter navMenuOpen={navMenuOpen} isMobile={isMobile} />
        </Stack>
      </Box>
    </Drawer>
  );
};
