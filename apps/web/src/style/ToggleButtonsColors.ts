import { alpha, styled, ToggleButtonGroup } from "@mui/material";
import { APP_CONTROL_BORDER_WIDTH, APP_CORNER_RADIUS } from "./appShape";
import { controlGlow } from "./floatingControl";

const ToggleButtonColor = styled(ToggleButtonGroup)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  scale: "revert-layer",
  background: theme.palette.background.paper,
  width: "150px",
  margin: 1.5,

  "& .MuiToggleButtonGroup-grouped": {
    height: 35,
    width: 35,
    margin: 1,
    padding: 0.25,
    border: 1.75,

    "&.Mui-disabled": {
      border: 1.75,
    },
    "&:not(:first-of-type)": {
      borderRadius: APP_CORNER_RADIUS,
    },
    "&:first-of-type": {
      borderRadius: APP_CORNER_RADIUS,
    },
    "&:hover": {
      border: `${APP_CONTROL_BORDER_WIDTH}px solid`,
      borderColor: theme.palette.primary.main,
      borderRadius: APP_CORNER_RADIUS,
      boxShadow: controlGlow(theme),
      opacity: 1,
    },
  },
  "& .Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    opacity: 1,
    border: `${APP_CONTROL_BORDER_WIDTH}px solid ${theme.palette.primary.main}`,
    borderRadius: `${APP_CORNER_RADIUS}px`,
    boxShadow: controlGlow(theme),
    "&:not(:first-of-type)": {
      borderLeft: `${APP_CONTROL_BORDER_WIDTH}px solid ${theme.palette.primary.main}`,
    },
  },
}));

export default ToggleButtonColor;
