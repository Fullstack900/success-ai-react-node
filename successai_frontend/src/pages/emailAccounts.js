import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CancelRounded, Clear } from "@mui/icons-material";
import EmailBlock from "src/components/emailAccounts/emailBlock";
import EmailDrawer from "src/components/emailAccounts/emailDrawer";
import { useNavigate } from "react-router-dom";
import {
  accountDeleted,
  accountsAdded,
  accountsDeleted,
  setAccounts,
  useBulkDeleteMutation,
  useGetAccountsMutation,
  useRemoveAccountMutation,
} from "src/services/account-service.js";
import toast from "react-hot-toast";
import { setDnsVitals, useGetDnsVitalsMutation } from "src/services/dns-service.js";
import AddNewEmailBlock from "src/components/emailAccounts/AddNewEmailBlock.js";
import BulkSettingEmailDrawer from "src/components/emailAccounts/BulkSettingEmailDrawer.js";
import { useDispatch, useSelector } from "react-redux";
import RemoveAccountDialog from "src/components/RemoveAccountDialog.js";
import { DeleteIcon } from "src/assets/general/DeleteIcon";
import { FilterIcon } from "src/assets/general/FilterIcon";
import { Plus } from "src/assets/general/Plus";
import { SBSearch } from "src/assets/sidebar/SBSearch";
import { EmailFilterPauseIcon } from "src/assets/emailAccounts/filterMenu/EmailFilterPausedIcon";
import { EmailFilterHasErrorIcon } from "src/assets/emailAccounts/filterMenu/EmailFilterHasError";
import { EmailFilterHasNoCustomTrackingDomainIcon } from "src/assets/emailAccounts/filterMenu/EmailFilterNoCustomTrackingDomain";
import { EmailFilterWarmupActiveIcon } from "src/assets/emailAccounts/filterMenu/EmailFilterWarmupActive";
import { EmailFilterWarmupPaused } from "src/assets/emailAccounts/filterMenu/EmailFilterWarmupPaused";
import { EmailFilterWarmupErrorsIcon } from "src/assets/emailAccounts/filterMenu/EmailFilterWarmupErrors";
import { EAEditIcon } from "src/assets/emailAccounts/EAEditIcon";
import { EASettingsIcon } from "src/assets/emailAccounts/EASettingsIcon";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon";
import { EATrashIconBlackSmallIcon } from "src/assets/emailAccounts/EATrashIconBlackSmall";
import { AiOutlineClose } from "react-icons/ai";
import Pagination from "src/components/Pagination";
import { useGetMeQuery } from "src/services/user-service";
import { useGetCurrentPlanQuery } from "src/services/billing-service.js";

const filterButtons = [
  {
    name: "On Pause",
    value: "paused",
    icon: (active) => <EmailFilterPauseIcon color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "Issues Detected",
    value: "has_errors",
    icon: (active) => <EmailFilterHasErrorIcon color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "No Custom Tracking Domain",
    value: "no_custom_tracking_domain",
    icon: (active) => (
      <EmailFilterHasNoCustomTrackingDomainIcon color={active ? "#0071F6" : "#28287B"} />
    ),
  },
  {
    name: "Warmup In Progress",
    value: "warmup_active",
    icon: (active) => <EmailFilterWarmupActiveIcon color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "Warmup Paused",
    value: "warmup_paused",
    icon: (active) => <EmailFilterWarmupPaused color={active ? "#0071F6" : "#28287B"} />,
  },
  {
    name: "Warmup Issues",
    value: "warmup_has_errors",
    icon: (active) => <EmailFilterWarmupErrorsIcon color={active ? "#0071F6" : "#28287B"} />,
  },
];

