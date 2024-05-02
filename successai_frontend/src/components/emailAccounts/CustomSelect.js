import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Button, Card, CircularProgress } from "@mui/material";
import { useGetAccountsMutation } from "src/services/account-service";
import { useNavigate } from "react-router-dom";

const CustomSelect = ({ formik, initialValue }) => {
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(initialValue ? initialValue : "");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailData, setEmailData] = useState([]);
  const [getAccounts] = useGetAccountsMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialValue) {
      setSelectedOption(initialValue);
      setSearchTerm(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    const filtered = emailData.filter((option) =>
      option.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, emailData]);

  useEffect(() => {
    formik.handleChange("replyTo")(selectedOption);
  }, [selectedOption]);

  const handleSelect = (option) => {
    if (!option.status === "connected") return;
    setSelectedOption(option.email);
    setSearchTerm(option.email);
    setShowSuggestions(false);
  };
  const handleConnectNewEmail = async () => {
    navigate("/accounts/connect");
  };

  const fetchAllUserData = async () => {
    if (emailData.length <= 0) {
      setIsLoading(true);
      const data = await getAccounts({
        limit: 1000,
      }).unwrap();
      if (!data) return;
      setEmailData(data.docs);
      setIsLoading(false);
    }
  };
  const isValidEmail = (searchTerm) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(searchTerm).toLowerCase());
  };

  return (
    <Box>
      <TextField
        variant="outlined"
        placeholder="Senders email"
        onFocus={fetchAllUserData}
        size="small"
        sx={{
          mb: 2,
          width: "100%",
          height: 40,
          backgroundColor: "white",
          "& div": { pl: 0.3 },
          "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
          "& div input": {
            py: 1.3,
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: "16px",
            letterSpacing: "0em",
            "&::placeholder": {
              color: "rgba(40, 40, 123, 0.5)",
            },
          },
        }}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setSelectedOption("");
          setShowSuggestions(true);
        }}
        fullWidth
      />
      {searchTerm && showSuggestions && (
        <Card sx={{ marginTop: "-15px", maxHeight: "300px", overflowY: "scroll" }}>
          {isLoading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <List>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  style={{
                    display: "flex",
                    wordWrap: "nowrap",
                  }}
                >
                  <ListItem
                    sx={{
                      width: "100%",
                      "&:hover": {
                        cursor: "pointer",
                        backgroundColor: "rgba(255, 255, 255)",
                      },
                    }}
                    key={option.email}
                    onClick={() => handleSelect(option)}
                  >
                    {option.email}
                    <Box
                      sx={{
                        color: option.status == "connected" ? "#404eea" : "red",
                        fontSize: "13px",
                        fontWeight: 400,
                        textAlign: "center",
                        marginLeft: 2,
                      }}
                    >
                      {option.status}
                    </Box>
                  </ListItem>
                </div>
              ))
            ) : isValidEmail(searchTerm) ? (
              <ListItem
                sx={{
                  "&:hover": {
                    backgroundColor: "gray",
                    cursor: "pointer",
                    color: "white",
                  },
                  display: "flex",
                }}
                onClick={() => {
                  handleConnectNewEmail();
                }}
              >
                <Box>Connect this email: {searchTerm} to use </Box>
              </ListItem>
            ) : (
              <div></div>
            )}
          </List>
        </Card>
      )}
    </Box>
  );
};

export default CustomSelect;
