import { SxProps } from "@mui/material";
import { Border } from "../../types/sequence";

export const pictogram__card = (
  borderOut: Border,
  variant: any,
  fitzgerald: string | undefined
) => {
  const card: SxProps = {
    textAlign: "center",
    paddingInline: borderOut.size === 0 ? 0 : 1.5,
    border: `${borderOut === undefined ? 2 : borderOut.size}px solid`,
    borderColor:
      borderOut.color === "fitzgerald" && fitzgerald !== undefined
        ? fitzgerald
        : borderOut.color,
    borderRadius: `${borderOut === undefined ? 20 : borderOut.radius}px`,
    boxShadow: `${variant === undefined ? "" : "none"}`,
    "&:hover": {
      boxShadow: `${
        variant === undefined ? "0px 0px 10px 3px #A6A6A6" : "none"
      }`,
    },
  };

  return card;
};

export const pictogram__media = (
  borderIn: Border,
  view: any,
  fitzgerald: string | undefined
) => {
  const sx: SxProps = {
    marginTop: `${view === "complete" ? 0 : 2}`,
    padding: 0,
    border: `${borderIn === undefined ? 2 : borderIn.size}px solid`,
    borderColor:
      borderIn.color === "fitzgerald" && fitzgerald !== undefined
        ? fitzgerald
        : borderIn.color,
    borderRadius: `${borderIn === undefined ? 20 : borderIn.radius}px`,
  };

  return sx;
};
