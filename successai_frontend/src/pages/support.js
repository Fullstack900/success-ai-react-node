import React from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { Google } from "src/assets/Google";
import { Call, Code, East, Support } from "@mui/icons-material";
import { HelpArticleIcon } from "src/assets/support/HelpArticlesIcon";
import { ContactIcon } from "src/assets/support/ContactIcon";
import { DocumentationIcon } from "src/assets/support/DocumentationIcon";

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
              Support Center
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
              If you're having trouble, don't worry! You can reach out through our live chat or take
              a look at our documentation to get started!
            </Typography>
          </Box>
          <Grid container columnSpacing={3} rowGap={2} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",

                  width: "100%",
                  p: 3,
                  border: "1px solid #FF7000",
                  flexDirection: "column",
                  height: "100%",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0px 12px 15px 0px #4B71970D",
                }}
              >
                {" "}
                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                  <HelpArticleIcon />{" "}
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#28287B",
                      lineHeight: "26px",
                      ml: 1.5,
                    }}
                  >
                    Help Articles
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#8181B0",
                    fontWeight: 400,
                    lineHeight: "20px",
                    mt: 1,
                  }}
                >
                  Learn how to use Success.ai for automating your campaigns
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    mt: 3,
                  }}
                >
                  <Button
                    onClick={() => {
                      window.Intercom("showSpace", "help");
                    }}
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
                    Check Articles
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

                  width: "100%",
                  p: 3,
                  border: "1px solid #00AA38",
                  flexDirection: "column",
                  height: "100%",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0px 12px 15px 0px #4B71970D",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                  <ContactIcon />{" "}
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#28287B",
                      lineHeight: "26px",
                      ml: 1.5,
                    }}
                  >
                    Contact
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#8181B0",
                    fontWeight: 400,
                    lineHeight: "20px",
                    mt: 1,
                  }}
                >
                  Contact us for business inquiries and product support
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    mt: 3,
                  }}
                >
                  <Button
                    href="mailto:support@success.ai"
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "18px",
                      py: 1.5,
                    }}
                  >
                    Contact Us
                  </Button>{" "}
                  <Button
                    onClick={() => {
                      window.Intercom("showSpace", "messages");
                    }}
                    id="LiveChatButton"
                    fullWidth
                    variant="contained"
                    sx={{
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "18px",
                      py: 1.5,
                      ml: 1,
                      cursor: "pointer",
                    }}
                  >
                    Live Chat
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

                  width: "100%",
                  p: 2,
                  border: "1px solid #6500EF",
                  flexDirection: "column",
                  height: "100%",
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  boxShadow: "0px 12px 15px 0px #4B71970D",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                  <DocumentationIcon />{" "}
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#28287B",
                      lineHeight: "26px",
                      ml: 1.5,
                    }}
                  >
                    Documentation
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#8181B0",
                    fontWeight: 400,
                    lineHeight: "20px",
                    mt: 1,
                  }}
                >
                  Check documentation for integrating Success.ai to your current workflows with API,
                  Zapier, etc.
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
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
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default Page;
