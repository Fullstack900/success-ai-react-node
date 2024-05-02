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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Google } from "src/assets/Google.js";
import FileUploadRow from "../emailAccounts/FileUploadRow.js";
import { useState } from "react";
import { fetchGoogleSheet } from "src/utils/util.js";
import { toast } from "react-hot-toast";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon.js";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon.js";
import { useCreateLeadsMutation,useDuplicateCheckMutation } from "src/services/campaign-service.js";
const selections = [
  {
    label: "Email",
    value: "email",
  },
  {
    label: "First Name",
    value: "firstName",
  },
  {
    label: "Last Name",
    value: "lastName",
  },
  {
    label: "Company Name",
    value: "companyName",
  },

  {
    label: "Phone",
    value: "phone",
  },
  {
    label: "Website",
    value: "website",
  },
  {
    label: "Location",
    value: "Location",
  },
  {
    label: "Title",
    value: "Title",
  },
  {
    label: "iceBreaker",
    value: "iceBreaker",
  },
  {
    label: "Custom Variable",
    value: "Custom_Variable",
  },
  {
    label: "Do not import",
    value: "DO_NOT_IMPORT",
  },
];

const GoogleSheetImport = ({ campaign, onLeadsCreate ,setSnackbarMsg,setSnackbarOpen}) => {
  const [googleSheetLink, setGoogleSheetLink] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [sheetData, setSheetData] = useState([]);
  const [leads, setLeads] = useState([]);
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({});  const [fileColumns, setFileColumns] = useState([]);
  const [samples, setSamples] = useState([]);

  const [createLeads, { isLoading: isUploading }] = useCreateLeadsMutation();
  const [duplicateCheck, { isLoading: isDupUploading }] = useDuplicateCheckMutation();
  
  const handleImportClick = async () => {
    try {
      setIsImporting(true);
      const data = await fetchGoogleSheet(googleSheetLink);
      if(data?.error){
        toast.error("Link has more than one sheet");
        return;
      }
      const {columns, rows}= data;
      
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
      updateLeads(sheetData);
    } catch (error) {
      toast.error("Invalid link - ensure the sheet is publicly accessible and has data.");
    } finally {
      setIsImporting(false);
    }
  };

  const updateLeads = (data) => {
    const validFieldNames = new Set(["companyName", "firstName", "lastName", "email", "iceBreaker", "phone", "website", "DO_NOT_IMPORT", "Custom_Variable"]);
    const validColumnNames = new Set(
      selections.map(item => item.value.toLowerCase().trim())
    );

    const updateLeads = data.map((row) => {
      const extractedLead = {};
      const remainingLead = {};
      row.forEach((cell) => {
        const fieldName = cell.type;
        const columnName = cell.column.toLowerCase().trim();

        if (fieldName !== "DO_NOT_IMPORT") {
          const isFieldValid = validFieldNames.has(fieldName);

          if (isFieldValid) {
            if (fieldName === "Custom_Variable" && !validColumnNames.has(columnName)) {
              remainingLead[columnName] = cell.value;
            } else {
              extractedLead[fieldName] = cell.value;
            }
          }
        }
      });
      return {
        ...extractedLead,
        remainingData: remainingLead,
      };
    });

    setLeads(updateLeads);
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

  const handleDialogUploadAllClick = async () => {
    setOpen(false);
    if (isUploading) return;
    try {
      let totalCreatedLeads = [];
      let blockLeads = 0;
      setSnackbarOpen(true);

      setSnackbarMsg(`Uploading leads...`);
      const limit = 500;
      const total = checkDuplicates ? stats?.leads?.length : leads.length;
      let skippedLeads;
      for (let i = 0; i < total; i += limit) {
        const start = i;
        const end = i + limit > total ? i + (total % limit) : i + limit;
        // if (checkDuplicates) {
        //   setSnackbarMsg(`Checking ${end} / ${total} leads for upload...`);
        // }
        const { message, createdLeads, blockLeadsCount } = await createLeads({
          id: campaign._id,
          data: {
            leads: checkDuplicates ? stats.leads.slice(start, end) : leads.slice(start, end),
            checkDuplicates,
          },
        }).unwrap();
        blockLeads = blockLeadsCount;
        totalCreatedLeads = [...totalCreatedLeads, ...createdLeads];

        setSnackbarMsg(`${end} / ${total} leads uploaded!`);
        const [addedLeadsPart, skippedLeadsPart] = message.split(" and ");
        skippedLeads = skippedLeadsPart;
      }
      onLeadsCreate(true);

      setTimeout(() => {
        setSnackbarOpen(false);
        toast.success(`${totalCreatedLeads.length} out of ${total} uploaded successfully!`);
        toast.success(skippedLeads);
        if (blockLeads > 0) {
          toast.success(`${blockLeads} contacts were blocked by your blocklist.`)
        }
      }, 1500);
    } catch (error) {
      toast.error(error.data.error.message);
    }
  };

  const handleUploadAllClick = async () => {
    try {
      const { createdLeads } = await duplicateCheck({
        id: campaign._id,
        data: {
          leads: leads,
          checkDuplicates,
          stats: true,
        },
      }).unwrap();
      setStats(createdLeads);
      setOpen(true);
    } catch (error) {
      toast.error(error.data.error.message);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const ErrorStats = stats.uploadedCount - stats.leads?.length;
  // const handleUploadAllClick = async () => {
  //   if (isUploading) return;
  //   try {
  //     const { message, createdLeads, blockLeadsCount } = await createLeads({
  //       id: campaign._id,
  //       data: {
  //         leads,
  //         checkDuplicates,
  //       },
  //     }).unwrap();
  //     onLeadsCreate(true);
  //     const [addedLeadsPart, skippedLeadsPart] = message.split(" and ");
  //     toast.success(addedLeadsPart);
  //     setTimeout(() => {
  //       toast.success(skippedLeadsPart);
  //     }, 1000);
  //     if (blockLeadsCount > 0) {
  //       toast.success(`${blockLeadsCount} contacts were blocked by your blocklist.`)
  //     }
  //   } catch (error) {
  //     toast.error(error.data.error.message);
  //   }
  // };

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
            onClick={ checkDuplicates ? handleUploadAllClick : handleDialogUploadAllClick}
          >
            {isUploading ? (
              <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
            ) : (
              <CloudUploadTwoTone sx={{ mr: 1 }} />
            )}
            Upload All
          </Button>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle sx={{ fontSize: "25px", color: "#595959", textAlign: "center" }}>
              Are you sure?
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ fontSize: "16px", fontWeight: "500" }}>
                This will upload{" "}
                <Typography component="span" color={"blue"}>
                  {stats.uploadedCount}{" "}
                </Typography>{" "}
                contacts to your campaign .{" "}
                <Typography component="span" color={"blue"}>
                  {" "}
                  {stats?.emailCampaignCount || stats?.duplicateEmailsCount}{" "}
                </Typography>{" "}
                contacts had errors.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
              <Button
                onClick={handleDialogUploadAllClick}
                variant="contained"
                sx={{
                  fontSize: "16px",
                  borderRadius: "12px",
                  px: 2.5,
                  py: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                {isUploading || isDupUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <CloudUploadTwoTone sx={{ mr: 1 }} />
                    Upload
                  </>
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClose}
                sx={{
                  // backgroundColor: "#595959",
                  color: "Black",
                  fontSize: "16px",
                  borderRadius: "12px",
                  px: 3.2,
                  py: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 1,
                  "&:hover": {
                    backgroundColor: "#787878",
                  },
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </>
  );
};

export default GoogleSheetImport;
