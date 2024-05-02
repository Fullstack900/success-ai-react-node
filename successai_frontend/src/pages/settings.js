import { Helmet } from "react-helmet-async";
import { Box, Typography, Tabs, Tab, Grid, Button, Stack, TextField } from "@mui/material";
import PropTypes from "prop-types";
import Profile from "src/components/settings/profile.js";
import { useNavigate } from "react-router-dom";
import BillingAndUsage from "src/components/settings/BillingAndUsage.js";
import BlockList from "src/components/settings/BlockList";
import { useState, useEffect } from "react";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && (
        <Box sx={{}}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Page = ({ tab }) => {
  const [value, setValue] = useState(
    tab === "billing" ? 0 : tab === "profile" ? 1 : tab === "blocklist" ? 2 : 0
  );
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {
    setValue(tab === "billing" ? 0 : tab === "profile" ? 1 : tab === "blocklist" ? 2 : 0);
  }, [tab]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center ",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          //   p: 2,
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
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
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
              Settings
            </Typography>
          </Box>
          <Box
            sx={{
              boxShadow: "0px 12px 15px 0px #4B71970D",
              borderRadius: "12px",
              // pb: 5,
              // px: 4,
              // pt: 1,
              backgroundColor: "white",
              width: "100%",
              // mb: 4,
              p: { xs: 1, sm: 2, md: 3 },
              mt: 3,
            }}
          >
            {" "}
            <Box
              sx={{
                width: "100%",
                border: "1px solid rgba(228, 228, 229, 1)",
                borderRadius: "8px",
              }}
            >
              {" "}
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
                variant="fullWidth"
                sx={{ borderRadius: "8px" }}
              >
                <Tab
                  label="Billings & Usage"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "20px",
                  }}
                  {...a11yProps(0)}
                />
                <Tab
                  label="Profile"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "20px",
                  }}
                  {...a11yProps(1)}
                />
                <Tab
                  label="Blocklist"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "20px",
                  }}
                  {...a11yProps(2)}
                />
              </Tabs>
            </Box>
            {/* <Grid
              container
              sx={{
                backgroundColor: "#F2F4F6",
                width: "100%",
                borderRadius: "8px",
                p: 0.4,
                border: "1px solid #F2F4F7",
              }}
            >
              <Grid item xs={4}>
                <Button
                  // variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: value === 0 ? "white" : "transparent",
                    color: value === 0 ? "#0071F6" : "#8181B0",
                    "&:hover": {
                      backgroundColor: value === 0 ? "white" : "transparent",
                    },
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    letterSpacing: "0em",
                    boxShadow: value === 0 && "0px 1px 2px 0px #1018280F",
                    borderRadius: "5px",
                    // mr: 0.5,
                    py: 1,
                  }}
                  onClick={() => {
                    setValue(0);
                  }}
                >
                  Billings & Usage
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  // variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: value === 1 ? "white" : "transparent",
                    color: value === 1 ? "#0071F6" : "#8181B0",
                    "&:hover": {
                      backgroundColor: value === 1 ? "white" : "transparent",
                    },
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    letterSpacing: "0em",
                    boxShadow: value === 1 && "0px 1px 2px 0px #1018280F",
                    borderRadius: "5px",
                    // mr: 0.5,
                    py: 1,
                  }}
                  onClick={() => {
                    setValue(1);
                  }}
                >
                  Profile
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  // variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: value === 2 ? "white" : "transparent",
                    color: value === 2 ? "#0071F6" : "#8181B0",
                    "&:hover": {
                      backgroundColor: value === 2 ? "white" : "transparent",
                    },
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    letterSpacing: "0em",
                    boxShadow: value === 2 && "0px 1px 2px 0px #1018280F",
                    borderRadius: "5px",
                    // mr: 0.5,
                    py: 1,
                  }}
                  onClick={() => {
                    setValue(2);
                  }}
                >
                  Blocklist
                </Button>
              </Grid>
            </Grid> */}
          </Box>
          <Box
            sx={{
              mb: 4,
              mt: 3,
              width: "100%",
            }}
          >
            <CustomTabPanel value={value} index={0}>
              <BillingAndUsage />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <Profile />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              <BlockList campaign={[]} />
            </CustomTabPanel>
          </Box>
        </Box>
      </Box>
      {/* <Box
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">Settings</Typography>
            </div>
            <div>
              <Grid container spacing={3}>
                <Grid xs={12} md={4}>
                  <Typography variant="h6">Account</Typography>
                </Grid>
                <Grid xs={12} md={8}>
                  <Card sx={{ p: 3 }}>
                    <form onSubmit={formik.handleSubmit}>
                      <Stack alignItems="center" direction="row" spacing={2} sx={{ mb: 3 }}>
                        <Avatar
                          src="/assets/avatars/avatar-chen-simmons.jpg"
                          sx={{
                            height: 64,
                            width: 64,
                          }}
                        />
                        <div>
                          <Button color="primary" size="small" type="button" variant="outlined">
                            Change
                          </Button>
                          <div>
                            <Typography color="text.secondary" variant="caption">
                              Recommended dimensions: 200x200, maximum file size: 5MB
                            </Typography>
                          </div>
                        </div>
                      </Stack>
                      <Box sx={{ maxWidth: 420 }}>
                        <Stack spacing={3}>
                          <TextField
                            error={Boolean(formik.touched.name && formik.errors.name)}
                            fullWidth
                            helperText={formik.touched.name && formik.errors.name}
                            label="Full Name"
                            name="name"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.name}
                          />
                          <TextField
                            error={Boolean(formik.touched.email && formik.errors.email)}
                            fullWidth
                            helperText={formik.touched.email && formik.errors.email}
                            label="Email address"
                            name="email"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            type="email"
                            value={formik.values.email}
                          />
                          <TextField
                            error={Boolean(formik.touched.jobTitle && formik.errors.jobTitle)}
                            fullWidth
                            helperText={formik.touched.jobTitle && formik.errors.jobTitle}
                            label="Job title"
                            name="jobTitle"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.jobTitle}
                          />
                          <TextField
                            error={Boolean(formik.touched.companyName && formik.errors.companyName)}
                            fullWidth
                            helperText={formik.touched.companyName && formik.errors.companyName}
                            label="Company name"
                            name="companyName"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.companyName}
                          />
                          <TextField
                            error={Boolean(formik.touched.companySize && formik.errors.companySize)}
                            fullWidth
                            helperText={formik.touched.companySize && formik.errors.companySize}
                            label="Company size"
                            name="companySize"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.companySize}
                          >
                            {companySizeOptions.map((companySizeOption) => (
                              <MenuItem key={companySizeOption} value={companySizeOption}>
                                {companySizeOption}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Stack>
                        {formik.errors.submit && (
                          <FormHelperText error sx={{ mt: 3 }}>
                            {formik.errors.submit}
                          </FormHelperText>
                        )}
                        <Box sx={{ mt: 3 }}>
                          <Button color="primary" size="large" type="submit" variant="contained">
                            Save settings
                          </Button>
                        </Box>
                      </Box>
                    </form>
                  </Card>
                </Grid>
              </Grid>
            </div>
          </Stack>
        </Container>
      </Box> */}
    </>
  );
};

export default Page;
