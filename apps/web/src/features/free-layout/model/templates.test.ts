import { describe, expect, it } from "vitest";
import type { SequencePlacement } from "@/types/document";
import {
  TEMPLATE_CHOICES,
  TEMPLATE_GAP_MM,
  applyTemplate,
  freeRegion,
  gridTemplate,
  slotToBox,
  stackTemplate,
  templateFor,
  templatesFor,
} from "./templates";

// Les plantilles: espais en fraccions de la regió lliure, que es converteixen
// en caixes en mm (`templates.ts`).

const AREA = { w: 200, h: 275 };
const REGION = { x: 0, y: 0, ...AREA };

const placement = (
  id: string,
  x: number,
  y: number,
  sequenceKey = 0,
): SequencePlacement => ({
  id,
  sequenceKey,
  x,
  y,
  w: 10,
  h: 10,
  columns: "auto",
});

describe("de l'espai a la caixa", () => {
  it("entre dos espais veïns queda l'espai de la plantilla; a les vores, res", () => {
    const [top, bottom] = stackTemplate(2, "rows").slots.map((slot) =>
      slotToBox(slot, REGION),
    );
    expect(top).toEqual({ x: 0, y: 0, w: 200, h: 137.5 - TEMPLATE_GAP_MM / 2 });
    expect(bottom.y - (top.y + top.h)).toBeCloseTo(TEMPLATE_GAP_MM);
    expect(bottom.y + bottom.h).toBeCloseTo(AREA.h);
  });

  it("una graella de quatre és 2 × 2, i una de cinc, 3 × 2", () => {
    expect(gridTemplate(4).id).toBe("grid-2x2");
    expect(gridTemplate(4).slots).toHaveLength(4);
    expect(gridTemplate(5).id).toBe("grid-3x2");
    expect(gridTemplate(5).slots).toHaveLength(6);
  });
});

describe("quina plantilla", () => {
  it("fins a tres, apilades com el flux; a partir de quatre, una graella", () => {
    expect(templateFor(1, "row").id).toBe("full");
    expect(templateFor(2, "row").id).toBe("rows-2");
    expect(templateFor(3, "column").id).toBe("columns-3");
    expect(templateFor(4, "row").id).toBe("grid-2x2");
    expect(templateFor(7, "column").id).toBe("grid-3x3");
  });

  it("el selector només ofereix les plantilles on hi caben totes les caixes", () => {
    expect(templatesFor(1)).toEqual(TEMPLATE_CHOICES);
    expect(templatesFor(3).map(({ id }) => id)).toEqual(["rows-3", "grid-2x2"]);
    expect(templatesFor(5)).toEqual([]);
  });
});

describe("la regió que deixen lliure les comunes", () => {
  it("sense comunes, el full sencer", () => {
    expect(freeRegion(AREA, [])).toEqual(REGION);
  });

  it("una capçalera l'empeny avall, i un peu l'escurça", () => {
    const header = { x: 0, y: 0, w: 200, h: 30 };
    const footer = { x: 50, y: 245, w: 100, h: 30 };
    expect(freeRegion(AREA, [header, footer])).toEqual({
      x: 0,
      y: 30 + TEMPLATE_GAP_MM,
      w: 200,
      h: 245 - TEMPLATE_GAP_MM - (30 + TEMPLATE_GAP_MM),
    });
  });

  it("si les comunes s'ho mengen tot, el full sencer", () => {
    const big = { x: 0, y: 0, w: 200, h: 270 };
    expect(freeRegion(AREA, [big])).toEqual(REGION);
  });
});

describe("aplicar una plantilla", () => {
  it("reparteix en ordre de lectura, i la llista no canvia d'ordre", () => {
    // `b` és més amunt que `a`: va al primer espai
    const placements = [placement("a", 0, 100), placement("b", 0, 0)];
    const result = applyTemplate(placements, stackTemplate(2, "rows"), REGION);
    expect(result.map(({ id }) => id)).toEqual(["a", "b"]);
    expect(result[1].y).toBe(0);
    expect(result[0].y).toBeGreaterThan(result[1].y);
    expect(result[0]).toMatchObject({ w: 200, sequenceKey: 0 });
  });

  it("les que no hi caben es queden on eren", () => {
    const placements = [placement("a", 0, 0), placement("b", 0, 50)];
    const [, b] = applyTemplate(placements, stackTemplate(1, "rows"), REGION);
    expect(b).toEqual(placements[1]);
  });
});
