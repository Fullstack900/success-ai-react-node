import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
  InputLabel,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  useMediaQuery,
  useTheme,
  DialogContentText
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  useGenerateTwofaSecretMutation,
  useVerifyOtpMutation
} from "src/services/auth-service.js";
import { Save, Verified } from "@mui/icons-material";
import {
  useGetMeQuery,
  useSendEmailVerifyCodeMutation,
  useUpdateEmailMutation,
  useUpdatePasswordMutation,
  useUpdateUserMutation,
} from "src/services/user-service.js";
import { useFormik } from "formik";
import { useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { useSendCodeMutation, useVerifyCodeMutation } from "src/services/tfa-service.js";
import VerifyCodeDialog from "./verifyCodeDialog.js";
import toast from "react-hot-toast";
import { useResetPasswordMutation } from "src/services/auth-service.js";
import { useNavigate } from "react-router";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: user, refetch: refetchUser } = useGetMeQuery();
  const isMdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));
  // Name Update
  const [updateUser] = useUpdateUserMutation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showNameSave, setShowNameSave] = useState(false);
  const [twoFa, setTwofa] = useState('');
  const [qrString, setQrString] = useState(null);
  const [status, setStatus] = useState(false);
  const [openConfirmationDialog, SetopenConfirmationDialog] = useState(false);
  const [generateQrcode] = useGenerateTwofaSecretMutation();
  const [verifyOtp] = useVerifyOtpMutation();

  const useStyles = makeStyles({
    centeredText: {
      textAlign: 'center',
    },
    whiteBackground: {
      backgroundColor: 'white',
    },
  });

  const classes = useStyles();

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    if (e.target.value !== user?.name?.first) {
      setShowNameSave(true);
    } else {
      setShowNameSave(false);
    }
  };

  const handleTwofaChange = (e) => {
    setTwofa(e.target.value);
  }

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
    if (e.target.value !== user?.name?.last) {
      setShowNameSave(true);
    } else {
      setShowNameSave(false);
    }
  };

  const handleSaveNameClick = async () => {
    await updateUser({
      name: {
        first: firstName,
        last: lastName,
      },
    }).unwrap();
    setShowNameSave(false);
    toast.success("Name Updated!");
    refetchUser();
  };

  // Email Update
  const [sendCode] = useSendCodeMutation();
  const [verifyCode] = useVerifyCodeMutation();
  const [sendEmailVerifyCode] = useSendEmailVerifyCodeMutation();
  const [updateEmail] = useUpdateEmailMutation();

  const { setValues: setEmailFormValues, ...emailForm } = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Must be a valid email").max(255).required("Email is required"),
    }),
    onSubmit: async () => {
      await sendCode().unwrap();
      setOpenTfaDialog(true);
    },
  });
  const [showEmailSave, setShowEmailSave] = useState(false);
  const [openTfaDialog, setOpenTfaDialog] = useState(false);
  const [openVneDialog, setOpenVneDialog] = useState(false);

  const handleEmailChange = (e) => {
    emailForm.handleChange(e);
    if (e.target.value !== user?.email) {
      setShowEmailSave(true);
    } else {
      setShowEmailSave(false);
    }
  };

  const handleTfaDialogSubmit = async (values) => {
    try {
      const { tfaToken } = await verifyCode({ code: values.code }).unwrap();
      await sendEmailVerifyCode({ tfaToken, email: emailForm.values.email });
      setOpenTfaDialog(false);
      setOpenVneDialog(true);
    } catch (error) {
      toast.error(error.data.error.message);
    }
  };

  const handleTfaDialogClose = () => {
    setOpenTfaDialog(false);
  };

  const handleVneDialogSubmit = async (values) => {
    try {
      await updateEmail({ code: values.code, email: emailForm.values.email }).unwrap();
      setOpenVneDialog(false);
      setShowEmailSave(false);
      toast.success("Email Updated!");
      refetchUser();
    } catch (error) {
      toast.error(error.data.error.message);
    }
  };

  const handleVneDialogClose = () => {
    setOpenVneDialog(false);
  };

  // Password Update
  const [updatePassword] = useUpdatePasswordMutation();
  const [openUpdatePasswordDialog, setOpenUpdatePasswordDialog] = useState(false);

  const formikUpdatePassword = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema: Yup.object().shape({
      currentPassword: Yup.string().required("Current password is required"),
      newPassword: Yup.string()
        .required("New password is required")
        .min(8, "Password must be at least 8 characters long"),
      confirmNewPassword: Yup.string()
        .required("Confirm new password is required")
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const { message } = await updatePassword(values).unwrap();
        setOpenUpdatePasswordDialog(false);
        toast.success(message);
        helpers.resetForm();
      } catch (err) {
        toast.error(err.data.error.message);
      }
    },
  });

  // Reset Password
  const [resetPassword] = useResetPasswordMutation();
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);

  const formikResetPassword = useFormik({
    initialValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema: Yup.object().shape({
      newPassword: Yup.string()
        .required("New password is required")
        .min(8, "Password must be at least 8 characters long"),
      confirmNewPassword: Yup.string()
        .required("Confirm new password is required")
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
    }),
    onSubmit: async (values) => {
      try {
        const { message } = await resetPassword(values).unwrap();
        setOpenResetPasswordDialog(false);
        toast.success(message);
      } catch (err) {
        toast.error(err.data.error.message);
      }
    },
  });

  useEffect(() => {
    const pwreset = searchParams.get("pwreset");
    if (pwreset) setOpenResetPasswordDialog(true);
  }, [searchParams]);

  const handleUpdatePasswordClick = () => {
    setOpenUpdatePasswordDialog(true);
  };

  const handleCloseUpdatePasswordDialog = () => {
    setOpenUpdatePasswordDialog(false);
  };

  useEffect(() => {
    setFirstName(user?.name?.first);
    setLastName(user?.name?.last);
    setEmailFormValues({ email: user?.email });
  }, [user, setEmailFormValues]);


  const EnableTwofa = async()=> {
    const response = await generateQrcode({email: user?.email});
    setQrString(response.data.message)
  }

  const handleEnableClick = async() =>{
    const response = await verifyOtp({email: user?.email, token: twoFa})
    if(response.data.message.twofaEnabled){
      setStatus(true)
      toast.success(response.data.message.message);
      toast.success('Two-factor Authentication Enabled');
      refetchUser();
    } else{
      toast.error(response.data.message.message);
    }
  }

  const handleOpen = () => {
    SetopenConfirmationDialog(true);
  };

  const handleClose = () => {
    SetopenConfirmationDialog(false);
  };

  const handleConfirm = async() => {
    const response = await generateQrcode({email: user?.email ,disable2fa: true})
    setQrString(null);
    setTwofa('');
    toast.success(response.data.message.message);
    refetchUser();
    SetopenConfirmationDialog(false);
  };


  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "column",
          boxShadow: "0px 12px 15px 0px #4B71970D",
          borderRadius: "12px",
          backgroundColor: "white",
          width: "100%",
          p: 2,
        }}
      >
        <Grid container spacing={1} columnSpacing={3} sx={{ width: "100%" }}>
          <Grid item xs={12} sm={6} sx={{}}>
            <Stack
              spacing={2}
              sx={{ mt: 2, alignItems: "center", justifyContent: "center", width: "100%" }}
            >
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "left",
                  fontSize: "16px",
                  fontWeight: 700,
                  lineHeight: "20px",
                  color: "#28287B",
                  mt: 0,
                }}
              >
                First Name
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Last name"
                sx={{
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
                value={firstName}
                onChange={handleFirstNameChange}
              />
            </Stack>
            <Stack
              spacing={2}
              sx={{ mt: 2, alignItems: "center", justifyContent: "center", width: "100%" }}
            >
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
                variant="outlined"
                fullWidth
                placeholder="Last name"
                sx={{
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
                value={lastName}
                onChange={handleLastNameChange}
              />
            </Stack>
            <Grid item xs={12} sx={{ px: 0 }}>
              <Box
                sx={{
                  display: showNameSave ? "flex" : "none",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Button
                  size="small"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 1,
                    px: 2,
                  }}
                  onClick={handleSaveNameClick}
                  variant="contained"
                >
                  <Save fontSize="small" />
                  <Typography sx={{ fontSize: "13px", ml: 0.5, fontWeight: "500" }}>
                    Save
                  </Typography>
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6} sx={{}}>
            <Stack
              spacing={2}
              sx={{ mt: 2, alignItems: "center", justifyContent: "center", width: "100%" }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: user?.emailVerified ? "flex-start" : "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    textAlign: "left",
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    color: "#28287B",
                    mt: 0,
                  }}
                >
                  Email
                </Typography>

                {user?.emailVerified ? (
                  <Verified sx={{ color: theme.palette.primary.main, fontSize: "20px" }} />
                ) : (
                  <></>
                  // <Typography
                  //   sx={{
                  //     textAlign: "left",
                  //     mt: 0,
                  //     fontSize: "13px",
                  //     fontWeight: 700,
                  //     lineHeight: "16px",
                  //     cursor: "pointer",
                  //     color: theme.palette.primary.main,
                  //   }}
                  //   onClick={() => {
                  //     navigate("/register/verify-email");
                  //   }}
                  // >
                  //   Verify email
                  // </Typography>
                )}
              </Box>
              <TextField
                name="email"
                variant="outlined"
                fullWidth
                value={emailForm.values.email}
                onChange={handleEmailChange}
                error={!!(emailForm.touched.email && emailForm.errors.email)}
                helperText={emailForm.touched.email && emailForm.errors.email}
                onBlur={emailForm.handleBlur}
                disabled
                placeholder="Email address"
                sx={{
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
              <Box
                sx={{
                  display: showEmailSave ? "flex" : "none",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Button
                  size="small"
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                  onClick={emailForm.handleSubmit}
                  disabled={!!(emailForm.touched.email && emailForm.errors.email)}
                >
                  <Save fontSize="small" />
                  <Typography sx={{ fontSize: "12px", color: "black", ml: 0.5 }}>Save</Typography>
                </Button>
              </Box>
            </Stack>
            <Stack
              spacing={2}
              sx={{
                width: "100%",
                mt: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                <Typography
                  sx={{
                    textAlign: "left",
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    color: "#28287B",
                    mt: 2,
                  }}
                >
                  Password
                </Typography>
                <Typography
                  sx={{
                    textAlign: "left",
                    mt: 2,
                    fontSize: "13px",
                    fontWeight: 700,
                    lineHeight: "16px",
                    cursor: "pointer",

                    color: theme.palette.primary.main,
                  }}
                  onClick={handleUpdatePasswordClick}
                >
                  Change Password
                </Typography>
              </Box>

              <TextField
                defaultValue="password"
                variant="outlined"
                fullWidth
                type="password"
                disabled
                sx={{
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
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} sx={{}}>
            <Stack
              spacing={2}
              sx={{ mt: 2, alignItems: "center", justifyContent: "center", width: "100%" }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderColor: 'blue'
                }}
              >
                <Typography
                  sx={{
                    textAlign: "left",
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    color: "#28287B",
                    mt: 0,
                  }}
                >
                 Two-factor authentication
                </Typography>

              </Box>
              {!qrString && !user?.twofaEnabled ? (
              <Button 
                variant="outlined" 
                color="success" 
                style={{marginRight: 'auto'}}
                onClick={EnableTwofa}
              >
                Enable authentication
              </Button>) : user?.twofaEnabled ?
              ( 
                <Button 
                  variant="outlined" 
                  color="error" 
                  style={{marginRight: 'auto'}}
                  onClick={handleOpen}
                >
                  Disable authentication
                </Button>): <></>}
             {qrString && !user?.twofaEnabled ?  (
              <TextField
                name="2fa"
                variant="outlined"
                fullWidth
                value={twoFa}
                onChange={(e) => handleTwofaChange(e)}
                error={''}
                helperText={''}
                placeholder="Enter 2FA code from the App...."
                sx={{
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
              />) : <></>}
            <Grid item xs={12} sx={{ px: 0 }}>
              <Box
                sx={{
                  display: qrString && !user?.twofaEnabled ? "flex" : "none",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Button
                  size="small"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 1,
                    px: 2,
                  }}
                  onClick={handleEnableClick}
                  variant="contained"
                >
                  <Save fontSize="small" />
                  <Typography sx={{ fontSize: "13px", ml: 0.5, fontWeight: "500" }}>
                    Enable
                  </Typography>
                </Button>
              </Box>
            </Grid>
            </Stack>
            {qrString && !user?.twofaEnabled ? (
            <Typography variant="body2" style={{ maxWidth: '550px', wordWrap: 'break-word' }}>
              <strong>Note:</strong> Please scan the QR code using Google Authenticator or Authy, or manually add the following secret key to your Authenticator app.
              This will enable you to start receiving secure 2FA codes for enhanced account protection.
            </Typography>): <></>}
          </Grid>
          <Grid item xs={12} sm={6} sx={{}}>
            <Stack
              spacing={2}
              sx={{ mt: 2, alignItems: "center", justifyContent: "center", width: "100%" }}
            >
              {qrString && !user?.twofaEnabled ? (
                <>
                <img src={qrString.qrImageDataUrl} style={{width:'200px', height: '200px'}}></img>
                <TextField
                value={qrString.secret}
                InputProps={{
                  classes: {
                    input: classes.centeredText,
                    disabled: classes.whiteBackground,
                  },
                }}
                />
              </>
              ) : <></>}
            </Stack>
          </Grid>

          {/* <Grid item xs={6} sx={{}}>
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
              }}
            >
              First name
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{}}>
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
              }}
            >
              Last name
            </Typography>
          </Grid> */}
          {/* <Grid
            item
            xs={6}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              flexDirection: "column",
              mt: 2,
            }}
          >
            
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Last name"
              sx={{
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
              value={firstName}
              onChange={handleFirstNameChange}
            />
          </Grid>

          <Grid
            item
            xs={6}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              flexDirection: "column",
              mt: 2,
            }}
          >
            {/* <InputLabel sx={{ color: "rgba(0,0,0,0.5)" }}>Last</InputLabel> 
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Last name"
              sx={{
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
              value={lastName}
              onChange={handleLastNameChange}
            />
          </Grid> */}
          {/* <Grid item xs={12}>
            <Box
              sx={{
                display: showNameSave ? "flex" : "none",
                justifyContent: "flex-end",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Button
                size="small"
                sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                onClick={handleSaveNameClick}
              >
                <Save fontSize="small" />
                <Typography sx={{ fontSize: "12px", color: "black", ml: 0.5 }}>Save</Typography>
              </Button>
            </Box>
          </Grid> */}
          {/* <Grid item xs={6} sx={{ mt: 2 }}>
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#28287B",
              }}
            >
              Email Address
            </Typography>
          </Grid> */}
          {/* <Grid
            item
            xs={6}
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
              Password
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                lineHeight: "16px",
                cursor: "pointer",
                color: "#0071F6",
              }}
              onClick={handleUpdatePasswordClick}
            >
              Change Password
            </Typography>
          </Grid> */}
          {/* <Grid
            item
            xs={6}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              flexDirection: "column",
            }}
          >
            <TextField
              name="email"
              variant="outlined"
              fullWidth
              value={emailForm.values.email}
              onChange={handleEmailChange}
              error={!!(emailForm.touched.email && emailForm.errors.email)}
              helperText={emailForm.touched.email && emailForm.errors.email}
              onBlur={emailForm.handleBlur}
              disabled
              placeholder="Email address"
              sx={{
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
            <Box
              sx={{
                display: showEmailSave ? "flex" : "none",
                justifyContent: "flex-end",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Button
                size="small"
                sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                onClick={emailForm.handleSubmit}
                disabled={!!(emailForm.touched.email && emailForm.errors.email)}
              >
                <Save fontSize="small" />
                <Typography sx={{ fontSize: "12px", color: "black", ml: 0.5 }}>Save</Typography>
              </Button>
            </Box>
          </Grid> */}

          {/* <Grid
            item
            xs={6}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              flexDirection: "column",
            }}
          >
            <TextField
              defaultValue="password"
              variant="outlined"
              fullWidth
              type="password"
              disabled
              sx={{
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
          </Grid> */}
        </Grid>
      </Box>

      {/* Email Update Dialogs */}
      <VerifyCodeDialog
        open={openTfaDialog}
        onClose={handleTfaDialogClose}
        title="Two Factor Authentication"
        contentText={
          <>
            Please enter the code we just sent to{" "}
            <span style={{ fontWeight: 600 }}>{user?.email}</span>
          </>
        }
        onSubmit={handleTfaDialogSubmit}
      />
      <VerifyCodeDialog
        open={openVneDialog}
        onClose={handleVneDialogClose}
        title="Verify your new email"
        contentText={
          <>
            Please enter the code we just sent to{" "}
            <span style={{ fontWeight: 600 }}>{emailForm.values.email}</span>
          </>
        }
        onSubmit={handleVneDialogSubmit}
      />

      {/* Password Update Dialog */}
      <Dialog
        open={openUpdatePasswordDialog}
        onClose={handleCloseUpdatePasswordDialog}
        sx={{
          backgroundColor: "rgba(4, 4, 30, 0.5)",
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: "28px",
            color: "#28287B",
            mt: 1,
          }}
        >
          Update Password
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: isMdUp ? "row" : "column",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <Stack sx={{ width: isMdUp ? "32%" : "100%" }}>
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
                Current password
              </Typography>
              <TextField
                fullWidth
                type="password"
                placeholder="Enter password"
                id="currentPassword"
                name="currentPassword"
                variant="outlined"
                onChange={formikUpdatePassword.handleChange}
                onBlur={formikUpdatePassword.handleBlur}
                value={formikUpdatePassword.values.currentPassword}
                error={
                  formikUpdatePassword.touched.currentPassword &&
                  Boolean(formikUpdatePassword.errors.currentPassword)
                }
                helperText={
                  formikUpdatePassword.touched.currentPassword &&
                  formikUpdatePassword.errors.currentPassword
                }
                sx={{
                  mt: 2,
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
              />
            </Stack>
            <Stack sx={{ width: isMdUp ? "32%" : "100%" }}>
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
                New password
              </Typography>
              <TextField
                fullWidth
                type="password"
                placeholder="Enter new password"
                id="newPassword"
                name="newPassword"
                variant="outlined"
                onChange={formikUpdatePassword.handleChange}
                onBlur={formikUpdatePassword.handleBlur}
                value={formikUpdatePassword.values.newPassword}
                error={
                  formikUpdatePassword.touched.newPassword &&
                  Boolean(formikUpdatePassword.errors.newPassword)
                }
                helperText={
                  formikUpdatePassword.touched.newPassword &&
                  formikUpdatePassword.errors.newPassword
                }
                sx={{
                  mt: 2,
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
              />
            </Stack>
            <Stack sx={{ width: isMdUp ? "32%" : "100%" }}>
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
                Confirm new password
              </Typography>
              <TextField
                fullWidth
                type="password"
                placeholder="Confirm new password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                variant="outlined"
                onChange={formikUpdatePassword.handleChange}
                onBlur={formikUpdatePassword.handleBlur}
                value={formikUpdatePassword.values.confirmNewPassword}
                error={
                  formikUpdatePassword.touched.confirmNewPassword &&
                  Boolean(formikUpdatePassword.errors.confirmNewPassword)
                }
                helperText={
                  formikUpdatePassword.touched.confirmNewPassword &&
                  formikUpdatePassword.errors.confirmNewPassword
                }
                sx={{
                  mt: 2,
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
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ mb: 3, mx: 2 }}>
          <Button
            onClick={handleCloseUpdatePasswordDialog}
            variant="outlined"
            fullWidth
            sx={{ p: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={formikUpdatePassword.handleSubmit}
            variant="contained"
            fullWidth
            sx={{ p: 1, display: { xs: "block", sm: "none" } }}
          >
            Update
          </Button>
          <Button
            onClick={formikUpdatePassword.handleSubmit}
            variant="contained"
            fullWidth
            sx={{ p: 1, display: { xs: "none", sm: "block" } }}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={openResetPasswordDialog}>
        <DialogTitle sx={{ fontSize: "24px" }}>Reset Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="New Password"
            id="newPassword"
            name="newPassword"
            variant="outlined"
            onChange={formikResetPassword.handleChange}
            onBlur={formikResetPassword.handleBlur}
            value={formikResetPassword.values.newPassword}
            error={
              formikResetPassword.touched.newPassword &&
              Boolean(formikResetPassword.errors.newPassword)
            }
            helperText={
              formikResetPassword.touched.newPassword && formikResetPassword.errors.newPassword
            }
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            variant="outlined"
            onChange={formikResetPassword.handleChange}
            onBlur={formikResetPassword.handleBlur}
            value={formikResetPassword.values.confirmNewPassword}
            error={
              formikResetPassword.touched.confirmNewPassword &&
              Boolean(formikResetPassword.errors.confirmNewPassword)
            }
            helperText={
              formikResetPassword.touched.confirmNewPassword &&
              formikResetPassword.errors.confirmNewPassword
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ mb: 3 }}>
          <Button onClick={formikResetPassword.handleSubmit} variant="contained">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmationDialog} onClose={handleClose}>
        <DialogTitle>Are You Sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You want to disable the 2 Factor Authentication?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="error" >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Profile;
