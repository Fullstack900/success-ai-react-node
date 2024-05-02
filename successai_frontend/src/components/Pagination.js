import React, { useState } from "react";
import {
  Box,
  IconButton,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  TextField,
  useTheme,
} from "@mui/material";
import {
  ChevronLeftOutlined,
  ChevronRightOutlined,
  KeyboardDoubleArrowRightOutlined,
  KeyboardDoubleArrowLeftOutlined,
} from "@mui/icons-material";

const Pagination = ({ limit, handleLimitChange, page, length, total, setPage }) => {
  const theme = useTheme();
  const pageCount = Math.ceil(total / limit);
  const [pageNum, setPageNum] = useState(page);

  const handleChange = (e) => {
    setPageNum(e.target.value);
  };
  const handleSubmit = (e) => {
    if (/[1-9]/.test(e.target.value) && Number(e.target.value) <= pageCount) {
      setPage(Number(e.target.value));
    }

    e.preventDefault();
  };
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: { xs: "column", sm: "row" },
        rowGap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: { xs: "100%", sm: "fit-content" },
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}
        >
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={limit}
            onChange={handleLimitChange}
            sx={{ width: "fit-content", height: "30px" }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
          <Typography
            sx={{ fontSize: "13px", fontWeight: 700, lineHeight: "16.38px", color: "#28287B" }}
          >
            Per page
          </Typography>
        </Box>
        <Box
          sx={{
            fontSize: "13px",
            fontWeight: 700,
            lineHeight: "16.38px",
            color: "#28287B",
            display: { xs: "block", sm: "none" },
          }}
        >{`${limit * (page - 1) + 1}-${limit * page - (limit - length)} of ${total}`}</Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          width: { xs: "100%", sm: "fit-content" },
        }}
      >
        <Box
          sx={{
            fontSize: "13px",
            fontWeight: 700,
            lineHeight: "16.38px",
            color: "#28287B",
            display: { xs: "none", sm: "block" },
          }}
        >{`${limit * (page - 1) + 1}-${limit * page - (limit - length)} of ${total}`}</Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            width: { xs: "100%", sm: "fit-content" },
          }}
        >
          <Box>
            <Tooltip title="Skip to first" placement="top" arrow>
              <IconButton
                onClick={() => setPage(1)}
                disabled={page === 1}
                sx={{ border: `1px solid ${theme.palette.grey[300]}`, borderRadius: 0, p: 0.5 }}
              >
                <KeyboardDoubleArrowLeftOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Previous" placement="top" arrow>
              <IconButton
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                sx={{ border: `1px solid ${theme.palette.grey[300]}`, borderRadius: 0, p: 0.5 }}
              >
                <ChevronLeftOutlined />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
            <TextField
              sx={{ width: "60px", height: "30px" }}
              value={pageNum}
              onChange={handleChange}
              onKeyDown={(e) => (e.key === "Enter" ? handleSubmit(e) : null)}
            />{" "}
            <Typography
              sx={{ fontSize: "13px", fontWeight: 700, lineHeight: "16.38px", color: "#28287B" }}
            >
              {" "}
              {`Of ${pageCount}`}
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Next" placement="top" arrow>
              <IconButton
                onClick={() => setPage(Number(page) + 1)}
                disabled={page === pageCount}
                sx={{ border: `1px solid ${theme.palette.grey[300]}`, borderRadius: 0, p: 0.5 }}
              >
                <ChevronRightOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Skip to last" placement="top" arrow>
              <IconButton
                onClick={() => setPage(pageCount)}
                disabled={page === pageCount}
                sx={{ border: `1px solid ${theme.palette.grey[300]}`, borderRadius: 0, p: 0.5 }}
              >
                <KeyboardDoubleArrowRightOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Pagination;
