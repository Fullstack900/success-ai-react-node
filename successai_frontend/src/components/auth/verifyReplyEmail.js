import { Box, Button, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { VerifyEmailVector } from "src/assets/VerifyEmailVector";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { useVerifyReplyEmailCodeMutation } from "src/services/user-service";

const Page = ({ secondary }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [queryParameters] = useSearchParams();
  const code = queryParameters.get("code");
  const [verifyReplyEmailCode] = useVerifyReplyEmailCodeMutation();
  useEffect(() => {
    (async () => {
      if (code) {
        setIsLoading(true);
        const { data, error } = await verifyReplyEmailCode({ code });
        if (error) {
          setIsError(true);
          setIsLoading(false);
          return;
        }
        setIsVerified(true);
        setIsLoading(false);
      }
    })();
  }, [code]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            height: "70px",
            width: "100%",
            boxShadow: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "75%",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Button
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "18px",
                height: "100%",
              }}
              href="/"
            >
              <ArrowBack sx={{ mr: 1 }} />
              Back
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: { xs: "75%", sm: "50%", lg: "25%" },
            flexDirection: "column",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              my: 3,
            }}
          >
            <VerifyEmailVector />
          </Box>
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#28287B",
              textAlign: "center",
              width: "100%",
            }}
          >
            {isLoading
              ? "Verifying..."
              : isError
              ? "Error While Verifying Email"
              : "Email Verified"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              width: "95%",
            }}
          >
            {" "}
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 400,
                color: "rgba(129, 129, 176, 1)",
                mt: 2,
                textAlign: "center",
              }}
            >
              {isLoading
                ? "Please Wait While Verification Your Email."
                : isError
                ? "An Error While Verifying Your Email. Your Link is expired or invalid."
                : "Your Email has been verified successfully"}
            </Typography>
          </Box>
          {!isLoading && (
            <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
              <Button
                href="/"
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                  p: 3,
                  py: 1.5,
                  borderWidth: "2px",
                  "&:hover": { borderWidth: "2px", background: "transparent" },
                }}
              >
                Go to dashboard
                <ChevronRightIcon />
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Page;
