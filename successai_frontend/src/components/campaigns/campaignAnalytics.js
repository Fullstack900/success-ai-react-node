import { useCallback, useEffect, useState } from "react";
import {
  AccessTime,
  CleanHands,
  CloseOutlined,
  Search,
  ErrorOutlineOutlined,
  MarkEmailReadOutlined,
  ReplyOutlined,
  DraftsOutlined,
  InfoOutlined,
  Close,
} from "@mui/icons-material";
import { TbClick } from "react-icons/tb";
import { RiReplyLine } from "react-icons/ri";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Popover,
  Tooltip,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  alpha,
  Menu,
  MenuItem,
} from "@mui/material";
import PropTypes from "prop-types";
import ReactApexChart from "react-apexcharts";
import { DropDown } from "src/assets/general/DropDown";
import { CalendarIcon } from "src/assets/general/CalendarIcon";
import { ShareIcon } from "src/assets/general/ShareIcon";
import { FilterIcon } from "src/assets/general/FilterIcon";
import { SBSearch } from "src/assets/sidebar/SBSearch";
import { Opened } from "src/assets/campaignBlock/Opened";
import { Sent } from "src/assets/campaignBlock/Sent";
import _ from "lodash";
import { Clicked } from "src/assets/campaignBlock/Clicked";
import {
  useCampaignAnalyticsGraphDataMutation,
  useCampaignAnalyticsMutation,
} from "src/services/campaign-service";
import { generateDates } from "src/utils/util.js";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { PauseIcon } from "src/assets/general/PauseIcon";
import { PlayIcon } from "src/assets/general/PlayIcon";
import { ErrorIcon } from "src/assets/general/ErrorIcon";

import { Replied } from "src/assets/campaignBlock/Replied";
import { Opportunities } from "src/assets/campaignBlock/Opportunities";
import toast from "react-hot-toast";
import LoadingButton from "@mui/lab/LoadingButton";
import { AiOutlineClose } from "react-icons/ai";
import StepsAnalyticsModal from "./stepsAnalyticsModal";
import Pagination from "src/components/Pagination";


