import { ArrowBackIos, ArrowBackOutlined, DraftsTwoTone, East, Upload } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputLabel,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useState } from "react";
import { Csv } from "src/assets/Csv";
import {
  useConnectCustomImapSmtpAccountMutation,
  useTestImapMutation,
  useTestSmtpMutation,
} from "src/services/account-service";
import * as Yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import BulkUpload from "./BulkUpload.js";
import _ from "lodash";
import { useSelector } from "react-redux";
import { BulkUploadIcon } from "src/assets/campaignDetailsLeads/BulkUploadIcon.js";
import { ManualEmailIcon } from "src/assets/campaignDetailsLeads/ManualEmailIcon.js";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon.js";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon.js";

const ConnectAnyProvider = ({ isCanceled }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const reconnect = searchParams.get("reconnect")?.replace(" ", "+");
  const account = useSelector((state) => state.accounts.find((a) => a.email === reconnect));

  const [activeStepAnyProv, setActiveStepAnyProv] = useState(0);
  const [singleProviderStep, setSingleProviderStep] = useState(0);
  const [testImap] = useTestImapMutation();
  const [testSmtp] = useTestSmtpMutation();
  const [connectCustomImapSmtpAccount] = useConnectCustomImapSmtpAccountMutation();

  const formik = useFormik({
    initialValues: {
      name: {
        first: account?.name?.first || "",
        last: account?.name?.last || "",
      },
      email: account?.email || "",
    },
    validationSchema: Yup.object({
      name: Yup.object({
        first: Yup.string(),
        last: Yup.string(),
      }),
      email: Yup.string().email("Must be a valid email").max(255).required("Email is required"),
    }),
    onSubmit: (value) => {
      if (!account) {
        formikImap.setValues({ username: value.email, password: "", host: "", port: 993 });
      }
      setSingleProviderStep(1);
    },
  });

  const formikImap = useFormik({
    initialValues: {
      username: account?.imap?.username || "",
      password: account?.imap?.password || "",
      host: account?.imap?.host || "",
      port: account?.imap?.port || 993,
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      password: Yup.string().max(255).required("Password is required"),
      host: Yup.string().required("IMAP Host is required"),
      port: Yup.number().required("IMAP Port is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const { message } = await testImap(values).unwrap();
        toast.success(message);
        if (!account) {
          formikSmtp.setValues({
            username: values.username,
            password: values.password,
            host: "",
            port: 587,
          });
        }
        setSingleProviderStep(2);
      } catch (err) {
        helpers.setErrors({ submit: err.data.error.message });
      }
    },
  });

  const formikSmtp = useFormik({
    initialValues: {
      username: account?.smtp?.username || "",
      password: account?.smtp?.password || "",
      host: account?.smtp?.host || "",
      port: account?.smtp?.port || 587,
      replyTo: account?.replyTo || "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      password: Yup.string().max(255).required("Password is required"),
      host: Yup.string().required("SMTP Host is required"),
      port: Yup.string().required("SMTP Port is required"),
      replyTo: Yup.string().email().label("Reply to"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const smtp = _.omit(values, "replyTo");

        await testSmtp(smtp).unwrap();

        const accountInfo = {
          ...formik.values,
          replyTo: values.replyTo,
          imap: formikImap.values,
          smtp,
        };

        const reconnect = searchParams.get("reconnect");
        const { message } = await connectCustomImapSmtpAccount({
          data: accountInfo,
          reconnect,
        }).unwrap();
        toast.success(message);

        navigate("/accounts");
      } catch (err) {
        helpers.setErrors({ submit: err.data.error.message });
      }
    },
  });

  const [checked, setChecked] = useState(false);

  const handleChange = (event) => {
    if (event.target.checked) {
      formikSmtp.setFieldError("replyTo", "Reply to is required");
    } else {
      formikSmtp.setFieldValue("replyTo", "");
    }
    setChecked(event.target.checked);
  };

  return (
    <>
      {activeStepAnyProv === 0 ? (
        <>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              mt: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                borderRadius: "12px",
                cursor: "pointer",
                width: "100%",
                height: "100%",
                p: 3,
                backgroundColor: "white",
                boxShadow: "0px 12px 15px 0px #4B71970D",
                flexDirection: "column",
              }}
              onClick={() => {
                setActiveStepAnyProv(1);
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {" "}
                <BulkUploadIcon />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  mt: 1.5,
                }}
              >
                {/* <Typography sx={{ fontSize: "14px", color: "#aaa" }}>Any provider</Typography> */}
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "26px",
                    color: "#28287B",
                  }}
                >
                  Import from CSV in Bulk
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
                  Upload Your CSV
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                borderRadius: "12px",
                cursor: "pointer",
                width: "100%",
                height: "100%",
                p: 3,
                backgroundColor: "white",
                boxShadow: "0px 12px 15px 0px #4B71970D",
                flexDirection: "column",
                ml: 3,
              }}
              onClick={() => {
                setActiveStepAnyProv(2);
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
                  mt: 1.5,
                }}
              >
                {/* <Typography sx={{ fontSize: "14px", color: "#aaa" }}>Any provider</Typography> */}
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "26px",
                    color: "#28287B",
                  }}
                >
                  Individual Account Setup
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
                  IMAP/SMTP Setup
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      ) : activeStepAnyProv === 1 ? (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              width: "100%",
              backgroundColor: "white",
              p: 3,
              boxShadow: "0px 12px 15px 0px #4B71970D",
              borderRadius: "12px",
              mt: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                lineHeight: "25px",
                color: "#28287B",
              }}
            >
              Upload Your CSV Document
            </Typography>
            <Typography
              sx={{
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "18px",
                color: "#0071F6 ",
                mt: 1,
              }}
            >
              <a
                href="https://docs.google.com/spreadsheets/d/1E6P1PugqfwXZNatqKvxnOW06PjLrFJXH4EfnaVxMe9I/edit?usp=sharing"
                style={{ color: "#0071F6", textDecoration: "none" }}
                target="blank"
              >
                View Sample CSV
              </a>
            </Typography>
            <BulkUpload isCanceled={isCanceled} />
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <Button
                sx={{ color: "#0071F6", mt: 2 }}
                onClick={() => {
                  setActiveStepAnyProv(0);
                }}
              >
                <ArrowBackOutlined fontSize="small" sx={{ color: "#0071F6", mr: 1 }} />
                Back
              </Button>
            </Box>
          </Box>
        </>
      ) : activeStepAnyProv === 2 ? (
        singleProviderStep === 0 ? (
          <>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                backgroundColor: "white",
                p: 3,
                borderRadius: "12px",
                mt: 3,
                boxShadow: "0px 12px 15px 0px #4B71970D",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 5 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "space-around",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "20px",
                        fontWeight: 700,
                        lineHeight: "25px",
                        color: "#28287B",
                      }}
                    >
                      Connect with Any Email Provider
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "16px",
                        color: "#8181B0",
                        mt: 1,
                      }}
                    >
                      IMAP/SMTP Setup
                    </Typography>
                  </Box>
                </Box>

                <form noValidate onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ width: { xs: "100%", md: "70%" } }}>
                      <Grid container sx={{ rowGap: 2 }}>
                        <Grid
                          item
                          xs={12}
                          sx={{
                            display: "flex",
                            gap: 2,
                            flexDirection: { xs: "column", sm: "row" },
                          }}
                        >
                          <Box sx={{ width: { xs: "100%", sm: "50%" } }}>
                            {" "}
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
                              error={!!(formik.touched.name?.first && formik.errors.name?.first)}
                              helperText={formik.touched.name?.first && formik.errors.name?.first}
                              name="name.first"
                              onBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              value={formik.values.name.first}
                              sx={{
                                mt: 2,

                                backgroundColor: "white",
                                "& div": { pl: 0.3 },
                                "& div fieldset": {
                                  borderRadius: "8px",
                                  border: "1px solid #E4E4E5",
                                },
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
                            />
                          </Box>
                          <Box sx={{ width: { xs: "100%", sm: "50%" } }}>
                            {" "}
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
                              error={!!(formik.touched.name?.last && formik.errors.name?.last)}
                              helperText={formik.touched.name?.last && formik.errors.name?.last}
                              name="name.last"
                              onBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              value={formik.values.name.last}
                              sx={{
                                mt: 2,

                                backgroundColor: "white",
                                "& div": { pl: 0.3 },
                                "& div fieldset": {
                                  borderRadius: "8px",
                                  border: "1px solid #E4E4E5",
                                },
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
                            Email <span style={{ color: "red" }}>*</span>
                          </InputLabel>
                          <TextField
                            placeholder="Email address to connect"
                            fullWidth
                            variant="outlined"
                            error={!!(formik.touched.email && formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            name="email"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.email}
                            disabled={!!account?.email}
                            sx={{
                              mt: 2,

                              backgroundColor: "white",
                              "& div": { pl: 0.3 },
                              "& div fieldset": {
                                borderRadius: "8px",
                                border: "1px solid #E4E4E5",
                              },
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
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        mt: 4,
                      }}
                    >
                      <Button
                        sx={{ color: theme.palette.primary.main }}
                        onClick={() => {
                          setActiveStepAnyProv(0);
                        }}
                      >
                        <ArrowBackOutlined
                          fontSize="small"
                          sx={{ color: theme.palette.primary.main, mr: 1 }}
                        />
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "14px",
                          py: 1.1,
                          px: 3,
                          width: 100,
                        }}
                        disabled={!formik.isValid}
                        type="submit"
                      >
                        Next
                      </Button>
                    </Box>
                  </Box>
                </form>
              </Box>
            </Box>
          </>
        ) : singleProviderStep === 1 ? (
          <>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                backgroundColor: "white",
                p: 3,
                borderRadius: "12px",
                mt: 3,
                boxShadow: "0px 12px 15px 0px #4B71970D",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 4 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "space-around",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "20px",
                        fontWeight: 700,
                        lineHeight: "25px",
                        color: "#28287B",
                      }}
                    >
                      IMAP
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "16px",
                        color: "#8181B0",
                        mt: 1,
                      }}
                    >
                      Configure IMAP settings
                    </Typography>
                  </Box>
                </Box>

                <form
                  noValidate
                  autoComplete="off"
                  onSubmit={formikImap.handleSubmit}
                  style={{ width: "100%" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ width: { xs: "100%", sm: "70%" } }}>
                      <Grid container sx={{ rowGap: 2 }}>
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
                            Username
                          </InputLabel>
                          <TextField
                            placeholder="Username"
                            fullWidth
                            variant="outlined"
                            error={!!(formikImap.touched.username && formikImap.errors.username)}
                            helperText={formikImap.touched.username && formikImap.errors.username}
                            name="username"
                            onBlur={formikImap.handleBlur}
                            onChange={formikImap.handleChange}
                            value={formikImap.values.username}
                            sx={{
                              mt: 2,

                              backgroundColor: "white",
                              "& div": { pl: 0.3 },
                              "& div fieldset": {
                                borderRadius: "8px",
                                border: "1px solid #E4E4E5",
                              },
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
                            Password
                          </InputLabel>
                          <TextField
                            placeholder="Password"
                            fullWidth
                            variant="outlined"
                            error={!!(formikImap.touched.password && formikImap.errors.password)}
                            helperText={formikImap.touched.password && formikImap.errors.password}
                            name="password"
                            onBlur={formikImap.handleBlur}
                            onChange={formikImap.handleChange}
                            value={formikImap.values.password}
                            type="password"
                            sx={{
                              mt: 2,

                              backgroundColor: "white",
                              "& div": { pl: 0.3 },
                              "& div fieldset": {
                                borderRadius: "8px",
                                border: "1px solid #E4E4E5",
                              },
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
                          />
                        </Grid>

                        <Grid item xs={12} sx={{ display: "flex", gap: 2 }}>
                          <Box sx={{ width: "70%" }}>
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
                              IMAP Host
                            </InputLabel>
                            <TextField
                              placeholder="imap.website.com"
                              fullWidth
                              variant="outlined"
                              error={!!(formikImap.touched.host && formikImap.errors.host)}
                              helperText={formikImap.touched.host && formikImap.errors.host}
                              name="host"
                              onBlur={formikImap.handleBlur}
                              onChange={formikImap.handleChange}
                              value={formikImap.values.host}
                              sx={{
                                mt: 2,

                                backgroundColor: "white",
                                "& div": { pl: 0.3 },
                                "& div fieldset": {
                                  borderRadius: "8px",
                                  border: "1px solid #E4E4E5",
                                },
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
                            />
                          </Box>
                          <Box width="30%">
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
                              IMAP Port
                            </InputLabel>
                            <TextField
                              placeholder="***"
                              fullWidth
                              variant="outlined"
                              error={!!(formikImap.touched.port && formikImap.errors.port)}
                              helperText={formikImap.touched.port && formikImap.errors.port}
                              name="port"
                              onBlur={formikImap.handleBlur}
                              onChange={formikImap.handleChange}
                              value={formikImap.values.port}
                              sx={{
                                mt: 2,

                                backgroundColor: "white",
                                "& div": { pl: 0.3 },
                                "& div fieldset": {
                                  borderRadius: "8px",
                                  border: "1px solid #E4E4E5",
                                },
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
                            />
                          </Box>
                        </Grid>
                        {formikImap.errors.submit && (
                          <Typography
                            color="error"
                            sx={{ mt: 3, textAlign: "center", width: "100%" }}
                            variant="body2"
                          >
                            {formikImap.errors.submit}
                          </Typography>
                        )}
                      </Grid>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        mt: 3,
                        width: "100%",
                        pt: 3,
                        borderTop: `1px solid ${theme.palette.grey[300]}`,
                      }}
                    >
                      <Button
                        sx={{ color: "#0071F6" }}
                        onClick={() => {
                          setSingleProviderStep(0);
                        }}
                      >
                        <ArrowBackOutlined fontSize="small" sx={{ color: "#0071F6", mr: 1 }} />
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "14px",
                          py: 1.1,
                          px: 3,
                          width: 100,
                        }}
                        disabled={!formikImap.isValid}
                        type="submit"
                      >
                        {formikImap.isSubmitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <> Next</>
                        )}
                      </Button>
                    </Box>
                  </Box>
                </form>
              </Box>
            </Box>
          </>
        ) : singleProviderStep === 2 ? (
          <>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                backgroundColor: "white",
                p: 3,
                borderRadius: "12px",
                mt: 3,
                boxShadow: "0px 12px 15px 0px #4B71970D",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 5 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "space-around",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "20px",
                        fontWeight: 700,
                        lineHeight: "25px",
                        color: "#28287B",
                      }}
                    >
                      SMTP
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "16px",
                        color: "#8181B0",
                        mt: 1,
                      }}
                    >
                      Configure SMTP settings
                    </Typography>
                  </Box>
                </Box>

                <form
                  noValidate
                  autoComplete="off"
                  onSubmit={formikSmtp.handleSubmit}
                  style={{ width: "100%" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ width: "70%" }}>
                      <Grid container sx={{ rowGap: 2 }}>
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
                            Username
                          </InputLabel>
                          <TextField
                            placeholder="Username"
                            fullWidth
                            variant="outlined"
                            error={!!(formikSmtp.touched.username && formikSmtp.errors.username)}
                            helperText={formikSmtp.touched.username && formikSmtp.errors.username}
                            name="username"
                            onBlur={formikSmtp.handleBlur}
                            onChange={formikSmtp.handleChange}
                            value={formikSmtp.values.username}
                            sx={{
                              mt: 2,

                              backgroundColor: "white",
                              "& div": { pl: 0.3 },
                              "& div fieldset": {
                                borderRadius: "8px",
                                border: "1px solid #E4E4E5",
                              },
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
                            Password
                          </InputLabel>
                          <TextField
                            placeholder="Password"
                            fullWidth
                            variant="outlined"
                            error={!!(formikSmtp.touched.password && formikSmtp.errors.password)}
                            helperText={formikSmtp.touched.password && formikSmtp.errors.password}
                            name="password"
                            onBlur={formikSmtp.handleBlur}
                            onChange={formikSmtp.handleChange}
                            value={formikSmtp.values.password}
                            type="password"
                            sx={{
                              mt: 2,

                              backgroundColor: "white",
                              "& div": { pl: 0.3 },
                              "& div fieldset": {
                                borderRadius: "8px",
                                border: "1px solid #E4E4E5",
                              },
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
                          />
                        </Grid>
                        <Grid item xs={12} sx={{ display: "flex", gap: 2 }}>
                          <Box sx={{ width: "70%" }}>
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
                              SMTP Host
                            </InputLabel>
                            <TextField
                              placeholder="smtp.website.com"
                              fullWidth
                              variant="outlined"
                              error={!!(formikSmtp.touched.host && formikSmtp.errors.host)}
                              helperText={formikSmtp.touched.host && formikSmtp.errors.host}
                              name="host"
                              onBlur={formikSmtp.handleBlur}
                              onChange={formikSmtp.handleChange}
                              value={formikSmtp.values.host}
                              sx={{
                                mt: 2,

                                backgroundColor: "white",
                                "& div": { pl: 0.3 },
                                "& div fieldset": {
                                  borderRadius: "8px",
                                  border: "1px solid #E4E4E5",
                                },
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
                            />
                          </Box>
                          <Box width="30%">
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
                              SMTP Port
                            </InputLabel>
                            <TextField
                              placeholder="***"
                              fullWidth
                              variant="outlined"
                              error={!!(formikSmtp.touched.port && formikSmtp.errors.port)}
                              helperText={formikSmtp.touched.port && formikSmtp.errors.port}
                              name="port"
                              onBlur={formikSmtp.handleBlur}
                              onChange={formikSmtp.handleChange}
                              defaultValue={formikSmtp.initialValues.port}
                              value={formikSmtp.values.port}
                              sx={{
                                mt: 2,

                                backgroundColor: "white",
                                "& div": { pl: 0.3 },
                                "& div fieldset": {
                                  borderRadius: "8px",
                                  border: "1px solid #E4E4E5",
                                },
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
                            />
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={checked}
                                onChange={handleChange}
                                icon={<OffCheckboxCustomIcon />}
                                checkedIcon={<OnCheckboxCustomIcon />}
                              />
                            }
                            label="Set Reply-To"
                          />
                          {checked && (
                            <>
                              <Typography
                                sx={{
                                  fontSize: "13px",
                                  fontWeight: 400,
                                  lineHeight: "16px",
                                  color: "#8181B0",
                                  my: 1,
                                }}
                              >
                                Setting 'reply-to' to an address not connected to Success.ai will
                                result in reply detection to not work for this account.
                              </Typography>
                              <InputLabel
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
                                Reply to
                              </InputLabel>
                              <TextField
                                variant="outlined"
                                name="replyTo"
                                placeholder="Reply To Email"
                                fullWidth
                                error={!!(formikSmtp.touched.replyTo && formikSmtp.errors.replyTo)}
                                helperText={formikSmtp.touched.replyTo && formikSmtp.errors.replyTo}
                                onBlur={formikSmtp.handleBlur}
                                onChange={formikSmtp.handleChange}
                                value={formikSmtp.values.replyTo}
                                sx={{
                                  mt: 2,

                                  backgroundColor: "white",
                                  "& div": { pl: 0.3 },
                                  "& div fieldset": {
                                    borderRadius: "8px",
                                    border: "1px solid #E4E4E5",
                                  },
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
                              />
                            </>
                          )}
                        </Grid>
                        {formikSmtp.errors.submit && (
                          <Typography
                            color="error"
                            sx={{ mt: 3, textAlign: "center", width: "100%" }}
                            variant="body2"
                          >
                            {formikSmtp.errors.submit}
                          </Typography>
                        )}
                      </Grid>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        mt: 3,
                        width: "100%",
                        pt: 3,
                        borderTop: `1px solid ${theme.palette.grey[300]}`,
                      }}
                    >
                      <Button
                        sx={{ color: "#0071F6" }}
                        onClick={() => {
                          setSingleProviderStep(1);
                        }}
                      >
                        <ArrowBackOutlined fontSize="small" sx={{ color: "#0071F6", mr: 1 }} />
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "14px",
                          py: 1.1,
                        }}
                        disabled={!formikSmtp.isValid}
                        type="submit"
                      >
                        {formikSmtp.isSubmitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <>Connect</>
                        )}
                      </Button>
                    </Box>
                  </Box>
                </form>
              </Box>
            </Box>
          </>
        ) : null
      ) : null}
    </>
  );
};

export default ConnectAnyProvider;
