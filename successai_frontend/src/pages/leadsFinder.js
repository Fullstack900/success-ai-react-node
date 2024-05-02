import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  CircularProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
  Link as MuiLink,
  Divider,
  tooltipClasses,
  Menu,
  MenuItem,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { debounce, isEqual } from "lodash";
import FilterBlock from "src/components/leadsFinder/filterBlock";
import { DataGrid } from "@mui/x-data-grid";
import { SaveIcon } from "src/assets/general/SaveIcon";
import { ImportIcon, ImportIconBlack } from "src/assets/general/ImportIcon";
import { LFSearchHero } from "src/assets/leadFinder/LFSearchHero";
import { SendIcon } from "src/assets/general/SendIcon";
import { Total } from "src/assets/campaignDetailsLeads/Total";
import { makeStyles, styled } from "@mui/styles";
import {
  useAddLeadsToCampaignMutation,
  useCreateSavedSearchMutation,
  useFindLeadsMutation,
  useFindCompaniesMutation,
  useGetSearchesQuery,
  useLazyGetAllSavedSearchesQuery,
  useLookupLeadsMutation,
  useUpdateSearchMutation,
  useGetSavedFilesQuery,
  useSaveDownloadCsvMutation,
  useGetLeadsUsageQuery,
} from "src/services/leads-service.js";
import { useBillingUsageQuery } from "src/services/billing-service.js";
import { downloadCsv, filterObject } from "src/utils/util.js";
import RecentSearchBlock from "src/components/leadsFinder/RecentSearchBlock.js";
import SavedSearchBlock from "src/components/leadsFinder/SavedSearchBlock.js";
import {
  Close,
  CloseOutlined,
  DownloadOutlined,
  ImportContactsOutlined,
  ReceiptLongOutlined,
  HelpOutlineOutlined,
  DownloadForOfflineOutlined,
  RemoveRedEyeOutlined,
} from "@mui/icons-material";
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DownloadingRoundedIcon from "@mui/icons-material/DownloadingRounded";
import { FaLinkedinIn } from "react-icons/fa";
import { Link } from "react-router-dom";
import { EACloseIcon } from "src/assets/emailAccounts/EACloseIcon.js";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon.js";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon.js";
import { useGetCampaignsQuery } from "src/services/campaign-service.js";
import { toast } from "react-hot-toast";
import SavedSearchItem from "src/components/leadsFinder/SavedSearchItem.js";
import { DeleteIcon } from "src/assets/general/DeleteIcon";
import moment from "moment";
import useUserVerifyCheck from "src/hooks/use-user-verify";
import VerifyEmailAddressPage from "../components/auth/verifyEmailAddress.js";
import { LinkdineIcon } from "src/assets/social/LinkdinIcon.js";
import { useDispatch, useSelector, useStore } from "react-redux";
import { setSeachData } from "../store/reducers/search.js";

const columns = [
  {
    field: "name",
    headerName: "Name",
    width: 232,
    renderCell: (params) => (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Typography
          sx={{
            color: "#28287B",
            fontSize: "13px",
            fontWeight: "500",
            lineHeight: "16px",
            letterSpacing: "0em",
            cursor: "pointer",
          }}
        >
          {params.row.name}
        </Typography>
        <Box
          sx={{ height: "14px", cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            window.open(params.row.linkedin_url, "_blank");
          }}
        >
          <LinkdineIcon />
        </Box>
      </Box>
    ),
  },
  {
    field: "title",
    headerName: "Title",
    width: 232,
  },
  // {
  //   field: "organization",
  //   headerName: "Company",
  //   width: 232,
  // },
  {
    field: "email",
    headerName: "Email",
    width: 232,
    // valueGetter: ({ row }) =>
    //   row?.teaser && row?.teaser.professional_emails?.length
    //     ? `***@${row?.teaser?.professional_emails[0]}`
    //     : row?.teaser?.personal_emails?.length
    //     ? `***@${row?.teaser?.personal_emails[0]} `
    //     : row?.teaser?.emails?.length
    //     ? `***@${row?.teaser?.emails[0]}`
    //     : null,
  },
  // {
  //   field: "phone_numbers",
  //   headerName: "Phone Numbers",
  //   width: 194,
  //   valueGetter: ({ row }) => row.teaser.phones.map((phone) => phone.number).join(", "),
  // },
    {
      field: "country",
      headerName: "Location",
      width: 232,
    },
];

const useStyles = makeStyles(() => ({
  customDataGrid: {
    "& .MuiDataGrid-root": {
      backgroundColor: "#fff",
      border: "1px solid #E4E4E5",
    },

    "& .MuiDataGrid-columnHeader": {
      backgroundColor: "#F2F4F6",
      "&:focus": { outline: "none" },
      "&:focus-within": { outline: "none" },
      borderBottom: `1px solid #E4E4E5`,
      "& .MuiDataGrid-columnHeaderTitle": {
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "16px",
        letterSpacing: "0em",
        color: "#28287B",
      },
    },
    "& .MuiDataGrid-row": {
      border: `1px solid #E4E4E5`,
    },
    "& .MuiDataGrid-cell": {
      padding: "8px",
      "&:focus": { outline: "none" },
      "&:focus-within": { outline: "none" },
      "& .MuiDataGrid-cellContent": {
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "16px",
        letterSpacing: "0em",
        color: "#28287B",
      },
    },
  },
}));

const scrollBarStyle = {
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
};

const InfoTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    boxShadow: "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)",
    borderRadius: "12px",
    backgroundColor: "white",
    maxWidth: 500,
    py: "8px",
    px: "12px",
  },
  [`& .${tooltipClasses.arrow}`]: {
    "&:before": {
      border: "1px solid #E6E8ED",
    },
    color: "white",
  },
}));

