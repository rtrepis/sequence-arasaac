import { describe, expect, it } from "vitest";
import type { SequencePlacement } from "@/types/document";
import {
  TEMPLATE_CHOICES,
  TEMPLATE_GAP_MM,
  applyTemplate,
  freeRegion,
  freeSlots,
  arrangementOf,
  arrangementTemplate,
  templateById,
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
  kind: "sequence",
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

describe("la plantilla de la pàgina (R2)", () => {
  it("aplicar-la diu a cada bloc quin espai ocupa", () => {
    const result = applyTemplate(
      [placement("b", 0, 100), placement("a", 0, 0)],
      stackTemplate(2, "rows"),
      REGION,
    );
    // En ordre de lectura: «a» és a dalt
    expect(result.map(({ id, slot }) => [id, slot])).toEqual([
      ["b", 1],
      ["a", 0],
    ]);
  });

  it("es troba pel seu id, també les que fa `templateFor`", () => {
    TEMPLATE_CHOICES.forEach((template) =>
      expect(templateById(template.id)).toEqual(template),
    );
    expect(templateById("rows-5")).toEqual(stackTemplate(5, "rows"));
    expect(templateById("columns-4")).toEqual(stackTemplate(4, "columns"));
    expect(templateById(gridTemplate(6).id)).toEqual(gridTemplate(6));
  });

  it("una plantilla que l'app no coneix no es troba", () => {
    expect(templateById("primer-despres")).toBeUndefined();
    expect(templateById("rows-0")).toBeUndefined();
  });

  it("qualsevol graella es troba pel seu id, encara que `gridTemplate` no la faci", () => {
    expect(templateById("grid-1x5")?.slots).toHaveLength(5);
  });

  it("«X columnes» i «Y files» creixen amb els blocs i es recorden pel mateix id", () => {
    // Dues columnes amb cinc blocs: tres files
    const columns = arrangementTemplate("columns", 2, 5);
    expect(columns.id).toBe("columns-2");
    expect(columns.slots).toHaveLength(6);
    expect(columns.slots[1]).toMatchObject({ x: 0.5, y: 0 });
    // Dues files amb tres blocs: dues columnes
    const rows = arrangementTemplate("rows", 2, 3);
    expect(rows.id).toBe("rows-2");
    expect(rows.slots).toHaveLength(4);
    // Si hi caben, és la pila de sempre
    expect(arrangementTemplate("rows", 3, 2)).toEqual(stackTemplate(3, "rows"));
    expect(templateById("columns-2", 5)).toEqual(columns);
  });

  it("el repartiment es llegeix de l'id de la plantilla", () => {
    expect(arrangementOf("columns-3")).toEqual({ kind: "columns", n: 3 });
    expect(arrangementOf("rows-2")).toEqual({ kind: "rows", n: 2 });
    expect(arrangementOf("full")).toEqual({ kind: "columns", n: 1 });
    expect(arrangementOf("strip-top")).toEqual({
      kind: "template",
      id: "strip-top",
    });
  });

  it("els espais lliures són els que cap bloc no ocupa", () => {
    const template = stackTemplate(3, "rows");
    expect(freeSlots(template, [])).toEqual([0, 1, 2]);
    expect(
      freeSlots(template, [
        { ...placement("a", 0, 0), slot: 1 },
        // Sense espai (retocat a mà o d'abans de R2): no n'ocupa cap
        placement("b", 0, 0),
        { kind: "unknown", id: "c", raw: { slot: 0 } },
      ]),
    ).toEqual([0, 2]);
  });
});
