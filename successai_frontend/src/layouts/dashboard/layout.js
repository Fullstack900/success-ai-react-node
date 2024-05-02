import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import { Footer } from "./footer";
import { SideNav } from "./side-nav";
import { TopNav } from "./top-nav";
import TopBar from "./top-bar";
import { useState } from "react";
import { IconButton, Box, useTheme, useMediaQuery } from "@mui/material";
import { ChevronLeftOutlined, ChevronRightOutlined } from "@mui/icons-material";

const SIDE_NAV_WIDTH = 264;
const TOP_NAV_HEIGHT = 64;

const LayoutRoot = styled("div")(({ theme }) => ({
  backgroundColor: "rgba(0,0,0,0.01)",
  // backgroundColor: theme.palette.background.default,
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  // paddingTop: TOP_NAV_HEIGHT,
  [theme.breakpoints.up("lg")]: {
    paddingLeft: SIDE_NAV_WIDTH,
  },
  [theme.breakpoints.down("lg")]: {
    marginTop: TOP_NAV_HEIGHT,
  },
}));

const LayoutContainer = styled("div")({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  width: "100%",
  paddingTop: 32,
  paddingBottom: 32,
});

export const Layout = (props) => {
  const { children } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(true);
  const handleDrawerToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  return (
    <>
      {/* <TopNav /> */}
      <TopBar handleDrawerToggle={handleDrawerToggle} />

      {!isMobile && (
        <IconButton
          onClick={() => setNavMenuOpen(!navMenuOpen)}
          sx={{
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
            position: "fixed",
            left: navMenuOpen ? SIDE_NAV_WIDTH - 18 : `calc(${theme.spacing(8)} - 15px)`,
            top: 45,
            border: `2px solid ${theme.palette.primary.contrastText} `,
            borderRadius: "50%",
            padding: "2px",
            zIndex: 1001,
            transition: "left 0.25s ease",
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          {navMenuOpen ? (
            <ChevronLeftOutlined sx={{ fontSize: "28px" }} />
          ) : (
            <ChevronRightOutlined sx={{ fontSize: "28px" }} />
          )}
        </IconButton>
      )}

      <SideNav
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navMenuOpen={navMenuOpen}
      />
      <LayoutRoot
        style={{
          paddingLeft: isMobile
            ? 0
            : navMenuOpen
            ? SIDE_NAV_WIDTH
            : `calc(${theme.spacing(8)} + 1px)`,
        }}
      >
        <LayoutContainer>
          {children}
          {/* <Footer /> */}
        </LayoutContainer>
      </LayoutRoot>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};
