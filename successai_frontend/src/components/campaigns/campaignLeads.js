import { useEffect, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  useMediaQuery,
  Card,
  CardActions,
  CardContent,
  MenuItem,
  Select,
  Snackbar,
} from "@mui/material";
import { Close, Delete, Download, DriveFileMove } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { Total } from "src/assets/campaignDetailsLeads/Total";
import { Completed } from "src/assets/campaignDetailsLeads/Completed";
import { Unsubscribed } from "src/assets/campaignDetailsLeads/Unsubscribed";
import { Bounced } from "src/assets/campaignDetailsLeads/Bounced";
import { ImportIcon } from "src/assets/general/ImportIcon";
import { FilterIcon } from "src/assets/general/FilterIcon";
import { SBSearch } from "src/assets/sidebar/SBSearch";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon";
import { AllCheckboxCustomIcon } from "src/assets/general/AllCheckboxCustomIcon";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon";
import { RefreshIcon } from "src/assets/general/RefreshIcon";
import { EACloseIcon } from "src/assets/emailAccounts/EACloseIcon";
import { BulkUploadIcon } from "src/assets/campaignDetailsLeads/BulkUploadIcon";
import { ImportLeadFinderIcon } from "src/assets/campaignDetailsLeads/ImportLeadFinderIcon";
import { ManualEmailIcon } from "src/assets/campaignDetailsLeads/ManualEmailIcon";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import { Google } from "src/assets/Google";
import { ArrowLeftIconBlue } from "src/assets/emailAccounts/connect/ArrowLeftIconBlue";
import { ArrowRight } from "src/assets/general/ArrowRight";
import { useNavigate } from "react-router-dom";
import {
  useDeleteLeadsMutation,
  useGetLeadsQuery,
  useMoveToCampaignMutation,
  useUpdateLeadMutation,
} from "src/services/leads-service";
import GoogleSheetImport from "./GoogleSheetImport.js";
import ManualImport from "./ManualImport.js";
import CsvImport from "./CsvImport.js";
import {
  useGetLeadsMutation,
  useLazyGetCampaignNamesQuery,
  useGetAllLabelsQuery,
} from "src/services/campaign-service.js";
import { toast } from "react-hot-toast";
import _ from "lodash";
import { downloadCsv } from "src/utils/util.js";
import { PlayIcon } from "src/assets/general/PlayIcon.js";
import { DraftIcon } from "src/assets/general/DraftIcon.js";
import { PauseIcon } from "src/assets/general/PauseIcon.js";
import { ErrorIcon } from "react-hot-toast";
import { CompletedIcon } from "src/assets/general/CompletedIcon.js";

import { AiOutlineClose } from "react-icons/ai";
import Pagination from "../Pagination.js";

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

const filterButtons = [
  {
    name: "Contacted",
    value: "contacted",
    icon: (active) => <PlayIcon color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "Bounced",
    value: "bounced",
    icon: (active) => <DraftIcon color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "Not Contacted",
    value: "not contacted",
    icon: (active) => <PauseIcon color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "Completed",
    value: "completed",
    icon: (active) => <ErrorIcon color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "Unsubscribe",
    value: "unsubscribe",
    icon: (active) => <CompletedIcon color={active ? "#0071F6" : "#28287B"} />,
  },
];

