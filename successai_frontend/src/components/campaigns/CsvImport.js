import { useRef, useState } from "react";
import Papa from "papaparse";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider,
} from "@mui/material";
import { CloseTwoTone, CloudUploadTwoTone, TaskAlt } from "@mui/icons-material";
import LinearProgress from "@mui/material/LinearProgress";
import FileUploadCsv from "../emailAccounts/FileUploadCsv.js";
import { UploadColoredIcon } from "src/assets/general/UploadColoredIcon.js";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon.js";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon.js";
import {
  useCreateLeadsMutation,
  useDuplicateCheckMutation,
} from "src/services/campaign-service.js";
import { toast } from "react-hot-toast";
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
    value: "location",
  },
  {
    label: "iceBreaker",
    value: "iceBreaker",
  },
  {
    label: "Title",
    value: "title",
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

const selectionsFilters = [
  {
    label: "Compnay",
    value: "company",
  },
  {
    label: "Do not import",
    value: "DO_NOT_IMPORT",
  },
];

const CsvImport = ({ campaign, onLeadsCreate, setSnackbarMsg, setSnackbarOpen, filter=null, onChange = null, setOpenModal=null }) => {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [closeButtonMouseEnter, setCloseButtonMouseEnter] = useState(false);
  const [samples, setSamples] = useState([]);
  const [fileColumns, setFileColumns] = useState([]);
  const [progress, setProgress] = useState(0);
  const [csvData, setCsvData] = useState([]);
  const [leads, setLeads] = useState([]);
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({});
  const maxSizeInBytes = 20 * 1024 * 1024;
  const [createLeads, { isLoading: isUploading }] = useCreateLeadsMutation();
  const [duplicateCheck, { isLoading: isDupUploading }] = useDuplicateCheckMutation();

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
  const validFieldNames = new Set(["companyName", "firstName","location","title", "lastName", "email", "iceBreaker", "phone", "website", "DO_NOT_IMPORT", "Custom_Variable"]);
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
        const isFieldValid = filter? fieldName === 'company': validFieldNames.has(fieldName);

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
    const updatedCsvData = csvData.map((row) =>
      row.map((cell) => {
        if (cell.column === column) return { ...cell, type: selection.value };
        return filter ? {...cell, type: "DO_NOT_IMPORT"} : cell;
      })
    );
    setCsvData(updatedCsvData);
    updateLeads(updatedCsvData);
  };

  function splitCSVStringWithQuotes(csvString) {
    return csvString.match(/(?:[^,"]|"(?:[^"]|"")*")+/g);
  }

  // const handleFileUpload = (file) => {
  //   setProgress(0);
  //   if (file) {
  //     const allowedTypes = ["text/csv"];

  //     if (allowedTypes.includes(file.type)) {
  //       setSelectedFile(file);

  //       const reader = new FileReader();

  //       reader.onprogress = (event) => {
  //         const { total, loaded } = event;
  //         setProgress((loaded / total) * 100);
  //       };

  //       reader.onload = (event) => {
  //         const csv = event.target.result;
  //         const lines = csv.split(/\r?\n/);
  //         const columns = lines[0].split(",");
  //         setFileColumns(columns);

  //         let isSampleSet = false;

  //         const csvData = [];

  //         for (let i = 1; i < lines.length - 1; i++) {
  //           const line = splitCSVStringWithQuotes(lines[i]);

  //           if (!line.some(Boolean)) continue;

  //           if (!isSampleSet) {
  //             setSamples(line);
  //             isSampleSet = true;
  //           }

  //           const row = [];
  //           for (let j = 0; j < line.length; j++) {
  //             const type =
  //               selections.find((s) => s.label === columns[j])?.value ||
  //               selections[selections.length - 1].value;

  //             if (!line[j]) continue;

  //             row.push({
  //               type,
  //               column: columns[j],
  //               value: line[j],
  //             });
  //           }
  //           csvData.push(row);
  //         }

  //         setCsvData(csvData);
  //         updateLeads(csvData);
  //       };

  //       reader.readAsText(file);
  //     } else {
  //       alert("Only .csv files are allowed.");
  //     }
  //   }
  // };
  
    const handleFileUpload = (file) => {
    setProgress(0);
    if (file) {
      const allowedTypes = ["text/csv"];

      if (file.size > maxSizeInBytes) {
        alert("File length should be less than 20MB");
      } else {
        if (allowedTypes.includes(file.type)) {
          setSelectedFile(file);

          const reader = new FileReader();
          const chunkSize = 10 * 1024; // 1 MB chunks (you can adjust this based on your needs)
          let offset = 0;
          let totalChunkLoaded = 0;
          let content = "";
          reader.onloadend = function () {
            if (reader.error) {
              console.error("Error reading file:", reader.error);
              return;
            }
            let snippet1 = new TextDecoder("utf-8").decode(reader.result);
            // Append the chunk data to the content element
            content += snippet1;
            // Continue reading the next chunk
            if (offset < file.size) {
              readNextChunk();
              totalChunkLoaded = offset;
            } else {
              Papa.parse(content, {
                header: true, // Treat the first row as headers
                skipEmptyLines: true,
                dynamicTyping: true, // Automatically convert numbers and booleans
                complete: (results) => {
                  const columns = results.meta.fields;
                  setFileColumns(columns);

                  const leadsArray = [];
                  for (const result of results.data) {
                    let lead = [];
                    for (const key in result) {
                      if (Object.hasOwnProperty.call(result, key)) {
                        const value = result[key];
                        const datatype = filter ? selectionsFilters.find((filter) => filter.label === key)
                         : selections.find((filter) => filter.label === key);

                         lead.push({
                           column: key,
                           type: datatype ? datatype.value : "DO_NOT_IMPORT",
                           value: value,
                          });
                      }
                    }
                    leadsArray.push(lead);
                  }
                  setCsvData(leadsArray);
                  updateLeads(leadsArray);
                },
                error: (error) => {
                  console.error("CSV parsing error:", error.message);
                },
              });
            }
          };
          reader.onprogress = function (event) {
            if (event.lengthComputable) {
              var progress = Math.round((totalChunkLoaded / file.size) * 100);
              if (file.size <= chunkSize) progress = 100;
              progress = progress >= 100 ? 100 : progress;
              setProgress(progress);
            }
          };
          function readNextChunk() {
            var blob = file.slice(offset, offset + chunkSize);
            reader.readAsArrayBuffer(blob);
            offset += chunkSize;
          }
          // Start reading the first chunk
          readNextChunk();
        } else {
          alert("Only .csv files are allowed.");
        }
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

  const handleCompanies = async () => {
    const allCompanyNames = leads.map(obj => obj.company);

    if (allCompanyNames.includes(undefined)) {
      toast.error("Select Company Names to import");
      return;
    }

    onChange('company_name' ,allCompanyNames);
    setOpenModal(false);
  }


  
  const handleDialogUploadAllClick = async () => {
    if(leads[0].email == undefined){
      toast.error('Email parameter is mandatory...')
      return;
    }
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

  const handleClose = () => {
    setOpen(false);
  };

  const ErrorStats = stats.uploadedCount - stats.leads?.length;

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
          padding: '0 10px',
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
                  <FileUploadCsv
                    key={index}
                    column={column}
                    sample={samples[index]}
                    selections={filter == true ? selectionsFilters :  selections}
                    onChange={(s) => handleSelectTypeChange(column, s)}
                    isUploading={isUploading}
                    filter={filter}
                    isSelected={csvData?.length > 0 && Boolean(csvData[0]?.find(cur => cur.type !== "DO_NOT_IMPORT" && cur.column === column))}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {!filter ? (<Box
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
          </Box>) : <></> }
          
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
            onClick={filter ? handleCompanies : checkDuplicates ? handleUploadAllClick : handleDialogUploadAllClick}
          >
            {isUploading || isDupUploading ? (
              <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
            ) : (
              <CloudUploadTwoTone sx={{ mr: 1 }} />
            )}
            Upload All
          </Button>
        </>
      )}

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
  );
};

export default CsvImport;
