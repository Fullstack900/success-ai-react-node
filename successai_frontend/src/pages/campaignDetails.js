import { useState } from "react";
import {
  Box,
  Grid,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import CampaignAnalytics from "src/components/campaigns/campaignAnalytics";
import CampaignLeads from "src/components/campaigns/campaignLeads";
import CampaignSequences from "src/components/campaigns/campaignSequences";
import CampaignSchedule from "src/components/campaigns/campaignSchedule";
import CampaignOptions from "src/components/campaigns/campaignOptions";
import { PauseIcon } from "src/assets/general/PauseIcon";
import { PlayIcon } from "src/assets/general/PlayIcon";
import { VerticalMore } from "src/assets/general/VerticalMore";
import { ErrorIcon } from "src/assets/general/ErrorIcon";
import { ArrowRight } from "src/assets/general/ArrowRight";
import { CDAnalytics } from "src/assets/campaignDetails/CDAnalytics";
import { CDLeads } from "src/assets/campaignDetails/CDLeads";
import { CDSequences } from "src/assets/campaignDetails/CDSequences";
import { CDSchedule } from "src/assets/campaignDetails/CDSchedule";
import { CDOptions } from "src/assets/campaignDetails/CDOptions";
import { toast } from "react-hot-toast";

import {
  useGetCampaignQuery,
  usePauseCampaignMutation,
  useResumeCampaignMutation,
} from "src/services/campaign-service";
import { CloseOutlined, WidgetsOutlined } from "@mui/icons-material";

const items = [
  { label: "Analytics", icon: (active) => <CDAnalytics color={active ? "#0071F6" : "#28287B"} /> },
  { label: "Leads", icon: (active) => <CDLeads color={active ? "#0071F6" : "#28287B"} /> },
  { label: "Sequences", icon: (active) => <CDSequences color={active ? "#0071F6" : "#28287B"} /> },
  { label: "Schedule", icon: (active) => <CDSchedule color={active ? "#0071F6" : "#28287B"} /> },
  {
    label: "Configurations",
    icon: (active) => <CDOptions color={active ? "#0071F6" : "#28287B"} />,
  },
];

const CampaignMenu = ({ items, setValue, value, setCampaignMenuOpen }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        boxShadow: { xs: 0, md: "0px 12px 15px 0px #4B71970D" },
        width: "100%",
        backgroundColor: "white",
        borderRadius: "12px",
      }}
    >
      <List sx={{ width: "100%", mt: 2 }}>
        {items.map((item, i) => {
          return (
            <ListItem
              disablePadding
              key={i}
              sx={{
                px: "16px",
                pb: "16px",
                cursor: "pointer",
              }}
              onClick={() => {
                setValue(i);
                if (setCampaignMenuOpen) {
                  setCampaignMenuOpen(false);
                }
              }}
            >
              {" "}
              <Tooltip title="" placement="right" arrow>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    backgroundColor: i === value && "rgba(242, 244, 246, 1)",
                    px: 2,
                    borderRadius: "10px",
                    width: "100%",
                  }}
                >
                  {" "}
                  <ListItemIcon
                    sx={{
                      minWidth: "auto",
                      color: i === value ? "black" : "neutral.400",
                      py: "8px",
                    }}
                  >
                    {item.icon(i === value)}
                  </ListItemIcon>{" "}
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      variant: "caption",
                      sx: {
                        color: i === value ? "#0071F6" : "#28287B",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "18px",
                        letterSpacing: "0px",
                        textAlign: "left",
                        ml: 1,
                      },
                    }}
                    sx={{ ml: 1 }}
                  />
                </Box>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

