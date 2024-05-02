import React, { useState } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Tabs,
  Tab,
  Button,
  useTheme,
  Drawer,
  IconButton,
} from "@mui/material";
import { ExpandMoreOutlined, AutoAwesomeMosaic } from "@mui/icons-material";

const TemplateOption = ({ category, setSelectedTemplate, selectedTemplate }) => {
  const theme = useTheme();
  const [expandedSub, setExpandedSub] = useState(null);

  const handleChangeSub = (panel) => {
    if (panel === expandedSub) {
      setExpandedSub(null);
    } else {
      setExpandedSub(panel);
    }
  };
  const handleSelectTemplate = (selected) => {
    setSelectedTemplate(selected);
  };

  return (
    <Accordion
      expanded={expandedSub === category?.id}
      onChange={() => handleChangeSub(category?.id)}
    >
      <AccordionSummary
        aria-controls="panel1d-content"
        id="panel1d-header"
        expandIcon={<ExpandMoreOutlined />}
      >
        <Typography sx={{ color: "#28287B", fontSize: "14px", fontWeight: "600" }}>
          {category?.categoryTitle}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {category?.templates?.map((template, index) => (
          <Button
            fullWidth
            key={index}
            onClick={() => handleSelectTemplate(template)}
            sx={{
              fontSize: "13px",
              fontWeight: "500",
              justifyContent: "flex-start",
              color:
                selectedTemplate?.id === template?.id && selectedTemplate?.type === template?.type
                  ? theme.palette.primary.main
                  : "#28287B",
              backgroundColor:
                selectedTemplate?.id === template?.id && selectedTemplate?.type === template?.type
                  ? theme.palette.grey[200]
                  : "transparent",
              textAlign: "left",
            }}
          >
            {template?.subject}
          </Button>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

const TemplateSection = ({ setSelectedTemplateObject, selectedTemplateObject, isMobile, templates }) => {
  const [expanded, setExpanded] = React.useState(null);
  const [open, setOpen] = useState(false);
  const handleChangeId = (id) => {
    if (id === expanded) {
      setExpanded(null);
    } else {
      setExpanded(id);
    }
  };
  const handleOpenDrawer = () => {
    setOpen(true);
  };
  const handleCloseDrawer = () => {
    setOpen(false);
  };
  const category =
  templates
      .find((template) => template?.title === selectedTemplateObject?.type)
      ?.category?.find((item) => {
        if (item?.templates?.find((template) => template?.id === selectedTemplateObject?.id)) {
          return true;
        }
        return false;
      })?.categoryTitle || "";

  return (
    <>
      <Box
        sx={{
          display: isMobile ? "flex" : "none",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
        }}
      >
        <Typography sx={{ color: "#28287B", fontSize: "16px", fontWeight: "700" }}>
          {selectedTemplateObject?.type}{" "}
          <Typography sx={{ display: "inline", fontWeight: "500", fontSize: "14px" }}>
            &gt; {category}
          </Typography>
        </Typography>
        <IconButton sx={{ color: "#28287B", pr: 0 }} onClick={handleOpenDrawer}>
          <AutoAwesomeMosaic />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: isMobile ? "none" : "block",
          "& .MuiAccordion-root.Mui-expanded": { margin: 0 },
          "& .MuiAccordion-root:last-of-type": {
            borderBottomLeftRadius: "12px",
            borderBottomRightRadius: "12px",
            margin: 0,
          },
          "& .MuiAccordion-root:first-of-type": {
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            margin: 0,
          },
          "& .MuiSvgIcon-root": { color: "#28287B" },
          "& .MuiAccordionDetails-root": { pt: 0 },
        }}
      >
        {templates.map((template) => (
          <Accordion
            expanded={expanded === template?.id}
            onChange={() => handleChangeId(template?.id)}
            key={template?.id}
          >
            <AccordionSummary
              aria-controls="panel1d-content"
              id="panel1d-header"
              expandIcon={<ExpandMoreOutlined />}
            >
              <Typography sx={{ color: "#28287B", fontSize: "14px", fontWeight: "700" }}>
                {template?.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {template?.category?.map((category) => (
                <TemplateOption
                  category={category}
                  setSelectedTemplate={setSelectedTemplateObject}
                  selectedTemplate={selectedTemplateObject}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Drawer
        variant="temporary"
        sx={{
          maxHeight: "80vh",
          width: "100%",
          flexShrink: 0,
          zIndex: 1300,
          "& .MuiDrawer-paper": {
            width: "100%",
            boxSizing: "border-box",
            maxHeight: "80%",
          },
          "& .MuiAccordion-root.Mui-expanded": { margin: 0 },
          "& .MuiAccordion-root:last-of-type": {
            borderBottomLeftRadius: "12px",
            borderBottomRightRadius: "12px",
            margin: 0,
          },
          "& .MuiAccordion-root:first-of-type": {
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            margin: 0,
          },
          "& .MuiSvgIcon-root": { color: "#28287B" },
          "& .MuiAccordionDetails-root": { pt: 0 },
        }}
        anchor="bottom"
        open={isMobile && open}
        onClose={handleCloseDrawer}
      >
        {templates.map((template) => (
          <Accordion
            expanded={expanded === template?.id}
            onChange={() => handleChangeId(template?.id)}
            key={template?.id}
          >
            <AccordionSummary
              aria-controls="panel1d-content"
              id="panel1d-header"
              expandIcon={<ExpandMoreOutlined />}
            >
              <Typography sx={{ color: "#28287B", fontSize: "14px", fontWeight: "700" }}>
                {template?.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {template?.category?.map((category) => (
                <TemplateOption
                  category={category}
                  setSelectedTemplate={setSelectedTemplateObject}
                  selectedTemplate={selectedTemplateObject}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Drawer>
    </>
  );
};

export default TemplateSection;
