import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Popover,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { campaignData } from "src/assets/data";
import PropTypes from "prop-types";
import { DataGrid } from "@mui/x-data-grid";
import ReactApexChart from "react-apexcharts";
import { DropDown } from "src/assets/general/DropDown";
import { CalendarIcon } from "src/assets/general/CalendarIcon";
import { ShareIcon } from "src/assets/general/ShareIcon";
import { FilterIcon } from "src/assets/general/FilterIcon";
import { makeStyles, useTheme } from "@mui/styles";
import {
  useGetAccountAnalyticsMutation,
  useAnalyticsMutation,
} from "src/services/campaign-service";
import { generateDates } from "src/utils/util.js";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PlayIcon } from "src/assets/general/PlayIcon";
import { PauseIcon } from "src/assets/general/PauseIcon";
import { CompletedIcon } from "src/assets/general/CompletedIcon";
import { AiOutlineClose } from "react-icons/ai";
import { alpha } from "@material-ui/core";

import { Replied } from "src/assets/campaignBlock/Replied";
import { Opportunities } from "src/assets/campaignBlock/Opportunities";
import { Opened } from "src/assets/campaignBlock/Opened";
import { Sent } from "src/assets/campaignBlock/Sent";
import { Clicked } from "src/assets/campaignBlock/Clicked";
import _ from "lodash";
import toast from "react-hot-toast";
import LoadingButton from "@mui/lab/LoadingButton";
import { CloseOutlined } from "@mui/icons-material";

const columnsCampaign = [
  { field: "campaign_name", headerName: "Campaign", width: 170 },
  { field: "campaign_status", headerName: "Status", width: 170 },
  { field: "sent", headerName: "Contacted", width: 170 },
  { field: "opened", headerName: "Opened", width: 170 },
  { field: "link_clicked", headerName: "Links Clicked", width: 170 },
  { field: "replied", headerName: "Replied", width: 170 },
  { field: "opportunities", headerName: "Opportunities", width: 170 },
];

const columnsAccount = [
  { field: "email", headerName: "Sending account", width: 216 },
  { field: "sent", headerName: "contacted", width: 216 },
  { field: "opened", headerName: "opened", width: 216 },
  { field: "replied", headerName: "replied", width: 216 },
  { field: "score", headerName: "Combined score", width: 216 },
];

const scrollBarStyle = {
  // width
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },

  // Track
  "&::-webkit-scrollbar-track": {
    borderRadius: "60px",
    width: "4px",
    backgroundColor: "#F2F4F6",
  },

  // /* Handle */
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#E4E4E5",
    borderRadius: "10px",
    border: "1px solid rgba(0, 0, 0, 0)",
    // backgroundClip: "padding-box",
  },

  // /* Handle on hover */
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#d5d5d5",
  },
};

function CustomTabPanel(props) {
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
        <Box sx={{ p: 3, px: 0 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
const ActionStats = ({ item }) => {
  const theme = useTheme();
  return (
    <Grid item xs={6} sm={3} md={2.4} sx={{ width: "100%" }}>
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 700,
          lineHeight: "17.64px",
          display: "flex",
          alignItems: "center",
          // mx: 2,
          justifyContent: "flex-start",
          // width: "5ch",
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
          {" "}
          {item.icon}
        </Box>
        <Box flexDirection={"column"}>
          <Typography sx={{ fontSize: "13px", fontWeight: "400", color: theme.palette.grey[500] }}>
            {item.label}
          </Typography>

          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 0.5,
            }}
          >
            {" "}
            {item.value}
            {item.percentage !== null && (
              <Typography
                sx={{ fontSize: "13px", fontWeight: "700", color: theme.palette.grey[600] }}
              >
                ({item.percentage} %)
              </Typography>
            )}
          </Typography>
        </Box>
      </Typography>
    </Grid>
  );
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  customDataGrid: {
    "& .MuiDataGrid-root": {
      backgroundColor: "#fff",
      border: "1px solid #E4E4E5",
    },
    "& .MuiDataGrid-columnHeader": {
      backgroundColor: "#F2F4F6",
      fontSize: "13px",
      fontWeight: 500,
      lineHeight: "16px",
      letterSpacing: "0em",
      color: "#28287B",
      borderBottom: `1px solid #E4E4E5`,
    },
    "& .MuiDataGrid-row": {
      border: `1px solid #E4E4E5`,
    },
    "& .MuiDataGrid-cell": {
      padding: "8px",
    },
  },
}));

