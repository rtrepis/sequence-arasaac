import { styled, ToggleButtonGroup } from "@mui/material";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(() => ({
  display: "flex",
  flexWrap: "wrap",
  scale: "revert-layer",

  "& .MuiToggleButtonGroup-grouped": {
    height: 55,
    width: 55,
    margin: 1,
    border: 1.75,
    opacity: 0.6,

    "&.Mui-disabled": {
      border: 1.75,
    },
    "&:not(:first-of-type)": {
      borderRadius: 20,
    },
    "&:first-of-type": {
      borderRadius: 20,
    },
    "&:hover": {
      border: `1.75px solid`,
      borderColor: "green",
      borderRadius: 20,
      boxShadow: "0px 0px 10px 1px #A6A6A6",
      opacity: 1,
    },
  },
  "& .Mui-selected": {
    backgroundColor: "rgba(50,150,50,0.2)",
    opacity: 1,
    border: `1.75px solid green`,
    borderRadius: `20px`,
    boxShadow: "0px 0px 10px 1px #A6A6A6",
    "&:not(:first-of-type)": {
      borderLeft: `1.75px solid green`,
    },
  },
}));

export default StyledToggleButtonGroup;
