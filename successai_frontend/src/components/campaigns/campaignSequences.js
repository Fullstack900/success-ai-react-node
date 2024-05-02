import { useEffect, useState } from "react";
import { config } from "src/config.js";
import { useDispatch, useSelector } from "react-redux";
import { useCreateLeadsMutation, useGetLeadsMutation } from "src/services/campaign-service.js";
import {
  useGetAccountsMutation,
  accountsAdded,
  setAccounts,
} from "src/services/account-service.js";
import {
  useUpdateTestAccountMutation,
  useCampaignLaunchMutation,
  useGetCampaignQuery,
} from "src/services/campaign-service.js";
import * as Yup from "yup";
import { useFormik } from "formik";
import { OffCheckboxCustomIcon } from "src/assets/general/OffCheckboxCustomIcon";
import { OnCheckboxCustomIcon } from "src/assets/general/OnCheckboxCustomIcon";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Hidden,
  Stack,
  Popover,
  useTheme,
  useMediaQuery,
  DialogActions,
  InputLabel,
  Modal,
  Autocomplete,
  Checkbox,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import AutoAwesomeMosaicIcon from "@mui/icons-material/AutoAwesomeMosaic";
import {
  ArrowDropDown,
  CloseOutlined,
  MoreVertOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { HeroIcon } from "src/assets/campaignSequence/HeroIcon";
import { Plus } from "src/assets/general/Plus";
import { BoltIcon } from "src/assets/general/BoltIcon";
import { DeleteIconBlack } from "src/assets/general/DeleteIcon";
import { EditIcon } from "src/assets/general/EditIcon";
import { CopyIcon } from "src/assets/general/CopyIcon";
import { DragIcon } from "src/assets/general/DragIcon";
import { OpenAiIcon } from "src/assets/general/OpenAiIcon";
import { Editor } from "@tinymce/tinymce-react";
import {
  useWriteEmailMutation,
  useOptimizeEmailMutation,
  useCreateSequenceMutation,
  useUpdateSequenceMutation,
  useDeleteSequenceMutation,
  useUpdateSequenceOrderMutation,
  useCopySequenceMutation,
  useGetCampaignVariablesQuery,
  useGetEmailTemplatesQuery,
} from "src/services/campaign-service.js";
import CustomCounterProgress from "./emailChecker/CustomCounterProgress";
import { useRef } from "react";
import checkSpamWords from "./emailChecker/utils/checkSpamTree";
// import templateEmails, { newTemplates } from "../templateEmails";
import { renderToString } from "react-dom/server";

import PropTypes from "prop-types";
import TemplateSection from "./templateSection";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pl: { xs: 0, md: 3 } }}>
          <Typography sx={{ border: "1px solid #E4E4E5", borderRadius: "12px" }}>
            {children}
          </Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const [maxSubjectCount, maxWordCount, maxReadingTime, maxLinks, maxQuestions, maxSpams] = [
  15, 500, 210, 3, 4, 7,
];

const DraggableSequence = ({
  sequence,
  index,
  showWaitDays,
  showDelete,
  onEditClick,
  campaignId,
}) => {
  const [waitDays, setWaitDays] = useState(sequence.waitDays);
  const [error, setError] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  const [deleteSequence, { isLoading: isDeleteSequenceLoading }] = useDeleteSequenceMutation();
  const [updateSequence, { isLoading: isUpdateSequenceLoading }] = useUpdateSequenceMutation();
  const [copySequence, { isLoading: isCopySequenceLoading }] = useCopySequenceMutation();

  useEffect(() => {
    if (waitDays && parseInt(waitDays) !== sequence.waitDays) {
      setShowSaveButton(true);
    } else {
      setShowSaveButton(false);
    }
  }, [sequence.waitDays, waitDays]);

  const handleDelete = async () => {
    const { message } = await deleteSequence(sequence._id).unwrap();
    toast.success(message);
  };

  const handleEdit = () => {
    onEditClick(sequence._id);
    refetch();
  };

  const handleCopy = async () => {
    const { message } = await copySequence(sequence._id).unwrap();
    toast.success(message);
  };

  const handleSaveWaitDays = async () => {
    if (waitDays > 0) {
      const { message } = await updateSequence({ id: sequence._id, data: { waitDays } }).unwrap();
      toast.success(message);
      setError(false);
    } else {
      setError(true);
    }
  };

  const { data: variables, refetch } = useGetCampaignVariablesQuery(campaignId);

  return (
    <>
      <Draggable draggableId={sequence._id} index={index}>
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            sx={{
              userSelect: "none",
              margin: "0 0 8px 0",
              borderRadius: 4,
              ...provided.draggableProps.style,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
              <StepLabel>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "18px",
                      letterSpacing: "0px",
                      color: "#28287B",
                    }}
                  >
                    Step {sequence.step}
                  </Typography>
                  <Box
                    sx={{
                      display: showWaitDays ? "flex" : "none",
                      justifyContent: "center",
                      alignItems: "center",
                      mr: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "15px",
                        letterSpacing: "0px",
                        color: "#28287B",
                        ml: 2,
                      }}
                    >
                      After
                    </Typography>
                    <TextField
                      type="number"
                      inputProps={{ min: 0 }}
                      variant="outlined"
                      InputProps={{ inputProps: { min: 0 } }}
                      sx={{
                        width: 75,
                        "& div": { pl: 0.3 },
                        "& div fieldset": { borderRadius: "8px", border: "1px solid #E4E4E5" },
                        "& div input": {
                          backgroundColor: "white",
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "16px",
                          letterSpacing: "0em",
                          "&::placeholder": {
                            color: "rgba(40, 40, 123, 0.5)",
                          },
                        },
                        ml: 1,
                      }}
                      size="small"
                      value={waitDays}
                      onChange={(e) => setWaitDays(e.target.value)}
                      error={error}
                      helperText={error ? "Invalid" : ""}
                    />
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "15px",
                        letterSpacing: "0px",
                        color: "#28287B",
                        ml: 1,
                      }}
                    >
                      days
                    </Typography>
                    {isUpdateSequenceLoading ? (
                      <CircularProgress size={20} sx={{ ml: 2 }} />
                    ) : (
                      <Button
                        sx={{
                          display: !showSaveButton && "none",
                          color: "#0071F6",
                          cursor: "pointer",
                          "&:hover": {
                            color: "#164694",
                          },
                          ml: 2,
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: "16px",
                        }}
                        variant="outlined"
                        onClick={handleSaveWaitDays}
                      >
                        Save
                      </Button>
                    )}
                  </Box>
                </Box>
              </StepLabel>
            </Box>
            <StepContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "12px",
                  width: "100%",
                  backgroundColor: "white",
                  px: 2,
                  boxShadow: "0px 12px 15px 0px #4B71970D",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "grab",
                  }}
                >
                  <DragIcon />
                </Box>
                <Typography
                  sx={{
                    fontSize: "12px",
                    width: "100%",
                    pl: 3,
                    py: 2.5,
                  }}
                >
                  {sequence.subject
                    ? sequence.subject
                    : sequence.step > 1
                    ? "<Previous email's subject>"
                    : "<Empty subject>"}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {showDelete && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      {isDeleteSequenceLoading ? (
                        <CircularProgress size={20} sx={{ color: "#28287b" }} />
                      ) : (
                        <IconButton onClick={handleDelete}>
                          <DeleteIconBlack />
                        </IconButton>
                      )}
                    </Box>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <IconButton onClick={handleEdit}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {isCopySequenceLoading ? (
                      <CircularProgress size={20} sx={{ color: "#28287b" }} />
                    ) : (
                      <IconButton onClick={handleCopy}>
                        <CopyIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>
            </StepContent>
          </Box>
        )}
      </Draggable>
    </>
  );
};