const Page = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [campaignMenuOpen, setCampaignMenuOpen] = useState(false);

  const [value, setValue] = useState(0);

  const { data: campaign, isLoading: isCampaignLoading } = useGetCampaignQuery(id);
  const [pauseCampaign] = usePauseCampaignMutation();
  const [resumeCampaign] = useResumeCampaignMutation();

  const handlePauseCampaignClick = async (id) => {
    const { message } = await pauseCampaign(id).unwrap();
    toast.success(message);
  };

  const handleResumeCampaignClick = async (id) => {
    try {
      const { message } = await resumeCampaign(id).unwrap();
      toast.success(message);
    } catch (error) {
      toast.error(error.data.error.message);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          //   p: 2,
          flexDirection: "column",
          // px: 7.85,
          pt: 0.6,
        }}
      >
        <Box
          sx={{
            width: "90%",
            height: "100%",
            // py: 6,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            // backgroundColor: "yellow",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "center", sm: "flex-start" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                {" "}
                <Typography
                  sx={{
                    color: "#28287B",
                    fontSize: "32px",
                    fontWeight: 700,
                    lineHeight: "40px",
                    letterSpacing: "0px",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/campaigns")}
                >
                  Campaigns
                </Typography>
                <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 0.5 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mr: 0.5,
                    }}
                  >
                    {" "}
                    <ArrowRight />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: { xs: "16px", sm: "20px" },
                      fontWight: 500,
                      lineHeight: "25px",
                      letterSpacing: "0px",
                      color: "#8181B0",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setValue(0);
                    }}
                  >
                    {campaign?.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mr: 0.5,
                    }}
                  >
                    {" "}
                    <ArrowRight />
                  </Box>

                  <Typography
                    sx={{
                      color: "#8181B0",

                      fontSize: { xs: "16px", sm: "20px" },
                      fontWight: 500,
                      lineHeight: "25px",
                      letterSpacing: "0px",
                    }}
                  >
                    {items[value].label}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: { md: "none", xs: "block" },
              // justifyContent: "flex-end",
              // width: "100%",
              width: "fit-content",
              position: "absolute",
              right: { xs: "1rem", sm: "2rem" },
              top: "100px",
              mt: "8px",
            }}
          >
            <IconButton
              onClick={() => setCampaignMenuOpen(true)}
              sx={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                color: theme.palette.primary.contrastText,
                backgroundColor: theme.palette.primary.main,
              }}
            >
              <WidgetsOutlined />
            </IconButton>
          </Box>
          <Grid container sx={{ height: "100%", mt: { xs: 0, sm: 1 } }} spacing={3}>
            <Drawer
              open={isMobile ? campaignMenuOpen : false}
              variant="temporary"
              onClose={() => setCampaignMenuOpen(false)}
              sx={{
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: { sm: "300px", xs: "100%" },
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  zIndex: 1,
                }}
              >
                <IconButton onClick={() => setCampaignMenuOpen(false)}>
                  <CloseOutlined />
                </IconButton>
              </Box>
              <CampaignMenu
                items={items}
                setValue={setValue}
                value={value}
                setCampaignMenuOpen={setCampaignMenuOpen}
              />
            </Drawer>
            <Grid item xs={3} sx={{ display: { xs: "none", md: "block" } }}>
              <CampaignMenu items={items} setValue={setValue} value={value} />
            </Grid>
            <Grid item xs={12} md={9} sx={{ width: "100%", position: "relative" }}>
              {isCampaignLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 10,
                  }}
                >
                  <CircularProgress size={25} thickness={5} />
                  <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#4e88e6", ml: 2 }}>
                    Loading...
                  </Typography>
                </Box>
              ) : value === 0 ? (
                <CampaignAnalytics
                  campaign={campaign}
                  handlePause={handlePauseCampaignClick}
                  handleResume={handleResumeCampaignClick}
                />
              ) : value === 1 ? (
                <CampaignLeads campaign={campaign} />
              ) : value === 2 ? (
                <CampaignSequences campaign={campaign} />
              ) : value === 3 ? (
                <CampaignSchedule campaign={campaign} />
              ) : value === 4 ? (
                <CampaignOptions campaign={campaign} />
              ) : null}
            </Grid>
          </Grid>
          {/* <Box
            sx={{
              borderBottom: 1,
              borderColor: "rgba(0,0,0,0.25)",
              width: "100%",
              display: "none",
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
              variant="fullWidth"
            >
              <Tab
                label="Analytics"
                {...a11yProps(0)}
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  pb: 2,
                  color: "rgba(0,0,0,0.5)",
                  "&:hover": {
                    borderColor: "#000",
                    color: value !== 0 && "#000",
                  },
                }}
              />
              <Tab
                label="Leads"
                {...a11yProps(1)}
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  pb: 2,
                  color: "rgba(0,0,0,0.5)",
                  "&:hover": {
                    borderColor: "#000",
                    color: value !== 1 && "#000",
                  },
                }}
              />
              <Tab
                label="Sequences"
                {...a11yProps(2)}
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  pb: 2,
                  color: "rgba(0,0,0,0.5)",
                  "&:hover": {
                    borderColor: "#000",
                    color: value !== 2 && "#000",
                  },
                }}
              />
              <Tab
                label="Schedule"
                {...a11yProps(3)}
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  pb: 2,
                  color: "rgba(0,0,0,0.5)",
                  "&:hover": {
                    borderColor: "#000",
                    color: value !== 3 && "#000",
                  },
                }}
              />
              <Tab
                label="Options"
                {...a11yProps(4)}
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  pb: 2,
                  color: "rgba(0,0,0,0.5)",
                  "&:hover": {
                    borderColor: "#000",
                    color: value !== 4 && "#000",
                  },
                }}
              />
            </Tabs>
          </Box> */}
        </Box>
      </Box>
    </>
  );
};

export default Page;