const BulkSettings = ({
  checkedAll,
  handleChangeCheckedAll,
  checkedAccounts,
  setOpenBulkSettingDrawer,
  handleBulkDelete,
  setBulkSettings,
  isMobile,
}) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
          backgroundColor: "white",
          borderRadius: "12px",
          px: 2,
          py: 1.5,
          boxShadow: "0px 12px 15px 0px #4B71970D",
          mt: { xs: 0, md: 3 },
          gap: 2,
        }}
      >
        <Tooltip title={checkedAll ? "Deselect all" : "Select all"} arrow>
          <Checkbox
            checked={checkedAll}
            onChange={handleChangeCheckedAll}
            inputProps={{ "aria-label": "controlled" }}
            icon={<OffCheckboxCustomIcon />}
            checkedIcon={<OnCheckboxCustomIcon />}
            size="small"
          />
        </Tooltip>

        {checkedAccounts.length !== 0 && (
          <>
            <Button
              variant="outlined"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: 700,
                lineHeight: "16.38px",
                color: "#28287B",
                backgroundColor: "white",

                "&:hover": {
                  backgroundColor: "white",
                  // boxShadow: 10,
                },
                border: "1px solid #E4E4E5",
                height: "36px",
                px: 2,
              }}
              onClick={() => setOpenBulkSettingDrawer(true)}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mr: 1,
                }}
              >
                <EAEditIcon />
              </Box>
              {isMobile ? "Bulk Config" : "Bulk Configurations"}
            </Button>
            <Button
              variant="outlined"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: 700,
                lineHeight: "16.38px",
                color: "#28287B",
                backgroundColor: "white",

                "&:hover": {
                  backgroundColor: "white",
                  // boxShadow: 10,
                },
                border: "1px solid #E4E4E5",
                height: "36px",
                px: 2,
              }}
              onClick={handleBulkDelete}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mr: 1,
                }}
              >
                <EATrashIconBlackSmallIcon />
              </Box>
              Delete
            </Button>
          </>
        )}

        <Button
          variant="outlined"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "13px",
            fontWeight: 700,
            lineHeight: "16.38px",
            color: "#28287B",
            backgroundColor: "white",

            "&:hover": {
              backgroundColor: "white",
              // boxShadow: 10,
            },
            border: "1px solid #E4E4E5",
            height: "36px",
            px: 2,
          }}
          onClick={() => {
            setBulkSettings(false);
          }}
        >
          <CancelRounded sx={{ mr: 1, width: 16, height: 16 }} fontSize="small" /> Exit
        </Button>
      </Box>
    </>
  );
};


