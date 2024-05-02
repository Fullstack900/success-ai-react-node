import React from 'react'
import { Box, useTheme } from '@mui/material';

const Countbadge = ({ count }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        width: "24px",
        height: "24px",
        backgroundColor:theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontSize: "12px",
        fontWeight: "700",
      }}
    >
      {count}
    </Box>
  )
}

export default Countbadge
