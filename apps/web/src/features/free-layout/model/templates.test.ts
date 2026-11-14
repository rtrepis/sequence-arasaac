import { describe, expect, it } from "vitest";
import type { SequencePlacement, TextPlacement } from "@/types/document";
import {
  SHAPED_TEMPLATES,
  TEMPLATE_CHOICES,
  closestTemplate,
  hasTextSlots,
  slotKind,
  templateFits,
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
  it("tantes files o columnes com caixes, en el sentit de la pàgina contínua", () => {
    expect(templateFor(1, "row").id).toBe("rows-1");
    expect(templateFor(1, "column").id).toBe("columns-1");
    expect(templateFor(3, "column").id).toBe("columns-3");
    expect(templateFor(4, "row").id).toBe("rows-4");
    expect(templateFor(7, "column").id).toBe("columns-7");
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

describe("les plantilles dels treballs reals (R3)", () => {
  const text = (id: string, x: number, y: number): TextPlacement => ({
    kind: "text" as const,
    id,
    text: id,
    x,
    y,
    w: 10,
    h: 10,
  });

  it("tots els espais són dins de la regió, i se'n troben per l'id", () => {
    SHAPED_TEMPLATES.forEach((template) => {
      template.slots.forEach(({ x, y, w, h }) => {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x + w).toBeLessThanOrEqual(1 + 1e-9);
        expect(y + h).toBeLessThanOrEqual(1 + 1e-9);
      });
      expect(templateById(template.id)).toBe(template);
    });
  });

  it("la setmana té cinc rètols i cinc espais de seqüència, i és apaïsada", () => {
    const week = templateById("week");
    expect(week?.landscape).toBe(true);
    expect(week && hasTextSlots(week)).toBe(true);
    expect(
      week?.slots.filter((slot) => slotKind(slot) === "text"),
    ).toHaveLength(5);
    expect(
      week?.slots.filter((slot) => slotKind(slot) === "sequence"),
    ).toHaveLength(5);
  });

  it("la graella 2 × 2 i la tira a dalt ja no s'ofereixen, però es continuen llegint", () => {
    const offered = SHAPED_TEMPLATES.map(({ id }) => id);
    expect(offered).not.toContain("grid-2x2");
    expect(offered).not.toContain("strip-top");
    expect(templateById("grid-2x2")?.slots).toHaveLength(4);
    expect(templateById("strip-top")?.slots).toHaveLength(2);
  });

  it("les seqüències només hi caben als espais de seqüència", () => {
    const firstThen = templateById("first-then");
    if (!firstThen) throw new Error("falta «Primer / Després»");
    expect(templateFits(firstThen, [placement("a", 0, 0)])).toBe(true);
    expect(
      templateFits(firstThen, [placement("a", 0, 0), placement("b", 0, 50)]),
    ).toBe(true);
    // Tres seqüències: hi ha quatre espais, però només dos de seqüència
    expect(
      templateFits(firstThen, [
        placement("a", 0, 0),
        placement("b", 0, 50),
        placement("c", 0, 100),
      ]),
    ).toBe(false);
  });

  it("cada bloc va al seu tipus d'espai, i els rètols que sobren, als de seqüència", () => {
    const firstThen = templateById("first-then");
    if (!firstThen) throw new Error("falta «Primer / Després»");
    // En ordre de lectura: un rètol, una seqüència, un altre rètol i un tercer
    const placed = applyTemplate(
      [
        text("t1", 0, 0),
        placement("s1", 0, 20),
        text("t2", 0, 40),
        text("t3", 0, 60),
      ],
      firstThen,
      REGION,
    );
    const slotOf = (id: string) =>
      placed.find((item) => item.id === id && "slot" in item)?.slot;
    expect(slotOf("s1")).toBe(2);
    expect(slotOf("t1")).toBe(0);
    expect(slotOf("t2")).toBe(1);
    // No hi ha més espais de rètol: va al de seqüència que queda
    expect(slotOf("t3")).toBe(3);
  });

  it("sense espais de rètol, els rètols ocupen espais com qualsevol bloc", () => {
    const placed = applyTemplate(
      [text("t1", 0, 0), placement("s1", 0, 50)],
      stackTemplate(2, "rows"),
      REGION,
    );
    expect(placed.map((item) => ("slot" in item ? item.slot : null))).toEqual([
      0, 1,
    ]);
  });

  it("els espais lliures, de tots els tipus o només d'un", () => {
    const menu = templateById("menu");
    if (!menu) throw new Error("falta «Menú»");
    expect(freeSlots(menu, [])).toEqual([0, 1, 2, 3, 4, 5]);
    expect(freeSlots(menu, [], "text")).toEqual([0, 2, 4]);
    expect(
      freeSlots(menu, [{ ...placement("a", 0, 0), slot: 1 }], "sequence"),
    ).toEqual([3, 5]);
  });
});

describe("la plantilla que s'hi ajusta més", () => {
  const fitting = (count: number) =>
    SHAPED_TEMPLATES.filter((template) =>
      templateFits(
        template,
        Array.from({ length: count }, (_, i) => placement(`s${i}`, 0, i * 20)),
      ),
    );

  it("una seqüència, l'agenda en tira; dues, «Primer / Després»; tres, la pàgina de conte", () => {
    expect(closestTemplate(fitting(1))?.id).toBe("agenda-strip");
    expect(closestTemplate(fitting(2))?.id).toBe("first-then");
    expect(closestTemplate(fitting(3))?.id).toBe("story-page");
    expect(closestTemplate(fitting(6))).toBeUndefined();
  });
});
