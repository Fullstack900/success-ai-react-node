import { useRef, useState,useEffect } from "react";
import { Box, Button, Typography, useTheme, CircularProgress, Grid } from "@mui/material";
import { ArrowBackIosNew, DraftsTwoTone, West, East } from "@mui/icons-material";
import { Google } from "src/assets/Google";
import { MicrosoftIcon } from "src/assets/MicrosoftIcon";
import { EmailProviderIcon } from "src/assets/EmailProviderIcon";
import { MicrosoftOffice } from "src/assets/MicrosoftOffice";
import ConnectGoogleAccount from "./ConnectGoogleAccount";
import ConnectAnyProvider from "./ConnectAnyProvider";
import { config } from "src/config.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import useWindowOpener from "src/hooks/use-window-opener.js";
import { useConnectMicrosoftAccountMutation,useGetAccountsMutation } from "src/services/account-service.js";
import toast from "react-hot-toast";
import { ArrowLeftIconBlue } from "src/assets/emailAccounts/connect/ArrowLeftIconBlue";
import { CancelIcon } from "src/assets/emailAccounts/connect/CancelIcon";
import { useGetCurrentPlanQuery } from "src/services/billing-service.js";
import { useGetMeQuery } from "src/services/user-service";

const Page = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const isCanceled = useRef(false);
  const [activeStepGAcc, setActiveStepGAcc] = useState(0);
  const [connectMicrosoftAccount] = useConnectMicrosoftAccountMutation();
  const googleAccountRef = useRef(null);
  const handleOnMessage = async (event) => {
    if (event?.data?.provider === "microsoft_oauth") {
      closeWindow();
      const { code } = event.data;
      const toastId = toast.loading("Loading...", { duration: Infinity });
      try { 
        const reconnect = searchParams.get("reconnect");
        const { message } = await connectMicrosoftAccount({ code, reconnect }).unwrap();
        toast.success(message, { id: toastId, duration: 2000 });
      } catch (error) {
        toast.error(error.data.error.message, { id: toastId, duration: 2000 });
      } finally {
        navigate("/accounts");
      }
    }
  };

  const { openWindow, closeWindow } = useWindowOpener({ onMessage: handleOnMessage });

  const handleConnectMicrosoftAccount = async () => {
    const params = new URLSearchParams({
      client_id: config.MICROSOFT_OAUTH_CLIENT_ID,
      scope: config.MICROSOFT_OAUTH_SCOPE,
      redirect_uri: config.MICROSOFT_OAUTH_REDIRECT_URI,
      response_mode: "query",
      response_type: "code",
      prompt: "login",
    });
    // window.location.href = `${config.MICROSOFT_OAUTH_AUTHORIZATION_URL}?${params.toString()}`;
    const url = `${config.MICROSOFT_OAUTH_AUTHORIZATION_URL}?${params.toString()}`;
    openWindow(url);
    setTimeout(() => {
      navigate("/accounts"); 
    }, 6000);
  };

  const handleCancelClick = () => {
    isCanceled.current = true;

    navigate("/accounts");
  };
  const handleSignIn = () => {
    googleAccountRef?.current?.handleConnectGoogleAccount();
  };

  const { data: user, refetch: refetchUser } = useGetMeQuery();
  const [userSumoPlanKey,setUserSumoPlanKey] = useState('');
  const { data: currentPlan } = useGetCurrentPlanQuery();
  const [expiresSubscription, setExpiresSubscription] = useState('');
  const accounts = localStorage.getItem("accountsLength");  
  useEffect(() => {
      const expiresSubscription =
      currentPlan?.subscription?.sendingWarmup?.expiresAt ||
      currentPlan?.subscription?.leads?.expiresAt;
      setUserSumoPlanKey(user?.assignedPlan)
      setExpiresSubscription(expiresSubscription);
      refetchUser();
  }, [currentPlan,accounts]);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          // pb: 12,
        }}
      >
        <Box
          sx={{
            width: "90%",
            height: "100%",
            // py: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              width: "100%",
              flexDirection: "column",
            }}
          >
            {" "}
            <Typography
              sx={{
                // fontFamily: "Noto Serif Vithkuqi, serif",
                color: "#28287B",
                fontSize: "32px",
                fontWeight: 700,
                lineHeight: "40px",
                letterSpacing: "0px",
              }}
            >
              Connect a new Email Account
            </Typography>
            {expiresSubscription === undefined  && userSumoPlanKey === null && accounts >= 2 ?
            <Typography
              sx={{
                color: "red",
                fontSize: "14px",
                fontWeight: 300,
                lineHeight: "20px",
                letterSpacing: "0px",
              }}
            >
              Free trial user can only add 2 accounts 
            </Typography> : <></> }
            {activeStep !== 0 && (
              <>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    color: "#0071F6",
                    cursor: "pointer",
                    mt: 1.5,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onClick={() => {
                    if (activeStepGAcc !== 0) {
                      setActiveStepGAcc(0);
                    }

                    setActiveStep(0);
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <ArrowLeftIconBlue />
                  </Box>
                  Choose a Different Email Provider
                </Typography>
              </>
            )}
          </Box>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {activeStep === 0 ? (
              <>
                <Grid
                  container
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 3,
                    width: "100%",
                    mb: 3,
                    gap: 3,
                  }}
                >                  
                <Grid
                item
                xs={12}
                sm={3.5}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",

                  cursor: "pointer",
                  width: { xs: "100%", sm: "fit-content" },
                  p: 3,
                  border: "1px solid #0071F6",
                  flexDirection: "column",
                  height: { xs: "fit-content", sm: "100%" },
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0px 12px 15px 0px #4B71970D",
                }}                
                onClick={() => setActiveStep(1)}
              >
                <Google />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "26px",
                      color: "#28287B",
                      mt: 1.5,
                    }}
                  >
                    Google
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      color: "#8181B0",
                      mt: 1,
                    }}
                  >
                    G-Suite / Gmail
                  </Typography>
                </Box>
              </Grid>
              {expiresSubscription === undefined && userSumoPlanKey === null && accounts >= 2 ?  
                   <Grid
                    item
                    xs={12}
                    sm={3.5}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      borderRadius: "12px",

                      cursor: "pointer",
                      width: { xs: "100%", sm: "fit-content" },
                      border: "1px solid #FF7000",
                      p: 3,
                      flexDirection: "column",
                      height: { xs: "fit-content", sm: "100%" },
                      backgroundColor: "#fff",
                      boxShadow: "0px 12px 15px 0px #4B71970D",

                      // mx: 3,
                    }}
                  >
                    <MicrosoftIcon />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 700,
                          lineHeight: "26px",
                          color: "#28287B",
                          mt: 1.5,
                        }}
                      >
                        Microsoft
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "20px",
                          color: "#8181B0",
                          mt: 1,
                        }}
                      >
                        Outlook / Office 365
                      </Typography>
                    </Box>
                  </Grid> 
                  : <Grid
                  item
                  xs={12}
                  sm={3.5}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    borderRadius: "12px",

                    cursor: "pointer",
                    width: { xs: "100%", sm: "fit-content" },
                    border: "1px solid #FF7000",
                    p: 3,
                    flexDirection: "column",
                    height: { xs: "fit-content", sm: "100%" },
                    backgroundColor: "#fff",
                    boxShadow: "0px 12px 15px 0px #4B71970D",

                    // mx: 3,
                  }}
                  onClick={handleConnectMicrosoftAccount}
                >
                  <MicrosoftIcon />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "26px",
                        color: "#28287B",
                        mt: 1.5,
                      }}
                    >
                      Microsoft
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: "#8181B0",
                        mt: 1,
                      }}
                    >
                      Outlook / Office 365
                    </Typography>
                  </Box>
                </Grid> }
                
                {expiresSubscription === undefined && userSumoPlanKey === null && accounts >= 2 ? 
                  <Grid
                    item
                    xs={12}
                    sm={3.5}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      borderRadius: "12px",

                      cursor: "pointer",
                      width: { xs: "100%", sm: "fit-content" },
                      border: "1px solid #CECECE",
                      p: 3,
                      flexDirection: "column",
                      height: { xs: "fit-content", sm: "100%" },
                      backgroundColor: "#fff",
                      boxShadow: "0px 12px 15px 0px #4B71970D",
                    }}
                  >
                    <EmailProviderIcon />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 700,
                          lineHeight: "26px",
                          color: "#28287B",
                          mt: 1.5,
                        }}
                      >
                        Any Email Provider
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "20px",
                          color: "#8181B0",
                          mt: 1,
                        }}
                      >
                        IMAP / SMTP
                      </Typography>
                    </Box>
                  </Grid>
                  :
                  <Grid
                  item
                  xs={12}
                  sm={3.5}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    borderRadius: "12px",

                    cursor: "pointer",
                    width: { xs: "100%", sm: "fit-content" },
                    border: "1px solid #CECECE",
                    p: 3,
                    flexDirection: "column",
                    height: { xs: "fit-content", sm: "100%" },
                    backgroundColor: "#fff",
                    boxShadow: "0px 12px 15px 0px #4B71970D",
                  }}
                  onClick={() => {
                    setActiveStep(3);
                  }}
                >
                  <EmailProviderIcon />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "26px",
                        color: "#28287B",
                        mt: 1.5,
                      }}
                    >
                      Any Email Provider
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: "#8181B0",
                        mt: 1,
                      }}
                    >
                      IMAP / SMTP
                    </Typography>
                  </Box>
                </Grid>
                }

                </Grid>
              </>
            ) : activeStep === 1 ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    flexDirection: "column",
                    mt: 3,
                    boxShadow: "0px 12px 15px 0px #4B71970D",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    p: 3,
                  }}
                >
                  {" "}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      mb: 3,
                    }}
                  >
                    <Google />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "space-around",
                        ml: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 700,
                          lineHeight: "18px",
                          color: "#28287B",
                        }}
                      >
                        Connect your Google Account
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "16px",
                          color: "#8181B0",
                          mt: 1,
                        }}
                      >
                        Gmail / G-Suite
                      </Typography>
                    </Box>
                  </Box>
                  <ConnectGoogleAccount
                    activeStepGAcc={activeStepGAcc}
                    setActiveStepGAcc={setActiveStepGAcc}
                    ref={googleAccountRef}
                  />
                </Box>
              </>
            ) : activeStep === 2 ? (
              <></>
            ) : activeStep === 3 ? (
              <ConnectAnyProvider isCanceled={isCanceled} />
            ) : null}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column-reverse", sm: "row" },
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                gap: 2,
                mt: activeStep !== 0 ? 3 : 0,
              }}
            >
              {" "}
              <Button
                variant="outlined"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "white",
                  border: "1px solid #0071F6",
                  py: 1.5,
                  px: 9,
                  width: { xs: "100%", sm: "fit-content" },
                }}
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
              {activeStep === 1 && activeStepGAcc === 0 && (
                <Button
                  disabled = {expiresSubscription === undefined && accounts >= 2 ? true : false}                  
                  variant="contained"
                  sx={{
                    fontSize: "14px",
                    px: 4,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    border: "1px solid #0071F6",
                    py: 1.5,
                    width: { xs: "100%", sm: "fit-content" },

                    "&:hover": {
                      boxShadow: 15,
                    },
                  }}
                  onClick={() => {
                    setActiveStepGAcc(1);
                  }}
                >
                  I confirm that IMAP has been enabled
                </Button>
              )}
              {activeStep === 1 && activeStepGAcc === 3 && (
                <Button
                  sx={{
                    fontSize: "14px",
                    px: 4,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    border: "1px solid #0071F6",
                    py: 1.5,
                    width: { xs: "100%", sm: "fit-content" },
                    "&:hover": {
                      boxShadow: 15,
                    },
                  }}
                  onClick={handleSignIn}
                  variant="contained"
                >
                  Sign In
                </Button>
              )}
              {activeStep === 1 && activeStepGAcc === 4 && (
                <Button
                  sx={{
                    fontSize: "14px",
                    px: 4,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    border: "1px solid #0071F6",
                    py: 1.5,
                    width: { xs: "100%", sm: "fit-content" },
                    "&:hover": {
                      boxShadow: 15,
                    },
                  }}
                  variant="contained"
                  onClick={() => setActiveStepGAcc(5)}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>          
        </Box>
      </Box>
    </>
  );
};

export default Page;
