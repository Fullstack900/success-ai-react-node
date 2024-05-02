import { Box, CircularProgress, Typography } from "@mui/material";
import { LFRecentSearches } from "src/assets/leadFinder/LFRecentSearches.js";

const RecentSearchBlock = ({ searches, isLoading, onSearchClick }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        borderRadius: "8px",
        px: 2,
        py: 1.5,
        border: "1px solid #E4E4E5",
        flexDirection: "column",
      }}
    >
      {isLoading ? (
        <CircularProgress size={25} thickness={5} />
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LFRecentSearches />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexDirection: "column",
                ml: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "17.64px",
                  letterSpacing: "0em",
                  color: "#28287B",
                }}
              >
                Recent Searches
              </Typography>
              {!searches?.recent?.length && (
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "16.38px",
                    letterSpacing: "0em",
                    color: "#8181B0",
                  }}
                >
                  No recent searches
                </Typography>
              )}
            </Box>
          </Box>
          {searches?.recent?.map((search) => (
            <Box
              key={search._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#ececec",
                },
                borderRadius: "8px",
                p: 1,
                px: 2,
                mt: 1,
              }}
              onClick={() => onSearchClick(search.query)}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "16.38px",
                  letterSpacing: "0em",
                  color: "#8181B0",
                  width: "100%",

                  overflowWrap: "break-word",
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                {search.name}
              </Typography>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

export default RecentSearchBlock;
