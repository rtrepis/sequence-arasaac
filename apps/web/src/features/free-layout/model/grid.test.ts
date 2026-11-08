import { describe, expect, it } from "vitest";
import {
  GRID_COLUMNS,
  GRID_ROWS,
  MIN_CELLS,
  MOVE,
  cellSize,
  dragGridBox,
  gridToBox,
  snapToGrid,
} from "./grid";
import { SHAPED_TEMPLATES, TEMPLATE_GAP_MM, slotToBox } from "./templates";

// La quadrícula de punts on s'enganxen els blocs que es mouen (fase 4).

const AREA = { w: 200, h: 240 };

describe("la quadrícula de punts", () => {
  it("com a molt 24 × 24 punts", () => {
    expect(GRID_COLUMNS).toBeLessThanOrEqual(24);
    expect(GRID_ROWS).toBeLessThanOrEqual(24);
  });

  it("els espais de totes les plantilles cauen damunt d'un punt", () => {
    SHAPED_TEMPLATES.forEach((template) =>
      template.slots.forEach((slot) => {
        [slot.x, slot.x + slot.w].forEach((edge) =>
          expect(edge * GRID_COLUMNS).toBeCloseTo(
            Math.round(edge * GRID_COLUMNS),
          ),
        );
        [slot.y, slot.y + slot.h].forEach((edge) =>
          expect(edge * GRID_ROWS).toBeCloseTo(Math.round(edge * GRID_ROWS)),
        );
      }),
    );
  });

  it("un espai de plantilla enganxat a la quadrícula torna a ser el mateix espai", () => {
    SHAPED_TEMPLATES.forEach((template) =>
      template.slots.forEach((slot) => {
        const box = slotToBox(slot, { x: 0, y: 0, ...AREA });
        const again = gridToBox(snapToGrid(box, AREA), AREA);
        expect(again.x).toBeCloseTo(box.x);
        expect(again.y).toBeCloseTo(box.y);
        expect(again.w).toBeCloseTo(box.w);
        expect(again.h).toBeCloseTo(box.h);
      }),
    );
  });

  it("entre dos blocs veïns queda l'espai de les plantilles", () => {
    const left = gridToBox({ column: 0, row: 0, columns: 4, rows: 4 }, AREA);
    const right = gridToBox({ column: 4, row: 0, columns: 4, rows: 4 }, AREA);
    expect(right.x - (left.x + left.w)).toBeCloseTo(TEMPLATE_GAP_MM);
  });
});

describe("moure i canviar la mida", () => {
  const start = { column: 2, row: 2, columns: 4, rows: 4 };
  const cell = cellSize(AREA);

  it("moure salta de punt en punt, sense canviar la mida", () => {
    expect(dragGridBox(start, MOVE, cell.w * 1.4, cell.h * 2.6, AREA)).toEqual({
      ...start,
      column: 3,
      row: 5,
    });
  });

  it("no surt del full", () => {
    expect(dragGridBox(start, MOVE, -cell.w * 10, cell.h * 100, AREA)).toEqual({
      ...start,
      column: 0,
      row: GRID_ROWS - start.rows,
    });
  });

  it("una nansa mou només les seves vores, i no fa el bloc més petit que el mínim", () => {
    const corner = { left: false, right: true, top: false, bottom: true };
    expect(dragGridBox(start, corner, cell.w * 3, cell.h, AREA)).toEqual({
      ...start,
      columns: 7,
      rows: 5,
    });
    expect(
      dragGridBox(start, corner, -cell.w * 10, -cell.h * 10, AREA),
    ).toEqual({ ...start, columns: MIN_CELLS, rows: MIN_CELLS });
  });
});
