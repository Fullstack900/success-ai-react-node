import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon.js";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon.js";
import {useAddBlocklistMutation} from "src/services/account-service.js"

const ManualImport = ({ campaign, onBlockListCreate }) => {

  const [manualImportText, setManualImportText] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [addBlocklist, {isLoading : isLoadingBlocklist}] = useAddBlocklistMutation()

  const handleImportEmailsClick = async () => {

    const lines = manualImportText.trim().split("\n");
    const emails = lines.map((line) => {
      const [email] = line
        .trim()
        .replaceAll(/["'<>]/g, "")
        .split(" ")
        .map((v) => v.trim());

      return {email};
    });


    try {
      const { message, totalAdded } = await addBlocklist({
        data: {
          emails,
          type : "Manual"
        },
      }).unwrap();
      onBlockListCreate(totalAdded)
      toast.success(message);
      setManualImportText("");
    } catch (error) {
      toast.error(error.data.error.message);
    }


  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: "25px",
            color: "#28287B",
          }}
        >
          Bulk Add Emails by Hand
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            flexDirection: "column",
            backgroundColor: "#F2F4F6",
            p: 2,
            borderRadius: "12px",
            mt: 2,
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "18px",
            }}
          >
            💡 For adding emails with associated names, use any of these formats:
          </Typography>
          <Typography
            sx={{
              width: "100%",
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "20px",
              p: 2,
              pb: 0,
            }}
          >
            jane@smith.com
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: "20px",
            color: "#8181B0",
            mt: 3,
          }}
        >
          Input or paste email IDs - enter one email per line
        </Typography>
        <TextField
          multiline
          rows={6}
          fullWidth
          variant="outlined"
          sx={{
            mt: 1,
            backgroundColor: "white",
            "& div": { pl: 2 },
            "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
            "& div input": {
              p: 1.3,
              px: 3,
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: "16px",
              letterSpacing: "0em",
              "&::placeholder": {
                color: "rgba(40, 40, 123, 0.5)",
              },
            },
          }}
          value={manualImportText}
          onChange={(e) => setManualImportText(e.target.value)}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            disabled={!manualImportText.trim()}
            onClick={handleImportEmailsClick}
            alignItems = "center"
          >
            {isLoadingBlocklist ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Import Emails"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ManualImport;
