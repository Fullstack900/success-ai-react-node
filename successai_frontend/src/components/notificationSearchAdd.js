import React from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { Plus } from "src/assets/general/Plus";

import { SBSearch } from "src/assets/sidebar/SBSearch";

import { TNNotification } from "src/assets/topnav/TNNotification";

const NotificationSearchAdd = ({ handleNotificationClick, handleSearch, handleAdd }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: { xs: "space-between", sm: "center" },
        alignItems: "center",
        gap: 2,
        width: { xs: "100%", sm: "fit-content" },
        height: "100%",
      }}
    >
      <IconButton
        onClick={handleNotificationClick}
        sx={{
          border: `1px solid ${theme.palette.grey[300]}`,
          p: 1,
          borderRadius: "8px",
          height: 50,
          width: 50,
          display: "none",
        }}
      >
        <TNNotification />
      </IconButton>

      <TextField
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
          width: { xs: "75%", sm: 300 },
          height: "100%",
          border: "none",
          backgroundColor: "white",
          "& .MuiOutlinedInput-root": {
            height: "100%",
            "& > fieldset": { borderRadius: "6px", borderColor: theme.palette.grey[400] },
          },
          "& div": { pl: 0.3 },
          // "& div fieldset": { borderRadius: "6px", border: `1px solid ${theme.palette.grey[300]}` },
          "& div input": {
            py: 1.8,
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: "16px",
            letterSpacing: "0em",
            "&::placeholder": {
              color: "rgba(40, 40, 123, 0.5)",
            },
          },
        }}
        placeholder="Search campaigns"
        // disabled={isAccountsFetching || accounts?.length === 0 ? true : false}
        //   size="small"
        onChange={handleSearch}
      />
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
          py: 1.5,
          pr: "18px",
        }}
        variant="outlined"
        size="large"
        // onClick={() => navigate("/campaigns/create")}
        onClick={handleAdd}
      >
        <Box sx={{ mr: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Plus />
        </Box>
        {isMobile ? "Add" : "Add New"}
      </Button>
    </Box>
  );
};

export default NotificationSearchAdd;
