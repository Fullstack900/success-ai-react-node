import { Box, Button, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { VerifyEmailVector } from "src/assets/VerifyEmailVector";
import { useEffect } from "react";
import { useResendVerifyLinkMutation } from "src/services/auth-service";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CircularProgress
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


const Page = ({ secondary }) => {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    window.fbq('track', 'StartTrial', { value: '0.00', currency: 'USD', predicted_ltv: '0.00' });

  }, [])

  const [resendVerifyLink, { isLoading: isResendLinkVerifyLinkLoading }] = useResendVerifyLinkMutation();

  const user = useSelector((state) => state.user);

  const sendVerificationLink = async () => {
    let email;
    if(!secondary){
      const token = searchParams.get('token');
       email = window.atob(token);   
    } else {
      email = user.email
    }
    const { data } = await resendVerifyLink({ email });
    toast.success(data.message);
  }
 const navigate = useNavigate();
  const updateEmail = () =>  {
    const token = searchParams.get('token');  
    navigate(`/register/${token}`);
  }
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
        {!secondary && (
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
                onClick={() => updateEmail()}
                >
                <ArrowBack sx={{ mr: 1 }} />
                Back
              </Button>
            </Box>
          </Box>
        )}
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
            Verify your email
          </Typography>{" "}
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
              An email has been dispatched to you, including a link for verifying your registration.
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 400,
                color: "rgba(129, 129, 176, 1)",
                mt: 3,
                textAlign: "center",
              }}
            >
              If the email does not appear in your inbox, we recommend checking your{" "}
              <span style={{ fontWeight: 700, color: "rgba(40, 40, 123, 1)", fontSize: "13px" }}>
                spam folder or
              </span>
              <span
                onClick={sendVerificationLink}
                style={{
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: 'pointer',
                  color: '#216fed',
                  paddingLeft: '4px',
                  whiteSpace: 'nowrap',
                }}>
                Resend verification link
                  <span
                    style={{
                      marginLeft: '4px',
                      visibility: isResendLinkVerifyLinkLoading ? 'visible' : 'hidden'
                    }}
                  >
                    <CircularProgress size={10} thickness={5} />
                  </span>
              </span>
            </Typography>
          </Box>
          {!secondary && (
            <Box
              sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", mt: 4 }}
            >
              <Button
              onClick={() => updateEmail()}
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                  p: 3,
                  py: 1.5,
                  borderWidth: "2px",
                  textDecoration: "underline",
                  "&:hover": { borderWidth: "2px", background: "transparent",  textDecoration: "underline"},
                }}
              // variant="outlined"
              >
               Change email address
               
              </Button>
            </Box>
          )}
          {!secondary && (
            <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}> 
              <Button
                href="/"
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                  p: 3,
                  py: 1.5,
                  borderWidth: "2px",
                  "&:hover": { borderWidth: "2px" },
                }}
                variant="outlined"
              >
                Go Back to DashBoard
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Page;
