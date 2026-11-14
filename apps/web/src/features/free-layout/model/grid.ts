// La quadrícula de punts del mode lliure (fase 4): moure i canviar la mida
// d'un bloc salta de punt en punt («imant»). Són 20 columnes per 24 files de
// l'àrea útil del full: com a molt 24 × 24, i prou fines perquè els espais
// de totes les plantilles (cinquens de la setmana, terços del menú, rètols de
// 2/24) caiguin damunt d'un punt. La caixa d'un bloc es calcula com la d'un
// espai de plantilla (`slotToBox`): entre dos blocs veïns queda sempre
// l'espai de la plantilla.
import type { Box, SheetArea } from "./placement";
import { slotToBox } from "./templates";

/** Columnes i files de la quadrícula. */
export const GRID_COLUMNS = 20;
export const GRID_ROWS = 24;

/** La mida més petita d'un bloc, en cel·les. */
export const MIN_CELLS = 2;

/** Una caixa en cel·les de la quadrícula. */
export interface GridBox {
  column: number;
  row: number;
  columns: number;
  rows: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** L'amplada i l'alçada d'una cel·la, en mm. */
export const cellSize = (area: SheetArea): { w: number; h: number } => ({
  w: area.w / GRID_COLUMNS,
  h: area.h / GRID_ROWS,
});

/** La caixa (en mm) d'una caixa de la quadrícula. */
export const gridToBox = (grid: GridBox, area: SheetArea): Box =>
  slotToBox(
    {
      x: grid.column / GRID_COLUMNS,
      y: grid.row / GRID_ROWS,
      w: grid.columns / GRID_COLUMNS,
      h: grid.rows / GRID_ROWS,
    },
    { x: 0, y: 0, w: area.w, h: area.h },
  );

/**
 * La caixa de la quadrícula més propera a una caixa en mm: cada vora va al punt
 * més proper, sense sortir del full i amb la mida mínima.
 */
export const snapToGrid = (box: Box, area: SheetArea): GridBox => {
  const cell = cellSize(area);
  const left = clamp(Math.round(box.x / cell.w), 0, GRID_COLUMNS - MIN_CELLS);
  const top = clamp(Math.round(box.y / cell.h), 0, GRID_ROWS - MIN_CELLS);
  const right = clamp(
    Math.round((box.x + box.w) / cell.w),
    left + MIN_CELLS,
    GRID_COLUMNS,
  );
  const bottom = clamp(
    Math.round((box.y + box.h) / cell.h),
    top + MIN_CELLS,
    GRID_ROWS,
  );
  return { column: left, row: top, columns: right - left, rows: bottom - top };
};

/** Quines vores es mouen: totes (moure) o les d'una nansa (canviar la mida). */
export interface Edges {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
}

export const MOVE: Edges = { left: true, right: true, top: true, bottom: true };

/**
 * Una caixa de la quadrícula moguda `dx` × `dy` mm: sencera (moure) o només
 * les vores d'una nansa (canviar la mida). El resultat salta de punt en punt i
 * no surt del full. En moure, la mida no canvia.
 */
export const dragGridBox = (
  start: GridBox,
  edges: Edges,
  dx: number,
  dy: number,
  area: SheetArea,
): GridBox => {
  const cell = cellSize(area);
  const stepX = Math.round(dx / cell.w);
  const stepY = Math.round(dy / cell.h);
  const moving = edges.left && edges.right && edges.top && edges.bottom;
  if (moving)
    return {
      ...start,
      column: clamp(start.column + stepX, 0, GRID_COLUMNS - start.columns),
      row: clamp(start.row + stepY, 0, GRID_ROWS - start.rows),
    };
  let left = start.column;
  let right = start.column + start.columns;
  let top = start.row;
  let bottom = start.row + start.rows;
  if (edges.left) left = clamp(left + stepX, 0, right - MIN_CELLS);
  if (edges.right) right = clamp(right + stepX, left + MIN_CELLS, GRID_COLUMNS);
  if (edges.top) top = clamp(top + stepY, 0, bottom - MIN_CELLS);
  if (edges.bottom) bottom = clamp(bottom + stepY, top + MIN_CELLS, GRID_ROWS);
  return { column: left, row: top, columns: right - left, rows: bottom - top };
};

/**
 * Les cel·les que ocupa una caixa en mm, sense arrodonir cap a dins: una
 * caixa que no cau en punts (d'unes columnes o files que no són de la
 * quadrícula) ocupa totes les cel·les que toca.
 */
const occupiedCells = (box: Box, area: SheetArea): GridBox => {
  const cell = cellSize(area);
  // Una mica de marge: l'espai entre blocs no ha de comptar com a ocupat
  const slack = 0.25;
  const left = clamp(Math.floor(box.x / cell.w + slack), 0, GRID_COLUMNS);
  const top = clamp(Math.floor(box.y / cell.h + slack), 0, GRID_ROWS);
  const right = clamp(
    Math.ceil((box.x + box.w) / cell.w - slack),
    left,
    GRID_COLUMNS,
  );
  const bottom = clamp(
    Math.ceil((box.y + box.h) / cell.h - slack),
    top,
    GRID_ROWS,
  );
  return { column: left, row: top, columns: right - left, rows: bottom - top };
};

/**
 * L'espai buit més gran del full, en cel·les de la quadrícula: on va un bloc
 * nou en una pàgina lliure, sense tocar els que hi ha. Si n'hi ha més d'un
 * d'igual, el primer en ordre de lectura. `undefined` si no hi cap ni un bloc
 * de la mida mínima.
 */
export const largestEmptyBox = (
  occupied: readonly Box[],
  area: SheetArea,
): GridBox | undefined => {
  // Taula de sumes: quantes cel·les ocupades hi ha a cada rectangle
  const taken: number[][] = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLUMNS }, () => 0),
  );
  occupied.forEach((box) => {
    const cells = occupiedCells(box, area);
    for (let row = cells.row; row < cells.row + cells.rows; row += 1)
      for (
        let column = cells.column;
        column < cells.column + cells.columns;
        column += 1
      )
        taken[row][column] = 1;
  });
  const sum: number[][] = Array.from({ length: GRID_ROWS + 1 }, () =>
    Array.from({ length: GRID_COLUMNS + 1 }, () => 0),
  );
  for (let row = 0; row < GRID_ROWS; row += 1)
    for (let column = 0; column < GRID_COLUMNS; column += 1)
      sum[row + 1][column + 1] =
        taken[row][column] +
        sum[row][column + 1] +
        sum[row + 1][column] -
        sum[row][column];
  const isFree = (row: number, column: number, rows: number, columns: number) =>
    sum[row + rows][column + columns] -
      sum[row][column + columns] -
      sum[row + rows][column] +
      sum[row][column] ===
    0;

  let best: GridBox | undefined;
  let bestArea = 0;
  for (let row = 0; row <= GRID_ROWS - MIN_CELLS; row += 1)
    for (let column = 0; column <= GRID_COLUMNS - MIN_CELLS; column += 1) {
      if (!isFree(row, column, MIN_CELLS, MIN_CELLS)) continue;
      for (let rows = MIN_CELLS; row + rows <= GRID_ROWS; rows += 1) {
        if (!isFree(row, column, rows, MIN_CELLS)) break;
        for (
          let columns = MIN_CELLS;
          column + columns <= GRID_COLUMNS;
          columns += 1
        ) {
          if (!isFree(row, column, rows, columns)) break;
          if (rows * columns > bestArea) {
            bestArea = rows * columns;
            best = { column, row, columns, rows };
          }
        }
      }
    }
  return best;
};
