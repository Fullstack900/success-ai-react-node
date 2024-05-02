import React, { useEffect, useState, useRef, useMemo, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import checkSpamWords from "src/components/campaigns/emailChecker/utils/checkSpamTree";
import { format } from "date-fns";
import moment from "moment";
import { toast } from "react-hot-toast";
import { config } from "src/config.js";
import parse from "html-react-parser";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  Stack,
  Hidden,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  Avatar,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Autocomplete,
  Select,
  FormControl,
  InputLabel,
  ListSubheader,
  Modal,
  Divider,
} from "@mui/material";
import AutoAwesomeMosaicIcon from "@mui/icons-material/AutoAwesomeMosaic";
import {
  ArrowForwardIos,
  CallMade,
  EmailOutlined,
  Forward,
  Reply,
  Send,
  Storage,
  CloseOutlined,
  ArrowDropDown,
  MoreVertOutlined,
  MailOutlined,
  MarkAsUnread,
  BorderColor,
  PersonRemove,
  MoveToInbox,
  DeleteOutline,
  Close,
  PersonOff,
  AddOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import { inboxData } from "src/assets/data";
import { IHAllIcon } from "src/assets/inboxHub/IHAllIcon";
import { DropDown } from "src/assets/general/DropDown";
import { IHCampaignsIcon } from "src/assets/inboxHub/IHCampaignsIcon";
import { IHEmailsIcon } from "src/assets/inboxHub/IHEmaisIcon";
import { SBSearch } from "src/assets/sidebar/SBSearch";
import { SideNav } from "src/layouts/dashboard/side-nav";
import { IHForwardIcon } from "src/assets/inboxHub/IHForwardIcon";
import {
  useCreateLabelMutation,
  useGetCampaignsQuery,
  useUpdateLabelMutation,
} from "src/services/campaign-service";
import { setAccounts, useGetAccountsMutation } from "src/services/account-service.js";
import {
  useGetCampaignEmailsMutation,
  useGetCampaignEmailsReplyMutation,
  useSendReplyEmailMutation,
  useSendForwardMailMutation,
  useDeleteThreadMutation,
  useOpenedEmailMutation,
  setActualTotalCount,
} from "src/services/unibox-service.js";
import {
  useRemoveLeadsMutation,
  useMoveToCampaignMutation,
  useUpdateLeadMutation,
} from "src/services/leads-service";

import PropTypes from "prop-types";
import { RiShareForwardFill } from "react-icons/ri";
import { BoltIcon } from "src/assets/general/BoltIcon";
import { OpenAiIcon } from "src/assets/general/OpenAiIcon";
import { Editor } from "@tinymce/tinymce-react";
import {
  useWriteEmailMutation,
  useOptimizeEmailMutation,
  useLazyGetCampaignNamesQuery,
  useGetAllLabelsQuery,
} from "src/services/campaign-service.js";
import CustomCounterProgress from "src/components/campaigns/emailChecker/CustomCounterProgress";
import Countbadge from "src/components/Countbadge";
import templateEmails from "src/components/templateEmails";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pl: { xs: 0, md: 3 } }}>
          <Typography sx={{ border: "1px solid #E4E4E5", borderRadius: "12px" }}>
            {children}
          </Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const [maxSubjectCount, maxWordCount, maxReadingTime, maxLinks, maxQuestions, maxSpams] = [
  15, 500, 210, 3, 4, 7,
];

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
        <Box sx={{ width: "100%" }}>
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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const StatusLabelSelect = ({
  handleClickOpenAddStatusDialog,
  isLabelsLoading,
  statusLabels,
  inboxSelectedID,
  label,
  fetchUpdatedData,
}) => {
  const [selectedOption, setSelectedOption] = useState(label || statusLabels?.labels[0]._id);
  const [searchText, setSearchText] = useState("");
  const [updateLabel, { isLoading: isUpdatingLabel }] = useUpdateLabelMutation();
  const containsText = (text, searchText) =>
    text.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
  const displayedOptions = useMemo(
    () => statusLabels?.labels.filter((option) => containsText(option.name, searchText)),
    [searchText, statusLabels?.labels]
  );
  const handleStatusChange = async (e) => {
    const labelId = e.target.value;
    if (label === labelId) return;
    setSelectedOption(labelId);
    const { message } = await updateLabel({ campaignEmailId: inboxSelectedID, labelId }).unwrap();
    fetchUpdatedData();
    toast.success(message);
  };

  return (
    <Box sx={{ mt: 0.5 }}>
      <FormControl>
        <Select
          size="small"
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "18px",
            color: "#28287B",
            "& .MuiOutlinedInput-input": {
              py: 0.5,
            },
          }}
          MenuProps={{
            autoFocus: false,
            PaperProps: {
              sx: {
                display: "flex",
                flexDirection: "column",
                height: "400px",
                overflowY: "auto",

                "&::-webkit-scrollbar": {
                  width: "14px",
                },

                "&::-webkit-scrollbar-track": {
                  borderRadius: "60px",
                },

                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#E4E4E5",
                  borderRadius: "10px",
                  border: "4px solid rgba(0, 0, 0, 0)",
                  backgroundClip: "padding-box",
                },

                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#d5d5d5",
                },
              },
            },
          }}
          labelId="search-select-label"
          id="search-select"
          value={selectedOption}
          onChange={handleStatusChange}
          onClose={() => setSearchText("")}
        >
          <ListSubheader sx={{ px: 1 }}>
            {" "}
            <TextField
              placeholder="Search by status"
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
                width: "100%",
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
                mb: 1,
              }}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Escape") {
                  // Prevents autoselecting item while typing (default Select behaviour)
                  e.stopPropagation();
                }
              }}
            />
            <Button
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "left",
                px: 1.5,
                py: 1,
                mb: 1,
                // mx: 2,
                width: "100%",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "18px",
                color: "#28287B",
                "&:hover": {
                  backgroundColor: "#F2F4F6",
                  color: "#3F4FF8",
                },
                border: "1px solid #fff",
              }}
              onClick={handleClickOpenAddStatusDialog}
            >
              <Typography
                sx={{
                  width: "calc(100% - 20px)",
                  textAlign: "left",

                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#28287B",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {" "}
                Create New Label
              </Typography>
              <AddOutlined />
            </Button>
          </ListSubheader>
          {!isLabelsLoading &&
            displayedOptions.map((label, index) => {
              return (
                <MenuItem key={label._id} value={label._id} sx={{ mx: 1, borderRadius: "8px" }}>
                  {label.name}
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
    </Box>
  );
};

const InboxMoreMenu = ({
  anchorEl,
  open,
  handleClose,
  handleClickOpenLeadsDetailsDialog,
  handleClickOpenRemoveLeadDialog,
  handleClickOpenDeleteThreadDialog,
  handleClickOpenMoveToCampaignDialog,
  handlePortalEmailOpened,
  handleReload,
  replyId,
  theme,
}) => {
  const menuStyle = (label) => {
    return {
      py: 1.5,
      mx: 1,
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      color: "#101828",
      fontWeight: 500,
      "&.MuiMenuItem-root .MuiListItemIcon-root .MuiSvgIcon-root": {
        color: "#101828",
      },
      "&:hover": {
        color: label === "delete" ? theme.palette.error.main : theme.palette.primary.main,
        backgroundColor:
          label === "delete"
            ? alpha(theme.palette.error.main, 0.1)
            : alpha(theme.palette.primary.main, 0.1),
        "&.MuiMenuItem-root .MuiListItemIcon-root .MuiSvgIcon-root": {
          color: label === "delete" ? theme.palette.error.main : theme.palette.primary.main,
        },
      },
      borderRadius: 1,
    };
  };

  return (
    <Menu
      anchorEl={anchorEl}
      id="account-menu"
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 1.5,
          "& .MuiAvatar-root": {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          "&:before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: "background.paper",
            transform: "translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <MenuItem
        onClick={() => {
          handleClose();
          handlePortalEmailOpened(replyId._id, false);
        }}
        sx={menuStyle()}
      >
        <ListItemIcon>
          <MarkAsUnread fontSize="small" />
        </ListItemIcon>{" "}
        Mark as unread
      </MenuItem>
      <MenuItem onClick={handleClickOpenLeadsDetailsDialog} sx={menuStyle()}>
        <ListItemIcon>
          <BorderColor fontSize="small" />
        </ListItemIcon>
        Edit Lead
      </MenuItem>

      <MenuItem onClick={handleClickOpenRemoveLeadDialog} sx={menuStyle()}>
        <ListItemIcon>
          <PersonRemove fontSize="small" />
        </ListItemIcon>
        Remove Lead
      </MenuItem>
      <MenuItem onClick={handleClickOpenMoveToCampaignDialog} sx={menuStyle()}>
        <ListItemIcon>
          <MoveToInbox fontSize="small" />
        </ListItemIcon>
        Move Lead
      </MenuItem>
      <MenuItem onClick={handleClickOpenDeleteThreadDialog} sx={menuStyle("delete")}>
        <ListItemIcon>
          <DeleteOutline fontSize="small" />
        </ListItemIcon>
        Delete
      </MenuItem>
    </Menu>
  );
};

const InboxColumn = ({
  value,
  handleChange,
  isCampaignsLoading,
  campaignData,
  currentCampaign,
  setCurrentCampaign,
  handleClickCampaign,
  showAll,
  setShowAll,
  handleSearchAccountChange,
  handleSearchCampaignChange,
  handleSearchStatusChange,
  memoizedAccountData,
  isAccountsLoading,
  currentAccount,
  setCurrentAccount,
  isLabelsLoading,
  statusLabels,
  currentStatus,
  setCurrentStatus,
  handleClickStatus,
  handleClickAccount,
  setOpenAllInboxes,
  setOpenAllCampaigns,
  openAllCampaigns,
  openAllInboxes,
  theme,
  setInboxTabsOpen,
  handleClickOpenAddStatusDialog,
}) => {
  const [compaings, setCompaigns] = useState([]);

  useEffect(() => {
    setCompaigns(campaignData);
  }, [campaignData]);

  return (
    <Box
      sx={{
        width: "100%",
        height: { sm: "calc(100vh - 140px)" },
        backgroundColor: "white",
        p: 2,
        // pt: 0,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        boxShadow: "0px 12px 15px 0px #4B71970D",
        borderRadius: "12px",
        flexDirection: "column",
        overflowY: "hidden",

        // width
        "&::-webkit-scrollbar": {
          width: "14px",
        },

        // Track
        "&::-webkit-scrollbar-track": {
          borderRadius: "60px",
        },

        // /* Handle */
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#E4E4E5",
          borderRadius: "10px",
          border: "4px solid rgba(0, 0, 0, 0)",
          backgroundClip: "padding-box",
        },

        // /* Handle on hover */
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#d5d5d5",
        },
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          // borderRight: "2px solid rgba(0,0,0,0.1)",
          // borderLeft: "1px solid rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "column",
          // position: "fixed",
          // top: "67px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            // p: 2,
            alignItems: "center",
            justifyContent: "space-between",
            // borderBottom: "2px solid rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "18px",
              color: "#28287B",
            }}
          >
            Mail
          </Typography>
          <Button
            variant="outlined"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",

              py: 0.5,
              border: "1px solid #E4E4E5",
              borderRadius: "8px",
              height: "100%",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowAll(true);
              setCurrentCampaign(null);
              setCurrentAccount(null);
              setCurrentStatus(null);
              setInboxTabsOpen(false);
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
              }}
            >
              View All
            </Typography>
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            mt: 2,
          }}
        >
          <Grid container spacing={1} sx={{ height: "fit-content" }}>
            {/* <Grid item xs={3}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            py: 1.5,
            border: showAll
              ? "1px solid #3F4FF8"
              : "1px solid rgba(228, 228, 229, 1)",
            borderRadius: "8px",
            height: "100%",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: showAll ? "#fff" : "#F2F4F6",
              color: "#3F4FF8",
            },
          }}
          onClick={() => {
            console.log(111);
            setShowAll(true);
            setCurrentCampaign(null);
            setCurrentAccount(null);
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "20px",
              color: showAll ? "#3F4FF8" : "#8181B0",
            }}
          >
            All
          </Typography>
        </Box>
      </Grid> */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  border: "1px solid rgba(228, 228, 229, 1)",
                  borderRadius: "8px",
                }}
              >
                {" "}
                <Box sx={{ width: "100%" }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                    variant="scrollable"
                    scrollButtons={false}
                  >
                    <Tab
                      label="Status"
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20px",
                      }}
                      {...a11yProps(0)}
                    />
                    <Tab
                      label="All campaigns"
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20px",
                      }}
                      {...a11yProps(1)}
                    />
                    <Tab
                      label="All inboxes"
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20px",
                      }}
                      {...a11yProps(2)}
                    />
                  </Tabs>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>{" "}
        <Box
          sx={{
            width: "100%",
            display: value !== 0 && "none",
            transition: "all 0.2s ease-out",
            mt: 2,
            height: "calc(100% - 100px)",
          }}
        >
          {" "}
          <TextField
            placeholder="Search by status"
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
              width: "100%",
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
              mb: 1,
            }}
            onChange={handleSearchStatusChange}
          />
          <Button
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              textAlign: "left",
              px: 1.5,
              py: 1,
              mb: 1,
              width: "100%",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "18px",
              color: "#28287B",
              "&:hover": {
                backgroundColor: "#F2F4F6",
                color: "#3F4FF8",
              },
              border: "1px solid #fff",
            }}
            onClick={handleClickOpenAddStatusDialog}
          >
            <Typography
              sx={{
                width: "calc(100% - 20px)",
                textAlign: "left",
                ml: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "#28287B",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {" "}
              Create New Label
            </Typography>
            <AddOutlined />
          </Button>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "calc(100% - 100px)",
              overflowY: "auto",
              // width
              "&::-webkit-scrollbar": {
                width: "14px",
              },

              // Track
              "&::-webkit-scrollbar-track": {
                borderRadius: "60px",
              },

              // /* Handle */
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#E4E4E5",
                borderRadius: "10px",
                border: "4px solid rgba(0, 0, 0, 0)",
                backgroundClip: "padding-box",
              },

              // /* Handle on hover */
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#d5d5d5",
              },
            }}
          >
            {!isLabelsLoading &&
              statusLabels?.map((label, index) => {
                return (
                  <>
                    {" "}
                    <Button
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        textAlign: "left",
                        px: 1.5,
                        py: 1,
                        mb: 1,
                        width: "100%",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "18px",
                        color: currentStatus === label._id ? "#3F4FF8" : "#28287B",
                        "&:hover": {
                          backgroundColor: currentStatus === label._id ? "#fff" : "#F2F4F6",
                          color: "#3F4FF8",
                        },
                        border:
                          currentStatus === label._id ? "1px solid #3F4FF8" : "1px solid #fff",
                      }}
                      onClick={() => {
                        handleClickStatus(label._id);
                        setInboxTabsOpen(false);
                        setShowAll(false);
                      }}
                    >
                      <Typography
                        sx={{
                          width: "calc(100% - 20px)",
                          textAlign: "left",
                          ml: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {" "}
                        {label.name}
                      </Typography>
                      {/* {label?.unread_count > 0 && <Countbadge count={label?.unread_count} />} */}
                    </Button>
                  </>
                );
              })}
          </Box>
        </Box>{" "}
        <Box
          sx={{
            width: "100%",
            display: value !== 1 && "none",
            transition: "all 0.2s ease-out",
            mt: 2,
            height: "calc(100% - 100px)",
          }}
        >
          {" "}
          <TextField
            placeholder="Search by campaign"
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
              width: "100%",
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
              mb: 1,
            }}
            onChange={handleSearchCampaignChange}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "calc(100% - 60px)",
              overflowY: "auto",
              // width
              "&::-webkit-scrollbar": {
                width: "14px",
              },

              // Track
              "&::-webkit-scrollbar-track": {
                borderRadius: "60px",
              },

              // /* Handle */
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#E4E4E5",
                borderRadius: "10px",
                border: "4px solid rgba(0, 0, 0, 0)",
                backgroundClip: "padding-box",
              },

              // /* Handle on hover */
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#d5d5d5",
              },
            }}
          >
            {compaings?.updatedEmail?.map((i) => {
              return (
                <>
                  {" "}
                  <Button
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textAlign: "left",
                      px: 1.5,
                      py: 1,
                      mb: 1,
                      width: "100%",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "18px",
                      color: currentCampaign === i._id ? "#3F4FF8" : "#28287B",
                      "&:hover": {
                        backgroundColor: currentCampaign === i._id ? "#fff" : "#F2F4F6",
                        color: "#3F4FF8",
                      },
                      border: currentCampaign === i._id ? "1px solid #3F4FF8" : "1px solid #fff",
                    }}
                    onClick={() => {
                      handleClickCampaign(i._doc?._id);
                      setInboxTabsOpen(false);
                      setShowAll(false);
                    }}
                  >
                    <Typography
                      sx={{
                        width: "calc(100% - 20px)",
                        textAlign: "left",
                        ml: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {" "}
                      {i._doc?.name}
                    </Typography>
                    {i?.unread_count > 0 && <Countbadge count={i.unread_count} />}
                  </Button>
                </>
              );
            })}
          </Box>
        </Box>{" "}
        <Box
          sx={{
            width: "100%",
            display: value !== 2 && "none",
            transition: "all 0.2s ease-out",
            mt: 2,
            height: "calc(100% - 100px)",
          }}
        >
          {" "}
          <TextField
            placeholder="Search by email"
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
              width: "100%",
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
              mb: 1,
            }}
            onChange={handleSearchAccountChange}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "calc(100% - 60px)",
              overflowY: "auto",
              // width
              "&::-webkit-scrollbar": {
                width: "14px",
              },

              // Track
              "&::-webkit-scrollbar-track": {
                borderRadius: "60px",
              },

              // /* Handle */
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#E4E4E5",
                borderRadius: "10px",
                border: "4px solid rgba(0, 0, 0, 0)",
                backgroundClip: "padding-box",
              },

              // /* Handle on hover */
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#d5d5d5",
              },
            }}
          >
            {
              memoizedAccountData?.map((i) => {
                return (
                  <>
                    <Button
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 1.5,
                        py: 1,
                        mb: 1,
                        width: "100%",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "18px",
                        color: currentAccount === i._id ? "#3F4FF8" : "#28287B",
                        "&:hover": {
                          backgroundColor: currentAccount === i._id ? "#fff" : "#F2F4F6",
                          color: "#3F4FF8",
                        },
                        border: currentAccount === i._id ? "1px solid #3F4FF8" : "1px solid #fff",
                      }}
                      onClick={() => {
                        handleClickAccount(i._id);
                        setInboxTabsOpen(false);
                        setShowAll(false);
                      }}
                    >
                      <Typography
                        sx={{
                          width: "calc(100% - 20px)",
                          textAlign: "left",
                          ml: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {i.email}
                      </Typography>
                      {i.stats?.filter(
                        (item) => item.portal_email_opened === false && item.from === i._id && item.leads 
                      ).length >= 1 && (
                        <Countbadge
                          count={
                            i.stats?.filter(
                              (item) => item.portal_email_opened === false && item.from === i._id && item.leads
                            ).length
                          }
                        />
                      )}
                    </Button>
                  </>
                );
              })}
          </Box>
        </Box>
        {/* old design start */}
        <Box
          sx={{
            display: "none",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            cursor: "pointer",
            border: "1px solid #E4E4E5",
            borderRadius: "8px",
            px: 2,
            py: 1,
            mt: 2,
          }}
          onClick={() => {
            setCurrentCampaign(null);
            setCurrentAccount(null);
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <IHAllIcon />
          </Box>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "18px",
              color: "#28287B",
              ml: 2,
            }}
          >
            View All
          </Typography>
        </Box>
        <Box
          sx={{
            display: "none",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: "100%",
            border: "1px solid #E4E4E5",
            borderRadius: "8px",
            px: 2,
            py: 1,
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",

              cursor: "pointer",
            }}
            onClick={() => {
              setOpenAllCampaigns(!openAllCampaigns);
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              {" "}
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <IHCampaignsIcon />
              </Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "18px",
                  color: "#28287B",
                  ml: 2,
                }}
              >
                View All Campaigns
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <DropDown />
            </Box>
          </Box>{" "}
          <Box
            sx={{
              width: "100%",
              maxHeight: "350px",
              display: !openAllCampaigns && "none",
              transition: "all 0.2s ease-out",
              mt: 2,
            }}
          >
            {" "}
            <TextField
              placeholder="Search by campaign"
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
                width: "100%",
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
              onChange={handleSearchCampaignChange}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",

                maxHeight: "150px",
                overflowY: "auto",
                // width
                "&::-webkit-scrollbar": {
                  width: "14px",
                },

                // Track
                "&::-webkit-scrollbar-track": {
                  borderRadius: "60px",
                },

                // /* Handle */
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#E4E4E5",
                  borderRadius: "10px",
                  border: "4px solid rgba(0, 0, 0, 0)",
                  backgroundClip: "padding-box",
                },

                // /* Handle on hover */
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#d5d5d5",
                },
              }}
            >
              {" "}
              {!isCampaignsLoading &&
                campaignData?.docs?.map((i) => {
                  return (
                    <>
                      {" "}
                      <Button
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          // p: 2,
                          py: 1,
                          px: 0.5,
                          my: 0.5,
                          // backgroundColor: "rgba(0,0,0,0.1)",

                          width: "100%",
                          borderRadius: "3px",
                          color: "black",
                        }}
                        onClick={() => {
                          handleClickCampaign(i._id);
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: "18px",
                            color: "#28287B",
                          }}
                        >
                          {i.name}
                        </Typography>
                      </Button>
                    </>
                  );
                })}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: "none",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: "100%",
            border: "1px solid #E4E4E5",
            borderRadius: "8px",
            px: 2,
            py: 1,
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",

              cursor: "pointer",
            }}
            onClick={() => {
              setOpenAllInboxes(!openAllInboxes);
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              {" "}
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <IHEmailsIcon />
              </Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "18px",
                  color: "#28287B",
                  ml: 2,
                }}
              >
                View All Inboxes
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <DropDown />
            </Box>
          </Box>{" "}
          <Box
            sx={{
              width: "100%",
              maxHeight: "350px",
              display: !openAllInboxes && "none",
              transition: "all 0.2s ease-out",
              mt: 2,
            }}
          >
            {" "}
            <TextField
              placeholder="Search by email"
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
                width: "100%",
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
              onChange={handleSearchAccountChange}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",

                maxHeight: "150px",
                overflowY: "auto",
                // width
                "&::-webkit-scrollbar": {
                  width: "14px",
                },

                // Track
                "&::-webkit-scrollbar-track": {
                  borderRadius: "60px",
                },

                // /* Handle */
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#E4E4E5",
                  borderRadius: "10px",
                  border: "4px solid rgba(0, 0, 0, 0)",
                  backgroundClip: "padding-box",
                },

                // /* Handle on hover */
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#d5d5d5",
                },
              }}
            >
              {" "}
              {!isAccountsLoading &&
                memoizedAccountData.map((i) => {
                  return (
                    <>
                      {" "}
                      <Button
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          // p: 2,
                          py: 1,
                          px: 0.5,
                          my: 0.5,
                          // backgroundColor: "rgba(0,0,0,0.1)",

                          width: "100%",
                          borderRadius: "3px",
                          color: "black",
                        }}
                        onClick={() => {
                          handleClickAccount(i._id);
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: "18px",
                            color: "#28287B",
                          }}
                        >
                          {i.email}
                        </Typography>
                      </Button>
                    </>
                  );
                })}
            </Box>
          </Box>
        </Box>
        {/* old design end */}
      </Box>
    </Box>
  );
};

