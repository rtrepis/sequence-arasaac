import { SxProps } from "@mui/material";
import { Border, TextPosition } from "../../types/sequence";

export const pictogram__card = (borderOut: Border, variant: any) => {
  const card: SxProps = {
    textAlign: "center",
    paddingInline: borderOut.size === 0 ? 0 : 1.5,
    border: `${borderOut.size}px solid`,
    borderColor: borderOut.color,
    borderRadius: `${borderOut.radius}px`,
    boxShadow: `${variant ? "none" : ""}`,
    "&:hover": {
      boxShadow: `${variant ? "none" : "0px 0px 10px 3px #A6A6A6"}`,
    },
  };

  return card;
};

export const pictogram__media = (borderIn: Border, view: any) => {
  const sx: SxProps = {
    marginTop: `${view === "complete" ? 0 : 2}`,
    padding: 0,
    border: `${borderIn.size}px solid`,
    borderColor: borderIn.color,
    borderRadius: `${borderIn ? borderIn.radius : 20}px`,
  };

  return sx;
};

export const textContent = (
  size: number | undefined,
  textPosition: TextPosition | undefined,
  numbered: boolean,
  borderSize: number
) => {
  const sx: SxProps = {
    width: size ? size * 150 : 150,
    paddingInline: 0,
    ":first-of-type": {
      paddingBlock:
        textPosition !== "top" && !numbered && borderSize === 0 ? 0 : 1,
    },
    ":last-child": {
      paddingBlock:
        textPosition !== "bottom" && !numbered && borderSize === 0 ? 0 : 1,
    },
  };
  return sx;
};
