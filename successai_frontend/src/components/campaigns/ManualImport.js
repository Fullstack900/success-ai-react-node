import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon.js";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon.js";
import { useCreateLeadsMutation, useDuplicateCheckMutation } from "src/services/campaign-service.js";

const ManualImport = ({ campaign, onLeadsCreate }) => {
  const [manualImportText, setManualImportText] = useState("");
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [stats, setStats] = useState();
  const [leads, setLeads] = useState([]);
  const [open, setOpen] = useState(false);

  const [createLeads, { isLoading: isCreatingLeads }] = useCreateLeadsMutation();
  const [duplicateCheck, { isLoading: isDupUploading }] = useDuplicateCheckMutation();

  const handleImportEmailsClick = async () => {
    const lines = manualImportText.trim().split("\n");
    const length = lines.length
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    const leadsArray = []
    let name = '';
    let capitalize = '';
    for (const line of lines) {
      const [firstName, lastName, email] = line
        .trim()
        .replaceAll(/["'<>]/g, "")
        .split(" ")
        .map((v) => v.trim());
      if (!email) {
        if (firstName && !lastName) {
          if (emailRegex.test(firstName)) {
            name = firstName.split('@')[0];
            capitalize = str => str[0].toUpperCase() + str.slice(1);
            if (name.includes('.')) {
              let [emailFirstName, emailLastName] = name.split('.');
              emailFirstName = capitalize(emailFirstName);
              emailLastName = capitalize(emailLastName);
              leadsArray.push({ firstName: emailFirstName, lastName: emailLastName, email: firstName });
            } else {
              name = capitalize(name);
              leadsArray.push({ firstName: name, lastName: '', email: firstName });
            }
          }
        } else if (firstName && lastName) {
          if (emailRegex.test(lastName))
            leadsArray.push({ firstName, email: lastName });
        }
      } else {
        if (emailRegex.test(email))
          leadsArray.push({ firstName, lastName, email })
      }
    }


    if (!leadsArray.length) {
      toast.error("Invalid email address")
      return false
    }

    const leads = leadsArray

    // const leads = lines.map((line) => {
    //   const [firstName, lastName, email] = line
    //     .trim()
    //     .replaceAll(/["'<>]/g, "")
    //     .split(" ")
    //     .map((v) => v.trim());

    //     if(length === 1 ) {
    //       if(!email) {
    //         if(firstName && !lastName) {
    //           if(emailRegex.test(firstName))
    //             return { email : firstName };
    //           else {
    //             toast.error("Invalid email address")
    //             return false
    //           }
    //         } else if(firstName && lastName) {
    //           if(emailRegex.test(lastName))
    //             return { firstName, email : lastName };
    //           else{
    //             toast.error("Invalid email address")
    //             return false
    //           }
    //         }
    //       }
    //     }
    //   return { firstName, lastName, email };
    // });

    try {
      let createdLeads;
      if(checkDuplicates){

        const duplicateCheckResponse = await duplicateCheck({
          id: campaign._id,
          data: {
            leads: leads,
            checkDuplicates,
            stats: true,
          },
        }).unwrap();
        createdLeads = duplicateCheckResponse.createdLeads;
        setOpen(true)
        setStats(createdLeads);
      }
      if (!checkDuplicates) {
        const { message, blockLeadsCount } = await createLeads({
          id: campaign._id,
          data: {
            leads: createdLeads?.leads ?? leads,
            checkDuplicates,
          },
        }).unwrap();
        onLeadsCreate(true);
        const [addedLeadsPart, skippedLeadsPart] = message.split(" and ");
        toast.success(addedLeadsPart);
        setTimeout(() => {
          toast.success(skippedLeadsPart);
        }, 1000);

        if (blockLeadsCount > 0) {
          toast.success(`${blockLeadsCount} contacts were blocked by your blocklist.`)
        }
        setManualImportText("");
      }
    } catch (error) {
      toast.error(error.data.error.message);
    }
  };

  const leadGenerator = async () => {
    try {
      const { message, blockLeadsCount } = await createLeads({
        id: campaign._id,
        data: {
          leads: stats?.leads ?? leads,
          checkDuplicates,
        },
      }).unwrap();
      onLeadsCreate(true);
      const [addedLeadsPart, skippedLeadsPart] = message.split(" and ");
      toast.success(addedLeadsPart);
      setTimeout(() => {
        toast.success(skippedLeadsPart);
      }, 1000);

      if (blockLeadsCount > 0) {
        toast.success(`${blockLeadsCount} contacts were blocked by your blocklist.`)
      }
      setManualImportText("");

    } catch (error) {
      toast.error(error.data.error.message);
      console.log("Error", error)
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: "25px",
            color: "#28287B",
          }}
        >
          Bulk Add Emails by Hand
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            flexDirection: "column",
            backgroundColor: "#F2F4F6",
            p: 2,
            borderRadius: "12px",
            mt: 2,
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "18px",
            }}
          >
            💡 For adding emails with associated names, use any of these formats:
          </Typography>
          <Typography
            sx={{
              width: "100%",
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "20px",
              p: 2,
              pb: 0,
            }}
          >
            "John Doe" &lt;john@doe.com&gt; <br />
            "Jane Smith" jane@smith.com
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: "20px",
            color: "#8181B0",
            mt: 3,
          }}
        >
          Input or paste email IDs - enter one email per line
        </Typography>
        <TextField
          multiline
          rows={6}
          fullWidth
          placeholder={'"FirstName LastName" example@mail.com'}
          variant="outlined"
          sx={{
            mt: 1,
            backgroundColor: "white",
            "& div": { pl: 2 },
            "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
            "& div input": {
              p: 1.3,
              px: 3,
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: "16px",
              letterSpacing: "0em",
              "&::placeholder": {
                color: "rgba(40, 40, 123, 0.5)",
              },
            },
          }}
          value={manualImportText}
          onChange={(e) => setManualImportText(e.target.value)}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            mt: 2,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                icon={<OffCheckboxCustomIcon />}
                checkedIcon={<OnCheckboxCustomIcon />}
                checked={checkDuplicates}
                onChange={(e, v) => setCheckDuplicates(v)}
              />
            }
            label="Ensure there are no duplicates across all marketing campaigns."
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: "16px",
                color: "#28287B",
              },
            }}
          />
          <Button
            variant="contained"
            disabled={!manualImportText.trim()}
            onClick={() => {
              handleImportEmailsClick()
            }
            }
          >
            {isCreatingLeads ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Import Emails"
            )}
          </Button>
        </Box>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ fontSize: "25px", color: "#595959", textAlign: "center" }}>
          Are you sure?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "16px", fontWeight: "500" }}>
            This will upload{" "}
            <Typography component="span" color={"blue"}>
              {stats?.uploadedCount}{" "}
            </Typography>{" "}
            contacts to your campaign .{" "}
            <Typography component="span" color={"blue"}>
              {stats?.emailCampaignCount || stats?.duplicateEmailsCount}{" "}
            </Typography>{" "}
            contacts had errors.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
          <Button
            onClick={leadGenerator}
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
            {isCreatingLeads ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Import"
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
    </>
  );
};

export default ManualImport;
