import {
  Autocomplete,
  Box,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  List,
  Button,
  useTheme,
  createTheme
} from "@mui/material";

import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon";
import React, { useEffect } from "react";
import useMediaQuery from '@mui/material/useMediaQuery';

const checkboxOfIcon = <OffCheckboxCustomIcon />;
const checkboxOnIcon = <OnCheckboxCustomIcon />;

const LocationSearch = ({
  item,
  handleChange,
  labelHandler,
  valueHandler,
  filter,
  FaChevronDown,
  clearLocation,
  setClearLocation,
  distance,
  fetchData=null
}) => {
  const [selected, setSelected] = React.useState(filter[item?.name] || []);

  const [selectedParent, setSelectedParent] = React.useState([]);
  const [parent, setParent] = React.useState([]);
  const [expanded, setExpanded] = React.useState([]);
  const [clickExpand, setClickExpand] = React.useState([]);
  const [list, setList] = React.useState(item.menuItems);
  const customTheme = createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 1484, // Change the maximum width for 'sm' breakpoint to 700 pixels
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
  });
  const isSmallScreen = useMediaQuery(customTheme.breakpoints.down('sm'));
  const theme = useTheme();

  useEffect(() => {
    if (selected.length === 0) {
      setList(item.menuItems);
      setSelectedParent([]);
    }
    handleChange(item.name, selected, parent);
  }, [selected]);
  useEffect(() => {
    if (clearLocation) {
      setSelected([]);
      setClearLocation(false);
    }
  }, [clearLocation, setClearLocation]);

  useEffect(() => {
    const close = document.getElementsByClassName("MuiAutocomplete-clearIndicator")?.[0];
    if (close) {
      close.addEventListener("click", () => {
        setList(item.menuItems);
        setExpanded([...clickExpand]);
      });
    }
  });


  useEffect(()=>{
    if (item.label == 'Location' && distance !=0) {
      let data;
      data = new Set([...selected].map(city => city.split('::')[0] ));
      data = new Set([...data].map(city => city + `::~${distance}km`));
      const unique = Array.from(data);
      setSelected(unique);
    }
  },[distance])


  const handleExpand = (parent) => {
    const exist = expanded.find((e) => e === parent);
    if (exist) {
      const filtered = expanded.filter((e) => e !== parent);
      setExpanded(filtered);
      setClickExpand(filtered);
    } else {
      setExpanded([...expanded, parent]);
      setClickExpand([...expanded, parent]);
    }
  };

  const handleParentSelect = (parent) => {
    const exist = selectedParent.find((e) => e === parent.label);
    if (exist) {
      const filtered = selectedParent.filter((e) => e !== parent.label);
      setSelectedParent(filtered);
      const locations = selected.filter((e) => !parent.children.includes(e));
      setSelected(locations);
    } else {
      setSelectedParent([...selectedParent, parent.label]);
      setParent([...selectedParent, parent.label])
      let locations = new Set([...selected, ...parent.children]);
      locations = item.label == 'Location' && distance != 0 ?  new Set([...locations].map(city => city + `::~${distance}km`)) : locations;
      const unique = Array.from(locations);
      setSelected(unique);
    }
  };
  const handleSelect = (child, siblings, parent) => {
    const exist = selected.find((e) => e === child);
    const ref = item.menuItems.find((menu) => menu.label === parent);

    if (exist) {
      const filtered = selected.filter((e) => e !== child);
      setSelected(filtered);
      if (selectedParent.includes(parent)) {
        setSelectedParent(selectedParent.filter((e) => e !== parent));
      }
    } else {
      const allChildSelected = siblings.every((e) => (e === child ? true : selected.includes(e)));

      if (allChildSelected && siblings.length === ref.children.length) {
        setSelectedParent([...selectedParent, parent]);
      }
      child = item.label == 'Location' && distance !=0 ?  child + `::~${distance}km` : child;
      setSelected([...selected, child]);
    }
  };
  const OptionItem = ({ option, props }) => {
    const [count, setCount] = React.useState(1);
    const [listItems, setListItems] = React.useState(option.children.slice(0, 25 * count));

    const showMore = () => {
      setListItems(option.children.slice(0, 25 * (count + 1)));
      setCount(count + 1);
    };
    return (
      <li
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          px: 0,
          width: "100%",
        }}
        {...props}
      >
        <Box
          sx={{ width: "200px", display: "flex", justifyContent: "flex-start", alignItems: "center" }}
        >
          <IconButton onClick={() => handleExpand(option.label)}>
            {expanded.some((e) => e === option.label) ? "-" : "+"}
          </IconButton>
          <Checkbox
            icon={checkboxOfIcon}
            checkedIcon={checkboxOnIcon}
            style={{ marginRight: 8 }}
            checked={selectedParent.some((e) => e === option.label)}
            onChange={() => handleParentSelect(option)}
          />
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 500,
              lineHeight: "16px",
              color: "#28287B",
              overflowWrap: "break-word",
            }}
          >
            {option.label + ` (${option.children.length})`}
          </Typography>
        </Box>
        {expanded.some((e) => e === option.label) && (
          <List sx={{ width: 350, pl: 4 }}>
            {listItems.map((child) => (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <Checkbox
                  icon={checkboxOfIcon}
                  checkedIcon={checkboxOnIcon}
                  style={{ marginRight: 8 }}
                  checked={selected.some((e) => e.includes(child))}
                  onChange={() => handleSelect(child, option.children, option.label)}
                />
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 500,
                    lineHeight: "16px",
                    color: "#28287B",
                  }}
                >
                  {child}
                </Typography>
              </Box>
            ))}
            {listItems.length < option.children.length && (
              <Button onClick={showMore}>Show more ...</Button>
            )}
          </List>
        )}
      </li>
    );
  };

  const filterOptions = async(input) => {
    if (input === "") {
      setList(item.menuItems);
      setSelected([]);

      setExpanded([...clickExpand]);
      setSelectedParent([]);
      return;
    }
    let suggestions = await fetchData('geo', input);

    let newOptions = [];

    let searchExpand = [];
    item.menuItems?.forEach((element) => {
      if (new RegExp(input, "ig").test(element.label)) {
        newOptions.push(element);
      } else if (element.children?.find((child) => new RegExp(input, "ig").test(child))) {
        searchExpand = searchExpand.concat(element.label);
        const newOption = {
          ...element,
          children: element.children?.filter((child) => new RegExp(input, "ig").test(child)),
        };
        newOptions.push(newOption);
      }
    });
    const unique = new Set([...clickExpand, ...searchExpand]);

    if (unique.length > 0 || newOptions.length > 0) {
      setExpanded(Array.from(unique));
      setList(newOptions);
    } else {
      setExpanded(['Cities Suggestions']);
      setList([{id: 0, label: 'Cities Suggestions', children: suggestions}])
    }
  };
  return (
    <Autocomplete
      // freeSolo
      multiple
      id="checkboxes-tags-demo"
      // options={item.menuItems}
      noOptionsText={"No locations found"}
      // forcePopupIcon={false}

      options={list}
      disableCloseOnSelect
      getOptionLabel={(option) => option.label || option}
      renderOption={(props, option) => {
        return <OptionItem option={option} props={props} />;
      }}
      filterOptions={(x) => x}
      renderTags={(value) => (
        <Box
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: "18px",
            letterSpacing: "0px",
            color: "#28287B",
            marginTop: "-3px",
          }}
        >
          {value.join(", ")}
        </Box>
      )}
      renderInput={(params) => (
        <form autoComplete={"new-password"}>
          <TextField
            {...params}
            // label={item.label}

            placeholder={item.label}
            variant="outlined"
            onKeyDown={(e) => {
              let isValue=false
              if(e.key === "Enter"){
                isValue = item.menuItems.some((menuItem) =>
                  menuItem.children.map(child => child.toLowerCase()).includes(e.target.value.toLowerCase())
                );
                valueHandler(isValue);
                isValue && handleChange(item.name, [e.target.value], parent)
                labelHandler(item.label);
                e.preventDefault()
              }
            }}
            sx={{
              maxHeight: 40,
              backgroundColor: "white",
              "& div": {
                pl: "3px",
                "& .MuiAutocomplete-endAdornment": {
                  right: 0,
                  top: 0,
                  "& .MuiSvgIcon-root": {
                    width: "15px",
                    height: "15px",
                  },
                },
              },
              "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
              "& div input": {
                width: "100%",
                overflow: "hidden",
                fontSize: "13px",
                fontWeight: 400,
                lineHeight: "16px",
                letterSpacing: "0em",
                "&::placeholder": {
                  fontWeight: selected?.length > 0 ? "500" : "700",
                  fontSize: filter[item.name]?.length > 0 ? "13px" : isSmallScreen ? "10px" : "14px",
                  color: selected.length > 0 ? theme.palette.grey[400] : "#28287B",
                },
                "&:focus::placeholder": {
                  fontWeight: "500",
                  color: theme.palette.grey[400],
                },
              },

              "& label": {
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "18px",
                letterSpacing: "0px",
                color: "#28287B",
              },
            }}
            size="small"
            name="location"
            onChange={(e) => filterOptions(e.target.value)}
          />
        </form>
      )}
      sx={{
        // width: "calc(80% - 14px)",
        width: "80%",
        "& .MuiOutlinedInput-root": {
          borderRadius: "0",
          padding: "0",
          overflow: "hidden",
          // pr: "7px",
        },
        "& .MuiOutlinedInput-root.MuiInputBase-sizeSmall": { pl: 0 },
        "& .MuiOutlinedInput-root.MuiInputBase-sizeSmall .MuiAutocomplete-input": {
          pl: "3px",
        },
        "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },
        "& .MuiOutlinedInput-root .MuiAutocomplete-endAdornment": {
          top: "calc(50% - 14px)",
          right: 0,
        },
      }}
      componentsProps={{
        popper: {
          style: {
            width: "250px",
            border: `1px solid ${theme.palette.grey[300]}`,
            borderRadius: "8px",
          },
          sx: {
            "& .MuiAutocomplete-paper": {
              "& .MuiAutocomplete-noOptions": {
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "18px",
                letterSpacing: "0px",
                color: theme.palette.grey[500],
              },
              "& .MuiAutocomplete-listbox": {
                "&::-webkit-scrollbar": {
                  width: "10px",
                },

                "&::-webkit-scrollbar-track": {
                  borderRadius: "60px",
                },

                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#E4E4E5",
                  borderRadius: "10px",
                  border: "4px solid rgba(0, 0, 0, 0)",
                  backgroundClip: "padding-box",
                },

                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#d5d5d5",
                },
              },
            },
          },
        },
      }}
      value={selected}
      onChange={(event, value, reason) => {
        if (reason === "clear") {
          setSelected([]);
          setSelectedParent([]);
          setExpanded([]);
          setClickExpand([]);
          setList(item.menuItems);
        } else {
          event.stopPropagation();
        }

        //  return handleChange(item.name, selected);
      }}
      popupIcon={FaChevronDown}
    />
  );
};

export default LocationSearch;
