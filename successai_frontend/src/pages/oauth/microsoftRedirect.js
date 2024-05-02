import { Box, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect } from "react";
// import { useCreateMicrosoftAccountMutation } from "src/services/account-service.js";
// import toast from "react-hot-toast";

import { useConnectMicrosoftAccountMutation } from "src/services/account-service.js";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

const MicrosoftRedirect = () => {
  const [searchParams] = useSearchParams();
  const [connectMicrosoftAccount] = useConnectMicrosoftAccountMutation();
  const navigate = useNavigate();
  
  const createAccount = useCallback(async () => {
    const code = searchParams.get("code");
    const reconnect = localStorage.getItem("reconnect");
    const message = { provider: "microsoft_oauth", code };
    const toastId = toast.loading("Loading...", { duration: Infinity });

    try {
      const { message: successMessage } = await connectMicrosoftAccount({ code, reconnect }).unwrap();
      toast.success(successMessage, { id: toastId, duration: 2000 });

        if (reconnect) {
            localStorage.removeItem("reconnect");
            navigate(`/accountMessage/reconnected`);
        } else {
            navigate(`/accountMessage/created`);
        }

    } catch (error) {
        console.log("error.data.error.message", error.data.error.message);
        toast.error(error.data.error.message, { id: toastId, duration: 2000 });

        if (error.data.error.message !== "alreadyexists") {
            const messageData = error?.data?.error?.message;
            navigate(`/accountMessage/${messageData}`);
        }
    }
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

export default MicrosoftRedirect;
