import {
  Autocomplete,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { CheckCircleIcon } from "src/assets/general/CheckCircleIcon";
import { SettingsIcon } from "src/assets/general/SettingsIcon";
import { DeleteIconBlack } from "src/assets/general/DeleteIcon";
import { SaveIcon } from "src/assets/general/SaveIcon";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  useDeleteCampaignScheduleMutation,
  useUpdateCampaignScheduleMutation,
} from "src/services/campaign-service.js";
import { toast } from "react-hot-toast";
import { timezonesConcatenated, timingIntervals, timezoneArray } from "src/assets/data";
import { useState, useEffect } from "react";

const DayLabel = ({ label, checked, blur }) => {
  return (
    <Box
      sx={{
        backgroundColor:
          !blur && checked ? "rgb(33, 111, 237, 1)" : blur && checked ? "#F2F4F6" : "white",
        color: !blur && checked ? "white" : blur && checked ? "#28287B" : "#28287B",
        mr: 1,
        borderRadius: "4px",
        border:
          !blur && checked
            ? "1px solid rgb(33, 111, 237, 0.5)"
            : blur && checked
            ? "1px solid #E6E6E6"
            : "1px solid #E6E6E6",
        width: "48px",
        height: "24px",
        textAlign: "center",
        py: 0.2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "16px",
        letterSpacing: "0em",
      }}
    >
      {label}
    </Box>
  );
};

const DayToggleButton = ({ label, checked, onClick }) => {
  const labelToDay = {
    Sun: "Sunday",
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
  };

  return (
    <Tooltip
      title={`${checked ? "Disable" : "Enable"} for ${labelToDay[label]}`}
      arrow
      placement="top"
    >
      <Box
        sx={{
          backgroundColor: checked ? "rgb(33, 111, 237, 1)" : "white",
          color: checked ? "white" : "#28287B",
          mr: 1,
          px: 1,
          borderRadius: "4px",
          border: checked ? "1px solid rgb(33, 111, 237, 0.5)" : "1px solid rgba(0,0,0,0.1)",
          cursor: "pointer",
          width: "48px",
          height: "24px",
          textAlign: "center",
          py: 0.2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "13px",
          fontWeight: 500,
          lineHeight: "16px",
          letterSpacing: "0em",
        }}
        onClick={onClick}
      >
        {label}
      </Box>
    </Tooltip>
  );
};