const LeadInfo = ({
  isLoadingUsage,
  formattedNumber,
  usage,
  setLeadCreditDialogOpen,
  setLeadCreditTab,
  fetchDownloadedData,
  isMobile,
  theme,
}) => {
  return (
    <Grid
      container
      sx={{
        boxShadow: "0px 12px 15px 0px #4B71970D",
        borderRadius: "12px",
        backgroundColor: "white",
        width: "100%",
        py: 1,
        px: 1.5,
        pb: 1.5,
        gap: 1,

        transition: "all ease 1s",
      }}
    >
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          justifyContent: { xs: "center", sm: "space-between" },
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "200px",
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "24px",
              color: "#28287B",
            }}
          >
            Usage Overview
          </Typography>
          <InfoTooltip
            arrow
            placement="top-start"
            enterTouchDelay={0}
            title={
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: "13px",
                  lineHeight: "16.38px",
                  color: "#8181B0",
                  mt: 0.5,
                  textAlign: "justify",
                }}
              >
                Ensure you have both an available lead balance and stored leads limit to use the
                lead finder for adding leads to your campaign.
                <MuiLink
                  sx={{
                    display: "inline",
                    fontWeight: 500,
                    fontSize: "13px",
                    lineHeight: "16.38px",
                    color: theme.palette.primary.main,
                    ml: 1,
                    pointerEvents: "auto",

                    textDecoration: "none",
                  }}
                  href={
                    "https://help.success.ai/en/articles/8609707-understanding-active-leads-and-lead-credits"
                  }
                  target="_blank"
                >
                  {" "}
                  Read more
                </MuiLink>
              </Typography>
            }
          >
            <IconButton>
              <HelpOutlineOutlined sx={{ fontSize: "16px" }} />
            </IconButton>
          </InfoTooltip>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: { xs: "center", sm: "space-between" },
            alignItems: { xs: "flex-start", sm: "center" },
            width: { xs: "100%", sm: "calc(100% - 200px)" },
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",

              justifyContent: "flex-start",
              alignItems: "center",
              width: { xs: "100%", sm: "48%" },
              p: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {" "}
              <Total />
            </Box>

            <Box
              sx={{
                display: "flex",
                width: "calc(100% - 44px)",
                justifyContent: "flex-end",
                alignItems: "flex-start",
                flexDirection: "row-reverse",
                ml: 1.5,
                gap: 1,
              }}
            >
              {isLoadingUsage ? (
                <CircularProgress size={25} thickness={5} />
              ) : (
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: "#28287B",
                    fontWeight: 700,
                    lineHeight: "25.2px",
                  }}
                >
                  {formattedNumber}
                  {/* {new Intl.NumberFormat("en-US").format(usage?.leadsCredits)} */}
                </Typography>
              )}
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: "13px",
                  lineHeight: "16.38px",
                  color: "#8181B0",
                  mt: 0.5,
                }}
              >
                Total leads balance left:
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: { xs: "100%", sm: "48%" },
              p: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {" "}
              <Total />
            </Box>
            <Box
              sx={{
                display: "flex",
                width: "calc(100% - 44px)",
                justifyContent: "flex-end",
                alignItems: "flex-start",
                flexDirection: "row-reverse",
                ml: 1.5,
                gap: 1,
              }}
            >
              {isLoadingUsage ? (
                <CircularProgress size={25} thickness={5} />
              ) : (
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: "#28287B",
                    fontWeight: 700,
                    lineHeight: "25.2px",
                  }}
                >
                  {usage?.activeLeads - usage?.usedActiveLeads > 0
                    ? new Intl.NumberFormat("en-US").format(
                        usage?.activeLeads - usage?.usedActiveLeads
                      )
                    : 0}
                </Typography>
              )}
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: "13px",
                  lineHeight: "16.38px",
                  color: "#8181B0",
                  mt: 0.5,
                }}
              >
                Total stored leads limit left:
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: { xs: "100%", sm: "48%" },
              p: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {" "}
              <Total />
            </Box>
            <Box
              sx={{
                display: "flex",
                width: "calc(100% - 44px)",
                justifyContent: "flex-end",
                alignItems: "flex-start",
                flexDirection: "row-reverse",
                ml: 1.5,
                gap: 1,
              }}
            >
              {isLoadingUsage ? (
                <CircularProgress size={25} thickness={5} />
              ) : (
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: "#28287B",
                    fontWeight: 700,
                    lineHeight: "25.2px",
                  }}
                >
                  {usage?.dailyLeadsCredits > 0
                    ? new Intl.NumberFormat("en-US").format(
                        usage?.dailyLeadsCredits 
                      )
                    : 0}
                </Typography>
              )}
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: "13px",
                  lineHeight: "16.38px",
                  color: "#8181B0",
                  mt: 0.5,
                }}
              >
                Daily Download leads limit:
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>

      <Divider
        sx={{ color: "#E4E4E5", mb: 1, borderBottomWidth: 2, width: "100%" }}
        orientation="horizontal"
      />
      <Grid
        item
        xs={12}
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}
      >
        <Button
          onClick={() => {
            setLeadCreditDialogOpen(true);
            setLeadCreditTab("usage");
          }}
          sx={{
            width: "47%",
            height: "100%",
            p: 1,
            border: "1px solid #E4E4E5",
            borderRadius: "8px",
            color: "#28287B",
            fontSize: "13px",
            fontWeight: "700",
          }}
          startIcon={!isMobile && <RemoveRedEyeOutlined />}
        >
          {isMobile ? "Leads Usage" : "View Leads Usage"}
        </Button>
        <Button
          onClick={() => {
            setLeadCreditDialogOpen(true);
            setLeadCreditTab("download summary");
            fetchDownloadedData();
          }}
          sx={{
            width: "47%",
            height: "100%",
            p: 1,
            border: "1px solid #E4E4E5",
            borderRadius: "8px",
            color: "#28287B",
            fontSize: "13px",
            fontWeight: "700",
          }}
          startIcon={!isMobile && <DownloadForOfflineOutlined />}
        >
          Downloads Summary
        </Button>
        {/* <Button
          onClick={() => {
            setLeadCreditDialogOpen(true);
            setLeadCreditTab("enrichment");
            // fetchDownloadedData();
          }}
          sx={{
            width: "47%",
            height: "100%",
            p: 1,
            border: "1px solid #E4E4E5",
            borderRadius: "8px",
            color: "#28287B",
            fontSize: "13px",
            fontWeight: "700",
          }}
          startIcon={!isMobile &&  <AddCircleOutlineOutlinedIcon />}
        >
          Enrichment
        </Button> */}
      </Grid>
    </Grid>
  );
};

const ToggleComponent = ({ alignment, handleChange, isMobile }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: { xs: 0, md: "1rem" },
        px: { xs: 2, md: 0 },
      }}
    >
      <ToggleButtonGroup
        color="primary"
        value={alignment}
        exclusive
        onChange={handleChange}
        aria-label="Platform"
        sx={{
          //flexDirection: isToggleMobile ? "column" : "row",
          flexDirection: "row",
          width: "100%",
        }}
      >
        <ToggleButton
          value="People"
          sx={{
            // borderRadius: isToggleMobile ? "20px 20px 0 0" : "20px 0 0 20px",
            borderRadius: "20px 0 0 20px",
            width: "100%",
            border: "2px solid #216fed",
            height: "2rem",
          }}
        >
          People
        </ToggleButton>
        <ToggleButton
          value="Companies"
          sx={{
            // borderRadius: isToggleMobile ? "0 0 20px 20px" : "0 20px 20px 0",
            borderRadius: "0 20px 20px 0",
            width: "100%",
            border: "2px solid #216fed",
            height: "2rem",
          }}
        >
          Companies
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

const FilterColumn = ({
  filterCount,
  handleClear,
  clearLocation,
  setClearLocation,
  isSavingSearch,
  handleSaveSearchClick,
  handleShowAllSavedSearchClick,
  filter,
  handleFilterChange,
  height,
  alignment,
  delayedSearch,
  prevFilter,
  onKeyPressSearch,
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: height,
        backgroundColor: "white",
        p: 2,
        pt: 0,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        boxShadow: "0px 12px 15px 0px #4B71970D",
        borderRadius: "12px",
        flexDirection: "column",
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
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          position: "sticky",
          top: 0,
          zIndex: 999,
          backgroundColor: "white",
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            mb: 1,
          }}
        >
          {" "}
          <Typography
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "18px",
              letterSpacing: "0px",
              color: "#28287B",
            }}
          >
            Filters{" "}
            {filterCount !== 0 && (
              <Typography
                sx={{
                  color: "white",
                  backgroundColor: "#FF5C1F",
                  borderRadius: "100px",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  ml: 0.5,
                  fontSize: "10px",
                  fontWeight: 700,
                  lineHeight: "13px",
                  letterSpacing: "0em",
                }}
              >
                {filterCount}
              </Typography>
            )}
            <Typography
              onClick={handleClear}
              sx={{
                display: !filterCount && "none",
                fontSize: "13px",
                fontWeight: 700,
                lineHeight: "16px",
                letterSpacing: "0px",
                color: "#0071F6",
                cursor: "pointer",
                ml: 1.5,
              }}
            >
              Clear
            </Typography>
          </Typography>
          <Button
            variant="contained"
            sx={{
              marginLeft: "auto",
              padding: "2px 6px",
              backgroundColor: "#216fed",
              color: "white",
              fontSize: "13px",
              fontWeight: 700,
              lineHeight: "20px",
            }}
            disabled={isEqual(filter, prevFilter)}
            onClick={delayedSearch}
          >
            Search
          </Button>
        </Box>

        <Box sx={{ display: "flex", width: "100%" }}>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            sx={{ fontSize: "13px", fontWeight: 700, lineHeight: "20px", mr: 1 }}
            onClick={handleShowAllSavedSearchClick}
          >
            All Saved
          </Button>
          <Button
            variant="contained"
            fullWidth
            size="small"
            sx={{ fontSize: "13px", fontWeight: 700, lineHeight: "20px" }}
            disabled={filterCount === 0 || isSavingSearch}
            onClick={handleSaveSearchClick}
          >
            Save Filter
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width: "100%",
          mt: 0,
        }}
      >
        <FilterBlock
          filter={filter}
          onChange={handleFilterChange}
          clearLocation={clearLocation}
          setClearLocation={setClearLocation}
          category={alignment}
          onKeyPressSearch={onKeyPressSearch}
        />
      </Box>
    </Box>
  );
};

