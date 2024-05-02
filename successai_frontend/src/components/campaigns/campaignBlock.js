import React, { useEffect, useState } from "react";
import {
  Delete,
  PauseOutlined,
  PlayArrowOutlined,
  LoopOutlined,
  EditOutlined,
  CloseOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Popover,
  Tooltip,
  Typography,
  tooltipClasses,
  useTheme,
  alpha,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ErrorIcon } from "src/assets/general/ErrorIcon";
import { PauseIcon } from "src/assets/general/PauseIcon";
import { PlayIcon } from "src/assets/general/PlayIcon";
import { Sent } from "src/assets/campaignBlock/Sent";
import { Replied } from "src/assets/campaignBlock/Replied";
import { Opened } from "src/assets/campaignBlock/Opened";
import { VerticalMore } from "src/assets/general/VerticalMore";
import { styled } from "@mui/material/styles";
import {
  useDeleteCampaignMutation,
  usePauseCampaignMutation,
  useRenameCampaignMutation,
  useResumeCampaignMutation,
} from "src/services/campaign-service";
import { toast } from "react-hot-toast";
import ReactApexChart from "react-apexcharts";
import { generateDates } from "src/utils/util.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc)
dayjs.extend(timezone)

const CampaignBlock = ({ campaign, onCampaignChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editedName, setEditedName] = useState(campaign.name);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleRename = async () => {
    const data = {
      id: campaign._id,
      params: {
        name: editedName || campaign.name,
      },
    };
    const { message } = await renameCampaign(data).unwrap();
    toast.success(message);
    setEditedName(campaign.name);
    setEditOpen(false);
    setAnchorEl(null);
    onCampaignChange(true);
  };

  const [pauseCampaign] = usePauseCampaignMutation();
  const [renameCampaign] = useRenameCampaignMutation();
  const [resumeCampaign] = useResumeCampaignMutation();

  const handlePauseCampaignClick = async (id) => {
    const { message } = await pauseCampaign(id).unwrap();
    onCampaignChange(true);
    toast.success(message);
  };

  const handleResumeCampaignClick = async (id) => {
    onCampaignChange(true);
    try {
      const { message } = await resumeCampaign(id).unwrap();
      toast.success(message);
    } catch (error) {
      toast.error(error.data.error.message);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const calculateDaysDifference = (userDate) => {
    if (userDate) {
      const currentDate = new Date();
      const diffInTime = currentDate - new Date(userDate);
      const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
      const formattedOutput = diffInDays === 1 ? "1 day" : `${diffInDays} days`;
      return formattedOutput;
    }
  };

  const id = open ? "simple-popover" : undefined;

  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#28287B",
      color: "#fff",
      boxShadow: theme.shadows[1],
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: "15.12px",
      borderRadius: 20,
      marginBottom: 0,
    },
  }));

  const [mouseEntered, setMouseEntered] = useState(false);

  const [series, setSeries] = useState([]);

  const [options, setOptions] = useState({
    chart: {
      height: 200,
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      foreColor: "#8181B0",
      fontFamily: "Plus Jakarta Sans, sans-serif",
    },

    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 2,
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
        columnWidth: "80%",
        barHeight: "70%",
        distributed: false,
        rangeBarOverlap: true,
        rangeBarGroupRows: true,
        hideZeroBarsWhenGrouped: false,
        isDumbbell: false,
        dumbbellColors: undefined,
        isFunnel: false,
        isFunnel3d: true,
        colors: {
          ranges: [
            {
              from: 0,
              to: 10,
              color: undefined,
            },
          ],
          backgroundBarColors: [],
          backgroundBarOpacity: 1,
          backgroundBarRadius: 0,
        },
        dataLabels: {
          position: "top",
          maxItems: 100,
          hideOverflowingLabels: true,
          orientation: "horizontal",
          total: {
            enabled: false,
            formatter: undefined,
            offsetX: 0,
            offsetY: 0,
            style: {
              color: "#8181B0",
              fontSize: "12px",
              fontFamily: undefined,
              fontWeight: 600,
            },
          },
        },
      },
    },
    stroke: {
      show: true,
      curve: ["smooth", "smooth", "straight", "smooth", "straight", "straight"],
      lineCap: "round",
      colors: undefined,
      width: 2,
      dashArray: 0,
    },
    legend: {
      markers: {
        width: 5,
        height: 5,
        shape: "circle",
        size: 5,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 2,
      },
    },
    labels: [],
    markers: {
      size: 0,
    },
    grid: {
      show: true,
      borderColor: "#E6E6E6",
      strokeDashArray: 4,
      position: "back",
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      row: {
        colors: undefined,
        opacity: 0.5,
      },
      column: {
        colors: undefined,
        opacity: 0.5,
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 5,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y) {
          if (typeof y !== "undefined") {
            return y.toFixed(0);
          }
          return y;
        },
      },
    },
    fill: {
      type: "solid",
      opacity: 1,
    },
    colors: ["#6500EF", "#FF7000", "#0071F6", "#00AA38", "#FFCB4C", "#6CE6E1"],
  });

  useEffect(() => {
    const { start, end } = campaign.analytics;

    const labels = [];
    const sent = [];
    const open = [];
    const reply = [];

    const dates = generateDates(start, end);
    for (const date of dates) {
      const label = new Date(date)
        .toLocaleDateString("en-US", { month: "short", day: "numeric" })
        .split(" ");
      const data = campaign.analytics.graph.find((data) => data._id === date);
      labels.push(label);
      sent.push(data?.sent ?? 0);
      open.push(data?.open ?? 0);
      reply.push(data?.reply ?? 0);
    }

    setOptions((options) => {
      return { ...options, labels };
    });

    setSeries([
      {
        name: "Sent",
        type: "area",
        data: sent,
      },
      {
        name: "Total opens",
        type: "line",
        data: open,
      },
      {
        name: "Total Replies",
        type: "area",
        data: reply,
      },
    ]);
  }, [campaign.analytics]);

  const [deleteCampaign] = useDeleteCampaignMutation();

  const handleDeleteCampaignClick = async () => {
    setAnchorEl(null);
    onCampaignChange(true);
    const toastId = toast.loading("Deleting campaign...", { duration: Infinity });
    const { message } = await deleteCampaign(campaign._id).unwrap();
    toast.success(message, { id: toastId, duration: 2000 });
  };

  const handleInfoIconVisibility = (status, schedules = []) => {
    let message;
    const currentDate = dayjs().utc();
    for (const schedule of schedules) {
      const scheduleFrom = schedule?.From;
      const scheduleTo = schedule?.To;
      const isBetween = currentDate.isBetween(scheduleFrom, scheduleTo, null, '[)')

     if ((status === "active" && isBetween) || (status !== "active")) {
        return '';
      } else{
        message = 'Currently not working'
        continue;
      }
    }
    return message;
  }

  const statusInfo = handleInfoIconVisibility(campaign?.status, campaign?.activeSchedule);
  return (
    <>
      <Link
        to={!mouseEntered && `/campaigns/${campaign._id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0px 12px 15px 0px #4B71970D",
            pt: 0,
            backgroundColor: "#fff",
            "&:hover": {
              boxShadow: "0px 2px 7px -1px rgba(0, 0, 0, 0.25)",
            },
            transition: "all 0.2s ease-in-out",
            flexDirection: "column",
          }}
        >
          {/* <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              width: "100%",
              borderTopLeftRadius: "7px",
              borderTopRightRadius: "7px",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row-reverse",
                width: "100%",
                position: "absolute",
                top: 0,
                pt: 3,
                pb: 0,
                pr: 3,
                pl: 2,
                zIndex: 999,
              }}
            >
              {" "}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: "#f2f2f2",
                  },
                  borderRadius: 0.75,
                  p: 0.6,
                  visibility: item.status === "draft" && "hidden",
                }}
                onMouseEnter={() => {
                  setMouseEntered(true);
                }}
                onMouseLeave={() => {
                  setMouseEntered(false);
                }}
              >
                {" "}
                <Tooltip
                  title={item.status === "active" ? "Click to pause" : "Click to resume"}
                  placement="top"
                  sx={{ textAlign: "center" }}
                  arrow
                >
                  {item.status === "active" ? (
                    <IconButton onClick={() => handlePauseCampaignClick(item._id)}>
                      <PauseIcon />
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => handleResumeCampaignClick(item._id)}>
                      <PlayIcon />
                    </IconButton>
                  )}
                </Tooltip>
              </Box> 
                  </Box> 
           
          </Box>*/}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              flexDirection: "column",
              p: 3,
            }}
          >
            {" "}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  flexDirection: "column",
                }}
              >
                {" "}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "row",
                  }}
                >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#28287B",
                    lineHeight: "20.16px",

                    // maxWidth: 160,
                    // overflow: "hidden",
                    // textOverflow: "unset",
                  }}
                >
                  {campaign.name}
                </Typography>
                  {statusInfo?.length > 0 && (
                    <Tooltip 
                      title={statusInfo} 
                      enterDelay={200} leaveDelay={200}
                    >
                      <InfoOutlined 
                        color="black" 
                          style={{
                          marginLeft: 8,
                        }}
                      />
                    </Tooltip>
                  )
                }
                </Box>
                {" "}
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "16.38px",
                    color: "#8181B0",
                    mt: 1,
                  }}
                >
                  {calculateDaysDifference(campaign.createdAt)} ago &nbsp; &nbsp; &nbsp;{" "}
                  {campaign?.status === "paused" ? "Paused" : "Playing"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex" }}>
                <Box>
                  <Tooltip
                    title={
                      campaign.status === "error" && "Sending accounts has errors, or are paused"
                    }
                    placement="top"
                    arrow
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
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                          letterSpacing: "0em",
                          textTransform: "capitalize",
                          color:
                            campaign.status === "draft"
                              ? "#28287B"
                              : campaign.status === "error"
                              ? "#FD1E36"
                              : campaign.status === "active"
                              ? "#0071F6"
                              : campaign.status === "paused"
                              ? "#28287B"
                              : campaign.status === "completed"
                              ? "#00AA38"
                              : null,
                          border: "1px solid black",
                          borderColor:
                            campaign.status === "draft"
                              ? "#E4E4E5"
                              : campaign.status === "error"
                              ? "#FAD7DB"
                              : campaign.status === "active"
                              ? "#D8E7FE"
                              : campaign.status === "paused"
                              ? "#E4E4E5"
                              : campaign.status === "completed"
                              ? "#DAEFDF"
                              : null,
                          backgroundColor: "white",
                          borderRadius: 1,
                          p: 1.5,
                          py: campaign.status === "error" ? 0.5 : 1,
                        }}
                      >
                        <Box
                          sx={{
                            justifyContent: "center",
                            alignItems: "center",
                            display: campaign.status !== "error" ? "none" : "flex",
                            width: 24,
                            height: 24,
                            p: 0.5,
                          }}
                        >
                          <ErrorIcon color="red" />
                        </Box>
                        {campaign.status}
                      </Typography>{" "}
                    </Box>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 999,
                    mr: "-10px",
                    "&:hover": {
                      backgroundColor: "#f2f2f2",
                    },
                    borderRadius: 0.75,
                    p: 0.75,
                  }}
                  onClick={handleClick}
                  onMouseEnter={() => {
                    setMouseEntered(true);
                  }}
                  onMouseLeave={() => {
                    setMouseEntered(false);
                  }}
                >
                  {" "}
                  <Tooltip title="" placement="top" sx={{ textAlign: "center" }} arrow>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      {" "}
                      <VerticalMore />
                    </Box>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  "& div div .apexcharts-legend": {
                    backgroundColor: "#F2F4F6",
                    py: 1,
                    mt: 3,
                    mx: 1,
                    borderRadius: "8px",
                  },
                  "& div div .apexcharts-legend .apexcharts-legend-series .apexcharts-legend-text":
                    {
                      color: "#000",
                    },
                }}
              >
                <ReactApexChart options={options} series={series} type="line" height={240} />
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                pt: 1,
                flexWrap: "wrap",
              }}
            >
              <CustomTooltip title="Total Emails Sent" placement="top" sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "17.64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    color: "#28287B",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    {" "}
                    <Sent />
                  </Box>
                  <Box flexDirection={"column"}>
                    <Typography
                      sx={{ fontSize: "13px", fontWeight: "400", color: theme.palette.grey[500] }}
                    >
                      Sent
                    </Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: "700" }}>
                      {" "}
                      {campaign.analytics?.total?.sent ?? 0}
                    </Typography>
                  </Box>
                </Typography>
              </CustomTooltip>
              <CustomTooltip
                title="Total Emails Opened"
                placement="top"
                sx={{ textAlign: "center" }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "17.64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    color: "#28287B",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    {" "}
                    <Opened />
                  </Box>
                  <Box flexDirection={"column"}>
                    <Typography
                      sx={{ fontSize: "13px", fontWeight: "400", color: theme.palette.grey[500] }}
                    >
                      Opened
                    </Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: "700" }}>
                      {" "}
                      {campaign.analytics?.total?.open ?? 0}
                    </Typography>
                  </Box>
                </Typography>
              </CustomTooltip>
              <CustomTooltip
                title="Total Emails Replied"
                placement="top"
                sx={{ textAlign: "center" }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "17.64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    color: "#28287B",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mr: 1,
                      width: "32px",
                      height: "32px",
                    }}
                  >
                    <Replied />
                  </Box>

                  <Box flexDirection={"column"}>
                    <Typography
                      sx={{ fontSize: "13px", fontWeight: "400", color: theme.palette.grey[500] }}
                    >
                      Replied
                    </Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: "700" }}>
                      {" "}
                      {campaign.analytics?.total?.reply ?? 0}
                    </Typography>
                  </Box>
                </Typography>
              </CustomTooltip>
            </Box>
          </Box>
        </Box>
      </Link>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: 200,
            p: 1,
          }}
        >
          {/* <Button
            fullWidth
            sx={{
              py: 2,

              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#101828",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
              <DriveFileRenameOutline sx={{ mr: 1 }} fontSize="small" />
              Reconnect Account
            </Box>
          </Button> */}
          {campaign.status !== "draft" && (
            <Button
              fullWidth
              sx={{
                py: 1.5,
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                color: "#101828",
                "&:hover": {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                borderRadius: 1,
              }}
              onClick={
                campaign.status === "active"
                  ? () => handlePauseCampaignClick(campaign._id)
                  : () => handleResumeCampaignClick(campaign._id)
              }
            >
              {" "}
              <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                {campaign.status === "active" ? (
                  <PauseOutlined sx={{ mr: 1 }} fontSize="small" />
                ) : (
                  <PlayArrowOutlined sx={{ mr: 0.5 }} />
                )}
                {campaign.status === "active" ? "Pause Campaign" : "Resume Campaign"}
              </Box>
            </Button>
          )}

          <Button
            fullWidth
            sx={{
              py: 1.5,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              color: "#101828",
              "&:hover": {
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
              borderRadius: 1,
            }}
            onClick={() => setEditOpen(true)}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
              <EditOutlined sx={{ mr: 1 }} fontSize="small" />
              Rename Campaign
            </Box>
          </Button>
          <Button
            fullWidth
            sx={{
              py: 1.5,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              color: "#101828",
              "&:hover": {
                color: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
              borderRadius: 1,
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}
              onClick={handleDeleteCampaignClick}
            >
              <Delete sx={{ mr: 1 }} fontSize="small" />
              Remove Campaign
            </Box>
          </Button>
        </Box>
      </Popover>
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        sx={{
          "& .MuiPaper-root": {
            width: 300,
          },
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>Edit Campaign Name</DialogTitle>
        <IconButton
          onClick={() => setEditOpen(false)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseOutlined />
        </IconButton>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            onChange={(e) => setEditedName(e.target.value)}
            value={editedName}
            sx={{ width: "100%" }}
          />
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "center", pb: 2 }}>
          <Button onClick={handleRename} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CampaignBlock;
