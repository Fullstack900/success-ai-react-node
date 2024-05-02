import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FaLongArrowAltLeft } from "react-icons/fa";

import { Logo } from "src/components/logo";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  paper: {
    padding: theme.spacing(0.5),
    borderRadius: theme.spacing(1),
    backgroundImage: "linear-gradient(to right, #A756F5, #22C45F, #3A82F4)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
    maxWidth: "512px",
    marginRight: "auto",
    marginLeft: "auto",
  },
  innerPaper: {
    padding: "16px",
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "50px",
    objectFit: "contain",
    marginBottom: theme.spacing(2),
  },
  checkIcon: {
    marginTop: "10px",
    fontSize: "6rem",
    color: "#22C55E",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    background: `linear-gradient(to right, #417FF6, #A557F7)`,
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  content: {
    textAlign: "center",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  button: {
    margin: theme.spacing(0),
    backgroundColor: "#5762FD",
    color: "#fff",
    borderRadius: "999px",
    "&:hover": {
      backgroundColor: "#5762FD",
    },
  },
  buttonIcon: {
    fontSize: "1.5rem",
  },
}));

function ThankYou() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Container>
        <Paper elevation={0} className={classes.paper}>
          <Paper elevation={0} className={classes.innerPaper}>
            <Logo logoTextColor="#3E50F8" />
            <AiOutlineCheckCircle className={classes.checkIcon} />
            <Typography variant="h1" className={classes.title}>
              Thank You !
            </Typography>
            <Typography variant="body1" className={classes.content}>
              Thank you for your interest! Check your email for a link to the guide.
            </Typography>
            <Button
              to="/login"
              component={RouterLink}
              variant="contained"
              className={classes.button}
              startIcon={<FaLongArrowAltLeft className={classes.buttonIcon} />}
            >
              Login
            </Button>
          </Paper>
        </Paper>
      </Container>
    </div>
  );
}

export default ThankYou;
