import { Box, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAuthToken, useVerifyMutation } from "src/services/auth-service.js";
import toast from "react-hot-toast";

const VerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verify] = useVerifyMutation();

  const fetchTokens = useCallback(async () => {
    const token = searchParams.get("token");
    const skipUpdate = searchParams.get("skipUpdate");
    try {
      const { authToken } = await verify({ token, skipUpdate: skipUpdate === 'true' }).unwrap();
      setAuthToken(authToken);

      const pwreset = searchParams.get("pwreset");
      if (pwreset) {
        navigate("/settings/profile?pwreset=true");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error("Link expired");
    }
  }, [searchParams, verify, navigate]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {" "}
          <CircularProgress color="success" />
          <Typography
            sx={{ mt: 3, fontWeight: 600, color: "rgba(0,0,0,0.5)", textAlign: "center" }}
          >
            <span style={{ fontSize: "18px" }}>Please hold a minute</span> <br /> while we are
            verifying{" "}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default VerifyPage;
