import { EATotalEmailsSent } from "src/assets/emailAccounts/EATotalEmailsSent";

const { Box, Typography } = require("@mui/material");

const AddNewCampaignBlock = ({ onClick }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: 3,
        py: 6,
        borderRadius: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        boxShadow: "0px 12px 15px 0px #4B71970D",
        backgroundColor: "#F2F4F6",
        "&:hover": {
          boxShadow: "0px 2px 14px -1px rgba(0, 0, 0, 0.2)",
        },
        transition: "all 0.2s ease-in-out",
        flexDirection: "column",
        border: "1px dashed #0071F6",
        borderSpacing: "15px",
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <EATotalEmailsSent />
        </Box>
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: "25px",
            color: "#0071F6",
            mt: 2,
          }}
        >
          Add new campaign
        </Typography>
      </Box>
    </Box>
  );
};

export default AddNewCampaignBlock;