const Page = () => {
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const isInitialRender = useRef(true);
  const serachDataFromRedux = useSelector((state) => state?.search);
  const store = useStore()

  const {
    total,
    selectedRows,
    leads,
    companies,
    filter,
    companyFilter,
    companiesTotal,
    alignment,
    shouldTrigger,
    infinityToasterId,
  } = serachDataFromRedux || {};

  const isCompanyTab = alignment === "Companies";
  let usedLeads = leads;
  let usedFilter = filter;
  let usedTotal = total;

  if (isCompanyTab) {
    usedLeads = companies;
    usedFilter = companyFilter;
    usedTotal = companiesTotal;
  }

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [rowClickedId, setRowClickedId] = useState(null);
  const [prevFilter, setPrevFilter] = useState({});
  const [clearLocation, setClearLocation] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [findLeads, { isLoading: isFindLeadsLoading }] = useFindLeadsMutation();
  const [findCompanies, { isLoading: isfindCompaniesLoading }] = useFindCompaniesMutation();
  const { data: searches, isLoading: isGetSearchesLoading } = useGetSearchesQuery();
  const { data: campaigns } = useGetCampaignsQuery({
    unibox: true,
  });
  const campaignsList = campaigns?.updatedEmail?.map((e) => e?._doc) || [];
  const { data: downloadFiles, refetch: refetchSavedFiles } = useGetSavedFilesQuery();
  const { data: usage, isLoading: isLoadingUsage, refetch: refetchUsage } = useBillingUsageQuery();
  const { data: leadUsage, refetch: refetchLeadUsage } = useGetLeadsUsageQuery();
  const [leadCreditDialogOpen, setLeadCreditDialogOpen] = useState(false);
  const [leadCreditTab, setLeadCreditTab] = useState("");
  
  const [leadEnrichmentTab, setLeadEnrichmentTab] = useState("");

  const [currentResults, setCurrentResults] = useState(false);
  const filterCount = Object.keys(filterObject(usedFilter)).length;
  const prevCOunt = Object.keys(filterObject(prevFilter)).length;
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const handleChange = (event, newAlignment) => {
    if (newAlignment) {
      if (newAlignment === "Companies") {
        setPrevFilter(companyFilter);
      } else {
        setPrevFilter(filter);
      }
      dispatch(
        setSeachData({
          ...serachDataFromRedux,
          alignment: newAlignment,
        })
      );
    }
  };
  useEffect(() => {
    if (currentResults === true) {
      refetchUsage();
    }
  }, [currentResults]);

  useEffect(() => {
    refetchUsage();
    refetchLeadUsage();
    refetchSavedFiles();
  }, [refetchUsage, refetchSavedFiles, refetchLeadUsage]);

  const companyColumns = [
    {
      field: "name",
      headerName: "Name",
      //  width: 230,
      width: 227,
    },
    {
      field: "primary_domain",
      headerName: "Email Domain",
      //  width: 160,
      width: 223,
    },
    // {
    //   field: "industry_str",
    //   headerName: "Industry",
    //   //  width: 142,
    //   width: 232,
    // },
    {
      field: "founded_year",
      headerName: "Founded Year",
      width: 223,
    },
    {
      field: "crunchbase_url",
      headerName: "CrunchBase URL",
      // width: 130,
      width: 223,
    },
    {
      field: "action",
      headerName: "Action",
      // width: 160,
      width: 179,
      renderCell: (params) => (
        <Button
        variant="contained"
        color="primary"
        onClick={() => handleEmployeesSearchClick(params)}
        >
          Search Employees
        </Button>
      ),
    },
  ];

  const handleEmployeesSearchClick = (params) => {
    dispatch(
      setSeachData({
        ...serachDataFromRedux,
        leads: [],
        filter: { employer: [`${params?.row?.id}`], searchName: [`${params?.row?.name}`] }, // Passing Id instead of company_ID
        shouldTrigger: true,
        selectedRows: true,
        alignment: "People",
      })
    );
  };

  const delayedSearch = debounce(async () => {
    try {
      setPrevFilter(usedFilter);
      if (filterCount === 0) {
        if (alignment == "People") {
          dispatch(
            setSeachData({
              ...serachDataFromRedux,
              total: 0,
              leads: [],
            })
          );
        } else if(alignment == "Companies"){
          dispatch(
            setSeachData({
              ...serachDataFromRedux,
              total: 0,
              companies: [],
            })
          );
        }
        return;
      }
      if (alignment == "People") {
        const { pagination, people } = await findLeads({
          start: paginationModel.pageSize * paginationModel.page + 1,
          page_size: paginationModel.pageSize,
          query: usedFilter,
        }).unwrap();
        window.Intercom("trackEvent", "Leads searched");
        dispatch(
          setSeachData({
            ...serachDataFromRedux,
            total: pagination.total_entries,
            leads: people,
            shouldTrigger: false,
          })
        );
      } else if (alignment == "Companies") {
        const { pagination, companies } = await findCompanies({
          start: paginationModel.pageSize * paginationModel.page + 1,
          page_size: paginationModel.pageSize,
          query: usedFilter,
        }).unwrap();
        window.Intercom("trackEvent", "Leads searched");
        dispatch(
          setSeachData({
            ...serachDataFromRedux,
            companiesTotal: pagination.total_entries,
            companies: companies,
            shouldTrigger: false,
          })
        );
      } else {
        dispatch(
          setSeachData({
            ...serachDataFromRedux,
            shouldTrigger: false,
          })
        );
      }
    } catch (error) {}
  }, 0);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    delayedSearch();
    return () => {
      delayedSearch.cancel();
    };
  }, [paginationModel]);

  useEffect(() => {
    const footer = document.getElementsByClassName("MuiTablePagination-displayedRows")[0];
    if (footer) {
      const prefix = footer?.textContent?.split("of ")?.[0];
      const suffix = footer?.textContent?.split("of ")?.[1];

      if (suffix) {
        let cleanText = suffix.replace(/[,]/g, "");

        let value = new Intl.NumberFormat("en-US").format(Number(cleanText));

        footer.innerText = `${prefix} of ${value}`;
      }
    }
  },[]);
  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };
  const handleFilterChange = (key, value, shouldTriggerSearch = false) => {
    const updatedFilter = filterObject({ ...filter, [key]: value });
    if (alignment === "Companies") {
      const updatedCompanyFilters = filterObject({ ...companyFilter, [key]: value });
      if (!isEqual(companyFilter, updatedCompanyFilters)) {
        const filterLength = Object.keys(companyFilter)?.length;
        dispatch(
          setSeachData({
            ...serachDataFromRedux,
            companyFilter: updatedCompanyFilters,
            shouldTrigger: shouldTriggerSearch,
            ...(filterLength === 0 && { companies: [] }),
          })
        );
      }
    } else {
      if (!isEqual(filter, updatedFilter)) {
        const filterLength = Object.keys(updatedFilter)?.length;
        dispatch(
          setSeachData({
            ...serachDataFromRedux,
            filter: updatedFilter,
            selectedRows: [],
            shouldTrigger: shouldTriggerSearch,
            ...(filterLength === 0 && { leads: [] }),
          })
        );
      }
    }
  };

  useEffect(() => {
    if (shouldTrigger) {
      delayedSearch();
    }
  }, [shouldTrigger]);

  const handleClear = () => {
    setPaginationModel({ page: 0, pageSize: 25 });
    if (alignment === "Companies") {
      dispatch(
        setSeachData({
          ...serachDataFromRedux,
          companies: [],
          companyFilter: {},
          companiesTotal: 0,
        })
      );
    } else {
      toast.remove(infinityToasterId);
      dispatch(
        setSeachData({
          ...serachDataFromRedux,
          leads: [],
          filter: {},
          total: 0,
          selectedRows: [],
          infinityToasterId: null,
        })
      );
    }
    setPrevFilter({});
    setClearLocation(true);
  };

  const [isLeadDetailDrawerOpen, setIsLeadDetailDrawerOpen] = useState(false);

  const handleLeadDetailDrawerClose = () => {
    setIsLeadDetailDrawerOpen(false);
  };

  const handleSearchClick = (query) => {
    setIsAllSavedSearchDrawerOpen(false);
    dispatch(
      setSeachData({
        ...serachDataFromRedux,
        filter: query,
        shouldTrigger: true,
        selectedRows: [],
        alignment: "People",
      })
    );
  };

  // all saved search
  const [isAllSavedSearchDrawerOpen, setIsAllSavedSearchDrawerOpen] = useState(false);

  const [
    triggerGetAllSavedSearches,
    { data: savedSearches, isFetching: isFetchingAllSavedSearches },
  ] = useLazyGetAllSavedSearchesQuery();

  const handleShowAllSavedSearchClick = () => {
    setIsAllSavedSearchDrawerOpen(true);
    triggerGetAllSavedSearches();
  };

  const handleAllSavedSearchDrawerClose = () => {
    setIsAllSavedSearchDrawerOpen(false);
  };

  // save & edit search
  const [searchId, setSearchId] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [isSavedSearchDialogOpen, setIsSavedSearchDialogOpen] = useState(false);

  const [createSavedSearch, { isLoading: isCreatingSavedSearch }] = useCreateSavedSearchMutation();
  const [updateSearch, { isLoading: isUpdatingSearch }] = useUpdateSearchMutation();
  const isSavingSearch = isCreatingSavedSearch || isUpdatingSearch;

  const getSearchName = () => Object.values(usedFilter).flat().slice(0, 3).join(", ");

  const handleSaveSearchClick = () => {
    const searchName = getSearchName();
    setSearchName(searchName);
    setSearchId(null);
    setIsSavedSearchDialogOpen(true);
  };

  const handleEditSearchClick = (id) => {
    const search = searches.saved.find((s) => s._id === id);
    setSearchName(search.name);
    setSearchId(id);
    setIsSavedSearchDialogOpen(true);
  };

  const handleSaveSearchDialogSave = async () => {
    if (isSavingSearch) return;
    try {
      if (searchId) {
        const { message } = await updateSearch({
          id: searchId,
          data: { name: searchName },
        }).unwrap();
        toast.success(message);
      } else {
        const { message } = await createSavedSearch({
          name: searchName,
          query: usedFilter,
        }).unwrap();
        window.Intercom("trackEvent", "Leads saved");
        toast.success(message);
        setCurrentResults(true);
      }
    } catch (error) {
      toast.error(error.data.error.message);
    } finally {
      setIsSavedSearchDialogOpen(false);
      setCurrentResults(false);
    }
  };

  const handleSaveSearchDialogClose = () => {
    setIsSavedSearchDialogOpen(false);
  };

  // add to campaign
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCampaign, setIsCampaign] = useState(false);
  const [checkDuplicates, setCheckDuplicates] = useState(false);
  const [isAddToCampaignDialogOpen, setIsAddToCampaignDialogOpen] = useState(false);

  const [addLeadsToCampaign] = useAddLeadsToCampaignMutation();

  const handleAddToCampaignClick = () => {
    setIsAddToCampaignDialogOpen(true);
    setIsLeadDetailDrawerOpen(false);
  };

  const handleAddToCampaignDialogSave = async () => {
    setIsAddToCampaignDialogOpen(false);
    setIsCampaign(true);

    if (selectedRows.length > dailyLeadsCredits) {
      const toastId = toast.error(`Add to Campaign Leads is larger than Daily Limit ${selectedRows.length}...`);
      return;
    }
    
    const toastId = toast.loading(`${selectedRows.length} Leads Adding to campaign`, { duration: Infinity });

    try {
      const { message } = await addLeadsToCampaign({
        campaignId: selectedCampaign,
        leads: selectedRows,
        checkDuplicates,
      }).unwrap();
      toast.success(message, { id: toastId, duration: 2000 });
      setIsCampaign(false);
      window.Intercom("trackEvent", "Leads added to Campaign");
      setCurrentResults(true);
    } catch (error) {
      toast.error(error.data.error.message, { id: toastId, duration: 2000 });
      setCurrentResults(false);
      setIsCampaign(false);
    }
  };

  const handleAddToCampaignDialogClose = () => {
    setIsAddToCampaignDialogOpen(false);
  };

  // download CSV
  const [lookupLeads] = useLookupLeadsMutation();
  const [saveDownloadCsv] = useSaveDownloadCsvMutation();

  const handleDownloadCsvClick = async () => {
   if (selectedRows.length > dailyLeadsCredits) {
    const toastId = toast.error(`Download Leads is larger than Daily Limit ${selectedRows.length}...`);
    return;
  }
   const toastId = toast.loading(`Processing ${selectedRows.length} contacts...`, {
    duration: Infinity,
  });

    const searchName = getSearchName();
    try {
      const { message } = await lookupLeads({ leads: selectedRows, name: searchName }).unwrap();
      toast.success(message, { id: toastId, duration: 2000 });
    } catch (error) {
      toast.error(error.data.error.message, { id: toastId, duration: 2000 });
    }
  };

  const fetchDownloadedData = async () => {
    refetchSavedFiles();
    refetchUsage();
    refetchLeadUsage();
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (leadCreditDialogOpen === true && leadCreditTab === "download summary") {
        debounceRefetchSavedFiles();
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [leadCreditDialogOpen, leadCreditTab]);

  const debounceRefetchSavedFiles = debounce(() => {
    refetchSavedFiles();
  }, 500);

  const saveToCsv = async (name, leads) => {
    await saveDownloadCsv({
      data: {
        name: name,
        data: leads,
      },
    });
  };

  const handelDowloadCsv = (item) => {
    downloadCsv(item.name, item.data);
  };

  const slotPropStyles = {
    panel: {
      sx: {
        "& .MuiDataGrid-filterForm": {
          borderRadius: "8px",
          p: "15px",
          flexDirection: "column",
          border: `1px solid ${theme.palette.grey[300]}`,
          gap: 2,
          pt: 2,
        },
        "& .MuiDataGrid-filterFormColumnInput, .MuiDataGrid-filterFormOperatorInput": {
          width: "100%",

          "& div": {
            p: 1,
            borderRadius: "8px",

            border: `1px solid ${theme.palette.grey[300]}`,
            "&:hover": {
              border: `1px solid #28287B`,
            },
            "&:before": { borderBottom: "none" },
            "&:after": { borderBottom: "none" },
            "&:hover:before": {
              borderBottom: "none",
            },
          },
        },

        "& .MuiDataGrid-filterFormValueInput": {
          width: "100%",

          "& div div": {
            p: 1,
            borderRadius: "8px",

            border: `1px solid ${theme.palette.grey[300]}`,
            "&:hover": {
              border: `1px solid #28287B`,
              "&:before": {
                borderBottom: "none",
              },
            },
            "&:before": { borderBottom: "none" },
            "&:after": { borderBottom: "none" },
          },
        },
        "& .MuiDataGrid-filterFormDeleteIcon": {
          position: "absolute",
          top: 0,
          right: 0,
          width: 30,
        },
        "& .MuiDataGrid-panelHeader div ": {
          m: 0,
          "& .MuiFormLabel-root.MuiInputLabel-root": { display: "none" },
          "& .MuiInput-input": {
            padding: "10px",
            borderRadius: "8px",
            border: `1px solid ${theme.palette.grey[300]}`,
            "&:hover:not(.Mui-disabled, .Mui-error)": {
              border: `1px solid ${theme.palette.grey[700]}`,
            },
          },
          "&:before": { borderBottom: "none" },
          "&:after": { borderBottom: "none" },
          "&:hover:before": {
            borderBottom: "none",
          },
        },

        "& .MuiDataGrid-columnsPanel": {
          px: 2,
          py: 0,
          "& .MuiDataGrid-columnsPanelRow": {
            "& label": {
              width: "100%",
              display: "flex",
              flexDirection: "row-reverse",
              justifyContent: "space-between",
              m: 0,
              "& .MuiSwitch-track": {
                backgroundColor: theme.palette.grey[300],
              },
              "& .Mui-checked+.MuiSwitch-track": {
                backgroundColor: "#34C759",
              },
            },
          },
        },
        "& .MuiDataGrid-panelFooter": {
          px: 2,
        },
      },
    },

    columnMenu: {
      sx: {
        "& .MuiDivider-root": { margin: 0, display: "none" },
        "& .MuiTypography-root": {
          fontSize: "13px",
          fontWeight: "700",
          color: "#28287B",
        },
        "& .MuiSvgIcon-root": { fill: "#28287B" },
        "& .MuiMenuItem-root": {
          my: 1,
          mx: 2,
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: theme.palette.grey[200],
            "& .MuiSvgIcon-root": { fill: theme.palette.primary.main },
            "& .MuiTypography-root": {
              color: theme.palette.primary.main,
            },
          },
        },
      },
    },
    footer: {
      sx: {
        "& .MuiDataGrid-selectedRowCount, .MuiTablePagination-selectLabel,.MuiSelect-select.MuiInputBase-input, .MuiTablePagination-displayedRows":
          {
            fontSize: "14px",
            fontWeight: "700",
            color: "#28287B",
          },
      },
    },
  };
  const dataGridStyles = {
    width: "100%",
    "& .MuiDataGrid-columnSeparator": { display: "none" },
    "& .MuiDataGrid-virtualScroller": { marginTop: "-2px" },
    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
      // background: "#f1f1f1",
    },
    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.grey[300],
    },
    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover": {
      background: theme.palette.grey[400],
    },
    "& .MuiList-root.MuiMenu-list": {
      width: "100px",
    },
  };

  const [formattedNumber, setFormattedNumber] = useState(0);
  const leadsCredits = usage?.leadsCredits;
  const dailyLeadsCredits = usage?.dailyLeadsCredits;
  // const leadsCredits = 5;

  useEffect(() => {
    if (typeof leadsCredits === "number") {
      const formatted = new Intl.NumberFormat("en-US").format(leadsCredits);
      setFormattedNumber(formatted);
    } else {
      setFormattedNumber(0);
    }
  }, [leadsCredits]);

  const { verified } = useUserVerifyCheck();
  // select all dropdown
  const [anchorEl, setAnchorEl] = useState(null);
  const [lastErrorToast, setLastErrorToast] = useState(null);
  const [selectFirstResults, setSelectFirstResults] = useState(25);
  const [selectMenuDropdown, setSelectMenuDropdown] = useState({
    selectPage: false,
    selectAll: false,
    selectFirst: false,
  });

  const handleSelectAllClick = (checked) => {
    if (selectedRows?.length > 0) {
      dispatch(
        setSeachData({
          ...serachDataFromRedux,
          selectedRows: [],
        })
      );
      return;
    }
    setAnchorEl(checked.currentTarget);

    setSelectMenuDropdown((prev) => ({
      selectPage: false,
      selectAll: false,
      selectFirst: false,
    }));
  };

  const handleSelectMenuOption = async (option) => {
    switch (option) {
      case 0:
        // leads left restriction check
        if (leads?.length > leadsCredits || leads?.length > dailyLeadsCredits) {
          const toastId = toast.error(
            `You don't have enough lead balance to select ${leads.length} leads`,
            {
              duration: 2000,
              id: lastErrorToast,
            }
          );
          setLastErrorToast(toastId);
          return;
        }

        setSelectMenuDropdown((prev) => ({
          ...prev,
          selectPage: true,
        }));
        dispatch(
          setSeachData({
            ...serachDataFromRedux,
            selectedRows: usedLeads.map((lead) => lead.id),
          })
        );
        setAnchorEl(false);
        break;

      case 1:
        if (leadsCredits < 10000) {
          const toastId = toast.error(
            `You don't have enough lead balance to select 10000 leads`,
            {
              duration: 2000,
              id: lastErrorToast,
            }
          );
          setLastErrorToast(toastId);
          return;
        }
        let current = leadsCredits;
        if(current > total && usedLeads?.length >= total){          
         
          dispatch(
              setSeachData({
                ...serachDataFromRedux,
                selectedRows: usedLeads.map((lead) => lead.id),
              })
            );
            setAnchorEl(false);
            setSelectMenuDropdown((prev) => ({
              ...prev,
              selectAll: true,
            }));
          } else {
          const toastId = toast.loading(
            `Processing ${total >= current ? current : total} contacts, This may take a while`,
            {
              duration: Infinity,
            }
          );
          dispatch(
            setSeachData({
              ...serachDataFromRedux,
              infinityToasterId: toastId,
            })
          );

          setAnchorEl(false);
          setSelectMenuDropdown((prev) => ({
            ...prev,
            selectAll: true,
          }));

          await findAllLeads({
            all_results: true,
            start: 1,
            page_size: paginationModel?.pageSize,
            totalSelected: total > current ? current : total,
            query: usedFilter,
          }, toastId);
          const {search} = store.getState();
          if(toastId === search?.infinityToasterId){
          toast.success("Processed Successfully", { id: toastId, duration: 2000 });
          } else {
            toast.remove(toastId)
          }
        }
        break;

      case 2:
        if (selectFirstResults > leadsCredits) {
          const toastId = toast.error(
            `You don't have enough lead balance to select ${selectFirstResults} leads`,
            {
              duration: 2000,
              id: lastErrorToast,
            }
          );
          setLastErrorToast(toastId);
          return;
        }

        if (selectFirstResults > usedLeads?.length) {
          const toastId = toast.loading(
            `Processing ${selectFirstResults} contacts, This may take a while`,
            {
              duration: Infinity,
            }
          );
          dispatch(
            setSeachData({
              ...serachDataFromRedux,
              infinityToasterId: toastId,
            })
          );
          setAnchorEl(false);

          const { people, pagination } = await findLeads({
            all_results: true,
            start: 1,
            end: selectFirstResults,
            totalSelected: selectFirstResults,
            page_size: paginationModel?.pageSize,
            query: usedFilter,
          }).unwrap();
          const {search} = store.getState();
          if(toastId === search?.infinityToasterId){
            dispatch(
              setSeachData({
                ...serachDataFromRedux,
                total: pagination.total,
                leads: people,
                selectedRows: people.map((lead) => lead.id),
              })
            );
          toast.success("Processed Successfully", { id: toastId, duration: 2000 });
          } else {
            toast.remove(toastId)
          }
        } else {
          setAnchorEl(false);
          dispatch(
            setSeachData({
              ...serachDataFromRedux,
              selectedRows: usedLeads.slice(0, selectFirstResults).map((lead) => lead.id),
            })
          );
        }

        break;
      default:
        break;
    }
  };

  const findAllLeads = async (params, toastId) => {
    const { pagination, people } = await findLeads(params).unwrap();
    const {search} = store.getState();
    if (search?.infinityToasterId === toastId) {
      let selectedLeads =  [...people];
      if(people?.length > leadsCredits ){
        selectedLeads = selectedLeads.slice(0, leadsCredits)
      }
      dispatch(
        setSeachData({
          ...serachDataFromRedux,
          total: pagination.total,
          leads: people,
          selectedRows: selectedLeads?.map((lead) => lead.id),
        })
      );
    }
  };

  const onKeyPressSearch = (event) => {
    if (event?.code === "Enter") {
      delayedSearch();
    }
  };

  const handleSelectFirstResults = (e) => {
    const enteredValue = Number(e.target.value);
    // add a chaeck in selection as per lead balance
    if (enteredValue > leadsCredits || enteredValue > dailyLeadsCredits) {
      if (enteredValue > dailyLeadsCredits) {
        toast.error(`You don't have enough daily lead balance to select ${enteredValue} leads`, {
          duration: 2000,
          id: lastErrorToast,
        });
      } else {
        toast.error(`You don't have enough lead balance to select ${enteredValue} leads`, {
          duration: 2000,
          id: lastErrorToast,
        });
      }
    } else {
      setSelectFirstResults(enteredValue);
    }
  };
  
  
  const handleSetSelectedRows = (data) => {
    if (leadsCredits < data?.length) {
      const toastId = toast.error(
        `You don't have enough lead balance to select ${data.length} leads`,
        {
          duration: 2000,
          id: lastErrorToast,
        }
      );
      setLastErrorToast(toastId);
      return;
    }
    dispatch(
      setSeachData({
        ...serachDataFromRedux,
        selectedRows: data,
      })
    );
  };

  return (
    <>
      {
        {
          verified: (
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
                    // height: "calc(100vh - 134px)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <Grid
                    container
                    sx={
                      {
                        // width: "100%",
                        // display: "flex",
                        // justifyContent: "space-between",
                        // alignItems: "center",
                      }
                    }
                  >
                    <Grid
                      item
                      xs={12}
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#28287B",
                          fontSize: "32px",
                          fontWeight: 700,
                          lineHeight: "40px",
                          letterSpacing: "0px",
                        }}
                      >
                        Lead Finder
                      </Typography>
                      {/* <IconButton
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          "&:hover": {
                            backgroundColor: theme.palette.primary.main,
                          },
                        }}
                        onClick={() => setShowUsage(!showUsage)}
                      >
                        <ReceiptLongOutlined />
                      </IconButton> */}
                      {/* filter toggle button */}
                      <Box
                        sx={{
                          display: { md: "none", xs: "flex" },
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          onClick={handleFilterToggle}
                          sx={{ py: 0.5, px: 1 }}
                          variant="outlined"
                        >
                          <Typography>Filter</Typography>
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid container columnSpacing={3} sx={{ height: "100%", mt: 2 }}>
                    <Drawer
                      open={isMobile ? filterOpen : false}
                      variant="temporary"
                      onClose={() => setFilterOpen(false)}
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
                        <IconButton onClick={() => setFilterOpen(false)}>
                          <CloseOutlined />
                        </IconButton>
                      </Box>
                      <ToggleComponent
                        alignment={alignment}
                        handleChange={handleChange}
                        isMobile={isMobile}
                      />

                      <FilterColumn
                        filterCount={filterCount}
                        handleClear={handleClear}
                        clearLocation={clearLocation}
                        setClearLocation={setClearLocation}
                        isSavingSearch={isSavingSearch}
                        handleSaveSearchClick={handleSaveSearchClick}
                        handleShowAllSavedSearchClick={handleShowAllSavedSearchClick}
                        filter={usedFilter}
                        handleFilterChange={handleFilterChange}
                        height="92%"
                        alignment={alignment}
                        delayedSearch={delayedSearch}
                        prevFilter={prevFilter}
                        onKeyPressSearch={onKeyPressSearch}
                      />
                    </Drawer>

                    <Grid item xs={3} sx={{ height: "100%", display: { xs: "none", md: "block" } }}>
                      <ToggleComponent
                        alignment={alignment}
                        handleChange={handleChange}
                        isMobile={isMobile}
                      />

                      <FilterColumn
                        filterCount={filterCount}
                        handleClear={handleClear}
                        clearLocation={clearLocation}
                        setClearLocation={setClearLocation}
                        isSavingSearch={isSavingSearch}
                        handleSaveSearchClick={handleSaveSearchClick}
                        handleShowAllSavedSearchClick={handleShowAllSavedSearchClick}
                        filter={usedFilter}
                        handleFilterChange={handleFilterChange}
                        // height="calc(100vh - 140px)"
                        height={"calc(100vh - 170px)"}
                        alignment={alignment}
                        delayedSearch={delayedSearch}
                        prevFilter={prevFilter}
                        onKeyPressSearch={onKeyPressSearch}
                      />
                    </Grid>

                    <Grid item xs={12} md={9} sx={{ height: "100%" }}>
                      <LeadInfo
                        isLoadingUsage={isLoadingUsage}
                        formattedNumber={formattedNumber}
                        usage={usage}
                        setLeadCreditDialogOpen={setLeadCreditDialogOpen}
                        setLeadCreditTab={setLeadCreditTab}
                        fetchDownloadedData={fetchDownloadedData}
                        isMobile={isMobile}
                        theme={theme}
                      />
                      <Box
                        sx={{
                          width: "100%",
                          // height: "calc(100vh - 140px)",
                          height: {
                            xs: "100%",
                            sm: "calc(100vh - 262px)",
                          },
                          backgroundColor: "white",
                          p: 2,
                          pb: 0,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          boxShadow: "0px 12px 15px 0px #4B71970D",
                          borderRadius: "12px",
                          mt: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", width: "100%", height: "100%" }}>
                          <Box
                            sx={{
                              display: "flex",
                              width: "100%",
                              overflowY: "auto",
                            }}
                          >
                            {!prevCOunt && !usedLeads?.length ? (
                              <>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "flex-start",
                                    p: 2,
                                    width: "100%",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      flexDirection: "column",
                                      width: 420,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                      <LFSearchHero />
                                    </Box>
                                    <Typography
                                      sx={{
                                        fontSize: "16px",
                                        fontWeight: 700,
                                        lineHeight: "24px",
                                        letterSpacing: "0em",
                                        color: "#28287B",
                                        textAlign: "center",
                                        mt: 3,
                                      }}
                                    >
                                      Start your search by applying filters on the left side, or use
                                      presets below:
                                    </Typography>
                                    <Grid container columnSpacing={2} rowSpacing={2} sx={{ mt: 2 }}>
                                      <Grid item xs={12} sm={6}>
                                        <SavedSearchBlock
                                          searches={searches}
                                          isLoading={isGetSearchesLoading}
                                          onSearchClick={handleSearchClick}
                                          onEditSearchClick={handleEditSearchClick}
                                        />
                                        {searches?.saved?.length !== 0 && (
                                          <>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                                alignItems: "center",
                                                width: "100%",
                                                mt: 1,
                                              }}
                                            >
                                              <Typography
                                                sx={{
                                                  color: "#0071F6",
                                                  cursor: "pointer",
                                                  "&:hover": {
                                                    color: "#164694",
                                                  },
                                                  mr: 0.5,
                                                  fontSize: "13px",
                                                  fontWeight: 700,
                                                  lineHeight: "16px",
                                                }}
                                                onClick={handleShowAllSavedSearchClick}
                                              >
                                                Show all
                                              </Typography>
                                            </Box>
                                          </>
                                        )}
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <RecentSearchBlock
                                          searches={searches}
                                          isLoading={isGetSearchesLoading}
                                          onSearchClick={handleSearchClick}
                                        />
                                      </Grid>
                                    </Grid>
                                  </Box>
                                </Box>
                              </>
                            ) : (
                              <>
                                <Box
                                  sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  {alignment == "People" ? (
                                    <Box
                                      sx={{
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        justifyContent: "space-between",
                                        alignItems: { xs: "flex-start", sm: "center" },
                                        mb: 2,
                                        gap: 2,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <Checkbox
                                          onChange={handleSelectAllClick}
                                          checked={selectedRows.length > 0}
                                        />

                                        <Box>
                                          <Menu
                                            component="div"
                                            sx={{
                                              marginRight: "1rem",
                                              "& .MuiPaper-root": {
                                                borderRadius: "8px",
                                                boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                                              },
                                            }}
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={() => {
                                              setAnchorEl(false);
                                            }}
                                            MenuListProps={{
                                              "aria-labelledby": "basic-button",
                                            }}
                                          >
                                            <MenuItem>
                                              <Checkbox
                                                onClick={() => handleSelectMenuOption(0)}
                                                checked={selectMenuDropdown.selectPage}
                                              />
                                              Select this page
                                            </MenuItem>


                                            <MenuItem>
                                              <Checkbox
                                                onClick={() => handleSelectMenuOption(2)}
                                                checked={selectMenuDropdown.selectFirst}
                                              />{" "}
                                              Select first
                                              <TextField
                                                min={0}
                                                type="number"
                                                value={selectFirstResults.toString()}
                                                onChange={handleSelectFirstResults}
                                                variant="outlined"
                                                sx={{
                                                  width: "100px",
                                                  marginX: "0.5rem",
                                                  backgroundColor: "white",
                                                  borderRadius: "8px",
                                                  "& div fieldset": {
                                                    borderRadius: "8px",
                                                  },
                                                  "& div input": {
                                                    // borderRadius: "8px",
                                                    py: 1,
                                                    fontSize: "13px",
                                                    fontWeight: 400,
                                                  },
                                                }}
                                              />{" "}
                                              results
                                            </MenuItem>
                                          </Menu>
                                        </Box>

                                        <Typography
                                          sx={{
                                            fontSize: "14px",
                                            fontWeight: 700,
                                            lineHeight: "18px",
                                            letterSpacing: "0px",
                                            color: "#28287B",
                                          }}
                                        >
                                          {new Intl.NumberFormat("en-US").format(usedTotal || selectFirstResults)} data
                                          found
                                        </Typography>
                                      </Box>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: { xs: "space-between", sm: "center" },
                                          alignItems: "center",
                                          width: { xs: "100%", sm: "fit-content" },
                                        }}
                                      >
                                        <Button
                                          sx={{
                                            p: 1.5,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                          }}
                                          variant="contained"
                                          disabled={
                                            selectedRows.length === 0 ||
                                            isFindLeadsLoading ||
                                            isfindCompaniesLoading
                                          }
                                          onClick={handleAddToCampaignClick}
                                        >
                                          <Typography
                                            sx={{
                                              fontSize: "14px",
                                              fontWeight: 700,
                                              lineHeight: "18px",
                                              letterSpacing: "0em",
                                            }}
                                          >
                                            Add to Campaign
                                          </Typography>
                                        </Button>
                                        <Button
                                          sx={{
                                            p: 1.5,
                                            ml: 2,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                          }}
                                          variant="contained"
                                          disabled={
                                            selectedRows.length === 0 ||
                                            isFindLeadsLoading ||
                                            isfindCompaniesLoading
                                          }
                                          onClick={handleDownloadCsvClick}
                                        >
                                          <Typography
                                            sx={{
                                              fontSize: "14px",
                                              fontWeight: 700,
                                              lineHeight: "18px",
                                              letterSpacing: "0em",
                                            }}
                                          >
                                            Download CSV
                                          </Typography>
                                        </Button>
                                      </Box>
                                    </Box>
                                  ) : (
                                    <></>
                                  )}
                                  <DataGrid
                                    sx={dataGridStyles}
                                    slotProps={slotPropStyles}
                                    paginationMode="server"
                                    className={classes.customDataGrid}
                                    // columns={alignment == "Companies" ? companyColumns : columns}
                                    columns={
                                      alignment === "Companies"
                                        ? companyColumns
                                        : columns.map((column) => {
                                            if (column.field === "email") {
                                              return {
                                                ...column,
                                                valueGetter: ({ row }) => "****@email.com",
                                              };
                                            }
                                            return column;
                                          })
                                    }
                                    rows={usedLeads ? usedLeads : []}
                                    // rows={usedLeads ? usedLeads.map((lead)=>{
                                    //   if(lead.organization) 
                                    //   {
                                    //     return {
                                    //       ...lead,
                                    //       organization:lead.organization.name
                                    //     }

                                    //   }
                                    // }) : []}
                                    loading={isFindLeadsLoading || isfindCompaniesLoading}
                                    pageSizeOptions={[10, 25, 50, 100]}
                                    checkboxSelection={alignment == "People" ? true : false}
                                    keepNonExistentRowsSelected
                                    rowCount={usedTotal} 
                                    onRowClick={(e) => {
                                      if (alignment == "People") {
                                        setIsLeadDetailDrawerOpen(true);
                                        setRowClickedId(e.id);
                                      }
                                    }}
                                    rowSelectionModel={alignment === "People" ? selectedRows : []}
                                    onRowSelectionModelChange={
                                      alignment === "People" && handleSetSelectedRows
                                    }
                                    paginationModel={paginationModel}
                                    onPaginationModelChange={setPaginationModel}
                                    rowSelection={alignment === "People"}
                                  />
                                </Box>
                              </>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              {/* lead detail drawer */}
              {usedLeads?.map(
                (item) =>
                  item.id === rowClickedId && (
                    <Dialog
                      // anchor="right"
                      open={isLeadDetailDrawerOpen}
                      onClose={handleLeadDetailDrawerClose}
                      sx={{
                        backgroundColor: "rgba(4, 4, 30, 0.5)",
                        "& .MuiDialog-paper": { height: { xs: "100%", md: "90vh" } },
                      }}
                      fullScreen={isMobile}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          width: { xs: "100%", md: "500px" },
                          py: 3,
                          px: 3,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "20px",
                              fontWeight: 700,
                              lineHeight: "28px",
                              letterSpacing: "0em",
                              color: "#28287B",
                            }}
                          >
                            Lead Details
                          </Typography>
                          <IconButton onClick={handleLeadDetailDrawerClose}>
                            <Close />
                          </IconButton>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            mt: 4,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-start",
                              alignItems: "center",
                            }}
                          >
                            <Avatar
                              sx={{ width: 40, height: 40, backgroundColor: "rgba(4, 4, 30, 0.1)" }}
                            >
                            {item.photo_url ? (
                            <img
                              src={item.photo_url}
                              alt="User Avatar"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 700,
                                lineHeight: "16px",
                                letterSpacing: "0em",
                                color: "#28287B",
                              }}
                            >
                              {item.name
                                .trim()
                                .split(" ")
                                .filter((word) => word.length > 0)
                                .map((word) => word[0].toUpperCase())
                                .slice(0, 2)
                                .join("")}
                            </Typography>
                          )}
                              {/* <Typography
                                sx={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  lineHeight: "16px",
                                  letterSpacing: "0em",
                                  color: "#28287B",
                                }}
                              >
                                {item.name
                                  .trim()
                                  .split(" ")
                                  .filter((word) => word.length > 0)
                                  .map((word) => word[0].toUpperCase())
                                  .slice(0, 2)
                                  .join("")}
                              </Typography> */}
                            </Avatar>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                ml: 2,
                                height: "100%",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "14px",
                                  fontWeight: 700,
                                  lineHeight: "18px",
                                  letterSpacing: "0em",
                                  color: "#28287B",
                                }}
                              >
                                {item.name}
                              </Typography>
                              <Link to={item.linkedin_url} target="_blank">
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 400,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#8181B0",
                                  }}
                                >
                                  LinkedIn
                                </Typography>
                              </Link>
                            </Box>
                          </Box>
                          <Button
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              py: 1.5,
                            }}
                            variant="contained"
                            onClick={handleAddToCampaignClick}
                          >
                            <Typography
                              sx={{
                                ml: 1,
                                fontSize: "14px",
                                fontWeight: 700,
                                lineHeight: "18px",
                                letterSpacing: "0em",
                              }}
                            >
                              Add to Campaign
                            </Typography>
                           </Button> 
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            mt: 3,
                            width: "100%",
                          }}
                        >
                          <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                              <TableBody>
                                {columns.map((column, i) => (
                                  <TableRow
                                    key={i}
                                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                  >
                                    <TableCell component="th" scope="row">
                                      <Typography
                                        sx={{
                                          fontSize: "13px",
                                          fontWeight: 500,
                                          lineHeight: "16px",
                                          letterSpacing: "0em",
                                          color: "#8181B0",
                                        }}
                                      >
                                        {column?.headerName}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="left">
                                      <Typography
                                        sx={{
                                          fontSize: "13px",
                                          fontWeight: 500,
                                          lineHeight: "16px",
                                          letterSpacing: "0em",
                                          color: "#28287B",
                                        }}
                                      >
                                         {/* {column?.valueGetter == undefined
                                          ? item[column?.field]
                                          : column?.valueGetter({ row: item })}  */}
                                          
                                          {
                                          column?.valueGetter == undefined
                                            ? column?.field === "email"
                                              ? "****@email.com"
                                              : item[column?.field]
                                            : column?.valueGetter({ row: item })
                                        }
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Box>
                    </Dialog>
                  )
              )}

              {/* all saved search drawer */}
              <Drawer
                anchor="right"
                open={isAllSavedSearchDrawerOpen}
                onClose={handleAllSavedSearchDrawerClose}
                fullScreen={isMobile}
                sx={{
                  backgroundColor: "rgba(4, 4, 30, 0.5)",
                  "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    width: { sm: "400px", xs: "100%" },
                  },
                }}
              >
                <Box sx={{ p: 2, width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: "24px",
                        letterSpacing: "0em",
                        color: "#28287B",
                        textAlign: "center",
                      }}
                    >
                      All Saved Lead Searches
                    </Typography>
                    <IconButton onClick={handleAllSavedSearchDrawerClose}>
                      <EACloseIcon />
                    </IconButton>
                  </Box>
                  {isFetchingAllSavedSearches ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {" "}
                      <CircularProgress size={32} />
                    </Box>
                  ) : (
                    savedSearches?.map((search) => (
                      <SavedSearchItem
                        key={search._id}
                        search={search}
                        onSearchClick={handleSearchClick}
                        onEditSearchClick={handleEditSearchClick}
                      />
                    ))
                  )}
                </Box>
              </Drawer>

              {/* save search dialog */}
              <Dialog
                open={isSavedSearchDialogOpen}
                onClose={handleSaveSearchDialogClose}
                sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
              >
                <DialogTitle
                  sx={{
                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: "28px",
                    color: "#28287B",
                  }}
                >
                  Save Filter
                </DialogTitle>
                <DialogContent>
                  <Typography
                    sx={{
                      width: "100%",
                      textAlign: "left",
                      fontSize: "16px",
                      fontWeight: 700,
                      lineHeight: "20px",
                      color: "#28287B",
                      mt: 2,
                    }}
                  >
                    Filter name
                  </Typography>
                  <TextField
                    autoFocus
                    fullWidth
                    variant="outlined"
                    sx={{
                      mt: 2,
                      width: 480,
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
                    name="searchName"
                    value={searchName}
                    onChange={(event) => setSearchName(event.target.value)}
                  />
                </DialogContent>
                <DialogActions sx={{ mb: 3, mx: 2 }}>
                  <Button onClick={handleSaveSearchDialogClose} variant="outlined" fullWidth>
                    Cancel
                  </Button>
                  <Button
                    disabled={!searchName.trim()}
                    onClick={handleSaveSearchDialogSave}
                    variant="contained"
                    fullWidth
                  >
                    {isSavingSearch ? (
                      <CircularProgress size={20} sx={{ color: "white" }} />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </DialogActions>
              </Dialog>

              {/* add to campaign dialog */}
              <Dialog
                open={isAddToCampaignDialogOpen}
                onClose={handleAddToCampaignDialogClose}
                sx={{
                  backgroundColor: "rgba(4, 4, 30, 0.5)",
                }}
                fullWidth
                maxWidth="xs"
              >
                <DialogTitle
                  sx={{
                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: "28px",
                    color: "#28287B",
                  }}
                >
                  Add to Campaign
                </DialogTitle>
                <DialogContent>
                  <Autocomplete
                    freeSolo
                    id="checkboxes-tags-demo"
                    options={campaignsList}
                    getOptionLabel={(option) => option?.name}
                    renderOption={(props, option) => (
                      <li
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          px: 0,
                        }}
                        {...props}
                      >
                        <Typography
                          sx={{
                            fontSize: "16px",
                            fontWeight: 500,
                            lineHeight: "24px",
                            color: "#28287B",
                          }}
                        >
                          {option?.name}
                        </Typography>
                      </li>
                    )}
                    renderTags={(value) => (
                      <Box
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "90%",
                          fontSize: "14px",
                          fontWeight: 700,
                          lineHeight: "18px",
                          letterSpacing: "0px",
                          color: "#28287B",
                        }}
                      >
                        {value}
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Campaign"
                        variant="outlined"
                        sx={{
                          backgroundColor: "white",
                          "& div": { pl: 0.3 },
                          "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                          "& div input": {
                            py: 2,
                            fontSize: "13px",
                            fontWeight: 400,
                            lineHeight: "16px",
                            letterSpacing: "0em",
                            "&::placeholder": {
                              color: "rgba(40, 40, 123, 0.5)",
                            },
                          },
                          "& label": {
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: "18px",
                            letterSpacing: "0px",
                            color: "#28287B",
                          },
                        }}
                        name="location"
                      />
                    )}
                    sx={{ width: "100%", mt: 2 }}
                    onChange={(e, option) => setSelectedCampaign(option?._id)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        icon={<OffCheckboxCustomIcon />}
                        checkedIcon={<OnCheckboxCustomIcon />}
                        checked={checkDuplicates}
                        onChange={(e, value) => setCheckDuplicates(value)}
                      />
                    }
                    label="Check for duplicates across all campaigns"
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "16px",
                        color: "#28287B",
                      },
                      mt: 2,
                    }}
                  />
                </DialogContent>
                <DialogActions
                  sx={{
                    mb: 3,
                    mx: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <Button onClick={handleAddToCampaignDialogClose} variant="outlined" fullWidth>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!selectedCampaign || isCampaign}
                    onClick={handleAddToCampaignDialogSave}
                    sx={{ "&.MuiButton-root": { margin: 0 } }}
                  >
                    Add to Campaign
                  </Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={leadCreditDialogOpen}
                onClose={() => setLeadCreditDialogOpen(false)}
                sx={{
                  backgroundColor: "rgba(4, 4, 30, 0.5)",
                  "& .MuiDialog-paper": { height: { xs: "100%", sm: "90vh" } },
                }}
                fullScreen={isMobile}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    width: { xs: "100%", sm: "500px" },
                    py: 3,
                    px: 3,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "20px",
                        fontWeight: 700,
                        lineHeight: "28px",
                        letterSpacing: "0em",
                        color: "#28287B",
                      }}
                    >
                      {/* {leadCreditTab === "usage" ? "Lead Usage" : "Lead finder download summary"}
                       */}
                    {leadCreditTab === "usage" ? "Lead Usage" : (leadCreditTab === "download summary" ? "Lead finder download summary" : "Enrichment")}
                    </Typography>
                    <IconButton onClick={() => setLeadCreditDialogOpen(false)}>
                      <Close />
                    </IconButton>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      mt: 2,
                      height: { xs: "85vh", sm: "75vh" },
                      overflow: "hidden",
                      border: `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",

                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <TableContainer component={Paper} sx={{ height: "100%", ...scrollBarStyle }}>
                        <Table aria-label="simple table" sx={{ borderCollapse: "revert" }}>    
                        {leadCreditTab === "usage" ? 
                          (<TableBody>
                              {leadUsage?.map((item) => (
                                <TableRow
                                  key={item?.data?._id}
                                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                >
                                  <TableCell component="th" scope="row">
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        lineHeight: "16px",
                                        letterSpacing: "0em",
                                        color: "#8181B0",
                                      }}
                                    >
                                      {item?.data?.amount !== 0 ? item?.data?.amount : -1}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="left">
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        lineHeight: "16px",
                                        letterSpacing: "0em",
                                        color: "#28287B",
                                      }}
                                    >
                                      {item?.data?.type}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="left">
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        lineHeight: "16px",
                                        letterSpacing: "0em",
                                        color: "#28287B",
                                      }}
                                    >
                                      {/* {new Date(item?.data?.createdAt).toDateString()} */}
                                      {moment(item?.data?.createdAt).format("MM/DD/YYYY")}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>) : (leadCreditTab === "download summary" ? (<TableBody>
                              {downloadFiles?.map((item) => (
                                <TableRow
                                  key={item._id}
                                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                >
                                  <TableCell component="th" scope="row">
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        lineHeight: "16px",
                                        letterSpacing: "0em",
                                        color: "#28287B",
                                      }}
                                    >
                                      {item.name}
                                    </Typography>
                                    {/* <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                lineHeight: "16px",
                                letterSpacing: "0em",
                                color: "#8181B0",
                              }}
                            >
                              1 lead
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                lineHeight: "16px",
                                letterSpacing: "0em",
                                color: "#8181B0",
                              }}
                            >
                              Push to campaign
                            </Typography> */}
                                  </TableCell>
                                  <TableCell align="left">
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        lineHeight: "16px",
                                        letterSpacing: "0em",
                                        color: "#28287B",
                                      }}
                                    >
                                      {/* {new Date(item.createdAt).toDateString()} */}
                                      {moment(item.createdAt).format("MM/DD/YYYY")}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="left">
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        lineHeight: "16px",
                                        letterSpacing: "0em",
                                        color:
                                          item.status === "pending"
                                            ? "#FFA500"
                                            : item.status === "done"
                                            ? "#008000"
                                            : "#28287B",
                                      }}
                                    >
                                      {item.status === "pending"
                                        ? "Pending"
                                        : item.status === "done"
                                        ? "Completed"
                                        : ""}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="left">
                                    {item.status === "pending" ? (
                                      <Typography
                                        sx={{
                                          fontSize: "0.9em",
                                          fontWeight: "bold",
                                          color: "#333",
                                        }}
                                      >
                                        {(item.data?.length ?? 0) + (item.skipLeads ?? 0)} /{" "}
                                        {item.leadIds?.length ?? 0}
                                      </Typography>
                                    ) : (
                                      <IconButton
                                        sx={{
                                          color: "#28287B",
                                        }}
                                        onClick={() => handelDowloadCsv(item)}
                                      >
                                        <DownloadOutlined />
                                      </IconButton>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>) : (<TableBody>
                              {/* {console.log("downloadFiles",downloadFiles)} */}
                              {downloadFiles?.map((item) => (
                                 item.status === "done" ? (
                                <TableRow
                                  key={item._id}
                                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                >
                                  <TableCell component="th" scope="row">
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        lineHeight: "16px",
                                        letterSpacing: "0em",
                                        color: "#28287B",
                                      }}
                                    >
                                      {item.name}
                                    </Typography>
                                  
                                  </TableCell>
                                  <TableCell align="left">
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        lineHeight: "16px",
                                        letterSpacing: "0em",
                                        color: "#28287B",
                                      }}
                                    >
                                      {moment(item.createdAt).format("MM/DD/YYYY")}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="left">
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        lineHeight: "16px",
                                        letterSpacing: "0em",
                                        color:
                                          item.status === "pending"
                                            ? "#FFA500"
                                            : item.status === "done"
                                            ? "#008000"
                                            : "#28287B",
                                      }}
                                    >
                                      {item.status === "pending"
                                        ? "Pending"
                                        : item.status === "done"
                                        ? "Completed"
                                        : ""}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="left">
                                    {item.status === "pending" ? (
                                      <Typography
                                        sx={{
                                          fontSize: "0.9em",
                                          fontWeight: "bold",
                                          color: "#333",
                                        }}
                                      >
                                        {(item.data?.length ?? 0) + (item.skipLeads ?? 0)} /{" "}
                                        {item.leadIds?.length ?? 0}
                                      </Typography>
                                    ) : (
                                      <IconButton
                                        sx={{
                                          color: "#28287B",
                                        }}
                                        // onClick={handleAddToCampaignClick(item)}
                                        // onClick={() => handelDowloadCsv(item)}
                                      >
                                        <AddCircleOutlineOutlinedIcon />
                                      </IconButton>
                                    )}
                                  </TableCell>
                                </TableRow>
                                ) : "" 
                              ))}
                            </TableBody>))}

                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                </Box>
              </Dialog>
            </>
          ),
          unverified: <VerifyEmailAddressPage secondary={true} />,
          loading: "",
        }[verified]
      }
    </>
  );
};

export default Page;
