import React from "react";
import { sheetGuide } from "@/style/palette";
import type { SheetArea } from "@features/free-layout/model/placement";
import { GRID_COLUMNS, GRID_ROWS } from "@features/free-layout/model/grid";
import { editMarkSx, px } from "./PlacementBox";
import { Box } from "@mui/material";

/** El radi de cada punt, en px del full. */
const DOT_RADIUS = 2.5;

/**
 * La quadrícula de punts de l'àrea útil del full (fase 4): on s'enganxen els
 * blocs quan es mouen o se'n canvia la mida. És una guia de l'edició: no surt
 * mai al paper ni al PDF, ni es pot clicar.
 */
const GridDots = ({ area }: { area: SheetArea }): React.ReactElement => {
  const width = px(area.w);
  const height = px(area.h);
  const dots: React.ReactElement[] = [];
  for (let column = 0; column <= GRID_COLUMNS; column += 1)
    for (let row = 0; row <= GRID_ROWS; row += 1)
      dots.push(
        <circle
          key={`${column}-${row}`}
          cx={(column / GRID_COLUMNS) * width}
          cy={(row / GRID_ROWS) * height}
          r={DOT_RADIUS}
        />,
      );
  return (
    <Box
      component="svg"
      aria-hidden
      data-html2canvas-ignore
      data-testid="grid-dots"
      viewBox={`0 0 ${width} ${height}`}
      sx={{
        ...editMarkSx,
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
        fill: sheetGuide,
        fillOpacity: 0.6,
      }}
    >
      {dots}
    </Box>
  );
};

export default GridDots;
