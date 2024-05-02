import "./MainSection.css";
import { useState } from "react";
import Tasks from "./Tasks/Tasks";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  InputLabel,
  InputAdornment,
  TextField,
  MenuItem,
  FormControl,
  Select,
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import SearchIcon from "@mui/icons-material/Search";
import SettingsSharpIcon from '@mui/icons-material/SettingsSharp';

function MainSection(props) {
  const [dropId, setDropId] = useState("");

  function DragOverFunc(event, id) {
    // console.log("Drag Over", dropId, id);
    setDropId(id);
    event.preventDefault();
  }

  function DragStartFunc(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
    // console.log("Drag started");
  }

  function DragEndFunc() {
    // console.log("Drag ended");
  }

  function DragEnterFunc() {
    // console.log("Drag entered!");
  }
  function DragDropFunc(event) {
    event.preventDefault();
    // console.log("Drag Dropped!");
    const somedata = event.dataTransfer.getData("text/plain");

    var a = document.getElementById(somedata);

    const containerElem = event.target.closest(".Tabs");
    const nearestcard = event.target.closest(".Tasks");
    containerElem.appendChild(a);
    containerElem.insertBefore(a, nearestcard);
  }

  const data = [
    {
      id: 1,
      title: "Accountant IV",
      email: "test@gmail.pm",
      date: "Oct 18",
      amount: "1000",
      full_name: "Sutherland McMurrugh",
      msgs: false,
    },
    {
      id: 2,
      title: "My Title",
      email: "abc@gmail.pm",
      date: "Oct 18",
      amount: "3000",
      full_name: "Sutherland McMurrugh",
      msgs: false,
    },
    {
      id: 3,
      title: "Your Title",
      email: "efg@gmail.pm",
      date: "Oct 18",
      amount: "2000",
      full_name: "Sutherland McMurrugh",
      msgs: false,
    },
  ];
  const [age, setAge] = useState("");

  const handleChange = (event) => {
    setAge(event.target.value);
  };
  return (
    <>
      <Box className="MainSectioncol">
        <Box className="Maincol" sx={{ flexGrow: 1, mt: 1 }}>
          <Typography sx={{ p: 1, ml: 1 }}>17 Leads</Typography>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: "100%", mx: 1, backgroundColor: "#6D727E", width: "2px", opacity: "0.5" }}
          />
          <Typography sx={{ mt: 1, mr: 3 }}>Total opportunities: $17,000</Typography>

          <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel id="demo-select-small-label">Select</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={age}
            label="Age"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={10}>Last 7 days</MenuItem>
            <MenuItem value={20}>Month to day</MenuItem>
            <MenuItem value={30}>Last 4 weeks</MenuItem>
            <MenuItem value={40}>Last 6 months</MenuItem>
            <MenuItem value={50}>Last 12 months</MenuItem>
            <MenuItem value={60}>All Time</MenuItem>
          </Select>
        </FormControl>
        
        <SettingsSharpIcon sx={{color:'rgb(115, 115, 115)', mt:2,ml:3,mr:3}}/>
      </Box>
      <div className="MainSection">
        <div
          className="Tabs"
          id="tab1"
          onDragOver={(e) => DragOverFunc(e, "tab1")}
          onDragEnter={DragEnterFunc}
          onDrop={DragDropFunc}
        >
          <div className="TabHeader">
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  p: 1,
                  //   m: 1,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                }}
              >
                <BoltIcon style={{ color: "rgb(151, 224, 182)" }} />
                <Typography sx={{ fontWeight: "bold" }}>Interested</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  marginLeft: "10px",
                  marginRight: "10px",
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle2">$1,0000</Typography>
                <Typography variant="subtitle2">1 details</Typography>
              </Box>
            </Box>
          </div>
          {data &&
            data.map((task) => (
              <Tasks task={task} DragStartFunc={DragStartFunc} DragEndFunc={DragEndFunc}></Tasks>
            ))}
        </div>

        <div
          className="Tabs"
          id="tab2"
          onDragOver={(e) => DragOverFunc(e, "tab2")}
          onDragEnter={DragEnterFunc}
          onDrop={DragDropFunc}
        >
          <div className="TabHeader">
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  p: 1,
                  //   m: 1,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                }}
              >
                <BoltIcon style={{ color: "rgb(151, 224, 182)" }} />
                <Typography sx={{ fontWeight: "bold" }}>Meeting booked</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  marginLeft: "10px",
                  marginRight: "10px",
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle2">$1,0000</Typography>
                <Typography variant="subtitle2">1 details</Typography>
              </Box>
            </Box>
          </div>
        </div>

        <div
          className="Tabs"
          id="tab3"
          onDragOver={(e) => DragOverFunc(e, "tab3")}
          onDragEnter={DragEnterFunc}
          onDrop={DragDropFunc}
        >
          <div className="TabHeader">
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  p: 1,
                  //   m: 1,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                }}
              >
                <BoltIcon style={{ color: "rgb(151, 224, 182)" }} />
                <Typography sx={{ fontWeight: "bold" }}>Meeting completed</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  marginLeft: "10px",
                  marginRight: "10px",
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle2">$1,0000</Typography>
                <Typography variant="subtitle2">1 details</Typography>
              </Box>
            </Box>
          </div>
        </div>

        <div
          className="Tabs"
          id="tab4"
          onDragOver={(e) => DragOverFunc(e, "tab4")}
          onDragEnter={DragEnterFunc}
          onDrop={DragDropFunc}
        >
          <div className="TabHeader">
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  p: 1,
                  //   m: 1,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                }}
              >
                <BoltIcon style={{ color: "rgb(151, 224, 182)" }} />
                <Typography sx={{ fontWeight: "bold" }}>Closed</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  marginLeft: "10px",
                  marginRight: "10px",
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle2">$1,0000</Typography>
                <Typography variant="subtitle2">1 details</Typography>
              </Box>
            </Box>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainSection;