const Page = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [openAllCampaigns, setOpenAllCampaigns] = useState(false);
  const [openAllInboxes, setOpenAllInboxes] = useState(false);
  const [inboxSelectedID, setInboxSelectedID] = useState("");
  const [searchCampaign, setSearchCampaign] = useState("");
  const [searchStatusLabel, setSearchStatusLabel] = useState("");
  const [mailReplies, setMailReplies] = useState([]);
  const [currentEmail, setCurrentEmail] = useState();
  const [campaignEmails, setCampaignEmails] = useState([]);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [currentReply, setCurrentReply] = useState({});
  const [forwardEmail, setForwardEmail] = useState("");
  const [currentForward, setCurrentForward] = useState({});
  const [replyId, setReplyId] = useState({});

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [writeEmail, { isLoading: isWriteEmailLoading }] = useWriteEmailMutation();

  const [value, setValue] = React.useState(1);
  const [showAll, setShowAll] = useState(true);
  const [loadMore, setLoadMore] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [removeLeadOptions, setRemoveLeadOptions] = useState({
    allCampaign: false,
    allDomain: false,
    blocklist: false,
  });

  const [statusType, setStatusType] = useState("");
  const statusLabelRef = useRef();

  const [openLeadsDetailsDialog, setOpenLeadsDetailsDialog] = useState(false);
  const [openRemoveLeadDialog, setOpenRemoveLeadDialog] = useState(false);
  const [openDeleteThreadDialog, setOpenDeleteThreadDialog] = useState(false);
  const [isMoveToCampaignDialogOpen, setIsMoveToCampaignDialogOpen] = useState(false);
  const [openAddStatusDialog, setOpenAddStatusDialog] = useState(false);
  const [deleteThread, { isLoading: isDeletingThread }] = useDeleteThreadMutation();
  const [removeLeads, { isLoading: isRemovingLeads }] = useRemoveLeadsMutation();
  const [createLabel, { isLoading: isCreatingLabel }] = useCreateLabelMutation();
  const [updateLead, { isLoading: isLeadUpdating }] = useUpdateLeadMutation();
  const [openedEmail, { isLoading: isOpenedEmail }] = useOpenedEmailMutation();

  function getInitials(firstName = "", lastName = "") {
    const firstInitial = firstName?.substring(0, 1).toUpperCase();
    const lastInitial = lastName?.substring(0, 1).toUpperCase();

    return `${firstInitial}${lastInitial}`;
  }
  const handleClickOpenLeadsDetailsDialog = async () => {
    setEmail(currentEmail?.leads?.email);
    setFirstName(currentEmail?.leads?.firstName);
    setOpenLeadsDetailsDialog(true);
  };

  const handleCloseLeadsDetailsDialog = () => {
    setEmail("");
    setFirstName("");
    setOpenLeadsDetailsDialog(false);
  };
  const handleClickOpenRemoveLeadDialog = (value) => {
    setOpenRemoveLeadDialog(true);
  };
  const handleCloseRemoveLeadDialog = () => {
    setOpenRemoveLeadDialog(false);
  };

  const handleClickOpenDeleteThreadDialog = (value) => {
    setOpenDeleteThreadDialog(true);
  };
  const handleDeleteThreadClick = async () => {
    const { message } = await deleteThread(inboxSelectedID).unwrap();
    toast.success(message);
    setOpenDeleteThreadDialog(false);
    fetchUpdatedData();
  };
  const handleLeadEdit = async () => {
    try {
      const { message } = await updateLead({
        id: currentEmail?.leads?._id,
        data: {
          firstName,
          email,
        },
      }).unwrap();
      toast.success(message);
      handleCloseLeadsDetailsDialog();
      fetchUpdatedData();
    } catch (err) {
      toast.error(err.data.error.message);
    }
  };
  const handleRemoveLeadsClick = async () => {
    const body = {
      email: currentEmail?.leads?.email,
      allDomain: removeLeadOptions.allDomain,
      allCampaign: removeLeadOptions.allCampaign,
      blocklist: removeLeadOptions.blocklist,
    };
    const { message } = await removeLeads(body).unwrap();
    toast.success(message);
    setOpenRemoveLeadDialog(false);
    fetchUpdatedData();
  };
  const handleCreateLabel = async () => {
    const [name, type] = [statusLabelRef.current?.value, statusType];

    if (!name.trim() || !type.trim()) {
      toast.error("Please Add Label & Status Type")
      return;
    }
    const data = { name, type };
    const { message } = await createLabel(data).unwrap();
    toast.success(message);
    refetchLabels();
    setOpenAddStatusDialog(false);
  };
  const handleCloseDeleteThreadDialog = () => {
    setOpenDeleteThreadDialog(false);
  };

  const handleClickOpenAddStatusDialog = (value) => {
    setOpenAddStatusDialog(true);
  };
  const handleCloseAddStatusDialog = () => {
    setOpenAddStatusDialog(false);
  };

  //  // move to Campaign
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const [fetchCampaignNames, { data: campaignNames }] = useLazyGetCampaignNamesQuery();
  const [moveToCampaign, { isLoading: isMovingToCampaign }] = useMoveToCampaignMutation();

  const handleClickOpenMoveToCampaignDialog = (value) => {
    fetchCampaignNames();
    setIsMoveToCampaignDialogOpen(true);
  };
  const handleMoveToCampaignDialogClose = () => {
    setIsMoveToCampaignDialogOpen(false);
  };

  const handleMoveToCampaignDialogSave = async () => {
    setIsMoveToCampaignDialogOpen(false);
    const { message } = await moveToCampaign({
      id: selectedCampaign,
      data: { leads: [currentEmail?.leads?._id] },
    }).unwrap();
    toast.success(message);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [sendForward, { isLoading: isLoadingForward }] = useSendForwardMailMutation();

  const sendForwardMail = async () => {
    if (loadMore) return;
    try {
      setLoadMore(true);
      const { message } = await sendForward({
        body: {
          ...currentForward,
          forwardEmail,
        },
      }).unwrap();
      toast.success(message);
      setForwardPopupOpen(false);
      setForwardEmail("");
      setLoadMore(false);
    } catch (err) {
      setLoadMore(false);
      toast.error(err.data.error.message);
    }
  };
  const handleSearchStatusChange = (event) => {
    setSearchStatusLabel(event.target.value);
  };
  const handleSearchCampaignChange = (event) => {
    setSearchCampaign(event.target.value);
  };
  const [searchAccount, setSearchAccount] = useState("");
  const handleSearchAccountChange = (event) => {
    setSearchAccount(event.target.value);
  };
  const handleClickAccount = (id) => {
    setCurrentCampaign(null);
    setCurrentStatus(null);
    setCurrentAccount(id);
  };
  const handleClickCampaign = (id) => {
    setCurrentCampaign(id);
    setCurrentAccount(null);
    setCurrentStatus(null);
  };
  const handleClickStatus = (id) => {
    setCurrentStatus(id);
    setCurrentCampaign(null);
    setCurrentAccount(null);
  };

  const {
    data: campaignData,
    isFetching: isCampaignsLoading,
    refetch,
  } = useGetCampaignsQuery({
    search: searchCampaign,
    unibox: true,
  });

  const [loadCampaignData, setLoadCampaignData] = useState(false);

  const handleReload = () => {
    setLoadCampaignData(true);
    localStorage.setItem("loadData", true);
  };

  const {
    data: statusLabels,
    isFetching: isLabelsLoading,
    refetch: refetchLabels,
  } = useGetAllLabelsQuery();

  const containsText = (text, searchText) =>
    text.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
  const displayedOptions = useMemo(
    () => statusLabels?.labels.filter((option) => containsText(option.name, searchStatusLabel)),
    [searchStatusLabel, statusLabels?.labels]
  );

  const [sendReply, { isLoading: isSendingReply }] = useSendReplyEmailMutation();

  const sendReplyEmail = async () => {
    if (loadMore) return;
    try {
      setLoadMore(true);
      const { message } = await sendReply({
        body: {
          subject: editorSubject,
          body: editorContent,
          ...currentReply,
        },
      }).unwrap();
      toast.success(message);
      setEditorSubject("");
      setEditorContent("");
      setIsEditorDialogOpen(false);
      setLoadMore(false);
    } catch (err) {
      setLoadMore(false);
      setIsEditorDialogOpen(false);
      toast.error(err.data.error.message);
    }
  };

  const getEmailBodyFromPrompt = async (prompt) => {
    try {
      if (prompt === "") toast.error("Template body cannot be empty.");
      else {
        const body = await writeEmail({ prompt }).unwrap();
        setEditorContent(body);
      }
    } catch (err) {
      toast.error(err.data.error.message);
    }
  };
  
const [getAccounts, { isLoading: isAccountsLoading }] = useGetAccountsMutation();

const getAllAccounts = async () => {
    try {
        const res = await getAccounts({ search: searchAccount, unibox: true });
        dispatch(setAccounts(res?.data?.docs));
    } catch (error) {
        console.error("Error fetching accounts:", error);
    }
}

  useEffect(() => {
    getAllAccounts();
  }, [searchAccount]);

  const updateSelectedEmail = async function (id) {
    try {
      setMailReplies([]);
      setCurrentEmail();
      setInboxSelectedID(id);

      const currentMail = campaignEmails?.find((doc) => {
        if (doc._id === id) {
          return doc;
        }
      });

      setCurrentEmail(currentMail);
      const res = await getCampaignEmailsReply({ campaignEmailId: id });
      setMailReplies(res?.data?.docs || []);
      setCurrentReply(res?.data?.docs[res?.data?.docs.length - 1]);
    } catch (error) {
      console.error(`An error occurred while updating the selected email: ${error.message}`);
    }
  };
  async function handlePortalEmailOpened(campaignEmailId, value) {
    try {
      const { message } = await openedEmail({
        id: campaignEmailId,
        body: {
          value: value,
        },
      }).unwrap();
      EmailUpdatedData();
      getAllAccounts()
      if (value === false) {
        refetch();
        setCurrentEmail("");
      }
    } catch (error) {
      console.error(`An error occurred while opening the email: ${error.message}`);
    }
  }

  const [getCampaignEmailsReply, { isLoading: isCampaignsEmailReplyLoading }] =
    useGetCampaignEmailsReplyMutation();

  useEffect(() => {
    setCampaignEmails([]);
    setCurrentEmail();
    const object = {};
    if (currentCampaign) {
      object.campaignId = currentCampaign;
    }
    if (currentAccount) {
      object.accountId = currentAccount;
    }
    if (currentStatus) {
      object.label = currentStatus;
    }
    getCampaignEmails(object).then((res) => {
      setCampaignEmails(res?.data?.docs);
    });
  }, [currentCampaign, loadMore, currentAccount, showAll, currentStatus]);

  const fetchUpdatedData = () => {
    const object = {};
    if (currentCampaign) {
      object.campaignId = currentCampaign;
    }
    if (currentAccount) {
      object.accountId = currentAccount;
    }
    if (currentStatus) {
      object.label = currentStatus;
    }
    getCampaignEmails(object).then((res) => {
      setCampaignEmails(res?.data?.docs);
      const updatedCurrentEmail = res?.data?.docs.find((e) => e._id === currentEmail._id);
      setCurrentEmail(updatedCurrentEmail);
    });
  };

  const EmailUpdatedData = () => {
    const object = {};
    if (currentCampaign) {
      object.campaignId = currentCampaign;
    }
    if (currentAccount) {
      object.accountId = currentAccount;
    }
    if (currentStatus) {
      object.label = currentStatus;
    }
    getCampaignEmails(object).then((res) => {
      setCampaignEmails(res?.data?.docs);
    });
  };

  const [getCampaignEmails, { isLoading: isCampaignsEmailLoading }] =
    useGetCampaignEmailsMutation();

  const accountData = useSelector((state) => state.accounts);

  const memoizedAccountData = accountData;

  const parseBodyContent = ({ body, trim = true }) => {
    // Create a temporary DOM element to decode HTML entities
    const tempElement = document.createElement('div');
    tempElement.innerHTML = body;
    const decodedString = tempElement.textContent || tempElement.innerText;
  
    // Remove HTML tags
    const plainString = decodedString.replace(/<[^>]+>/g, "");
  
    if (!trim) {
      return plainString;
    }
  
    return plainString.length <= 110 ? plainString : plainString.substring(0, 110 - 3) + "...";
  };

  // edit

  const [isEditorDialogOpen, setIsEditorDialogOpen] = useState(false);
  const [editorSubject, setEditorSubject] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [showParams, setShowParams] = useState(false);
  const [cursorLocation, setCursorLoaction] = useState(1);
  const [contentLength, setContentLength] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [spamCount, setSpamCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [urlCount, setUrlCount] = useState(0);
  const editorRef = useRef(null);
  const handleEditClick = () => {
    setEditorSubject(`${currentReply?.subject}`);
    setEditorContent("");
    setIsEditorDialogOpen(true);
  };
  function hasMoreThanFiveWords(str) {
    str = str.replaceAll(".", "").replaceAll(",", "");
    const words = str.split(/\s+/); // Split the string by whitespace characters
    if (words.length >= 5) setContentLength(true); // Check if the number of words is greater than 5
    else setContentLength(false);
  }
  const [optimizeEmail, { isLoading: isOptimizeEmailLoading }] = useOptimizeEmailMutation();
  const handleOptimizeClick = async () => {
    if (!editorContent) return toast.error("Template body cannot be empty.");
    try {
      const optimized = await optimizeEmail({ email: editorContent }).unwrap();
      setEditorContent(optimized);
    } catch (err) {
      toast.error(err.data.error.message);
    }
  };
  const handleEditorClick = () => {
    setCursorLoaction(1);
  };
  const [forwardPopupOpen, setForwardPopupOpen] = useState(false);
  const handleForwardClick = () => {
    setCurrentForward(currentEmail);
    setForwardPopupOpen(true);
  };

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const isSmDown = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [inboxTabsOpen, setInboxTabsOpen] = useState(false);

  // const { data: campaignData, refetch: reloadCampaignData } = useGetCampaignsQuery({
  //   unibox: true,
  // });

  // const memoizedCampaignData = useMemo(() => campaignData, [campaignData]);

  // const { data: statusLabels } = useGetAllLabelsQuery();
  const [totalLabel, setTotalLabel] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalInboxCount, setTotalInboxCount] = useState(0);

  useEffect(() => {
    let inboxCount = 0;
    let campaignDatacount = 0;
    campaignData?.updatedEmail?.forEach((i) => {
      campaignDatacount = campaignDatacount + i.unread_count;
    });

    accountData?.forEach((i) => {
      if (i.stats) {
        const filteredStats = i.stats.filter(
          (item) => item.portal_email_opened === false && item.from === i._id
        );
        inboxCount += filteredStats.length;
      }
    });

    let count = 0;

    statusLabels?.labels?.forEach((i) => {
      count = count + i.unread_count;
    });

    setTotalCount(campaignDatacount);
    setTotalInboxCount(inboxCount);
    setTotalLabel(count);
  }, [campaignData, accountData, statusLabels]);

  const actualTotalCount = totalCount ;
  const hasEmailWithLead = campaignEmails?.some((i) => i.leads?.email);

  const firstUpdate = useRef(true);
  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    dispatch(setActualTotalCount(actualTotalCount));
  }, [actualTotalCount, dispatch]);

  const [tempOpenModal, setTempOpenModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  // const style = {
  //   position: "absolute",
  //   top: "50%",
  //   left: "50%",
  //   transform: "translate(-50%, -50%)",
  //   width: 450,
  //   bgcolor: "background.paper",
  //   borderRadius: "5px",
  //   boxShadow: 24,
  //   p: 4,
  // };
  // const tempStyle = {
  //   position: "absolute",
  //   top: "50%",
  //   left: "50%",
  //   transform: "translate(-50%, -50%)",
  //   width: 1200,
  //   height: 800,
  //   bgcolor: "background.paper",
  //   borderRadius: "5px",
  //   boxShadow: 24,
  //   p: 4,
  // };

  function highlightSpam(spamArray) {
    const iframe = document.getElementsByClassName("tox-edit-area__iframe")[0];
    var box = iframe.contentWindow.document.getElementById("tinymce");

    let text = box.innerHTML;
    text = text.replace(
      /(<span class="spam-word" style="border-bottom:3px solid red;">|<\/span>)/gim,
      ""
    );

    let newText = text;
    for (let i = 0; i < spamArray.length; i++) {
      const regex = new RegExp(`\\b${spamArray[i]}\\b`, "gi");

      newText = newText.replace(
        regex,
        '<span class="spam-word" style="border-bottom:3px solid red;">$&</span>'
      );
    }

    box.innerHTML = newText;
    return;
  }

  function handleReadingTime(paragraph, wordsPerMinute = 200) {
    const wordsArray = paragraph?.trim()?.split(/\s+/);
    const totalWords = wordsArray?.length;
    const readingTimeMinutes = totalWords / wordsPerMinute;
    const readingTime = Math.ceil(readingTimeMinutes * 60);
    return readingTime;
  }

  function handleQuestions(paragraph) {
    const questionMarks = paragraph?.match(/\?+/g);
    return questionMarks ? questionMarks?.length : 0;
  }

  function handleSpamCount(subject, paragraph) {
    const string_to_check = paragraph + " " + subject;
    const spamObj = checkSpamWords(string_to_check);

    highlightSpam(spamObj.spam);
    return spamObj.count;
  }

  const handleCountUrlLength = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const links = doc.querySelectorAll("a");
    const totalLinksCount = links.length;
    return totalLinksCount;
  };

  function handleSubmit(event) {
    event.preventDefault();
    const subjectCountBar = editorSubject;
    const wordCountBar = editorContent;
    setSubjectCount(subjectCountBar.split(/\s+/).filter(Boolean).length);
    setWordCount(wordCountBar.split(/\s+/).filter(Boolean).length);
    setReadingTime(() => handleReadingTime(wordCountBar));
    // setUrlCount(() => handleUrlCount(wordCountBar));
    setQuestionCount(() => handleQuestions(wordCountBar));
    setSpamCount(() => handleSpamCount(subjectCountBar, wordCountBar));
    const urlCountResult = handleCountUrlLength(editorContent);
    setUrlCount(urlCountResult);
  }

  const [scroll, setScroll] = useState("paper");
  const handleClickOpen = (scrollType) => () => {
    setTempOpenModal(true);
    setScroll(scrollType);
  };
  return (
    <>
      {/* <Box sx={{ height: "0%", width: "0%" }}>
        <SideNav actualTotalCount={actualTotalCount} />
      </Box> */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          //   p: 2,
        }}
      >
        <Box
          sx={{
            width: "90%",
            // height: "100%",
            height: "calc(100vh - 134px)",
            // overflowY: "hidden",
            // py: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            // backgroundColor: "red",
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: { sm: "none", xs: "flex" },
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
              InboxHub
            </Typography>
            <IconButton
              onClick={() => setInboxTabsOpen(true)}
              sx={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                color: theme.palette.primary.contrastText,
                backgroundColor: theme.palette.primary.main,
              }}
            >
              <MailOutlined />
            </IconButton>
          </Box>

          <Grid container columnSpacing={3} sx={{ height: "100%", mt: 4 }}>
            <Drawer
              open={isSmDown ? inboxTabsOpen : false}
              variant="temporary"
              onClose={() => setInboxTabsOpen(false)}
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
                <IconButton onClick={() => setInboxTabsOpen(false)}>
                  <CloseOutlined />
                </IconButton>
              </Box>
              <InboxColumn
                value={value}
                handleChange={handleChange}
                isCampaignsLoading={isCampaignsLoading}
                campaignData={campaignData}
                currentCampaign={currentCampaign}
                setCurrentCampaign={setCurrentCampaign}
                handleClickCampaign={handleClickCampaign}
                showAll={showAll}
                setShowAll={setShowAll}
                handleSearchAccountChange={handleSearchAccountChange}
                handleSearchCampaignChange={handleSearchCampaignChange}
                handleSearchStatusChange={handleSearchStatusChange}
                memoizedAccountData={memoizedAccountData}
                isAccountsLoading={isAccountsLoading}
                currentAccount={currentAccount}
                setCurrentAccount={setCurrentAccount}
                isLabelsLoading={isLabelsLoading}
                statusLabels={displayedOptions}
                currentStatus={currentStatus}
                setCurrentStatus={setCurrentStatus}
                handleClickStatus={handleClickStatus}
                handleClickAccount={handleClickAccount}
                setOpenAllInboxes={setOpenAllInboxes}
                setOpenAllCampaigns={setOpenAllCampaigns}
                openAllCampaigns={openAllCampaigns}
                openAllInboxes={openAllInboxes}
                theme={theme}
                setInboxTabsOpen={setInboxTabsOpen}
                handleClickOpenAddStatusDialog={handleClickOpenAddStatusDialog}
              />
            </Drawer>
            <Grid item xs={4} sx={{ height: "100%", display: { xs: "none", sm: "block" } }}>
              <InboxColumn
                value={value}
                handleChange={handleChange}
                isCampaignsLoading={isCampaignsLoading}
                campaignData={campaignData}
                currentCampaign={currentCampaign}
                setCurrentCampaign={setCurrentCampaign}
                handleClickCampaign={handleClickCampaign}
                showAll={showAll}
                setShowAll={setShowAll}
                handleSearchAccountChange={handleSearchAccountChange}
                handleSearchCampaignChange={handleSearchCampaignChange}
                handleSearchStatusChange={handleSearchStatusChange}
                memoizedAccountData={memoizedAccountData}
                isAccountsLoading={isAccountsLoading}
                currentAccount={currentAccount}
                setCurrentAccount={setCurrentAccount}
                isLabelsLoading={isLabelsLoading}
                statusLabels={displayedOptions}
                currentStatus={currentStatus}
                setCurrentStatus={setCurrentStatus}
                handleClickStatus={handleClickStatus}
                handleClickAccount={handleClickAccount}
                setOpenAllInboxes={setOpenAllInboxes}
                setOpenAllCampaigns={setOpenAllCampaigns}
                openAllCampaigns={openAllCampaigns}
                openAllInboxes={openAllInboxes}
                theme={theme}
                setInboxTabsOpen={setInboxTabsOpen}
                handleClickOpenAddStatusDialog={handleClickOpenAddStatusDialog}
              />
            </Grid>
            <Grid item xs={12} sm={8} sx={{ height: "100%" }}>
              {!currentEmail ? (
                <>
                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: "calc(100vh - 180px)", sm: "calc(100vh - 140px)" },
                      backgroundColor: "white",
                      p: 2,
                      // pt: 0,
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      boxShadow: "0px 12px 15px 0px #4B71970D",
                      borderRadius: "12px",
                      flexDirection: "column",
                      overflowY: "auto",

                      // width
                      "&::-webkit-scrollbar": {
                        width: "14px",
                      },

                      // Track
                      "&::-webkit-scrollbar-track": {
                        borderRadius: "60px",
                      },

                      // /* Handle */
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#E4E4E5",
                        borderRadius: "10px",
                        border: "4px solid rgba(0, 0, 0, 0)",
                        backgroundClip: "padding-box",
                      },

                      // /* Handle on hover */
                      "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#d5d5d5",
                      },
                      position: "relative",
                    }}
                  >
                    {" "}
                    <Box sx={{ width: "100%", height: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",

                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: "18px",
                            color: "#28287B",
                          }}
                        >
                          All Inboxes
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: 400,
                            lineHeight: "16px",
                            color: "rgba(40, 40, 123, 0.5)",
                          }}
                        >
                          Last 90 days
                        </Typography>
                      </Box>
                      {/* <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      width: "100%",
                      cursor: "pointer",
                      border: "1px solid #E4E4E5",
                      borderRadius: "8px",
                      px: 2,
                      py: 1,
                      mt: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <IHAllIcon />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "18px",
                        color: "#28287B",
                        ml: 2,
                      }}
                    >
                      View All
                    </Typography>
                  </Box> */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: campaignEmails?.length === 0 ? "center" : "flex-start",
                          alignItems: "center",
                          flexDirection: "column",
                          overflowY: "auto",
                          mt: 2,
                          // p: 1,
                          width: "100%",
                          // height: "calc(100vh - 265px)",
                          height: "94%",
                          // width
                          "&::-webkit-scrollbar": {
                            width: "14px",
                          },

                          // Track
                          "&::-webkit-scrollbar-track": {
                            borderRadius: "60px",
                          },

                          // /* Handle */
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#E4E4E5",
                            borderRadius: "10px",
                            border: "4px solid rgba(0, 0, 0, 0)",
                            backgroundClip: "padding-box",
                          },

                          // /* Handle on hover */
                          "&::-webkit-scrollbar-thumb:hover": {
                            backgroundColor: "#d5d5d5",
                          },
                        }}
                      >
                        {isCampaignsEmailLoading ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              mt: 0,
                            }}
                          >
                            <CircularProgress sx={{}} size={25} thickness={5} />
                            <Typography
                              sx={{ fontSize: "16px", fontWeight: 600, color: "#4e88e6", ml: 2 }}
                            >
                              Loading...
                            </Typography>
                          </Box>
                        ) : campaignEmails?.length === 0 ? (
                          <Typography>No emails</Typography>
                        ) : (
                          //junaid
                          <>
                          {hasEmailWithLead ? (
                            campaignEmails?.map((i) => {
                              return (
                                <>
                                  {i.leads?.email ? (
                                    <Box
                                      sx={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        flexDirection: "column",
                                        backgroundColor:
                                          i?.portal_email_opened === false ? "#F0FFFF" : "",
                                        // backgroundColor: i.id === inboxSelectedID && "#E3E7FA",
                                        borderRadius: "8px",
                                        border:
                                          i.id === inboxSelectedID
                                            ? "1px solid rgba(0, 113, 246, 1)"
                                            : "1px solid rgba(228, 228, 229, 1)",
                                        cursor: "pointer",
                                        py: 1,
                                        px: 2,
                                        mb: 2,
                                        color: "#28287B",
                                        "&:hover": {
                                          backgroundColor: "#F2F4F6",
                                          color: "#3F4FF8",
                                        },
                                      }}
                                      onClick={() => {
                                        updateSelectedEmail(i._id);
                                        handlePortalEmailOpened(i._id, true);
                                        setReplyId(i);
                                        if (i.portal_email_opened === false) {
                                          refetch();
                                        }
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: {
                                            xs: "column",
                                            sm: "row",
                                          },
                                          justifyContent: {
                                            xs: "center",
                                            sm: "space-between",
                                          },
                                          alignItems: {
                                            xs: "flex-start",
                                            sm: "center",
                                          },
                                          width: "100%",
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            fontSize: "14px",
                                            fontWeight: 700,
                                            lineHeight: "20px",
                                          }}
                                        >
                                          {i.leads?.email ? i.leads?.email : "Unsubscribe User"}
                                        </Typography>
                                        <Typography
                                          sx={{
                                            fontSize: "13px",
                                            fontWeight: 400,
                                            lineHeight: "20px",
                                            color: "rgba(40, 40, 123, 0.5)",
                                          }}
                                        >
                                          {/* {format(new Date(i.createdAt), "MMM dd, yyyy")} */}
                                          {moment(i.createdAt).format("h:mm A")}
                                          {", "}
                                          {moment(i.createdAt).format("MM/DD/YYYY")}{" "}
                                        </Typography>
                                      </Box>
                                      <Typography
                                        sx={{
                                          fontSize: "13px",
                                          fontWeight: 400,
                                          lineHeight: "20px",
                                          color: "rgba(40, 40, 123, 0.5)",
                                          my: 1.5,
                                          textAlign: "left",
                                          width: "100%",
                                        }}
                                      >
                                        {i.subject}
                                      </Typography>{" "}
                                      <Typography
                                        sx={{
                                          fontSize: "13px",
                                          fontWeight: 500,
                                          lineHeight: "20px",
                                          color: "#28287B",
                                          textAlign: "left",
                                          width: "100%",
                                        }}
                                      >
                                        {/* {i.content} */}
                                        {parseBodyContent({
                                          body: i.body,
                                        })}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    ""
                                  )}
                                </>
                              );
                            })
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                mt: 0,
                                height: "100%",
                              }}
                            >
                              <Typography
                              >
                                No emails
                              </Typography>
                            </Box>
                          )}
                        </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: "calc(100vh - 180px)", sm: "calc(100vh - 140px)" },
                      backgroundColor: "white",
                      p: 2,
                      // pt: 0,
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      boxShadow: "0px 12px 15px 0px #4B71970D",
                      borderRadius: "12px",
                      flexDirection: "column",
                      overflowY: "hidden",

                      // width
                      "&::-webkit-scrollbar": {
                        width: "14px",
                      },

                      // Track
                      "&::-webkit-scrollbar-track": {
                        borderRadius: "60px",
                      },

                      // /* Handle */
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#E4E4E5",
                        borderRadius: "10px",
                        border: "4px solid rgba(0, 0, 0, 0)",
                        backgroundClip: "padding-box",
                      },

                      // /* Handle on hover */
                      "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#d5d5d5",
                      },
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",

                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {" "}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            mr: 2,
                            transform: "rotate(180deg)",
                          }}
                          onClick={() => {
                            setCurrentEmail();
                          }}
                        >
                          <IHForwardIcon />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: "18px",
                            color: "#28287B",
                          }}
                        >
                          Messages
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Button
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: "18px",
                            py: 1,
                            color: theme.palette.primary.contrastText,
                            backgroundColor: theme.palette.primary.main,
                            "&:hover": {
                              color: theme.palette.primary.contrastText,
                              backgroundColor: alpha(theme.palette.primary.main, 0.8),
                            },
                          }}
                          onClick={handleEditClick}
                        >
                          Reply
                        </Button>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            ml: 1,
                          }}
                        >
                          <Tooltip title="Forward" placement="top" arrow>
                            <IconButton sx={{ color: "#28287B" }} onClick={handleForwardClick}>
                              <RiShareForwardFill />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Tooltip title="More" placement="top" arrow>
                            <IconButton
                              onClick={handleClick}
                              size="small"
                              aria-controls={open ? "account-menu" : undefined}
                              aria-haspopup="true"
                              aria-expanded={open ? "true" : undefined}
                              sx={{ color: "#28287B" }}
                            >
                              <MoreVertOutlined />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <InboxMoreMenu
                          anchorEl={anchorEl}
                          open={open}
                          handleClose={handleClose}
                          theme={theme}
                          handleClickOpenLeadsDetailsDialog={handleClickOpenLeadsDetailsDialog}
                          handleClickOpenRemoveLeadDialog={handleClickOpenRemoveLeadDialog}
                          handleClickOpenDeleteThreadDialog={handleClickOpenDeleteThreadDialog}
                          handleClickOpenMoveToCampaignDialog={handleClickOpenMoveToCampaignDialog}
                          handlePortalEmailOpened={handlePortalEmailOpened}
                          replyId={replyId}
                          handleReload={handleReload}
                        />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",
                        flexDirection: { xs: "column" },
                        justifyContent: { xs: "center" },
                        alignItems: { xs: "flex-start" },
                        border: "1px solid #E4E4E5",
                        borderRadius: "8px",
                        my: 1,
                        p: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 700,
                          lineHeight: "18px",
                          color: "#28287B",
                        }}
                      >
                        {currentEmail?.leads?.email}
                      </Typography>
                      <StatusLabelSelect
                        handleClickOpenAddStatusDialog={handleClickOpenAddStatusDialog}
                        isLabelsLoading={isLabelsLoading}
                        statusLabels={statusLabels}
                        inboxSelectedID={inboxSelectedID}
                        label={currentEmail?.label}
                        fetchUpdatedData={fetchUpdatedData}
                      />

                      {/* <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: 400,
                            lineHeight: "16px",
                            color: "rgba(40, 40, 123, 0.5)",
                          }}
                        >
                          {/* {format(new Date(currentEmail?.createdAt), "MMM dd yyyy")} 
                          {moment(currentEmail?.createdAt).format("MM/DD/YYYY")}
                        </Typography> */}
                    </Box>
                    <Box
                      sx={{
                        mt: 2,
                        width: "100%",
                        height: "fit-content",
                        p: 2,
                        border: "1px solid #E4E4E5",
                        borderRadius: "8px",
                        overflowY: "auto",
                        // width
                        "&::-webkit-scrollbar": {
                          width: "14px",
                        },

                        // Track
                        "&::-webkit-scrollbar-track": {
                          borderRadius: "60px",
                        },

                        // /* Handle */
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#E4E4E5",
                          borderRadius: "10px",
                          border: "4px solid rgba(0, 0, 0, 0)",
                          backgroundClip: "padding-box",
                        },

                        // /* Handle on hover */
                        "&::-webkit-scrollbar-thumb:hover": {
                          backgroundColor: "#d5d5d5",
                        },
                      }}
                    >
                      {" "}
                      {/* <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "20px",
                          color: "rgba(40, 40, 123, 0.5)",
                          mt: 1.5,
                          pb: 1.5,
                          borderBottom: "1px solid #E4E4E5",
                        }}
                      >
                        {currentEmail?.subject}
                      </Typography>{" "}
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 500,
                          lineHeight: "20px",
                          color: "#28287B",
                          mt: 2,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "flex-start",
                          flexDirection: "column",
                        }}
                      >
                        {parse(currentEmail?.body)}
                      </Typography> */}
                      {isCampaignsEmailReplyLoading ? (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            mt: 10,
                          }}
                        >
                          <CircularProgress sx={{}} size={25} thickness={5} />
                          <Typography
                            sx={{ fontSize: "16px", fontWeight: 600, color: "#4e88e6", ml: 2 }}
                          >
                            Loading...
                          </Typography>
                        </Box>
                      ) : (
                        <>
                         {Array.isArray(mailReplies) &&
                            mailReplies?.map((j, index) => {
                              return (
                                <>
                                  {" "}
                                  <Box
                                    key={index}
                                    sx={{
                                      display: "flex",
                                      width: "100%",
                                      flexDirection: { xs: "column", sm: "row" },
                                      justifyContent: { xs: "center", sm: "space-between" },
                                      alignItems: { xs: "flex-start", sm: "center" },
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        lineHeight: "18px",
                                        color: "#28287B",
                                      }}
                                    >
                                      {j.to}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 400,
                                        lineHeight: "16px",
                                        color: "rgba(40, 40, 123, 0.5)",
                                      }}
                                    >
                                      {/* {format(new Date(j.date), "MMM dd yyyy")} */}
                                      {moment(j.date).format("h:mm A")}
                                      {", "}
                                      {moment(j.date).format("MM/DD/YYYY")}
                                    </Typography>
                                  </Box>
                                  <Typography
                                    sx={{
                                      fontSize: "13px",
                                      fontWeight: 400,
                                      lineHeight: "20px",
                                      color: "rgba(40, 40, 123, 0.5)",
                                      mt: 1.5,
                                      pb: 1.5,
                                      borderBottom: "1px solid #E4E4E5",
                                    }}
                                  >
                                    {j.subject === "Re:" ? j.subject +" "+ "No Subject" : j.subject }
                                  </Typography>{" "}
                                  <Typography
                                    sx={{
                                      fontSize: "13px",
                                      fontWeight: 500,
                                      lineHeight: "20px",
                                      color: "#28287B",
                                      mt: 2,
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "flex-start",
                                      flexDirection: "column",
                                    }}
                                  >
                                    {parse(j.bodyTextHtml)}
                                  </Typography>
                                </>
                              );
                            })
                          }
                          <Box
                            sx={{
                              display: "flex",
                              width: "100%",
                              flexDirection: { xs: "column", sm: "row" },
                              justifyContent: { xs: "center", sm: "space-between" },
                              alignItems: { xs: "flex-start", sm: "center" },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                lineHeight: "18px",
                                color: "#28287B",
                              }}
                            >
                              {currentEmail?.leads?.email}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 400,
                                lineHeight: "16px",
                                color: "rgba(40, 40, 123, 0.5)",
                              }}
                            >
                              {/* {format(new Date(currentEmail?.createdAt), "MMM dd yyyy")} */}
                              {moment(currentEmail?.createdAt).format("h:mm A")}
                              {", "}
                              {moment(currentEmail?.createdAt).format("MM/DD/YYYY")}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 400,
                              lineHeight: "20px",
                              color: "rgba(40, 40, 123, 0.5)",
                              mt: 1.5,
                              pb: 1.5,
                              borderBottom: "1px solid #E4E4E5",
                            }}
                          >
                            {currentEmail?.subject}
                          </Typography>{" "}
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 500,
                              lineHeight: "20px",
                              color: "#28287B",
                              mt: 2,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "flex-start",
                              flexDirection: "column",
                            }}
                          >
                            {parse(currentEmail?.body)}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
      {/* old design */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
          height: "100%",
          position: "relative",
          pr: 0,
          display: "none",
        }}
      >
        <Box sx={{ width: "300px", visibility: "hidden" }}></Box>
        <Box
          sx={{
            width: "300px",
            height: "100%",
            borderRight: "2px solid rgba(0,0,0,0.1)",
            borderLeft: "1px solid rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "column",
            position: "fixed",
            top: "67px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: "100%",
              p: 2,
              alignItems: "center",
              justifyContent: "flex-start",
              borderBottom: "2px solid rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              sx={{
                color: "rgba(0,0,0,0.5)",
                fontSize: "12px",
              }}
            >
              Mail
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              p: 1,
              cursor: "pointer",
            }}
          >
            <Button
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                p: 2,
                py: 1,
                // backgroundColor: "rgba(0,0,0,0.1)",

                width: "100%",
                borderRadius: "3px",
                color: "black",
              }}
            >
              <Send fontSize="small" sx={{ color: "#3f8c59" }} />
              <Typography sx={{ fontSize: "14px", fontWeight: 600, ml: 1 }}>View All</Typography>
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              p: 1,
              pt: 0,
              cursor: "pointer",
            }}
          >
            <Button
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                p: 2,
                py: 1,
                // backgroundColor: "rgba(0,0,0,0.1)",

                width: "100%",
                borderRadius: "3px",
                color: "black",
              }}
              onClick={() => {
                setOpenAllCampaigns(!openAllCampaigns);
              }}
            >
              <ArrowForwardIos
                fontSize="small"
                sx={{
                  color: "#3f8c59",
                  width: "14px",
                  rotate: openAllCampaigns && "90deg",
                  transition: "all 0.2s ease-out",
                }}
              />
              <CallMade fontSize="small" sx={{ ml: 1 }} />
              <Typography sx={{ fontSize: "14px", fontWeight: 600, ml: 1 }}>
                All Campaigns
              </Typography>
            </Button>
          </Box>{" "}
          <Box
            sx={{
              width: "100%",
              maxHeight: "350px",
              display: !openAllCampaigns && "none",
              p: 1,
              pt: 0,
              transition: "all 0.2s ease-out",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                p: 2,
                py: 1,
                pt: 0,
                pl: 3,
                maxHeight: "350px",
                overflowY: "scroll",
              }}
            >
              {" "}
              <TextField variant="standard" placeholder="Search" size="small" sx={{}} />
              {!isCampaignsLoading &&
                campaignData?.docs?.map((i) => {
                  return (
                    <>
                      {" "}
                      <Button
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          // p: 2,
                          py: 1,
                          px: 0.5,
                          my: 0.5,
                          // backgroundColor: "rgba(0,0,0,0.1)",

                          width: "100%",
                          borderRadius: "3px",
                          color: "black",
                        }}
                      >
                        <Typography
                          sx={{ fontSize: "12px", fontWeight: 600, ml: 1, color: "black" }}
                        >
                          {i.title}
                        </Typography>
                      </Button>
                    </>
                  );
                })}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              p: 1,
              pt: 0,
              cursor: "pointer",
            }}
          >
            <Button
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                p: 2,
                py: 1,
                // backgroundColor: "rgba(0,0,0,0.1)",

                width: "100%",
                borderRadius: "3px",
                color: "black",
              }}
              onClick={() => {
                setOpenAllInboxes(!openAllInboxes);
              }}
            >
              <ArrowForwardIos
                fontSize="small"
                sx={{
                  color: "#3f8c59",
                  width: "14px",
                  rotate: openAllInboxes && "90deg",
                  transition: "all 0.2s ease-out",
                }}
              />
              <Storage fontSize="small" sx={{ ml: 1 }} />
              <Typography sx={{ fontSize: "14px", fontWeight: 600, ml: 1 }}>All Inboxes</Typography>
            </Button>
          </Box>{" "}
          <Box
            sx={{
              width: "100%",
              maxHeight: "350px",
              display: !openAllInboxes && "none",
              p: 1,
              pt: 0,
              transition: "all 0.2s ease-out",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                p: 2,
                py: 1,
                pt: 0,
                pl: 3,
                maxHeight: "350px",
                overflowY: "scroll",
              }}
            >
              {" "}
              <TextField variant="standard" placeholder="Search" size="small" sx={{}} />
              {inboxData.map((i) => {
                return (
                  <>
                    {" "}
                    <Button
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        // p: 2,
                        py: 1,
                        px: 0.5,
                        my: 0.5,
                        // backgroundColor: "rgba(0,0,0,0.1)",

                        width: "100%",
                        borderRadius: "3px",
                        color: "black",
                      }}
                    >
                      <Typography sx={{ fontSize: "12px", fontWeight: 600, ml: 1, color: "black" }}>
                        {i.user}
                      </Typography>
                    </Button>
                  </>
                );
              })}
            </Box>
          </Box>
        </Box>
        <Box sx={{ width: "450px", height: "100%", borderRight: "2px solid rgba(0,0,0,0.1)" }}>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              p: 2,
              alignItems: "center",
              justifyContent: "flex-start",
              borderBottom: "2px solid rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              sx={{
                color: "rgba(0,0,0,0.75)",
                fontSize: "14px",
              }}
            >
              All Inboxes |
            </Typography>
            <Typography
              sx={{
                color: "rgba(0,0,0,0.4)",
                fontSize: "14px",
                ml: 1,
              }}
            >
              last 90 days
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              p: 1,
              alignItems: "center",
              justifyContent: "flex-start",
              borderBottom: "2px solid rgba(0,0,0,0.1)",
            }}
          >
            <Button variant="" sx={{ fontSize: "14  px" }}>
              View All
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "column",
              overflowY: "scroll",
              p: 1,
              width: "100%",
              height: "calc(100vh - 175px)",
              // mt: "110px",
            }}
          >
            {inboxData.map((i) => {
              return (
                <>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      "&:hover": {
                        backgroundColor: i.id !== inboxSelectedID && "rgba(0,0,0,0.05)",
                      },
                      backgroundColor: i.id === inboxSelectedID && "#E3E7FA",
                      borderRadius: 1,
                      cursor: "pointer",
                      p: 2,
                    }}
                    onClick={() => {
                      updateSelectedEmail(i.id);
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
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "rgba(0,0,0,0.5)",
                          fontFamily: "Roboto, sans-serif",
                        }}
                      >
                        {i.user}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Roboto, sans-serif",
                          fontSize: "12px",
                          color: "rgba(0,0,0,0.5)",
                        }}
                      >
                        {i.date}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "Roboto, sans-serif",
                        fontSize: "14px",
                        color: "rgba(0,0,0,0.5)",
                        mb: 2,
                      }}
                    >
                      Automatic reply: Supercharge Your Email Campaigns with AI Technology
                    </Typography>{" "}
                    <Typography
                      sx={{
                        fontFamily: "Roboto, sans-serif",
                        fontSize: "14px",
                      }}
                    >
                      {/* {i.content} */}
                      {i.content.length <= 90 ? i.content : i.content.substring(0, 90 - 3) + "..."}
                    </Typography>
                  </Box>
                </>
              );
            })}
          </Box>
        </Box>
        <Box
          sx={{
            width: "calc(100% - 750px)",
            height: "calc(100vh - 64px)",
            overflowY: "scroll",
          }}
        >
          {inboxSelectedID ? (
            <>
              {" "}
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  p: 2,
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "2px solid rgba(0,0,0,0.1)",
                  height: "55px",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {" "}
                  <IconButton>
                    <Reply />
                  </IconButton>
                  <IconButton>
                    <Forward />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ height: "100%", p: 1, backgroundColor: "#F8F8F8" }}></Box>
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <EmailOutlined sx={{ color: "rgba(0,0,0,0.1)", width: "110px", height: "110px" }} />
              </Box>
            </>
          )}
        </Box>
      </Box>
      <Dialog
        open={isEditorDialogOpen}
        onClose={() => setIsEditorDialogOpen(false)}
        fullWidth
        maxWidth="md"
        sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
        disableEnforceFocus={true}
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: "25px",
            letterSpacing: "0em",
            color: "#28287B",
            position: "relative",
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>Send reply email</Typography>
          <IconButton
            sx={{ position: "absolute", right: 0, top: 0 }}
            onClick={() => setIsEditorDialogOpen(false)}
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              width: "100%",
              borderRadius: 2,
              border: "1px solid rgba(0,0,0,0.1)",
              p: 2,
              pb: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <form onSubmit={() => {}} style={{ width: "100%" }} variant="primary">
              <Box
                sx={{
                  width: "100%",

                  justifyContent: "center",
                  alignContent: "center",
                  display: "flex",
                }}
              >
                <Grid
                  container
                  // spacing={3}
                  maxWidth={"md"}
                  sx={{ position: "relative", ml: 0, mt: 0 }}
                >
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      px: 2,
                      py: 1,
                      backgroundColor: theme.palette.grey[100],
                      borderRadius: "16px",
                    }}
                  >
                    <Grid item xs={12} md={8} sx={{ borderRadius: "10px" }}>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                              mr: 2,
                            }}
                          >
                            Subject:
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            sx={{
                              "& div input": {
                                border: "none",
                                fontWeight: 600,
                              },
                              "& div fieldset": {
                                border: "none",
                              },
                            }}
                            placeholder="Your subject"
                            name="subject"
                            value={editorSubject}
                            readOnly={true}
                            onClick={() => {}}
                          />
                        </Box>
                      </Stack>
                      {/* <Hidden mdUp>
                        <IconButton
                          aria-label="more"
                          id="long-button"
                          aria-controls={showParams ? "long-menu" : undefined}
                          aria-expanded={showParams ? "true" : undefined}
                          aria-haspopup="true"
                          sx={{ border: 2, position: "absolute", top: 10, right: 10 }}
                          onClick={() => {
                            setShowParams((prev) => !prev);
                          }}
                        >
                          <MoreVertOutlined />
                        </IconButton>
                      </Hidden> */}
                    </Grid>
                    <Grid item xs={4} sx={{ display: { xs: "none", md: "block" } }}>
                      <Box
                        sx={{
                          // borderLeft: "1px solid rgba(0,0,0,0.1)",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          pl: 1,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        {/* <Tooltip
                          title={
                            cursorLocation === 1
                              ? "Insert variables in body"
                              : "Insert variables in subject"
                          }
                          arrow
                          placement="top"
                        >
                          <Button
                            variant="contained"
                            sx={{
                              backgroundColor: "#E7F0FF",
                              "&:hover": {
                                backgroundColor: "#E7F0FF",
                              },
                              mr: 1,
                            }}
                            onClick={() => {}}
                          >
                            <BoltIcon />
                          </Button>
                        </Tooltip> */}
                        <Tooltip title="" arrow placement="top">
                          <Button
                            onClick={() => {
                              getEmailBodyFromPrompt(editorContent);
                            }}
                            variant="outlined"
                            sx={{
                              mr: 1,
                              borderColor: "#28287B",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: 24,
                                height: 24,
                              }}
                            >
                              {isWriteEmailLoading ? (
                                <CircularProgress size={16} thickness={5} />
                              ) : (
                                <OpenAiIcon />
                              )}
                            </Box>
                          </Button>
                        </Tooltip>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Button
                            variant="contained"
                            sx={{
                              cursor: "pointer",
                            }}
                            disabled={isSendingReply}
                            onClick={sendReplyEmail}
                          >
                            {isSendingReply ? <CircularProgress></CircularProgress> : <> Send </>}
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  {isMobile && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          // borderLeft: "1px solid rgba(0,0,0,0.1)",
                          display: "flex",
                          justifyContent: { xs: "space-between", sm: "flex-end" },
                          alignItems: "center",

                          width: "100%",
                          height: "100%",
                          my: 0.5,
                        }}
                      >
                        {/* <Tooltip
                        title={
                          cursorLocation === 1
                            ? "Insert variables in body"
                            : "Insert variables in subject"
                        }
                        arrow
                        placement="top"
                      >
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#E7F0FF",
                            "&:hover": {
                              backgroundColor: "#E7F0FF",
                            },
                            mr: 1,
                          }}
                          onClick={() => {}}
                        >
                          <BoltIcon />
                        </Button>
                      </Tooltip> */}
                        <Tooltip title="" arrow placement="top">
                          <Button
                            onClick={() => {
                              getEmailBodyFromPrompt(editorContent);
                            }}
                            variant="outlined"
                            sx={{
                              mr: 1,
                              borderColor: "#28287B",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: 24,
                                height: 24,
                              }}
                            >
                              {isWriteEmailLoading ? (
                                <CircularProgress size={16} thickness={5} />
                              ) : (
                                <OpenAiIcon />
                              )}
                            </Box>
                          </Button>
                        </Tooltip>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Button
                            variant="contained"
                            sx={{
                              borderTopRightRadius: 0,
                              borderBottomRightRadius: 0,
                            }}
                            disabled={isSendingReply}
                            onClick={sendReplyEmail}
                          >
                            {isSendingReply ? <CircularProgress></CircularProgress> : <> Send </>}
                          </Button>
                          <Button
                            variant="contained"
                            sx={{
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              px: 0.5,
                              py: "8.3px",
                              minWidth: "auto",
                            }}
                          >
                            <ArrowDropDown fontSize="small" />
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  <Grid
                    item
                    xs={12}
                    sm={8}
                    sx={{ py: 1, minHeight: { xs: "500px", sm: "fit-content" } }}
                  >
                    <Editor
                      apiKey={config.TINYMCE_EDITOR_API}
                      onEditorChange={(value) => {
                        setEditorContent(value);
                        hasMoreThanFiveWords(value);
                      }}
                      onClick={handleEditorClick}
                      value={editorContent}
                      onInit={(evt, editor) => (editorRef.current = editor)}
                      init={{
                        height: "100%",
                        selector: "textarea",
                        init_instance_callback: function (editor) {
                          var freeTiny = document.querySelector(".tox .tox-notification--in");
                          if (freeTiny) {
                            freeTiny.style.display = "none";
                          }
                          const statusBarTextContainer = document.querySelector(
                            ".tox .tox-statusbar__text-container"
                          );
                          statusBarTextContainer.style.display = "none";
                          const statusBar = document.querySelector(".tox .tox-statusbar");
                          statusBar.style.border = "none";
                        },
                        menubar: false,
                        plugins: [
                          "mentions advlist autolink lists link image charmap print preview anchor",
                          "searchreplace visualblocks code fullscreen",
                          "insertdatetime media paste code help wordcount",
                          "autolink",
                          "link","emoticons"
                        ],
                        toolbar:
                          "undo redo | formatselect | " +
                          "bold italic backcolor | link | alignleft aligncenter " +
                          "alignright alignjustify | bullist numlist outdent indent | " +
                          "removeformat | emoticons",
                        content_style:
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        emoticons_append: {
                          custom_mind_explode: {
                            keywords: ["brain", "mind", "explode", "blown"],
                            char: "🤯",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Stack spacing={3} sx={{ p: 2 }}>
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 700,
                          lineHeight: "20px",
                          color: "#28287B",
                        }}
                      >
                        Email template insights
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
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
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            Subject Count
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {subjectCount}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={subjectCount}
                          maxCountOf={maxSubjectCount}
                          minRange={3}
                          maxRange={5}
                          barColor={
                            subjectCount > 8 || subjectCount < 3
                              ? "red"
                              : subjectCount > 5
                              ? "orange"
                              : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
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
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            Word Count
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {wordCount}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={wordCount}
                          maxCountOf={maxWordCount}
                          minRange={16}
                          maxRange={150}
                          barColor={
                            wordCount > 300 || wordCount < 16
                              ? "red"
                              : wordCount > 150
                              ? "orange"
                              : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
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
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            Reading time
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {readingTime}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={readingTime}
                          maxCountOf={maxReadingTime}
                          minRange={11}
                          maxRange={60}
                          barColor={
                            readingTime >= 70
                              ? "red"
                              : readingTime > 60 && readingTime < 70
                              ? "yellow"
                              : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
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
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            URL Count
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {urlCount}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={urlCount}
                          maxCountOf={maxLinks}
                          minRange={0}
                          maxRange={1}
                          barColor={
                            urlCount > 2 || urlCount < 0 ? "red" : urlCount > 1 ? "orange" : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
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
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            Question Count
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {questionCount}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={questionCount}
                          maxCountOf={maxQuestions}
                          minRange={0}
                          maxRange={2}
                          barColor={
                            questionCount > 3 || questionCount < 0
                              ? "red"
                              : questionCount > 2
                              ? "orange"
                              : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
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
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            Spam word count
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {spamCount}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={spamCount}
                          maxCountOf={maxSpams}
                          minRange={0}
                          maxRange={15}
                          barColor={
                            spamCount > 10 || spamCount < 0
                              ? "red"
                              : spamCount > 7
                              ? "orange"
                              : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          mt: 1,
                          width: "100%",
                        }}
                      >
                        {/* <Box>
                          <Tooltip title="Templates" arrow>
                            <IconButton
                              onClick={() => {
                                setTempOpenModal(true);
                              }}
                              aria-label="Templates"
                            >
                              <AutoAwesomeMosaicIcon sx={{ color: "#28287B", fontWeight: 600 }} />
                            </IconButton>
                          </Tooltip>
                     
                          <Dialog
                            open={tempOpenModal}
                            onClose={() => setTempOpenModal(false)}
                            fullWidth
                            maxWidth="lg"
                            sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
                            disableEnforceFocus={true}
                            fullScreen={isMobile}
                          >
                            <DialogTitle
                              sx={{
                                position: "relative",
                              }}
                            >
                              <Typography
                                variant="h4"
                                component="h2"
                                sx={{ color: "#28287B", fontWeight: 700, fontSize: "20px" }}
                              >
                               
                                Templates Library
                              </Typography>
                              <IconButton
                                sx={{ position: "absolute", right: 0, top: 0 }}
                                onClick={() => setTempOpenModal(false)}
                              >
                                <CloseOutlined />
                              </IconButton>
                            </DialogTitle>
                            <DialogContent sx={{ pb: 0, overflow: "hidden" }}>
                              <Grid
                                container
                                sx={{ bgcolor: "background.paper", gap: { xs: 2, md: 0 } }}
                              >
                                <Grid
                                  item
                                  xs={12}
                                  md={3}
                                  sx={{
                                    bgcolor: "background.paper",
                                    maxHeight: "100%",
                                    height: "fit-content",
                                    border: "1px solid #E4E4E5",
                                    borderRadius: "12px",
                                  }}
                                >
                                  <Tabs
                                    orientation={isMobile ? "horizontal" : "vertical"}
                                    variant="scrollable"
                                    value={value}
                                    onChange={handleChange}
                                    aria-label="Vertical tabs example"
                                    sx={{
                                      borderRight: 1,
                                      borderColor: "divider",
                                      width: "100%",

                                      "& .MuiTabs-indicator": { display: "none" },
                                      p: { xs: 0.5, md: 2 },
                                    }}
                                  >
                                    {templateEmails.map((item, index) => (
                                      <Tab
                                        onClick={() => {
                                          setSelectedTemplate(item.id);
                                        }}
                                        icon={<DescriptionOutlined />}
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          justifyContent: "flex-start",
                                          alignItems: "center",
                                          textAlign: "left",
                                          gap: 2,
                                          minHeight: "52px",

                                          color: "#28287B",
                                          borderRadius: "8px",
                                          fontSize: "14px",
                                          fontWeight: "700",
                                          "&.Mui-selected": {
                                            backgroundColor: theme.palette.grey[200],
                                            color: theme.palette.primary.main,
                                          },
                                        }}
                                        // label={
                                        //   item.subject.length > 22
                                        //     ? `${item.subject.substring(0, 22)}...`
                                        //     : item.subject
                                        // }
                                        label={item.subject}
                                        {...a11yProps(index)}
                                        key={index}
                                      />
                                    ))}
                                  </Tabs>
                                </Grid>
                                <Grid item xs={12} md={9}>
                                  {templateEmails.map((item, index) => (
                                    <TabPanel key={index} value={value} index={index}>
                                      <Box
                                        sx={{
                                          flexGrow: 1,
                                          bgcolor: "background.paper",
                                          display: "flex",
                                          mt: 1,
                                          mb: { xs: 1, md: 0 },
                                        }}
                                      >
                                        <Typography
                                          variant="h4"
                                          component="h2"
                                          sx={{
                                            color: "#28287B",
                                            lineHeight: 1.5,
                                            fontWeight: 700,
                                            fontSize: "16px",
                                            px: 2,
                                          }}
                                        >
                                          {item.subject}
                                        </Typography>
                                      </Box>
                                      <Divider sx={{ mt: "13px" }} />
                                      <Box
                                        sx={{
                                          // bgcolor: "#E2E9E9",
                                          px: "16px",
                                          borderRadius: "15px",
                                          height: {
                                            xs: "calc(100vh - 260px)",
                                            md: "calc(100vh - 275px)",
                                          },
                                          overflow: "auto",
                                          scrollbarWidth: "thin",
                                          "&::-webkit-scrollbar": {
                                            width: "8px",
                                          },
                                          "&::-webkit-scrollbar-thumb": {
                                            backgroundColor: "#8492a6",
                                            borderRadius: "4px",
                                          },
                                          "&::-webkit-scrollbar-track": {
                                            backgroundColor: "#E2E9E9",
                                            borderRadius: "15px",
                                          },
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            color: "#28287B",
                                            fontSize: "13px",
                                            fontWeight: "500",
                                          }}
                                          dangerouslySetInnerHTML={{ __html: item.body }}
                                        />
                                      </Box>
                                    </TabPanel>
                                  ))}
                                </Grid>
                              </Grid>
                            </DialogContent>
                            <DialogActions>
                              <Stack
                                mt={2}
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 2,
                                  px: { xs: "16px" },
                                }}
                              >
                                <Button
                                  sx={{ m: 0, width: "48%" }}
                                  variant="outlined"
                                  onClick={() => {
                                    if (selectedTemplate !== null) {
                                      const selectedTemplateObj = templateEmails.find(
                                        (item) => item.id === selectedTemplate
                                      );
                                      if (selectedTemplateObj) {
                                        const clipboardText = selectedTemplateObj.body
                                          .replace(/<\/?p>/g, "")
                                          .replace(/<br\s?\/?>/g, "\n");
                                        navigator.clipboard
                                          .writeText(clipboardText)
                                          .then(() => {
                                            toast.success("Email copied to clipboard");
                                          })
                                          .catch((err) => {
                                            toast.error("Unable to copy to clipboard");
                                          });
                                      }
                                    }
                                  }}
                                >
                                  <Typography variant="h6" component="h6">
                                    Copy
                                  </Typography>
                                </Button>
                                <Button
                                  variant="contained"
                                  onClick={() => {
                                    if (selectedTemplate !== null) {
                                      const selectedTemplateObj = templateEmails.find(
                                        (item) => item.id === selectedTemplate
                                      );
                                      if (selectedTemplateObj) {
                                        setEditorContent(selectedTemplateObj.body);
                                        setEditorSubject(selectedTemplateObj.subject);
                                        // handleImportEmailsClick(true, formik);
                                        setTempOpenModal(false);
                                      }
                                    }
                                    // formik.handleSubmit();
                                  }}
                                  sx={{ cursor: "pointer", width: "48%" }}
                                >
                                  <Typography variant="h6" component="h6">
                                    Use Template
                                  </Typography>
                                </Button>
                              </Stack>
                            </DialogActions>
                          </Dialog>
                        </Box> */}
                        <Button
                          sx={{ px: 2, width: "30px" }}
                          color="primary"
                          variant="outlined"
                          type="submit"
                          id="submit-btn"
                          onClick={handleSubmit}
                        >
                          Check
                        </Button>
                        {editorContent && contentLength && (
                          <Button
                            sx={{ px: 1, py: 1, width: "auto", ml: 2 }}
                            color="primary"
                            variant="contained"
                            type="Button"
                            onClick={handleOptimizeClick}
                            disabled={isOptimizeEmailLoading}
                          >
                            {isOptimizeEmailLoading ? (
                              <CircularProgress size={25} thickness={5} />
                            ) : (
                              "Optimize"
                            )}
                          </Button>
                        )}
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </form>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={forwardPopupOpen}
        onClose={() => setForwardPopupOpen(false)}
        fullWidth
        maxWidth="sm"
        sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
        disableEnforceFocus={true}
      >
        <DialogTitle>Forward to</DialogTitle>
        <DialogContent>
          <TextField
            id="name"
            placeholder="Enter email"
            type="email"
            fullWidth
            variant="outlined"
            autoComplete="off"
            value={forwardEmail}
            onChange={(event) => {
              setForwardEmail(event.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={isLoadingForward} onClick={sendForwardMail}>
            {" "}
            {isLoadingForward ? <CircularProgress></CircularProgress> : <> Send </>}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openLeadsDetailsDialog}
        onClose={handleCloseLeadsDetailsDialog}
        fullWidth
        maxWidth="sm"
        sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
      >
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
                  {getInitials(currentEmail?.leads?.firstName, currentEmail?.leads?.lastName)}
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
                  {currentEmail?.leads?.email}
                </Typography>
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
            firstName
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mt: 2,
              width: "100%",
            }}
          >
            <Button onClick={() => {handleLeadEdit()}} variant="contained">
              Save
            </Button>
          </Box>
        </Box>
      </Dialog>
      <Dialog
        open={openRemoveLeadDialog}
        onClose={handleCloseRemoveLeadDialog}
        fullWidth
        maxWidth="sm"
        sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 1,
            px: 4,
            pt: 4,
          }}
        >
          <PersonOff />
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: "28px",
              letterSpacing: "0em",
              color: "#28287B",
            }}
          >
            Remove Lead
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  sx={{
                    "&.MuiCheckbox-root .MuiSvgIcon-root": { color: theme.palette.primary.main },
                  }}
                  checked={removeLeadOptions.allDomain}
                  onChange={(e) =>
                    setRemoveLeadOptions({ ...removeLeadOptions, allDomain: e.target.checked })
                  }
                />
              }
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "18px",
                letterSpacing: "0em",
                color: "#28287B",
                my: { xs: 1, sm: 0 },
              }}
              label="Remove all leads from the same company
              (email domain)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  sx={{
                    "&.MuiCheckbox-root .MuiSvgIcon-root": { color: theme.palette.primary.main },
                  }}
                  checked={removeLeadOptions.allCampaign}
                  onChange={(e) =>
                    setRemoveLeadOptions({ ...removeLeadOptions, allCampaign: e.target.checked })
                  }
                />
              }
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "18px",
                letterSpacing: "0em",
                color: "#28287B",
                my: { xs: 1, sm: 0 },
              }}
              label="Remove from all campaigns"
            />
            <FormControlLabel
              control={
                <Checkbox
                  sx={{
                    "&.MuiCheckbox-root .MuiSvgIcon-root": { color: theme.palette.primary.main },
                  }}
                  checked={removeLeadOptions.blocklist}
                  onChange={(e) =>
                    setRemoveLeadOptions({ ...removeLeadOptions, blocklist: e.target.checked })
                  }
                />
              }
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "18px",
                letterSpacing: "0em",
                color: "#28287B",
                my: { xs: 1, sm: 0 },
              }}
              label="Add email to blocklist"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseRemoveLeadDialog}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleRemoveLeadsClick} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDeleteThreadDialog}
        onClose={handleCloseDeleteThreadDialog}
        fullWidth
        maxWidth="sm"
        sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
      >
        <DialogTitle>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: "28px",
              letterSpacing: "0em",
              color: "#28287B",
            }}
          >
            Delete Thread
          </Typography>
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete all the emails in this thread? The emails will still be in
          your inbox, but will no longer be visible.
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseDeleteThreadDialog}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleDeleteThreadClick} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
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
            options={campaignNames?.filter((c) => c._id !== currentEmail?.campaign_id) || []}
            getOptionLabel={(option) => option.name || ""}
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
        <DialogActions sx={{ mb: 3, mx: 2 }}>
          <Button onClick={handleMoveToCampaignDialogClose} variant="outlined" fullWidth>
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            disabled={!selectedCampaign}
            onClick={handleMoveToCampaignDialogSave}
          >
            {isMovingToCampaign ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Move to Campaign"
            )}{" "}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openAddStatusDialog}
        onClose={handleCloseAddStatusDialog}
        fullWidth
        maxWidth="sm"
        sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
      >
        <DialogTitle>
          <Typography>Create Lead Label</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Label*"
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
            inputRef={statusLabelRef}
            // value={statusLabelName}
            // onChange={(e) => {
            //   e.preventDefault();
            //   setStatusLabelName(e.target.value);
            // }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="demo-simple-select-label">Select interest status*</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Select interest status*"
              onChange={(e) => setStatusType(e.target.value)}
              // sx={{ width: "100%", mt: 2 }}
              placeholder="select interest status"
              value={statusType}
            >
              <MenuItem value={"positive"}>Positive</MenuItem>
              <MenuItem value={"negative"}>Negative</MenuItem>
              <MenuItem value={"neutral"}>Neutral</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseAddStatusDialog}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateLabel} disabled={isCreatingLabel}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Page;
