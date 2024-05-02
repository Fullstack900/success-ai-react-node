import { useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
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
import { CheckCircle, CloseTwoTone, CloudUploadTwoTone, TaskAlt } from "@mui/icons-material";
import LinearProgress from "@mui/material/LinearProgress";
import {
  useConnectCustomImapSmtpAccountMutation,
  useTestImapMutation,
  useTestSmtpMutation,
} from "src/services/account-service.js";
import * as Yup from "yup";
import FileUploadRow from "./FileUploadRow.js";
import { convertToNestedObject } from "src/utils/util.js";
import _ from "lodash";
import { UploadColoredIcon } from "src/assets/general/UploadColoredIcon.js";
import toast from "react-hot-toast";

const selections = [
  {
    label: "Email",
    value: "email",
  },
  {
    label: "First Name",
    value: "name.first",
  },
  {
    label: "Last Name",
    value: "name.last",
  },
  {
    label: "IMAP Username",
    value: "imap.username",
  },
  {
    label: "IMAP Password",
    value: "imap.password",
  },
  {
    label: "IMAP Host",
    value: "imap.host",
  },
  {
    label: "IMAP Port",
    value: "imap.port",
  },
  {
    label: "SMTP Username",
    value: "smtp.username",
  },
  {
    label: "SMTP Password",
    value: "smtp.password",
  },
  {
    label: "SMTP Host",
    value: "smtp.host",
  },
  {
    label: "SMTP Port",
    value: "smtp.port",
  },
  {
    label: "Reply To",
    value: "replyTo",
  },
  {
    label: "Daily Limit",
    value: "campaign.dailyLimit",
  },
  {
    label: "Sending gap in minutes",
    value: "campaign.waitTime",
  },
  {
    label: "Warmup Enabled",
    value: "warmup.enabled",
  },
  {
    label: "Warmup Increment",
    value: "warmup.basicSetting.increasePerDay",
  },
  {
    label: "Warmup Limit",
    value: "warmup.basicSetting.limitPerDay",
  },
  {
    label: "Warmup | Reply Rate Percent",
    value: "warmup.basicSetting.replyRate",
  },
  {
    label: "Warmup | Read Emulation",
    value: "warmup.advanceSetting.readEmulation",
  },
  {
    label: "Warmup | Warm tracking domain",
    value: "warmup.advanceSetting.customTrackingDomain",
  },
  {
    label: "Warmup | Weekday Only",
    value: "warmup.advanceSetting.weekdayOnly",
  },
  {
    label: "Warmup | Open rate",
    value: "warmup.advanceSetting.OpenRate",
  },
  {
    label: "Warmup | Spam protection rate",
    value: "warmup.advanceSetting.spamProtectionRate",
  },
  {
    label: "Warmup | Mark important rate",
    value: "warmup.advanceSetting.markImportantRate",
  },
  {
    label: "Do not import",
    value: "DO_NOT_IMPORT",
  },
];

const BulkUpload = ({ isCanceled }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [closeButtonMouseEnter, setCloseButtonMouseEnter] = useState(false);
  const [samples, setSamples] = useState([]);
  const [fileColumns, setFileColumns] = useState([]);
  const fileInputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [csvData, setCsvData] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const updateAccountsByCsvData = (data) => {
    const updatedAccounts = data
      .map((row) => {
        const account = {
          status: {
            type: "pending",
            message: "Pending",
          },
        };
        row.forEach((cell) => (account[cell.type] = cell.value));
        return account;
      })
      .map(convertToNestedObject)
      .map((account) => {
        const trues = ["true", "yes"];
        if (trues.includes(account.warmup?.enabled?.toLowerCase())) {
          account.warmup.enabled = true;
        } else {
          account.warmup.enabled = false;
        }
        return account;
      });
    setAccounts(updatedAccounts);
  };

  const handleSelectTypeChange = (column, selection) => {
    const updatedCsvData = csvData.map((row) =>
      row.map((cell) => {
        if (cell.column === column) return { ...cell, type: selection.value };
        return cell;
      })
    );
    setCsvData(updatedCsvData);
    updateAccountsByCsvData(updatedCsvData);
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

              if (type === "DO_NOT_IMPORT" || !line[j]) continue;

              row.push({
                type,
                column: columns[j],
                value: line[j],
              });
            }
            csvData.push(row);
          }

          setCsvData(csvData);
          updateAccountsByCsvData(csvData);
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
    setAccounts([]);
  };

  const [testImap] = useTestImapMutation();
  const [testSmtp] = useTestSmtpMutation();
  const [connectCustomImapSmtpAccount] = useConnectCustomImapSmtpAccountMutation();

  const setUploadStatus = (index, status) => {
    setAccounts((accounts) =>
      accounts.map((account, i) => {
        if (index === i) return { ...account, status };
        return account;
      })
    );
  };

  const uploadValidationSchema = Yup.object({
    name: Yup.object({
      first: Yup.string().required("First Name is missing"),
      last: Yup.string().required("Last Name is missing"),
    }),
    email: Yup.string().email("Must be a valid email").max(255).required("Email is missing"),
    imap: Yup.object({
      username: Yup.string().required("IMAP Username missing"),
      password: Yup.string().max(255).required("IMAP Password is missing"),
      host: Yup.string().required("IMAP Host is missing"),
      port: Yup.string().required("IMAP Port is missing"),
    }),
    smtp: Yup.object({
      username: Yup.string().required("SMTP Username missing"),
      password: Yup.string().max(255).required("SMTP Password is missing"),
      host: Yup.string().required("SMTP Host is missing"),
      port: Yup.string().required("SMTP Port is missing"),
    }),
    campaign: Yup.object({
      dailyLimit: Yup.number().integer().label("Daily Limit"),
      waitTime: Yup.number().integer().label("Sending gap in minutes"),
    }),
    replyTo: Yup.string().email().label("Reply to"),
    warmup: Yup.object({
      basicSetting: Yup.object({
        increasePerDay: Yup.number().integer().min(1).max(4).label("Warmup Increment"),
        limitPerDay: Yup.number().integer().min(1).max(50).label("Warmup limit"),
        replyRate: Yup.number().integer().min(0).max(100).label("Warmup | Reply Rate Percent"),
      }),
      advanceSetting: Yup.object({
        weekdayOnly: Yup.boolean(),
        readEmulation: Yup.boolean(),
        customTrackingDomain: Yup.boolean(),
        openRate: Yup.number().integer().min(0).max(100),
        spamProtectionRate: Yup.number().integer().min(0).max(100),
        markImportantRate: Yup.number().integer().min(0).max(100),
      }),
    }),
  });

  const handleUploadAll = async () => {
    if (isUploading) return;

    setIsUploading(true);

    let totalAccounts = 0;
    let connectedAccounts = 0;

    for (let i = 0; i < accounts.length; i++) {
      if (isCanceled.current) break;

      const account = accounts[i];

      try {
        await uploadValidationSchema.validate(account);

        // Test IMAP connection
        setUploadStatus(i, { type: "progress", message: "Testing IMAP connection" });
        await testImap(account.imap).unwrap();

        // Test SMTP connection
        setUploadStatus(i, { type: "progress", message: "Testing SMTP connection" });
        await testSmtp(account.smtp).unwrap();

        // Create Account
        setUploadStatus(i, { type: "progress", message: "Connecting..." });
        await connectCustomImapSmtpAccount({
          data: _.omit(account, "status", "DO_NOT_IMPORT"),
        }).unwrap();

        setUploadStatus(i, { type: "success", message: "Connected" });

        // Increment connectedAccounts count when successfully connected
        connectedAccounts++;
      } catch (error) {
        setUploadStatus(i, { type: "error", message: error.message || error.data.error.message });
      }

      // Increment totalAccounts count for each account
      totalAccounts++;
    }
    toast.success(`${connectedAccounts} out of ${totalAccounts} uploaded successfully!`);

    setIsUploading(false);
  };

  const statusTypes = {
    pending: {
      color: "rgba(0,0,0,0.5)",
      element: null,
    },
    progress: {
      color: "rgb(33, 111, 237)",
      element: <CircularProgress size={20} sx={{ mr: 1 }} />,
    },
    success: {
      color: "rgb(33, 111, 237)",
      element: <CheckCircle sx={{ mr: 1 }} />,
    },
    error: {
      color: "#F04438",
      element: null,
    },
  };

  return (
    <>
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
              onClick={handleUploadAll}
            >
              {isUploading ? (
                <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
              ) : (
                <CloudUploadTwoTone sx={{ mr: 1 }} />
              )}
              Upload All
            </Button>
            <TableContainer sx={{ mt: 2, mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={420}>Email</TableCell>
                    <TableCell width={160}>First Name</TableCell>
                    <TableCell width={160}>Last Name</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.map((account, index) => (
                    <TableRow key={index}>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>{account.name?.first}</TableCell>
                      <TableCell>{account.name?.last}</TableCell>
                      <TableCell
                        sx={{
                          display: "flex",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: statusTypes[account.status.type].color,
                        }}
                      >
                        {statusTypes[account.status.type].element}
                        {account.status.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </>
  );
};

export default BulkUpload;
