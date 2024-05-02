import { Box, CircularProgress, Typography } from "@mui/material";
import { LFSavedSearches } from "src/assets/leadFinder/LFSavedSearches.js";
import SavedSearchItem from "./SavedSearchItem.js";

const SavedSearchBlock = ({ searches, isLoading, onSearchClick, onEditSearchClick }) => {
  return (
    <>
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
                <LFSavedSearches />
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
                  Saved Searches
                </Typography>
                {!searches?.saved?.length && (
                  <>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: "16.38px",
                        letterSpacing: "0em",
                        color: "#8181B0",
                      }}
                    >
                      No saved searches
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
            {searches?.saved?.map((search) => (
              <SavedSearchItem
                key={search._id}
                search={search}
                onSearchClick={onSearchClick}
                onEditSearchClick={onEditSearchClick}
              />
            ))}
          </>
        )}
      </Box>
    </>
  );
};

export default SavedSearchBlock;
