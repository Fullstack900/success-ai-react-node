import { Box, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
// import { useCreateGoogleAccountMutation } from "src/services/account-service.js";
// import toast from "react-hot-toast";

const GoogleRedirect = () => {
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  // const [createGoogleAccount] = useCreateGoogleAccountMutation();

  const createAccount = useCallback(async () => {
    const code = searchParams.get("code");
    // try {
    //   await createGoogleAccount({ code }).unwrap();
    //   toast.success("Account Added");
    // } catch (error) {
    //   toast.error(error.data.error.message);
    // } finally {
    //   navigate("/accounts");
    // }
    const message = { provider: "google_oauth", code };
    window.opener.postMessage(message);
    window.close();
  }, [searchParams]);

  useEffect(() => {
    createAccount();
  }, [createAccount]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
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
          <CircularProgress color="success" />
          <Typography
            sx={{
              mt: 3,
              fontWeight: 600,
              fontSize: "18px",
              color: "rgba(0,0,0,0.5)",
              textAlign: "center",
            }}
          >
            Adding your account...
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default GoogleRedirect;
