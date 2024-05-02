import {
  Button,
  TextField,
  TextareaAutosize,
  Box,
  Stack,
  Grid,
  Slider,
  Typography,
  IconButton,
  FormControl,
  LinearProgress,
  linearProgressClasses,
  CircularProgress,
} from "@mui/material";
import { MoreVertOutlined } from "@mui/icons-material";
import { Hidden, useMediaQuery } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { Editor } from "@tinymce/tinymce-react";
import checkSpamWords from "./utils/checkSpamTree";
import CustomCounterProgress from "./CustomCounterProgress";

const BorderLinearProgress = styled(LinearProgress)(({ theme, barColor }) => ({
  height: 10,
  borderRadius: 5,

  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: barColor,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
}));
const BorderLinearProgressBrackets = styled(LinearProgress)(({ theme, barColor, smallBar }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "transparent",
  },
  [`& .${linearProgressClasses.bar}`]: {
    //   borderRadius: 5,
    backgroundColor: "transparent",
    border: smallBar ? `2px solid ${barColor}` : "2px solid black",
    borderRight: smallBar && "2px solid black",
  },
}));

const [maxSubjectCount, maxWordCount, maxReadingTime, maxLinks, maxQuestions, maxSpams] = [
  15, 500, 210, 3, 4, 7,
];
// subject length: max 15 (3-5)
// word count: max 500 (16-150)
// reading time: max 210s (11-60)
// number of links: max 3 (0-1)
// question: max 4 (0-2)
// spam: max 7 (0-2)

