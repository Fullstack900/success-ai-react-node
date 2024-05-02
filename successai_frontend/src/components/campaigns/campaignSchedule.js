import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  useMediaQuery,
  IconButton,
  Tooltip,
  tooltipClasses,
} from "@mui/material";
import { makeStyles, styled } from "@mui/styles";
import { InfoOutlined } from "@mui/icons-material";
import CampaignScheduleBlock from "./CampaignScheduleBlock";
import { Plus } from "src/assets/general/Plus";
import moment from "moment";
import {
  useCreateCampaignScheduleMutation,
  useUpdateCampaignMutation,
} from "src/services/campaign-service.js";
import { toast } from "react-hot-toast";
import { CalendarIcon } from "src/assets/general/CalendarIcon";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const today = dayjs();

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

const CampaignSchedule = ({ campaign }) => {
  const { schedules } = campaign;
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [startDate, setStartDate] = useState(dayjs(campaign?.startDate));
  const [endDate, setEndDate] = useState(dayjs(campaign?.endDate));
  const [openedSchedule, setOpenedSchedule] = useState(null);

  const [createCampaignSchedule, { isLoading: isCreateCampaignLoading }] =
    useCreateCampaignScheduleMutation();
  const [updateCampaign] = useUpdateCampaignMutation();

  const getTimezoneOffset = () => {
    function z(n) {
      return (n < 10 ? "0" : "") + n;
    }
    var offset = new Date().getTimezoneOffset();
    var sign = offset < 0 ? "+" : "-";
    offset = Math.abs(offset);
    return sign + z((offset / 60) | 0) + ":" + z(offset % 60);
  };
  const getUserTimezone = () => {
    // const userTimezones = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userTimezone =  Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York' }).resolvedOptions().timeZone;
    const offset = getTimezoneOffset();
    const timezoneWithOffset = userTimezone + " " + `(GMT${offset})`;
    const defaultTimeZone = 'America/New_York (GMT-05:00)';
    // return userTimezone;
    return defaultTimeZone;
  };

  const handleSaveCampaignClick = async () => {
    if (dayjs(startDate).isSame(dayjs(endDate), "day")) {
      toast.error("Please enter a start date occurring before the end date");
      return;
    }

    const { message } = await updateCampaign({
      id: campaign._id,
      data: {
        startDate: startDate.$d,
        endDate: endDate.$d,
        tz: getUserTimezone(),
      },
    }).unwrap();
    toast.success(message);
  };

  const handleCreateSchedule = async () => {
    if (isCreateCampaignLoading) return;
    const { message, schedule } = await createCampaignSchedule({
      id: campaign._id,
      data: { name: "New Schedule", timezone: getUserTimezone() },
    }).unwrap();
    setOpenedSchedule(schedule._id);
    toast.success(message);
  };

  return (
    <>
      <Grid container sx={{}}>
        <Grid item xs={12} sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  flexDirection: "column",
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
                  Schedules let you set when to send your emails.
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "16px",
                    letterSpacing: "0em",
                    color: "#8181B0",
                    mt: 0.5,
                  }}
                >
                  {" "}
                  Choose an existing schedule or create a new one.
                </Typography>
              </Box>
              {/* <IconButton sx={{ fontSize: "20px" }} onClick={() => setOpenInfo(!openInfo)}>
                <InfoOutlined fontSize="20px" />
              </IconButton> */}
              <InfoTooltip
                arrow
                placement="top"
                enterTouchDelay={0}
                title={
                  <Box
                    sx={{
                      width: "100%",
                      backgroundColor: "white",
                      borderRadius: "12px",
                      boxShadow: "0px 12px 15px 0px #4B71970D",
                      display: "flex",

                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        letterSpacing: "0em",
                        color: "#8181B0",
                      }}
                    >
                      If the daily email sending limit set cannot be completed for all leads during
                      the scheduled campaign time, the remaining leads will be contacted the next
                      day.
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        letterSpacing: "0em",
                        color: "#8181B0",
                      }}
                    >
                      Please ensure that the daily email sending limit set is accurate to reach all
                      the leads within the designated campaign period.
                    </Typography>
                  </Box>
                }
              >
                <InfoOutlined fontSize="20px" sx={{cursor:'pointer'}} />
              </InfoTooltip>
            </Box>

            <Button
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
                backgroundColor: "#0071F6",
                borderRadius: "8px",
                px: 1.5,
                py: { xs: 1, sm: 1.5 },
                minWidth: { xs: 30, sm: 64 },
              }}
              variant="outlined"
              size="large"
              onClick={handleCreateSchedule}
            >
              {isCreateCampaignLoading ? (
                <>
                  <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                  Creating...
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      mr: { xs: 0, sm: 1 },
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Plus />
                  </Box>
                  {isMobile ? "" : "New schedule"}
                </>
              )}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: { xs: "center", sm: "flex-start" },
              alignItems: { xs: "flex-start", sm: "center" },
              rowGap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: { xs: "100%", sm: "fit-content" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mr: 1,
                  width: { xs: "10%", sm: "fit-content" },
                }}
              >
                <CalendarIcon />
              </Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "18px",
                  letterSpacing: "0em",
                  color: "#28287B",
                  mr: 2,
                  width: { xs: "20%", sm: "fit-content" },
                }}
              >
                Start:
              </Typography>{" "}
              <Box sx={{ width: { xs: "70%", sm: "fit-content" } }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    disablePast
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                ml: { xs: 0, sm: 4 },
                width: { xs: "100%", sm: "fit-content" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mr: 1,
                  width: { xs: "10%", sm: "fit-content" },
                }}
              >
                <CalendarIcon />
              </Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "18px",
                  letterSpacing: "0em",
                  color: "#28287B",
                  mr: 2,
                  width: { xs: "20%", sm: "fit-content" },
                }}
              >
                End:
              </Typography>
              <Box sx={{ width: { xs: "70%", sm: "fit-content" } }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={endDate}
                    minDate={startDate}
                    onChange={(date) => setEndDate(date)}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>
            <Box
              sx={{
                width: {
                  xs: "100%",
                  sm: "fit-content",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                },
              }}
            >
              <Button
                sx={{
                  color: "#0071F6",
                  cursor: "pointer",
                  "&:hover": {
                    color: "#164694",
                  },
                  ml: 2,
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: "16px",
                }}
                variant="outlined"
                onClick={handleSaveCampaignClick}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Grid>
        {schedules.map((schedule, i) => {
          return (
            <Grid xs={12} key={schedule._id}>
              <CampaignScheduleBlock
                startDate={startDate}
                schedule={schedule}
                open={schedule._id === openedSchedule}
                setOpenedSchedule={setOpenedSchedule}
                showDelete={schedules.length > 1}
              />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default CampaignSchedule;
