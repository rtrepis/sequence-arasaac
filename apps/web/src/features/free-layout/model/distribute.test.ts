import { describe, expect, it } from "vitest";
import type {
  DocumentPages,
  DocumentSheet,
  PagePlacement,
  SequencePlacement,
  TextPlacement,
} from "@/types/document";
import {
  INITIAL_SEQUENCES_PER_SHEET,
  addSequencesToSheet,
  applyTemplateToSheet,
  buildInitialPages,
  sheetToTemplate,
} from "./distribute";
import { isPlaced, unplacedSequenceKeys, whereIs } from "./placementsOf";
import type { NewLayoutId } from "./sheets";
import { TEMPLATE_GAP_MM, gridTemplate, stackTemplate } from "./templates";

// Repartir els blocs d'una pàgina (`distribute.ts`) i saber on surt cada
// seqüència (`placementsOf.ts`).

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
  kind: "sequence",
  id,
  sequenceKey,
  x: 0,
  y: 0,
  w: 50,
  h: 50,
  columns: "auto",
  ...box,
});

const text = (id: string, box: Partial<TextPlacement> = {}): TextPlacement => ({
  kind: "text",
  id,
  text: "Primer",
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  ...box,
});

/** La clau de la seqüència d'un bloc, o -1 si no n'és cap. */
const keyOf = (p: PagePlacement) =>
  p.kind === "sequence" ? p.sequenceKey : -1;
/** Un bloc que l'app entén (els de les proves ho són tots). */
const boxed = (p: PagePlacement) => {
  if (p.kind === "unknown") throw new Error();
  return p;
};

/** Totes les caixes dins de l'àrea útil. */
const insideArea = (pages: DocumentPages) =>
  [...pages.common, ...pages.sheets.flatMap((s) => s.placements)]
    .map(boxed)
    .every(
      ({ x, y, w, h }) =>
        x >= 0 &&
        y >= 0 &&
        w > 0 &&
        h > 0 &&
        x + w <= AREA.w + 1e-9 &&
        y + h <= AREA.h + 1e-9,
    );

const sheet = (
  id: string,
  placements: PagePlacement[],
  rest: Partial<DocumentSheet> = {},
): DocumentSheet => ({ id, mode: "template", placements, ...rest });

describe("la disposició de partida", () => {
  it("totes les seqüències, de tres en tres per pàgina, apilades en files", () => {
    const pages = buildInitialPages([0, 1, 2, 3, 4], context("row"));
    expect(INITIAL_SEQUENCES_PER_SHEET).toBe(3);
    expect(pages.sheets.map((s) => s.placements.map(keyOf))).toEqual([
      [0, 1, 2],
      [3, 4],
    ]);
    // Cada pàgina té caixes i recorda la seva plantilla
    expect(pages.sheets.map(({ mode, template }) => [mode, template])).toEqual([
      ["template", "rows-3"],
      ["template", "rows-2"],
    ]);
    // En files: tota l'amplada, una sota l'altra
    const [first, second] = pages.sheets[0].placements.map(boxed);
    expect(first).toMatchObject({ x: 0, y: 0, w: AREA.w, slot: 0 });
    expect(second.y).toBeCloseTo(first.h + TEMPLATE_GAP_MM);
    expect(insideArea(pages)).toBe(true);
    expect(pages.common).toEqual([]);
  });

  it("en columnes, si la pàgina va en columnes", () => {
    const pages = buildInitialPages([0, 1], context("column"));
    const [first, second] = pages.sheets[0].placements.map(boxed);
    expect(first).toMatchObject({ x: 0, y: 0, h: AREA.h });
    expect(second.x).toBeCloseTo(first.w + TEMPLATE_GAP_MM);
  });

  it("sense seqüències, una pàgina buida", () => {
    expect(buildInitialPages([], context())).toEqual({
      sheets: [{ id: "sh_n1", mode: "template", placements: [] }],
      common: [],
    });
  });

  it("no queda cap seqüència sense col·locar", () => {
    const keys = [0, 1, 2, 3, 4, 5, 6];
    const pages = buildInitialPages(keys, context());
    expect(unplacedSequenceKeys(pages, keys)).toEqual([]);
  });
});

