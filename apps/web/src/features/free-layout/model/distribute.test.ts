import { describe, expect, it } from "vitest";
import type { FreeLayout, SequencePlacement } from "@/types/document";
import {
  INITIAL_SEQUENCES_PER_SHEET,
  addSequencesToSheet,
  applyTemplateToSheet,
  buildInitialLayout,
} from "./distribute";
import { isPlaced, unplacedSequenceKeys, whereIs } from "./placementsOf";
import type { NewLayoutId } from "./sheets";
import { TEMPLATE_GAP_MM, stackTemplate } from "./templates";

// Repartir caixes en un full (`distribute.ts`) i saber on surt cada seqüència
// (`placementsOf.ts`).

const AREA = { w: 200, h: 275 };

const ids = (): NewLayoutId => {
  let count = 0;
  return (prefix) => `${prefix}_n${(count += 1)}`;
};

const context = (direction: "row" | "column" = "row") => ({
  area: AREA,
  direction,
  newId: ids(),
});

const placement = (
  id: string,
  sequenceKey: number,
  box: Partial<SequencePlacement> = {},
): SequencePlacement => ({
  id,
  sequenceKey,
  x: 0,
  y: 0,
  w: 50,
  h: 50,
  columns: "auto",
  ...box,
});

/** Totes les caixes dins de l'àrea útil. */
const insideArea = (layout: FreeLayout) =>
  [...layout.common, ...layout.sheets.flatMap((s) => s.placements)].every(
    ({ x, y, w, h }) =>
      x >= 0 &&
      y >= 0 &&
      w > 0 &&
      h > 0 &&
      x + w <= AREA.w + 1e-9 &&
      y + h <= AREA.h + 1e-9,
  );

describe("la disposició de partida", () => {
  it("totes les seqüències, de tres en tres per full, apilades en files", () => {
    const layout = buildInitialLayout([0, 1, 2, 3, 4], context("row"));
    expect(INITIAL_SEQUENCES_PER_SHEET).toBe(3);
    expect(
      layout.sheets.map((s) => s.placements.map((p) => p.sequenceKey)),
    ).toEqual([
      [0, 1, 2],
      [3, 4],
    ]);
    // En files: tota l'amplada, una sota l'altra
    const [first, second] = layout.sheets[0].placements;
    expect(first).toMatchObject({ x: 0, y: 0, w: AREA.w });
    expect(second.y).toBeCloseTo(first.h + TEMPLATE_GAP_MM);
    expect(insideArea(layout)).toBe(true);
    expect(layout.common).toEqual([]);
  });

  it("en columnes, si la pàgina va en columnes", () => {
    const layout = buildInitialLayout([0, 1], context("column"));
    const [first, second] = layout.sheets[0].placements;
    expect(first).toMatchObject({ x: 0, y: 0, h: AREA.h });
    expect(second.x).toBeCloseTo(first.w + TEMPLATE_GAP_MM);
  });

  it("sense seqüències, un full buit", () => {
    expect(buildInitialLayout([], context())).toEqual({
      sheets: [{ id: "sh_n1", placements: [] }],
      common: [],
    });
  });

  it("no queda cap seqüència sense col·locar", () => {
    const keys = [0, 1, 2, 3, 4, 5, 6];
    const layout = buildInitialLayout(keys, context());
    expect(unplacedSequenceKeys(layout, keys)).toEqual([]);
  });
});

describe("afegir seqüències a un full", () => {
  const withHeader: FreeLayout = {
    sheets: [
      { id: "sh_1", placements: [placement("a", 1, { y: 100 })] },
      { id: "sh_2", placements: [placement("b", 2)] },
    ],
    common: [placement("cap", 0, { y: 0, w: 200, h: 30 })],
  };

  it("les que ja hi eren primer, les noves al final, i el full es torna a repartir", () => {
    const result = addSequencesToSheet(withHeader, 0, [2, 3], context());
    const [a, two, three] = result.sheets[0].placements;
    expect([a.sequenceKey, two.sequenceKey, three.sequenceKey]).toEqual([
      1, 2, 3,
    ]);
    // Sota la capçalera, en tres files
    expect(a.y).toBeCloseTo(30 + TEMPLATE_GAP_MM);
    expect(two.y).toBeGreaterThan(a.y);
    expect(three.y).toBeGreaterThan(two.y);
    expect(insideArea(result)).toBe(true);
  });

  it("afegir-la no la treu d'on era: la mateixa seqüència surt a dos fulls", () => {
    const result = addSequencesToSheet(withHeader, 0, [2], context());
    expect(whereIs(result, 2)).toEqual({ common: false, sheets: [0, 1] });
    // I els altres fulls i les comunes no es toquen
    expect(result.sheets[1]).toBe(withHeader.sheets[1]);
    expect(result.common).toBe(withHeader.common);
  });

  it("aplicar una plantilla només toca aquell full", () => {
    const result = applyTemplateToSheet(
      withHeader,
      0,
      stackTemplate(1, "rows"),
      AREA,
    );
    expect(result.sheets[0].placements[0]).toMatchObject({
      x: 0,
      y: 30 + TEMPLATE_GAP_MM,
      w: AREA.w,
    });
    expect(result.sheets[1]).toBe(withHeader.sheets[1]);
  });
});

describe("on surt cada seqüència", () => {
  const layout: FreeLayout = {
    sheets: [
      { id: "sh_1", placements: [placement("a", 1), placement("b", 1)] },
      { id: "sh_2", placements: [placement("c", 1)] },
    ],
    common: [placement("cap", 0)],
  };

  it("diu els fulls sense repetir, i si és comuna", () => {
    expect(whereIs(layout, 1)).toEqual({ common: false, sheets: [0, 1] });
    expect(whereIs(layout, 0)).toEqual({ common: true, sheets: [] });
  });

  it("les que no surten enlloc són al calaix, en l'ordre del document", () => {
    expect(isPlaced(layout, 0)).toBe(true);
    expect(unplacedSequenceKeys(layout, [3, 0, 1, 2])).toEqual([3, 2]);
  });
});
