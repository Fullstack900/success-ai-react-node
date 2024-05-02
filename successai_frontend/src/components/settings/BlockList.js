import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Stack,
  useMediaQuery,
  Popover,
} from "@mui/material";
import { Close, Delete, Download } from "@mui/icons-material";

import { SBSearch } from "src/assets/sidebar/SBSearch";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon";
import { AllCheckboxCustomIcon } from "src/assets/general/AllCheckboxCustomIcon";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon";

import { EACloseIcon } from "src/assets/emailAccounts/EACloseIcon";
import { BulkUploadIcon } from "src/assets/campaignDetailsLeads/BulkUploadIcon";

import { ManualEmailIcon } from "src/assets/campaignDetailsLeads/ManualEmailIcon";
import { Google } from "src/assets/Google";
import { ArrowLeftIconBlue } from "src/assets/emailAccounts/connect/ArrowLeftIconBlue";
import { ArrowRight } from "src/assets/general/ArrowRight";
import { useNavigate } from "react-router-dom";

import GoogleSheetImport from "./GoogleSheetImport";
import ManualImport from "./ManualImport";
import CsvImport from "./CsvImport";

import { toast } from "react-hot-toast";
import _ from "lodash";
import { downloadCsv } from "src/utils/util.js";
import {
  useGetBlocklistMutation,
  useDeleteBlocklistMutation,
  useAddBlocklistMutation,
} from "src/services/account-service.js";
import Pagination from "../Pagination";

import { AiOutlineClose } from "react-icons/ai";