describe("afegir seqüències a una pàgina", () => {
  const withHeader: DocumentPages = {
    sheets: [
      sheet("sh_1", [placement("a", 1, { y: 100 })]),
      sheet("sh_2", [placement("b", 2)]),
    ],
    common: [placement("cap", 0, { y: 0, w: 200, h: 30 })],
  };

  it("sense plantilla, les que ja hi eren primer, les noves al final, i es torna a repartir", () => {
    const result = addSequencesToSheet(withHeader, 0, [2, 3], context());
    const [a, two, three] = result.sheets[0].placements.map(boxed);
    expect(result.sheets[0].placements.map(keyOf)).toEqual([1, 2, 3]);
    // Sota la capçalera, en tres files, i la pàgina es queda la plantilla
    expect(result.sheets[0].template).toBe("rows-3");
    expect(a.y).toBeCloseTo(30 + TEMPLATE_GAP_MM);
    expect(two.y).toBeGreaterThan(a.y);
    expect(three.y).toBeGreaterThan(two.y);
    expect(insideArea(result)).toBe(true);
  });

  it("afegir-la no la treu d'on era: la mateixa seqüència surt a dues pàgines", () => {
    const result = addSequencesToSheet(withHeader, 0, [2], context());
    expect(whereIs(result, 2)).toEqual({ common: false, sheets: [0, 1] });
    // I les altres pàgines i els comuns no es toquen
    expect(result.sheets[1]).toBe(withHeader.sheets[1]);
    expect(result.common).toBe(withHeader.common);
  });

  it("amb plantilla, omple el primer espai lliure i no mou els que hi eren (R2)", () => {
    // Una graella 2 × 2 amb dos blocs: el primer retocat a mà
    const start = applyTemplateToSheet(
      {
        sheets: [sheet("sh_1", [placement("a", 1), placement("b", 2)])],
        common: [],
      },
      0,
      gridTemplate(4),
      AREA,
    );
    const retouched: DocumentPages = {
      ...start,
      sheets: [
        {
          ...start.sheets[0],
          placements: start.sheets[0].placements.map((p) =>
            p.id === "a" ? { ...boxed(p), x: 3 } : p,
          ),
        },
      ],
    };
    const result = addSequencesToSheet(retouched, 0, [3], context());
    const [a, b, added] = result.sheets[0].placements.map(boxed);
    expect(result.sheets[0].template).toBe(gridTemplate(4).id);
    expect(a).toEqual(boxed(retouched.sheets[0].placements[0]));
    expect(b).toEqual(boxed(retouched.sheets[0].placements[1]));
    expect(added.slot).toBe(2);
    expect(added.y).toBeGreaterThan(b.y);
  });

  it("si «Y files» ja és ple, hi afegeix una columna i ho reparteix tot", () => {
    const full = applyTemplateToSheet(
      {
        sheets: [sheet("sh_1", [placement("a", 1), placement("b", 2)])],
        common: [],
      },
      0,
      stackTemplate(2, "rows"),
      AREA,
    );
    const result = addSequencesToSheet(full, 0, [3], context());
    // Dues files es queden dues files: ara de dues columnes
    expect(result.sheets[0].template).toBe("rows-2");
    expect(result.sheets[0].placements.map((p) => boxed(p).slot)).toEqual([
      0, 1, 2,
    ]);
    expect(boxed(result.sheets[0].placements[1]).x).toBeGreaterThan(0);
  });

  it("si una plantilla amb forma ja és plena, passa a la que toca i ho reparteix tot", () => {
    const full = applyTemplateToSheet(
      {
        sheets: [
          sheet("sh_1", [
            placement("a", 1),
            placement("b", 2),
            placement("c", 3),
            placement("d", 4),
          ]),
        ],
        common: [],
      },
      0,
      gridTemplate(4),
      AREA,
    );
    const result = addSequencesToSheet(full, 0, [5], context());
    expect(result.sheets[0].template).toBe("grid-3x2");
  });

  it("a una pàgina automàtica, van al final i sense caixa", () => {
    const auto: DocumentPages = {
      sheets: [sheet("sh_1", [text("t"), placement("a", 1)], { mode: "auto" })],
      common: [],
    };
    const result = addSequencesToSheet(auto, 0, [2], context());
    expect(result.sheets[0].placements.map((p) => p.id)).toEqual([
      "t",
      "a",
      "pl_n1",
    ]);
    expect(boxed(result.sheets[0].placements[2]).w).toBe(0);
  });

  it("aplicar una plantilla només toca aquella pàgina, i la pàgina se la queda", () => {
    const result = applyTemplateToSheet(
      withHeader,
      0,
      stackTemplate(1, "rows"),
      AREA,
    );
    expect(result.sheets[0]).toMatchObject({
      mode: "template",
      template: "full",
    });
    expect(result.sheets[0].placements[0]).toMatchObject({
      x: 0,
      y: 30 + TEMPLATE_GAP_MM,
      w: AREA.w,
      slot: 0,
    });
    expect(result.sheets[1]).toBe(withHeader.sheets[1]);
  });
});

