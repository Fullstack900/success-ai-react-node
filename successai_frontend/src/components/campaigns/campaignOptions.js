import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  FormControl,
  FormHelperText,
  InputLabel,
  Autocomplete,
  Stack,
  Chip,
} from "@mui/material";
import { RocketLaunch, SaveAltOutlined, WarningRounded } from "@mui/icons-material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { toast } from "react-hot-toast";
import CustomCheckbox from "../CustomCheckbox";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon";
import { SaveIconBlue } from "src/assets/general/SaveIcon";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { FireIcon } from "src/assets/general/FireIcon";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import {
  useGetAccountsMutation,
  accountsAdded,
  setAccounts,
} from "src/services/account-service.js";
import {
  useUpdateConfigurationsMutation,
  useCampaignLaunchMutation,
  useGetCampaignQuery,
} from "src/services/campaign-service.js";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useUpdateIntercomMutation } from "src/services/intercom-service";
import { useGetMeQuery } from "src/services/user-service";
import { AiOutlineClose } from "react-icons/ai";
import { alpha } from "@material-ui/core";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;


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

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
  autoFocus: false,
};

const CampaignOptions = ({ campaign }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { options } = campaign;

  const [valueTabs, setValueTabs] = React.useState(0);
  const [emails, setEmails] = useState([]);

  const dispatch = useDispatch();

  let emailAccounts = [];
  const accounts = useSelector((state) => state.accounts);
  accounts?.forEach((element) => {
    emailAccounts.push(element.email);
  });

  useEffect(() => {
    if(options?.emailAccounts?.length){
      setEmails(options?.emailAccounts);
    }
  },[options]);

  const handleFieldSelectionAndValidation = (event, node) => {

    const newValues = node;
    const currentEmail= event?.target?.innerText;

    setEmails(newValues);
    const objectFound = accounts.find((obj) => obj?.email === currentEmail);
    if (objectFound?.status == "reconnect") {
      if (!newValues.includes(currentEmail)) {
        formik.setFieldValue("emailAccounts", newValues);
      } else {
        toast.error("This account is on reconnect, please reconnect it to use it in the campaign");
      }
    } else {
      formik.setFieldValue("emailAccounts", newValues);

      if (objectFound?.status === "paused" && newValues.includes(currentEmail)) {
        toast.error("This account is inactive, please active it to use it in the campaign");
      }
    }
  };
  const [getAccounts, { isLoading: isAccountsLoading }] = useGetAccountsMutation();

  const { refetch: refetchCampaign } = useGetCampaignQuery(campaign._id);

  // Search, filter and pagination
  const [isLoadingMoreAccounts, setIsLoadingMoreAccounts] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(null);
  const [total, setTotal] = useState(0);
  const [launch, setLaunch] = useState(false);
  const offset = accounts.length;
  const limit = 15;
  const [updateIntercom] = useUpdateIntercomMutation();
  const { data: user, refetch: refetchUser } = useGetMeQuery();

  // max leads limit dialog
  const [highdailyMaxLimitDialogOpen, setHighdailyMaxLimitDialogOpen] = useState(false);
  const [boundHighdailyMaxLimitDialogOpen, setBoundHighdailyMaxLimitDialogOpen] = useState(false);
  const [isHighLimitOkay, setIsHighLimitOkay] = useState(false);
  const [notChecked, setNotChecked] = useState(false);

  const highdailyMaxLimitDialogClose = () => {
    setHighdailyMaxLimitDialogOpen(false);
  };
  const highdailyMaxLimitBoundDialogClose = () => {
    setBoundHighdailyMaxLimitDialogOpen(false);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { docs, total } = await getAccounts({
        search,
        filter: filter?.value,
        unibox: true,
      }).unwrap();
      dispatch(setAccounts(docs));
      setTotal(total);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filter, limit, getAccounts, dispatch]);

  useEffect(() => {
    const handler = async () => {
      if (isLoadingMoreAccounts) return;
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

      if (scrollHeight - scrollTop === clientHeight && offset < total) {
        setIsLoadingMoreAccounts(true);
        const { docs, total } = await getAccounts({
          search,
          filter: filter?.value,
          offset,
          limit,
        }).unwrap();
        dispatch(accountsAdded(docs));
        setTotal(total);
        setIsLoadingMoreAccounts(false);
      }
    };

    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [isLoadingMoreAccounts, search, filter, total, offset, limit, getAccounts, dispatch]);

  const [UpdateConfigurations, { isLoading: isOptionLoading }] = useUpdateConfigurationsMutation();

  const formik = useFormik({
    initialValues: {
      emailAccounts: options?.emailAccounts,
      dailyMaxLimit: options?.dailyMaxLimit,
      // dailyMaxLeadsLimit: options?.dailyMaxLeadsLimit,
      stopOnReply: options?.stopOnReply,
      stopOnAutoReply: options?.stopOnAutoReply,
      trackOpen: options?.trackOpen,
      trackClickedLink: options?.trackClickedLink,
      textOnly: options?.textOnly,
    },
    validationSchema: Yup.object({
      emailAccounts: Yup.array()
        .min(1, "At least one email account is required")
        .of(Yup.string().required("Email account is required")),
      dailyMaxLimit: Yup.string()
        .matches(/^[0-9]+$/, "Please enter numerical digits only")
        .required("Daily Max Limit is required"),
      // dailyMaxLeadsLimit: Yup.string()
      //   .matches(/^[0-9]+$/, "Please enter numerical digits only")
      //   .required("Daily Max Leads Limit is required"),
    }),
    onSubmit: async (values) => {
      try {
        if (values.dailyMaxLimit === "") {
          formik.setFieldValue("dailyMaxLimit", "20");
        }
        if (values?.dailyMaxLimit > 50 && values?.dailyMaxLimit <= 5000 && !isHighLimitOkay) {
          setHighdailyMaxLimitDialogOpen(true);
          return;
        }
        if (values?.dailyMaxLimit > 5000 && !isHighLimitOkay) {
          setBoundHighdailyMaxLimitDialogOpen(true);
          formik.setFieldValue("dailyMaxLimit", "20");
          return;
        }
        setHighdailyMaxLimitDialogOpen(false);
        setBoundHighdailyMaxLimitDialogOpen(false);
        setIsHighLimitOkay(false);
        const { message } = await UpdateConfigurations({
          campaignID: campaign._id,
          options: values,
        }).unwrap();
        toast.success(message);
        refetchCampaign();
      } catch (err) {
        toast.error(err.data.error.message);
      }
    },
  });

  const inactiveAccounts = formik?.values?.emailAccounts.filter((email) => {
    const foundObject = accounts?.find((obj) => obj.email === email);
    return foundObject?.status === "paused";
  });

  const [campaignLaunch, { isLoading: isSendingCampaign }] = useCampaignLaunchMutation();

  const launchCampaign = async (formik) => {
    try {
      setLaunch(true);
      if (formik.values.emailAccounts.length < 1) {
        toast.error("Please Add email account and save campaign first");
        return;
      }

      if (formik.values.dailyMaxLimit < 1) {
        toast.error("Daily limit must be greater than 200");
        return;
      }
      if (formik.values.dailyMaxLimit > 5000) {
        toast.error("The daily limit must not exceed 5000.");
        return;
      }

      let selectedAccountsObject = [];

      formik.values.emailAccounts.forEach((email) => {
        const data = accounts?.find((obj) => obj.email === email);
        selectedAccountsObject.push(data);
      });

      // check if all selected accounts are paused
      const isAllAccountsPaused = selectedAccountsObject.every((acc) => acc.status === "paused");
      if (isAllAccountsPaused) {
        toast.error(
          "All selected accounts are inactive, please activate them to use in the campaign"
        );
        return;
      }

      // default
      const { message } = await campaignLaunch({ id: campaign._id }).unwrap();
      refetchCampaign();
      toast.success(message);
      await updateIntercom({ user: user._id, attribute: "campaigns_launched" });
      window.Intercom("trackEvent", "Campaign launched");
      navigate("/campaigns");
    } catch (err) {
      toast.error(err.data.error.message);
    }
  };

  const isAnySelectedAccountPaused = (array) => {
    const selectedAccountPaused = array.map((email) => {
      const foundObject = accounts?.find((obj) => obj.email === email);
      return foundObject?.status === "paused";
    });
    return selectedAccountPaused.includes(true);
  };

  const isSelectedAccountPausedByEmail = (email) => {
    const foundObject = accounts?.find((obj) => obj.email === email);
    return foundObject?.status === "paused";
  };

  const handleCloseEmail = (email) => {
    const index = emails.indexOf(email);
    if (index !== -1) {
      const newEmails = [...emails];
      newEmails.splice(index, 1);
      formik.setFieldValue("emailAccounts", newEmails);
      setEmails(newEmails);
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
          flexDirection: "column",
        }}
      >
        {" "}
        <form noValidate onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
          {" "}
          <Box
            sx={{
              boxShadow: "0px 12px 15px 0px #4B71970D",
              borderRadius: "12px",
              // pb: 5,
              // px: 4,
              // pt: 1,
              backgroundColor: "white",
              width: "100%",
              p: 3,
            }}
          >
            <Tabs
              value={valueTabs}
              onChange={(e, value) => setValueTabs(value)}
              aria-label="basic tabs example"
              variant="fullWidth"
              TabIndicatorProps={{
                style: { display: "none" },
              }}
              sx={{
                backgroundColor: "#F2F4F6",
                width: "100%",
                borderRadius: "8px",

                border: "1px solid #F2F4F7",
                "& .MuiTabs-flexContainer": {
                  overflowX: "auto",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                },
                "& .MuiTab-root": {
                  m: "5px",
                  p: 0,
                  minHeight: "38px",
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "20px",
                  letterSpacing: "0em",

                  borderRadius: "5px",
                },
                "& .MuiTab-root.Mui-selected": {
                  backgroundColor: "#FFFFFF",
                  borderRadius: "8px",
                  boxShadow: "0px 1px 2px 0px #1018280F",
                },
              }}
            >
              <Tab label="Accounts" />
              <Tab label="Reply Stops" />
              <Tab label="Tracking" />
              <Tab label="Daily Limit" />
              <Tab label="Optimized Sending" sx={{ minWidth: "165px" }} />
            </Tabs>
            <Box sx={{ mt: 3 }}>
              {valueTabs === 0 ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 4,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 700,
                          lineHeight: "20px",
                          letterSpacing: "0em",
                          color: "#28287B",
                        }}
                      >
                        Accounts to use
                      </Typography>{" "}
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "22px",
                          letterSpacing: "0em",
                          color: "#8181B0",
                        }}
                      >
                        Select one or more accounts to send emails from
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <FormControl
                        sx={{ width: "100%" }}
                        error={!!(formik.touched.emailAccounts && formik.errors.emailAccounts)}
                      >
                        <Autocomplete
                              multiple
                              disableCloseOnSelect
                              id="email-accounts-autocomplete"
                              options={emailAccounts}
                              value={formik.values.emailAccounts}
                              onChange={(event, value) => handleFieldSelectionAndValidation(event, value)}
                              onBlur={formik.handleBlur("emailAccounts")}
                              loading={isAccountsLoading}
                              loadingText={<Box sx={{display: 'flex', justifyContent: 'center', alignItems:'center'}}>
                                <CircularProgress size={20}  sx={{mr: 1}} /><Typography sx={{color: '#0071F6'}}>Loading...</Typography>
                              </Box>}
                              renderInput={(params) => (
                                  <TextField
                                      {...params}
                                      variant="outlined"
                                      label="Search and select emails"
                                  />
                              )}
                              renderOption={(name, option, { selected }) => {
                                  const selectedAccountPaused = isSelectedAccountPausedByEmail(name?.key);
                                  return (
                                      <Box sx={{ display: "flex", alignItems: "center" }} {...name}>
                                          <Checkbox checked={selected}/>
                                          <ListItemText primary={name?.key} /> {selectedAccountPaused ? "(Inactive)" : null}
                                      </Box>
                                  );
                              }}
                              renderValue={(selected) => {
                                  const selectedAccountPaused = isAnySelectedAccountPaused(selected);
                                  return (
                                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                          <Typography
                                              sx={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                              }}
                                          >
                                              <Box
                                                  sx={{
                                                      display: "flex",
                                                      gap: 1,
                                                      marginBottom: 1,
                                                      flexWrap: "wrap",
                                                  }}
                                              ></Box>
                                              {selectedAccountPaused ? (
                                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                                      <ErrorOutlineIcon sx={{ fontSize: "1rem", color: "red", marginRight: 1 }} />
                                                      <p style={{ margin: "0", fontSize: ".8rem", fontWeight: 500 }}>
                                                          Account not active
                                                      </p>
                                                  </Box>
                                              ) : null}
                                          </Typography>
                                      </Box>
                                  );
                              }}
                              renderTags={() => null}
                              IconComponent={ExpandMoreIcon}
                          />



                        {formik.touched.emailAccounts && formik.errors.emailAccounts && (
                          <FormHelperText sx={{ margin: 0, position: 'absolute', bottom: '-24px' }} error>
                            {formik.errors.emailAccounts}
                          </FormHelperText>
                        )}
                      </FormControl>
                      {/* x inactive accounts */}
                      {inactiveAccounts.length > 0 && (
                        <p style={{ fontSize: ".8rem", color: "red", marginTop: ".5rem" }}>
                          {inactiveAccounts.length} inactive
                        </p>
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      pt: 3,
                      justifyContent: "start",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: "20px",
                        letterSpacing: "0em",
                        color: "#28287B",
                      }}
                    >
                      Total Selected Accounts :
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: "22px",
                        letterSpacing: "0em",
                        color: "#8181B0",
                      }}
                    >
                      {emails?.length}
                    </Typography>
                  </Box>
                  <Grid container spacing={2} sx={{ maxHeight: '410px', overflow:'auto', mt: '8px', ...scrollBarStyle }}>
                    {emails?.map((email, index) => {
                      return (
                        <Grid item key={index} sx={{ display: "flex", mb: 1 }}>
                          <Button
                            sx={{
                              display: {sm: "flex" },
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
                           onClick={() => handleCloseEmail(email)}
                          >
                            {email}
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
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              ) : valueTabs === 1 ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 700,
                          lineHeight: "20px",
                          letterSpacing: "0em",
                          color: "#28287B",
                        }}
                      >
                        Stop emails to a lead after they reply.
                      </Typography>{" "}
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "22px",
                          letterSpacing: "0em",
                          color: "#8181B0",
                        }}
                      >
                        Don't email a lead once they've responded.
                      </Typography>
                    </Box>{" "}
                    <CustomCheckbox
                      value={formik.values.stopOnReply}
                      onChange={(_, newValue) => {
                        formik.setFieldValue("stopOnReply", newValue);
                      }}
                      checked={formik.values.stopOnReply}
                    />
                  </Box>

                  <FormGroup sx={{ width: "100%", justifyContent: "flex-start", mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          value={formik.values.stopOnAutoReply}
                          onChange={(_, newValue) => {
                            formik.setFieldValue("stopOnAutoReply", newValue);
                          }}
                          checked={formik.values.stopOnAutoReply}
                          icon={<OffCheckboxCustomIcon />}
                          checkedIcon={<OnCheckboxCustomIcon />}
                        />
                      }
                      label="Pause on Auto-Reply"
                      sx={{
                        "& span": {
                          fontSize: "13px",
                          fontWeight: 500,
                          lineHeight: "16px",
                          letterSpacing: "0em",
                          color: "#28287B",
                        },
                      }}
                    />
                  </FormGroup>
                </>
              ) : valueTabs === 2 ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: "20px",
                        letterSpacing: "0em",
                        color: "#28287B",
                      }}
                    >
                      Tracking
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "flex-start",
                      alignItems: { xs: "flex-start", sm: "center" },
                      width: "100%",
                      mt: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: { xs: "space-between", sm: "center" },
                        alignItems: "center",
                        width: { xs: "100%", sm: "fit-content" },
                        mr: { xs: 0, sm: 3 },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "22px",
                          letterSpacing: "0em",
                          color: "#8181B0",
                          mr: 1.5,
                        }}
                      >
                        Track Opened Emails
                      </Typography>
                      <CustomCheckbox
                        disabled={formik.values.textOnly}
                        value={formik.values.trackOpen}
                        onChange={(_, newValue) => {
                          formik.setFieldValue("trackOpen", newValue);
                        }}
                        checked={!formik.values.textOnly && formik.values.trackOpen}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: { xs: "space-between", sm: "center" },
                        alignItems: "center",
                        width: { xs: "100%", sm: "fit-content" },
                      }}
                    >
                      {" "}
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "22px",
                          letterSpacing: "0em",
                          color: "#8181B0",
                          mr: 1.5,
                        }}
                      >
                        Track Clicked Links
                      </Typography>
                      <CustomCheckbox
                        value={formik.values.trackClickedLink}
                        onChange={(_, newValue) => {
                          formik.setFieldValue("trackClickedLink", newValue);
                        }}
                        checked={formik.values.trackClickedLink}
                        handle
                      />
                    </Box>
                  </Box>
                </>
              ) : valueTabs === 3 ? (
                <>
                  {" "}
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
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        flexDirection: "column",
                      }}
                    >
                      {" "}
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 700,
                          lineHeight: "20px",
                          letterSpacing: "0em",
                          color: "#28287B",
                        }}
                      >
                        Daily Max Emails Sent Limit
                      </Typography>{" "}
                    </Box>{" "}
                  </Box>
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
                        fontWeight: 400,
                        lineHeight: "22px",
                        letterSpacing: "0em",
                        color: "#8181B0",
                        mr: 1.5,
                        width: { xs: "60%", sm: "75%" },
                      }}
                    >
                      Maximum daily emails total number for this campaign.
                    </Typography>
                    <TextField
                      variant="outlined"
                      name="dailyMaxLimit"
                      value={formik.values.dailyMaxLimit}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.dailyMaxLimit && Boolean(formik.errors.dailyMaxLimit)}
                      helperText={formik.touched.dailyMaxLimit && formik.errors.dailyMaxLimit}
                      sx={{
                        width: { xs: "40%", sm: "25%" },
                        // width: 228,
                        // height: 40,
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
                    />
                  </Box>
                </>
              ) : valueTabs === 4 ? (
                <>
                  {" "}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: "20px",
                        letterSpacing: "0em",
                        color: "#28287B",
                      }}
                    >
                      Optimized Sending
                    </Typography>
                  </Box>
                  <FormGroup sx={{ width: "100%", justifyContent: "flex-start", mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          disabled={formik.values.trackOpen}
                          value={formik.values.textOnly}
                          onChange={(_, newValue) => {
                            formik.setFieldValue("textOnly", newValue);
                          }}
                          checked={!formik.values.trackOpen && formik.values.textOnly}
                          icon={<OffCheckboxCustomIcon />}
                          checkedIcon={<OnCheckboxCustomIcon />}
                        />
                      }
                      label="Send as plain text, no HTML."
                      sx={{
                        "& span": {
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "22px",
                          letterSpacing: "0em",
                          color: "#8181B0",
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 400,
                        lineHeight: "22px",
                        letterSpacing: "0em",
                        color: "#8181B0",
                      }}
                    >
                      {formik.values.trackOpen
                        ? 'Disable "Track Opened Emails" in Tracking to enable "Optimized Sending"'
                        : 'Enabling "Optimized Sending" will disable "Track Opened Emails" in Tracking'}
                    </Typography>
                  </FormGroup>
                </>
              ) : null}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              mt: 0,
              py: 3,
            }}
          >
            <Button
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  boxShadow: 10,
                },
                textAlign: "left",
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "18px",
                letterSpacing: "0em",
                color: "#0071F6",
                backgroundColor: "white",
                borderRadius: "8px",
                px: 1.5,
                py: 1.5,
                border: "1px solid #0071F6",
              }}
              variant="outlined"
              type="submit"
            >
              {formik.isSubmitting && !launch ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <SaveIconBlue />
                  </Box>
                  Save
                </>
              )}
            </Button>
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
                ml: 3,
              }}
              variant="contained"
              onClick={() => launchCampaign(formik)}
            >
              {isSendingCampaign ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <FireIcon />
                  </Box>
                  Launch
                </>
              )}
            </Button>
          </Box>
        </form>
      </Box>

      {/* Old design */}
      <Box
        sx={{
          // display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          borderBottom: "1px solid rgba(0,0,0,0.2)",
          pb: 7,
          mt: 20,
          display: "none",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            {" "}
            <Box
              sx={{
                boxShadow: "0px 0px 12px -1px rgba(0, 0, 0, 0.25)",
                borderRadius: 1,
                p: 3,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                mt: 2,
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
                {/* <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgb(33, 111, 237)",
                    borderRadius: "20px",
                    p: 1,
                  }}
                >
                  <StopCircleOutlined sx={{ color: "white" }} />
                </Box> */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                  }}
                >
                  {" "}
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 700,
                      lineHeight: "20px",
                      letterSpacing: "0em",
                      color: "#28287B",
                    }}
                  >
                    Stop sending emails on reply
                  </Typography>{" "}
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "22px",
                      letterSpacing: "0em",
                      color: "#8181B0",
                    }}
                  >
                    Stop sending emails to a lead if a response has been received
                  </Typography>
                </Box>{" "}
                <CustomCheckbox checked={true} />
              </Box>

              <FormGroup sx={{ width: "100%", justifyContent: "flex-start", mt: 1 }}>
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="Stop on auto reply"
                  sx={{ "& span": { fontSize: "13px" } }}
                />
              </FormGroup>
            </Box>
            <Box
              sx={{
                boxShadow: "0px 0px 12px -1px rgba(0, 0, 0, 0.25)",
                borderRadius: 1,
                p: 3,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                mt: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {/* <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgb(33, 111, 237)",
                    borderRadius: "20px",
                    p: 1,
                  }}
                >
                  <PublishOutlined sx={{ color: "white" }} />
                </Box> */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                  }}
                >
                  {" "}
                  <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                    Daily Limit
                  </Typography>{" "}
                  <Typography
                    sx={{
                      fontSize: "14px",
                      textAlign: "left",
                      width: "100%",
                      color: "rgba(0,0,0,0.4)",
                    }}
                  >
                    Max number of emails to send per day for this campaign
                  </Typography>
                </Box>{" "}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    // width: "100%",
                  }}
                >
                  {" "}
                  <TextField
                    defaultValue={20}
                    variant="outlined"
                    size="small"
                    sx={{ width: "100px" }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                boxShadow: "0px 0px 12px -1px rgba(0, 0, 0, 0.25)",
                borderRadius: 1,
                p: 3,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                mt: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {/* <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgb(33, 111, 237)",
                    borderRadius: "20px",
                    p: 1,
                  }}
                >
                  <ShareLocationOutlined sx={{ color: "white" }} />
                </Box> */}

                <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>Tracking</Typography>
              </Box>
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
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                  }}
                >
                  {" "}
                  <Typography
                    sx={{
                      my: 1,
                      fontSize: "14px",
                      textAlign: "left",
                      width: "100%",
                      color: "rgba(0,0,0,0.4)",
                    }}
                  >
                    Track email opens
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <CustomCheckbox checked={true} />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                  }}
                >
                  {" "}
                  <Typography
                    sx={{
                      my: 1,
                      fontSize: "14px",
                      textAlign: "left",
                      width: "100%",
                      color: "rgba(0,0,0,0.4)",
                    }}
                  >
                    Track link clicks
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <CustomCheckbox checked={false} />
                  </Box>
                </Box>
              </Box>
            </Box>
            <Dialog
              open={highdailyMaxLimitDialogOpen}
              onClose={highdailyMaxLimitDialogClose}
              maxWidth={"xs"}
              fullWidth
            >
              <DialogTitle
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "28px",
                  color: "#28287B",
                  p: 4,
                }}
              >
                Large daily limit
              </DialogTitle>
              <DialogContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  gap: 2,
                  p: 4,
                }}
              >
                <Typography sx={{ color: theme.palette.error.main }}>
                  In campaigns if your daily limit is more than 50, you should use multiple sender
                  accounts, instead of using 1 account, sending that many emails from 1 account can
                  get your email ID blacklisted.
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  <Checkbox
                    checked={isHighLimitOkay}
                    onChange={(e, checked) => {
                      setIsHighLimitOkay(checked);
                    }}
                  />
                  <Typography>I understand what I'm doing</Typography>
                </Box>
                <Box
                  sx={{
                    display: notChecked ? "flex" : "none",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                    p: 2,
                    backgroundColor: theme.palette.grey[200],
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: theme.palette.error.main,
                    }}
                  >
                    <WarningRounded />
                  </Box>
                  <Typography>Check "I understand" to continue</Typography>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    if (isHighLimitOkay) {
                      setNotChecked(false);
                      formik.handleSubmit();
                    } else {
                      setNotChecked(true);
                    }
                  }}
                  sx={{ color: theme.palette.error.main }}
                >
                  Continue
                </Button>
                <Button
                  onClick={() => {
                    setNotChecked(false);
                    setIsHighLimitOkay(false);
                    setHighdailyMaxLimitDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={boundHighdailyMaxLimitDialogOpen}
              onClose={highdailyMaxLimitBoundDialogClose}
              maxWidth={"xs"}
              fullWidth
            >
              <DialogTitle
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "28px",
                  color: "#28287B",
                  p: 4,
                }}
              >
                Large daily limit
              </DialogTitle>
              <DialogContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  gap: 2,
                  p: 4,
                }}
              >
                <Typography sx={{ color: theme.palette.error.main }}>
                  We regret to inform you that you are unable to select more than 5000 leads at a
                  time. This limitation is in place to ensure optimal performance and to provide a
                  seamless experience for all users.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setBoundHighdailyMaxLimitDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
            <Box
              sx={{
                boxShadow: "0px 0px 12px -1px rgba(0, 0, 0, 0.25)",
                borderRadius: 1,
                p: 3,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                mt: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {/* <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgb(33, 111, 237)",
                    borderRadius: "20px",
                    p: 1,
                  }}
                >
                  <PsychologyOutlined sx={{ color: "white" }} />
                </Box> */}

                <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                  Delivery Optimization
                </Typography>
              </Box>
              <FormGroup sx={{ width: "100%", justifyContent: "flex-start", mt: 2 }}>
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="Send emails as text-only (no HTML)"
                  sx={{ "& span": { fontSize: "13px", fontWeight: 400 } }}
                />
              </FormGroup>
            </Box>{" "}
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          display: "none",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          mt: 3,
        }}
      >
        <Button
          sx={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" }}
          variant="outlined"
        >
          <SaveAltOutlined sx={{ mr: 1 }} />
          Save
        </Button>
        <Button
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "16px",
            ml: 2,
          }}
          variant="contained"
        >
          <RocketLaunch sx={{ mr: 1 }} />
          Launch
        </Button>
      </Box>
    </>
  );
};

export default CampaignOptions;
