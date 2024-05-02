import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "./theme";
import "simplebar-react/dist/simplebar.min.css";
import { routes } from "./routes";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { config } from "./config";

export const App = () => {
  const theme = createTheme({
    colorPreset: "blue",
    contrast: "high",
  });
  useEffect(() => {
    window.intercomSettings = {
      app_id: config.INTERCOM_APP_ID,
    };
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {routes}
      <Toaster
        toastOptions={{
          duration: 2000,
          success: {
            style: {
              background: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
            iconTheme: {
              primary: theme.palette.primary.contrastText,
              secondary: theme.palette.primary.main,
            },
          },
          error: {
            style: {
              background: "red",
              color: theme.palette.primary.contrastText,
            },
            iconTheme: {
              primary: theme.palette.primary.contrastText,
              secondary: "red",
            },
          },
          loading: {
            style: {
              background: theme.palette.primary.contrastText,
              color: theme.palette.primary.main,
            },
            iconTheme: {
              primary: theme.palette.primary.main,
              secondary: theme.palette.primary.contrastText,
            },
          },
        }}
      />
    </ThemeProvider>
  );
};