const scrollBarStyle = {
  // width
  "&::-webkit-scrollbar": {
    width: "10px",
    height: "10px",
    borderLeft: "1px solid #E4E4E5",
    backgroundColor: "#F2F4F6",
  },

  // Track
  "&::-webkit-scrollbar-track": {
    borderRadius: "60px",
  },

  // /* Handle */
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#E4E4E5",
    borderRadius: "10px",
    border: "2px solid rgba(0, 0, 0, 0)",
    backgroundClip: "padding-box",
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
        <Box sx={{ mt: 3 }}>
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
  const is1350px = useMediaQuery(theme.breakpoints.down(1350));
  return (
    <Grid item xs={6} sm={4} md={is1350px ? 4 : 2} sx={{ width: "100%" }}>
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
          paddingTop: {xs: "15px",lg : "15px"},
          paddingBottom: {xs: "10px",sm:"15px",lg : "0px"}
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
const timelineButtons = [
  {
    name: "Past 7 days",
    value: { start: new Date().setDate(new Date().getDate() - 7), end: Date.now() },
  },
  {
    name: "Month to date",
    value: { start: new Date().setDate(1), end: Date.now() },
  },
  {
    name: "Past 4 weeks",
    value: { start: new Date().setDate(new Date().getDate() - 28), end: Date.now() },
  },
  {
    name: "Past 3 months",
    value: { start: new Date().setMonth(new Date().getMonth() - 3), end: Date.now() },
  },
  {
    name: "Past 6 months",
    value: { start: new Date().setMonth(new Date().getMonth() - 6), end: Date.now() },
  },
  {
    name: "Past 12 months",
    value: { start: new Date().setMonth(new Date().getMonth() - 12), end: Date.now() },
  },
];

const CampaignAnalytics = (props) => {
  const { campaign, handlePause, handleResume } = props;
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [value, setValue] = useState(0);
  const [timeline, setTimeline] = useState(timelineButtons[2]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [offset, setOffset] = useState(1);
  const [totalActivity, setTotalActivity] = useState(0);
  const [activity, setActivity] = useState([]);
  const [totall, setTotall] = useState(0);

  const [limit, setLimit] = useState(10);
  const [steps, setSteps] = useState([]);
  const [search, setSearch] = useState("");
  const [loader, setLoader] = useState(true);
  const [type, setType] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState(timelineButtons[2].value);
  const [isLoadingAnalytics, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [stepsAnalyticsModal, setStepsAnalyticsModal] = useState(false);
  const [stepsEmailRecord, setStepsEmailRecord] = useState([]);
  const [campaignAnalytics] = useCampaignAnalyticsMutation();
  const [page, setPage] = useState(1);
  // filter

  const [anchorEl1, setAnchorEl1] = useState(null);
  const handleClickFilter = (event) => {
    setAnchorEl1(event.currentTarget);
  };
  const handleCloseFilter = () => {
    setAnchorEl1(null);
  };
  const openFilter = Boolean(anchorEl1);
  const id1 = openFilter ? "simple-popover" : undefined;

  useEffect(() => {
    setLoader(true);
    const timer = setTimeout(async () => {
      let newOffset = 0;
      if (page !== 1) {
        newOffset = (page - 1) * limit;
      }
      const filterParams = {
        offset: newOffset,
        search,
        type: type,
        limit: limit
      };
      const { campaignActivity, stepsAnalytics } = await campaignAnalytics({
        id: campaign._id,
        params: filterParams,
      }).unwrap();
      setSteps(stepsAnalytics);
      setTotalActivity(campaignActivity?.total);
      setActivity(campaignActivity?.activity);
      setFilteredData(campaignActivity?.activity);
      setOffset(campaignActivity?.offset);
      setLimit(campaignActivity?.limit);
      setLoading(false);
      setLoader(false);
    }, 500);
    return () => clearTimeout(timer);
    
  }, [search, page, type, limit]);



  const handleApplyClick = () => {
    console.log(startDate.toDate(), "start date");
    const start = startDate.toDate().getTime();
    const end = endDate.toDate().getTime();
    setDateRange({ start, end });
    setAnchorEl2(null);
  };

  const calculateDaysDifference = (userDate) => {
    if (userDate) {
      const currentDate = new Date();
      const diffInTime = currentDate - new Date(userDate);
      
      const diffInMinutes = Math.floor(diffInTime / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);

      if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'}`;
      }
  
      if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'}`;
      }
  
      const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'}`;
    }
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

  const [options, setOptions] = useState({
    chart: {
      id: "campaign-analytics-chart",
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
      tickAmount: isMobile ? 6 : 12, //12
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
    noData: {
      text: "Loading...",
    },
  });

  const [dialogChartOptions, setDialogChartOptions] = useState({
    chart: {
      id: "campaign-analytics-chart-dialog",
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
    noData: {
      text: "Loading...",
    },
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
      percentage: total?.sent ? parseFloat(((total.open * 100) / total.sent).toFixed(2)) : 0,
      icon: <Opened />,
    },
    {
      label: "Links Clicked",
      value: total?.click ?? 0,
      percentage: total?.sent ? parseFloat(((total.click * 100) / total.sent).toFixed(2)) : 0,
      icon: <Clicked />,
    },
    {
      label: "Replied",
      value: total?.reply ?? 0,
      percentage: total?.sent
        ? Math.min(100, parseFloat(((total.reply * 100) / total.sent).toFixed(2)))
        : 0,
      icon: <Replied />,
    },
    {
      label: "Opportunities",
      value: total?.opportunities ?? 0,
      percentage: total?.sent
        ? parseFloat(((total.opportunities * 100) / total.sent).toFixed(2))
        : 0,
      icon: <Opportunities />,
    },
  ];

  const [getGraphData] = useCampaignAnalyticsGraphDataMutation();

  const fetchGraphData = useCallback(async () => {
    setSeries([]);
    setDialogChartSeries([]);
    const { start, end } = dateRange;
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { graph, total } = await getGraphData({
      id: campaign._id,
      params: { start, end, userTimezone },
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
    const oneDayMs = 24 * 60 * 60 * 1000;

    const dates = generateDates(start - oneDayMs, end);

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
  }, [dateRange, getGraphData, campaign._id]);

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

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(1);
  };
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };



  const open2 = Boolean(anchorEl2);
  const id2 = open2 ? "simple-popover" : undefined;
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

  const data = activity ? [...activity] : [];
  const handleFilterClick = (type) => {
    const filteredResults = data.filter((item) => {
      if (!type || item.type === type) {
        return true;
      }
      return false;
    });
    setFilteredData(filteredResults);
  };

  function handleFilterAndClick(type) {
    handleFilterClick(type);
    handleClose3();
    setType(type);
    setPage(1);
  }

  const [anchorEl3, setAnchorEl3] = useState(null);

  const handleClick3 = (event) => {
    setAnchorEl3(event.currentTarget);
  };

  const handleClose3 = () => {
    setAnchorEl3(null);
  };

  const open3 = Boolean(anchorEl3);
  const id3 = open3 ? "basic-menu" : undefined;

  const theme = useTheme();

  const handleSelectFilter = () => {
    setType("");
    setFilteredData([...activity]);
  };

  const menuItems = [
    {
      label: "Open",
      icon: (active) => <DraftsOutlined sx={{ color: active ? "#0071F6" : "#28287B" }} />,

      onClick: () => {
        handleFilterAndClick("open");
      },
    },
    {
      label: "Sent",
      icon: (active) => <MarkEmailReadOutlined sx={{ color: active ? "#0071F6" : "#28287B" }} />,

      onClick: () => {
        handleFilterAndClick("sent");
      },
    },
    {
      label: "Reply",
      icon: (active) => <RiReplyLine size={24} color={active ? "#0071F6" : "#28287B"} />,

      onClick: () => {
        handleFilterAndClick("reply");
      },
    },
    {
      label: "Click",
      icon: (active) => <TbClick size={24} color={active ? "#0071F6" : "#28287B"} />,
      onClick: () => {
        handleFilterAndClick("click");
      },
    },
    {
      label: "Bounce",
      icon: (active) => <ErrorOutlineOutlined sx={{ color: active ? "#0071F6" : "#28287B" }} />,

      onClick: () => {
        handleFilterAndClick("bounce");
      },
    },
  ];

  const handleInfoIconVisibility = (status, schedules = []) => {
    let message;
    const currentDate = dayjs().utc();
    for (const schedule of schedules) {
      const scheduleFrom = schedule?.From;
      const scheduleTo = schedule?.To;
      const isBetween = currentDate.isBetween(scheduleFrom, scheduleTo, null, "[)");
      if ((status === "active" && isBetween) || status !== "active") {
        return "";
      } else {
        message = "Currently not working";
        continue;
      }
    }
    return message;
  };

  const statusInfo = handleInfoIconVisibility(campaign?.status, campaign?.activeSchedule);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            boxShadow: "0px 12px 15px 0px #4B71970D",

            borderRadius: "12px",

            pt: { xs: 1, sm: 3 },
            pb: 5,
            px: 4,
            width: "100%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: "white",
          }}
        >
          <Grid container>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "space-between" },
                alignItems: { xs: "flex-start", sm: "center" },
                width: "100%",
                flexDirection: { xs: "column-reverse", sm: "row" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: { xs: "100%", sm: "fit-content" },
                  gap: 1,
                  mr: { xs: 0, sm: 1 },
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
                    // mr: 2,
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
                    // mr: 2,
                    "&:hover": {
                      backgroundColor: "#fff",
                    },
                    border: "1px solid #E4E4E5",
                    height: "36px",
                    minWidth: { xs: "36px", sm: "64px" },
                  }}
                  onClick={handleClick2}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mr: isMobile ? 0 : 1,
                    }}
                  >
                    <CalendarIcon />
                  </Box>
                  {isMobile ? "" : "Custom Range"}
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
                    px: { xs: 1.5, sm: 1.5 },
                    // mr: 2,
                    "&:hover": {
                      backgroundColor: "#fff",
                    },
                    border: "1px solid #E4E4E5",
                    height: "36px",
                    minWidth: { xs: "36px", sm: "64px" },
                  }}
                  onClick={() => {
                    setShareDialogOpen(true);
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mr: isMobile ? 0 : 0.5,
                    }}
                  >
                    <ShareIcon />
                  </Box>
                  {isMobile ? "" : "Share"}
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: { xs: "100%", sm: "fit-content" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "left",
                    alignItems: "center",
                    flexDirection: { sm: "row-reverse" },
                    width: { xs: "100%", sm: "fit-content" },
                  }}
                >
                  {" "}
                  <Tooltip
                    title={campaign?.status === "error" && campaign?.errorMsg}
                    placement="top"
                    arrow
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        mr: 2,
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
                            campaign?.status === "draft"
                              ? "#28287B"
                              : campaign?.status === "error"
                              ? "#FD1E36"
                              : campaign?.status === "active"
                              ? "#0071F6"
                              : campaign?.status === "paused"
                              ? "#28287B"
                              : campaign?.status === "completed"
                              ? "#00AA38"
                              : null,
                          border: "1px solid black",
                          borderColor:
                            campaign?.status === "draft"
                              ? "#E4E4E5"
                              : campaign?.status === "error"
                              ? "#FAD7DB"
                              : campaign?.status === "active"
                              ? "#D8E7FE"
                              : campaign?.status === "paused"
                              ? "#E4E4E5"
                              : campaign?.status === "completed"
                              ? "#DAEFDF"
                              : null,
                          backgroundColor: "white",
                          borderRadius: 1,
                          p: 1.5,
                          py: campaign?.status === "error" ? 0.5 : 1,
                        }}
                      >
                        <Box
                          sx={{
                            justifyContent: "center",
                            alignItems: "center",
                            display: campaign?.status !== "error" ? "none" : "flex",
                            width: 24,
                            height: 24,
                            p: 0.5,
                          }}
                        >
                          <ErrorIcon color="red" />
                        </Box>
                        {campaign?.status}
                      </Typography>{" "}
                    </Box>
                  </Tooltip>
                  {statusInfo?.length > 0 && (
                    <Tooltip title={statusInfo} enterDelay={200} leaveDelay={200}>
                      <InfoOutlined
                        color="black"
                        style={{
                          marginRight: 8,
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <IconButton>
                    {" "}
                    <Tooltip
                      title={campaign?.status === "active" ? "Click to pause" : "Click to resume"}
                      placement="top"
                      sx={{ textAlign: "center" }}
                      arrow
                    >
                      {campaign?.status === "active" ? (
                        <>
                          <Box
                            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                          >
                            {" "}
                            <Tooltip title="Pause" placement="top" arrow>
                              <IconButton onClick={() => handlePause(campaign?._id)}>
                                <PauseIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box
                            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                          >
                            <Tooltip title="Resume" placement="top" arrow>
                              <IconButton onClick={() => handleResume(campaign?._id)}>
                                <PlayIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </>
                      )}
                    </Tooltip>
                  </IconButton>
                  {/* <IconButton>
                    <VerticalMore />
                  </IconButton> */}
                </Box>
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 3 }}
            >
              <Box
                sx={{
                  width: "100%",
                  "& div div .apexcharts-legend": {
                    backgroundColor: "#F2F4F6",
                    mx: 2,
                    py: 1,
                    mt: 3,
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
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                paddingLeft: { xs: "16px", md: "16px" },
                marginTop: "16px"
              }}
              container
              spacing={{xs: 2, sm :0}}
              justifyContent={"space-between"}
            >
              {actionStatObj.map((action) => (
                <ActionStats item={action} />
              ))}
              
            </Grid>
          </Grid>
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
              mt: 3,
              boxShadow: "0px 12px 15px 0px #4B71970D",
              borderRadius: "12px",
              backgroundColor: "white",
              width: "100%",
              mb: 4,
              p: 3,
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
              }}
            >
              <Grid item xs={6}>
                <Button
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
                    py: 1,
                  }}
                  onClick={() => {
                    setValue(0);
                  }}
                >
                  Step analytics
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
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
                    py: 1,
                  }}
                  onClick={() => {
                    setValue(1);
                  }}
                >
                  Activity history
                </Button>
              </Grid>
            </Grid>

            <CustomTabPanel value={value} index={0}>
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: "8px",
                  border: "1px solid #E4E4E5",
                  maxHeight: "80vh",
                  ...scrollBarStyle,
                }}
              >
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Step</TableCell>
                      <TableCell align="center">Sent</TableCell>
                      <TableCell align="center">Opened</TableCell>
                      <TableCell align="center">Link Clicked</TableCell>
                      <TableCell align="center">Replied</TableCell>
                      <TableCell align="center">Opportunities</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {steps?.map((row) => (

                      <TableRow
                        key={row._id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setStepsAnalyticsModal(true);
                          setStepsEmailRecord(row.dates);
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row._id}
                        </TableCell>
                        <TableCell align="center">{row.sent}</TableCell>
                        <TableCell align="center">
                          {row.dates?.reduce((total, obj) => total + obj.opened, 0)}
                        </TableCell>
                        <TableCell align="center">
                          {row.dates?.reduce((total, obj) => total + obj.link_clicked, 0)}
                        </TableCell>
                        <TableCell align="center">
                          {row.dates?.reduce((total, obj) => total + obj.replied, 0)}
                        </TableCell>
                        <TableCell align="center">
                          {row.dates?.reduce((total, obj) => total + obj.opportunities, 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  mt: 1,
                  mb: 2,
                  flexDirection: { xs: "column", sm: "row" },
                  rowGap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: { xs: "100%", sm: "fit-content" },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "18px",
                      letterSpacing: "0px",
                      color: "#28287B",
                    }}
                  >
                    Last 90 days
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {type && (
                      <Button
                        sx={{
                          display: { xs: "flex", sm: "none" },
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16.38px",
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),

                          "&:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            // boxShadow: 10,
                          },

                          height: "36px",
                          py: 1.5,
                          px: 2,
                        }}
                        onClick={handleSelectFilter}
                      >
                        {type}
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
                        display: { xs: "flex", sm: "none" },
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        lineHeight: "16.38px",
                        color: "#28287B",
                        backgroundColor: "white",

                        "&:hover": {
                          backgroundColor: "white",
                        },
                        border: false ? "1px solid #0071F6" : "1px solid #E4E4E5",
                        height: "36px",
                        py: 1.5,
                        px: 2,
                      }}
                      onClick={handleClick3}
                      id="basic-button"
                      aria-controls={open ? "basic-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mr: 1,
                        }}
                      >
                        <FilterIcon />
                      </Box>

                      {false ? <>{/* Filter: {filter.name} */}</> : "Filter"}
                    </Button>
                    <Menu
                      id={id3}
                      anchorEl={anchorEl3}
                      open={open3}
                      onClose={handleClose3}
                      MenuListProps={{
                        "aria-labelledby": "basic-button",
                      }}
                    >
                      {menuItems.map((menuItem, index) => (
                        <MenuItem
                          key={index}
                          onClick={menuItem.onClick}
                          sx={{
                            py: 1,
                            px: 3,
                            mx: 1,
                            borderRadius: 2,
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            color: "#101828",
                            fontSize: "13px",
                            backgroundColor: type === menuItem.label.toLowerCase() && "#F2F4F6",
                          }}
                        >
                          {menuItem.icon(type === menuItem.label.toLowerCase())}
                          <Typography
                            sx={{
                              color: type === menuItem.label.toLowerCase() ? "#0071F6" : "#28287B",
                              fontSize: "13px",
                              fontWeight: 700,
                              linHeight: "16px",
                              letterSpacing: "0px",
                              ml: 2,
                            }}
                          >
                            {menuItem.label}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: { xs: "100%", sm: "fit-content" },
                  }}
                >
                  {type && (
                    <Button
                      sx={{
                        display: { xs: "none", sm: "flex" },
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

                        height: "36px",
                        py: 1.5,
                        px: 2,
                      }}
                      onClick={handleSelectFilter}
                    >
                      {type}
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
                      display: { xs: "none", sm: "flex" },
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      lineHeight: "16.38px",
                      color: "#28287B",
                      backgroundColor: "white",
                      mr: 2,
                      "&:hover": {
                        backgroundColor: "white",
                      },
                      border: false ? "1px solid #0071F6" : "1px solid #E4E4E5",
                      height: "36px",
                      py: 1.5,
                      px: 2,
                    }}
                    onClick={handleClick3}
                    id="basic-button"
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mr: 1,
                      }}
                    >
                      <FilterIcon />
                    </Box>

                    {false ? <>{/* Filter: {filter.name} */}</> : "Filter"}
                  </Button>
                  <Menu
                    id={id3}
                    anchorEl={anchorEl3}
                    open={open3}
                    onClose={handleClose3}
                    MenuListProps={{
                      "aria-labelledby": "basic-button",
                    }}
                  >
                    {menuItems.map((menuItem, index) => (
                      <MenuItem
                        key={index}
                        onClick={menuItem.onClick}
                        sx={{
                          py: 1,
                          px: 3,
                          mx: 1,
                          borderRadius: 2,
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          color: "#101828",
                          fontSize: "13px",
                          backgroundColor: type === menuItem.label.toLowerCase() && "#F2F4F6",
                        }}
                      >
                        {menuItem.icon(type === menuItem.label.toLowerCase())}
                        <Typography
                          sx={{
                            color: type === menuItem.label.toLowerCase() ? "#0071F6" : "#28287B",
                            fontSize: "13px",
                            fontWeight: 700,
                            linHeight: "16px",
                            letterSpacing: "0px",
                            ml: 2,
                          }}
                        >
                          {menuItem.label}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Menu>

                  <TextField
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton sx={{ width: 32, height: 32 }}>
                            <SBSearch color="rgba(40, 40, 123, 0.5)" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    sx={{
                      width: { xs: "100%", sm: 212 },
                      height: 36,
                      backgroundColor: "white",
                      "& div": { pl: 0.3 },
                      "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                      "& div input": {
                        py: 1.3,
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "16px",
                        letterSpacing: "0em",
                        "&::placeholder": {
                          color: "rgba(40, 40, 123, 0.5)",
                        },
                      },
                      // boxShadow: 10,
                    }}
                    placeholder="Search by email"
                    value={search}
                    onChange={handleSearchChange}
                  />
                </Box>
              </Box>
              <Box sx={{ overflowX: "auto", width: "100%" }}>
                {loader ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <CircularProgress size={10} thickness={5} />
                    <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#4e88e6", ml: 2 }}>
                      Loading...
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer
                      component={Paper}
                      sx={{
                        borderRadius: "8px",
                        border: "1px solid #E4E4E5",
                        maxHeight: "80vh",
                        ...scrollBarStyle,
                      }}
                    >
                      <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableBody>
                          {filteredData?.map((item, i) => (
                            <TableRow
                              key={item._id}
                              sx={{
                                "&:last-child td, &:last-child th": { border: 0 },
                                borderLeft: 0,
                                borderRight: 0,
                                borderTop: i === 0 && 0,
                                borderBottom: i === activity?.length - 1 && 0,
                              }}
                            >
                              <TableCell component="th" scope="row">
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    {item.type === "open" ? (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Opened />
                                      </Box>
                                    ) : (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Sent />
                                      </Box>
                                    )}
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                      justifyContent: "space-between",
                                      ml: 2,
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
                                      {item.type}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 400,
                                        lineHeight: "16px",
                                        letterSpacing: "0em",
                                        color: "#8181B0",
                                        textOverflow: "ellipsis",
                                        maxWidth: "20ch",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        mt: 0.5,
                                      }}
                                    >
                                      {item?.toAccount?.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                {" "}
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",

                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    color: "#28287B",
                                    textAlign: "left",
                                  }}
                                >
                                  {item.leads.email}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <AccessTime fontSize="small" sx={{ color: "#28287B" }} />
                                  <Typography
                                    sx={{
                                      fontSize: "13px",
                                      fontWeight: 500,
                                      lineHeight: "16px",
                                      letterSpacing: "0em",
                                      minWidth: "100px",
                                      color: "#28287B",
                                      textAlign: "left",
                                      ml: 1,
                                    }}
                                  >
                                    {calculateDaysDifference(item.createdAt)} ago
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                {" "}
                                <Typography
                                  sx={{
                                    minWidth: "50px",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#28287B",
                                    textAlign: "left",
                                  }}
                                >
                                  Step {item.sequence_step}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                  </>
                )}
              </Box>
              {Math.ceil(totalActivity / limit) > 0 && (
                <Grid
                  item
                  xs={12}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 5 }}
                >
                  <Pagination
                    page={page}
                    setPage={setPage}
                    total={totalActivity}
                    length={50}
                    limit={limit}
                    handleLimitChange={handleLimitChange}
                  />
             </Grid>
              )}
            </CustomTabPanel>
          </Box>
        )}
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
            onClick={() => downloadChart("campaign-analytics-chart")}
            variant="contained"
            loading={downloading}
            loadingIndicator="Downloading"
          >
            Download
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <StepsAnalyticsModal
        stepsAnalyticsModal={stepsAnalyticsModal}
        setStepsAnalyticsModal={setStepsAnalyticsModal}
        stepsEmailRecord={stepsEmailRecord}
        scrollBarStyle={scrollBarStyle}
      />

    </>
  );
};

export default CampaignAnalytics;
