import React, { useState } from "react";
import { FormControl, MenuItem, Select, TableCell, TableRow } from "@mui/material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const FileUploadRow = ({ column, sample, selections, onChange, isUploading }) => {
  const initialSelected =
    selections.find((s) => s.label === column) || selections[selections.length - 1];

  const [selected, setSelected] = useState(initialSelected);

  const handleChange = (event) => {
    const selection = selections.find((s) => s.value === event.target.value);
    setSelected(selection);
    onChange(selection);
  };

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 240,
      },
    },
  };
  
  const shouldShowSelectionSample = sample 
  const shouldShowSelectionColumn = column 
  const shouldShowSelectionBoth = sample && column 
  // const shouldShowSelectionSample = sample && !sample.includes("NA");
  // const shouldShowSelectionColumn = column && !column.includes("NA");
  // const shouldShowSelectionBoth = sample && !sample.includes("NA") && column && !column.includes("NA");
  
  return (
    shouldShowSelectionBoth && (
    <TableRow>
      <TableCell>{shouldShowSelectionColumn ? column : ''}</TableCell>
      <TableCell width={240}>
      {shouldShowSelectionBoth && (
        <FormControl fullWidth size="small" sx={{ maxHeight: "300px" }}>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selected.value}
            onChange={handleChange}
            variant="outlined"
            MenuProps={MenuProps}
            disabled={isUploading}
          >
            {selections.map((selection, index) => (
              <MenuItem value={selection.value} key={index}>
                {selection.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        )}
      </TableCell>
      <TableCell>{shouldShowSelectionSample ? sample : ''}</TableCell>
    </TableRow>
    )
  );
};

export default FileUploadRow;
