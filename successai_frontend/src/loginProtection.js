import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
  Stack,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import { useGetMeQuery, useUpdatePasswordMutation } from "src/services/user-service.js";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useResetPasswordMutation } from "src/services/auth-service.js";
import { useNavigate } from "react-router";
import LoginImage from "./assets/auth/login-new.png";
import { Logo } from "src/components/logo";

function LoginProtection() {
  // Reset Password
  const theme = useTheme();

  const { data: user, refetch: refetchUser } = useGetMeQuery();
  const [resetPassword] = useResetPasswordMutation();
  // Password Update
  const isMdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const navigate = useNavigate();

  const [updatePassword] = useUpdatePasswordMutation();

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
        toast.success(message);
        helpers.resetForm();
        localStorage.clear();
        localStorage.setItem("reloadDom", true);
        navigate("/login");
      } catch (err) {
        toast.error(err.data.error.message);
      }
    },
  });

  useEffect(() => {
    if (user?.firstLogin === false) {
      navigate("/accounts");
    }
  }, [user]);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",

        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: isMdUp ? "500px" : "100%",
          height: "50%",
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
            mt: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "12px",
          }}
        >
          <>
            <Box sx={{
              marginBottom: "25px",
              textAlign: "center",
            }}>Kindly reset your password in compliance with the updated policies.</Box>

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
                  Update Password
                </Typography>
              </center>
            </Box>


            <Box 
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: isMdUp ? "column" : "column",
                justifyContent: "space-between",
                gap: "5px",
              }}
            >
              <Stack sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="current password"
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
              <Stack sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="new password"
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
              <Stack sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="confirm new password"
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
              <Button
                onClick={formikUpdatePassword.handleSubmit}
                variant="contained"
                fullWidth
                sx={{ p: 1, mt: 3, }}
              >
                Update
              </Button>
            </Box>
            {/* </Box> */}
          </>
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
  );
}

export default LoginProtection;
