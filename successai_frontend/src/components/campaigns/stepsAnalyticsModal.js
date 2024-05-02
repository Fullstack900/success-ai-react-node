import { Close } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Dialog,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function StepsAnalyticsModal({
  stepsAnalyticsModal,
  setStepsAnalyticsModal,
  stepsEmailRecord,
  scrollBarStyle
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  return (
    <div>
      <Dialog
        open={stepsAnalyticsModal}
        onClose={() => setStepsAnalyticsModal(false)}
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
              Email Record
            </Typography>
            <IconButton onClick={() => setStepsAnalyticsModal(false)}>
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
                  <TableBody>
                    {stepsEmailRecord?.map((item, index) => (
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel2-content"
                          id="panel2-header"
                          sx={{ fontWeight: 500 }}
                        >
                          {item.created_at}
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
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
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#28287B",
                                  }}
                                >
                                  Sent
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#28287B",
                                  }}
                                >
                                  {item?.sent}
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
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#28287B",
                                  }}
                                >
                                  Opened
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#28287B",
                                  }}
                                >
                                  {item?.opened}
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
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#28287B",
                                  }}
                                >
                                  Link Clicked
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#28287B",
                                  }}
                                >
                                  {item.link_clicked}
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
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#28287B",
                                  }}
                                >
                                  Replied
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#28287B",
                                  }}
                                >
                                  {item.replied}
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
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#28287B",
                                  }}
                                >
                                  Opportunities
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    letterSpacing: "0em",
                                    color: "#28287B",
                                  }}
                                >
                                  {item.opportunities}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </div>
  );
}
