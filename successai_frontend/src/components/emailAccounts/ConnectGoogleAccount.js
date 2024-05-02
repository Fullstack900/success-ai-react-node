import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";
import {
  Box,
  Button,
  Grid,
  InputLabel,
  TextField,
  Typography,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  ArrowBackIos,
  ArrowRight,
  CheckCircle,
  East,
  ErrorOutline,
  OndemandVideo,
  Settings,
  ArrowBackOutlined,
} from "@mui/icons-material";
import { CheckCircleIcon } from "src/assets/general/CheckCircleIcon";
import { ErrorIcon } from "src/assets/general/ErrorIcon";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  useConnectGoogleImapSmtpMutation,
  useConnectGoogleAccountMutation,
} from "src/services/account-service";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { config } from "src/config.js";
import useWindowOpener from "src/hooks/use-window-opener.js";
import { useSelector } from "react-redux";
import { PlayIcon } from "src/assets/general/PlayIcon";

const ConnectGoogleAccount = forwardRef(({ activeStepGAcc, setActiveStepGAcc }, ref) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();

  const reconnect = searchParams.get("reconnect")?.replace(" ", "+");
  const account = useSelector((state) => state.accounts.find((a) => a.email === reconnect));
  
  const [connectGoogleAccount] = useConnectGoogleAccountMutation();
  const [connectGoogleImapSmtp] = useConnectGoogleImapSmtpMutation();

  const handleOnMessage = async (event) => {
    if (event?.data?.provider === "google_oauth") {
      closeWindow();
      const { code } = event.data;
      const toastId = toast.loading("Loading...", { duration: Infinity });
      try {
        const { message } = await connectGoogleAccount({ reconnect, code : {code} }).unwrap();
        toast.success(message, { id: toastId, duration: 2000 });
      } catch (error) {
        toast.error(error.data.error.message, { id: toastId, duration: 2000 });
      } finally {
        navigate("/accounts");
      }
    }
  };

  const { openWindow, closeWindow } = useWindowOpener({ onMessage: handleOnMessage });

  const handleConnectGoogleAccount = async () => {
    const params = new URLSearchParams({
      redirect_uri: config.GOOGLE_OAUTH_REDIRECT_URL,
      client_id: config.GOOGLE_OAUTH_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: config.GOOGLE_OAUTH_SCOPE,
    });
    const url = `${config.GOOGLE_OAUTH_AUTH_URL}?${params.toString()}`;
    openWindow(url);
  };

  const formik = useFormik({
    initialValues: {
      name: {
        first: account?.name?.first || "",
        last: account?.name?.last || "",
      },
      email: account?.email || "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.object({
        first: Yup.string(),
        last: Yup.string(),
      }),
      email: Yup.string().email("Must be a valid email").max(255).required("Email is required"),
      password: Yup.string()
        .test('len', 'Password must be of 16 characters', val => val && val.replace(/\s/g, '').length === 16)
        .required("Password is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const { message } = await connectGoogleImapSmtp({ reconnect, data: values }).unwrap();
        toast.success(message);
        navigate("/accounts");
      } catch (err) {
        helpers.setErrors({ submit: err.data.error.message });
      }
    },
  });

  useImperativeHandle(ref, () => ({
    handleConnectGoogleAccount,
    handleSubmit: formik.handleSubmit,
  }));

  return (
    <>
      {activeStepGAcc === 0 ? (
        <>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              pb: 3,
              borderBottom: `1px solid  ${theme.palette.grey[300]}`,
            }}
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: "20px",
                color: "#28287B",
              }}
            >
              Before moving forward <span style={{ fontWeight: 700 }}> please enable IMAP </span>
              access on your Google account
            </Typography>
          </Box>
          <Box sx={{ width: "100%", pb: 1, borderBottom: `1px solid  ${theme.palette.grey[300]}` }}>
            <Box
              sx={{
                width: "9 0%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  lineHeight: "20px",
                  color: "#28287B",
                }}
              >
                <ol style={{ paddingLeft: "12px" }}>
                  <li style={{ marginTop: "16px" }}>Open Gmail on your computer.</li>
                  <li style={{ marginTop: "16px" }}>
                    Click the <span style={{ fontWeight: 700 }}>Gear</span> icon in the top right.
                  </li>
                  <li style={{ marginTop: "16px" }}>
                    Select <span style={{ fontWeight: 700 }}>All Settings.</span>
                  </li>
                  <li style={{ marginTop: "16px" }}>
                    Navigate to the{" "}
                    <a
                      style={{
                        color: theme.palette.primary.main,
                        cursor: "pointer",
                        textDecoration: "none",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                      target="_blank"
                      href="https://mail.google.com/mail/u/0/#settings/fwdandpop"
                      rel="noreferrer"
                    >
                      Forwarding and POP/IMAP
                    </a>{" "}
                    tab.
                  </li>
                  <li style={{ marginTop: "20px" }}>
                    Under "IMAP access", select{" "}
                    <span style={{ fontWeight: 700 }}>Enable IMAP.</span>
                  </li>
                  <li style={{ marginTop: "20px" }}>
                    Click <span style={{ fontWeight: 700 }}>Save Changes.</span>
                  </li>
                </ol>
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              href="https://app.guidde.com/share/playbooks/oBHJqErBH9cnDeDZYQ1kqD?origin=eFQYvOZvO5YNjiMHoCSey3y1UJz2"
              target="_blank"
              sx={{ color: theme.palette.primary.main, fontWeight: 700, fontSize: "14px", mt: 2 }}
            >
              Show me step-by-step <East fontSize="small" sx={{ ml: 1 }} />
            </Button>
          </Box>
        </>
      ) : activeStepGAcc === 1 ? (
        <>
          <Typography
            sx={{
              width: "100%",
              textAlign: "left",
              color: "#28287B",
              // mt: 3,
              fontSize: "13px",
              fontWeight: 500,
              lineHeight: "20px",
            }}
          >
            Select a connection plan
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              mt: 3,
              width: "100%",

              pb: 3,
              gap: 2,
              borderBottom: `1px solid  ${theme.palette.grey[300]}`,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                backgroundColor: theme.palette.primary.main,
                borderRadius: 2,
                p: 4,
                py: 3,
                // boxShadow: "0px 0px 10px -1px rgba(5, 124, 251, 0.75)",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                flexDirection: "column",
                width: { xs: "100%", sm: "45%", md: "330px" },
                cursor: "pointer",
                height: { xs: "fit-content", sm: "100%" },
              }}
              onClick={() => {
                setActiveStepGAcc(3);
              }}
            >
              <Typography sx={{ color: "white", fontWeight: 600, fontSize: "15px" }}>
                Option 1: oAuth{" "}
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 1,
                    color: "white",
                    mt: 3,
                  }}
                >
                  <Box sx={{ pt: 0.3 }}>
                    {" "}
                    <CheckCircleIcon color={theme.palette.primary.contrastText} size="16" />
                  </Box>
                  Faster & easier to setup
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 1,
                    color: "white",
                    my: 1,
                  }}
                >
                  <Box sx={{ pt: 0.3 }}>
                    {" "}
                    <CheckCircleIcon color={theme.palette.primary.contrastText} size="16" />
                  </Box>
                  Greater stability and fewer disconnections
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 1,
                    color: "white",
                  }}
                >
                  <Box sx={{ pt: 0.3 }}>
                    {" "}
                    <CheckCircleIcon color={theme.palette.primary.contrastText} size="16" />
                  </Box>
                  Available for GSuite users
                </Typography>
              </Box>
              <Typography
                sx={{
                  backgroundColor: theme.palette.primary.contrastText,
                  color: "#00AA38",
                  py: 1,
                  px: 2,
                  borderRadius: 1,
                  fontSize: "13px",
                  fontWeight: "700",
                  fontFamily: "Inter, sans-serif",
                  mt: 2,
                }}
              >
                Recommended
              </Typography>
            </Box>
            <Box
              sx={{
                borderRadius: 2,
                p: 4,
                py: 3,
                border: `1px solid ${theme.palette.grey[300]}`,
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                flexDirection: "column",
                width: { xs: "100%", sm: "45%", md: "330px" },
                cursor: "pointer",
                height: { xs: "fit-content", sm: "100%" },
                backgroundColor: theme.palette.grey[100],
              }}
              onClick={() => {
                setActiveStepGAcc(4);
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: "15px", color: "#28287B" }}>
                Option 2: App Password{" "}
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 1,
                    color: "#28287B",
                    mt: 3,
                  }}
                >
                  <Box sx={{ pt: 0.3 }}>
                    <CheckCircleIcon size="16" />
                  </Box>
                  Available for personal accounts
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 1,
                    color: "#28287B",
                    my: 1,
                  }}
                >
                  <Box sx={{ pt: 0.3 }}>
                    <ErrorIcon color="#FD1E36" size="16" />
                  </Box>
                  Requires 2-factor authentication
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 1,
                    color: "#28287B",
                  }}
                >
                  <Box sx={{ pt: 0.3 }}>
                    <ErrorIcon color="#FD1E36" size="16" />
                  </Box>
                  More prone to disconnects
                </Typography>
              </Box>
              <Typography
                sx={{
                  backgroundColor: "#DBF9E5",
                  color: "#7E8480",
                  p: 0.5,
                  px: 0.75,
                  borderRadius: 1,
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  mt: 6,
                  visibility: "hidden",
                }}
              >
                Recommended
              </Typography>
            </Box>
          </Box>{" "}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 3,
            }}
          >
            <Button
              sx={{ color: "#0071F6" }}
              onClick={() => {
                setActiveStepGAcc(0);
              }}
            >
              <ArrowBackOutlined
                fontSize="small"
                sx={{ color: theme.palette.primary.main, mr: 1 }}
              />
              Back
            </Button>
          </Box>
        </>
      ) : activeStepGAcc === 3 ? (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              alignItems: "flex-start",
              justifyContent: "center",
              borderBottom: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: "20px",
                color: "#28287B",
              }}
            >
              Please grant Success.ai access to your Google Workspace.
            </Typography>
            <Typography
              sx={{
                // backgroundColor: "#DBF9E5",
                py: 1,
                px: 0.75,
                borderRadius: 1,
                fontSize: "11px",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",

                my: 0.8,
                mt: 1.5,
                color: "#00AA38",
                border: "1px solid #DAEFDF",
              }}
            >
              This action is necessary only once for each domain
            </Typography>
            <Button
              href="https://app.guidde.com/share/playbooks/6XKKtvUaYNDRTpJmnjdzLT?origin=VHyVOGLjEjUdXmnOjVbUzsMXXI22"
              target="_blank"
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "18px",
                my: 1,
                mb: 3,
                p: 1,
              }}
              variant="contained"
              onClick={() => {
                window.location.href =
                  "https://app.guidde.com/share/playbooks/6XKKtvUaYNDRTpJmnjdzLT?origin=VHyVOGLjEjUdXmnOjVbUzsMXXI22";
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}>
                <PlayIcon color="white" />
              </Box>
              Watch Tutorial Video
            </Button>
          </Box>
          <Box sx={{ width: "100%", py: 2 }}>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: "20px",
                color: "#28287B",
              }}
            >
              <ol style={{ paddingLeft: "12px" }}>
                <li>
                  Open your{" "}
                  <span style={{ color: "#036AFC", cursor: "pointer", fontWeight: 700 }}>
                    <a href="https://admin.google.com/u/1/ac/owl/list?tab=configuredApps" target="_blank" >
                      Google Workspace Admin Panel
                    </a>
                  </span>
                </li>
                <li style={{ marginTop: "25px" }}>
                  Click on <span style={{ fontWeight: 700 }}>"Add App"</span> and choose{" "}
                  <span style={{ fontWeight: 700 }}>"OAuth App Name or Client ID"</span>
                </li>
                <li style={{ marginTop: "25px" }}>
                  Use the following Client ID to locate Success.ai:
                  <br />
                  <Box
                    sx={{
                      backgroundColor: "#F2F4F6",
                      padding: 2,
                      borderRadius: 2,
                      mt: 1,
                      ml: "-12px",
                      width: { xs: "100%", sm: "fit-content" },
                      overflowWrap: "break-word",
                    }}
                  >
                    343851017362-h9p81o15ol8dm80isuls4501eqf6v04u.apps.googleusercontent.com
                  </Box>
                </li>
                <li style={{ marginTop: "25px" }}>
                  Select and authorize Success.ai for access to your Google Workspace
                </li>
              </ol>
            </Typography>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 3,
              pt: 3,
              borderTop: `1px solid ${theme.palette.grey[300]}`,
            }}
          >
            <Button
              sx={{ color: "#0071F6" }}
              onClick={() => {
                setActiveStepGAcc(1);
              }}
            >
              <ArrowBackOutlined fontSize="small" sx={{ color: "#0071F6", mr: 1 }} />
              Back
            </Button>{" "}
            {/* <Button
              onClick={handleConnectGoogleAccount}
              sx={{ color: "#fff", ml: 2 }}
              variant="contained"
            >
              Sign In
              <East fontSize="small" sx={{ ml: 1 }} />
            </Button>{" "} */}
          </Box>
        </>
      ) : activeStepGAcc === 4 ? (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              alignItems: "flex-start",
              justifyContent: "center",
              borderBottom: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              sx={{ fontSize: "13px", fontWeight: 500, lineHeight: "20px", color: "#28287B" }}
            >
              Activate 2-step verification and create an App password
            </Typography>

            <Button
              href="https://app.guidde.com/share/playbooks/6fz7VZcPgraQvU6QzoL11Z?origin=VHyVOGLjEjUdXmnOjVbUzsMXXI22"
              target="_blank"
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "18px",
                my: 1,
                mb: 3,
                p: 1,
              }}
              variant="contained"
              onClick={() => {
                window.location.href =
                  "https://app.guidde.com/share/playbooks/6fz7VZcPgraQvU6QzoL11Z?origin=VHyVOGLjEjUdXmnOjVbUzsMXXI22";
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}>
                <PlayIcon color="white" />
              </Box>
              Watch Tutorial Video
            </Button>
          </Box>
          <Box sx={{ width: "100%", py: 2 }}>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: "20px",
                color: "#28287B",
              }}
            >
              <ol style={{ paddingLeft: "12px" }}>
                <li style={{ fontSize: "13px", fontWeight: "500" }}>
                  Navigate to your Google Account's Security Settings{" "}
                  <a
                    style={{
                      color: theme.palette.primary.main,
                      cursor: "pointer",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                    target="_blank"
                    href="https://myaccount.google.com/security"
                    rel="noreferrer"
                  >
                    Security Settings
                  </a>
                </li>
                <li style={{ marginTop: "20px", fontSize: "13px", fontWeight: "500" }}>
                  Turn on{" "}
                  <a
                    style={{
                      color: theme.palette.primary.main,
                      cursor: "pointer",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                    target="_blank"
                    href="https://myaccount.google.com/signinoptions/two-step-verification"
                    rel="noreferrer"
                  >
                    2-step verification
                  </a>
                </li>
                <li style={{ marginTop: "20px", fontSize: "13px", fontWeight: "500" }}>
                  Generate an{" "}
                  <a
                    style={{
                      color: theme.palette.primary.main,
                      cursor: "pointer",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                    target="_blank"
                    href="https://myaccount.google.com/apppasswords"
                    rel="noreferrer"
                  >
                    App password.
                  </a>
                  Choose 'Other' for both App and Device categories
                </li>
              </ol>
            </Typography>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 3,
              pt: 3,
              borderTop: `1px solid ${theme.palette.grey[300]}`,
            }}
          >
            {" "}
            <Button
              sx={{ color: "#0071F6" }}
              onClick={() => {
                setActiveStepGAcc(1);
              }}
            >
              <ArrowBackOutlined fontSize="small" sx={{ color: "#0071F6", mr: 1 }} />
              Back
            </Button>{" "}
            {/* <Button
              sx={{ color: "#fff", ml: 2 }}
              variant="contained"
              onClick={() => {
                setActiveStepGAcc(5);
              }}
            >
              Next
              <East fontSize="small" sx={{ ml: 1 }} />
            </Button> */}
          </Box>
        </>
      ) : activeStepGAcc === 5 ? (
        <>
          <form noValidate onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                flexDirection: "column",
              }}
            >
              {" "}
              <Box sx={{ width: { xs: "100%", md: "70%" } }}>
                <Grid container sx={{ rowGap: 2 }}>
                  <Grid
                    item
                    xs={12}
                    sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}
                  >
                    <Box sx={{ width: { xs: "100%", sm: "50%" } }}>
                      <InputLabel
                        sx={{
                          width: "100%",
                          textAlign: "left",
                          fontSize: "16px",
                          fontWeight: 700,
                          lineHeight: "20px",
                          color: "#28287B",
                        }}
                      >
                        First Name
                      </InputLabel>
                      <TextField
                        placeholder="First name"
                        fullWidth
                        variant="outlined"
                        sx={{
                          mt: 2,

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
                        error={!!(formik.touched.name?.first && formik.errors.name?.first)}
                        helperText={formik.touched.name?.first && formik.errors.name?.first}
                        name="name.first"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.name.first}
                      />
                    </Box>
                    <Box sx={{ width: { xs: "100%", sm: "50%" } }}>
                      <InputLabel
                        sx={{
                          width: "100%",
                          textAlign: "left",
                          fontSize: "16px",
                          fontWeight: 700,
                          lineHeight: "20px",
                          color: "#28287B",
                        }}
                      >
                        Last Name
                      </InputLabel>
                      <TextField
                        placeholder="Last name"
                        fullWidth
                        variant="outlined"
                        sx={{
                          mt: 2,
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
                        error={!!(formik.touched.name?.last && formik.errors.name?.last)}
                        helperText={formik.touched.name?.last && formik.errors.name?.last}
                        name="name.last"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.name.last}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <InputLabel
                      sx={{
                        width: "100%",
                        textAlign: "left",
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: "20px",
                        color: "#28287B",
                      }}
                    >
                      Email
                    </InputLabel>
                    <TextField
                      placeholder="Email address to connect"
                      fullWidth
                      variant="outlined"
                      sx={{
                        mt: 2,
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
                      error={!!(formik.touched.email && formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      name="email"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.email}
                      disabled={!!account}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <InputLabel
                      sx={{
                        width: "100%",
                        textAlign: "left",
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: "20px",
                        color: "#28287B",
                      }}
                    >
                      Confirm App Password
                    </InputLabel>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "16px",
                        color: "rgba(40, 40, 123, 0.5)",
                        mt: 1,
                      }}
                    >
                      Enter your 16 character app password without any spaces
                    </Typography>
                    <TextField
                      placeholder="App password"
                      fullWidth
                      variant="outlined"
                      sx={{
                        mt: 2,
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
                      error={!!(formik.touched.password && formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      name="password"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.password}
                    />
                  </Grid>
                  {formik.errors.submit && (
                    <Typography
                      color="error"
                      sx={{ mt: 3, textAlign: "center", width: "100%" }}
                      variant="body2"
                    >
                      {formik.errors.submit}
                    </Typography>
                  )}
                </Grid>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",

                  mt: 3,
                  pt: 3,
                  borderTop: `1px solid ${theme.palette.grey[300]}`,
                }}
              >
                <Button
                  sx={{ color: "#0071F6" }}
                  onClick={() => {
                    setActiveStepGAcc(4);
                  }}
                >
                  <ArrowBackOutlined fontSize="small" sx={{ color: "#0071F6" }} />
                  Back
                </Button>
                <Button
                  sx={{ color: "#fff", ml: 2, width: "15ch", py: 1.2 }}
                  type="submit"
                  variant="contained"
                  disabled={!formik.isValid}
                >
                  {formik.isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <>Connect</>
                  )}
                </Button>
              </Box>
            </Box>
          </form>
        </>
      ) : null}
    </>
  );
});

export default ConnectGoogleAccount;