const Page = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: currentPlan } = useGetCurrentPlanQuery();
  const theme = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  let anchor = "right";
  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const [blockClickedID, setBlockClickedID] = useState();

  const [openBulkSettingDrawer, setOpenBulkSettingDrawer] = useState(false);

  const accounts = useSelector((state) => state.accounts);
  const [getAccounts, { isLoading: isAccountsLoading }] = useGetAccountsMutation();

  // Search, filter and pagination
  const [isLoadingMoreAccounts, setIsLoadingMoreAccounts] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const offset = accounts.length;
  // const limit = 15;
  const { data: user, refetch: refetchUser } = useGetMeQuery();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { docs, total } = await getAccounts({ search, filter: filter?.value, offset: offset * (page - 1), limit }).unwrap();
      dispatch(setAccounts(docs));
      setTotal(total);
      const warmedUpEmail = docs.filter((data) => data?.warmup?.status === "enabled");
      window.Intercom("update", {
        connected_email_accounts: total,
        warmedup_email_accounts: warmedUpEmail?.length,
      });
    }, 500);
  }, [search, filter, limit, page]);

  /* useEffect(() => {
    const handler = async () => {
      if (isLoadingMoreAccounts) return;
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

      if (scrollHeight - scrollTop === clientHeight && offset < total) {
        setIsLoadingMoreAccounts(true);
        const { docs, total } = await getAccounts({
          search,
          filter: filter?.value,
          offset,
          limit,
        }).unwrap();
        dispatch(accountsAdded(docs));
        setTotal(total);
        setIsLoadingMoreAccounts(false);
      }
    };

    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [isLoadingMoreAccounts, search, filter, total, offset, limit, getAccounts, dispatch]); */
  // const didMount = React.useRef(false);
  // useEffect(() => {
  //   if (offset < total && page > 1) {
  //     const timer = setTimeout(async () => {
  //       const { docs, total } = await getAccounts({
  //         search,
  //         filter: filter?.value,
  //         offset: offset * (page - 1),
  //         limit,
  //       }).unwrap();
  //       //  dispatch(accountsAdded(docs));
  //       dispatch(setAccounts(docs));

  //       setTotal(total);
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [page, search, filter]);
  const [removeAccount] = useRemoveAccountMutation();

  const handleDelete = async (id) => {
    await toast.promise(removeAccount(id).unwrap(), {
      loading: "Deleting...",
      success: "Account Deleted!",
      error: "Could not delete",
    });
    dispatch(accountDeleted(id));
  };

  const [tabValue, setTabValue] = useState(0);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleSelectFilter = (filter) => {
    setFilter(filter);
    setPage(1);
  };

  //DNS Vitals
  const dnsVitals = useSelector((state) => state.dns.vitals);
  const [getDnsVitals, { isLoading: loadingDNS }] = useGetDnsVitalsMutation();

  const handleTestDomainSetup = async () => {
    const toastId = toast.loading("Verifying MX, SPF, DKIM, and DMARC records for all domains", {
      duration: Infinity,
    });

    const dnsVitals = await getDnsVitals({ accounts: accounts.map((a) => a.email) }).unwrap();
    dispatch(setDnsVitals(dnsVitals));

    const failureCount = dnsVitals.failureCount;
    const toastOptions = { id: toastId, duration: 2000 };

    if (failureCount > 0) {
      toast.error(`${failureCount} domains failed DNS check`, toastOptions);
    } else {
      toast.success("All domains passed DNS check", toastOptions);
    }
  };

  const getDnsRecordForEmail = (email) =>
    dnsVitals.records && dnsVitals.records[email.split("@")[1]];

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const [bulkSettings, setBulkSettings] = useState(false);

  const [checkedAll, setCheckedAll] = useState(false);
  const [checkedAccounts, setCheckedAccounts] = useState([]);

  const handleChangeCheckedAll = async (event) => {
    if (event.target.checked) {
      const { docs } = await getAccounts({
        search,
        filter: filter?.value,
        limit: total,
      }).unwrap();
      setCheckedAccounts(docs.map((account) => account._id));
      setCheckedAll(true);
      // setCheckedAccounts(accounts.map((account) => account._id));
    } else {
      setCheckedAccounts([]);
      setCheckedAll(false);
    }
  };

  const handleAccountCheckChange = (checked, id) => {
    if (checked) {
      setCheckedAccounts([...checkedAccounts, id]);
    } else {
      if (checkedAll) {
        setCheckedAll(false);
      }
      setCheckedAccounts(checkedAccounts.filter((account) => account !== id));
    }
  };

  useEffect(() => {
    // accounts?.length === checkedAccounts.length ? setCheckedAll(true) : setCheckedAll(false);

    accounts?.length === 0 && setBulkSettings(false);
  }, [checkedAccounts, accounts]);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bulkDelete] = useBulkDeleteMutation();

  const handleBulkDelete = async () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogSubmit = async () => {
    setConfirmDialogOpen(false);
    const toastId = toast.loading("Deleting Accounts", { duration: Infinity });
    const { message } = await bulkDelete({ ids: checkedAccounts }).unwrap();
    dispatch(accountsDeleted({ ids: checkedAccounts }));
    toast.success(message, { id: toastId, duration: 2000 });
  };

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(1);
  };

  const navigateToEmailAccountAddition = () => {
    localStorage.removeItem("reconnect");
    navigate("/accounts/connect");
  }

  const [expiresSubscription, setExpiresSubscription] = useState('');
  const [userSumoPlan,setUserSumoPlan] = useState('');
  const [userSumoPlanKey,setUserSumoPlanKey] = useState('');

  const freeAccountsLimit = useSelector((state) => state.accounts);
  localStorage.setItem("accountsLength",freeAccountsLimit?.length)
  useEffect(() => {
      const expiresSubscription =
      currentPlan?.subscription?.sendingWarmup?.expiresAt ||
      currentPlan?.subscription?.leads?.expiresAt ;
      setUserSumoPlan(user?.isAppSumoRefund)
      setUserSumoPlanKey(user?.assignedPlan)
      setExpiresSubscription(expiresSubscription);
      refetchUser();
  }, [currentPlan]);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: "90%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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
              Email Accounts
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Button
                disabled={expiresSubscription === undefined && userSumoPlanKey === null && userSumoPlan === false && freeAccountsLimit?.length > 2 ? true : false}
                id="Connect New Account"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: "#164694",
                    boxShadow: 10,
                  },
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "18px",
                  letterSpacing: "0em",
                  color: "white",
                  backgroundColor: expiresSubscription === undefined && userSumoPlanKey === null && userSumoPlan === false && freeAccountsLimit?.length >= 2 ? "#e3e3e3": "#0071F6",
                  borderRadius: "8px",
                  px: 1.5,
                  py: 1.5,
                  pr: "18px",
                }}
                variant="outlined"
                size="large"
                onClick={navigateToEmailAccountAddition}
                title="Click to add a new email account"
              >
                <Box
                  sx={{ mr: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  <Plus />
                </Box>
                {isMobile ? "Connect" : "Connect New Account"}
              </Button>
            </Box>
          
          </Box>
          
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              width: "100%",
              mt: 2,
              rowGap: { xs: 1, md: 0 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "space-between", md: "center" },
                alignItems: "center",
                width: { xs: "100%", md: "fit-content" },
              }}
            >
              <Button
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: "16.38px",
                  color: "#28287B",
                  backgroundColor: "white",
                  mr: { xs: 0, md: 2 },
                  "&:hover": {
                    backgroundColor: "white",
                    // boxShadow: 10,
                  },
                  border: bulkSettings ? "1px solid #0071F6" : "1px solid #E4E4E5",
                  height: "40px",
                  px: 2,
                }}
                color="inherit"
                onClick={() => {
                  setBulkSettings(!bulkSettings);
                }}
                disabled={isAccountsLoading || accounts?.length === 0 ? true : false}
              >
                {/* {bulkSettings ? (
                  <CancelRounded sx={{ mr: 1 }} fontSize="small" />
                ) : ( */}
                <Box
                  sx={{ mr: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  <EAEditIcon />
                </Box>
                {/* )} */}
                Bulk Settings
              </Button>
              <Button
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: "16.38px",
                  color: "#28287B",
                  backgroundColor: "white",
                  mr: { xs: 0, md: 2 },
                  "&:hover": {
                    backgroundColor: "white",
                    // boxShadow: 10,
                  },
                  border: loadingDNS ? "1px solid #0071F6" : "1px solid #E4E4E5",
                  height: "40px",
                  px: 2,
                }}
                color="inherit"
                onClick={() => {
                  !loadingDNS && handleTestDomainSetup();
                }}
                disabled={isAccountsLoading || accounts?.length === 0 ? true : false}
              >
                {loadingDNS ? (
                  <CircularProgress size={16} sx={{ mr: 1, color: "#0071F6" }} thickness={5} />
                ) : (
                  <Box
                    sx={{ mr: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    <EASettingsIcon />
                  </Box>
                )}
                Test domain setup
              </Button>
            </Box>
            {bulkSettings && (
              <Box sx={{ display: { xs: "block", md: "none", width: "100%" } }}>
                <BulkSettings
                  checkedAll={checkedAll}
                  handleChangeCheckedAll={handleChangeCheckedAll}
                  checkedAccounts={checkedAccounts}
                  setOpenBulkSettingDrawer={setOpenBulkSettingDrawer}
                  handleBulkDelete={handleBulkDelete}
                  setBulkSettings={setBulkSettings}
                  isMobile={isMobile}
                />
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: { xs: "flex-end", md: "center" },
                flexDirection: { xs: "column-reverse", md: "row" },
                rowGap: { xs: 1, md: 0 },
                width: { xs: "100%", md: "fit-content" },
              }}
            >
              <Box sx={{ display: "flex" }}>
                {filter && (
                  // <Tooltip title="Remove Filters" placement="top" arrow>
                  //   <IconButton onClick={() => handleSelectFilter(null)}>
                  //     <DeleteIcon />
                  //   </IconButton>
                  // </Tooltip>
                  <Button
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      lineHeight: "16.38px",
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),

                      mr: 2,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        // boxShadow: 10,
                      },

                      height: "40px",
                      px: 2,
                    }}
                    onClick={() => handleSelectFilter(null)}
                  >
                    {filter.name}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        ml: 1,
                      }}
                    >
                      <AiOutlineClose />
                    </Box>
                  </Button>
                )}
                <Button
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "13px",
                    fontWeight: 700,
                    lineHeight: "16.38px",
                    color: "#28287B",
                    backgroundColor: "white",
                    mr: { xs: 0, md: 2 },
                    "&:hover": {
                      backgroundColor: "white",
                      // boxShadow: 10,
                    },
                    border: filter ? "1px solid #0071F6" : "1px solid #E4E4E5",
                    height: "40px",
                    px: 2,
                  }}
                  onClick={handleClick}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}
                  >
                    <FilterIcon />
                  </Box>
                  Filter
                </Button>
              </Box>

              <TextField
                placeholder="Search by email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton sx={{ width: 32, height: 32 }}>
                        {search ? (
                          <Clear onClick={() => setSearch("")} />
                        ) : (
                          <SBSearch color="rgba(40, 40, 123, 0.5)" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{
                  width: { xs: "100%", md: 300 },
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
                value={search}
                onChange={handleSearchChange}
              />
            </Box>
          </Box>
          {bulkSettings && (
            <Box sx={{ display: { xs: "none", md: "block", width: "100%" } }}>
              <BulkSettings
                checkedAll={checkedAll}
                handleChangeCheckedAll={handleChangeCheckedAll}
                checkedAccounts={checkedAccounts}
                setOpenBulkSettingDrawer={setOpenBulkSettingDrawer}
                handleBulkDelete={handleBulkDelete}
                setBulkSettings={setBulkSettings}
                isMobile={isMobile}
              />
            </Box>
          )}

          {isAccountsLoading && !isLoadingMoreAccounts ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 10 }}>
              <CircularProgress sx={{}} size={25} thickness={5} />
              <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#4e88e6", ml: 2 }}>
                Loading...
              </Typography>
            </Box>
          ) : (
            <Grid container sx={{ mt: 2 }} spacing={2} columnSpacing={3}>
              {accounts?.map((account) => {
                return (
                  <>
                    <Grid
                      item
                      key={account._id}
                      xs={12}
                      sm={6}
                      onClick={(e) => {
                        setBlockClickedID(account._id);
                      }}
                    >
                      <EmailBlock
                        user={user}
                        isAccountChecked={checkedAccounts.some((a) => a === account._id)}
                        onAccountCheckChange={handleAccountCheckChange}
                        bulkSettingsOn={bulkSettings}
                        dnsRecord={getDnsRecordForEmail(account.email)}
                        account={account}
                        onClick={(e) => {
                          setTabValue(0);
                          toggleDrawer(true)(e);
                        }}
                        onDelete={handleDelete}
                        onClickSettings={(e) => {
                          setTabValue(1);
                          toggleDrawer(true)(e);
                        }}
                      />
                    </Grid>
                  </>
                );
              })}
              <Grid item key={0} xs={6}>
                <AddNewEmailBlock onClick={() => navigate("/accounts/connect")} />
              </Grid>
              {Math.ceil(total / limit) > 0 && (
                <Grid
                  item
                  xs={12}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Pagination
                    page={page}
                    setPage={setPage}
                    total={total}
                    length={accounts?.length}
                    limit={limit}
                    handleLimitChange={handleLimitChange}
                  />
                </Grid>
              )}
            </Grid>
          )}
          {/*isLoadingMoreAccounts && <CircularProgress sx={{ mt: 5 }} />*/}
        </Box>
      </Box>
      <div>
        {accounts &&
          accounts.map(
            (account) =>
              account._id === blockClickedID && (
                <Dialog
                  fullWidth
                  disableEnforceFocus={true}
                  fullScreen={isMobile}
                  maxWidth="md"
                  key={account._id}
                  anchor={anchor}
                  open={state[anchor]}
                  onClose={toggleDrawer(false)}
                  sx={{
                    backgroundColor: "rgba(4, 4, 30, 0.5)",
                    "& .MuiDialog-paper": {
                      height: "100%",
                      "&::-webkit-scrollbar": {
                        width: "14px",
                      },

                      // Track
                      "&::-webkit-scrollbar-track": {
                        borderRadius: "60px",
                      },

                      // /* Handle */
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#E4E4E5",
                        borderRadius: "10px",
                        border: "4px solid rgba(0, 0, 0, 0)",
                        backgroundClip: "padding-box",
                      },

                      // /* Handle on hover */
                      "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#d5d5d5",
                      },
                    },
                  }}
                >
                  <EmailDrawer
                    account={account}
                    onClose={toggleDrawer(false)}
                    tabValue={tabValue}
                  />
                </Dialog>
              )
          )}
      </div>
      <Drawer
        anchor="right"
        open={openBulkSettingDrawer}
        onClose={() => setOpenBulkSettingDrawer(false)}
      >
        <BulkSettingEmailDrawer
          accountIds={checkedAccounts}
          onClose={() => setOpenBulkSettingDrawer(false)}
        />
      </Drawer>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{ mt: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            // width: "fit-content",
            p: 1,
            width: "260px",
          }}
        >
          {filterButtons.map((item, i) => {
            return (
              <Button
                key={i}
                fullWidth
                sx={{
                  py: 1,
                  px: 1,

                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  color: "#101828",
                  fontSize: "13px",
                  backgroundColor: filter?.name === item.name && "#F2F4F6",
                }}
                onClick={() => {
                  setFilter(item);
                  setPage(1);
                  handleClose();
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                  {item.icon(filter?.name === item.name)}
                  <Typography
                    sx={{
                      color: filter?.name === item.name ? "#0071F6" : "#28287B",
                      fontSize: "13px",
                      fontWeight: 700,
                      linHeight: "16px",
                      letterSpacing: "0px",
                      ml: 2,
                    }}
                  >
                    {item.name}
                  </Typography>
                </Box>
              </Button>
            );
          })}
        </Box>
      </Popover>
      <RemoveAccountDialog
        open={confirmDialogOpen}
        onClick={handleConfirmDialogSubmit}
        onClose={() => setConfirmDialogOpen(false)}
      />
    </>
  );
};

export default Page;