const EmailCheckerComponent = (props) => {
  const {} = props;
  const [showParams, setShowParams] = useState(false);
  const mdScreen = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const editorRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [spamCount, setSpamCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [urlCount, setUrlCount] = useState(0);
  const [aiInput, setAiInput] = useState();
  const [testAreaIn, setTextAreaIn] = useState();
  const [subjectIn, setSubjectIn] = useState();
  const [content, setContent] = useState();
  const [loading, setLoading] = useState(null);

  useEffect(() => {
  }, [subjectCount]);

  const onEditorChange = function (a, editor) {
    setContent(a);
    setTextAreaIn(editor.getContent({ format: "text" }));
   
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

  function handleSpamCount(subject, paragraph) {
    const string_to_check = paragraph + " " + subject;
    return checkSpamWords(string_to_check).count;
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
  function handleAiFunction() {
    setLoading(1);
    try {
      // fetch("http://localhost:8000", {
      //   method: "GET",

      //   headers: {
      //     "Content-type": "application/json; charset=UTF-8",
      //   },
      // })
      //   .then((response) => response.json())
      //   .then((json) => console.log("Jssson", json));
      fetch("http://localhost:8000/gpt", {
        method: "POST",
        body: JSON.stringify({
          prompt: aiInput,
          solution: "Initial",
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .then((json) => {
          const lines = json?.message?.message?.content?.split("\n");
          let subject = "";
          let emailBody = "";

          let isSubjectSection = false;
          for (const line of lines) {
            if (line.startsWith("Subject: ")) {
              isSubjectSection = true;
              subject = line.substring("Subject: ".length)?.trim();
            } else if (isSubjectSection && line?.trim() === "") {
              isSubjectSection = false;
            } else if (!isSubjectSection) {
              emailBody += line + "\n";
            }
          }
          setLoading(null);
          const emailHTML = emailBody.replace(/\n/g, "<br>");
          setTextAreaIn(emailBody);
          setContent(emailHTML);

          setSubjectIn(subject);
          countFunction(subject, emailBody);
        })
        .catch((error) => {
          console.log("error", error);
          setLoading(null);
        });
    } catch (error) {
      console.log("errrrr", error);
      setLoading(null);
    }
  }

  function evaluateTheAns() {
    setLoading(2);

    try {
      // fetch("http://localhost:8000", {
      //   method: "GET",

      //   headers: {
      //     "Content-type": "application/json; charset=UTF-8",
      //   },
      // })
      //   .then((response) => response.json())
      //   .then((json) => console.log("Jssson", json));
      fetch("http://localhost:8000/gpt", {
        method: "POST",
        body: JSON.stringify({
          prompt: testAreaIn,
          subject: subjectIn,
          solution: "Optimized",
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .then((json) => {
          const lines = json?.message?.message?.content?.split("\n");
          let subject = "";
          let emailBody = "";

          let isSubjectSection = false;
          for (const line of lines) {
            if (line.startsWith("Subject: ")) {
              isSubjectSection = true;
              subject = line.substring("Subject: ".length).trim();
            } else if (isSubjectSection && line.trim() === "") {
              isSubjectSection = false;
            } else if (!isSubjectSection) {
              emailBody += line + "\n";
            }
          }
          setLoading(null);

          const emailHTML = emailBody.replace(/\n/g, "<br>");
          setTextAreaIn(emailBody);
          setContent(emailHTML);

          // setSubjectIn(subject);
          countFunction(subjectIn, emailBody);
        });
    } catch (error) {
      console.log("errrrr", error);
      setLoading(null);
    }
  }
  function countFunction(subjectCountBar, wordCountBar) {
    setSubjectCount(
      subjectCountBar
        .trim()
        .split(/\s+/)
        .filter((word) => word !== "").length
    );
    setWordCount(wordCountBar.split(/\s+/).filter((word) => word !== "").length);
    setReadingTime(() => handleReadingTime(wordCountBar));
    setUrlCount(() => handleUrlCount(wordCountBar));
    setQuestionCount(() => handleQuestions(wordCountBar));
    setSpamCount(() => handleSpamCount(subjectCountBar, wordCountBar));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // const subjectCountBar = e.target[0];
    // const wordCountBar = e.target[1];
    let subjectCountBar = subjectIn;
    let wordCountBar = testAreaIn;
    setSubjectCount(
      subjectCountBar
        ?.trim()
        ?.split(/\s+/)
        ?.filter((word) => word !== "").length
    );
    setWordCount(wordCountBar?.split(/\s+/)?.filter((word) => word !== "")?.length);
    setReadingTime(() => handleReadingTime(wordCountBar));
    setUrlCount(() => handleUrlCount(wordCountBar));
    setQuestionCount(() => handleQuestions(wordCountBar));
    setSpamCount(() => handleSpamCount(subjectCountBar, wordCountBar));
  }

  return (
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
        columnSpacing={{ xs: 2, md: 3 }}
        maxWidth={"md"}
        sx={{ position: "relative" }}
      >
        <Grid item xs={8} sx={{ borderRadius: "10px" }}>
          <form onSubmit={handleSubmit} style={{ width: "100%" }} variant="primary">
            <Stack spacing={2}>
              {/* <TextField
                name="aiFill"
                variant="filled"
                id="aiFill"
                label="Enter your text"
                onChange={(e) => setAiInput(e.target.value)}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  sx={{ px: 2, py: 1, width: "auto", m: "auto" }}
                  color="primary"
                  variant="contained"
                  type="button"
                  onClick={() => handleAiFunction()}
                  disabled={loading === 1}
                >
                  {loading === 1 ? <CircularProgress /> : "Generate"}
                </Button>
              </Box> */}

              <TextField
                name="subjectCountBar"
                variant="filled"
                id="subject"
                label="subject"
                value={subjectIn}
                onChange={(e) => setSubjectIn(e.target.value)}
              />
              {/* <TextareaAutosize
                  name="wordCountBar"
                  minRows={30}
                  maxRows={30}
                  value={testAreaIn}
                  onChange={(e) => setTextAreaIn(e.target.value)}
                ></TextareaAutosize> */}
              <Editor
                onEditorChange={onEditorChange}
                //initialValue={content}
                //outputFormat="text"

                value={content}
                onInit={(evt, editor) => (editorRef.current = editor)}
                // initialValue="<p>This is the initial content of the editor.</p>"
                init={{
                  height: 500,
                  menubar: false,
                  plugins: [
                    "mentions advlist autolink lists link image charmap print preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media paste code help wordcount",
                  ],
                  toolbar:
                    "undo redo | formatselect | " +
                    "bold italic backcolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "removeformat | emoticons| help",
                  content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  emoticons_append: {
                    custom_mind_explode: {
                      keywords: ["brain", "mind", "explode", "blown"],
                      char: "🤯",
                    },
                  },
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Button
                  sx={{ px: 1, py: 1, width: "30px" }}
                  color="primary"
                  variant="outlined"
                  type="submit"
                  id="submit-btn"
                >
                  Check
                </Button>
                {testAreaIn && (
                  <Button
                    sx={{ px: 1, py: 1, width: "auto" }}
                    color="primary"
                    variant="contained"
                    type="Button"
                    onClick={() => evaluateTheAns()}
                    disabled={loading === 2}
                  >
                    {loading === 2 ? <CircularProgress /> : "Optimize"}
                  </Button>
                )}
              </Box>
            </Stack>
          </form>
          <Hidden mdUp>
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
          </Hidden>
        </Grid>
        <Grid item xs={4}>
          <Stack spacing={3}>
            <Typography variant="h5" sx={{ pb: 3 }}>
              Template Info
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
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                    color: "rgba(0,0,0,0.75)",
                  }}
                >
                  Subject Count
                </Typography>
                <Typography>{subjectCount}</Typography>
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

              {/* <Slider
                  aria-label="subjectCount"
                  value={subjectCount}
                  disableSwap
                  sx={{
                    color:
                      subjectCount <= 4
                        ? "green"
                        : subjectCount < 7
                        ? "#FFBF00"
                        : "#FF5733",
                  }}
                  id="subjectCount"
                  valueLabelDisplay="auto"
                  marks
                  step={1}
                  min={0}
                  max={20}
                /> */}
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
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                    color: "rgba(0,0,0,0.75)",
                  }}
                >
                  Word Count
                </Typography>
                <Typography>{wordCount}</Typography>
              </Box>

              <CustomCounterProgress
                countOf={wordCount}
                maxCountOf={maxWordCount}
                minRange={16}
                maxRange={150}
                barColor={
                  wordCount > 300 || wordCount < 16 ? "red" : wordCount > 150 ? "orange" : "green"
                }
              />
              {/* <Slider
                  aria-label="subjectCount"
                  value={wordCount}
                  disableSwap
                  sx={{
                    color:
                      wordCount < 150
                        ? "green"
                        : wordCount < 200
                        ? "#FFBF00"
                        : "#FF5733",
                  }}
                  id="wordCount"
                  valueLabelDisplay="auto"
                  marks={false}
                  step={1}
                  min={0}
                  max={250}
                /> */}
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
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                    color: "rgba(0,0,0,0.75)",
                  }}
                >
                  Reading time
                </Typography>
                <Typography>{readingTime}</Typography>
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
              {/* <Slider
                  aria-label="reding count"
                  value={readingTime}
                  disableSwap
                  sx={{
                    color:
                      readingTime < 3
                        ? "green"
                        : readingTime < 5
                        ? "#FFBF00"
                        : "#FF5733",
                  }}
                  id="wordCount"
                  valueLabelDisplay="auto"
                  marks
                  step={1}
                  min={0}
                  max={10}
                /> */}
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
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                    color: "rgba(0,0,0,0.75)",
                  }}
                >
                  URL Count
                </Typography>
                <Typography>{urlCount}</Typography>
              </Box>

              <CustomCounterProgress
                countOf={urlCount}
                maxCountOf={maxLinks}
                minRange={0}
                maxRange={1}
                barColor={urlCount > 2 || urlCount < 0 ? "red" : urlCount > 1 ? "orange" : "green"}
              />
              {/* <Slider
                  aria-label="urlCount"
                  value={urlCount}
                  disableSwap
                  sx={{
                    color:
                      questionCount < 10
                        ? "green"
                        : questionCount < 12
                        ? "#FFBF00"
                        : "#FF5733",
                  }}
                  id="questionCount"
                  valueLabelDisplay="auto"
                  marks
                  step={1}
                  min={0}
                  max={20}
                /> */}
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
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                    color: "rgba(0,0,0,0.75)",
                  }}
                >
                  Question Count
                </Typography>
                <Typography>{questionCount}</Typography>
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
              {/* <Slider
                  aria-label="questionCount"
                  value={questionCount}
                  disableSwap
                  sx={{
                    color:
                      questionCount < 4
                        ? "green"
                        : questionCount < 7
                        ? "#FFBF00"
                        : "#FF5733",
                  }}
                  id="questionCount"
                  valueLabelDisplay="auto"
                  marks
                  step={1}
                  min={0}
                  max={20}
                /> */}
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
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                    color: "rgba(0,0,0,0.75)",
                  }}
                >
                  Spam word count
                </Typography>
                <Typography>{spamCount}</Typography>
              </Box>

              <CustomCounterProgress
                countOf={spamCount}
                maxCountOf={maxSpams}
                minRange={0}
                maxRange={15}
                barColor={
                  spamCount > 10 || spamCount < 0 ? "red" : spamCount > 7 ? "orange" : "green"
                }
              />
              {/* <Slider
                  aria-label="spamCount"
                  value={spamCount}
                  disableSwap
                  sx={{
                    color:
                      spamCount < 4
                        ? "green"
                        : spamCount < 7
                        ? "#FFBF00"
                        : "#FF5733",
                  }}
                  id="spamCount"
                  valueLabelDisplay="auto"
                  marks
                  step={1}
                  min={0}
                  max={20}
                /> */}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmailCheckerComponent;
