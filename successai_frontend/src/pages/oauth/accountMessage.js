import { Box,Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const AccountMessage = () => {
const { messageData } = useParams();

const messageMap = {
  created: "Account is created successfully!",
  reconnected: "Account is reconnected successfully!",
};
const displayMessage = messageMap[messageData] || messageData;

useEffect(() => {
  if (messageData === "reconnected") {
    localStorage.removeItem("reconnect");
  }
}, [messageData]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            textAlign:"center"
          }}
        >
          <Typography 
            sx={{
              mt: 3,
              fontWeight: 600,
              fontSize: "18px",
              color: "rgba(0,0,0,0.5)",
              textAlign: "center",
            }}
          >
             {displayMessage}
          </Typography>
        </Box>
      </Box>
      
    </>
  );
};

export default AccountMessage;
