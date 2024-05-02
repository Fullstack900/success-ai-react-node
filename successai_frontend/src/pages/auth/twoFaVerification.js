import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import CardHeader from "@mui/material/CardHeader";
import TextField from "@mui/material/TextField";
import toast from "react-hot-toast";
import { setAuthToken } from "src/services/auth-service.js";
import { useVerifyLoginOtpMutation } from "src/services/auth-service.js";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";

import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976D2", // You can replace this with your desired color
    },
    secondary: {
      main: "#FF4081", // You can replace this with your desired color
    },
  },
});

const TwoFaVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const responseData = location.state?.responseData;
  const [verifyOtp] = useVerifyLoginOtpMutation();
  const [otp, setOtp] = useState("");
  const handleChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(numericValue);
  };
  const handleClick = async () => {
    const response = await verifyOtp({ email: responseData?.email, token: otp });
    if (response.data.message.status) {
      setAuthToken(responseData?.authToken);
      toast.success("Successfully logged in");
      navigate("/accounts");
    } else {
      toast.error(response.data.message.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <Card sx={{ width: 800, height: 500, margin: "1rem" }}>
          <CardHeader
            title="Two Factor Authentication"
            sx={{ backgroundColor: theme.palette.primary.main, color: "#fff" }}
          />
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <LockIcon
              sx={{ fontSize: 100, color: theme.palette.primary.main, marginTop: "32px" }}
            />
            <TextField
              id="standard-basic"
              label="Enter OTP"
              variant="outlined"
              onChange={(e) => handleChange(e)}
              margin="normal"
              value={otp}
              style={{ marginTop: "100px", textAlign: "center", width: "80%" }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleClick}
              style={{ marginTop: "16px" }}
            >
              Verify
            </Button>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
};

export default TwoFaVerification;
