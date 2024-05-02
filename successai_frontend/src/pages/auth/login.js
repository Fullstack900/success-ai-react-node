import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "src/components/logo";
import {
  setAuthToken,
  useForgotPasswordMutation,
  useLoginMutation,
  useResendVerifyLinkMutation,
} from "src/services/auth-service.js";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { ArrowRightLong } from "src/assets/general/ArrowRightLong";
import { EACloseIcon } from "src/assets/emailAccounts/EACloseIcon";
import { EDSCancelIconBlue } from "src/assets/emailAccounts/emailDrawer/EDSettingsTab/EDSCancelIcon";
import LoginImage from "../../assets/auth/login-new.png";

const LoginPage = () => {
  const navigate = useNavigate();

  const [login] = useLoginMutation();
  const [resendVerifyLink, { isLoading: isResendLinkVerifyLinkLoading }] =
    useResendVerifyLinkMutation();
  const [forgotPassword] = useForgotPasswordMutation();
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Must be a valid email").max(255).required("Email is required"),
      password: Yup.string().max(255).required("Password is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const response = await login(values).unwrap();
        if (response?.authToken?.twofaEnabled){
          navigate("/two-factor-authentication", { state: { responseData: response.authToken } });
        } else {
        setAuthToken(response?.authToken?.authToken);
        toast.success("Successfully logged in");
        navigate("/accounts");}
      } catch (err) {
        helpers.setErrors({ submit: err.data.error.message });
      }
    },
  });

  const formikForgotPassword = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Please enter a valid email address")
        .max(255)
        .required("This field is mandatory."),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const { message } = await forgotPassword(values).unwrap();
        toast.success(message);
        setOpenForgotPasswordDialog(false);
        formikForgotPassword.resetForm();
      } catch (err) {
        helpers.setErrors({ submit: err.data.error.message });
      }
    },
  });

  const handleResendVerifyLinkClick = async () => {
    await resendVerifyLink({ email: formik.values.email }).unwrap();
    navigate("/register/verify-email");
  };

  const handleClickOpenResetPasswordDialog = () => {
    setOpenForgotPasswordDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenForgotPasswordDialog(false);
  };
  const theme = useTheme();
  const isMdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

  const reloadDomOnce = localStorage.getItem('reloadDom');

  useEffect(() => {
    
    if (reloadDomOnce === "true") {
      // Reload the page
      window.location.href = window.location.href;
      
      // Remove the item from localStorage
      localStorage.removeItem('reloadDom');
    }
  }, []);

  return (
    <>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",

          justifyContent: "flex-start",
          alignItems: "center",
          backgroundColor: "#F2F4F6",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: isMdUp ? "500px" : "100%",
            height: "100%",
            p: 4,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "160px",
              height: "30px",
            }}
          >
            <Logo />
          </Box>

          <Box
            sx={{
              //backgroundColor: "#fff",
              width: "100%",
              //boxShadow: "0px 12px 15px 0px rgba(75, 113, 151, 0.05)",
              //p: 4,
              mt: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "12px",
            }}
          >
            {isResendLinkVerifyLinkLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  height: 300,
                }}
              >
                <CircularProgress />
                <Typography sx={{ mt: 3, fontSize: "20px", fontWeight: 500, color: "#216fed" }}>
                  Please wait...
                </Typography>
              </Box>
            ) : (
              <>
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
                      width: "10px",
                      height: "10px",
                      flexShrink: 0,
                      backgroundColor: "#00FF1A",
                      boxShadow: "0px 0px 11px -3px rgba(0, 0, 0, 0.75) inset",
                      filter: "blur(2px)",
                      borderWidth: "1px",
                      borderColor: "#ff0",
                      mr: 2,
                      borderRadius: "20px",
                    }}
                  ></Box> */}
                  <center>
                    <Typography
                      sx={{
                        // fontFamily: "Noto Serif Vithkuqi, serif",
                        width: "100%",
                        fontSize: "24px",
                        fontWeight: 700,
                        lineHeight: "30px",
                        color: "#28287B",
                      }}
                    >
                      Log In
                    </Typography>
                  </center>
                </Box>
                <form noValidate onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
                  <Stack
                    // spacing={3}
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
                      Email
                    </Typography>
                    <TextField
                      error={!!(formik.touched.email && formik.errors.email)}
                      fullWidth
                      helperText={formik.touched.email && formik.errors.email}
                      name="email"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="email"
                      value={formik.values.email}
                      placeholder="Enter email"
                      variant="outlined"
                      sx={{
                        mt: 2,
                        width: "100%",
                        // height: 40,
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
                      Password
                    </Typography>
                    <TextField
                      error={!!(formik.touched.password && formik.errors.password)}
                      fullWidth
                      helperText={formik.touched.password && formik.errors.password}
                      name="password"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="password"
                      value={formik.values.password}
                      placeholder="Enter password"
                      variant="outlined"
                      sx={{
                        mt: 2,
                        width: "100%",
                        // height: 40,
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
                        "& .MuiFormHelperText-root": { textAlign: "right", mx: 0 },
                      }}
                    />
                  </Stack>
                  {formik.errors.submit && (
                    <Typography color="error" sx={{ mt: 3, textAlign: "right" }} variant="body2">
                      {formik.errors.submit}
                    </Typography>
                  )}
                  {formik.errors.submit === "Email not verified" && (
                    <Typography
                      sx={{ textAlign: "center", fontWeight: 600, fontSize: 16, cursor: "pointer" }}
                      onClick={handleResendVerifyLinkClick}
                    >
                      Need another verification link?
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "flex-end",
                    }}
                  >
                    <Button
                      fullWidth
                      sx={{
                        mt: 3,
                        py: 1.5,
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "18px",
                        borderRadius: "8px",
                      }}
                      type="submit"
                      variant="contained"
                      disabled={!formik.isValid}
                    >
                      {formik.isSubmitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <>
                          {/* <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              mr: 1,
                            }}
                          >
                            <ArrowRightLong />
                          </Box>{" "} */}
                          Continue
                        </>
                      )}
                    </Button>
                    <Typography
                      sx={{
                        color: "#0071F6",
                        cursor: "pointer",
                        mt: 1,
                        "&:hover": {
                          color: "#164694",
                        },
                        mr: 0.5,
                        fontSize: "13px",
                        fontWeight: 700,
                        lineHeight: "16px",
                      }}
                      onClick={handleClickOpenResetPasswordDialog}
                    >
                      <Link href="/reset-password" sx={{ textDecoration: "none" }}>
                        {" "}
                        Forgot password?
                      </Link>
                    </Typography>
                  </Box>
                </form>
              </>
            )}
          </Box>
          <Box>
            <Typography
              sx={{
                mt: 3,
                // fontFamily: "Noto Serif Vithkuqi, serif",
                color: "#28287B",
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: "20px",
              }}
            >
              Don't have an account?
              <Link
                href="/register"
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    color: "#164694",
                  },
                  ml: 0.3,
                  color: "#0071F6",
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: "20px",
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
        {isMdUp && (
          <Box
            sx={{
              display: "flex",
              position: "relative",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "calc(100vw - 500px)",
              height: "100%",
              overflow: "hidden",
              backgroundColor: theme.palette.primary.main,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -300,
                left: -150,
                width: 600,
                height: 800,

                // backgroundColor: alpha(theme.palette.background.default, 0.2),
                background: `linear-gradient(to bottom,${alpha(
                  theme.palette.background.paper,
                  0.2
                )},${alpha(theme.palette.background.paper, 0.1)},transparent)`,
                rotate: "-45deg",
              }}
            ></Box>
            <Box
              sx={{
                position: "absolute",
                bottom: -300,
                right: -150,
                width: 600,
                height: 800,

                // backgroundColor: alpha(theme.palette.background.default, 0.2),
                background: `linear-gradient(to top,${alpha(
                  theme.palette.background.paper,
                  0.2
                )},${alpha(theme.palette.background.paper, 0.1)},transparent)`,
                rotate: "-45deg",
              }}
            ></Box>
            <Box sx={{ zIndex: 99 }}>
              {" "}
              <img src={LoginImage} alt="login page image" style={{ transform: "scale(0.85)" }} />
            </Box>
          </Box>
        )}
      </Box>

      {/* <Dialog
        open={openForgotPasswordDialog}
        onClose={handleCloseDialog}
        sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                lineHeight: "28px",
                color: "#28287B",
              }}
            >
              {" "}
              Password Recovery
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <EACloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 400,
                lineHeight: "20px",
                color: "#8181B0",
              }}
            >
              {" "}
              Please enter the email address associated with your account, and we'll dispatch a link
              to reset your password.
            </Typography>
          </DialogContentText>
          <Typography
            sx={{
              width: "100%",
              textAlign: "left",
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "20px",
              color: "#28287B",
            }}
          >
            Your Email Address
          </Typography>
          <TextField
            autoFocus
            id="email"
            placeholder="Enter Email"
            type="email"
            fullWidth
            variant="outlined"
            error={!!(formikForgotPassword.touched.email && formikForgotPassword.errors.email)}
            helperText={formikForgotPassword.touched.email && formikForgotPassword.errors.email}
            name="email"
            onBlur={formikForgotPassword.handleBlur}
            onChange={formikForgotPassword.handleChange}
            value={formikForgotPassword.values.email}
            sx={{
              mt: 2,
              width: "100%",
              // height: 40,
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
          />{" "}
          {formikForgotPassword.errors.submit && (
            <Typography color="error" sx={{ mt: 3, textAlign: "center" }} variant="body2">
              {formikForgotPassword.errors.submit}
            </Typography>
          )}
          <Grid container columnSpacing={2} sx={{ mt: 3 }}>
            <Grid item xs={6}>
              {" "}
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
                onClick={handleCloseDialog}
              >
                <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                >
                  <EDSCancelIconBlue />
                </Box>
                Cancel
              </Button>
            </Grid>
            <Grid item xs={6}>
              {" "}
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
                disabled={!formikForgotPassword.isValid}
                onClick={formikForgotPassword.handleSubmit}
              >
                {" "}
                {formik.isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
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
                    Submit
                  </>
                )}
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        {/* <DialogActions sx={{ mb: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={formikForgotPassword.handleSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions> 
      </Dialog> */}
    </>
  );
};

export default LoginPage;
