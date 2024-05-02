import { Autocomplete, Box, Checkbox, TextField, Typography, Radio, useTheme, Slider, Divider, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, createTheme, Button, FormControl, FormControlLabel, Switch  } from "@mui/material";
import { filterList } from "src/assets/data.js";
import { filterIndustryList } from "src/assets/data.js";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon";
import LocationSearch from "./locationSearch";
import axios from 'axios';
import { useGetSuggestionsMutation } from '../../services/leads-service'
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import CsvImport from "../campaigns/CsvImport";
import useMediaQuery from '@mui/material/useMediaQuery';
const checkboxOfIcon = <OffCheckboxCustomIcon />;
const checkboxOnIcon = <OnCheckboxCustomIcon />;

const FilterBlock = ({ filter, onChange, clearLocation, setClearLocation, category, onKeyPressSearch }) => {
  const [filtersData, setFiltersData] = useState([]);
  const [suggest, setSuggest] = useState('');
  const [enteredText, setEnteredText] = useState('');
  const [getSuggestions, { isLoading: isGetSuggestionsLoading }] = useGetSuggestionsMutation();
  const [km, setKm] = useState(0);
  const theme = useTheme();
  const [open, setOpen] = useState("");
  const [value, setValue] = useState(true);
  const [currentFieldName, setCurrentFieldName] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [defaultValue, setDefaultValue] = useState([]);
  const [state, setState] = useState({
    include_past: false,
  });
  const [focusedFields, setFocusedFields] = useState([]);

  const handleFocus = (index) => {
    const newFocusedFields = [...focusedFields];
    newFocusedFields[index] = true;
    setFocusedFields(newFocusedFields);
  };

  const handleBlur = (index) => {
    const newFocusedFields = [...focusedFields];
    newFocusedFields[index] = false;
    setFocusedFields(newFocusedFields);
  };

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

  const handleAutocompleteChange = (name, value, parent=null) => {
    if (parent && value.length > 1) {
      value = [...value, ...parent]
    }
    if (name === "email_type"){ 
      value = value
    } else if(name === "employer") {
      setDefaultValue(value);
      value = value.map((v) => state.include_past == true ? `'${v}'::include_past` : `'${v}'`);
    } else {
      value = value.map((v) => v.value || v)
    }
    onChange(name, value);
  };

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  useEffect(()=>{
    if(filter['employer']){
      const valueMap = defaultValue.length > 0 ? defaultValue : filter['employer'];
      let value = valueMap.map((v) => state.include_past == true ? `'${v}'::include_past` : `'${v}'`);
      onChange('employer', value);
    }
  },[state])

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked,
    });
  };

  const handlingDropDown = (item) => {
    return suggest[item.name]?.length > 1 ? suggest[item.name] : item.menuItems;
  };

  const fetchData = async (field,name) => {
    try {
      let {result} = await getSuggestions({      
          category: field, 
          name: name,
        }
      ).unwrap();
      result = Object.values(result)[0].filter(item => typeof item === 'string');
      let modified_field;
      if ((field == 'industry') || (field == 'company_industry')) {
        modified_field = (category == 'Companies' ? 'industry' : 'company_industry');
      };
      setSuggest((prevSuggest) => ({
        ...prevSuggest,
        [modified_field ?? field]: result,
      }));
      return result;
    } catch (error) {
      console.log(error)
    }
  };
  const  valuetext = (value) => {
    setKm(value);
  }

  useEffect(()=>{
    category == 'Companies' ? setFiltersData(filterIndustryList) : setFiltersData(filterList)
  },[category])

  const valueHandler = (val) => {
    setValue(val)
  }
  const labelHandler = (label) => {
    setCurrentFieldName(label)
  }

  useEffect(() => {
    if (value === false && currentFieldName) {
      const errorMessage = `Select valid ${currentFieldName.replace('_', ' ')} from dropdown`;
      toast.error(errorMessage);
      setValue(true);
      setCurrentFieldName(null);
    }
  }, [value, currentFieldName, state]);

  const handleInputChange = (name, value) => {
    if (!value) return onChange(name, []);
    onChange(name, [value]);
  };
  const revenueFilterValue =
    filter["revenue"]?.map((rev) =>
      filterList.find((item) => item.name === "revenue")?.menuItems?.find((el) => el.value === rev)
    ) || [];

  const onKeyDown = (event) => {
    onKeyPressSearch(event)
  }

  return filtersData.map((item, index) => (
    // <>
    // {item.name == 'location' && category == 'People' ? (
    //   <Divider sx={{ backgroundColor: "black" ,width: "100%" , height: "1px", marginTop:'15px' }} />
    // ) : <></>}
    <Box
      key={index}
      sx={{
        borderRadius: "10px",
        my: 1,
        px: 1.8,
        py: 0.1,
        width: "100%",
        height: "100%",
        display:item.name==='include_past' ?filter.employer? "flex":'none':'flex',
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${theme.palette.grey[300]}`,
      }}
    >
      { item.label == 'KM' || item.label == 'Include Past Employers' ? <></> : (<Box sx={{ width: "20%" }}>{item.icon}</Box>)}
      {item.select ? (
        item.name === "geo" ? (
          <LocationSearch
            item={item}
            handleChange={handleAutocompleteChange}
            valueHandler={valueHandler}
            labelHandler={labelHandler}
            filter={filter}
            clearLocation={clearLocation}
            setClearLocation={setClearLocation}
            FaChevronDown={<FaChevronDown size={14} color="#28287B" />}
            distance={km}
            fetchData={fetchData}
          />
        ) :
        item.name === "department" ? (
         <LocationSearch
              item={item}
              handleChange={handleAutocompleteChange}
              valueHandler={valueHandler}
              labelHandler={labelHandler}
              filter={filter}
              clearLocation={clearLocation}
              setClearLocation={setClearLocation}
              FaChevronDown={<FaChevronDown size={14} color="#28287B" />}
            />
          ) :
        (
          <Autocomplete
            freeSolo
            multiple={item.name !== "email_type"}
            noOptionsText={"No options found"}
            // forcePopupIcon={false}
            // multiple
            popupIcon={<FaChevronDown size={14} color="#28287B" />}
            id="checkboxes-tags-demo"
            sx={{
              // width: "calc(80% - 14px)",
              width: "80%",
              "& .MuiOutlinedInput-root": {
                borderRadius: "0",
                padding: "0",
                overflow: "hidden",
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
            options={handlingDropDown(item)}
            disableCloseOnSelect
            getOptionLabel={(option) => option.label || option}
            renderOption={(props, option, { selected, inputValue }) => {
              return (
                <>
                  { item.name == 'company_name' ? (<Button variant="text" onClick={handleClickOpen} fullWidth> Upload CSV </Button>)
                  : (<li
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      px: 0,
                    }}
                    {...props}
                  >
                    {item.name === "email_type" ? (
                      <Radio checked={inputValue === option} />
                    ) : (
                      <Checkbox
                        icon={checkboxOfIcon}
                        checkedIcon={checkboxOnIcon}
                        style={{ marginRight: 8 }}
                        checked={
                          item.name === "revenue"
                            ? filter["revenue"]?.includes(option.value)
                            : item.name == 'job_change_range_days' && filter['job_change_range_days']  ? (
                                filter['job_change_range_days'].includes(option.value)
                            ) : selected
                        }
                      />
                    )}
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "16px",
                        color: "#28287B",
                      }}
                    >
                      {option.label || option}
                    </Typography>
                  </li>)}
                </>
              );
            }}
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
                {value
                  .map((v) => item.menuItems.find((m) => m.value === v.value)?.label ?? v)
                  .join(", ")}
              </Box>
            )}
            renderInput={(params) => (
              <form autoComplete={"new-password"} sx={{ width: "100%" }}>
                <TextField
                  {...params}
                  placeholder={item.label}
                  onChange={(event)=>{
                    item.suggestion == true ? fetchData(item.suggestionName ?? item.name ,event.target.value) : <></>;
                  }}
                  onKeyDown={(e) => {
                    const allowedNames = ["current_title", "email_type", "management_levels", "years_experience", "job_change_range_days", "revenue", "company_size", "industry", "skills", "degree", "major", "employer", "employees", "growth"];
                    if (allowedNames.includes(item.name) && e.key === "Enter") {
                      if (item.name === "revenue" || "job_change_range_days") {
                        const isValue = item.menuItems.map((item) => (item)).includes(e.target.value)
                        setValue(isValue);
                        isValue && handleAutocompleteChange(item.name, [e.target.value])
                        setCurrentFieldName(item.label);
                        e.preventDefault();
                      } else {
                        const isValue = item.menuItems.map((item) => (item.toLowerCase())).includes(e.target.value.toLowerCase())
                        setValue(isValue);
                        isValue && handleAutocompleteChange(item.name, [e.target.value])
                        setCurrentFieldName(item.label);
                        e.preventDefault();
                      }
                      onKeyDown(e)
                    }
                  }}
                  variant="outlined"
                  sx={{
                    maxHeight: 40,
                    width: "100%",
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
                    "& div fieldset": { borderRadius: "8px", border: "none" },
                    "& div input": {
                      width: "100%",
                      overflow: "hidden",
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "16px",
                      letterSpacing: "0em",
                      "&::placeholder": {
                        fontWeight: filter[item.name]?.length > 0 ? "500" : "700",
                        fontSize: filter[item.name]?.length > 0 ? "13px" : isSmallScreen ? "10px" : "14px",
                        color: filter[item.name]?.length > 0 ? theme.palette.grey[400] : "#28287B",
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
                />
              </form>
            )}
            value={item.name === "revenue" ? revenueFilterValue : filter[item.name] ?? []}
            onChange={(event, value) => handleAutocompleteChange(item.name, value)}
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
            onKeyDown={onKeyDown}
          />
        )
      ) : item.name === "km" ? (
        <div style={{width: '100%'}}>
        <Slider
          aria-label="Temperature"
          defaultValue={0}
          getAriaValueText={valuetext}
          valueLabelDisplay="auto"
          step={40}
          marks={item.menuItems}
          min={0}
          max={160}
        />
        </div>
      ) : item.name === "include_past" ? (
        filter.employer ? (
        <FormControlLabel
          sx={{
            mx:0,
            width:'100%',
            '& .MuiFormControlLabel-label':{
              color: "#28287B",
              fontWeight: "700",
              fontSize: isSmallScreen ? "10px" : "14px",
            },
            '& .MuiSwitch-root':{
                ml:0
            }}}
          control={
            <Switch checked={state.include_past} onChange={handleChange} name="include_past" />
          }
          label={item.label}        
        />) : <></>
      ) : (
        <TextField
          // label={isFocused ? '' : item.label}
          placeholder={focusedFields[index] ? item.placeHolder : item.label}
          variant="outlined"
          onFocus={() => handleFocus(index)}
          onBlur={() => handleBlur(index)}
          sx={{
            width: "80%",
            maxHeight: 40,
            backgroundColor: "white",
            "& div": { pl: 0 },
            "& div fieldset": { borderRadius: "8px", border: "none" },
            "& div input": {
              pl: "3px",
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: "16px",
              letterSpacing: "0em",
              "&::placeholder": {
                color: "#28287B",
                fontWeight: "700",
                fontSize: isSmallScreen ? "10px" : "14px",
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
          value={(filter[item.name] && filter[item.name][0]) || ""}
          onChange={(event) => handleInputChange(item.name, event.target.value)}
          onKeyDown={onKeyDown}
        />
      )}
      {/* {item.select && (
        <IconButton
          onClick={() => {
            if (open !== "" && open === item.name) {
              setOpen("");
            } else {
              setOpen(item.name);
            }
          }}
        >
          {item.name === open ? (
            <FaChevronUp size={14} color="#28287B" /> // size={14} color="#28287B"
          ) : (
            <FaChevronDown size={14} color="#28287B" />
          )}
        </IconButton>
      )} */}
      {item.name === 'company_name' && (
          <Dialog 
            open={openDialog} 
            onClose={handleClose}
          >
            <DialogTitle>Upload CSV of company list</DialogTitle>
            <DialogContent>
              <CsvImport
                filter={true}
                onChange={onChange}
                setOpenModal={setOpenDialog}
              />
            </DialogContent>
          </Dialog>
        )}
    </Box>
  ));
};

export default FilterBlock;
