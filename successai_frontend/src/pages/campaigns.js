import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  CircularProgress,
  Popover,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  alpha,
} from "@mui/material";
import CampaignBlock from "src/components/campaigns/campaignBlock";
import { Plus } from "src/assets/general/Plus";
import { CalendarIcon } from "src/assets/general/CalendarIcon";
import { DropDown } from "src/assets/general/DropDown";
import { DeleteIcon } from "src/assets/general/DeleteIcon";
import { FilterIcon } from "src/assets/general/FilterIcon";
import { SBSearch } from "src/assets/sidebar/SBSearch";
import { PlayIcon } from "src/assets/general/PlayIcon";
import { DraftIcon } from "src/assets/general/DraftIcon";
import { PauseIcon } from "src/assets/general/PauseIcon";
import { CompletedIcon } from "src/assets/general/CompletedIcon";
import { ErrorIcon } from "src/assets/general/ErrorIcon";
import { EACloseIcon } from "src/assets/emailAccounts/EACloseIcon";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import {
  useCreateCampaignMutation,
  useGetCampaignsPaginationMutation,
} from "src/services/campaign-service";
import { EDSCancelIconBlue } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSCancelIcon";
import { ArrowRightLong } from "src/assets/general/ArrowRightLong";
import { TNNotification } from "src/assets/topnav/TNNotification";
import { AiOutlineClose } from "react-icons/ai";
import { countStatus } from "src/utils/util";
import NotificationSearchAdd from "src/components/notificationSearchAdd";
import Pagination from "src/components/Pagination";
import AddNewCampaignBlock from "src/components/campaigns/addNewCampaignBlock";

const filterButtons = [
  {
    name: "Active Status",
    value: "active",
    icon: (active) => <PlayIcon color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "In Draft",
    value: "draft",
    icon: (active) => <DraftIcon color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "On Pause",
    value: "paused",
    icon: (active) => <PauseIcon color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "Error Detected",
    value: "error",
    icon: (active) => <ErrorIcon color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "Completed",
    value: "completed",
    icon: (active) => <CompletedIcon color={active ? "#0071F6" : "#28287B"} />,
  },
];

const sortButtons = [
  {
    name: "Sort by Name",
    value: "name",
  },
  {
    name: "Sort by Date Created",
    value: "-createdAt",
  },
];

