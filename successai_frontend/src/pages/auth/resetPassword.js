import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { useFormik } from "formik";
import React from "react";
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

import ResetPasswordImage from "../../assets/auth/reset-password.png";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [login] = useLoginMutation();
  const [resendVerifyLink, { isLoading: isResendLinkVerifyLinkLoading }] =
    useResendVerifyLinkMutation();
  const [forgotPassword] = useForgotPasswordMutation();

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
        const { authToken } = await login(values).unwrap();
        setAuthToken(authToken);
        toast.success("Successfully logged in");
        navigate("/");
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
        .required("Email is required."),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const { message } = await forgotPassword(values).unwrap();
        toast.success(message);

        formikForgotPassword.resetForm();
      } catch (err) {
        helpers.setErrors({ submit: err.data.error.message });
      }
    },
  });

  const loginRedirect = () => {
    navigate("/login");
  };

  const theme = useTheme();
  const isMdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));
  return (
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
        <Stack spacing={2} sx={{ width: "100%" }}>
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
              Reset your password
            </Typography>
          </Box>
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
          <Box>
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
              Email
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
                "& .MuiFormHelperText-root": { textAlign: "right", mx: 0 },
              }}
            />{" "}
            {formikForgotPassword.errors.submit && (
              <Typography
                color="error"
                sx={{ mt: 3, width: "100%", textAlign: "right" }}
                variant="body2"
              >
                {formikForgotPassword.errors.submit}
              </Typography>
            )}
          </Box>

          <Grid container sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Grid item xs={5.8}>
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
                  py: 2,
                  borderColor: theme.palette.primary.main,
                  borderWidth: 1,
                }}
                onClick={loginRedirect}
              >
                {/* <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                >
                  <EDSCancelIconBlue />
                </Box> */}
                Cancel
              </Button>
            </Grid>
            <Grid item xs={5.8}>
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
                  py: 2,
                  backgroundColor: theme.palette.primary.main,
                }}
                disabled={!formikForgotPassword.isValid}
                onClick={formikForgotPassword.handleSubmit}
              >
                {" "}
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
                    </Box> */}
                    Submit
                  </>
                )}
              </Button>
            </Grid>
          </Grid>
        </Stack>
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
            <img
              src={ResetPasswordImage}
              alt="login page image"
              style={{ transform: "scale(0.8)" }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ResetPassword;
