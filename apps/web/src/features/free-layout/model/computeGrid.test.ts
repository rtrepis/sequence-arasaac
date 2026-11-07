import { describe, expect, it } from "vitest";
import {
  CARD_IMAGE_MM,
  GridInput,
  MIN_GRID_SIZE,
  computeGrid,
} from "./computeGrid";
import { MIN_PICTO_MM } from "./placement";

// La graella d'una caixa: en mode lliure mana la caixa, i la mida de les
// targetes és la més gran que hi cap (`computeGrid.ts`).

/** Una targeta de 50 × 60 mm a mida 1, sense espai: els números surten rodons. */
const base = (change: Partial<GridInput>): GridInput => ({
  count: 6,
  card: { w: 50, h: 60 },
  gap: 0,
  box: { w: 300, h: 120 },
  columns: "auto",
  minSize: 0,
  ...change,
});

describe("computeGrid", () => {
  it("tria les columnes que fan les targetes més grans", () => {
    // 3 × 2 omple la caixa a mida 1; 6 × 1, també; 2 × 3 no hi cap tan gran
    const grid = computeGrid(base({ box: { w: 150, h: 120 } }));
    expect(grid).toMatchObject({ columns: 3, rows: 2, size: 1 });
    expect(grid.w).toBeCloseTo(150);
    expect(grid.h).toBeCloseTo(120);
  });

  it("si dues graelles empaten, la de menys files", () => {
    // 6 × 1 (300 × 60) i 3 × 2 (150 × 120) hi caben totes dues a mida 1
    expect(computeGrid(base({}))).toMatchObject({ columns: 6, rows: 1 });
  });

  it("una caixa molt ampla fa una sola fila; una de molt alta, una columna", () => {
    expect(computeGrid(base({ box: { w: 3000, h: 60 } }))).toMatchObject({
      columns: 6,
      rows: 1,
    });
    expect(computeGrid(base({ box: { w: 50, h: 3000 } }))).toMatchObject({
      columns: 1,
      rows: 6,
    });
  });

  it("la mida creix i s'encongeix amb la caixa", () => {
    const small = computeGrid(base({ box: { w: 150, h: 60 } }));
    const big = computeGrid(base({ box: { w: 600, h: 240 } }));
    expect(small.size).toBeCloseTo(0.5);
    expect(big.size).toBeCloseTo(2);
  });

  it("l'espai entre targetes creix amb elles", () => {
    // 2 × 1 amb 10 mm d'espai: a mida 1 fa 110 × 60; a la caixa de 220 × 120, mida 2
    const grid = computeGrid(
      base({ count: 2, gap: 10, box: { w: 220, h: 120 } }),
    );
    expect(grid).toMatchObject({ columns: 2, rows: 1 });
    expect(grid.size).toBeCloseTo(2);
    expect(grid.w).toBeCloseTo(220);
  });

  it("amb columnes fixes, fa servir aquestes, i mai més que pictogrames", () => {
    expect(computeGrid(base({ columns: 2 }))).toMatchObject({
      columns: 2,
      rows: 3,
    });
    expect(computeGrid(base({ columns: 10 }))).toMatchObject({
      columns: 6,
      rows: 1,
    });
  });

  it("diu quan la caixa és massa petita per a la mida mínima", () => {
    const tiny = computeGrid(
      base({ box: { w: 30, h: 30 }, minSize: MIN_GRID_SIZE }),
    );
    expect(tiny.belowMinimum).toBe(true);
    const roomy = computeGrid(base({ minSize: MIN_GRID_SIZE }));
    expect(roomy.belowMinimum).toBe(false);
  });

  it("la mida mínima és la que dona una imatge de MIN_PICTO_MM", () => {
    expect(MIN_GRID_SIZE * CARD_IMAGE_MM).toBeCloseTo(MIN_PICTO_MM);
  });

  it("una seqüència buida no fa graella", () => {
    expect(computeGrid(base({ count: 0 }))).toMatchObject({
      columns: 0,
      rows: 0,
      size: 0,
      belowMinimum: false,
    });
  });

  it.each(Array.from({ length: 12 }, (_, i) => i + 1))(
    "amb %i pictogrames, la graella hi cap i no deixa files buides",
    (count) => {
      const box = { w: 190, h: 120 };
      const grid = computeGrid(base({ count, gap: 2, box }));
      expect(grid.columns * grid.rows).toBeGreaterThanOrEqual(count);
      // Si traiem una fila, ja no hi caben tots
      expect(grid.columns * (grid.rows - 1)).toBeLessThan(count);
      expect(grid.w).toBeLessThanOrEqual(box.w + 1e-9);
      expect(grid.h).toBeLessThanOrEqual(box.h + 1e-9);
      // I omple la caixa d'un costat o de l'altre
      expect(Math.max(grid.w / box.w, grid.h / box.h)).toBeCloseTo(1);
    },
  );
});

describe("la mida com a màxim (Q2)", () => {
  it("no passa de la mida del bloc encara que la caixa en deixi més", () => {
    const grid = computeGrid(base({ box: { w: 3000, h: 600 }, maxSize: 0.5 }));
    expect(grid.size).toBeCloseTo(0.5);
    expect(grid.w).toBeCloseTo(grid.columns * 50 * 0.5);
  });

  it("si la caixa no hi arriba, mana la caixa", () => {
    const grid = computeGrid(base({ box: { w: 150, h: 120 }, maxSize: 2 }));
    expect(grid.size).toBeCloseTo(1);
  });

  it("amb el màxim, entre graelles igual de grans tria la de menys files", () => {
    // Totes les graelles hi caben a 0,2: guanya una sola fila
    expect(
      computeGrid(base({ box: { w: 3000, h: 3000 }, maxSize: 0.2 })),
    ).toMatchObject({ columns: 6, rows: 1 });
  });

  it("un màxim petit no és «massa petit»: l'avís és de la caixa", () => {
    const grid = computeGrid(
      base({ box: { w: 3000, h: 600 }, maxSize: 0.01, minSize: 0.1 }),
    );
    expect(grid.belowMinimum).toBe(false);
  });
});