describe("una pàgina automàtica passa a tenir caixes", () => {
  const empty: DocumentPages = { sheets: [], common: [] };
  const ctx = { area: AREA, direction: "row" as const };

  it("una pàgina amb caixes no canvia", () => {
    const page = sheet("sh_1", [placement("a", 1)]);
    expect(sheetToTemplate(page, empty, ctx)).toBe(page);
  });

  it("si els blocs ja tenien caixa, la recupera tal com era", () => {
    const page = sheet("sh_1", [placement("a", 1, { x: 7 })], { mode: "auto" });
    expect(sheetToTemplate(page, empty, ctx)).toEqual({
      ...page,
      mode: "template",
    });
  });

  it("si no, fa servir la plantilla que recordava", () => {
    const page = sheet("sh_1", [text("t"), placement("a", 1, { w: 0, h: 0 })], {
      mode: "auto",
      template: "columns-2",
    });
    const result = sheetToTemplate(page, empty, ctx);
    expect(result.template).toBe("columns-2");
    expect(result.placements.map((p) => boxed(p).slot)).toEqual([0, 1]);
    // El text també és un bloc: hi té el seu espai
    expect(boxed(result.placements[1]).x).toBeGreaterThan(0);
  });

  it("i si no la coneix o no hi caben, la que toca pel nombre de blocs", () => {
    const page = sheet(
      "sh_1",
      [
        text("t"),
        placement("a", 1, { w: 0, h: 0 }),
        placement("b", 2, { w: 0, h: 0 }),
      ],
      { mode: "auto", template: "full", direction: "column" },
    );
    expect(sheetToTemplate(page, empty, ctx).template).toBe("columns-3");
  });
});

describe("on surt cada seqüència", () => {
  const pages: DocumentPages = {
    sheets: [
      sheet("sh_1", [placement("a", 1), placement("b", 1), text("t")]),
      sheet("sh_2", [placement("c", 1)]),
    ],
    common: [placement("cap", 0)],
  };

  it("diu les pàgines sense repetir, i si és comuna", () => {
    expect(whereIs(pages, 1)).toEqual({ common: false, sheets: [0, 1] });
    expect(whereIs(pages, 0)).toEqual({ common: true, sheets: [] });
  });

  it("les que no surten enlloc són al calaix, en l'ordre del document", () => {
    expect(isPlaced(pages, 0)).toBe(true);
    expect(unplacedSequenceKeys(pages, [3, 0, 1, 2])).toEqual([3, 2]);
  });
});