const CampaignSequences = ({ campaign }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [sequenceId, setSequenceId] = useState(null);
  const [isEditorDialogOpen, setIsEditorDialogOpen] = useState(false);
  const [isUnsubscribeOpen, setIsUnsubscribeOpen] = useState(false);
  const [unsubscribeText, setUnsubscribeText] = useState("Click here to unsubscribe");
  const [showParams, setShowParams] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [spamCount, setSpamCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [urlCount, setUrlCount] = useState(0);
  const [editorSubject, setEditorSubject] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [contentLength, setContentLength] = useState(false);
  const [cursorLocation, setCursorLoaction] = useState(1);
  const [error, setError] = useState(false);
  const editorRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [writeEmail, { isLoading: isWriteEmailLoading }] = useWriteEmailMutation();
  const [optimizeEmail, { isLoading: isOptimizeEmailLoading }] = useOptimizeEmailMutation();
  const [createSequence, { isLoading: isCreateSequenceLoading }] = useCreateSequenceMutation();
  const [updateSequence, { isLoading: isUpdateSequenceLoading }] = useUpdateSequenceMutation();
  const [updateSequenceOrder] = useUpdateSequenceOrderMutation();
  const [sequenceStepCount, setSequenceStepCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [tempOpenModal, setTempOpenModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [newTemplatess, setNewTemplatess] = useState([]);
  // const defaultTemplate = newTemplatess[0]?.category[0]?.templates[0];
  const [selectedTemplateObject, setSelectedTemplateObject] = useState({});
  const [istemplateOpen, setIsTemplateOpen] = useState(false);
  const [currentInput, setCurrentInput] = useState("");

  const [showData, setShowData] = useState(false);
  const { data: templates, isLoading, isError } = useGetEmailTemplatesQuery(campaign._id);
  useEffect(() => {
    if (!isLoading && !isError && templates) {
      const defaultTemplate = templates[0]?.category[0]?.templates[0];
      setSelectedTemplateObject(defaultTemplate);
    }
  }, [isLoading, isError, templates]);

  const { test } = campaign;
  const dispatch = useDispatch();

  let testEmailAccounts = [];
  const accounts = useSelector((state) => state.accounts);
  accounts?.forEach((element) => {
    testEmailAccounts.push(element.email);
  });

  const handleFieldSelectionAndValidation = (newValue) => {
    const value = newValue?.length === 0 ? '' : newValue[newValue.length - 1];
    const foundObject = accounts?.find(obj => obj.email === value);
    if(value == '' && !foundObject?.accountError || foundObject?.status == 'connected' && !foundObject?.accountError){
      formik.setFieldValue("testEmailAccounts", newValue);
    } else { 
      if (foundObject?.accountError) {
        toast.error("Resolve your email account error first");
      }
      else if(foundObject?.status === 'disconnected' || foundObject?.status === 'paused'){
        toast.error("Resume your email account first");
      }
      else{
        toast.error("Reconnect your email account first");
      }
    }
  }

  const [getAccounts, { isLoading: isAccountsLoading }] = useGetAccountsMutation();

  const [isLoadingMoreAccounts, setIsLoadingMoreAccounts] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(null);
  const [total, setTotal] = useState(0);
  const [launch, setLaunch] = useState(false);
  const offset = accounts.length;
  const limit = 15;

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { docs, total } = await getAccounts({
        search,
        filter: filter?.value,
        unibox: true,
      }).unwrap();
      dispatch(setAccounts(docs));
      setTotal(total);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filter, limit, getAccounts, dispatch]);

  useEffect(() => {
    const handler = async () => {
      if (isLoadingMoreAccounts) return;
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

      if (scrollHeight - scrollTop === clientHeight && offset < total) {
        setIsLoadingMoreAccounts(true);
        const { docs, total } = await getAccounts({
          search,
          filter: filter?.value,
          offset,
          limit,
        }).unwrap();
        dispatch(accountsAdded(docs));
        setTotal(total);
        setIsLoadingMoreAccounts(false);
      }
    };

    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [isLoadingMoreAccounts, search, filter, total, offset, limit, getAccounts, dispatch]);

  const [updateTestAccount, { isLoading: isTestAccountLoading }] = useUpdateTestAccountMutation();

  const formik = useFormik({
    initialValues: {
      testEmailAccounts: test?.testEmailAccounts,
    },
    validationSchema: Yup.object({
      testEmailAccounts: Yup.array()
        .min(1, "At least one email account is required")
        .of(Yup.string().required("Email account is required")),
    }),
    onSubmit: async (values) => {
      try {
        const { message } = await updateTestAccount({
          campaignID: campaign._id,
          test: values,
        }).unwrap();
      } catch (err) {
        toast.error(err.data.error.message);
      }
    },
  });

  const [campaignLaunch] = useCampaignLaunchMutation();

  const launchCampaign = async (formik) => {
    try {
      setLaunch(true);
      if (formik?.values?.testEmailAccounts?.length < 1) {
        toast.error("Please Add email account and save campaign first");
        return;
      }
      await formik.handleSubmit();
      const { message, launch } = await campaignLaunch({
        id: campaign._id,
        params: { step: sequenceStepCount, reciepient: manualImportText },
      }).unwrap();
      if (launch?.includes("Email Sent")) {
        toast.success("Email Sent")
        setManualImportText("");
        setOpenModal(false);
      } else {
        toast.error(launch);
        setOpenModal(false);
      }
      setButtonDisabled(false);
    } catch (err) {
      setButtonDisabled(false);
      console.log(`errr`, err)
      toast.error(err.data.error.message);
    }
  };
  const [manualImportText, setManualImportText] = useState("");
  const [createLeads, { isLoading: isCreatingLeads }] = useCreateLeadsMutation();

  const handleImportEmailsClick = async (value, formik) => {
    const lines = manualImportText.trim().split("\n");
    const length = lines.length;
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    const leadsArray = [];
    let name = "";
    let capitalize = "";
    for (const line of lines) {
      const [firstName, lastName, email] = line
        .trim()
        .replaceAll(/["'<>]/g, "")
        .split(" ")
        .map((v) => v.trim());
      if (!email) {
        if (firstName && !lastName) {
          if (emailRegex.test(firstName)) {
            name = firstName.split("@")[0];
            capitalize = (str) => str[0].toUpperCase() + str.slice(1);
            if (name.includes(".")) {
              let [emailFirstName, emailLastName] = name.split(".");
              emailFirstName = capitalize(emailFirstName);
              emailLastName = capitalize(emailLastName);
              leadsArray.push({
                firstName: emailFirstName,
                lastName: emailLastName,
                email: firstName,
              });
            } else {
              name = capitalize(name);
              leadsArray.push({ firstName: name, lastName: "", email: firstName });
            }
          }
        } else if (firstName && lastName) {
          if (emailRegex.test(lastName)) leadsArray.push({ firstName, email: lastName });
        }
      } else {
        if (emailRegex.test(email)) leadsArray.push({ firstName, lastName, email });
      }
    }
    if (!leadsArray.length) {
      toast.success("Invalid email address");
      return false;
    }
    const leads = leadsArray;
    try {
      const { message, createdLeads } = await createLeads({
        id: campaign._id,
        data: {
          leads,
          value,
        },
      }).unwrap();
      // onLeadsCreate(true);

      // setOpenModal(false);
      launchCampaign(formik);
    } catch (error) {
      setButtonDisabled(false);
      toast.error(error.data.error.message);
    }
  };
  const { data: variables, refetch } = useGetCampaignVariablesQuery(campaign._id);
  const handleAddStepClick = () => {
    setSequenceStepCount(campaign?.sequences.length + 1);
    setSequenceId(null);
    setEditorSubject("");
    setEditorContent("");
    setIsEditorDialogOpen(true);
    refetch();
    setSubjectCount(0);
    setWordCount(0);
    setReadingTime(0);
    setUrlCount(0);
    setQuestionCount(0);
    setSpamCount(0);
  };

  const handleEditClick = (id) => {
    const sequence = campaign.sequences.find((s) => s._id === id);
    setSequenceStepCount(sequence.step);
    setSequenceId(id);
    setEditorSubject(sequence.subject);
    setEditorContent(sequence.body);
    setIsEditorDialogOpen(true);
    setSubjectCount(0);
    setWordCount(0);
    setReadingTime(0);
    setUrlCount(0);
    setQuestionCount(0);
    setSpamCount(0);
  };

  const getEmailBodyFromPrompt = async (
    prompt,
    defaultValue = " Use my variables defined inside 'variables' array after the 'message' instead of your variables, also use {{ }} instead of [] , do not use any variables from outside and only use 'senderVariables' for regards",
    senderVariables = "['senderName', 'signature']"
  ) => {
    try {
      if (prompt === "") {
        toast.error("Template body cannot be empty.1");
      } else {
        const myData = variables;
        const dataList = myData.map((item) => item.value);
        const customVariables = dataList.join("\n"); // Concatenate the custom variables
        let body = await writeEmail({
          prompt:
            defaultValue +
            " " +
            "message: " +
            prompt +
            "variables: [" +
            customVariables +
            "]" +
            senderVariables,
        }).unwrap();
        const subjectPattern = /Subject:(.*?)<br>/;
        const subjectMatch = body?.match(subjectPattern);
        const subject = subjectMatch ? subjectMatch[1].trim() : "Subject not found";
        const dearPattern = /dear/i;
        const dearMatch = body.match(dearPattern);
        let startIndex = dearMatch ? dearMatch.index : 0;
        body = body.substring(startIndex);
        setEditorContent(body);
        setEditorSubject(subject);
      }
    } catch (err) {
      toast.error(err.data.error.message);
    }
  };

  const handleFocus = () => {
    setError(false);
  };

  const handleSaveSequenceClick = async (formik, Test) => {
    if (editorContent === "") {
      toast.error("Please enter body to continue");
      setButtonDisabled(false);
      return;
    }

    if (Test) {
      setButtonDisabled(true)
      const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

      if (manualImportText.trim() === "") {
        setError(true);
        setButtonDisabled(false)
        return;
      }

      if (
        formik?.values?.testEmailAccounts === undefined ||
        !formik?.values?.testEmailAccounts?.length
      ) {
        toast.error("Select atleast one account from dropdown");
        setButtonDisabled(false);
        return;
      }

      if (!emailRegex.test(manualImportText)) {
        toast.error("Please enter a valid email address");
        setButtonDisabled(false);
        return;
      }
    }
    const data = { subject: editorSubject, body: editorContent };
    try {
      if (sequenceId) {
        const { message } = await updateSequence({ id: sequenceId, data }).unwrap();
        toast.success(message);
      } else {
        const { message } = await createSequence({ id: campaign._id, data }).unwrap();
        window.Intercom("trackEvent", "Campaign step added");
        toast.success(message);
      }
      if (Test) {
        // await handleImportEmailsClick(true, formik);
        await launchCampaign(formik)
      }
    } catch (error) {
      setButtonDisabled(false)
      toast.error(error.data.error.message);
    } finally {
      if(!Test){
      setIsEditorDialogOpen(false);
      }
    }
  };

  function hasMoreThanFiveWords(str) {
    const specialCharsRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/g;
    str = str.replace(specialCharsRegex, "").replace("  ", " ");
    const words = str.split(/\s+/); // Split the string by whitespace characters
    if (words.length >= 5) setContentLength(true); // Check if the number of words is greater than 5
    else setContentLength(false);
  }

  const handleOptimizeClick = async () => {
    if (!editorContent) return toast.error("Template body cannot be empty. 2");
    try {
      const optimized = await optimizeEmail({
        email: editorContent + "Do not use [] use {{ }}",
      }).unwrap();
      setEditorContent(optimized);
      // update count
      // const subjectCountBar = editorSubject;
      // const wordCountBar = optimized;
      // setSubjectCount(subjectCountBar.split(/\s+/).filter(Boolean).length);
      // setWordCount(wordCountBar.split(/\s+/).filter(Boolean).length);
      // setReadingTime(() => handleReadingTime(wordCountBar));
      // setUrlCount(() => handleUrlCount(wordCountBar));
      // setQuestionCount(() => handleQuestions(wordCountBar));
      // setSpamCount(() => handleSpamCount(subjectCountBar, wordCountBar));
    } catch (err) {
      toast.error(err.data.error.message);
    }
  };

  const handleDragEnd = async ({ source, destination }) => {
    try {
      const fromStep = source.index + 1;
      const toStep = destination.index + 1;

      if (fromStep === toStep) return;

      await updateSequenceOrder({ id: campaign._id, data: { fromStep, toStep } }).unwrap();
    } catch (err) {
      toast.error(err.data.error.message);
    }
  };

  function handleReadingTime(paragraph, wordsPerMinute = 200) {
    const wordsArray = paragraph?.trim()?.split(/\s+/);
    const totalWords = wordsArray?.length;
    const readingTimeMinutes = totalWords / wordsPerMinute;
    const readingTime = Math.ceil(readingTimeMinutes * 60);
    return readingTime;
  }

  function handleQuestions(paragraph) {
    const questionMarks = paragraph?.match(/\?+/g);
    return questionMarks ? questionMarks?.length : 0;
  }

  function highlightSpam(spamArray) {
    const iframe = document.getElementsByClassName("tox-edit-area__iframe")[0];
    var box = iframe.contentWindow.document.getElementById("tinymce");

    let text = box.innerHTML;
    text = text.replace(
      /(<span class="spam-word" style="border-bottom:3px solid red;">|<\/span>)/gim,
      ""
    );

    let newText = text;
    for (let i = 0; i < spamArray.length; i++) {
      const regex = new RegExp(`\\b${spamArray[i]}\\b`, "gi");

      newText = newText.replace(
        regex,
        '<span class="spam-word" style="border-bottom:3px solid red;">$&</span>'
      );
    }

    box.innerHTML = newText;
    return;
  }
  function handleSpamCount(subject, paragraph) {
    const string_to_check = paragraph + " " + subject;
    const spamObj = checkSpamWords(string_to_check);

    highlightSpam(spamObj.spam);
    return spamObj.count;
  }

  function handleUrlCount(paragraph) {
    let urlCount = 0;
    const urlRegex =
      /^(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3})(?::\d{2,5})?(?:\/[^\s]*)?$/;
    const wordsArray = paragraph?.trim()?.split(/\s+/);
    wordsArray?.forEach((ele) => {
      if (urlRegex.test(ele)) urlCount += 1;
    });
    return urlCount;
  }

  // const handleCountUrlLength = (content) => {
  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(content, "text/html");
  //   const links = doc.querySelectorAll("a");
  //   const totalLinksCount = links.length;
  //   return totalLinksCount;
  // };

  const handleCountUrlLength = (content) => {
    const linkMatches = content.match(/(?:https?:\/\/|www\.)\S+|<a\s+.*?<\/a>/gi);
    const totalLinksCount = linkMatches ? linkMatches.length : 0;
    return totalLinksCount;
  };

  function handleSubmit(event) {
    event.preventDefault();
    const subjectCountBar = editorSubject;
    const wordCountBar = editorContent;
    setSubjectCount(subjectCountBar.split(/\s+/).filter(Boolean).length);
    setWordCount(wordCountBar.split(/\s+/).filter(Boolean).length);
    setReadingTime(() => handleReadingTime(wordCountBar));
    // setUrlCount(() => handleUrlCount(wordCountBar));
    setQuestionCount(() => handleQuestions(wordCountBar));
    setSpamCount(() => handleSpamCount(subjectCountBar, wordCountBar));
    const urlCountResult = handleCountUrlLength(editorContent);
    setUrlCount(urlCountResult);
  }

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleEditorClick = () => {
    setCursorLoaction(1);
  };

  const handleSubjectClick = () => {
    setCursorLoaction(0);
  };

  const insertContent = (value) => {
    if (cursorLocation === 0) {
      setEditorSubject(editorSubject + value);
    } else {
      if (editorRef.current) {
        const editor = editorRef.current;
        editor.insertContent(value);
      }
    }
  };

  const insertUnsubscribeLink = () => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.insertContent(`<a href='UNSUBSCRIBE'>${unsubscribeText}</a>`);
      setUnsubscribeText("Click here to unsubscribe");
    }
    setIsUnsubscribeOpen(false);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setShowData(false);
  };
  const [buttonDisabled, setButtonDisabled] = useState(false); 
  const handleCloseModal = () => {
    setOpenModal(false);
    setError(false);
    setManualImportText("");
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 450,
    bgcolor: "background.paper",
    borderRadius: "5px",
    boxShadow: 24,
    p: 4,
  };

  const [leadsData, setLeadsData] = useState("");
  const [lessThanArray, setLessThanArray] = useState([]);
  const [getLeads] = useGetLeadsMutation();
  const campaignSequences = async () => {
    try {
      const response = await getLeads({
        id: campaign._id,
      });
      setLeadsData(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };
  useEffect(() => {
    campaignSequences();
  }, []);

  useEffect(() => {
    if (leadsData) {
      const results = leadsData?.docs?.map((document) => document.sequence_step);
      const allValuesAreSame = results?.every((value) => value === results[0]);
      const commonValue = allValuesAreSame ? results[0] : null;
      const newArray = [];

      for (let i = 0; i < commonValue; i++) {
        newArray.push(i);
      }

      setLessThanArray(newArray);
    }
  }, [leadsData]);

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const enteredValue = currentInput.trim();
      const isValueValid = testEmailAccounts.includes(enteredValue);
      if (!isValueValid) {
        e.preventDefault();
        toast.error("Please select a valid account from the dropdown");
      } else {
        const isValueValid = testEmailAccounts.includes(enteredValue);
        if (isValueValid) {
          formik.setFieldValue("testEmailAccounts", [
            ...formik.values.testEmailAccounts,
            enteredValue,
          ]);
          setCurrentInput("");
        }
      }
    }
  };

  const [scroll, setScroll] = useState("paper");
  const handleClickOpen = (scrollType) => () => {
    setTempOpenModal(true);
    setScroll(scrollType);
  };

  const currentUrl = window.location.href;
  const result = currentUrl.match(/^https:\/\/[^\/]+/);
  const extractedBaseUrl = result ? result[0] : null;

  return (
    <>
      <Box
        sx={{
          display: campaign?.sequences?.length ? "flex" : "none",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "20px",
              letterSpacing: "0px",
              color: "#28287B",
            }}
          >
            Total Steps in Sequence: {campaign?.sequences?.length}
          </Typography>
          <Button
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#164694",
                boxShadow: 10,
              },
              textAlign: "left",
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "18px",
              letterSpacing: "0em",
              color: "white",
              backgroundColor: "#0071F6",
              borderRadius: "8px",
              px: 1.5,
              py: 1.5,
            }}
            variant="outlined"
            size="large"
            onClick={handleAddStepClick}
          >
            Add step
          </Button>
        </Box>
        <Box sx={{ width: "100%", mt: 2 }}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="droppable" direction="vertical">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <Stepper
                    nonLinear
                    orientation="vertical"
                    activeStep={lessThanArray.length > 0 ? lessThanArray : activeStep}
                  >
                    {campaign?.sequences?.map((sequence, index) => (
                      <Step
                        key={sequence._id}
                        completed={lessThanArray.includes(index)}
                        onClick={() => {
                          setActiveStep(index);
                        }}
                        expanded={true}
                        sx={{ "& div": { mb: 0 } }}
                      >
                        <DraggableSequence
                          sequence={sequence}
                          index={index}
                          showWaitDays={index !== 0}
                          showDelete={campaign.sequences.length > 1}
                          onEditClick={handleEditClick}
                          campaignId={campaign._id}
                        />
                      </Step>
                    ))}
                  </Stepper>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      </Box>
      {!campaign?.sequences?.length && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              flexDirection: "column",
              backgroundColor: "white",
              height: "calc(100vh - 220px)",
              boxShadow: "0px 12px 15px 0px #4B71970D",
              borderRadius: "12px",
              px: { xs: 2, sm: 0 },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <HeroIcon />
            </Box>

            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                lineHeight: "25px",
                letterSpacing: "0em",
                color: "#28287B",
                mt: 3,
                textAlign: "center",
              }}
            >
              Start by creating a new sequence here
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 400,
                lineHeight: "16px",
                letterSpacing: "0em",
                color: "#8181B0",
                mt: 2,
                textAlign: "center",
              }}
            >
              Try to keep yours emails short, sweet and personal
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                mt: 4,
              }}
            >
              <Button
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: "#164694",
                    boxShadow: 10,
                  },
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "18px",
                  letterSpacing: "0em",
                  color: "white",
                  backgroundColor: "#0071F6",
                  borderRadius: "8px",
                  px: 1.5,
                  py: 1.5,
                }}
                variant="outlined"
                size="large"
                onClick={handleAddStepClick}
              >
                <Box
                  sx={{ mr: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
                ></Box>
                Add step
              </Button>
            </Box>
          </Box>
        </>
      )}
      <Dialog
        open={isEditorDialogOpen}
        onClose={() => setIsEditorDialogOpen(false)}
        fullWidth
        maxWidth="md"
        sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
        disableEnforceFocus={true}
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: "25px",
            letterSpacing: "0em",
            color: "#28287B",
            position: "relative",
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>Send automatic email</Typography>
          <IconButton
            sx={{ position: "absolute", right: 0, top: 0 }}
            onClick={() => setIsEditorDialogOpen(false)}
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              width: "100%",
              borderRadius: 2,
              border: "1px solid rgba(0,0,0,0.1)",
              p: 2,
              pb: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <form onSubmit={handleSubmit} style={{ width: "100%" }} variant="primary">
              <Box
                sx={{
                  width: "100%",

                  justifyContent: "center",
                  alignContent: "center",
                  display: "flex",
                }}
              >
                <Grid
                  container
                  // spacing={3}
                  maxWidth={"md"}
                  sx={{ position: "relative", ml: 0, mt: 0 }}
                >
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      px: 2,
                      py: 1,
                      backgroundColor: theme.palette.grey[100],
                      borderRadius: "16px",
                    }}
                  >
                    <Grid item xs={12} md={8} sx={{ borderRadius: "10px" }}>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                              mr: 2,
                            }}
                          >
                            Subject:
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            sx={{
                              "& div input": {
                                border: "none",
                                fontWeight: 600,
                              },
                              "& div fieldset": {
                                border: "none",
                              },
                            }}
                            placeholder={
                              sequenceStepCount > 1
                                ? "Leave empty to use previous step's subject"
                                : "Your subject"
                            }
                            name="subject"
                            value={editorSubject}
                            onChange={(e) => setEditorSubject(e.target.value)}
                            onClick={handleSubjectClick}
                          />
                        </Box>
                      </Stack>
                      {/* <Hidden mdUp>
                        <IconButton
                          aria-label="more"
                          id="long-button"
                          aria-controls={showParams ? "long-menu" : undefined}
                          aria-expanded={showParams ? "true" : undefined}
                          aria-haspopup="true"
                          sx={{ border: 2, position: "absolute", top: 10, right: 10 }}
                          onClick={() => {
                            setShowParams((prev) => !prev);
                          }}
                        >
                          <MoreVertOutlined />
                        </IconButton>
                      </Hidden> */}
                    </Grid>
                    <Grid item xs={4} sx={{ display: { xs: "none", md: "block" } }}>
                      <Box
                        sx={{
                          // borderLeft: "1px solid rgba(0,0,0,0.1)",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          pl: 1,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <Tooltip
                          title={
                            cursorLocation === 1
                              ? "Insert variables in body"
                              : "Insert variables in subject"
                          }
                          arrow
                          placement="top"
                        >
                          <Button
                            variant="contained"
                            disabled={variables && variables.length === 0}
                            sx={{
                              backgroundColor: "#E7F0FF",
                              "&:hover": {
                                backgroundColor: "#E7F0FF",
                              },
                              mr: 1,
                            }}
                            onClick={handleClick}
                          >
                            <BoltIcon
                              color={
                                variables && variables.length === 0
                                  ? theme.palette.primary.contrastText
                                  : theme.palette.primary.main
                              }
                            />
                          </Button>
                        </Tooltip>

                        <Tooltip title="" arrow placement="top">
                          <Button
                            onClick={() => {
                              getEmailBodyFromPrompt(editorContent);
                            }}
                            variant="outlined"
                            sx={{
                              mr: 1,
                              borderColor: "#28287B",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: 24,
                                height: 24,
                              }}
                            >
                              {isWriteEmailLoading ? (
                                <CircularProgress size={16} thickness={5} />
                              ) : (
                                <OpenAiIcon />
                              )}
                            </Box>
                          </Button>
                        </Tooltip>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Button
                            variant="contained"
                            sx={{
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              handleSaveSequenceClick();
                            }}
                          >
                            {isCreateSequenceLoading || isUpdateSequenceLoading ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  py: 0.55,
                                }}
                              >
                                {" "}
                                <CircularProgress size={16} thickness={5} sx={{ color: "white" }} />
                              </Box>
                            ) : (
                              "Save"
                            )}
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  {isMobile && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          // borderLeft: "1px solid rgba(0,0,0,0.1)",
                          display: "flex",
                          justifyContent: { xs: "space-between", sm: "flex-end" },
                          alignItems: "center",

                          width: "100%",
                          height: "100%",
                          my: 0.5,
                        }}
                      >
                        <Tooltip
                          title={
                            cursorLocation === 1
                              ? "Insert variables in body"
                              : "Insert variables in subject"
                          }
                          arrow
                          placement="top"
                        >
                          <Button
                            variant="contained"
                            disabled={variables && variables.length === 0}
                            sx={{
                              backgroundColor: "#E7F0FF",
                              "&:hover": {
                                backgroundColor: "#E7F0FF",
                              },
                              mr: 1,
                            }}
                            onClick={handleClick}
                          >
                            <BoltIcon
                              color={
                                variables && variables.length === 0
                                  ? theme.palette.primary.contrastText
                                  : theme.palette.primary.main
                              }
                            />
                          </Button>
                        </Tooltip>
                        <Tooltip title="" arrow placement="top">
                          <Button
                            onClick={() => {
                              getEmailBodyFromPrompt(editorContent);
                            }}
                            variant="outlined"
                            sx={{
                              mr: 1,
                              borderColor: "#28287B",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: 24,
                                height: 24,
                              }}
                            >
                              {isWriteEmailLoading ? (
                                <CircularProgress size={16} thickness={5} />
                              ) : (
                                <OpenAiIcon />
                              )}
                            </Box>
                          </Button>
                        </Tooltip>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Button
                            variant="contained"
                            sx={{
                              borderTopRightRadius: 0,
                              borderBottomRightRadius: 0,
                            }}
                            onClick={handleSaveSequenceClick}
                          >
                            {isCreateSequenceLoading || isUpdateSequenceLoading ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  py: 0.55,
                                }}
                              >
                                {" "}
                                <CircularProgress size={16} thickness={5} sx={{ color: "white" }} />
                              </Box>
                            ) : (
                              "Save"
                            )}
                          </Button>
                          <Button
                            variant="contained"
                            sx={{
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              px: 0.5,
                              py: "8.3px",
                              minWidth: "auto",
                            }}
                          >
                            <ArrowDropDown fontSize="small" />
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  <Grid
                    item
                    xs={12}
                    sm={8}
                    sx={{ py: 1, minHeight: { xs: "500px", sm: "fit-content" } }}
                  >
                    <Editor
                      apiKey={config.TINYMCE_EDITOR_API}
                      onEditorChange={(value) => {
                        const modifiedHtml = value.replace(
                          /href="\.\.\//,
                          `href="${extractedBaseUrl}/`
                        );
                        setEditorContent(modifiedHtml);
                        hasMoreThanFiveWords(modifiedHtml);
                      }}
                      onClick={handleEditorClick}
                      value={editorContent.replace(/<p>Subject:[^<]*<br><br>/, "")}
                      onInit={(evt, editor) => (editorRef.current = editor)}
                      init={{
                        height: "100%",
                        selector: "textarea",
                        init_instance_callback: function (editor) {
                          const freeTiny = document.querySelector(".tox .tox-notification--in");
                          if (freeTiny) {
                            freeTiny.style.display = "none";
                          }

                          const statusBarTextContainer = document.querySelector(
                            ".tox .tox-statusbar__text-container"
                          );
                          statusBarTextContainer.style.display = "none";
                          const statusBar = document.querySelector(".tox .tox-statusbar");
                          statusBar.style.border = "none";
                        },
                        menubar: false,
                        plugins: [
                          "mentions advlist autolink lists link image charmap print preview anchor",
                          "searchreplace visualblocks code fullscreen",
                          "insertdatetime media paste code help wordcount",
                          "autolink",
                          "link","emoticons"
                        ],
                        toolbar:
                          "undo redo | formatselect | " +
                          "bold italic backcolor | link insertUnsubscribeLink insertTemplate | alignleft aligncenter " +
                          "alignright alignjustify | bullist numlist outdent indent | " +
                          " removeformat | emoticons",
                        setup: function (editor) {
                          editor.ui.registry.addIcon(
                            "unsubscribeIcon",
                            '<svg height="24" width="24"><path d="M14 8c0-2.21-1.79-4-4-4S6 5.79 6 8s1.79 4 4 4 4-1.79 4-4zm3 2v2h6v-2h-6zM2 18v2h16v-2c0-2.66-5.33-4-8-4s-8 1.34-8 4z"></path></svg>'
                          );

                          editor.ui.registry.addIcon(
                            "templateIcon",
                            '<svg height="24" width="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v6h-2zm0 8h2v2h-2z"></path></svg>'
                          );

                          editor.ui.registry.addButton("insertUnsubscribeLink", {
                            icon: "unsubscribeIcon",
                            tooltip: "Insert unsubscribe link",
                            onAction: () => setIsUnsubscribeOpen(true),
                          });
                          const iconString = renderToString(<AutoAwesomeMosaicIcon />);
                          editor.ui.registry.addIcon("autoAwesomeMosaicIcon", iconString);
                          editor.ui.registry.addButton("insertTemplate", {
                            icon: "autoAwesomeMosaicIcon",
                            tooltip: "Insert template",
                            onAction: () => {
                              setTempOpenModal(true);
                            },
                          });
                        },
                        content_style:
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px, }",
                        emoticons_append: {
                          custom_mind_explode: {
                            keywords: ["brain", "mind", "explode", "blown"],
                            char: "🤯",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Stack spacing={3} sx={{ p: 2 }}>
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 700,
                          lineHeight: "20px",
                          color: "#28287B",
                        }}
                      >
                        Email template insights
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            Subject Count
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {subjectCount}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={subjectCount}
                          maxCountOf={maxSubjectCount}
                          minRange={3}
                          maxRange={5}
                          barColor={
                            subjectCount > 8 || subjectCount < 3
                              ? "red"
                              : subjectCount > 5
                              ? "orange"
                              : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            Word Count
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {wordCount}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={wordCount}
                          maxCountOf={maxWordCount}
                          minRange={16}
                          maxRange={150}
                          barColor={
                            wordCount > 300 || wordCount < 16
                              ? "red"
                              : wordCount > 150
                              ? "orange"
                              : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            Reading time
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {readingTime}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={readingTime}
                          maxCountOf={maxReadingTime}
                          minRange={11}
                          maxRange={60}
                          barColor={
                            readingTime >= 70
                              ? "red"
                              : readingTime > 60 && readingTime < 70
                              ? "yellow"
                              : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            URL Count
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {urlCount}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={urlCount}
                          maxCountOf={maxLinks}
                          minRange={0}
                          maxRange={1}
                          barColor={
                            urlCount > 2 || urlCount < 0 ? "red" : urlCount > 1 ? "orange" : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            Question Count
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {questionCount}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={questionCount}
                          maxCountOf={maxQuestions}
                          minRange={0}
                          maxRange={2}
                          barColor={
                            questionCount > 3 || questionCount < 0
                              ? "red"
                              : questionCount > 2
                              ? "orange"
                              : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#28287B",
                            }}
                          >
                            Spam word count
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: "16px",
                              color: "#8181B0",
                            }}
                          >
                            {spamCount}
                          </Typography>
                        </Box>

                        <CustomCounterProgress
                          countOf={spamCount}
                          maxCountOf={maxSpams}
                          minRange={0}
                          maxRange={15}
                          barColor={
                            spamCount > 10 || spamCount < 0
                              ? "red"
                              : spamCount > 7
                              ? "orange"
                              : "green"
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          mt: 1,
                          width: "100%",
                        }}
                      >
                        <Box>
                          <Button
                            sx={{ px: 2, width: "30px" }}
                            color="primary"
                            variant="outlined"
                            onClick={() => {
                              // handleSaveSequenceClick();
                              handleOpenModal();
                            }}
                          >
                            Test
                          </Button>
                          <Dialog
                            open={openModal}
                            onClose={handleCloseModal}
                            disableEnforceFocus={true}
                            maxWidth="sm"
                            minWidth="xs"
                            fullWidth
                            sx={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                          >
                            <DialogTitle sx={{ position: "relative" }}>
                              <Typography variant="h6" component="h2">
                                Test Email
                              </Typography>
                              <IconButton
                                sx={{ position: "absolute", right: 0, top: 0 }}
                                onClick={handleCloseModal}
                              >
                                <CloseOutlined />
                              </IconButton>
                            </DialogTitle>
                            <DialogContent sx={{ overflow: "hidden" }}>
                              <Typography
                                sx={{
                                  width: "100%",
                                  textAlign: "left",
                                  fontSize: "14px",
                                  fontWeight: 500,
                                  lineHeight: "10px",
                                  color: "#28287B",
                                  mt: 2,
                                  mb: 1,
                                  ml: "1px",
                                }}
                              >
                                From
                              </Typography>
                              <form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
                                <Box
                                  sx={{
                                    mt: 2,
                                    width: "100%",
                                    backgroundColor: "white",
                                    "& div": {},
                                    "& div fieldset": {
                                      borderRadius: "8px",
                                      border: "1px solid #E4E4E5",
                                    },
                                    "& div input": {
                                      py: 2,
                                      fontSize: "13px",
                                      fontWeight: 400,
                                      lineHeight: "16px",
                                      letterSpacing: "0em",
                                      "&::placeholder": {
                                        color: "rgba(40, 40, 123, 0.5)",
                                      },
                                    },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      height: "100%",
                                      minWidth: { xs: "100%", sm: "350px" },
                                      mt: "px",
                                    }}
                                  >
                                    {" "}
                                    <Autocomplete
                                      freeSolo
                                      multiple
                                      disableCloseOnSelect
                                      options={testEmailAccounts}
                                      getOptionLabel={(option) => option}
                                      filterSelectedOptions
                                      value={formik.values.testEmailAccounts}
                                      onChange={(_, newValue) => {
                                        if (
                                          Array.isArray(newValue) &&
                                          newValue.every((value) =>
                                            testEmailAccounts.includes(value)
                                          )
                                        ) {
                                          handleFieldSelectionAndValidation(newValue);
                                        } else if (newValue.length < 1) {
                                          handleFieldSelectionAndValidation(newValue);
                                        }
                                      }}
                                      onBlur={formik.handleBlur("testEmailAccounts")}
                                      // onKeyDown={handleKeyDown}
                                      // onInputChange={(event, newInputValue) => {
                                      //   setCurrentInput(newInputValue);
                                      // }}
                                      renderOption={(props, option, { selected }) => (
                                        <li
                                          style={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            alignItems: "center",
                                            px: 0,
                                          }}
                                          {...props}
                                        >
                                          <Checkbox
                                            icon={<OffCheckboxCustomIcon />}
                                            checkedIcon={<OnCheckboxCustomIcon />}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                          />
                                          <Typography
                                            sx={{
                                              fontSize: "13px",
                                              fontWeight: 500,
                                              lineHeight: "16px",
                                              color: "#28287B",
                                            }}
                                          >
                                            {" "}
                                            {option}
                                          </Typography>
                                        </li>
                                      )}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          placeholder="Select..."
                                          fullWidth
                                          variant="outlined"
                                          error={
                                            !!(
                                              formik.touched.testEmailAccounts &&
                                              formik.errors.testEmailAccounts
                                            )
                                          }
                                          helperText={
                                            formik.touched.testEmailAccounts &&
                                            formik.errors.testEmailAccounts
                                          }
                                          name="testEmailAccounts"
                                          sx={{
                                            backgroundColor: "white",
                                            width: "100%",
                                            "& div": { pl: 0.3, minHeight: "40px" },
                                            "& div fieldset": {
                                              borderRadius: "8px",
                                              border: "1px solid #E4E4E5",
                                            },
                                            "& div input": {
                                              py: 1.5,
                                              fontSize: "13px",
                                              fontWeight: 400,
                                              lineHeight: "16px",
                                              letterSpacing: "0em",
                                              "&::placeholder": {
                                                color: "rgba(40, 40, 123, 0.5)",
                                              },
                                            },
                                            "& label": {
                                              fontSize: "14px",
                                              fontWeight: 700,
                                              lineHeight: "18px",
                                              letterSpacing: "0px",
                                              color: "#28287B",
                                            },
                                            // ml: 1,
                                            // boxShadow: 10,
                                          }}
                                          size="small"
                                        />
                                      )}
                                      sx={{
                                        // maxWidth: { xs: "100%", sm: "420px" },
                                        height: "100%",
                                        // minWidth: { xs: "100%", sm: "350px" },
                                        width: "100%",
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </form>
                              <Typography
                                sx={{
                                  width: "100%",
                                  textAlign: "left",
                                  fontSize: "14px",
                                  fontWeight: 500,
                                  lineHeight: "10px",
                                  color: "#28287B",
                                  mt: 2,
                                  mb: 1,
                                  ml: "1px",
                                }}
                              >
                                To
                              </Typography>
                              <TextField
                                placeholder={"example@mail.com"}
                                fullWidth
                                variant="outlined"
                                sx={{
                                  mt: 1,
                                  width: "100%",

                                  backgroundColor: "white",
                                  "& div": { pl: showData ? 1 : undefined },
                                  "& div fieldset": {
                                    borderRadius: "8px",
                                    border: "1px solid #E4E4E5",
                                  },
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
                                error={error}
                                helperText={error ? "Field is required" : ""}
                                onFocus={handleFocus}
                              />
                            </DialogContent>
                            <DialogActions sx={{ px: "24px", pb: 2 }}>
                              <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                                <Button
                                 disabled={buttonDisabled}
                                  variant="contained"
                                  onClick={() => {
                                    handleSaveSequenceClick(formik, "Test")
                                  }}
                                  sx={{ minWidth: "85px" }}
                                >
                                  <Typography variant="h6" component="h6">
                                    {isCreatingLeads ? (
                                      <CircularProgress
                                        size={16}
                                        thickness={5}
                                        sx={{ color: "white" }}
                                      />
                                    ) : (
                                      "Send"
                                    )}
                                  </Typography>
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={handleCloseModal}
                                  sx={{ minWidth: "85px" }}
                                >
                                  <Typography variant="h6" component="h6">
                                    Cancel
                                  </Typography>
                                </Button>
                              </Stack>
                            </DialogActions>
                          </Dialog>

                          {/* templat */}

                          <Dialog
                            open={tempOpenModal}
                            onClose={() => setTempOpenModal(false)}
                            fullWidth
                            maxWidth="lg"
                            sx={{ backgroundColor: "rgba(4, 4, 30, 0.5)" }}
                            disableEnforceFocus={true}
                            fullScreen={isMobile}
                            // aria-labelledby="modal-modal-title"
                            // aria-describedby="modal-modal-description"
                          >
                            <DialogTitle sx={{ position: "relative" }}>
                              <Typography
                                variant="h4"
                                component="h2"
                                sx={{ color: "#28287B", fontWeight: 700, fontSize: "20px" }}
                              >
                                {/* <AutoAwesomeMosaicIcon /> Templates Library */}
                                Templates Library
                              </Typography>
                              <IconButton
                                sx={{ position: "absolute", right: 0, top: 0 }}
                                onClick={() => setTempOpenModal(false)}
                              >
                                <CloseOutlined />
                              </IconButton>
                            </DialogTitle>
                            <DialogContent sx={{ pb: 0, overflow: "hidden" }}>
                              <Grid
                                container
                                sx={{
                                  bgcolor: "background.paper",
                                  gap: { xs: 2, md: 0 },
                                  height: "100%",
                                }}
                              >
                                <Grid
                                  item
                                  xs={12}
                                  md={3}
                                  sx={{
                                    // flexGrow: 1,
                                    bgcolor: "background.paper",

                                    height: "fit-content",
                                    border: "1px solid #E4E4E5",
                                    borderRadius: "12px",
                                    transition: "all 1s ease",
                                    maxHeight: "calc(100vh - 230px)",

                                    overflow: "auto",
                                    scrollbarWidth: "thin",
                                    "&::-webkit-scrollbar": {
                                      width: "8px",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                      backgroundColor: "#8492a6",
                                      borderRadius: "4px",
                                    },
                                    "&::-webkit-scrollbar-track": {
                                      backgroundColor: "#E2E9E9",
                                      borderRadius: "15px",
                                    },
                                    //  display: "flex",
                                    // flexDirection: { xs: "column", md: "row" },
                                    // height: 624,
                                  }}
                                >
                                  {/* <Tabs
                                    orientation={isMobile ? "horizontal" : "vertical"}
                                    variant="scrollable"
                                    value={value}
                                    onChange={handleChange}
                                    aria-label="Vertical tabs example"
                                    sx={{
                                      borderRight: 1,
                                      borderColor: "divider",
                                      width: "100%",

                                      "& .MuiTabs-indicator": { display: "none" },
                                      p: { xs: 0.5, md: 2 },
                                    }}
                                  >
                                    {templateEmails.map((item, index) => (
                                      <Tab
                                        onClick={() => {
                                          setSelectedTemplate(item.id);
                                        }}
                                        icon={<DescriptionOutlined />}
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          justifyContent: "flex-start",
                                          alignItems: "center",
                                          textAlign: "left",
                                          gap: 2,
                                          minHeight: "52px",

                                          color: "#28287B",
                                          borderRadius: "8px",
                                          fontSize: "14px",
                                          fontWeight: "700",
                                          "&.Mui-selected": {
                                            backgroundColor: theme.palette.grey[200],
                                            color: theme.palette.primary.main,
                                          },
                                        }}
                                        // label={
                                        //   item.subject.length > 22
                                        //     ? `${item.subject.substring(0, 22)}...`
                                        //     : item.subject
                                        // }
                                        label={item.subject}
                                        {...a11yProps(index)}
                                        key={index}
                                      />
                                    ))}
                                  </Tabs> */}
                                  <TemplateSection
                                    isMobile={isMobile}
                                    setSelectedTemplateObject={setSelectedTemplateObject}
                                    selectedTemplateObject={selectedTemplateObject}
                                    templates = {templates}
                                  />
                                </Grid>
                                <Grid item xs={12} md={9}>
                                  {/* {templateEmails.map((item, index) => (
                                    <TabPanel key={index} value={value} index={index}>
                                      <Box
                                        sx={{
                                          flexGrow: 1,
                                          bgcolor: "background.paper",
                                          display: "flex",

                                          mt: 1,
                                          mb: { xs: 1, md: 0 },
                                        }}
                                      >
                                        <Typography
                                          variant="h4"
                                          component="h2"
                                          sx={{
                                            color: "#28287B",
                                            lineHeight: 1.5,
                                            fontWeight: 700,
                                            fontSize: "16px",
                                            px: 2,
                                          }}
                                        >
                                          {item.subject}
                                        </Typography>
                                      </Box>
                                      <Divider sx={{ mt: "13px" }} />
                                      <Box
                                        sx={{
                                          // bgcolor: "#E2E9E9",
                                          px: "16px",
                                          borderRadius: "15px",
                                          // height: 450,
                                          height: {
                                            xs: "calc(100vh - 260px)",
                                            md: "calc(100vh - 275px)",
                                          },
                                          overflow: "auto",
                                          scrollbarWidth: "thin",
                                          "&::-webkit-scrollbar": {
                                            width: "8px",
                                          },
                                          "&::-webkit-scrollbar-thumb": {
                                            backgroundColor: "#8492a6",
                                            borderRadius: "4px",
                                          },
                                          "&::-webkit-scrollbar-track": {
                                            backgroundColor: "#E2E9E9",
                                            borderRadius: "15px",
                                          },
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            color: "#28287B",
                                            fontSize: "13px",
                                            fontWeight: "500",
                                          }}
                                          dangerouslySetInnerHTML={{ __html: item.body }}
                                        />
                                      </Box>
                                    </TabPanel>
                                  ))} */}
                                  <Box
                                    sx={{
                                      border: "1px solid #E4E4E5",
                                      borderRadius: "12px",
                                      ml: { xs: 0, md: 3 },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        flexGrow: 1,
                                        bgcolor: "background.paper",
                                        display: "flex",

                                        mt: 1,
                                        mb: { xs: 1, md: 0 },
                                      }}
                                    >
                                      <Typography
                                        variant="h4"
                                        component="h2"
                                        sx={{
                                          color: "#28287B",
                                          lineHeight: 1.5,
                                          fontWeight: 700,
                                          fontSize: "16px",
                                          px: 2,
                                        }}
                                      >
                                        {selectedTemplateObject.subject}
                                      </Typography>
                                    </Box>
                                    <Divider sx={{ mt: "13px" }} />
                                    <Box
                                      sx={{
                                        // bgcolor: "#E2E9E9",
                                        px: "16px",
                                        borderRadius: "15px",
                                        // height: 450,
                                        height: {
                                          xs: "calc(100vh - 260px)",
                                          md: "calc(100vh - 275px)",
                                        },
                                        overflow: "auto",
                                        scrollbarWidth: "thin",
                                        "&::-webkit-scrollbar": {
                                          width: "8px",
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                          backgroundColor: "#8492a6",
                                          borderRadius: "4px",
                                        },
                                        "&::-webkit-scrollbar-track": {
                                          backgroundColor: "#E2E9E9",
                                          borderRadius: "15px",
                                        },
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          color: "#28287B",
                                          fontSize: "13px",
                                          fontWeight: "500",
                                        }}
                                        dangerouslySetInnerHTML={{
                                          __html: selectedTemplateObject.body,
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                </Grid>
                              </Grid>
                            </DialogContent>
                            <DialogActions>
                              <Stack
                                mt={2}
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 2,
                                  px: { xs: "16px" },
                                }}
                              >
                                <Button
                                  sx={{ m: 0, width: "48%" }}
                                  variant="outlined"
                                  onClick={() => {
                                    // if (selectedTemplate !== null) {
                                    //   const selectedTemplateObj = templateEmails.find(
                                    //     (item) => item.id === selectedTemplate
                                    //   );
                                    //   if (selectedTemplateObj) {
                                    //     const clipboardText = selectedTemplateObj.body
                                    //       .replace(/<\/?p>/g, "")
                                    //       .replace(/<br\s?\/?>/g, "\n");
                                    //     navigator.clipboard
                                    //       .writeText(clipboardText)
                                    //       .then(() => {
                                    //         toast.success("Email copied to clipboard");
                                    //       })
                                    //       .catch((err) => {
                                    //         toast.error("Unable to copy to clipboard");
                                    //       });
                                    //   }
                                    // }
                                    if (selectedTemplateObject !== null) {
                                      const clipboardText = selectedTemplateObject.body
                                        .replace(/<\/?p>/g, "")
                                        .replace(/<br\s?\/?>/g, "\n");
                                      navigator.clipboard
                                        .writeText(clipboardText)
                                        .then(() => {
                                          toast.success("Email copied to clipboard");
                                        })
                                        .catch((err) => {
                                          toast.error("Unable to copy to clipboard");
                                        });
                                    }
                                  }}
                                >
                                  <Typography variant="h6" component="h6">
                                    Copy
                                  </Typography>
                                </Button>
                                <Button
                                  variant="contained"
                                  onClick={() => {
                                    // if (selectedTemplate !== null) {
                                    //   const selectedTemplateObj = templateEmails.find(
                                    //     (item) => item.id === selectedTemplate
                                    //   );
                                    //   if (selectedTemplateObj) {
                                    //     setEditorContent(selectedTemplateObj.body);
                                    //     setEditorSubject(selectedTemplateObj.subject);
                                    //     handleImportEmailsClick(true, formik);
                                    //     setTempOpenModal(false);
                                    //   }
                                    // }
                                    if (selectedTemplateObject !== null) {
                                      setEditorContent(selectedTemplateObject.body);
                                      setEditorSubject(selectedTemplateObject.subject);
                                      // handleImportEmailsClick(true, formik);
                                      setTempOpenModal(false);
                                      toast.success(`Template Pasted`);
                                    }
                                  }}
                                  sx={{ cursor: "pointer", width: "48%" }}
                                >
                                  <Typography variant="h6" component="h6">
                                    Use Template
                                  </Typography>
                                </Button>
                              </Stack>
                            </DialogActions>
                          </Dialog>
                        </Box>
                        <Button
                          sx={{ px: 2, width: "30px", ml: 2 }}
                          color="primary"
                          variant="outlined"
                          type="submit"
                          id="submit-btn"
                          // onClick={handleSubmit}
                        >
                          Check
                        </Button>
                        {editorContent && contentLength && (
                          <Button
                            sx={{ px: 1, py: 1, width: "auto", ml: 2 }}
                            color="primary"
                            variant="contained"
                            type="Button"
                            onClick={handleOptimizeClick}
                            disabled={isOptimizeEmailLoading}
                          >
                            {isOptimizeEmailLoading ? (
                              <CircularProgress size={25} thickness={5} />
                            ) : (
                              "Optimize"
                            )}
                          </Button>
                        )}
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </form>
          </Box>
        </DialogContent>
      </Dialog>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{ mt: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            // width: "fit-content",
            p: 1,
            width: "280px",
          }}
        >
          {variables?.map((item) => {
            return (
              <Button
                key={item.value}
                value={item.value}
                onClick={(e) => insertContent(e.currentTarget.getAttribute("value"))}
                fullWidth
                sx={{
                  py: 1,
                  px: 1,
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  color: "#101828",
                  fontSize: "13px",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                  <Typography
                    sx={{
                      color: "#28287B",
                      fontSize: "13px",
                      fontWeight: 700,
                      linHeight: "16px",
                      letterSpacing: "0px",
                    }}
                    value={item.value}
                  >
                    {item.key}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#8181B0",
                      fontSize: "11px",
                      fontWeight: 700,
                      linHeight: "14px",
                      letterSpacing: "0px",
                      ml: 1,
                    }}
                    value={item.value}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Button>
            );
          })}
        </Box>
      </Popover>
      <Dialog
        open={isUnsubscribeOpen}
        onClose={() => setIsUnsubscribeOpen(false)}
        maxWidth={"xs"}
        fullWidth
      >
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: "28px",
            color: "#28287B",
          }}
        >
          Insert Unsubscribe Link
        </DialogTitle>
        <DialogContent>
          <InputLabel>Display as</InputLabel>
          <TextField
            id="standard-basic"
            variant="standard"
            value={unsubscribeText}
            fullWidth
            onChange={(e) => setUnsubscribeText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUnsubscribeOpen(false)}>Cancel</Button>
          <Button onClick={insertUnsubscribeLink}>Insert Unsubscribe Link</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CampaignSequences;
