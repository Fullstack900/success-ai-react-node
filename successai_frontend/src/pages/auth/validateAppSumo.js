import { East, Scale } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  InputLabel,
  Link,
  TextField,
  Typography,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { useFormik } from "formik";
import React from "react";
import { useNavigate } from "react-router";
import { ArrowRightLong } from "src/assets/general/ArrowRightLong";
import { Logo } from "src/components/logo";
import { setAuthToken, useRegisterMutation, useValidateAppSumoMutation } from "src/services/auth-service.js";
import * as Yup from "yup";
import SignupImage from "../../assets/auth/signup.png";
import { useSearchParams } from "react-router-dom";

const AppsumoValidationPage = () => {
  const navigate = useNavigate();
  const [validateAppSumo] = useValidateAppSumoMutation();
  const [queryParameters] = useSearchParams();
  const sumo = queryParameters.get("sumo");

  const formik = useFormik({
    initialValues: {
      name: {
        first: "",
        last: "",
      },
      password: "",
      licence: sumo ,
    },
    validationSchema: Yup.object({
      name: Yup.object({
        first: Yup.string(),
          // .required("First Name is required")
          // .matches(/^[aA-zZ]+$/, "Only alphabets are allowed"),
        last: Yup.string()
          // .required("Last Name is required")
          // .matches(/^[aA-zZ]+$/, "Only alphabets are allowed"),
      }),

      password: Yup.string().max(255).required("Password is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const { authToken } = await validateAppSumo(values).unwrap();
        setAuthToken(authToken);
        const enecodedEmail = window.btoa(values.email);
        navigate(`/register/verify-email?token=${enecodedEmail}`);
      } catch (err) {
        helpers.setErrors({ submit: err.data.error.message });
      }
    },
  });
  const theme = useTheme();
  const isMdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

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
            // width: "25%",
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
            {" "}
            <Logo />
          </Box>
          <Box
            sx={{
              // backgroundColor: "#fff",
              width: "100%",
              borderRadius: "12px",
              //boxShadow: "0px 12px 15px 0px rgba(75, 113, 151, 0.05)",
              //p: 4,
              mt: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
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
                  Activate App Sumo Email
                </Typography>
              </center>
            </Box>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Grid container columnSpacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  {" "}
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
                    First name *
                  </Typography>
                  <TextField
                    variant="outlined"
                    error={!!(formik.touched.name?.first && formik.errors.name?.first)}
                    fullWidth
                    helperText={formik.touched.name?.first && formik.errors.name?.first}
                    name="name.first"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.name.first}
                    placeholder="Enter first name"
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
                </Grid>
                <Grid item xs={6}>
                  {" "}
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
                    Last name *
                  </Typography>
                  <TextField
                    variant="outlined"
                    error={!!(formik.touched.name?.last && formik.errors.name?.last)}
                    fullWidth
                    helperText={formik.touched.name?.last && formik.errors.name?.last}
                    name="name.last"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.name.last}
                    placeholder="Enter last name"
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
                </Grid>
                <Grid item xs={12}>
                  {" "}
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
                    Password *
                  </Typography>
                  <TextField
                    variant="outlined"
                    error={!!(formik.touched.password && formik.errors.password)}
                    fullWidth
                    helperText={formik.touched.password && formik.errors.password}
                    name="password"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="password"
                    value={formik.values.password}
                    placeholder="Enter password"
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
                </Grid>
              </Grid>

              {formik.errors.submit && (
                <Typography color="error" sx={{ mt: 3, textAlign: "right" }} variant="body2">
                  {formik.errors.submit}
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
                      Register
                    </>
                  )}
                </Button>
              </Box>
            </form>
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
              Already have an account?
              <Link
                onClick={() => navigate("/login")}
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
                  cursor: "pointer",
                }}
              >
                Log In
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
                top: -400,
                left: 250,
                width: 600,
                height: 800,

                // backgroundColor: alpha(theme.palette.background.default, 0.2),
                background: `linear-gradient(to bottom,${alpha(
                  theme.palette.background.paper,
                  0.1
                )},transparent)`,
                rotate: "45deg",
              }}
            ></Box>
            <Box
              sx={{
                position: "absolute",
                bottom: -500,
                right: 250,
                width: 600,
                height: 800,

                // backgroundColor: alpha(theme.palette.background.default, 0.2),
                background: `linear-gradient(to top,${alpha(
                  theme.palette.background.paper,
                  0.1
                )},transparent)`,
                rotate: "135deg",
              }}
            ></Box>
            <Box sx={{ zIndex: 99 }}>
              {" "}
              <img src={SignupImage} alt="signup page image" style={{ transform: "scale(0.8)" }} />
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default AppsumoValidationPage;