const filterButtons = [
  {
    name: "Active Status",
    value: "active",
    icon: (active) => <PlayIcon color={active ? "#0071F6" : "#28287B"} />,
  },

  {
    name: "On Pause",
    value: "paused",
    icon: (active) => <PauseIcon color={active ? "#0071F6" : "#28287B"} />,
  },

  {
    name: "Completed",
    value: "completed",
    icon: (active) => <CompletedIcon color={active ? "#0071F6" : "#28287B"} />,
  },
];

const timelineButtons = [
  {
    name: "Last 7 days",
    value: { start: new Date().setDate(new Date().getDate() - 7), end: Date.now() },
  },
  {
    name: "Month to date",
    value: { start: new Date().setDate(1), end: Date.now() },
  },
  {
    name: "Last 4 weeks",
    value: { start: new Date().setDate(new Date().getDate() - 28), end: Date.now() },
  },
  {
    name: "Last 3 months",
    value: { start: new Date().setMonth(new Date().getMonth() - 3), end: Date.now() },
  },
  {
    name: "Last 6 months",
    value: { start: new Date().setMonth(new Date().getMonth() - 6), end: Date.now() },
  },
  {
    name: "Last 12 months",
    value: { start: new Date().setMonth(new Date().getMonth() - 12), end: Date.now() },
  },
];

