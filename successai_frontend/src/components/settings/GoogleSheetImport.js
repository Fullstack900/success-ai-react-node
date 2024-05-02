import { CloudUploadTwoTone, TaskAlt } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Google } from "src/assets/Google.js";
import FileUploadRow from "../emailAccounts/FileUploadRow.js";
import { fetchGoogleSheet } from "src/utils/util.js";
import { useState } from "react";
import {useAddBlocklistMutation} from "src/services/account-service.js"
import { toast } from "react-hot-toast";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon.js";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon.js";

const selections = [
  {
    label: "Email",
    value: "email",
  },
  {
    label: "Do not import",
    value: "DO_NOT_IMPORT",
  },
];

const GoogleSheetImport = ({ campaign, onBlockListCreate }) => {
  const [googleSheetLink, setGoogleSheetLink] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [sheetData, setSheetData] = useState([]);
  const [leads, setLeads] = useState([]);
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [fileColumns, setFileColumns] = useState([]);
  const [samples, setSamples] = useState([]);
  const [link, setLink] = useState("")
  const [addBlocklist, {isLoading : isUploading }] = useAddBlocklistMutation()

  const handleImportClick = async () => {
    try {
      setIsImporting(true);
      const [columns, ...rows] = await fetchGoogleSheet(googleSheetLink);

      if (!columns || !rows[0]) {
        return toast.error("Found 0 rows - ensure the sheet is publicly accessible and has data.");
      }

      setFileColumns(columns);
      setSamples(rows[0]);

      const sheetData = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const sheetRow = [];

        for (let j = 0; j < row.length; j++) {
          const type =
            selections.find((s) => s.label === columns[j])?.value ||
            selections[selections.length - 1].value;

          if (!row[j]) continue;

          sheetRow.push({
            type,
            column: columns[j],
            value: row[j],
          });
        }

        sheetData.push(sheetRow);
      }

      setSheetData(sheetData);
      setLink(googleSheetLink);
      updateLeads(sheetData);
    } catch (error) {
      toast.error("Invalid link - ensure the sheet is publicly accessible and has data.");
    } finally {
      setIsImporting(false);
    }
  };

  const updateLeads = (data) => {

    const updatedLeads = data.map((row) => {
      const lead = {};
      row.forEach((cell) => cell.type === "email" && (lead[cell.type] = cell.value));
      return lead;
    });
    setLeads(updatedLeads);
  };

  const handleSelectTypeChange = (column, selection) => {
    const updatedSheetData = sheetData.map((row) =>
      row.map((cell) => {
        if (cell.column === column) return { ...cell, type: selection.value };
        return cell;
      })
    );
    setSheetData(updatedSheetData);
    updateLeads(updatedSheetData);
  };

  const handleUploadAllClick = async () => {
    if (isUploading) return;
    try {
      const { message, totalAdded } = await addBlocklist({
        data: {
          emails : leads,
          type : "Google",
          link : link
        },
      }).unwrap();
      onBlockListCreate(totalAdded)
      toast.success(message);
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
        <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 1 }}>
            <Google />
          </Box>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: "25px",
              color: "#28287B",
            }}
          >
            Google Sheets
          </Typography>
        </Box>
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
            💡 Make sure your Google Sheet is publicly accessible
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
          Paste your Google Sheets link here
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          sx={{
            mt: 1,
            backgroundColor: "white",
            "& div": { pl: 1 },
            "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
            "& div input": {
              p: 1.3,
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: "16px",
              letterSpacing: "0em",
              "&::placeholder": {
                color: "rgba(40, 40, 123, 0.5)",
              },
            },
          }}
          disabled={isUploading}
          value={googleSheetLink}
          onChange={(e) => setGoogleSheetLink(e.target.value)}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            disabled={!googleSheetLink.trim() || isUploading}
            onClick={handleImportClick}
          >
            {isImporting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Import"}
          </Button>
        </Box>
      </Box>
      {leads.length !== 0 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              mt: 2,
            }}
          >
            <TaskAlt sx={{ color: "rgb(33, 111, 237)", mr: 1 }} />
            <Typography sx={{ fontWeight: 600, color: "rgb(33, 111, 237)" }}>
              File Processed
            </Typography>
          </Box>
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={360}>Column Name</TableCell>
                  <TableCell width={360}>Select Type</TableCell>
                  <TableCell>Samples</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fileColumns.map((column, index) => (
                  <FileUploadRow
                    key={index}
                    column={column}
                    sample={samples[index]}
                    selections={selections}
                    onChange={(s) => handleSelectTypeChange(column, s)}
                    isUploading={isUploading}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              textAlign: "center",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  icon={<OffCheckboxCustomIcon />}
                  checkedIcon={<OnCheckboxCustomIcon />}
                  checked={checkDuplicates}
                  onChange={(e, value) => setCheckDuplicates(value)}
                />
              }
              label="Check for duplicates across all campaigns"
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: "13px",
                  fontWeight: 500,
                  lineHeight: "16px",
                  color: "#28287B",
                },
                mt: 2,
              }}
            />
          </Box>
          <Button
            variant="contained"
            sx={{
              fontSize: "16px",
              px: 3,
              py: 1.5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 1,
              mx: "auto",
            }}
            onClick={handleUploadAllClick}
          >
            {isUploading ? (
              <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
            ) : (
              <CloudUploadTwoTone sx={{ mr: 1 }} />
            )}
            Upload All
          </Button>
        </Box>
      )}
    </>
  );
};

export default GoogleSheetImport;
