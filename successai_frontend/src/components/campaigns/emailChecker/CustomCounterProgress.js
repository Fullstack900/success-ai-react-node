import React from "react";
import { Box, LinearProgress, linearProgressClasses } from "@mui/material";
import { styled } from "@mui/material/styles";

const CustomCounterProgress = (props) => {
  const { countOf, maxCountOf, minRange, maxRange, barColor } = props;
  const BorderLinearProgress = styled(LinearProgress)(({ theme, barColor }) => ({
    height: 10,
    //   borderRadius: 5,

    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      // borderRadius: 5,
      backgroundColor: barColor,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
  }));
  const BorderLinearProgressBrackets = styled(LinearProgress)(({ theme, barColor, smallBar }) => ({
    height: 10,
    //   borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: "transparent",
    },
    [`& .${linearProgressClasses.bar}`]: {
      //   borderRadius: 5,
      backgroundColor: "transparent",
      border: smallBar ? `1px solid #eee` : "1px solid black",
      borderRight: smallBar && "1px solid black",
    },
  }));
  return (
    <>
      <Box sx={{ position: "relative", mt: 1, width: "100%" }}>
        <BorderLinearProgress
          variant="determinate"
          value={countOf > maxCountOf ? 100 : (countOf * 100) / maxCountOf}
          barColor={barColor}
        />
        <BorderLinearProgressBrackets
          variant="determinate"
          value={(maxRange * 100) / maxCountOf}
          style={{
            position: "absolute",
            width: "100%",
            zIndex: "998",
            top: 0,
          }}
        />
        <BorderLinearProgressBrackets
          variant="determinate"
          value={(minRange * 100) / maxCountOf}
          smallBar={true}
          style={{
            position: "absolute",
            width: "100%",
            zIndex: "999",
            top: 0,
          }}
        />
      </Box>
    </>
  );
};

export default CustomCounterProgress;
