import { alpha, styled, ToggleButtonGroup } from "@mui/material";
import { controlGlow } from "./floatingControl";
import {
  APP_CONTROL_BORDER_WIDTH,
  APP_CONTROL_SIZE,
  APP_CORNER_RADIUS,
} from "./appShape";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  scale: "revert-layer",

  "& .MuiToggleButtonGroup-grouped": {
    height: APP_CONTROL_SIZE,
    width: APP_CONTROL_SIZE,
    margin: 1,
    border: 1.75,
    opacity: 0.6,

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

export default StyledToggleButtonGroup;
