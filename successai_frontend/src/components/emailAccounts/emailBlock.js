import { useEffect, useState } from "react";
import {
  useTestSmtpImapMutation, useUpdateAccountMutation, useGetAccountsMutation, setAccounts
} from "src/services/account-service.js";
import {
  Delete,
  DriveFileRenameOutline,
  FolderSpecial,
  LocalHospital,
  MoreHoriz,
  MoveToInbox,
  PlayArrow,
  RocketLaunch,
  Send,
  Settings,
  Whatshot,
  BugReport,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Popover,
  Tooltip,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import RemoveAccountDialog from "../RemoveAccountDialog";
import { AddEmailHero } from "src/assets/AddEmailHero";
import {
  usePauseWarmupMutation,
  useEnableWarmupMutation,
  useResumeAccountMutation,
  accountUpdated,
  useGetAccountMutation,
} from "src/services/account-service.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon";
import { EAPlayIcon } from "src/assets/emailAccounts/EAPlayIcon";
import { EAWarmupIcon } from "src/assets/emailAccounts/EAWarmupIcon";
import { EAMoreIcon } from "src/assets/emailAccounts/EAMoreIcon";
import { EATotalEmailsSent } from "src/assets/emailAccounts/EATotalEmailsSent";
import { EATotalWarmupSent } from "src/assets/emailAccounts/EATotalWarmupSent";
import { EAWarmupHealthPercent } from "src/assets/emailAccounts/EAWarmupHealthPercent";
import { EATotalEmailsFreeSpamIcon } from "src/assets/emailAccounts/EATotalEmailsFreeSpam";
import { EATotalEmailsReceived } from "src/assets/emailAccounts/EATotalEmailsReceived";
import CustomCheckbox from "../CustomCheckbox";
import { useUpdateIntercomMutation } from "src/services/intercom-service";

const EmailBlock = ({
  addNew,
  account,
  dnsRecord,
  onClick,
  onDelete,
  onClickSettings,
  bulkSettingsOn,
  isAccountChecked,
  onAccountCheckChange,
  user,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const id = open ? "simple-popover" : undefined;

  const [getAccount, { isLoading: isAccountLoading }] = useGetAccountMutation();

  const [testSmtpImap, { isLoading: isSmtpImapTesting}] = useTestSmtpImapMutation();

  const [mouseEntered, setMouseEntered] = useState(false);

  const [openRemoveAccountDialog, setOpenRemoveAccountDialog] = useState(false);

  const handleRemoveAccountClick = () => {
    setAnchorEl(null);
    onDelete(account._id);
  };

  const handleReconnectAccountClick = () => {
    navigate("/accounts/connect?reconnect=" + account.email);
    if(account?.provider == 'microsoft_oauth'){localStorage.setItem("reconnect",account.email)};
  };


  const [enableFunctionality, setEnableFunctionality] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const handleTestAccountClick = async () => {
    try {
      const timeoutPromise = delay(30000);
      const testPromise = testSmtpImap({ id: account?._id }).unwrap();
      const response = await Promise.race([testPromise, timeoutPromise]);
      if (!response) {
        // Timeout occurred
        toast.error("Timeout Please try again ");
        setEnableFunctionality(false);
        return;
      }
  
      const messages = Array.isArray(response) ? response : [response];
      messages.map((message) => {
        if (message.status_code === 200) {
          toast.success(message.message);
        } else if (message.status_code === 422) {
          toast.error(message.message);
          setTestMessage(message.message);
        } else {
          toast.error(message.message || 'An error occurred');
        }
        return null;
      });
  
      const allMessagesSuccessful = messages.every((message) => message.status_code === 200);
      const allUnsuccessfulMessages = messages.every((message) => message.status_code === 422);
  
      setEnableFunctionality(allMessagesSuccessful);
  
      if (allMessagesSuccessful) {
        setTestMessage("SMTP/IMAP Connection Successful");
      } else if (allUnsuccessfulMessages) {
        setTestMessage("SMTP & IMAP Connection Failed");
      }
    } catch (error) {
      console.error("An error occurred during the test", error);
      toast.error("An error occurred during the test Please try again");
    }
  };
  
  async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  const [warmupStatus, setWarmupStatus] = useState(account.warmup.status);

  useEffect(() => {
    setWarmupStatus(account.warmup.status);
  }, [account]);

  // const checkDisconnectedEmails = async () => {
  //   const response = await testSmtpImap({ email: account?.email }).unwrap();
  //   const messages = Array.isArray(response) ? response : [response];
  //   const allMessagesSuccessful = messages.every((message) => message.status_code === 200);
  //   setEnableFunctionality(allMessagesSuccessful);
  //   allMessagesSuccessful ? setTestMessage("") : setTestMessage("Reconnect your account");
  // };
  // useEffect(() => {
  //   checkDisconnectedEmails();
  // },[]);

  const [enableWarmup] = useEnableWarmupMutation();
  const [updateIntercom] = useUpdateIntercomMutation();
  const [pauseWarmup] = usePauseWarmupMutation();
  const [resumeAccount] = useResumeAccountMutation();


  const handleUpdateWarmupStatus = async () => {
    if (account.status === "paused") {
      toast.error("Please resume your account first.");
      return;
    }
    if (warmupStatus === "paused" && account.status === "connected") {
      const toastId = toast.loading("Loading...", { duration: Infinity });
      const { message, account: updatedAccount } = await enableWarmup(account._id).unwrap();
      dispatch(accountUpdated(updatedAccount));
      setWarmupStatus("enabled");
      toast.success(message, { id: toastId, duration: 2000 });
      window.Intercom("trackEvent", "Email account warmup initiated");
    } else if (warmupStatus === "enabled") {
      const toastId = toast.loading("Loading...", { duration: Infinity });
      const { message, account: updatedAccount } = await pauseWarmup(account._id).unwrap();
      dispatch(accountUpdated(updatedAccount));
      setWarmupStatus("paused");
      toast.success(message, { id: toastId, duration: 2000 });
    } else {
      //show dialog
    }
    await updateIntercom({ user: user._id, attribute: "warmedup_email_accounts" });
  };

  const handleResumeAccount = async () => {
    const { message, account: updatedAccount } = await resumeAccount(account._id).unwrap();
    dispatch(accountUpdated(updatedAccount));
    toast.success(message);
  };

  const handleChangeChecked = (event) => {
    onAccountCheckChange(event.target.checked, account._id);
  };

  const [updateClick, setUpdateClick] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(null);
  const [limit, setLimit] = useState(10);
  const [updateAccount, { isLoading: isAccountUpdating, data }] = useUpdateAccountMutation();
  const [getAccounts, { isLoading: isAccountsLoading }] = useGetAccountsMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsTooltipOpen(true);
  };

  const handleMouseLeave = () => {
    setIsTooltipOpen(false);
  };

  const handleChipClick = (e) => {
    e.stopPropagation();
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const convertToUTC = (timestamp) => {
    const utcString = new Date(timestamp).toUTCString();
    return utcString;
  };

  const handleUpdateAccount = (accountId, value) => async (event) => {
    event.stopPropagation();
    const { account } = await updateAccount({ id: accountId, data: { accountStatus: value } });
    handleDialogClose();
    setUpdateClick(true);
  }

  useEffect(() => {
    if (updateClick) {
      const timer = setTimeout(async () => {
        const { docs, total } = await getAccounts({ search, filter: filter?.value, limit }).unwrap();
        dispatch(setAccounts(docs));
        setTotal(total);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [updateClick,]);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          p: 3,
          pt: 1.5,
          borderRadius: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0px 12px 15px 0px #4B71970D",
          backgroundColor: !addNew ? "#fff" : "#F2F4F6",
          "&:hover": {
            boxShadow: "0px 2px 14px -1px rgba(0, 0, 0, 0.2)",
          },
          transition: "all 0.2s ease-in-out",
          flexDirection: "column",
        }}
        onClick={(e) => {
          !bulkSettingsOn && !mouseEntered && onClick(e);
          !addNew && bulkSettingsOn && onAccountCheckChange(!isAccountChecked, account._id);
        }}
      >
        {!addNew ? (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                flexDirection: { xs: "column-reverse", md: "row" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: {xs: "100%", md: "calc(100% - 190px)" },
                }}
              >
                <Checkbox
                  checked={isAccountChecked}
                  onChange={handleChangeChecked}
                  inputProps={{ "aria-label": "controlled" }}
                  size="small"
                  icon={<OffCheckboxCustomIcon />}
                  checkedIcon={<OnCheckboxCustomIcon />}
                  sx={{ display: !bulkSettingsOn && "none" }}
                />
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: bulkSettingsOn ? "calc(100% - 50px)" : "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "2px",
                      width: "100%"
                    }}
                  >
                    <Typography
                      sx={{
                        ml: !bulkSettingsOn && 1,
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "18px",
                        color: "#28287B",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                      }}
                    >
                      {`${account.name.first} ${account.name.last}`}
                    </Typography>
                    <Typography
                      sx={{
                        ml: !bulkSettingsOn && 1,
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "18px",
                        color: "#8181B0",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                      }}
                    >
                      {account.email}{" "}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "space-between", md: "center" },
                    alignItems: "center",
                    width: { xs: "100%", md: "fit-content" },
                    borderRadius: 0.75,
                    p: 1.3,
                    pr: 0,
                  }}
                  onMouseEnter={() => {
                    setMouseEntered(true);
                  }}
                  onMouseLeave={() => {
                    setMouseEntered(false);
                  }}
                >
                  {account.status === "paused" && (
                    <>
                      <Box
                        sx={{
                          display: { xs: "none", sm: "flex" },
                          justifyContent: "center",
                          alignItems: "center",
                          "&:hover": {
                            backgroundColor: "#f2f2f2",
                          },
                          borderRadius: 0.75,
                          p: 0.5,
                        }}
                        onClick={handleResumeAccount}
                      >
                        {account.freeUserOtherAccounts === true ? <></> :
                        <Tooltip
                          title="Click to resume your account"
                          placement="top"
                          sx={{ textAlign: "center" }}
                          arrow
                        >
                          <Box
                            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                          >
                            <EAPlayIcon />
                          </Box>
                        </Tooltip>
                        }
                      </Box>
                    </>
                  )}{" "}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {/* <EAWarmupIcon
                          color={
                            warmupStatus === "paused"
                              ? "#565656"
                              : warmupStatus === "disabled"
                              ? "#ff8484"
                              : warmupStatus === "enabled"
                              ? "#0071F6"
                              : "#ff8484"
                          }
                        /> */}
                    {account.status === "paused" && (
                      <>
                        <Box
                          sx={{
                            display: { xs: "flex", sm: "none" },
                            justifyContent: "center",
                            alignItems: "center",
                            "&:hover": {
                              backgroundColor: "#f2f2f2",
                            },
                            borderRadius: 0.75,
                            p: 0.5,
                            pl: 0,
                            ml: "-5px",
                          }}
                          onClick={handleResumeAccount}
                        >
                          {account.freeUserOtherAccounts === true ? <></> :
                          <Tooltip
                            title="Click to resume your account"
                            placement="top"
                            sx={{ textAlign: "center" }}
                            arrow
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <EAPlayIcon />
                            </Box>
                          </Tooltip>
                          }
                        </Box>
                      </>
                    )}{" "}
                    <Typography
                      sx={{
                        color: "#8181B0",
                        fontSize: "13px",
                        fontWeight: 400,
                        // display: { xs: "none", sm: "inline-block" },
                      }}
                    >
                      Warmup
                    </Typography>
                    {/* <Tooltip
                        title={
                          warmupStatus === "enabled"
                            ? "Pause Warmup"
                            : warmupStatus === "disabled"
                            ? "Warmup disabled for account."
                            : warmupStatus === "paused"
                            ? "Enable Warmup"
                            : null
                        }
                        placement="top"
                        sx={{ textAlign: "center" }}
                        arrow
                      > </Tooltip> */}
                      <Box
                        sx={{
                          mr: "-16px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Tooltip
                          title = {account.warmup.warmupDisable ? "Your Warmup is currently inactive." : "Resume your account"}
                          placement="top"
                          sx={{ textAlign: "center" }}
                          arrow
                          open={isTooltipOpen && (account.status === "paused" || account.warmup.warmupDisable) }
                        >
                          <span>
                            <CustomCheckbox
                              name="warmup.basicSetting.alertBlock"
                              checked={warmupStatus === "enabled"}
                              onChange={handleUpdateWarmupStatus}
                              disabled={account.warmup.warmupDisable === true || warmupStatus === "disabled"}
                            />
                          </span>
                        </Tooltip>
                      </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      "&:hover": {
                        backgroundColor: "#f2f2f2",
                      },
                      borderRadius: 0.75,
                      p: 0.5,
                    }}
                    onClick={handleClick}
                  >
                    <Tooltip title="" placement="top" sx={{ textAlign: "center" }} arrow>
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <EAMoreIcon />
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Grid container spacing={1} sx={{}}>
              {/* {account.status === "paused" && (
                <Grid item>
                  <Chip
                    label="Paused"
                    sx={{
                      fontSize: "13px",
                      fontWeight: 700,
                      lineHeight: "16px",
                      color: "#28287B",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #E4E4E5",
                      px: 0.5,
                      py: 2,
                    }}
                    size="small"
                  />
                </Grid>
              )}
              {account.status === "disconnected" && (
                <Grid item>
                  <Chip
                    label="Disconnected"
                    // color="error"
                    sx={{
                      fontSize: "13px",
                      fontWeight: 700,
                      lineHeight: "16px",
                      color: "#FD1E36",
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #FD1E36",
                      px: 0.5,
                      py: 2,
                    }}
                    size="small"
                  />
                </Grid>
              )}
              {dnsRecord && !dnsRecord.allPass && (
                <>
                  {dnsRecord.mx || (
                    <Grid item>
                      <Chip
                        label="MX not found"
                        // color="error"
                        variant="outlined"
                        sx={{
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                          color: "#FD1E36",
                          backgroundColor: "white",
                          borderRadius: "8px",
                          border: "1px solid #FAD7DB",
                          px: 0.5,
                          py: 2,
                        }}
                        size="small"
                      />
                    </Grid>
                  )}
                  {dnsRecord.spf || (
                    <Grid item>
                      <Chip
                        label="SPF not found"
                        // color="error"
                        variant="outlined"
                        sx={{
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                          color: "#FD1E36",
                          backgroundColor: "white",
                          borderRadius: "8px",
                          border: "1px solid #FAD7DB",
                          px: 0.5,
                          py: 2,
                        }}
                        size="small"
                      />
                    </Grid>
                  )}
                  {dnsRecord.dkim || (
                    <Grid item>
                      {" "}
                      <Chip
                        label="DKIM not found"
                        // color="error"
                        variant="outlined"
                        sx={{
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                          color: "#FD1E36",
                          backgroundColor: "white",
                          borderRadius: "8px",
                          border: "1px solid #FAD7DB",
                          px: 0.5,
                          py: 2,
                        }}
                        size="small"
                      />
                    </Grid>
                  )}
                  {dnsRecord.dmarc || (
                    <Grid item>
                      {" "}
                      <Chip
                        label="DMARC not found"
                        // color="error"
                        variant="outlined"
                        sx={{
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                          color: "#FD1E36",
                          backgroundColor: "white",
                          borderRadius: "8px",
                          border: "1px solid #FAD7DB",
                          px: 0.5,
                          py: 2,
                        }}
                        size="small"
                      />
                    </Grid>
                  )}
                </>
              )} */}
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                py: 2,
                mt: 1,
                borderTop: `1px solid ${theme.palette.grey[200]}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <EATotalEmailsSent />
                </Box>
                <Box sx={{ ml: 1 }}>
                  <Typography
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",

                      fontSize: "20px",
                      fontWeight: 700,
                      lineHeight: "25px",
                      color: "#28287B",
                    }}
                  >
                    {account.campaignSend ? account.campaignSend : 0}
                  </Typography>
                  <Typography sx={{ color: "#8181B0", fontSize: "13px", fontWeight: 400 }}>
                    Campaign emails sent today
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {account.status === "paused" && (
                  <Box>
                    <Chip
                      label="Paused"
                      sx={{
                        fontSize: "12px",
                        fontWeight: 500,
                        lineHeight: "16px",
                        color: "#28287B",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #E4E4E5",
                        px: 0.5,
                        py: 2,
                        mb:1,
                        width: "100%",
                      }}
                      size="small"
                    />
                  </Box>
                )}
                <Box >
                  {(account.eEngineStatus === "authenticationError" || account.eEngineStatus === "connectError") && 
                    <Chip
                      label="Reconnect your account"
                      sx={{
                        fontSize: "12px",
                        fontWeight: 500,
                        lineHeight: "16px",
                        color: "red",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: " 1px solid #FAD7DB",
                        px: 0.5,
                        py: 2,
                        mb:1,
                        width: "100%",
                      }}
                      size="small"
                    />
                  }
                </Box>
                <Box >
                  {testMessage && 
                    <Chip
                      label={testMessage}
                      sx={{
                        fontSize: "12px",
                        fontWeight: 500,
                        lineHeight: "16px",
                        color: enableFunctionality ? "green" : "red",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: enableFunctionality ? " 1px solid green" : " 1px solid #FAD7DB",
                        px: 0.5,
                        py: 2,
                        mb:1,
                        width: "100%",
                      }}
                      size="small"
                    />
                  }
                </Box>
                {account.status === "disconnected" && (
                  // <Box>
                  //   <Chip
                  //     label="Disconnected"
                  //     // color="error"
                  //     sx={{
                  //       fontSize: "12px",
                  //       fontWeight: 500,
                  //       lineHeight: "16px",
                  //       color: "#FD1E36",
                  //       backgroundColor: "white",
                  //       borderRadius: "8px",
                  //       border: "1px solid #FAD7DB",
                  //       px: 0.5,
                  //       py: 2,
                  //       mb:1,
                  //       width: "100%",
                  //     }}
                  //     size="small"
                  //   />
                  // </Box>
                  <Box>
                  <Chip
                    label="Paused"
                    sx={{
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: "16px",
                      color: "#28287B",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #E4E4E5",
                      px: 0.5,
                      py: 2,
                      mb:1,
                      width: "100%",
                    }}
                    size="small"
                  />
                </Box>
                )}
                <Box>
                  {account.accountError && (
                    <>
                      <Chip
                        label="Error"
                        sx={{
                          fontSize: '12px',
                          fontWeight: 500,
                          lineHeight: '16px',
                          color: '#FD1E36',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          border: '1px solid #FAD7DB',
                          px: 0.5,
                          py: 2,
                          mb: 1,
                          width: '100%',
                          cursor: 'pointer',
                        }}
                        size="small"
                        onClick={handleChipClick}
                      />
                    </>
                  )}
                </Box>
                {dnsRecord && !dnsRecord.allPass && (
                  <Box sx={{ display: "flex", flexDirection: "row", gap: "8px" }}>
                    {dnsRecord.mx || (
                      <Box sx={{ flex: 1 }}>
                        <Chip
                          label="MX not found"
                          variant="outlined"
                          sx={{
                            fontSize: "12px",
                            fontWeight: 500,
                            lineHeight: "16px",
                            color: "#FD1E36",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid #FAD7DB",
                            px: 0.5,
                            py: 2,
                            width: "100%",
                          }}
                          size="small"
                        />
                      </Box>
                    )}
                    {dnsRecord.spf || (
                      <Box sx={{ flex: 1 }}>
                        <Chip
                          label="SPF not found"
                          variant="outlined"
                          sx={{
                            fontSize: "12px",
                            fontWeight: 500,
                            lineHeight: "16px",
                            color: "#FD1E36",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid #FAD7DB",
                            px: 0.5,
                            py: 2,
                            width: "100%",
                          }}
                          size="small"
                        />
                      </Box>
                    )}
                    {dnsRecord.dkim || (
                      <Box sx={{ flex: 1 }}>
                        <Chip
                          label="DKIM not found"
                          variant="outlined"
                          sx={{
                            fontSize: "12px",
                            fontWeight: 500,
                            lineHeight: "16px",
                            color: "#FD1E36",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid #FAD7DB",
                            px: 0.5,
                            py: 2,
                            width: "100%",
                          }}
                          size="small"
                        />
                      </Box>
                    )}
                    {dnsRecord.dmarc || (
                      <Box sx={{ flex: 1 }}>
                        <Chip
                          label="DMARC not found"
                          variant="outlined"
                          sx={{
                            fontSize: "12px",
                            fontWeight: 500,
                            lineHeight: "16px",
                            color: "#FD1E36",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid #FAD7DB",
                            px: 0.5,
                            py: 2,
                            width: "100%",
                          }}
                          size="small"
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
            <Grid container spacing={2} columnSpacing={3}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    p: 2,
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    backgroundColor: "#F2F4F6",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {" "}
                  <Box>
                    {" "}
                    <EATotalWarmupSent />
                  </Box>
                  <Typography sx={{ color: "#8181B0", fontSize: "13px", fontWeight: 400 }}>
                    Warmup emails sent past week
                  </Typography>
                  <Typography
                    sx={{ fontSize: "20px", fontWeight: 700, lineHeight: "25px", color: "#28287B" }}
                  >
                    {" "}
                    {account.warmupStats?.sent_count || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    p: 2,
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    backgroundColor: "#F2F4F6",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box>
                    <EAWarmupHealthPercent />
                  </Box>
                  <Typography sx={{ color: "#8181B0", fontSize: "13px", fontWeight: 400 }}>
                    Warmup health percentage
                  </Typography>
                  <Typography
                    sx={{ fontSize: "20px", fontWeight: 700, lineHeight: "25px", color: "#28287B" }}
                  >
                    {account.warmupStats?.health_score || 0}%
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    p: 2,
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    backgroundColor: "#F2F4F6",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box>
                    {" "}
                    <EATotalEmailsReceived />
                  </Box>
                  <Typography sx={{ color: "#8181B0", fontSize: "13px", fontWeight: 400 }}>
                    Warmup emails landed in inbox past week
                  </Typography>
                  <Typography
                    sx={{ fontSize: "20px", fontWeight: 700, lineHeight: "25px", color: "#28287B" }}
                  >
                    {" "}
                    {account.warmupStats?.inbox_count || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    p: 2,
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    backgroundColor: "#F2F4F6",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box>
                    {" "}
                    <EATotalEmailsFreeSpamIcon />
                  </Box>
                  <Typography sx={{ color: "#8181B0", fontSize: "13px", fontWeight: 400 }}>
                    Warmup emails saved from spam folder past week
                  </Typography>
                  <Typography
                    sx={{ fontSize: "20px", fontWeight: 700, lineHeight: "25px", color: "#28287B" }}
                  >
                    {" "}
                    {account.warmupStats?.spam_count || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            {/*<Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                mt: 2,
              }}
            >
               <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  width: "35%",
                  backgroundColor: "#F2F4F6",
                  borderRadius: "8px",
                  // borderRight: "1px solid rgba(0,0,0,0.1)",
                  p: 2,
                }}
              >
                <Tooltip title="Campaign total number of emails sent today" placement="top" arrow>
                  <Typography
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      fontSize: "20px",
                      fontWeight: 700,
                      lineHeight: "25px",
                      color: "#28287B",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <EATotalEmailsSent />
                    </Box>
                    {account.campaignSend ? account.campaignSend : 0}
                  </Typography>
                </Tooltip>
              </Box> 
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  flexDirection: "column",
                  py: 1,
                  border: "1px solid #E4E4E5",
                  borderRadius: "8px",
                  height: "100%",
                  ml: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Tooltip
                    title="Total number of warmup emails in the past week"
                    placement="top"
                    sx={{ textAlign: "center" }}
                    arrow
                  >
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        width: "6.5ch",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "18px",
                        color: "#28287B",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mr: 1,
                        }}
                      >
                        <EATotalWarmupSent />
                      </Box>

                      {account.warmupStats?.sent_count || 0}
                    </Typography>
                  </Tooltip>{" "}
                  <Tooltip
                    title="Total number of emails we kept out of spam past week"
                    placement="top"
                    sx={{ textAlign: "center" }}
                    arrow
                  >
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        width: "6.5ch",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "18px",
                        color: "#28287B",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mr: 1,
                        }}
                      >
                        <EATotalEmailsFreeSpamIcon />
                      </Box>
                      {account.warmupStats?.spam_count || 0}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    width: "100%",
                    mt: 3,
                  }}
                >
                  <Tooltip
                    title="Total number of warmup emails delivered in primary inbox past week"
                    placement="bottom"
                    sx={{ textAlign: "center" }}
                    arrow
                  >
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        width: "6.5ch",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "18px",
                        color: "#28287B",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mr: 1,
                        }}
                      >
                        <EATotalEmailsReceived />
                      </Box>
                      {account.warmupStats?.inbox_count || 0}
                    </Typography>
                  </Tooltip>

                  <Tooltip
                    title="Warmup health percentage"
                    placement="bottom"
                    sx={{ textAlign: "center" }}
                    arrow
                  >
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        width: "6.5ch",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "18px",
                        color: "#28287B",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mr: 1,
                        }}
                      >
                        <EAWarmupHealthPercent />
                      </Box>
                      {account.warmupStats?.health_score || 0}%
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
            </Box> */}
          </>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <AddEmailHero />
              <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.5)", mt: 1 }}>
                Add New Email Account
              </Typography>
            </Box>
          </>
        )}
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: 240,
          }}
        >
          <Button
            fullWidth
            sx={{
              py: 0,
              px: 0,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              color: "#101828",
            }}
            onClick={onClickSettings}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                width: "100%",
                py: 2,
                px: 2,
              }}
              onClick={() => {
                setAnchorEl(null);
              }}
            >
              <Settings sx={{ mr: 1 }} fontSize="small" />
              Adjust Settings
            </Box>
          </Button>
          <Button
            fullWidth
            sx={{
              py: 2,
              px: 2,

              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              color: "#101828",
            }}
            disabled = {account.status === 'paused'}
            onClick={handleReconnectAccountClick}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
              <DriveFileRenameOutline sx={{ mr: 1 }} fontSize="small" />
              Reconnect to Account
            </Box>
          </Button>
          <Button
            fullWidth
            sx={{
              py: 2,
              px: 2,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              color: "#101828",
              "&:hover": {
                backgroundColor: "#ffd6d6",
              },
              borderRadius: 0,
            }}
            disabled = {account.status === 'paused'}
            onClick={() => {
              setOpenRemoveAccountDialog(true);
              setAnchorEl(null);
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
              <Delete sx={{ mr: 1 }} fontSize="small" />
              Delete Account
            </Box>
          </Button>
          <Button
            fullWidth
            sx={{
              py: 2,
              px: 2,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              color: "#101828",
            }}
            disabled = {account.status === 'paused'}
            onClick={() => {
              !isSmtpImapTesting && handleTestAccountClick();
            }}
          >
            {isSmtpImapTesting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1, color: "#0071F6" }} thickness={5} />
                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                  Test Account
                </Box>
              </>
                ) : (
                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                  <BugReport sx={{ mr: 1 }} fontSize="small" />
                  Test Account
                </Box>
                )}
          </Button>
        </Box>
      </Popover>
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        disableEnforceFocus={true}
        maxWidth="sm"
        minWidth="xs"
        fullWidth
        sx={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        {" "}
        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 500,
              lineHeight: '16px',
              color: '#28287B',
              marginRight: 'auto',
            }}
          >
            Enable Account
          </Typography>
          <Box sx={{ m: 0, marginLeft: 'auto' }}>
            <CustomCheckbox
            onChange={handleUpdateAccount(account._id, true)}
            />
          </Box>
        </Box>

        <DialogTitle sx={{ position: "relative" }}>Dated At: {convertToUTC(account.updatedAt)}</DialogTitle>
        <DialogContent>
          Error Message: {account.accountError}
        </DialogContent>
        <DialogActions sx={{ px: "24px", pb: 2 }}>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <RemoveAccountDialog
        open={openRemoveAccountDialog}
        onClose={() => {
          setOpenRemoveAccountDialog(false);
        }}
        onClick={handleRemoveAccountClick}
      />
    </>
  );
};

export default EmailBlock;
