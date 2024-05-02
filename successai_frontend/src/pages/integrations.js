import React from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { Google } from "src/assets/Google";
import { Call, Code, East, Support } from "@mui/icons-material";
import { SalesForceLogo } from "src/assets/integrations/SalesForceLogo";
import { ZapierLogo } from "src/assets/integrations/ZapierLogo";
import { ZohoLogo } from "src/assets/integrations/ZohoLogo";

const Page = () => {
  return (
    <>
      {" "}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",

          //   p: 2,
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
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              flexDirection: "column",
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
              Integrations
            </Typography>
            <Typography
              sx={{
                color: "#8181B0",
                fontSize: "13px",
                fontWeight: 400,
                lineHeight: "20px",
                letterSpacing: "0px",
                width: "100%",
                mt: 1.5,
              }}
            >
              Experience seamless integration and elevate your efficiency with Success.ai. Choose
              the method that suits you best and supercharge your productivity today!
            </Typography>
          </Box>
          <Grid container columnSpacing={3} rowGap={2} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",

                  boxShadow: "0px 12px 15px 0px #4B71970D",
                  width: "100%",
                  p: 3,
                  flexDirection: "column",
                  height: "100%",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    borderRadius: "8px",
                    border: "1px solid #E4E4E5",
                    py: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "120px",
                      height: "83px",
                      // backgroundColor: "red",
                    }}
                  >
                    <SalesForceLogo />
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "28px",
                    color: "#28287B",
                    mt: 2,
                    mb: 1,
                  }}
                >
                  Salesforce
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                    mt: 3,
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "18px",
                      py: 1.5,
                    }}
                  >
                    Coming Soon
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",

                  boxShadow: "0px 12px 15px 0px #4B71970D",
                  width: "100%",
                  p: 3,
                  flexDirection: "column",
                  height: "100%",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    borderRadius: "8px",
                    border: "1px solid #E4E4E5",
                    py: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "120px",
                      height: "83px",
                      // backgroundColor: "red",
                    }}
                  >
                    <ZapierLogo />
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "28px",
                    color: "#28287B",
                    mt: 2,
                    mb: 1,
                  }}
                >
                  Zapier
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                    mt: 3,
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "18px",
                      py: 1.5,
                    }}
                  >
                    Coming Soon
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",

                  boxShadow: "0px 12px 15px 0px #4B71970D",
                  width: "100%",
                  p: 3,
                  flexDirection: "column",
                  height: "100%",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    borderRadius: "8px",
                    border: "1px solid #E4E4E5",
                    py: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "120px",
                      height: "83px",
                      // backgroundColor: "red",
                    }}
                  >
                    <ZohoLogo />
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "28px",
                    color: "#28287B",
                    mt: 2,
                    mb: 1,
                  }}
                >
                  Zoho
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                    mt: 3,
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "18px",
                      py: 1.5,
                    }}
                  >
                    Coming Soon
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid xs={12}>
              <Box
                sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 1 }}
              >
                <Typography
                  sx={{
                    color: "#28287B",
                    fontSize: "13px",
                    fontWeight: 500,
                    lineHeight: "30px",
                    letterSpacing: "0px",
                  }}
                >
                  More Coming Soon...
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default Page;
