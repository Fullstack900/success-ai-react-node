import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { IHAllIcon } from "src/assets/inboxHub/IHAllIcon";
import { DropDown } from "src/assets/general/DropDown";
import { IHCampaignsIcon } from "src/assets/inboxHub/IHCampaignsIcon";
import { SBSearch } from "src/assets/sidebar/SBSearch";
import { useGetCampaignsQuery } from "src/services/campaign-service";
import { setAccounts, useGetAccountsMutation } from "src/services/account-service.js";
import { useGetCampaignEmailsMutation } from "src/services/unibox-service.js";
import { useGetAllLabelsQuery } from "src/services/campaign-service.js";
import MainSection from "src/components/MainSection/MainSection";


const InboxColumn = ({
  value,
  isCampaignsLoading,
  campaignData,
  currentCampaign,
  setCurrentCampaign,
  handleSearchCampaignChange,
  setCurrentAccount,
  setOpenAllCampaigns,
  openAllCampaigns,
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: { sm: "calc(100vh - 140px)" },
        backgroundColor: "white",
        p: 2,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        boxShadow: "0px 12px 15px 0px #4B71970D",
        borderRadius: "12px",
        flexDirection: "column",
        overflowY: "hidden",

        // width
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
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
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
            All Campaigns
          </Typography>
        </Box>

        <Box
          sx={{
            width: "100%",
            display: value !== 1 && "none",
            transition: "all 0.2s ease-out",
            mt: 2,
            height: "85%",
          }}
        >
          {" "}
          <TextField
            placeholder="Search by campaign"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton sx={{ width: 32, height: 32 }}>
                    <SBSearch color="rgba(40, 40, 123, 0.5)" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            sx={{
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
              mb: 1,
            }}
            onChange={handleSearchCampaignChange}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "87%",
              overflowY: "auto",
              // width
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
            }}
          >
            {!isCampaignsLoading &&
              campaignData?.docs?.map((i) => {
                return (
                  <>
                    {" "}
                    <Button
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        textAlign: "left",
                        px: 1.5,
                        py: 1,
                        mb: 1,
                        width: "100%",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "18px",
                        color: currentCampaign === i._id ? "#3F4FF8" : "#28287B",
                        "&:hover": {
                          backgroundColor: currentCampaign === i._id ? "#fff" : "#F2F4F6",
                          color: "#3F4FF8",
                        },
                        border: currentCampaign === i._id ? "1px solid #3F4FF8" : "1px solid #fff",
                      }}
                    >
                      <Typography
                        sx={{
                          width: "calc(100% - 20px)",
                          textAlign: "left",
                          ml: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {i.name}
                      </Typography>
                    </Button>
                  </>
                );
              })}
          </Box>
        </Box>
        {/* old design start */}
        <Box
          sx={{
            display: "none",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            cursor: "pointer",
            border: "1px solid #E4E4E5",
            borderRadius: "8px",
            px: 2,
            py: 1,
            mt: 2,
          }}
          onClick={() => {
            setCurrentCampaign(null);
            setCurrentAccount(null);
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <IHAllIcon />
          </Box>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "18px",
              color: "#28287B",
              ml: 2,
            }}
          >
            View All
          </Typography>
        </Box>
        <Box
          sx={{
            display: "none",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: "100%",
            border: "1px solid #E4E4E5",
            borderRadius: "8px",
            px: 2,
            py: 1,
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",

              cursor: "pointer",
            }}
            onClick={() => {
              setOpenAllCampaigns(!openAllCampaigns);
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              {" "}
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <IHCampaignsIcon />
              </Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "18px",
                  color: "#28287B",
                  ml: 2,
                }}
              >
                View All Campaigns
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <DropDown />
            </Box>
          </Box>{" "}
          <Box
            sx={{
              width: "100%",
              maxHeight: "350px",
              display: !openAllCampaigns && "none",
              transition: "all 0.2s ease-out",
              mt: 2,
            }}
          >
            {" "}
            <TextField
              placeholder="Search by campaign"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton sx={{ width: 32, height: 32 }}>
                      <SBSearch color="rgba(40, 40, 123, 0.5)" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              sx={{
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
              onChange={handleSearchCampaignChange}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",

                maxHeight: "150px",
                overflowY: "auto",
                // width
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
              }}
            >
              {" "}
              {!isCampaignsLoading &&
                campaignData?.docs?.map((i) => {
                  return (
                    <>
                      {" "}
                      <Button
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          // p: 2,
                          py: 1,
                          px: 0.5,
                          my: 0.5,
                          // backgroundColor: "rgba(0,0,0,0.1)",

                          width: "100%",
                          borderRadius: "3px",
                          color: "black",
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
                          {i.name}
                        </Typography>
                      </Button>
                    </>
                  );
                })}
            </Box>
          </Box>
        </Box>

        {/* old design end */}
      </Box>
    </Box>
  );
};

const CrmPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [openAllCampaigns, setOpenAllCampaigns] = useState(false);
  const [openAllInboxes, setOpenAllInboxes] = useState(false);
  const [searchCampaign, setSearchCampaign] = useState("");
  const [currentEmail, setCurrentEmail] = useState();
  const [campaignEmails, setCampaignEmails] = useState([]);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [value, setValue] = React.useState(1);
  const [showAll, setShowAll] = useState(true);
  const [loadMore, setLoadMore] = useState(false);
  const [searchAccount, setSearchAccount] = useState("");

  const { data: campaignData, isFetching: isCampaignsLoading } = useGetCampaignsQuery({
    search: searchCampaign,
    unibox: true,
  });

  const {
    data: statusLabels,
    isFetching: isLabelsLoading,
    refetch: refetchLabels,
  } = useGetAllLabelsQuery();

  useEffect(() => {
    getAccounts({ search: searchAccount, unibox: true }).then((res) => {
      dispatch(setAccounts(res?.data?.docs));
    });
  }, [searchAccount]);
  const [getAccounts, { isLoading: isAccountsLoading }] = useGetAccountsMutation();

  useEffect(() => {
    setCampaignEmails([]);
    setCurrentEmail();
    const object = {};
    if (currentCampaign) {
      object.campaignId = currentCampaign;
    }
    if (currentAccount) {
      object.accountId = currentAccount;
    }
    if (currentStatus) {
      object.label = currentStatus;
    }
    getCampaignEmails(object).then((res) => {
      setCampaignEmails(res?.data?.docs);
    });
  }, [currentCampaign, loadMore, currentAccount, showAll, currentStatus]);

  const [getCampaignEmails, { isLoading: isCampaignsEmailLoading }] =
    useGetCampaignEmailsMutation();

  const accountData = useSelector((state) => state.accounts);

  const memoizedAccountData = useMemo(() => accountData, [accountData]);

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [inboxTabsOpen, setInboxTabsOpen] = useState(false);

  const handleSearchCampaignChange = (event) => {
    setSearchCampaign(event.target.value);
  };
 
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
            height: "calc(100vh - 134px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Grid container columnSpacing={3} sx={{ height: "100%", mt: 4 }}>
            <Drawer
              open={isMobile ? inboxTabsOpen : false}
              variant="temporary"
              onClose={() => setInboxTabsOpen(false)}
              sx={{
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: { sm: "300px", xs: "100%" },
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  zIndex: 1,
                }}
              >
                <IconButton onClick={() => setInboxTabsOpen(false)}>
                  <CloseOutlined />
                </IconButton>
              </Box>
              <InboxColumn
                value={value}
                isCampaignsLoading={isCampaignsLoading}
                campaignData={campaignData}
                currentCampaign={currentCampaign}
                showAll={showAll}
                memoizedAccountData={memoizedAccountData}
                handleSearchCampaignChange={handleSearchCampaignChange}
                isAccountsLoading={isAccountsLoading}
                currentAccount={currentAccount}
                isLabelsLoading={isLabelsLoading}
                statusLabels={statusLabels}
                currentStatus={currentStatus}
                openAllCampaigns={openAllCampaigns}
                openAllInboxes={openAllInboxes}
                theme={theme}
              />
            </Drawer>
            <Grid item xs={2} sx={{ height: "100%", display: { xs: "none", sm: "block" } }}>
              <InboxColumn
                value={value}
                isCampaignsLoading={isCampaignsLoading}
                campaignData={campaignData}
                currentCampaign={currentCampaign}
                showAll={showAll}
                handleSearchCampaignChange={handleSearchCampaignChange}
                memoizedAccountData={memoizedAccountData}
                isAccountsLoading={isAccountsLoading}
                currentAccount={currentAccount}
                isLabelsLoading={isLabelsLoading}
                statusLabels={statusLabels}
                currentStatus={currentStatus}
                openAllCampaigns={openAllCampaigns}
                openAllInboxes={openAllInboxes}
                theme={theme}
              />
            </Grid>
            <Grid item xs={12} sm={8} sx={{ height: "100%"}}>
              <MainSection  />
            </Grid>
          </Grid>
        </Box>
      </Box>
      
    </>
  );
};

export default CrmPage;
