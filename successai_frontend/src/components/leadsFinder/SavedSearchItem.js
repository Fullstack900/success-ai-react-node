import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { toast } from "react-hot-toast";
import { DeleteIcon } from "src/assets/general/DeleteIcon";
import { EditIcon } from "src/assets/general/EditIcon";
import { useDeleteSearchMutation } from "src/services/leads-service.js";

const SavedSearchItem = ({ search, onSearchClick, onEditSearchClick }) => {
  const [deleteSearch, { isLoading: isDeleteSearchLoading }] = useDeleteSearchMutation();

  const handleSearchEdit = (event) => {
    event.stopPropagation();
    onEditSearchClick(search._id);
  };

  const handleSearchDelete = async (event) => {
    event.stopPropagation();
    const { message } = await deleteSearch(search._id).unwrap();
    toast.success(message);
  };

  return (
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
        }}
      >
        {search.name}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          ml: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 18,
            height: 18,
          }}
        >
          <IconButton onClick={handleSearchEdit}>
            <EditIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 18,
            height: 18,
            ml: 1,
          }}
        >
          {isDeleteSearchLoading ? (
            <CircularProgress size={20} sx={{ color: "rgb(253, 30, 54)" }} />
          ) : (
            <IconButton onClick={handleSearchDelete}>
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SavedSearchItem;
