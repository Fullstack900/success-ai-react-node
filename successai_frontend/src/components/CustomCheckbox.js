import { FormControlLabel, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#3b82f680" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

const CustomCheckbox = ({ name, checked, onChange, disabled }) => {
  return (
    <>
      <FormControlLabel
        control={
          <IOSSwitch
            sx={{ m: 1 }}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled || false}
          />
        }
      />
      {/* old checkbox */}
      {/* <Box sx={{ display: "none", justifyContent: "center", alignItems: "center" }}>
        <Box
          sx={{
            width: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "41px",
            borderRadius: "5px",
            // border: "1px solid gray",
            border: "5px solid rgba(0, 0, 0, 0.10)",

            userSelect: "none",
          }}
        >
          <Box
            sx={{
              width: "100px",
              height: "100%",
              backgroundColor: enable ? "#8E8E8E" : "#373737",
              borderTopLeftRadius: "2px",
              borderBottomLeftRadius: "2px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "all 0.2s ease-out",
              borderRight: "5px solid #e6e6e6",
            }}
            onClick={handleDisableClick}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.2061 15.572L13.3261 9.69199L19.2061 3.81197C19.3188 3.69792 19.382 3.54406 19.382 3.38375C19.382 3.22343 19.3188 3.06958 19.2061 2.95553L16.4285 0.177841C16.3723 0.121472 16.3056 0.0767459 16.2321 0.0462278C16.1586 0.0157096 16.0798 0 16.0002 0C15.9207 0 15.8419 0.0157096 15.7684 0.0462278C15.6949 0.0767459 15.6282 0.121472 15.572 0.177841L9.69199 6.05786L3.81197 0.177841C3.69839 0.0642915 3.54436 0.000503229 3.38375 0.000503229C3.22314 0.000503229 3.06911 0.0642915 2.95553 0.177841L0.177841 2.95553C0.121472 3.01169 0.0767459 3.07842 0.0462278 3.15191C0.0157096 3.22539 0 3.30418 0 3.38375C0 3.46332 0.0157096 3.5421 0.0462278 3.61559C0.0767459 3.68907 0.121472 3.75581 0.177841 3.81197L6.05786 9.69199L0.177841 15.572C0.0642915 15.6856 0.000503229 15.8396 0.000503229 16.0002C0.000503229 16.1608 0.0642915 16.3149 0.177841 16.4285L2.95553 19.2061C3.01169 19.2625 3.07842 19.3072 3.15191 19.3378C3.22539 19.3683 3.30418 19.384 3.38375 19.384C3.46332 19.384 3.5421 19.3683 3.61559 19.3378C3.68907 19.3072 3.75581 19.2625 3.81197 19.2061L9.69199 13.3261L15.572 19.2061C15.6856 19.3197 15.8396 19.3835 16.0002 19.3835C16.1608 19.3835 16.3149 19.3197 16.4285 19.2061L19.2061 16.4285C19.2625 16.3723 19.3072 16.3056 19.3378 16.2321C19.3683 16.1586 19.384 16.0798 19.384 16.0002C19.384 15.9207 19.3683 15.8419 19.3378 15.7684C19.3072 15.6949 19.2625 15.6282 19.2061 15.572Z"
                fill={enable ? "#C3C3C3" : "white"}
              />
            </svg>
          </Box>{" "}
          <Box
            sx={{
              width: "95px",
              height: "100%",
              backgroundColor: enable ? "#216fed" : "#8E8E8E",
              borderTopRightRadius: "2px",
              borderBottomRightRadius: "2px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "all 0.2s ease-out",
            }}
            onClick={handleEnableClick}
          >
            <svg
              width="19"
              height="15"
              viewBox="0 0 25 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.2056 21L0 12.6081L3.73943 8.78378L8.2056 13.3649L21.2606 0L25 3.82432L8.2056 21Z"
                fill={enable ? "white" : "#C3C3C3"}
              />
            </svg>
          </Box>
        </Box>
      </Box> */}
    </>
  );
};

export default CustomCheckbox;
