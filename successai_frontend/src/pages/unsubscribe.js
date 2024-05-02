import { Box, Typography, Paper, useTheme } from "@mui/material";
import { Logo } from "src/components/logo";
import React from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";

const Unsubscribe = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: "16px",

          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "90%",
        }}
      >
        <Logo />
        <Box sx={{ marginTop: "10px", fontSize: "6rem", color: "#22C55E" }}>
          <AiOutlineCheckCircle />
        </Box>

        <Typography
          sx={{
            fontSize: { xs: "1.8rem", sm: "2.5rem" },
            fontWeight: "bold",
            color: theme.palette.primary.main,
            textAlign: "center",
          }}
        >
          Successfully unsubscribed!
        </Typography>
      </Paper>
    </Box>
  );
};

export default Unsubscribe;