const CampaignLeads = ({ campaign }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalfilterLead, setTotalFilterLeads] = useState(0)
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(null);
  const [updateLeads, setUpdateLeads] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [checkedAll, setCheckedAll] = useState(false);
  // pagination

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [leadCreated, setLeadCreated] = useState(false);
  const offset = leads?.length;

  // menu
  const [selectType, setSelectType] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl2(null);
  };
  const openSelectMenu = Boolean(anchorEl2);

  //
  const [getLeads, { isLoading: isLoadingLeads }] = useGetLeadsMutation();
  const [deleteLeads, { isLoading: isDeletingLeads }] = useDeleteLeadsMutation();
  const {
    data: statusLabels,
    isFetching: isLabelsLoading,
    refetch: refetchLabels,
  } = useGetAllLabelsQuery();
  const getLabelForLead = (labelId) => {
    return statusLabels?.labels?.find((label) => label._id === labelId)?.name;
  };

  const { data } = useGetLeadsQuery(campaign._id);
  const stats = data?.stats ? data.stats : [];
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (page === 1) {
      const timer = setTimeout(async () => {
        setUpdateLeads(false);
        const { docs, total, filteredLeads } = await getLeads({
          id: campaign._id,
          params: _.pickBy({ search, filter: filter?.value, offset: 0, limit }),
        }).unwrap();
        setLeads(docs);
        setTotalLeads(total);
        setTotalFilterLeads(filteredLeads)
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [campaign._id, search, filter, updateLeads, getLeads, leadCreated, page, limit]);
  useEffect(() => {
    if (offset < totalLeads && page > 1) {
      const timer = setTimeout(async () => {
        setUpdateLeads(false);
        const { docs, total } = await getLeads({
          id: campaign._id,
          params: _.pickBy({ search, filter: filter?.value, offset: offset * (page - 1), limit }),
        }).unwrap();
        setLeads(docs);
        setTotalLeads(total);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [page, search, filter]);

  useEffect(() => {
    if (leadCreated) {
      const timer = setTimeout(async () => {
        setUpdateLeads(false);
        const { docs, total } = await getLeads({
          id: campaign._id,
          params: _.pickBy({ search, filter: filter?.value, offset: 0, limit }),
        }).unwrap();
        setLeads(docs);
        setTotalLeads(total);
      }, 500);
      setPage(1);
      setLeadCreated(false);
      return () => clearTimeout(timer);
    }
  }, [leadCreated]);

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(1);
  };
  // const handleLoadMoreClick = async () => {
  //   const { docs, total } = await getLeads({
  //     id: campaign._id,
  //     params: { offset: leads.length },
  //   }).unwrap();
  //   setLeads([...leads, ...docs]);
  //   setTotalLeads(total);
  // };

  const onLeadsCreate = (createdLeads) => {
    if (createdLeads) setLeadCreated(true);
    setActiveStep(0);
    setIsImportLeadsDialogOpen(false);
  };

  const handleSelectLeadChange = (id, checked) => {
    const updatedSelectedLeads = [...selectedLeads];
    if (checked) {
      updatedSelectedLeads.push(id);
    } else {
      if (checkedAll) {
        setCheckedAll(false);
        setSelectType(null);
      }
      const index = selectedLeads.indexOf(id);
      updatedSelectedLeads.splice(index, 1);
    }
    setSelectedLeads(updatedSelectedLeads);
  };

  const handleSelectAllLeadsChange = async (checked, type) => {
    if (checked) {
      setSelectType(type);
      setCheckedAll(true);
      if (type === "all") {
        setAnchorEl2(null);
        const { docs } = await getLeads({
          id: campaign._id,
          params: _.pickBy({ search, filter: filter?.value, offset: 0, limit: totalLeads }),
        }).unwrap();
        setSelectedLeads(docs.map((lead) => lead._id));
      } else {
        setSelectedLeads(leads.map((lead) => lead._id));
      }
    } else {
      setSelectedLeads([]);
      setCheckedAll(false);
      setSelectType(null);
    }
  };

  const handleDeleteClick = async () => {
    const { message } = await deleteLeads({ leads: selectedLeads }).unwrap();
    toast.success(message);

    // const updatedLeads = leads.filter((lead) => !selectedLeads.includes(lead._id));
    // setLeads(updatedLeads);
    // setSelectedLeads([]);
    // setTotalLeads(totalLeads - selectedLeads.length);

    if (selectType === "all") {
      setLeads([]);
      setSelectedLeads([]);
      setCheckedAll(false);
      setSelectType(null);
      setTotalLeads(0);
    } else {
      let offset = 0;
      let pageNum = page;
      const pageCount = Math.ceil((totalLeads - selectedLeads.length) / limit);
      if (selectType === "page") {
        // offset = page > 1 ? limit * (page - 2) : limit * (page - 1);
        offset = limit * (page - 1);
        pageNum = page > 1 ? (page > pageCount ? page - 1 : page) : 1;
      } else {
        offset = limit * (page - 1);
        pageNum =
          selectedLeads.length === leads?.length
            ? page > 1
              ? page > pageCount
                ? page - 1
                : page
              : 1
            : page;
      }
      if (page === pageNum) {
        const { docs, total } = await getLeads({
          id: campaign._id,
          params: _.pickBy({ search, filter: filter?.value, offset, limit }),
        }).unwrap();

        setLeads(docs);
        setSelectedLeads([]);
        setCheckedAll(false);
        setSelectType(null);
        setTotalLeads(total);
      } else {
        setPage(pageNum);
        setSelectedLeads([]);
        setCheckedAll(false);
        setSelectType(null);
      }
    }
  };

  const handleDownloadLeadsClick = async () => {
    const { docs } = await getLeads({
      id: campaign._id,
      params: _.pickBy({ search, filter: filter?.value, offset: 0, limit: totalLeads }),
    }).unwrap();
    const data = selectedLeads.map((id) => {
      const lead = docs.find((lead) => lead._id === id);
      return _.pick(lead, [
        "firstName",
        "lastName",
        "email",
        "title",
        "companyName",
        "website",
        "location",
        "phone",
        "iceBreaker"
      ]);
    });
    downloadCsv("Leads", data);
  };

  // move to Campaign
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isMoveToCampaignDialogOpen, setIsMoveToCampaignDialogOpen] = useState(false);

  const [fetchCampaignNames, { data: campaignNames }] = useLazyGetCampaignNamesQuery();
  const [moveToCampaign, { isLoading: isMovingToCampaign }] = useMoveToCampaignMutation();

  const handleMoveToCampaignClick = () => {
    fetchCampaignNames();
    setIsMoveToCampaignDialogOpen(true);
  };

  function getInitials(firstName = "", lastName = "") {
    const firstInitial = firstName?.substring(0, 1).toUpperCase();
    const lastInitial = lastName?.substring(0, 1).toUpperCase();

    return `${firstInitial}${lastInitial}`;
  }

  const handleMoveToCampaignDialogSave = async () => {
    setIsMoveToCampaignDialogOpen(false);
    const { message } = await moveToCampaign({
      id: selectedCampaign,
      data: { leads: selectedLeads },
    }).unwrap();
    toast.success(message);
    const updatedLeads = leads.filter((lead) => !selectedLeads.includes(lead._id));
    setLeads(updatedLeads);
    setSelectedLeads([]);
    setTotalLeads(totalLeads - selectedLeads.length);
  };

  const handleMoveToCampaignDialogClose = () => {
    setIsMoveToCampaignDialogOpen(false);
  };

  const [isImportLeadsDialogOpen, setIsImportLeadsDialogOpen] = useState(false);

  const handleClickOpenImportLeadsDialog = () => {
    setIsImportLeadsDialogOpen(true);
  };

  const handleCloseOpenImportLeadsDialog = () => {
    setIsImportLeadsDialogOpen(false);
    setActiveStep(0);
  };

  const [activeStep, setActiveStep] = useState(0);
  const [leadEdit, setLeadEdit] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [iceBreaker, setIceBreaker] = useState("")
  const initField = {
    variableTitle: "",
    variableValue: "",
  };
  const [addFieldVariable, setAddFieldVariable] = useState(initField);
  const [showModal, setShowModal] = useState(false);
  const [variable, setVariable] = useState("Custom Variables");
  const [openLeadsDetailsDialog, setOpenLeadsDetailsDialog] = useState(false);
  const [updateLead, { isLoading: isLeadUpdating }] = useUpdateLeadMutation();
  const [lead, setLead] = useState(null);
  const handleClickOpenLeadsDetailsDialog = (value) => {
    const lead = leads.find((lead) => lead._id === value);
    setLeadEdit(lead);
    setFirstName(lead?.firstName);
    setEmail(lead?.email);
    setLastName(lead?.lastName);
    setCompanyName(lead.companyName);
    setTitle(lead?.title);
    setLocation(lead?.location);
    setWebsite(lead?.website);
    setIceBreaker(lead?.iceBreaker)
    setOpenLeadsDetailsDialog(true);
    setLead(lead);
  };

  const handleCloseLeadsDetailsDialog = () => {
    setLeadEdit([]);
    setFirstName("");
    setEmail("");
    setLastName("");
    setCompanyName("");
    setTitle("");
    setLocation("");
    setWebsite("");
    setIceBreaker("")
    setOpenLeadsDetailsDialog(false);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setAddFieldVariable({ ...addFieldVariable, [e.target.name]: e.target.value });
  };

  const handleChangeField = (event, index) => {
    const updatedVariables = [...lead.variables];
    updatedVariables[index] = {
      ...updatedVariables[index],
      variableValue: event.target.value,
    };
    const updatedLead = { ...lead, variables: updatedVariables };
    setLead(updatedLead);
  };

  const handelleadEdit = async () => {
    try {
      const updatedValues =
        addFieldVariable.variableTitle && addFieldVariable.variableValue ? [addFieldVariable] : [];

      const { message } = await updateLead({
        id: leadEdit._id,
        data: {
          firstName,
          email,
          lastName,
          companyName,
          location,
          title,
          website,
          iceBreaker,
          variables: [...lead.variables, ...updatedValues],
        },
      }).unwrap();
      toast.success(message);
      handleCloseLeadsDetailsDialog();
      setUpdateLeads(true);
      closeModal();
    } catch (err) {
      toast.error(err.data.error.message);
    }
  };

  const handleSelectFilter = (filter) => {
    setFilter(filter);
    setPage(1);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const openModal = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setAddFieldVariable({ variableTitle: "", variableValue: "" });
    setVariable("Custom Variables");
  };

  const handleChangeVariable = (event) => {
    setVariable(event.target.value);
  };

  const handleSelectClick = (value) => {
    setAddFieldVariable({ ...addFieldVariable, variableTitle: value });
  };

  const menuItems = [
    {
      value: "Personalization",
      label: "Personalization",
      icon: <Person2OutlinedIcon sx={{ color: "#89d2cd" }} />,
      onClick: () => handleSelectClick("Personalization"),
    },
    {
      value: "Phone",
      label: "Phone",
      icon: <PhoneAndroidIcon sx={{ color: "#5e6161" }} />,
      onClick: () => handleSelectClick("Phone"),
    },
    {
      value: "Website",
      label: "Website",
      icon: <CreditCardOutlinedIcon sx={{ color: "#a7d289" }} />,
      onClick: () => handleSelectClick("website"),
    },
    {
      value: "Custom Variables",
      label: "Custom Variables",
      icon: <DashboardCustomizeIcon sx={{ color: "#28a745" }} />,
    },
  ];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "space-between",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0px 12px 15px 0px #4B71970D",
            p: 2,
          }}
        >
          <Grid container columnSpacing={1}>
            <Grid item xs={6} sm={3} sx={{}}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  p: 1.5,

                  borderRadius: "8px",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Total />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    width: "100%",
                    ml: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "16.38px",
                      color: "#8181B0",
                    }}
                  >
                    Total Leads
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "20px",
                      color: "#28287B",
                      lineHeight: "25.2px",
                      fontWeight: 700,
                    }}
                  >
                    {totalLeads}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  p: 1.5,

                  borderRadius: "8px",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Completed />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    width: "100%",
                    ml: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "16.38px",
                      color: "#8181B0",
                    }}
                  >
                    Completed Leads
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "20px",
                      color: "#28287B",
                      lineHeight: "25.2px",
                      fontWeight: 700,
                    }}
                  >
                    {stats.completed}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} sx={{}}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  p: 1.5,

                  borderRadius: "8px",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Unsubscribed />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    width: "100%",
                    ml: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "16.38px",
                      color: "#8181B0",
                    }}
                  >
                    Unsubscribed
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "20px",
                      color: "#28287B",
                      lineHeight: "25.2px",
                      fontWeight: 700,
                    }}
                  >
                    {stats.unsubscribe}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} sx={{}}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  p: 1.5,

                  borderRadius: "8px",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Bounced />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    width: "100%",
                    ml: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "16.38px",
                      color: "#8181B0",
                    }}
                  >
                    Bounced Leads
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "20px",
                      color: "#28287B",
                      lineHeight: "25.2px",
                      fontWeight: 700,
                    }}
                  >
                    {stats.bounced}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", sm: "space-between" },
          alignItems: { xs: "flex-start", sm: "center" },
          mt: 3,
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
          <Button
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#164694",
                boxShadow: 10,
              },
              textAlign: "left",
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "18px",
              letterSpacing: "0em",
              color: "white",
              backgroundColor: "#0071F6",
              borderRadius: "8px",
              py: 1.2,
              px: 2,
              visibility: selectedLeads.length && "hidden",
            }}
            variant="outlined"
            size="large"
            onClick={handleClickOpenImportLeadsDialog}
          >
            Import
          </Button>
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            {filter && (
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
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", ml: 1 }}
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

                "&:hover": {
                  backgroundColor: "white",
                },
                border: "1px solid #E4E4E5",
                height: "40px",
                px: 2,
              }}
              onClick={handleClick}
            >
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}>
                <FilterIcon />
              </Box>
              Filter
            </Button>
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
          {filter && (
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

                height: "40px",
                px: 2,
              }}
              onClick={() => handleSelectFilter(null)}
            >
              {filter.name}
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", ml: 1 }}>
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
              border: "1px solid #E4E4E5",
              height: "40px",
              px: 2,
            }}
            onClick={handleClick}
          >
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}>
              <FilterIcon />
            </Box>
            Filter
          </Button>
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
              width: { xs: "100%", sm: 300 },
              height: 40,
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
            }}
            placeholder="Search by name"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          flexDirection: "column",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0px 12px 15px 0px #4B71970D",
          p: 3,
          mt: 2,
        }}
      >
        {isLoadingLeads ? (
          <CircularProgress />
        ) : leads.length !== 0 ? (
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                backgroundColor: "#F2F4F6",
                borderRadius: "8px 8px 0 0",
                boxShadow: "0px 0px 2px -1px rgba(0, 0, 0, 0.25)",
                border: "1px solid #E4E4E5",
                pl: 2,
                pr: 3.5,
                py: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  aria-owns={open ? "mouse-over-popover" : undefined}
                  aria-haspopup="true"
                  onMouseEnter={handlePopoverOpen}
                  onMouseLeave={handlePopoverClose}
                >
                  <Tooltip
                    title={selectedLeads.length ? "Uncheck All" : "Select all"}
                    arrow
                    placement="top"
                  >
                    <Checkbox
                      inputProps={{ "aria-label": "controlled" }}
                      size="small"
                      icon={<OffCheckboxCustomIcon />}
                      checkedIcon={<AllCheckboxCustomIcon />}
                      // checked={selectedLeads.length === leads.length}
                      checked={checkedAll}
                      onChange={(event, checked) => handleSelectAllLeadsChange(checked, "page")}
                    />
                  </Tooltip>
                </Box>
                <Popover
                  id="mouse-over-popover"
                  sx={{
                    pointerEvents: "none",
                    "& .MuiPopover-paper": {
                      pointerEvents: "auto",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      p: 1,
                    },
                  }}
                  open={openSelectMenu}
                  anchorEl={anchorEl2}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  PaperProps={{
                    onMouseEnter: () => setAnchorEl2(anchorEl2),
                    onMouseLeave: handlePopoverClose,
                  }}
                  onClose={handlePopoverClose}
                  disableRestoreFocus
                >
                  <Button
                    fullWidth
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Checkbox
                      inputProps={{ "aria-label": "controlled" }}
                      size="small"
                      checked={selectType === "page"}
                      onChange={(event, checked) => handleSelectAllLeadsChange(checked, "page")}
                    />
                    <Typography>Select page</Typography>
                  </Button>
                  <Button
                    fullWidth
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Checkbox
                      inputProps={{ "aria-label": "controlled" }}
                      size="small"
                      checked={selectType === "all"}
                      onChange={(event, checked) => handleSelectAllLeadsChange(checked, "all")}
                    />
                    <Typography>Select All</Typography>
                  </Button>
                </Popover>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {selectedLeads.length ? (
                    <>
                      <Tooltip
                        title="Transfer Selected Leads to a Different Campaign"
                        arrow
                        placement="top"
                      >
                        <IconButton onClick={handleMoveToCampaignClick}>
                          <DriveFileMove sx={{ color: "rgba(0,0,0,0.6)" }} fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={isDeletingLeads ? "Erasing..." : "Erase the Selected Leads"}
                        arrow
                        placement="top"
                      >
                        {isDeletingLeads ? (
                          <CircularProgress size={20} sx={{ mx: 1, color: "red" }} />
                        ) : (
                          <IconButton onClick={handleDeleteClick}>
                            <Delete sx={{ color: "red" }} fontSize="small" />
                          </IconButton>
                        )}
                      </Tooltip>
                      <Tooltip title="Download the Selected Leads" arrow placement="top">
                        <IconButton onClick={handleDownloadLeadsClick}>
                          <Download sx={{ color: "rgba(0,0,0,0.6)" }} fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <Typography
                      sx={{
                        color: "#28287B",
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "16.38px",
                        ml: 1,
                      }}
                    >
                      Select Leads
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    color: "#28287B",
                    fontSize: "13px",
                    fontWeight: 500,
                    lineHeight: "16.38px",
                  }}
                >
                  Showing {leads.length} leads
                </Typography>
                {/* <Button
                  sx={{
                    display: { xs: "none", sm: selectedLeads.length ? "none" : "flex" },
                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": {
                      backgroundColor: "#164694",
                      boxShadow: 10,
                    },
                    "&:disabled": {
                      backgroundColor: theme.palette.grey[300],
                    },
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "18px",
                    letterSpacing: "0em",
                    color: "white",
                    backgroundColor: "#0071F6",
                    borderRadius: "8px",
                    px: 1.5,
                    ml: 2,
                  }}
                  variant="outlined"
                  size="large"
                  disabled={leads.length === totalLeads}
                  // onClick={handleLoadMoreClick}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mr: 1,
                    }}
                  >
                    <RefreshIcon />
                  </Box>
                  Load more
                </Button>
                <IconButton
                  sx={{
                    display: { xs: selectedLeads.length ? "none" : "flex", sm: "none" },
                    justifyContent: "center",
                    alignItems: "center",
                    ml: 1,
                    "&:disabled": {
                      color: theme.palette.grey[700],
                      backgroundColor: theme.palette.grey[300],
                    },

                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.main,
                  }}
                  disabled={leads.length === totalLeads}
                    onClick={handleLoadMoreClick}
                >
                  {" "}
                  <RefreshIcon />
                </IconButton> */}
              </Box>
            </Box>
            <Box
              sx={{
                maxHeight: "85vh",
                overflowY: "auto",
                border: "1px solid #E4E4E5",
                borderTop: 0,
                borderRadius: "0 0 8px 8px",
                ...scrollBarStyle,
              }}
            >
              {leads.map((lead, index) => (
                <Box
                  key={lead._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    // width: "100%",
                    width: "fit-content",
                    backgroundColor: "white",
                    borderTop: index === 0 ? 0 : "1px solid #E4E4E5",
                    // borderTop: 0,
                    p: 1.5,
                  }}
                  value={lead._id}
                  onClick={(e) =>
                    handleClickOpenLeadsDetailsDialog(e.currentTarget.getAttribute("value"))
                  }
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox
                      size="small"
                      icon={<OffCheckboxCustomIcon />}
                      checkedIcon={<OnCheckboxCustomIcon />}
                      checked={selectedLeads.some((selected) => selected === lead._id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event, checked) => handleSelectLeadChange(lead._id, checked)}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "250px",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        ml: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "14px",
                          lineHeight: "17.64px",
                          color: "#28287B",
                        }}
                      >
                        {lead.firstName + " " + lead.lastName}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 400,
                          color: "#8181B0",
                          lineHeight: "16.38px",
                          mt: 0.5,
                        }}
                      >
                        {lead.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      minWidth: "247px",
                    }}
                  >
                    {lead.status === "completed" ? (
                      <Chip
                        label="Completed"
                        variant="outlined"
                        sx={{
                          color: "#00AA38",
                          border: "1px solid #DAEFDF",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                          letterSpacing: "0em",
                        }}
                      />
                    ) : lead.status === "bounced" ? (
                      <Chip
                        label="Bounced"
                        variant="outlined"
                        sx={{
                          color: "#C867F4",
                          border: "1px solid #F2D7FF",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                          letterSpacing: "0em",
                        }}
                      />
                    ) : lead.status === "contacted" ? (
                      <Chip
                        label="Contacted"
                        variant="outlined"
                        sx={{
                          color: "#C867F4",
                          border: "1px solid #F2D7FF",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                          letterSpacing: "0em",
                        }}
                      />
                    ) : lead.status === "unsubscribe" ? (
                      <Chip
                        label="Unsubscribe"
                        variant="outlined"
                        sx={{
                          color: "#C867F4",
                          border: "1px solid #F2D7FF",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                          letterSpacing: "0em",
                        }}
                      />
                    ) : (
                      <Chip
                        label="not contacted"
                        variant="outlined"
                        sx={{
                          color: "#216fed",
                          border: "1px solid #E7F0FF",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                          letterSpacing: "0em",
                        }}
                      />
                    )}
                    {lead.emailOpened && (
                      <Chip
                        label="Opened"
                        variant="outlined"
                        sx={{
                          color: "#28287B",
                          border: "1px solid #E4E4E5",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                          letterSpacing: "0em",
                          ml: 1,
                        }}
                      />
                    )}
                  </Box>
                  <Box
                     sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      minWidth: "247px",
                    }}
                  > 
                  {
                    lead.sequence_step && (
                      <Chip
                      label={`Step ${lead.sequence_step}`}
                      variant="outlined"
                      sx={{
                        color: "#216fed",
                        border: "1px solid #E7F0FF",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 700,
                        lineHeight: "16px",
                        letterSpacing: "0em",
                      }}
                    />
                    )
                  }           
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      minWidth: "150px",
                    }}
                  >
                    <Typography
                      sx={{
                        display: getLabelForLead(lead.label) ? "block" : "none",
                        color: "#28287B",
                        border: "1px solid #E4E4E5",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 700,
                        lineHeight: "16px",
                        letterSpacing: "0em",
                        ml: 1,
                        p: 1,
                      }}
                    >
                      {getLabelForLead(lead.label)}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 500,
                      lineHeight: "16px",
                      letterSpacing: "0em",
                      overflow: { xs: "visible", md: "hidden" },
                      textOverflow: "ellipsis",
                      width: "250px",
                      pr: 2,
                    }}
                  >
                    {lead.website}
                  </Typography>
                </Box>
              ))}{" "}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Pagination
                page={page}
                setPage={setPage}
                total={totalfilterLead}
                length={leads?.length}
                limit={limit}
                handleLimitChange={handleLimitChange}
                />
            </Box>
          </Box>
        ) : (
          "No results"
        )}
      </Box>
      <Dialog
        open={isImportLeadsDialogOpen}
        onClose={handleCloseOpenImportLeadsDialog}
        fullWidth
        maxWidth="md"
        sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
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
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: "28px",
                    color: "#28287B",
                  }}
                >
                  Import Leads
                </Typography>
                {activeStep !== 0 && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mr: 0.5,
                      }}
                    >
                      <ArrowRight />
                    </Box>
                  </>
                )}
                {activeStep === 1 ? (
                  <>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: "28px",
                        color: "#8181B0",
                      }}
                    >
                      Import CSV File
                    </Typography>
                  </>
                ) : activeStep === 2 ? (
                  <>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: "28px",
                        color: "#8181B0",
                      }}
                    >
                      Use Lead Finder
                    </Typography>
                  </>
                ) : activeStep === 3 ? (
                  <>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: "28px",
                        color: "#8181B0",
                      }}
                    >
                      Input Emails Manually
                    </Typography>
                  </>
                ) : activeStep === 4 ? (
                  <>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: "28px",
                        color: "#8181B0",
                      }}
                    >
                      Utilize Google Sheets
                    </Typography>
                  </>
                ) : null}
              </Box>

              {activeStep === 0 ? (
                <>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      color: "#8181B0",
                      mt: 1,
                    }}
                  >
                    Choose one of the methods listed below to effortlessly import leads.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      color: "#8181B0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mt: 1,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setActiveStep(0);
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mr: 1,
                      }}
                    >
                      <ArrowLeftIconBlue color="#8181B0" />
                    </Box>
                    Select a Different Method
                  </Typography>
                </>
              )}
            </Box>
            <IconButton
              sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
              onClick={handleCloseOpenImportLeadsDialog}
            >
              <EACloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {activeStep === 0 ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: { xs: "column", md: "row" },
                  rowGap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: { xs: "center", md: "flex-start" },
                    cursor: "pointer",
                    width: { xs: "70%", sm: "40%", md: "100%" },
                    p: 3,
                    border: "1px solid #00AA38",
                    flexDirection: "column",
                    height: "100%",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0px 12px 15px 0px #4B71970D",
                  }}
                  onClick={() => {
                    setActiveStep(1);
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <BulkUploadIcon />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "26px",
                        color: "#28287B",
                        mt: 1.5,
                      }}
                    >
                      Upload CSV
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: { xs: "center", md: "flex-start" },
                    cursor: "pointer",
                    width: { xs: "70%", sm: "40%", md: "100%" },
                    p: 3,
                    border: "1px solid #760078",
                    flexDirection: "column",
                    height: "100%",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0px 12px 15px 0px #4B71970D",
                    ml: { xs: 0, md: 2 },
                  }}
                  onClick={() => navigate("/leadFinder")}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <ImportLeadFinderIcon />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "26px",
                        color: "#28287B",
                        mt: 1.5,
                      }}
                    >
                      Use Lead Finder
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: { xs: "center", md: "flex-start" },
                    cursor: "pointer",
                    width: { xs: "70%", sm: "40%", md: "100%" },
                    p: 3,
                    border: "1px solid #CECECE",
                    flexDirection: "column",
                    height: "100%",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0px 12px 15px 0px #4B71970D",
                    mx: 2,
                  }}
                  onClick={() => {
                    setActiveStep(3);
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <ManualEmailIcon />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "26px",
                        color: "#28287B",
                        mt: 1.5,
                      }}
                    >
                      Enter Emails Manually
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: { xs: "center", md: "flex-start" },
                    cursor: "pointer",
                    width: { xs: "70%", sm: "40%", md: "100%" },
                    p: 3,
                    border: "1px solid #0071F6",
                    flexDirection: "column",
                    height: "100%",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0px 12px 15px 0px #4B71970D",
                  }}
                  onClick={() => {
                    setActiveStep(4);
                  }}
                >
                  <Google />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "26px",
                        color: "#28287B",
                        mt: 1.5,
                      }}
                    >
                      Use Google Sheets
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          ) : activeStep === 1 ? (
            <CsvImport
              campaign={campaign}
              onLeadsCreate={onLeadsCreate}
              setSnackbarMsg={setSnackbarMsg}
              setSnackbarOpen={setSnackbarOpen}
            />
          ) : activeStep === 2 ? (
            <></>
          ) : activeStep === 3 ? (
            <ManualImport campaign={campaign} onLeadsCreate={onLeadsCreate} />
          ) : activeStep === 4 ? (
            <GoogleSheetImport
            campaign={campaign}
            onLeadsCreate={onLeadsCreate}
            setSnackbarMsg={setSnackbarMsg}
            setSnackbarOpen={setSnackbarOpen}
            />
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={openLeadsDetailsDialog}
        onClose={handleCloseLeadsDetailsDialog}
        fullWidth
        maxWidth="sm"
        sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                lineHeight: "28px",
                letterSpacing: "0em",
                color: "#28287B",
              }}
            >
              Lead Details
            </Typography>
            <IconButton onClick={handleCloseLeadsDetailsDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={scrollBarStyle}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              p: 3,
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                mt: 2,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                <Avatar sx={{ width: 40, height: 40, backgroundColor: "rgba(4, 4, 30, 0.1)" }}>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 700,
                      lineHeight: "16px",
                      letterSpacing: "0em",
                      color: "#28287B",
                    }}
                  >
                    {getInitials(leadEdit?.firstName, leadEdit?.lastName)}
                  </Typography>
                </Avatar>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    ml: 2,
                    height: "100%",
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
                    {/* {item.name} */}
                    {leadEdit?.email}
                  </Typography>
                  {/* <Link to={item.linkedin_url}> */}
                  {/* <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "16px",
                    letterSpacing: "0em",
                    color: "#28287B",
                  }}
                >
                  LinkedIn
                </Typography> */}
                  {/* </Link> */}
                </Box>
              </Box>
            </Box>
            <Typography
              sx={{
                width: "100%",
                textAlign: "left",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
                mt: 3,
              }}
            >
              Email
            </Typography>
            <TextField
              fullWidth
              placeholder="Email"
              variant="outlined"
              sx={{
                mt: 2,
                width: "100%",
                backgroundColor: "white",
                "& div": { pl: 0.3 },
                "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                "& div input": {
                  py: 2,
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "16px",
                  letterSpacing: "0em",
                  "&::placeholder": {
                    color: "rgba(40, 40, 123, 0.5)",
                  },
                },
              }}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Typography
              sx={{
                width: "100%",
                textAlign: "left",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
                mt: 2,
              }}
            >
              First Name
            </Typography>
            <TextField
              fullWidth
              placeholder="First Name"
              variant="outlined"
              sx={{
                mt: 2,
                width: "100%",
                backgroundColor: "white",
                "& div": { pl: 0.3 },
                "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                "& div input": {
                  py: 2,
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "16px",
                  letterSpacing: "0em",
                  "&::placeholder": {
                    color: "rgba(40, 40, 123, 0.5)",
                  },
                },
              }}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <Typography
              sx={{
                width: "100%",
                textAlign: "left",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
                mt: 2,
              }}
            >
              Last Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Last Name"
              variant="outlined"
              sx={{
                mt: 2,
                width: "100%",
                backgroundColor: "white",
                "& div": { pl: 0.3 },
                "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                "& div input": {
                  py: 2,
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "16px",
                  letterSpacing: "0em",
                  "&::placeholder": {
                    color: "rgba(40, 40, 123, 0.5)",
                  },
                },
              }}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
            <Typography
              sx={{
                width: "100%",
                textAlign: "left",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
                mt: 2,
              }}
            >
              Title
            </Typography>
            <TextField
              fullWidth
              placeholder="Title"
              variant="outlined"
              sx={{
                mt: 2,
                width: "100%",
                backgroundColor: "white",
                "& div": { pl: 0.3 },
                "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                "& div input": {
                  py: 2,
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "16px",
                  letterSpacing: "0em",
                  "&::placeholder": {
                    color: "rgba(40, 40, 123, 0.5)",
                  },
                },
              }}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Typography
              sx={{
                width: "100%",
                textAlign: "left",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
                mt: 2,
              }}
            >
              Company Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Company Name"
              variant="outlined"
              sx={{
                mt: 2,
                width: "100%",
                backgroundColor: "white",
                "& div": { pl: 0.3 },
                "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                "& div input": {
                  py: 2,
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "16px",
                  letterSpacing: "0em",
                  "&::placeholder": {
                    color: "rgba(40, 40, 123, 0.5)",
                  },
                },
              }}
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
            <Typography
              sx={{
                width: "100%",
                textAlign: "left",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
                mt: 2,
              }}
            >
              Website
            </Typography>
            <TextField
              fullWidth
              placeholder="Website"
              variant="outlined"
              sx={{
                mt: 2,
                width: "100%",
                backgroundColor: "white",
                "& div": { pl: 0.3 },
                "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                "& div input": {
                  py: 2,
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "16px",
                  letterSpacing: "0em",
                  "&::placeholder": {
                    color: "rgba(40, 40, 123, 0.5)",
                  },
                },
              }}
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
            <Typography
              sx={{
                width: "100%",
                textAlign: "left",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
                mt: 2,
              }}
            >
              Location
            </Typography>
            <TextField
              fullWidth
              placeholder="Location"
              variant="outlined"
              sx={{
                mt: 2,
                width: "100%",
                backgroundColor: "white",
                "& div": { pl: 0.3 },
                "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                "& div input": {
                  py: 2,
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "16px",
                  letterSpacing: "0em",
                  "&::placeholder": {
                    color: "rgba(40, 40, 123, 0.5)",
                  },
                },
              }}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
           <Typography
              sx={{
                width: "100%",
                textAlign: "left",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
                mt: 2,
              }}
            >
              IceBreaker
            </Typography>
            <TextField
              fullWidth
              placeholder="IceBreaker"
              variant="outlined"
              sx={{
                mt: 2,
                width: "100%",
                backgroundColor: "white",
                "& div": { pl: 0.3 },
                "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                "& div input": {
                  py: 2,
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "16px",
                  letterSpacing: "0em",
                  "&::placeholder": {
                    color: "rgba(40, 40, 123, 0.5)",
                  },
                },
              }}
              value={iceBreaker}
              onChange={(event) => setIceBreaker(event.target.value)}
            />
            {lead?.variables.map((lead, index) => (
              <>
                <Typography
                  key={index}
                  sx={{
                    width: "100%",
                    textAlign: "left",
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    color: "#28287B",
                    mt: 2,
                    textTransform: "capitalize",
                  }}
                >
                  {lead.variableTitle}
                </Typography>
                <TextField
                  fullWidth
                  // placeholder="Company Name"
                  variant="outlined"
                  sx={{
                    mt: 2,
                    width: "100%",
                    backgroundColor: "white",
                    "& div": { pl: 0.3 },
                    "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                    "& div input": {
                      py: 2,
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "16px",
                      letterSpacing: "0em",
                      "&::placeholder": {
                        color: "rgba(40, 40, 123, 0.5)",
                      },
                    },
                  }}
                  value={lead.variableValue}
                  onChange={(event) => handleChangeField(event, index)}
                />
              </>
            ))}
            {showModal === true ? (
              <Card sx={{ width: "100%", mt: 3 }}>
                <CardContent>
                  {variable === "Custom Variables" ? (
                    <>
                      <Typography
                        sx={{
                          width: "100%",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: 500,
                          lineHeight: "10px",
                          color: "#28287B",
                          mt: 2,
                        }}
                      >
                        Variable Value
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="example: phone_num"
                        variant="outlined"
                        sx={{
                          mt: 2,
                          width: "100%",
                          backgroundColor: "white",
                          "& div": { pl: 0.3 },
                          "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                          "& div input": {
                            py: 2,
                            fontSize: "13px",
                            fontWeight: 400,
                            lineHeight: "16px",
                            letterSpacing: "0em",
                            "&::placeholder": {
                              color: "rgba(40, 40, 123, 0.5)",
                            },
                          },
                        }}
                        name="variableTitle"
                        value={addFieldVariable.variableTitle}
                        onChange={handleChange}
                      />
                    </>
                  ) : (
                    ""
                  )}
                  <Typography
                    sx={{
                      width: "100%",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "10px",
                      color: "#28287B",
                      mt: 2,
                    }}
                  >
                    Variable Value
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="example: 123-456-7890"
                    variant="outlined"
                    sx={{
                      mt: 2,
                      width: "100%",
                      backgroundColor: "white",
                      "& div": { pl: 0.3 },
                      "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                      "& div input": {
                        py: 2,
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "16px",
                        letterSpacing: "0em",
                        "&::placeholder": {
                          color: "rgba(40, 40, 123, 0.5)",
                        },
                      },
                    }}
                    name="variableValue"
                    value={addFieldVariable.variableValue}
                    onChange={handleChange}
                  />
                  <Typography
                    sx={{
                      width: "100%",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "10px",
                      color: "#28287B",
                      mt: 2,
                    }}
                  >
                    Variable Type
                  </Typography>

                  <Select
                    value={variable}
                    onChange={handleChangeVariable}
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    sx={{
                      mt: 2,
                      width: "100%",
                      backgroundColor: "white",
                      "& div": { pl: 0.3 },
                      "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                      "& div input": {
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "16px",
                        letterSpacing: "0em",
                        "&::placeholder": {
                          color: "rgba(40, 40, 123, 0.5)",
                        },
                      },
                    }}
                  >
                    {menuItems.map((menuItem, index) => (
                      <MenuItem key={index} value={menuItem.value} onClick={menuItem.onClick}>
                        <Box sx={{ display: "flex", gap: "5px" }}>
                          {menuItem.icon}
                          <Typography>{menuItem.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                    ;
                  </Select>
                </CardContent>
                <CardActions>
                  <Button onClick={closeModal}>
                    <Delete fontSize="small" sx={{ marginRight: "5px", color: "red" }} />
                    <Typography variant="h6" component="h6">
                      Cancel
                    </Typography>
                  </Button>
                </CardActions>
              </Card>
            ) : (
              ""
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
                width: "100%",
              }}
            >
              <Button variant="text" onClick={openModal}>
                <AddIcon fontSize="small" sx={{ marginRight: "5px" }} />
                <Typography variant="h6" component="h6">
                  Add Variable
                </Typography>
              </Button>
              <Button onClick={handelleadEdit} variant="contained">
                {isLeadUpdating ? <CircularProgress /> : <>Save </>}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* move to campaign dialog */}
      <Dialog
        Dialog
        open={isMoveToCampaignDialogOpen}
        onClose={handleMoveToCampaignDialogClose}
        sx={{
          backgroundColor: "rgba(4, 4, 30, 0.5)",
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: "28px",
            color: "#28287B",
          }}
        >
          Move to Campaign
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            freeSolo
            id="checkboxes-tags-demo"
            options={campaignNames?.filter((c) => c._id !== campaign._id) || []}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
              <li
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  px: 0,
                }}
                {...props}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 500,
                    lineHeight: "24px",
                    color: "#28287B",
                  }}
                >
                  {option.name}
                </Typography>
              </li>
            )}
            renderTags={(value) => (
              <Box
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "90%",
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "18px",
                  letterSpacing: "0px",
                  color: "#28287B",
                }}
              >
                {value}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Campaign"
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  "& div": { pl: 0.3 },
                  "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                  "& div input": {
                    py: 2,
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "16px",
                    letterSpacing: "0em",
                    "&::placeholder": {
                      color: "rgba(40, 40, 123, 0.5)",
                    },
                  },
                  "& label": {
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "18px",
                    letterSpacing: "0px",
                    color: "#28287B",
                  },
                }}
                name="location"
              />
            )}
            sx={{ width: "100%", mt: 2 }}
            onChange={(e, option) => setSelectedCampaign(option?._id)}
          />
        </DialogContent>
        <DialogActions
          sx={{
            mb: 3,
            mx: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Button onClick={handleMoveToCampaignDialogClose} variant="outlined" fullWidth>
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            disabled={!selectedCampaign}
            onClick={handleMoveToCampaignDialogSave}
            sx={{ "&.MuiButton-root": { ml: 0 } }}
          >
            {isMovingToCampaign ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Move to Campaign"
            )}
          </Button>
        </DialogActions>
      </Dialog>
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
        sx={{ mt: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 1,
            width: "160px",
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
                  setPage(1);
                  handleClose();
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                  <Typography
                    sx={{
                      color: filter?.name === item.name ? "#0071F6" : "#28287B",
                      fontSize: "13px",
                      fontWeight: 700,
                      linHeight: "16px",
                      letterSpacing: "0px",
                      ml: 1,
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
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbarOpen}
        message={snackbarMsg}
        key={"csv-import"}
        ContentProps={{
          sx: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
        }}
      />
    </>
  );
};

export default CampaignLeads;
