import { useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { CloseTwoTone, CloudUploadTwoTone, TaskAlt } from "@mui/icons-material";
import LinearProgress from "@mui/material/LinearProgress";
import FileUploadRow from "../emailAccounts/FileUploadRow.js";
import { UploadColoredIcon } from "src/assets/general/UploadColoredIcon.js";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon.js";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon.js";
import {useAddBlocklistMutation} from "src/services/account-service.js"

import { toast } from "react-hot-toast";

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

const CsvImport = ({ campaign, onBlockListCreate }) => {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [closeButtonMouseEnter, setCloseButtonMouseEnter] = useState(false);
  const [samples, setSamples] = useState([]);
  const [fileColumns, setFileColumns] = useState([]);
  const [progress, setProgress] = useState(0);
  const [csvData, setCsvData] = useState([]);
  const [sheetData, setSheetData] = useState([]);
  const [leads, setLeads] = useState([]);
  const [checkDuplicates, setCheckDuplicates] = useState(true);

  const [addBlocklist, {isLoading : isUploading }] = useAddBlocklistMutation()

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);

    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
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
    const updatedCsvData = csvData.map((row) =>
      row.map((cell) => {
        if (cell.column === column) return { ...cell, type: selection.value };
        return cell;
      })
    );
    setCsvData(updatedCsvData);
    updateLeads(updatedCsvData);
  };

  const handleFileUpload = (file) => {
    setProgress(0);
    if (file) {
      const allowedTypes = ["text/csv"];

      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);

        const reader = new FileReader();

        reader.onprogress = (event) => {
          const { total, loaded } = event;
          setProgress((loaded / total) * 100);
        };

        reader.onload = (event) => {
          const csv = event.target.result;
          const lines = csv.split(/\r?\n/);
          const columns = lines[0].split(",");
          setFileColumns(columns);

          let isSampleSet = false;

          const csvData = [];

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].split(",");
            if (!line.some(Boolean)) continue;

            if (!isSampleSet) {
              setSamples(line);
              isSampleSet = true;
            }

            const row = [];
            for (let j = 0; j < line.length; j++) {
              const type =
                selections.find((s) => s.label === columns[j])?.value ||
                selections[selections.length - 1].value;

              if (!line[j]) continue;

              row.push({
                type,
                column: columns[j],
                value: line[j],
              });
            }
            csvData.push(row);
          }
          
          setCsvData(csvData);
          updateLeads(csvData);
        };

        reader.readAsText(file);
      } else {
        alert("Only .csv files are allowed.");
      }
    }
  };

  const handleDeleteFile = () => {
    fileInputRef.current.value = "";
    setSelectedFile(null);
    setCloseButtonMouseEnter(false);
    setProgress(0);
    setFileColumns([]);
    setCsvData([]);
    setLeads([]);
  };

  const handleUploadAllClick = async () => {
    if (isUploading) return;
    try {
      const { message, totalAdded } = await addBlocklist({
        data: {
          emails : leads,
          type : "CSV"
        },
      }).unwrap();
      onBlockListCreate(totalAdded)
      toast.success(message);
  } catch (error) {
    toast.error(error.data.error.message);
  }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Paper
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          width: "100%",
          height: "260px",
          borderRadius: "12px",
          border: "1px dashed #0071F6",
          mt: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          position: "relative",
          boxShadow: "0px 12px 15px 0px #4B71970D",
          backgroundColor: "#F2F4F6",
        }}
        onClick={() => {
          !closeButtonMouseEnter && fileInputRef.current.click();
        }}
      >
        <input
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={handleFileInputChange}
          ref={fileInputRef}
          accept=".csv"
          disabled={isUploading}
        />
        {selectedFile ? (
          <>
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                lineHeight: "25px",
                color: "#0071F6",
              }}
            >
              Size: {(selectedFile.size / 1000).toFixed(2)} KB
            </Typography>
          </>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
            <UploadColoredIcon />
          </Box>
        )}

        <Typography
          sx={{ fontSize: "20px", fontWeight: 700, lineHeight: "25px", color: "#0071F6" }}
        >
          {selectedFile
            ? selectedFile.name
            : isDragActive
            ? "Drop the files here ..."
            : "Drag files to this area or click to pick files."}
        </Typography>
        {selectedFile && (
          <IconButton
            onMouseEnter={() => {
              setCloseButtonMouseEnter(true);
            }}
            onMouseLeave={() => {
              setCloseButtonMouseEnter(false);
            }}
            sx={{ position: "absolute", right: 0, top: 0, m: 1 }}
            onClick={handleDeleteFile}
            disabled={isUploading}
          >
            <CloseTwoTone sx={{ color: "black" }} />
          </IconButton>
        )}
        {selectedFile && (
          <Box sx={{ width: "80%", mt: 2, display: progress === 100 && "none" }}>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
      </Paper>
      {selectedFile && progress === 100 && (
        <>
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
              Files Processed
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
        </>
      )}
    </Box>
  );
};

export default CsvImport;
