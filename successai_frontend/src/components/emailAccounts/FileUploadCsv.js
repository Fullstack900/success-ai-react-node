import React, { useEffect, useState } from "react";
import { FormControl, MenuItem, Select, TableCell, TableRow } from "@mui/material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const FileUploadCsv = ({ column, sample, selections, onChange, isUploading, filter, isSelected }) => {
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

  useEffect(() => {
    if(!isSelected && filter){
      setSelected(selections[selections.length - 1]);
    }
  }, [isSelected])

  
  return (
    <TableRow>
      <TableCell>{column}</TableCell>
      <TableCell width={240}>
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
      </TableCell>
      <TableCell>{sample}</TableCell>
    </TableRow>
  );
};

export default FileUploadCsv;