const CampaignScheduleBlock = ({ schedule, open, setOpenedSchedule, showDelete, startDate }) => {
  const [updateCampaignSchedule] = useUpdateCampaignScheduleMutation();
  const [deleteCampaignSchedule, { isLoading: isDeleteCampaignScheduleLoading }] =
    useDeleteCampaignScheduleMutation();

  const formik = useFormik({
    initialValues: {
      name: schedule.name,
      from: schedule.from,
      to: schedule.to,
      timezone: schedule.timezone,
      sun: schedule.sun,
      mon: schedule.mon,
      tue: schedule.tue,
      wed: schedule.wed,
      thu: schedule.thu,
      fri: schedule.fri,
      sat: schedule.sat,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required("Name is required"),
    }),
    onSubmit: async (values) => {
      setOpenedSchedule(null);
      values.isDefault = true;
      const { message } = await updateCampaignSchedule({ id: schedule._id, data: values }).unwrap();
      toast.success(message);
    },
  });

  const handleDelete = async () => {
    setOpenedSchedule(null);
    const { message } = await deleteCampaignSchedule(schedule._id).unwrap();
    toast.success(message);
  };

  const updateScheduleDefault = async (id) => {
    await updateCampaignSchedule({
      id,
      data: {
        isDefault: true,
      },
    }).unwrap();
  };

  const [isFromSelected, setIsFromSelected] = useState(false);
  const isExist = timezoneArray.find((item) => item.value === formik.values.timezone || `America/New_York (GMT-05:00)`);
  if (!isExist) {
    timezoneArray.push({
      label:
        formik.values.timezone.split(" ")[1] +
        " " +
        formik.values.timezone.split(" ")[0].split("/")[1],
      value: formik.values.timezone,
    });
  }
  // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // const userTimeZone = Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York' }).resolvedOptions().timeZone;

  // const timezoneValue = timezoneArray.find((item) => {
  //   const region = item.value.split(" ")[0];
  //   return region === userTimeZone;
  // });
  
  const timezoneValue = timezoneArray.find((item) => item.value === formik.values.timezone) || timezoneArray[40];

  // const [currentTime, setCurrentTime] = useState(new Date());
  // const [exectTime, setExectTime] = useState("");

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     const hours = currentTime.getHours();
  //     const minutes = currentTime.getMinutes();
  //     const ampm = hours >= 12 ? "PM" : "AM";
  //     const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  //     const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  //     const newExectTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

  //     setExectTime(newExectTime);
  //     setCurrentTime(new Date());
  //   }, 1000);

  //   return () => clearInterval(intervalId);
  // }, [currentTime]);

  // const isToday = new Date(startDate).toDateString() === new Date().toDateString();

  // const filteredTimingIntervals = isToday
  //   ? timingIntervals.filter((time) => {
  //       const selectedTime = new Date(`2000-01-01 ${time}`);
  //       const currentTime = new Date(`2000-01-01 ${exectTime}`);

  //       return selectedTime >= currentTime;
  //     })
  //   : timingIntervals;

  // const remainingTimingIntervals = timingIntervals.filter(
  //   (time) => !filteredTimingIntervals.includes(time)
  // );

  // const options = [...filteredTimingIntervals, ...remainingTimingIntervals];
  // const options = timingIntervals;

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",

          borderRadius: "12px",
          boxShadow: "0px 12px 15px 0px #4B71970D",

          cursor: !open && "pointer",
          mt: 1.5,
          "&:hover": {
            backgroundColor: !open && "rgba(255,255,255,0.5)",
            boxShadow: 2,
          },
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            boxShadow: open && 5,
            py: 1,
            gap: 1,
          }}
          onClick={() => !open && updateScheduleDefault(schedule._id)}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "30%",
              py: 1.5,
              pl: { xs: 1, sm: 2 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                visibility: schedule.isDefault ? "visible" : "hidden",
              }}
            >
              <CheckCircleIcon />
            </Box>

            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                ml: 1,
                color: "#28287B",
                lineHeight: "16px",
                letterSpacing: "0em",
              }}
            >
              {schedule.name}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", sm: "center" },
              alignItems: "center",
              py: 1.5,
              width: { xs: "60%", sm: "100%" },
              flexWrap: "wrap",
              rowGap: 1,
            }}
          >
            <DayLabel label="Sun" checked={schedule.sun} blur={open} />
            <DayLabel label="Mon" checked={schedule.mon} blur={open} />
            <DayLabel label="Tue" checked={schedule.tue} blur={open} />
            <DayLabel label="Wed" checked={schedule.wed} blur={open} />
            <DayLabel label="Thu" checked={schedule.thu} blur={open} />
            <DayLabel label="Fri" checked={schedule.fri} blur={open} />
            <DayLabel label="Sat" checked={schedule.sat} blur={open} />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              py: 1.5,
              px: { xs: 1, sm: 3 },
              width: { xs: "10%", sm: "20%" },
            }}
          >
            {open ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={formik.handleSubmit}
                >
                  <SaveIcon />
                </Box>
              </>
            ) : (
              <>
                <Box
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                  onClick={() => setOpenedSchedule(schedule._id)}
                >
                  <SettingsIcon />
                </Box>
              </>
            )}

            {showDelete && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  ml: 1,
                  cursor: "pointer",
                }}
                onClick={(event) => {
                  event.stopPropagation(); 
                  handleDelete();
                }}
              >
                {isDeleteCampaignScheduleLoading ? (
                  <CircularProgress size={20} sx={{ color: "#28287b" }} />
                ) : (
                  <DeleteIconBlack />
                )}
              </Box>
            )}
          </Box>
        </Box>
        {open && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                width: "100%",
                p: 3,
                flexDirection: "column",
                height: open ? "fit-content" : 0,
                transition: "1s all ease",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    letterSpacing: "0px",
                    color: "#28287B",
                  }}
                >
                  Configure schedule:
                </Typography>
              </Box>
              <Grid container columnSpacing={3} sx={{ mt: 2 }} rowSpacing={2}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    variant="outlined"
                    placeholder="Schedule Name *"
                    sx={{
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
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start" }}
                  >
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, mr: 2 }}>Days:</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        flexWrap: "wrap",
                        rowGap: 1,
                      }}
                    >
                      <DayToggleButton
                        label="Sun"
                        checked={formik.values.sun}
                        onClick={() => formik.setFieldValue("sun", !formik.values.sun)}
                      />
                      <DayToggleButton
                        label="Mon"
                        checked={formik.values.mon}
                        onClick={() => formik.setFieldValue("mon", !formik.values.mon)}
                      />
                      <DayToggleButton
                        label="Tue"
                        checked={formik.values.tue}
                        onClick={() => formik.setFieldValue("tue", !formik.values.tue)}
                      />
                      <DayToggleButton
                        label="Wed"
                        checked={formik.values.wed}
                        onClick={() => formik.setFieldValue("wed", !formik.values.wed)}
                      />
                      <DayToggleButton
                        label="Thu"
                        checked={formik.values.thu}
                        onClick={() => formik.setFieldValue("thu", !formik.values.thu)}
                      />
                      <DayToggleButton
                        label="Fri"
                        checked={formik.values.fri}
                        onClick={() => formik.setFieldValue("fri", !formik.values.fri)}
                      />
                      <DayToggleButton
                        label="Sat"
                        checked={formik.values.sat}
                        onClick={() => formik.setFieldValue("sat", !formik.values.sat)}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={5} sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Autocomplete
                      disablePortal
                      disableClearable
                      id="combo-box-demo"
                      options={timingIntervals}
                      // getOptionDisabled={(option) =>
                      //   !!remainingTimingIntervals.find((element) => element === option)
                      // }
                      value={formik.values.from}
                      onChange={(_, newValue) => {  
                        // const nextTime = timingIntervals.find((time) => {
                        //   const selectedTime = new Date(`2000-01-01 ${time}`);
                        //   const currentTime = new Date(`2000-01-01 ${exectTime}`);
                        //   return selectedTime >= currentTime;
                        // });
                        // const nextTime = newValue;
                        // formik.setFieldValue("from", nextTime);
                        formik.setFieldValue("from", newValue);
                        setIsFromSelected(true);
                      }}
                      sx={{ width: "100%" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="From"
                          // label={props.label}
                          variant="outlined"
                          sx={{
                            // width: 280,
                            // maxHeight: 40,
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
                            "& label": {
                              fontSize: "14px",
                              fontWeight: 700,
                              lineHeight: "18px",
                              letterSpacing: "0px",
                              color: "#28287B",
                            },
                            // ml: 1,
                            // boxShadow: 10,
                          }}
                          size="small"
                        />
                      )}
                    />
                    <Autocomplete
                      disablePortal
                      disableClearable
                      id="combo-box-demo"
                      // options={timingIntervals}
                      options={timingIntervals.filter((interval) =>
                        isFromSelected
                          ? timingIntervals.indexOf(interval) >
                            timingIntervals.indexOf(formik.values.from)
                          : true
                      )}
                      value={formik.values.to}
                      onChange={(_, newValue) => {
                        formik.setFieldValue("to", newValue);
                      }}
                      sx={{ width: "100%", ml: 2 }}
                      // disabled={!isFromSelected}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="To"
                          // label={props.label}
                          variant="outlined"
                          sx={{
                            // width: 280,
                            // maxHeight: 40,
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
                            "& label": {
                              fontSize: "14px",
                              fontWeight: 700,
                              lineHeight: "18px",
                              letterSpacing: "0px",
                              color: "#28287B",
                            },
                            // ml: 1,
                            // boxShadow: 10,
                          }}
                          size="small"
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={7} sx={{ mt: { xs: 0, sm: 2 } }}>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    // options={timezonesConcatenated}
                    options={timezoneArray}
                    value={timezoneValue}
                    onChange={(_, newValue) => {
                      // formik.setFieldValue("timezone", newValue);
                      formik.setFieldValue("timezone", newValue?.value);
                    }}
                    sx={{ width: "100%" }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Timezone"
                        // label={props.label}
                        variant="outlined"
                        sx={{
                          // width: 280,
                          // maxHeight: 40,
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
                          "& label": {
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: "18px",
                            letterSpacing: "0px",
                            color: "#28287B",
                          },
                          // ml: 1,
                          // boxShadow: 10,
                        }}
                        size="small"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default CampaignScheduleBlock;
