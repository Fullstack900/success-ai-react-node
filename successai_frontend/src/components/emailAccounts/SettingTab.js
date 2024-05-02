import { useEffect, useState, useRef } from "react";
import { config } from "src/config.js";
import {
  AccessTime,
  ArrowDropDown,
  CalendarMonth,
  Campaign,
  ChromeReaderMode,
  DoNotDisturb,
  DraftsOutlined,
  Face,
  GppMaybeOutlined,
  InfoRounded,
  Pause,
  PlayArrow,
  Publish,
  Quickreply,
  Save,
  StarOutline,
  TrackChanges,
  TrendingUp,
  Whatshot,
  WarningRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  Slider,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { useFormik } from "formik";
import CustomCheckbox from "../CustomCheckbox.js";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { Editor } from "@tinymce/tinymce-react";
import {
  accountUpdated,
  usePauseAccountMutation,
  useResumeAccountMutation,
  useUpdateAccountMutation,
  usePauseWarmupMutation,
  useEnableWarmupMutation,
} from "src/services/account-service.js";
import { useDispatch } from "react-redux";
import { SaveIconWhite } from "src/assets/general/SaveIcon.js";
import { PauseIcon } from "src/assets/general/PauseIcon.js";
import { PlayIcon } from "src/assets/general/PlayIcon.js";
import { EDSMeterIcon } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSMeterIcon.js";
import { EDSStopwatchIcon } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSStopwatchIcon.js";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon.js";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon.js";
import { EDSGrowthIcon } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSGrowthIcon.js";
import { EDSMessagingIcon } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSMessagingIcon.js";
import { EDSCalendarIcon } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSCalendarIcon.js";
import { EDSFIleCheckIcon } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSFIleCheckIcon.js";
import { EDSChartIcon } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSChartIcon.js";
import { EDSMailOpenIcon } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSMailOpenIcon.js";
import { EDSWarningIcon } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSWarningIcon.js";
import { EDSStarIcon } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSStarIcon.js";
import { EDSCancelIcon } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSCancelIcon.js";
import { useCheckCnameMutation, useCheckSslMutation } from "src/services/dns-service.js";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import { uploadImage } from "src/utils/util.js";
import { useGetSignedUrlMutation } from "src/services/user-service.js";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import CustomSelect from "./CustomSelect.js";
import { useGetMeQuery } from "src/services/user-service";
import { useUpdateIntercomMutation } from "src/services/intercom-service";
const SettingTab = ({ account, bulkUpdate, accountIds }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [checkStatus, setCheckStatus] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [accountStatus, setAccountStatus] = useState(account.status);
  const [domainNameError, setDomainNameError] = useState(false);
  const [signature, setSignature] = useState("");

  const [highDailyLimitDialogOpen, setHighDailyLimitDialogOpen] = useState(false);
  const [isHighLimitOkay, setIsHighLimitOkay] = useState(false);
  const [notChecked, setNotChecked] = useState(false);

  const editorRef = useRef(null);

  const [updateAccount, { isLoading: isAccountUpdating, data }] = useUpdateAccountMutation();
  const [pauseAccount] = usePauseAccountMutation();
  const [resumeAccount] = useResumeAccountMutation();

  useEffect(() => {
    setAccountStatus(account.status);
  }, [account]);

  const [checkSsl] = useCheckSslMutation();
  const [checkCname] = useCheckCnameMutation();

  const [displaySSL, setDisplaySSL] = useState(false);
  const [displayCName, setDisplayCName] = useState(false);
  const [getSignedUrl] = useGetSignedUrlMutation();

  const [checkCustomDomain, setCheckCustomDomain] = useState(null);

  const checkCustomTracking = async (hostname) => {
    try {
      const data = await checkCname({ hostname }).unwrap();
      if (data?.status) {
        const cnameValue = data.cname.cname[0];
        if (cnameValue != null) {
          const Cname = data?.cname.status;
          setDisplayCName(Cname);
        }
        const ssl = await checkSsl({ hostname }).unwrap();
        const sslResult = ssl["ssl"];
        setDisplaySSL(sslResult);
      }
      setCheckStatus(false);
    } catch (err) {
      toast.error(err.data.error.message);
      setCheckCustomDomain(err.data.error.message);
      setCheckStatus(false);
      setDisplayCName(false);
      setDisplaySSL(false);
    }
  };

  const handlePause = async () => {
    setAccountStatus("paused");
    const { message, account: updatedAccount } = await pauseAccount(account._id).unwrap();
    dispatch(accountUpdated(updatedAccount));
    toast.success(message);
  };
  const handleFilePicker = async (callback, value, meta) => {
    // Create a file input element and trigger a click event
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*"; // Accept only image files
    fileInput.onchange = async () => {
      if (fileInput.files && fileInput.files[0]) {
        const selectedImage = fileInput.files[0];
        try {
          const data = await getSignedUrl("selectedImage").unwrap();
          await uploadImage(data.signedUrl.putUrl, selectedImage);
          callback(data.signedUrl.getUrl);
        } catch (error) {
          console.log("🚀 ~ file: SettingTab.js:175 ~ fileInput.onchange= ~ error:", error);
        }
      }
    };

    fileInput.click();
  };

  const handleResume = async () => {
    setAccountStatus("connected");
    const { message, account: updatedAccount } = await resumeAccount(account._id).unwrap();
    dispatch(accountUpdated(updatedAccount));
    toast.success(message);
  };
  const [warmupStatus, setWarmupStatus] = useState(account.warmup.status);
  const [pauseWarmup] = usePauseWarmupMutation();
  const { data: user, refetch: refetchUser } = useGetMeQuery();
  const [updateIntercom] = useUpdateIntercomMutation();

  useEffect(() => {
    setWarmupStatus(account.warmup.status);
  }, [account]);

  const handlePauseWarmup = async () => {
    const toastId = toast.loading("Loading...", { duration: Infinity });
    const { message, account: updatedAccount } = await pauseWarmup(account._id).unwrap();
    dispatch(accountUpdated(updatedAccount));
    await updateIntercom({ user: user._id, attribute: "warmedup_email_accounts" })
    setWarmupStatus("paused");
    toast.success(message, { id: toastId, duration: 2000 });
  };
  const handlepauseAccountAndPauseWarmup = async () => {
    await handlePause();
    if (warmupStatus === "enabled") {
      await handlePauseWarmup();
    }
  }
  const formik = useFormik({
    initialValues: {
      name: {
        first: account?.name?.first,
        last: account?.name?.last,
      },
      campaign: {
        dailyLimit: account?.campaign?.dailyLimit,
        waitTime: account?.campaign?.waitTime,
      },
      replyTo: account?.replyTo,
      signature: account?.signature,
      customDomain: {
        isEnable: account?.customDomain?.isEnable,
        name: account?.customDomain?.name,
      },
      warmup: {
        basicSetting: {
          increasePerDay: account?.warmup?.basicSetting?.increasePerDay,
          slowWarmupDisabled: account?.warmup?.basicSetting?.slowWarmupDisabled,
          limitPerDay: account?.warmup?.basicSetting?.limitPerDay,
          replyRate: account?.warmup?.basicSetting?.replyRate,
          alertBlock: account?.warmup?.basicSetting?.alertBlock,
        },
        advanceSetting: {
          weekdayOnly: account?.warmup?.advanceSetting?.weekdayOnly,
          readEmulation: account?.warmup?.advanceSetting?.readEmulation,
          customTrackingDomain: account?.warmup?.advanceSetting?.customTrackingDomain,
          openRate: account?.warmup?.advanceSetting?.openRate,
          spamProtectionRate: account?.warmup?.advanceSetting?.spamProtectionRate,
          markImportantRate: account?.warmup?.advanceSetting?.markImportantRate,
        },
      },
    },
    validationSchema: Yup.object({
      name: Yup.object({
        first: Yup.string(),
        last: Yup.string(),
      }),
      campaign: Yup.object({
        dailyLimit: Yup.number().integer("Must be an integer"),
        // .required("Daily Limit is required"),
        waitTime: Yup.number().integer("Must be an integer")
        // .required("Daily Limit is required"),
      }),

      replyTo: Yup.string().email().label("Reply to"),

      warmup: Yup.object({
        basicSetting: Yup.object({
          increasePerDay: Yup.number().integer().min(1).max(4),
          // .required().label("Increase per day"),
          limitPerDay: Yup.number().integer().min(1).max(50),
          // .required().label("Daily warmup limit"),
          replyRate: Yup.number().integer().min(1).max(100)
          // .required().label("Reply rate"),
        }),
      }),
    }),
    onSubmit: async (values) => {
      if (
        account?.campaign?.dailyLimit !== values.campaign.dailyLimit &&
        values.campaign.dailyLimit > 300 &&
        !isHighLimitOkay
      ) {
        setHighDailyLimitDialogOpen(true);
        return;
      }
      setHighDailyLimitDialogOpen(false);
      setIsHighLimitOkay(false);
      try {
        if (bulkUpdate) {
          setIsBulkUpdating(true);
          for (const accountId of accountIds) {
            const { account } = await updateAccount({ id: accountId, data: values }).unwrap();
            dispatch(accountUpdated(account));
          }
          setIsBulkUpdating(false);
          toast.success("Accounts Updated!");
        } else {
          if (values.customDomain.isEnable && values.customDomain.name === "") {
            setDomainNameError(true);
          } else {
            const { message, account: updatedAccount } = await updateAccount({
              id: account._id,
              data: { ...values, signature },
            }).unwrap();
            dispatch(accountUpdated(updatedAccount));
            toast.success(message);
            setDomainNameError(false);
          }
        }
      } catch (error) {
        setIsBulkUpdating(false);
        toast.error(error.data.error.message);
      }
    },
  });

  const handleIncreasePerDayChange = (event) => {
    const { value } = event.target;
    if (value > 4) {
      event.target.value = 4;
      toast.error("Max allowed value is 4");
    }
    formik.handleChange(event);
  };

  const handleDailyWarmupLimitChange = (event) => {
    const { value } = event.target;
    if (value > 50) {
      event.target.value = 20;
      toast.error("Max allowed value is 50");
    }
    formik.handleChange(event);
  };

  const [showMoreAdvSettings, setShowMoreAdvSettings] = useState(true);

  const handleHighDailyLimitDialogClose = () => {
    setHighDailyLimitDialogOpen(false);
  };
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const warning = "Pausing this email account will render all its activities inactive, including sending and receiving emails, as well as warmups."
  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
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
              fontWeight: 700,
              lineHeight: "26px",
              color: "rgba(40, 40, 123, 1)",
            }}
          >
            Sender name
          </Typography>
          {account.freeUserOtherAccounts === true ? <></> : 
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {" "}          
            {!bulkUpdate &&
              (accountStatus === "connected" ? (
                <Tooltip title= {warning} placement=  "top-end" arrow>             
                <IconButton onClick={handlepauseAccountAndPauseWarmup}>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <PauseIcon />
                  </Box>
                </IconButton>
              </Tooltip>
              ) : (
                <IconButton onClick={handleResume}>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <PlayIcon />
                  </Box>
                </IconButton>
              ))}
            <SaveButton
              onClick={formik.handleSubmit}
              isSubmitting={bulkUpdate ? isBulkUpdating : isAccountUpdating}
            />
          </Box>
          }
        </Box>
        {isMobile ? 
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
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: "16px",
              color: "orange",
            }}
          >
           Warning! {warning}.
          </Typography>
        </Box>  : 
        <></>
      }
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              borderBottom: "1px solid #E4E4E5",
              py: 2,
            }}
          >
            <Face sx={{ color: "rgb(33, 111, 237)", mr: 1 }} />
            <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>Email Sender Name</Typography>
          </Box> */}
          <Grid container spacing={2} sx={{ my: 0.5 }}>
            <Grid item xs={6}>
              <InputLabel
                sx={{
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  color: "#8181B0",
                  mb: 1,
                }}
              >
                First Name
              </InputLabel>
              <TextField
                fullWidth
                variant="outlined"
                name="name.first"
                placeholder="First name"
                // size="small"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.name.first}
                error={!!(formik.touched.name?.first && formik.errors.name?.first)}
                helperText={formik.touched.name?.first && formik.errors.name?.first}
                sx={{
                  width: "100%",
                  height: 48,
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
              />
            </Grid>
            <Grid item xs={6}>
              <InputLabel
                sx={{
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  color: "#8181B0",
                  mb: 1,
                }}
              >
                Last Name
              </InputLabel>
              <TextField
                fullWidth
                variant="outlined"
                value={formik.values.name.last}
                name="name.last"
                placeholder="Last name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                // size="small"
                error={!!(formik.touched.name?.last && formik.errors.name?.last)}
                helperText={formik.touched.name?.last && formik.errors.name?.last}
                sx={{
                  width: "100%",
                  height: 48,
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
              />
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                py: 1,
                height: "180px",
              }}
            >
              <InputLabel
                sx={{
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  color: "#8181B0",
                  mb: 1,
                }}
              >
                Signature
              </InputLabel>
              <Editor
                apiKey={config.TINYMCE_EDITOR_API}
                onEditorChange={(value) => {
                  formik.handleChange("signature")(value);
                  setSignature(value);
                }}
                // valaue={signature}
                value={formik.values.signature}
                onInit={(evt, editor) => (editorRef.current = editor)}
                init={{
                  height: "90%",
                  selector: "textarea",
                  placeholder: "Account signature",
                  init_instance_callback: function (editor) {
                    const freeTiny = document.querySelector(".tox .tox-notification--in");
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
                  file_picker_callback: handleFilePicker,

                  menubar: false,
                  plugins: [
                    "mentions advlist autolink lists link image charmap print preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media paste code help wordcount",
                    "autolink",
                    "link",
                    "image","emoticons"
                  ],
                  toolbar:
                    "undo redo | formatselect | " +
                    "bold italic backcolor | link | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    " removeformat | emoticons | image",

                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #8181B0;}",
                  emoticons_append: {
                    custom_mind_explode: {
                      keywords: ["brain", "mind", "explode", "blown"],
                      char: "🤯",
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ borderRadius: "12px", p: 3, mt: 2, border: "1px solid #E4E4E5" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  borderBottom: "1px solid #E4E4E5",
                  pb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    color: "#28287B",
                  }}
                >
                  Campaign Settings
                </Typography>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexDirection: { xs: "column", sm: "row" },
                rowGap: 1,
              }}
            >
              <Box>
                {" "}
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "26px",
                    color: "#28287B",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <EDSMeterIcon />
                  </Box>
                  Campaign Daily Limit
                </Typography>
                <Typography
                  sx={{
                    mt: 1.5,
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#8181B0",
                  }}
                >
                  Total number of emails allowed per day for the campaign
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <TextField
                  type="number"
                  variant="outlined"
                  inputProps={{ min: 0 }}
                  sx={{
                    width: 80,
                    height: { xs: "100%", sm: 80 },
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
                    mr: 1.5,
                  }}
                  size="small"
                  fullWidth
                  value={formik.values.campaign.dailyLimit}
                  name="campaign.dailyLimit"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  error={
                    !!(formik.touched.campaign?.dailyLimit && formik.errors.campaign?.dailyLimit)
                  }
                  helperText={
                    formik.touched.campaign?.dailyLimit && formik.errors.campaign?.dailyLimit
                  }
                />
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: "flex-start",
                rowGap: 1,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "26px",
                    color: "#28287B",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <EDSStopwatchIcon />
                  </Box>
                  The Minimum Wait Time In Minutes
                </Typography>
                <Typography
                  sx={{
                    mt: 1.5,
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#8181B0",
                  }}
                >
                  When used alongside other campaigns
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <TextField
                  type="number"
                  variant="outlined"
                  sx={{
                    width: 80,
                    height: { xs: "100%", sm: 80 },
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
                  size="small"
                  value={formik.values.campaign.waitTime}
                  name="campaign.waitTime"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  error={!!(formik.touched.campaign?.waitTime && formik.errors.campaign?.waitTime)}
                  helperText={formik.touched.campaign?.waitTime && formik.errors.campaign?.waitTime}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  color: "#8181B0",
                  mt: 2,
                  mb: 1,
                }}
              >
                Reply to
              </Typography>
              <CustomSelect formik={formik} initialValue={account?.replyTo} />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ borderRadius: "12px", p: 3, mt: 3, border: "1px solid #E4E4E5" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  borderBottom: "1px solid #E4E4E5",
                  pb: 2,
                }}
              >
                {/* <TrackChanges sx={{ color: "rgb(33, 111, 237)", mr: 1 }} /> */}
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    color: "#28287B",
                  }}
                >
                  Custom Tracking Domain
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      icon={<OffCheckboxCustomIcon />}
                      checkedIcon={<OnCheckboxCustomIcon />}
                      checked={formik.values.customDomain.isEnable}
                      name="customDomain.isEnable"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Enable Custom Tracking Domain"
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "13px",
                      fontWeight: 500,
                      lineHeight: "16px",
                      color: "#28287B",
                      ml: 1,
                    },
                  }}
                />
                <Box
                  sx={{
                    display: formik.values.customDomain.isEnable ? "flex" : "none",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    mt: 1,
                    transition: "all 1s ease-out",
                  }}
                >
                  <Typography
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    Add a new CNAME record for your tracking domain or subdomain.
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginLeft: 1,
                      }}
                    >
                      <Tooltip
                        title={
                          `1. Go to your domain's DNS settings` +
                          `\n2.Create a new CNAME record` +
                          `\n3. Enter the following details`
                        }
                        placement="right"
                        arrow
                      >
                        <InfoRounded fontSize="small" />
                      </Tooltip>
                    </span>
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      backgroundColor: "rgba(0,0,0,0.05)",
                      p: 2,
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      flexDirection: "column",
                      mt: 2,
                    }}
                  >
                    <Typography>
                      <span style={{ fontWeight: 600, marginRight: 8 }}>Record Type: </span>
                      CNAME
                    </Typography>
                    <Typography sx={{ my: 1 }}>
                      <span style={{ fontWeight: 600, marginRight: 8 }}>Host: </span>track
                    </Typography>
                    <Typography>
                      <span style={{ fontWeight: 600, marginRight: 8 }}>Value: </span>
                      track.xrocket.ai
                      <Button
                        variant="contained"
                        color="inherit"
                        size="small"
                        sx={{ ml: 2 }}
                        onClick={() => {
                          navigator.clipboard.writeText("track.xrocket.ai");
                          toast.success("Copied to clipboard");
                        }}
                      >
                        Copy
                      </Button>
                    </Typography>
                  </Box>
                  <InputLabel sx={{ mb: 1, mt: 3 }}>Your tracking domain or subdomain</InputLabel>

                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="track.yourdomain.com"
                    value={formik.values.customDomain.name}
                    name="customDomain.name"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    error={domainNameError}
                    helperText={domainNameError ? "Domain name is required" : ""}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        formik.values.customDomain.name && setCheckStatus(true);
                        formik.values.customDomain.name &&
                          checkCustomTracking(formik.values.customDomain.name);
                        !formik.values.customDomain.name &&
                          toast.error("Enter a valid custom domain");
                      }}
                      disabled={checkStatus}
                    >
                      <CircularProgress
                        size={16}
                        sx={{ mr: 1, display: !checkStatus && "none" }}
                        color="inherit"
                      />
                      Check Status
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      sx={{ ml: 1, display: !checkStatus && "none" }}
                      onClick={() => setCheckStatus(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                  <Button sx={{ fontSize: "16px", mt: 2 }}>Need help?</Button>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {displayCName ? (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CheckCircleIcon
                          style={{ color: "#2eca8b", fontSize: "18px", marginRight: "2px" }}
                        />
                        <Typography variant="body1">CNAME Verified</Typography>
                      </Box>
                    ) : formik.values.customDomain.name ? (
                      ""
                    ) : (
                      // formik.values.customDomain.name === undefined ? "" :
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PrivacyTipIcon
                          style={{ color: "#D22B2B", fontSize: "18px", marginRight: "2px" }}
                        />
                        <Typography variant="body1">CNAME not Verified</Typography>
                      </Box>
                    )}
                    {/* ADD conditions for user better experiance   */}
                    {displaySSL ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: 2,
                          marginRight: "2px",
                        }}
                      >
                        <VerifiedUserIcon style={{ color: "#2eca8b", fontSize: "18px" }} />
                        <Typography variant="body1">SSL Verified</Typography>
                      </Box>
                    ) : formik.values.customDomain.name ? (
                      ""
                    ) : (
                      // formik.values.customDomain.name === undefined ? "" :
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: 2,
                          marginRight: "2px",
                        }}
                      >
                        <PrivacyTipIcon style={{ color: "#D22B2B", fontSize: "18px" }} />
                        <Typography variant="body1">SSL not Verified</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ borderRadius: "12px", p: 3, mt: 3, border: "1px solid #E4E4E5" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  borderBottom: "1px solid #E4E4E5",
                  pb: 2,
                }}
              >
                {/* <Whatshot sx={{ color: "rgb(33, 111, 237)", mr: 1 }} /> */}
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    color: "#28287B",
                  }}
                >
                  Warmup Settings | Basics
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  borderBottom: "1px solid #E4E4E5",
                  mt: 2,
                  pb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "26px",
                    color: "#28287B",
                  }}
                >
                  Warmup filter tag:
                </Typography>
                <Typography
                  sx={{
                    ml: 1,
                    backgroundColor: "#F2F4F6",
                    p: 1,
                    borderRadius: 1.5,
                    fontSize: "13px",
                    fontWeight: 500,
                    lineHeight: "16px",
                    color: "#28287B",
                    border: "1px solid #E4E4E5",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(account.warmup.filterTag);
                    toast.success("Code copied!");
                  }}
                >
                  {account.warmup.filterTag}
                </Typography>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                rowGap: 1,
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "26px",
                    color: "#28287B",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mr: 1.5,
                    }}
                  >
                    <EDSGrowthIcon />
                  </Box>
                  Increase per day
                </Typography>
                <Typography
                  sx={{
                    mt: 1.5,
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#8181B0",
                  }}
                >
                  Suggested 1, Max 4
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.warmup.basicSetting.slowWarmupDisabled}
                      name="warmup.basicSetting.slowWarmupDisabled"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      icon={<OffCheckboxCustomIcon />}
                      checkedIcon={<OnCheckboxCustomIcon />}
                    />
                  }
                  label="Disable Slow Warmup"
                  sx={{
                    mt: 1,
                    display: { xs: "none", sm: "block" },
                    "& .MuiFormControlLabel-label": {
                      fontSize: "13px",
                      fontWeight: 500,
                      lineHeight: "16px",
                      color: "#28287B",
                      ml: 1,
                    },
                  }}
                />{" "}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <TextField
                  variant="outlined"
                  size="small"
                  sx={{
                    display: formik.values.warmup.basicSetting.slowWarmupDisabled && "none",
                    width: 80,
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
                    mr: 1.5,
                  }}
                  name="warmup.basicSetting.increasePerDay"
                  value={formik.values.warmup.basicSetting.increasePerDay}
                  onChange={handleIncreasePerDayChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.warmup?.basicSetting?.increasePerDay &&
                    !!formik.errors.warmup?.basicSetting?.increasePerDay
                  }
                  helperText={
                    formik.touched.warmup?.basicSetting?.increasePerDay &&
                    formik.errors.warmup?.basicSetting?.increasePerDay
                  }
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                />
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.warmup.basicSetting.slowWarmupDisabled}
                    name="warmup.basicSetting.slowWarmupDisabled"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    icon={<OffCheckboxCustomIcon />}
                    checkedIcon={<OnCheckboxCustomIcon />}
                  />
                }
                label="Disable Slow Warmup"
                sx={{
                  mt: 1,
                  display: { xs: "block", sm: "none" },
                  "& .MuiFormControlLabel-label": {
                    fontSize: "13px",
                    fontWeight: 500,
                    lineHeight: "16px",
                    color: "#28287B",
                    ml: 1,
                  },
                }}
              />{" "}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                rowGap: 1,
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "26px",
                    color: "#28287B",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <EDSMeterIcon />
                  </Box>
                  Daily Warmup Limit
                </Typography>
                <Typography
                  sx={{
                    mt: 1.5,
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#8181B0",
                  }}
                >
                  Suggested 20, Max 50
                </Typography>
                {/* <FormControlLabel
                  control={<Checkbox />}
                  label="No Slow Warmup"
                  sx={{ fontSize: "14px", visibility: "hidden" }}
                /> */}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <TextField
                  variant="outlined"
                  size="small"
                  name="warmup.basicSetting.limitPerDay"
                  value={formik.values.warmup.basicSetting.limitPerDay}
                  // onChange={(event) => {
                  //   const inputValue = event.target.value;
                  //   if (inputValue <= 200 && /^\d*$/.test(inputValue)) {
                  //     formik.setFieldValue("warmupSetting.limitPerDay", inputValue);
                  //     inputValue > 50 &&
                  //       toast("Warmup limit is too high. It's recommended to keep it below 50.", {
                  //         duration: 4000,
                  //         position: "top-center",
                  //         style: { color: "orange" },
                  //       });
                  //   } else if (inputValue > 200) {
                  //     formik.setFieldValue("warmupSetting.limitPerDay", 200);
                  //     toast.error("Max allowed value is 200");
                  //   }
                  // }}
                  onChange={handleDailyWarmupLimitChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.warmup?.basicSetting?.limitPerDay &&
                    !!formik.errors.warmup?.basicSetting?.limitPerDay
                  }
                  helperText={
                    formik.touched.warmup?.basicSetting?.limitPerDay &&
                    formik.errors.warmup?.basicSetting?.limitPerDay
                  }
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  sx={{
                    width: 80,
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
                />
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                rowGap: 1,
                justifyContent: "space-between",
                alignItems: "flex-start",
                // mt: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "26px",
                    color: "#28287B",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <EDSMessagingIcon />
                  </Box>
                  Reply rate %
                </Typography>
                <Typography
                  sx={{
                    mt: 1.5,
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#8181B0",
                  }}
                >
                  Suggested 30
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <TextField
                  variant="outlined"
                  size="small"
                  name="warmup.basicSetting.replyRate"
                  value={formik.values.warmup.basicSetting.replyRate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.warmup?.basicSetting?.replyRate &&
                    !!formik.errors.warmup?.basicSetting?.replyRate
                  }
                  helperText={
                    formik.touched.warmup?.basicSetting?.replyRate &&
                    formik.errors.warmup?.basicSetting?.replyRate
                  }
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  sx={{
                    width: 80,
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
                    mr: 1.5,
                  }}
                />
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                rowGap: 1,
                justifyContent: "space-between",
                alignItems: "flex-start",
                // mt: 5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "12px",
                    color: "#28287B",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <EDSCancelIcon />
                  </Box>
                  Monitor Blacklists
                </Typography>
                <Typography
                  sx={{
                    mt: 1.5,
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#8181B0",
                  }}
                >
                  Alert when blocked
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  mr: "-26px",
                }}
              >
                <CustomCheckbox
                  name="warmup.basicSetting.alertBlock"
                  checked={formik.values.warmup.basicSetting.alertBlock}
                  onChange={formik.handleChange}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ borderRadius: "12px", p: 3, pb: 0, mt: 2, border: "1px solid #E4E4E5", mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{}}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  borderBottom: "1px solid #E4E4E5",
                  pb: 2,
                }}
              >
                {/* <Whatshot sx={{ color: "#ffb600", mr: 1 }} /> */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 700,
                      lineHeight: "20px",
                      color: "#28287B",
                    }}
                  >
                    Warmup Settings | Advanced
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      color: "#8181B0",
                      mt: 1,
                    }}
                  >
                    Advanced settings to make warmup behavior more human-like
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 4,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    width: "75%",
                    mr: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <EDSCalendarIcon />
                    </Box>
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "26px",
                        color: "#28287B",
                        ml: 1.5,
                      }}
                    >
                      Weekdays Only
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      color: "#8181B0",
                    }}
                  >
                    Only send warmup emails on weekdays for a more natural sending pattern
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mr: "-26px",
                  }}
                >
                  <CustomCheckbox
                    name="warmup.advanceSetting.weekdayOnly"
                    checked={formik.values.warmup.advanceSetting.weekdayOnly}
                    onChange={formik.handleChange}
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  my: 4,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    width: "75%",
                    mr: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <EDSFIleCheckIcon />
                    </Box>
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "26px",
                        color: "#28287B",
                        ml: 1.5,
                      }}
                    >
                      Read Emulation
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      color: "#8181B0",
                    }}
                  >
                    Spend time and scroll through your warmup email to emulate human-like reading
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mr: "-26px",
                  }}
                >
                  <CustomCheckbox
                    name="warmup.advanceSetting.readEmulation"
                    checked={formik.values.warmup.advanceSetting.readEmulation}
                    onChange={formik.handleChange}
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    width: "75%",
                    mr: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <EDSChartIcon />
                    </Box>
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "26px",
                        color: "#28287B",
                        ml: 1.5,
                      }}
                    >
                      Warm custom tracking domain
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      color: "#8181B0",
                    }}
                  >
                    Include your custom tracking domain in your warmup emails to further improve
                    deliverability
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mr: "-26px",
                  }}
                >
                  <CustomCheckbox
                    name="warmup.advanceSetting.customTrackingDomain"
                    checked={formik.values.warmup.advanceSetting.customTrackingDomain}
                    onChange={formik.handleChange}
                  />
                </Box>
              </Box>
              <Button
                sx={{
                  display: "none",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  fontSize: "14px",
                  color: "#216fed",
                  my: 2,
                }}
                onClick={() => {
                  setShowMoreAdvSettings(!showMoreAdvSettings);
                }}
              >
                {" "}
                Show {showMoreAdvSettings ? "less" : "more"}
                <ArrowDropDown
                  sx={{
                    transform: showMoreAdvSettings && "rotate(-180deg)",
                    transition: "0.2s all ease-in-out",
                  }}
                />
              </Button>

              <Box
                sx={{
                  display: showMoreAdvSettings ? "flex" : "none",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  width: "100%",
                  flexDirection: "column",
                  mt: 3,
                }}
              >
                {" "}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 4,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                      width: "45%",
                      mr: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <EDSMailOpenIcon />
                      </Box>
                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          lineHeight: "26px",
                          color: "#28287B",
                          ml: 1.5,
                        }}
                      >
                        Open rate
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: "#8181B0",
                      }}
                    >
                      How many of your warm up emails to open
                    </Typography>
                  </Box>
                  <Box sx={{ width: "25%" }}>
                    {" "}
                    <Slider
                      aria-label="Always visible"
                      name="warmup.advanceSetting.openRate"
                      value={formik.values.warmup.advanceSetting.openRate}
                      onChange={formik.handleChange}
                      valueLabelDisplay="on"
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 4,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                      width: "45%",
                      mr: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <EDSWarningIcon />
                      </Box>
                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          lineHeight: "26px",
                          color: "#28287B",
                          ml: 1.5,
                        }}
                      >
                        Spam Protection
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: "#8181B0",
                      }}
                    >
                      How many of your warm up emails to save from spam folder
                    </Typography>
                  </Box>
                  <Box sx={{ width: "25%" }}>
                    {" "}
                    <Slider
                      aria-label="Always visible"
                      name="warmup.advanceSetting.spamProtectionRate"
                      value={formik.values.warmup.advanceSetting.spamProtectionRate}
                      onChange={formik.handleChange}
                      valueLabelDisplay="on"
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 4,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                      width: "45%",
                      mr: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <EDSStarIcon />
                      </Box>
                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          lineHeight: "26px",
                          color: "#28287B",
                          ml: 1.5,
                        }}
                      >
                        Mark important
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: "#8181B0",
                      }}
                    >
                      How many of your warm up emails to mark as important
                    </Typography>
                  </Box>
                  <Box sx={{ width: "25%" }}>
                    {" "}
                    <Slider
                      aria-label="Always visible"
                      name="warmup.advanceSetting.markImportantRate"
                      value={formik.values.warmup.advanceSetting.markImportantRate}
                      onChange={formik.handleChange}
                      valueLabelDisplay="on"
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <SaveButton
          onClick={formik.handleSubmit}
          isSubmitting={bulkUpdate ? isBulkUpdating : isAccountUpdating}
        />
      </Box>

      <Dialog
        open={highDailyLimitDialogOpen}
        onClose={handleHighDailyLimitDialogClose}
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
          <Typography>
            You currently have your daily email limit for this account set to more than 300 emails
            per day.
          </Typography>
          <Typography>
            Sending too many emails from the same email account can not only damage your sender
            reputation, but could also get your account banned by your email service provider
          </Typography>
          <Typography sx={{ color: theme.palette.error.main }}>
            Check with your email service provider before setting a large daily limit, or it could
            lead to them suspending your account.
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
              setHighDailyLimitDialogOpen(false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

const SaveButton = ({ onClick, isSubmitting }) => {
  return (
    <Button
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "14px",
        fontWeight: 700,
        lineHeight: "18px",
        py: { xs: 1, sm: 2 },
        px: 3,
      }}
      variant="contained"
      type="submit"
      onClick={onClick}
    >
      {isSubmitting ? (
        <>
          <CircularProgress color="inherit" size={20} thickness={5} sx={{ mr: 1 }} />
          Saving
        </>
      ) : (
        <>Save</>
      )}
    </Button>
  );
};

export default SettingTab;
