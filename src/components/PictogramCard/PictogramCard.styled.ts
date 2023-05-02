import { SxProps } from "@mui/material";
import { Border, TextPosition } from "../../types/sequence";

export const pictogram__card = (
  borderOut: Border,
  variant: any,
  pictSize: number,
  printPageRatio: number
) => {
  const card: SxProps = {
    textAlign: "center",
    width: borderOut.size === 0 ? 150 : 180 + borderOut.size,
    paddingInline: borderOut.size === 0 ? 0 : 1.5 * printPageRatio * pictSize,
    border: `${borderOut.size * pictSize * printPageRatio}px solid`,
    borderColor: borderOut.color,
    borderRadius: `${borderOut.radius * pictSize * printPageRatio}px`,
    boxShadow: `${variant ? "none" : ""}`,
    "&:hover": {
      boxShadow: `${variant ? "none" : "0px 0px 10px 3px #A6A6A6"}`,
    },

    "@media print": {
      paddingInline: borderOut.size === 0 ? 0 : 1.5 * pictSize,
      border: `${borderOut.size * pictSize}px solid`,
      borderColor: borderOut.color,
      borderRadius: `${borderOut.radius * pictSize}px`,
    },
  };

  return card;
};

export const pictogram__media = (
  borderIn: Border,
  view: any,
  pictSize: number,
  printPageRatio: number
) => {
  const sx: SxProps = {
    marginTop: `${view === "complete" ? 0 : 2 * pictSize * printPageRatio}`,
    padding: 0,
    border: `${borderIn.size * pictSize * printPageRatio}px solid`,
    borderColor: borderIn.color,
    borderRadius: `${
      borderIn ? borderIn.radius * pictSize * printPageRatio : 20
    }px`,

    "@media print": {
      marginTop: `${view === "complete" ? 0 : 2 * pictSize}`,
      border: `${borderIn.size * pictSize}px solid`,
      borderColor: borderIn.color,
      borderRadius: `${borderIn ? borderIn.radius * pictSize : 20}px`,
      width: 150 * pictSize,
      height: 150 * pictSize,
    },
  };

  return sx;
};

export const textContent = (
  textPosition: TextPosition | undefined,
  numbered: boolean,
  borderSize: number,
  pictSize: number,
  printPageRatio: number
) => {
  const sx: SxProps = {
    width: 150 * pictSize * printPageRatio,
    paddingInline: 0,
    ":first-of-type": {
      paddingBlock:
        textPosition !== "top" && !numbered && borderSize === 0
          ? 0
          : 1 * pictSize * printPageRatio,
    },
    ":last-child": {
      paddingBlock:
        textPosition !== "bottom" && !numbered && borderSize === 0
          ? 0
          : 1 * pictSize * printPageRatio,
    },

    "@media print": {
      width: 150 * pictSize,
      paddingInline: 0,
      ":first-of-type": {
        paddingBlock:
          textPosition !== "top" && !numbered && borderSize === 0
            ? 0
            : 1 * pictSize,
      },
      ":last-child": {
        paddingBlock:
          textPosition !== "bottom" && !numbered && borderSize === 0
            ? 0
            : 1 * pictSize,
      },
    },
  };
  return sx;
};