const Page = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [value, setValue] = useState(0);
  const [timeline, setTimeline] = useState(timelineButtons[2]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateRange, setDateRange] = useState(timelineButtons[2].value);
  const [filter, setFilter] = useState(null);
  const [campaignAnalyticsData, setCampaignAnalyticsData] = useState([]);
  const [accountAnalyticsData, setAccountAnalyticsData] = useState([]);
  const [analytics, { isLoading: isLoadingAnalytics }] = useAnalyticsMutation();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handleSelectFilter = (filter) => {
    setFilter(filter);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { campaignAnalytics, accountAnalytics } = await analytics({
        filter: filter?.value,
      }).unwrap();
      setCampaignAnalyticsData(campaignAnalytics);
      setAccountAnalyticsData(accountAnalytics);
    }, 500);
    return () => clearTimeout(timer);
  }, [filter, analytics]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const createSeries = ({ sent, open, uniqueOpen, reply, click, uniqueClick }) => [
    {
      name: "Sent",
      type: "bar",
      data: sent,
    },
    {
      name: "Opens",
      type: "bar",
      data: open,
    },
    {
      name: "Unique Opens",
      type: "bar",
      data: uniqueOpen,
    },
    {
      name: "Replies",
      type: "line",
      data: reply,
    },
    {
      name: "Clicks",
      type: "line",
      data: click,
    },
    {
      name: "Unique Clicks",
      type: "line",
      data: uniqueClick,
    },
  ];

  const [series, setSeries] = useState([]);
  const [dialogChartseries, setDialogChartSeries] = useState([]);
  const [dialogChartOptions, setDialogChartOptions] = useState({
    chart: {
      id: "analytics-chart-dialog",
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
    xaxis: {
      tickAmount: 6, //12
      labels: {
        rotate: 0,
      },
    },
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
        left: 0,
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
  const [options, setOptions] = useState({
    chart: {
      id: "analytics-chart",
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
        columnWidth: "40%",
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
    xaxis: {
      tickAmount: isMobile ? 6 : 12, // 12
    },
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
    setOptions({
      ...options,
      xaxis: {
        tickAmount: isMobile ? 6 : 12, // 12
      },
    });
  }, [isMobile]);

  const [total, setTotal] = useState({
    sent: 0,
    open: 0,
    reply: 0,
    click: 0,
    opportunities: 0,
  });
  const actionStatObj = [
    {
      label: "Contacted",
      value: total?.sent ?? 0,
      percentage: null,
      icon: <Sent />,
    },
    {
      label: "Opened",
      value: total?.open ?? 0,
      percentage: total?.sent ? Math.trunc((total.open * 100) / total.sent) : 0,
      icon: <Opened />,
    },
    {
      label: "Links Clicked",
      value: total?.click ?? 0,
      percentage: total?.sent ? Math.trunc((total.click * 100) / total.sent) : 0,
      icon: <Clicked />,
    },
    {
      label: "Replied",
      value: total?.reply ?? 0,
      percentage: total?.sent ? Math.trunc((total.reply * 100) / total.sent) : 0,
      icon: <Replied />,
    },
    {
      label: "Opportunities",
      value: total?.opportunities ?? 0,
      percentage: total?.sent ? Math.trunc((total.opportunities * 100) / total.sent) : 0,
      icon: <Opportunities />,
    },
  ];

  const getRowId = (row) => row._id;

  const [getAccountAnalytics] = useGetAccountAnalyticsMutation();

  const fetchGraphData = useCallback(async () => {
    setSeries([]);
    setDialogChartSeries([]);
    const { start, end } = dateRange;
    const { graph, total } = await getAccountAnalytics({
      start,
      end,
      filter: filter?.value,
    }).unwrap();

    setTotal(total);

    const labels = [];
    const dialogChartLabels = [];
    const sent = [];
    const open = [];
    const uniqueOpen = [];
    const reply = [];
    const click = [];
    const uniqueClick = [];

    const dates = generateDates(start, end);

    for (const date of dates) {
      const label = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const data = graph.find((data) => data._id === date);
      labels.push(label);
      dialogChartLabels.push(label.split(" "));
      sent.push(data?.sent ?? 0);
      open.push(data?.open ?? 0);
      uniqueOpen.push(data?.uniqueOpen ?? 0);
      reply.push(data?.reply ?? 0);
      click.push(data?.click ?? 0);
      uniqueClick.push(data?.uniqueClick ?? 0);
    }

    setOptions((options) => {
      return { ...options, labels };
    });
    setDialogChartOptions((options) => {
      return { ...options, labels: dialogChartLabels };
    });
    setSeries(createSeries({ sent, open, uniqueOpen, reply, click, uniqueClick }));
    setDialogChartSeries(createSeries({ sent, open, uniqueOpen, reply, click, uniqueClick }));
  }, [dateRange, filter, getAccountAnalytics]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const open2 = Boolean(anchorEl2);
  const id2 = open2 ? "simple-popover" : undefined;

  const handleApplyClick = () => {
    // old logic
    // const start = startDate.toDate().getTime(); // add 19800000 to get IST
    // const end = endDate.toDate().getTime();

    //Date, month, year of start date
    const startMonth = startDate.toDate().getMonth() + 1;
    const startDateNum = startDate.toDate().getDate();
    const startYear = startDate.toDate().getFullYear();

    //Date, month, year of end date
    const endMonth = endDate.toDate().getMonth() + 1;
    const endDateNum = endDate.toDate().getDate();
    const endYear = endDate.toDate().getFullYear();

    // formatted date strings
    const startDateString = `${startYear}-${startMonth < 10 ? "0" + startMonth : startMonth}-${
      startDateNum < 10 ? "0" + startDateNum : startDateNum
    }`;
    const endDateString = `${endYear}-${endMonth < 10 ? "0" + endMonth : endMonth}-${
      endDateNum < 10 ? "0" + endDateNum : endDateNum
    }`;

    // date to milliseconds
    const start = new Date(startDateString).getTime();
    const end = new Date(endDateString).getTime();

    setDateRange({ start, end });
    setAnchorEl2(null);
  };

  const [anchorEl3, setAnchorEl3] = useState(null);
  const handleClick3 = (event) => {
    setAnchorEl3(event.currentTarget);
  };
  const handleClose3 = () => {
    setAnchorEl3(null);
  };
  const open3 = Boolean(anchorEl3);
  const id3 = open3 ? "simple-popover" : undefined;

  const [downloading, setDownloading] = useState(false);

  const downloadChart = async (chartId) => {
    setDownloading(true);
    try {
      const chartInstance = window.Apex._chartInstances.find((chart) => chart.id === chartId);

      const base64 = await chartInstance.chart.dataURI();

      const downloadLink = document.createElement("a");
      downloadLink.href = base64.imgURI;
      downloadLink.download = "image.png";

      document.body.appendChild(downloadLink);

      downloadLink.click();

      document.body.removeChild(downloadLink);

      setTimeout(() => {
        setDownloading(false);
        toast.success("Chart downloaded!");
      }, 2000);
    } catch (err) {
      setDownloading(false);
      toast.error("Downloading failed!");
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: "90%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
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
            <Typography
              sx={{
                color: "#28287B",
                fontSize: "32px",
                fontWeight: 700,
                lineHeight: "40px",
                letterSpacing: "0px",
              }}
            >
              Analytics
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: { xs: "center", sm: "space-between" },
              alignItems: { xs: "flex-start", sm: "center" },
              borderRadius: 1,
              width: "100%",
              mt: 2,
              rowGap: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "space-between", sm: "center" },
                alignItems: "center",
                width: { xs: "100%", sm: "fit-content" },
              }}
            >
              <Button
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "left",
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: "16.38px",
                  color: "#28287B",
                  backgroundColor: "#fff",
                  px: 1.5,
                  mr: 2,
                  "&:hover": {
                    backgroundColor: "#fff",
                  },
                  border: "1px solid #E4E4E5",
                  height: "36px",
                }}
                onClick={handleClick}
              >
                {timeline?.name}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    ml: 1,
                  }}
                >
                  <DropDown />
                </Box>
              </Button>
              <Button
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "left",
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: "16.38px",
                  color: "#28287B",
                  backgroundColor: "#fff",
                  px: 1.5,
                  mr: { xs: 0, sm: 2 },
                  "&:hover": {
                    backgroundColor: "#fff",
                  },
                  border: "1px solid #E4E4E5",
                  height: "36px",
                }}
                onClick={handleClick2}
              >
                <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                >
                  <CalendarIcon />
                </Box>
                Custom Range
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row-reverse", sm: "row" },
                justifyContent: { xs: "space-between", sm: "center" },
                alignItems: "center",
                width: { xs: "100%", sm: "fit-content" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {filter && (
                  // <Box>
                  //   {/* <Tooltip title="Remove Filters" placement="top" arrow>
                  //   <IconButton sx={{}} onClick={() => handleSelectFilter(null)}>
                  //     <DeleteIcon />
                  //   </IconButton>
                  // </Tooltip> */}
                  //   <Button startIcon={<DeleteIcon />} onClick={() => handleSelectFilter(null)}>
                  //     {filter.name}
                  //   </Button>
                  // </Box>
                  <Button
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      lineHeight: "16.38px",
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),

                      mr: 2,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        // boxShadow: 10,
                      },

                      height: "40px",
                      px: 2,
                    }}
                    onClick={() => handleSelectFilter(null)}
                  >
                    {filter.name}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        ml: 1,
                      }}
                    >
                      <AiOutlineClose />
                    </Box>
                  </Button>
                )}
                <Button
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "13px",
                    fontWeight: 700,
                    lineHeight: "16.38px",
                    color: "#28287B",
                    backgroundColor: "white",
                    mr: { xs: 0, sm: 2 },
                    "&:hover": {
                      backgroundColor: "white",
                    },
                    border: filter ? "1px solid #0071F6" : "1px solid #E4E4E5",
                    height: "40px",
                    px: 2,
                  }}
                  onClick={handleClick3}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <FilterIcon />
                  </Box>
                  Filter
                </Button>
              </Box>
              <Button
                onClick={() => setShareDialogOpen(true)}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "left",
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: "16.38px",
                  color: "#28287B",
                  backgroundColor: "#fff",
                  px: 1.5,
                  mr: 2,
                  "&:hover": {
                    // boxShadow: 10,
                    backgroundColor: "#fff",
                  },
                  border: "1px solid #E4E4E5",
                  height: "36px",
                }}
                // fullWidth
              >
                <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 0.5 }}
                >
                  {" "}
                  <ShareIcon />
                </Box>
                Share
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              borderRadius: "12px",
              p: { xs: 1, sm: 3 },
              boxShadow: "0px 12px 15px 0px #4B71970D",
              width: "100%",
              mt: 3,
              backgroundColor: "#fff",
            }}
          >
            {" "}
            <Box
              sx={{
                width: "100%",
                "& div div .apexcharts-legend": {
                  backgroundColor: "#F2F4F6",
                  mx: 2,
                  py: 1,
                  mt: 10,
                  borderRadius: "8px",
                },
                "& div div .apexcharts-legend .apexcharts-legend-series .apexcharts-legend-text": {
                  color: "#000",
                },
              }}
            >
              <ReactApexChart options={options} series={series} type="line" height={292} />
            </Box>
            <Grid
              item
              xs={12}
              sx={{
                p: 2,
              }}
              container
              spacing={2}
              justifyContent={"space-between"}
            >
              {actionStatObj.map((action) => (
                <ActionStats item={action} />
              ))}
            </Grid>
            {/* <Grid
              sx={{
                px: 2,
              }}
              container
              spacing={2}
            >
              <Grid item xs={2.4} sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                    width: "100%",
                    p: 1,
                    borderRadius: "8px",
                    px: 3,
                    py: 2,
                    border: "1px solid #E4E4E5",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "20px",
                      color: "#28287B",
                      fontWeight: 700,
                      lineHeight: "25.2px",
                    }}
                  >
                    {total?.sent ?? 0}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "16.38px",
                      color: "#8181B0",
                      mt: 0.5,
                    }}
                  >
                    Total Emails Sent
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2.4} sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                    width: "100%",
                    p: 1,
                    borderRadius: "8px",
                    px: 3,
                    py: 2,
                    border: "1px solid #E4E4E5",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography
                      sx={{
                        fontSize: "20px",
                        color: "#28287B",
                        fontWeight: 700,
                        lineHeight: "25.2px",
                      }}
                    >
                      {total?.sent ? Math.trunc((total.open * 100) / total.sent) : 0}%
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "16.38px",
                      color: "#8181B0",
                      mt: 0.5,
                    }}
                  >
                    Open Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2.4} sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                    width: "100%",
                    p: 1,
                    borderRadius: "8px",
                    px: 3,
                    py: 2,
                    border: "1px solid #E4E4E5",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography
                      sx={{
                        fontSize: "20px",
                        color: "#28287B",
                        fontWeight: 700,
                        lineHeight: "25.2px",
                      }}
                    >
                      {total?.sent ? Math.trunc((total.click * 100) / total.sent) : 0}%
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "16.38px",
                      color: "#8181B0",
                      mt: 0.5,
                    }}
                  >
                    Click Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2.4} sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                    width: "100%",
                    p: 1,
                    borderRadius: "8px",
                    px: 3,
                    py: 2,
                    border: "1px solid #E4E4E5",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography
                      sx={{
                        fontSize: "20px",
                        color: "#28287B",
                        fontWeight: 700,
                        lineHeight: "25.2px",
                      }}
                    >
                      {total?.sent ? Math.trunc((total.reply * 100) / total.sent) : 0}%
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "16.38px",
                      color: "#8181B0",
                      mt: 0.5,
                    }}
                  >
                    Reply Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2.4} sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                    width: "100%",
                    p: 1,
                    borderRadius: "8px",
                    px: 3,
                    py: 2,
                    border: "1px solid #E4E4E5",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography
                      sx={{
                        fontSize: "20px",
                        color: "#28287B",
                        fontWeight: 700,
                        lineHeight: "25.2px",
                      }}
                    >
                      {total?.opportunities ?? 0}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "#8181B0",
                        fontWeight: 700,
                        ml: 0.5,
                      }}
                    >
                      ({total?.sent ? Math.trunc((total.opportunities * 100) / total.sent) : 0}%)
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "16.38px",
                      color: "#8181B0",
                      mt: 0.5,
                    }}
                  >
                    Opportunities
                  </Typography>
                </Box>
              </Grid>
            </Grid> */}
          </Box>
          {isLoadingAnalytics ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 10 }}>
              <CircularProgress size={25} thickness={5} />
              <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#4e88e6", ml: 2 }}>
                Loading...
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                boxShadow: "0px 12px 15px 0px #4B71970D",
                borderRadius: "8px",
                // pb: 5,
                // px: 4,
                // pt: 1,
                backgroundColor: "white",
                width: "100%",
                mb: 4,
                p: { xs: 1, sm: 3 },
                mt: 3,
              }}
            >
              {" "}
              <Box
                sx={{
                  width: "100%",
                  border: "1px solid rgba(228, 228, 229, 1)",
                  borderRadius: "8px",
                }}
              >
                {" "}
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                  variant="fullWidth"
                  sx={{ borderRadius: "8px" }}
                >
                  <Tab
                    label="Campaign Analytics"
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "20px",
                    }}
                    {...a11yProps(0)}
                  />
                  <Tab
                    label="Account Analytics"
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "20px",
                    }}
                    {...a11yProps(1)}
                  />
                </Tabs>
              </Box>
              {/* <Grid
                container
                sx={{
                  backgroundColor: "#F2F4F6",
                  width: "100%",
                  borderRadius: "8px",
                  p: 0.4,
                  border: "1px solid #F2F4F7",
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
                    View Campaign Analytics
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
                    View Account Analytics
                  </Button>
                </Grid>
              </Grid> */}
              <CustomTabPanel value={value} index={0}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {" "}
                  {/* <DataGrid
                    className={classes.customDataGrid}
                    rows={campaignAnalyticsData}
                    columns={columnsCampaign}
                    getRowId={getRowId}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                      },
                    }}
                    pageSizeOptions={[5, 10]}
                    // checkboxSelection
                  /> */}
                  <TableContainer
                    component={Paper}
                    //  sx={{ height: "100%", border: "1px solid #E4E4E5", ...scrollBarStyle }}
                    sx={{ maxHeight: "80vh", ...scrollBarStyle }}
                  >
                    <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell align="left">Campaign</TableCell>
                          <TableCell align="left">Status</TableCell>
                          <TableCell align="left">Contacted</TableCell>
                          <TableCell align="left">Opened</TableCell>
                          <TableCell align="left">Link Clicked</TableCell>
                          <TableCell align="left">Replied</TableCell>
                          <TableCell align="left">Opportunities</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {campaignAnalyticsData?.map((row) => (
                          <TableRow
                            key={row._id}
                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                          >
                            <TableCell
                              component="th"
                              scope="row"
                              align="left"
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: " ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.campaign_name}
                            </TableCell>
                            <TableCell align="left">{row.campaign_status}</TableCell>
                            <TableCell align="left">{row.sent}</TableCell>
                            <TableCell align="left">{row.opened}</TableCell>
                            <TableCell align="left">{row.link_clicked}</TableCell>
                            <TableCell align="left">{row.replied}</TableCell>
                            <TableCell align="left">{row.opportunities}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <Box sx={{ width: "100%", height: "100%" }}>
                  {" "}
                  {/* <DataGrid
                    className={classes.customDataGrid}
                    rows={accountAnalyticsData}
                    columns={columnsAccount}
                    getRowId={getRowId}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                      },
                    }}
                    pageSizeOptions={[5, 10]}
                    // checkboxSelection
                  /> */}
                  <TableContainer component={Paper} sx={{ maxHeight: "80vh", ...scrollBarStyle }}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell align="left">Sending account</TableCell>

                          <TableCell align="left">Contacted</TableCell>
                          <TableCell align="left">Opened</TableCell>

                          <TableCell align="left">Replied</TableCell>
                          <TableCell align="left">Combined score</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {accountAnalyticsData?.map((row) => (
                          <TableRow
                            key={row._id}
                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                          >
                            <TableCell component="th" scope="row" align="left">
                              {row.email}
                            </TableCell>

                            <TableCell align="left">{row.sent}</TableCell>
                            <TableCell align="left">{row.opened}</TableCell>

                            <TableCell align="left">{row.replied}</TableCell>
                            <TableCell align="left">{row.score}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </CustomTabPanel>
            </Box>
          )}
        </Box>
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
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{ mt: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 1.1,
            width: "200px",
          }}
        >
          {timelineButtons.map((item, i) => {
            return (
              <Button
                key={i}
                fullWidth
                sx={{
                  py: 1.1,
                  px: 2,
                  borderRadius: "5px",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  color: "#101828",
                  fontSize: "13px",
                  backgroundColor: timeline?.name === item.name && "rgb(33, 111, 237, 0.1)",
                }}
                onClick={() => {
                  setTimeline(item);
                  setDateRange(item.value);
                  setAnchorEl(null);
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                  {item.name}
                </Box>
              </Button>
            );
          })}
        </Box>
      </Popover>

      <Popover
        id={id2}
        open={open2}
        anchorEl={anchorEl2}
        onClose={handleClose2}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{ mt: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            p: 2,
            width: "fit-content",
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "18px",
              letterSpacing: "0em",
              color: "#28287B",
              mr: 2,
              mb: 1,
            }}
          >
            From:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disableFuture
              maxDate={endDate}
              value={startDate}
              onChange={(date) => setStartDate(date)}
            />
          </LocalizationProvider>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "18px",
              letterSpacing: "0em",
              color: "#28287B",
              mr: 2,
              mt: 2,
              mb: 1,
            }}
          >
            To:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disableFuture
              minDate={startDate}
              value={endDate}
              onChange={(date) => setEndDate(date)}
            />
          </LocalizationProvider>
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2 }}>
            <Button
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              disabled={!(startDate && endDate)}
              onClick={handleApplyClick}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
      <Popover
        id={id3}
        open={open3}
        anchorEl={anchorEl3}
        onClose={handleClose3}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{ mt: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 1,
            width: "200px",
          }}
        >
          {filterButtons.map((item, i) => {
            return (
              <Button
                key={i}
                fullWidth
                sx={{
                  py: 1,
                  px: 1,

                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  color: "#101828",
                  fontSize: "13px",
                  backgroundColor: filter?.name === item.name && "#F2F4F6",
                }}
                onClick={() => {
                  setFilter(item);
                  handleClose3();
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                  {item.icon(filter?.name === item.name)}
                  <Typography
                    sx={{
                      color: filter?.name === item.name ? "#0071F6" : "#28287B",
                      fontSize: "13px",
                      fontWeight: 700,
                      linHeight: "16px",
                      letterSpacing: "0px",
                      ml: 2,
                    }}
                  >
                    {item.name}
                  </Typography>
                </Box>
              </Button>
            );
          })}
        </Box>
      </Popover>
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        fullWidth
        maxWidth={"sm"}
      >
        <DialogTitle>Download Chart</DialogTitle>
        <IconButton
          sx={{ position: "absolute", top: 0, right: 0 }}
          onClick={() => setShareDialogOpen(false)}
        >
          <CloseOutlined />
        </IconButton>
        <DialogContent>
          <ReactApexChart
            options={dialogChartOptions}
            series={dialogChartseries}
            type="line"
            height={240}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setShareDialogOpen(false)}>
            Cancel
          </Button>

          <LoadingButton
            onClick={() => downloadChart("analytics-chart")}
            variant="contained"
            loading={downloading}
            loadingIndicator="Downloading"
          >
            Download
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Page;