// const filterButtons = [
//   {
//     name: "Contacted",
//     value: "contacted",
//     icon: (active) => <PlayIcon color={active ? "#0071F6" : "#28287B"} />,
//   },
//   {
//     name: "Bounced",
//     value: "bounced",
//     icon: (active) => <DraftIcon color={active ? "#0071F6" : "#28287B"} />,
//   },
//   {
//     name: "Not Contacted",
//     value: "not contacted",
//     icon: (active) => <PauseIcon color={active ? "#0071F6" : "#28287B"} />,
//   },
//   {
//     name: "Complete",
//     value: "complete",
//     icon: (active) => <ErrorIcon color={active ? "#0071F6" : "#28287B"} />,
//   },
//   {
//     name: "Unsubscribe",
//     value: "unsubscribe",
//     icon: (active) => <CompletedIcon color={active ? "#0071F6" : "#28287B"} />,
//   },
// ];

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && (
        <Box sx={{}}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const BlockList = ({ campaign }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [isLoadingMoreAccounts, setIsLoadingMoreAccounts] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [checkedAll, setCheckedAll] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteBlock, setDeleteBlock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [limitCount, setLimitCount] = useState(0);
  const [offsetCount, setOffsetCount] = useState(0);
  const [loader, setLoader] = useState(false);
  const [isLoadingBlocklist, setIsLoadingBlocklist] = useState(false);
  const [blockListCreate, setBlockListCreate] = useState(false);
  const [googleSheetLink, setGoogleSheetLink] = useState("");
  const [addBlocklist, { isLoading: isUploading }] = useAddBlocklistMutation();
  const [getBlocklist] = useGetBlocklistMutation();
  const [deleteBlocklist] = useDeleteBlocklistMutation();

  // pagination

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const offset = leads?.length;

  // menu
  const [selectType, setSelectType] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  // useEffect(() => {
  //   let searchResult = testLeads;
  //   if (search !== "") {
  //     searchResult = testLeads.filter((lead) => lead.includes(search));
  //   }
  //   setLeads(searchResult);
  // }, [search]);
  //   const handleLoadMoreClick = async () => {
  //     const { docs, total } = await getLeads({
  //       id: campaign._id,
  //       params: { offset: leads.length },
  //     }).unwrap();
  //     setLeads([...leads, ...docs]);
  //     setTotalLeads(total);
  //   };

  const handelUploadSheet = async () => {
    try {
      const { message, totalAdded } = await addBlocklist({
        data: {
          type: "Google_Link",
          link: googleSheetLink,
        },
      }).unwrap();
      toast.success(message);
      setBlockListCreate(true);
    } catch (error) {
      toast.error(error.data.error.message);
    }
  };

  useEffect(() => {
    setDeleteBlock(false);
    setBlockListCreate(false);
    if (page === 1) {
      const timer = setTimeout(async () => {
        setIsLoadingBlocklist(true);
        const { docs, total } = await getBlocklist({
          params: _.pickBy({ search, offset: 0, limit }),
        }).unwrap();
        setTotal(total);
        setLeads(docs);
        // setOffsetCount(offset);
        // setLimitCount(limit);
        setIsLoadingBlocklist(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [search, deleteBlock, blockListCreate, getBlocklist, page, limit]);
  useEffect(() => {
    if (offset < total && page > 1) {
      const timer = setTimeout(async () => {
        setIsLoadingBlocklist(true);
        const { docs, total } = await getBlocklist({
          params: _.pickBy({ search, offset: limit * (page - 1), limit }),
        }).unwrap();
        setTotal(total);
        setLeads(docs);
        // setOffsetCount(offset);
        // setLimitCount(limit);
        setIsLoadingBlocklist(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [page, search]);

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(1);
  };

  // const handleLoadMoreClick = async () => {
  //   setLoader(true);
  //   const { docs, total, limit, offset } = await getBlocklist({
  //     params: {
  //       offset: offsetCount + limitCount,
  //     },
  //   }).unwrap();
  //   setTotal(total);
  //   setLeads([...leads, ...docs]);
  //   setOffsetCount(offset);
  //   setLimitCount(limit);
  //   setLoader(false);
  // };

  const handleSelectLeadChange = (lead, checked) => {
    let updatedSelectedLeads = [...selectedLeads];
    if (checked) {
      updatedSelectedLeads.push(lead);
    } else {
      if (checkedAll) {
        setCheckedAll(false);
        setSelectType(null);
      }
      updatedSelectedLeads = selectedLeads.filter((e) => e._id !== lead._id);
    }
    setSelectedLeads(updatedSelectedLeads);
  };

  const onBlockListCreate = (data) => {
    setBlockListCreate(true);
    setActiveStep(0);
    setIsImportLeadsDialogOpen(false);
  };

  const handleSelectAllLeadsChange = async (checked, type) => {
    if (checked) {
      setSelectType(type);
      setCheckedAll(true);
      if (type === "all") {
        const { docs } = await getBlocklist({
          params: {
            search,
            offset: 0,
            limit: total,
          },
        }).unwrap();
        setSelectedLeads(docs);
      } else {
        setSelectedLeads(leads);
      }
    } else {
      setSelectedLeads([]);
      setCheckedAll(false);
      setSelectType(null);
    }
  };

  const handleDeleteClick = async () => {
    // const { message } = await deleteLeads({ leads: selectedLeads }).unwrap();
    // toast.success(message);
    try {
      const data = selectedLeads.map((lead) => {
        return lead._id;
      });
      const { message } = await deleteBlocklist({ lists: data }).unwrap();
      setDeleteBlock(true);
      // setSelectedLeads([]);
      toast.success(message);
      //
      if (selectType === "all") {
        setLeads([]);
        setSelectedLeads([]);
        setCheckedAll(false);
        setSelectType(null);
        setTotal(0);
      } else {
        let offset = 0;
        let pageNum = page;
        const pageCount = Math.ceil((total - selectedLeads.length) / limit);
        if (selectType === "page") {
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
          const { docs, total } = await getBlocklist({
            params: _.pickBy({ search, offset, limit }),
          }).unwrap();

          setLeads(docs);
          setSelectedLeads([]);
          setCheckedAll(false);
          setSelectType(null);
          setTotal(total);
        } else {
          setPage(pageNum);
          setSelectedLeads([]);
          setCheckedAll(false);
          setSelectType(null);
        }
      }
    } catch (err) {
      toast.error(err.data.error.message);
    }
  };

  const handleDownloadLeadsClick = () => {
    const data = selectedLeads.map((lead) => {
      return { email: lead.email };
    });
    downloadCsv("Blocklist", data);
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

  const [value, setValue] = useState(0);

  return (
    <Grid container width={"100%"}>
      <Grid
        item
        xs={12}
        sm={3}
        display={"flex"}
        flexDirection={{ xs: "row", sm: "column" }}
        pt={"30px"}
      >
        <Button
          sx={{
            justifyContent: "flex-start",
            color: value === 0 ? theme.palette.primary.main : "#000000",
            fontWeight: value === 0 ? "700" : "400",
          }}
          onClick={() => setValue(0)}
        >
          Default
        </Button>
        <Button
          sx={{
            justifyContent: "flex-start",
            color: value === 1 ? theme.palette.primary.main : "#000000",
            fontWeight: value === 1 ? "700" : "400",
          }}
          onClick={() => setValue(1)}
        >
          Google Sheets
        </Button>
      </Grid>
      <Grid item xs={12} sm={9} pt={"30px"}>
        <CustomTabPanel value={value} index={0}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: { xs: "center", sm: "space-between" },
              alignItems: { xs: "flex-start", sm: "center" },

              pr: 0.5,
              pl: 0.5,
              rowGap: 1,
            }}
          >
            <Box sx={{ display: "flex", width: { xs: "100%", sm: "fit-content" } }}>
              <Box
                aria-owns={open ? "mouse-over-popover" : undefined}
                aria-haspopup="true"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
              >
                <Tooltip
                  title={selectedLeads.length ? "Uncheck All" : "Select"}
                  arrow
                  placement="top"
                >
                  <Checkbox
                    inputProps={{ "aria-label": "controlled" }}
                    size="small"
                    icon={<OffCheckboxCustomIcon />}
                    checkedIcon={<AllCheckboxCustomIcon />}
                    //  checked={selectedLeads.length === leads?.length}

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
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                PaperProps={{
                  onMouseEnter: () => setAnchorEl(anchorEl),
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
                placeholder="Search by email"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </Box>
            <Box
              display={"flex"}
              gap={2}
              sx={{
                width: { xs: "100%", sm: "fit-content" },
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {selectedLeads.length > 0 && (
                <Tooltip
                  title={isDeleting ? "Erasing..." : "Erase the Selected Leads"}
                  arrow
                  placement="top"
                >
                  {isDeleting ? (
                    <CircularProgress size={20} sx={{ mx: 1, color: "red" }} />
                  ) : (
                    <IconButton onClick={handleDeleteClick}>
                      <Delete sx={{ color: "red" }} fontSize="small" />
                    </IconButton>
                  )}
                </Tooltip>
              )}
              {selectedLeads.length > 0 && (
                <Tooltip title="Download block list" arrow placement="top">
                  <IconButton onClick={handleDownloadLeadsClick}>
                    <Download sx={{ color: "rgba(0,0,0,0.6)" }} fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
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
                }}
                variant="outlined"
                size="large"
                onClick={handleClickOpenImportLeadsDialog}
              >
                Import
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              flexDirection: "column",

              py: 2,
              px: 0.5,
            }}
          >
            {isLoadingBlocklist ? (
              <CircularProgress />
            ) : leads?.length !== 0 ? (
              <Box sx={{ width: "100%" }}>
                {leads?.map((lead) => (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      width: "100%",
                      borderTop: `1px solid ${theme.palette.grey[300]}`,
                      py: 1,
                    }}
                  >
                    <Checkbox
                      size="small"
                      icon={<OffCheckboxCustomIcon />}
                      checkedIcon={<OnCheckboxCustomIcon />}
                      checked={selectedLeads.some((selected) => selected._id === lead._id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event, checked) => handleSelectLeadChange(lead, checked)}
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
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#000000",
                          lineHeight: "16.38px",
                        }}
                      >
                        {lead.email}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {/* <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 5 }}
                >
                  <Button
                    disabled={leads.length === total}
                    variant="contained"
                    onClick={handleLoadMoreClick}
                  >
                    {" "}
                    {loader ? <CircularProgress /> : <> Load More </>}
                  </Button>
                </Box> */}
                <Box sx={{ mt: 2 }}>
                  <Pagination
                    page={page}
                    setPage={setPage}
                    total={total}
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
                          Input Emails Manually
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
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      alignItems: "center",
                      rowGap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        cursor: "pointer",
                        width: "100%",
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
                        alignItems: "flex-start",
                        cursor: "pointer",
                        width: "100%",
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
                        setActiveStep(2);
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
                        alignItems: "flex-start",
                        cursor: "pointer",
                        width: "100%",
                        p: 3,
                        border: "1px solid #0071F6",
                        flexDirection: "column",
                        height: "100%",
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0px 12px 15px 0px #4B71970D",
                      }}
                      onClick={() => {
                        setActiveStep(3);
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
                <CsvImport campaign={campaign} onBlockListCreate={onBlockListCreate} />
              ) : activeStep === 2 ? (
                <ManualImport campaign={campaign} onBlockListCreate={onBlockListCreate} />
              ) : activeStep === 3 ? (
                <GoogleSheetImport campaign={campaign} onBlockListCreate={onBlockListCreate} />
              ) : null}
            </DialogContent>
          </Dialog>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Stack spacing={4}>
            <Box sx={{ borderBottom: `1px solid ${theme.palette.grey[300]}`, pb: 2 }}>
              <Typography
                sx={{ fontSize: "12px", color: theme.palette.grey[600], fontWeight: "500" }}
              >
                Add a list of emails to avoid during lead import
              </Typography>
            </Box>
            <Stack spacing={2}>
              <Typography sx={{ fontSize: "14px", color: "", fontWeight: "700" }}>
                💡Make sure your Google Sheet is publicly accessible
              </Typography>

              <Typography
                sx={{ fontSize: "14px", color: theme.palette.grey[600], fontWeight: "400" }}
              >
                ⚠️Do not delete your sheet, or make it private
              </Typography>
            </Stack>

            <Stack
              sx={{
                maxWidth: "100%",
              }}
              spacing={1}
            >
              <TextField
                fullWidth
                label="Google Sheets Link"
                id="fullWidth"
                variant="outlined"
                disabled={isUploading}
                value={googleSheetLink}
                onChange={(e) => setGoogleSheetLink(e.target.value)}
              />
              <Button
                sx={{
                  width: "fit-content",
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  border: `1px solid ${theme.palette.primary.main}`,
                  p: 1,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.contrastText,
                    color: theme.palette.primary.main,
                  },
                  "&:disabled": {
                    backgroundColor: theme.palette.grey[300],
                    color: theme.palette.grey[500],
                    border: `1px solid ${theme.palette.grey[300]}`,
                  },
                }}
                onClick={handelUploadSheet}
                disabled={!googleSheetLink.trim() || isUploading}
              >
                Set Block list
              </Button>
            </Stack>
          </Stack>
        </CustomTabPanel>
      </Grid>
    </Grid>
  );
};

export default BlockList;