const Page = () => {
  const [createCampaign] = useCreateCampaignMutation();
  const [campaign, setCampaign] = useState([]);
  const [campaignCreate, setCampaignCreate] = useState(true);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);

  const getTimezoneOffset = () => {
    function z(n) {
      return (n < 10 ? "0" : "") + n;
    }
    var offset = new Date().getTimezoneOffset();
    var sign = offset < 0 ? "+" : "-";
    offset = Math.abs(offset);
    return sign + z((offset / 60) | 0) + ":" + z(offset % 60);
  };
  const getUserTimezone = (isOffset) => {
    // const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userTimezone =  Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York' }).resolvedOptions().timeZone;
    const offset = getTimezoneOffset();
    const timezoneWithOffset = userTimezone + " " + `(GMT${offset})`;
    const defaultTimeZone = 'America/New_York (GMT-05:00)';
    // return userTimezone;
    return isOffset ? defaultTimeZone : userTimezone;
  };

  const formik = useFormik({
    initialValues: {
      name: "Your Campaign Title",
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required("Name is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        values.tzFormat = getUserTimezone(true);
        values.tz = getUserTimezone(false);
        const { message } = await createCampaign(values).unwrap();
        toast.success(message);
        setOpenAddCampaignDialog(false);
        setCampaignCreate(true);
        formik.setFieldValue("name", "Your Campaign Title");
        window.Intercom("trackEvent", "Campaign created");
      } catch (err) {
        helpers.setErrors({ submit: err.data.error.message });
      }
    },
  });

  const [openAddCampaignDialog, setOpenAddCampaignDialog] = useState(false);

  const handleClickOpenAddDialog = () => {
    setOpenAddCampaignDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddCampaignDialog(false);
  };

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(null);
  const [sort, setSort] = useState(sortButtons[1]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoadingMoreCampaign, setisLoadingMoreCampaign] = useState(false);
  const [campaignChange, setCampaignChange] = useState(false);
  const [getCampaigns] = useGetCampaignsPaginationMutation();
  const offset = campaign.length;
  // const limit = 15;

  const onCampaignChange = () => {
    setCampaignChange(true);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };
  
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  useEffect(() => {
    if (page === 1) {
      setCampaignCreate(false);
      setCampaignChange(false);
      setIsCampaignsLoading(true);
      const timer = setTimeout(async () => {
        setIsCampaignsLoading(true);
        const { docs, totalDocs } = await getCampaigns({
          search,
          filter: filter?.value,
          sortBy: sort?.value,
          limit,
          zone: userTimezone
        }).unwrap();
        setTotal(totalDocs);
        window.Intercom("update", {
          campaigns_created: totalDocs,
        });
        setCampaign(docs);
        setIsCampaignsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [search, , filter, sort, campaignChange, campaignCreate, getCampaigns, page, limit]);

  useEffect(() => {
    if (offset < total && page > 1) {
      const timer = setTimeout(async () => {
        setIsCampaignsLoading(true);
        const { docs, totalDocs } = await getCampaigns({
          search,
          filter: filter?.value,
          sortBy: sort?.value,
          offset: offset * (page - 1),
          limit,
          zone: userTimezone
        }).unwrap();
        setTotal(totalDocs);
        setCampaign(docs);
        setIsCampaignsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [page, search, filter, sort]);

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(1);
  };

  /* useEffect(() => {
    const handler = async () => {
      if (isLoadingMoreCampaign) return;
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
      if (Math.round(scrollHeight - scrollTop) === clientHeight && offset < total) {
        setisLoadingMoreCampaign(true);
        const { docs, totalDocs } = await getCampaigns({
          search,
          filter: filter?.value,
          offset,
          limit,
        }).unwrap();
        setTotal(totalDocs);
        setCampaign([...campaign, ...docs]);
        setisLoadingMoreCampaign(false);
      }
    };

    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [isLoadingMoreCampaign, search, filter, total, offset, limit, getCampaigns]); */

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

  const [anchorEl2, setAnchorEl2] = useState(null);
  const handleClickSort = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleCloseSort = () => {
    setAnchorEl2(null);
  };
  const open2 = Boolean(anchorEl2);
  const id2 = open ? "simple-popover" : undefined;
  const [anchorEl3, setAnchorEl3] = useState(null);
  const handleClick3 = (event) => {
    setAnchorEl3(event.currentTarget);
  };
  const handleClose3 = () => {
    setAnchorEl3(null);
  };
  const open3 = Boolean(anchorEl3);
  const theme = useTheme();
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
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: { xs: "center", sm: "space-between" },
              alignItems: { xs: "flex-start", sm: "center" },
              rowGap: 2,
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
              Campaigns
            </Typography>
            {/* <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={handleClick3}
                sx={{
                  border: `1px solid ${theme.palette.grey[300]}`,
                  p: 1,
                  borderRadius: "8px",
                  height: 50,
                  width: 50,
                }}
              >
                <TNNotification />
              </IconButton>

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
                  width: 300,
                  height: 50,

                  backgroundColor: "white",
                  "& div": { pl: 0.3 },
                  "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                  "& div input": {
                    py: 1.8,
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "16px",
                    letterSpacing: "0em",
                    "&::placeholder": {
                      color: "rgba(40, 40, 123, 0.5)",
                    },
                  },
                }}
                placeholder="Search campaigns"
                onChange={handleSearchChange}
              />
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
                  px: 1.5,
                  py: 1.5,
                  pr: "18px",
                }}
                variant="outlined"
                size="large"
                onClick={handleClickOpenAddDialog}
              >
                <Box
                  sx={{ mr: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  <Plus />
                </Box>
                Add New
              </Button>
            </Box> */}
            <NotificationSearchAdd
              handleNotificationClick={handleClick3}
              handleSearch={handleSearchChange}
              handleAdd={handleClickOpenAddDialog}
            />
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
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
                  height: "40px",
                }}
                color="inherit"
                onClick={handleClickSort}
              >
                <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                >
                  <CalendarIcon />
                </Box>

                {sort.name}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    ml: 1,
                    transform: open2 && "rotate(-180deg)",
                  }}
                >
                  <DropDown />
                </Box>
              </Button>
            </Box>

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
                  // mr: 2,
                  "&:hover": {
                    backgroundColor: "white",
                  },
                  border: filter ? "1px solid #0071F6" : "1px solid #E4E4E5",
                  height: "40px",
                  px: 2,
                }}
                onClick={handleClick}
              >
                <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                >
                  <FilterIcon />
                </Box>
                Filter
              </Button>
            </Box>
          </Box>
          {filter && (
            <Box sx={{ display: { xs: "block", sm: "none" }, width: "100%", mt: 2 }}>
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
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", ml: 1 }}
                >
                  <AiOutlineClose />
                </Box>
              </Button>
            </Box>
          )}

          {isCampaignsLoading && !isLoadingMoreCampaign ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 10 }}>
              <CircularProgress size={25} thickness={5} />
              <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#4e88e6", ml: 2 }}>
                Loading...
              </Typography>
            </Box>
          ) : (
            <Grid container sx={{ mt: 1 }} spacing={3}>
              {campaign?.map((campaign) => {
                return (
                  <Grid item key={campaign._id} xs={12} sm={6} md={4}>
                    <CampaignBlock campaign={campaign} onCampaignChange={onCampaignChange} />
                  </Grid>
                );
              })}
              <Grid item key={0} xs={12} sm={6} md={4}>
                <AddNewCampaignBlock onClick={handleClickOpenAddDialog} />
              </Grid>
              {Math.ceil(total / limit) > 0 && (
                <Grid
                  item
                  xs={12}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Pagination
                    page={page}
                    setPage={setPage}
                    total={total}
                    length={campaign?.length}
                    limit={limit}
                    handleLimitChange={handleLimitChange}
                  />
                </Grid>
              )}
            </Grid>
          )}
          {/*isLoadingMoreCampaign && <CircularProgress sx={{ mt: 5 }} />*/}
        </Box>
      </Box>
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
                  setPage(1);
                  handleClose();
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

      <Popover
        id={id2}
        open={open2}
        anchorEl={anchorEl2}
        onClose={handleCloseSort}
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
            width: "220px",
          }}
        >
          {sortButtons.map((item, i) => {
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
                  backgroundColor: sort?.name === item.name && "rgb(33, 111, 237, 0.1)",
                }}
                onClick={() => {
                  setSort(item);
                  handleCloseSort();
                  setPage(1);
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

      <Dialog
        open={openAddCampaignDialog}
        onClose={handleCloseAddDialog}
        fullWidth
        maxWidth="sm"
        sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
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
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "28px",
                  color: "#28287B",
                }}
              >
                Let's launch a fresh campaign! 🔥
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  color: "#8181B0",
                }}
              >
                What name do you have in mind?
              </Typography>
            </Box>
            <IconButton
              sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
              onClick={handleCloseAddDialog}
            >
              <EACloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form noValidate onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              placeholder="Enter campaign name"
              variant="outlined"
              defaultValue="Your Campaign Title"
              sx={{
                width: "100%",
                height: 40,
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
                mt: 0,
                mb: 6,
              }}
              error={!!(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              name="name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            {formik.errors.submit && (
              <Typography
                color="error"
                sx={{ mt: 3, textAlign: "center", width: "100%" }}
                variant="body2"
              >
                {formik.errors.submit}
              </Typography>
            )}
            {formik.isSubmitting ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 10 }}>
                <CircularProgress size={25} thickness={5} />
                <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#4e88e6", ml: 2 }}>
                  Loading...
                </Typography>
              </Box>
            ) : (
              <Grid container columnSpacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "14px",
                      py: 1.5,
                    }}
                    onClick={handleCloseAddDialog}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mr: 1,
                      }}
                    >
                      <EDSCancelIconBlue />
                    </Box>
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "14px",
                      py: 1.5,
                    }}
                    disabled={!formik.isValid}
                    type="submit"
                  >
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mr: 1,
                        }}
                      >
                        <ArrowRightLong />
                      </Box>
                      Continue
                    </>
                  </Button>
                </Grid>
              </Grid>
            )}
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
};

export default Page;
