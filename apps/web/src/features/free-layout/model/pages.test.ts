import { describe, expect, it } from "vitest";
import type { DocumentPages, SequencePlacement } from "@/types/document";
import {
  addNewSequenceToPages,
  dispositionOf,
  explicitPages,
  initialPagesFor,
  newSheetWith,
  hasTemplatePages,
  toAutoPages,
  toTemplatePages,
} from "./pages";
import type { NewLayoutId } from "./sheets";

// El document com a llista de pàgines (`pages.ts`, R1).

const AREA = { w: 200, h: 275 };

const ids = (): NewLayoutId => {
  let count = 0;
  return (prefix) => `${prefix}_n${(count += 1)}`;
};

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
  w: 0,
  h: 0,
  columns: "auto",
  ...box,
});

describe("un document sense pàgines", () => {
  it("és una sola pàgina automàtica amb totes les seqüències, en ordre", () => {
    expect(explicitPages(undefined, [0, 1], ids())).toEqual({
      sheets: [
        {
          id: "sh_n1",
          mode: "auto",
          placements: [placement("pl_n2", 0), placement("pl_n3", 1)],
        },
      ],
      common: [],
    });
  });

  it("les que ja té no es toquen", () => {
    const pages: DocumentPages = { sheets: [], common: [] };
    expect(explicitPages(pages, [0], ids())).toBe(pages);
  });
});

describe("«Automàtica» i «Lliure» per a tot el document", () => {
  const two: DocumentPages = {
    sheets: [
      {
        id: "sh_1",
        mode: "template",
        template: "full",
        placements: [placement("a", 0, { w: 200, h: 275, slot: 0 })],
      },
      { id: "sh_2", mode: "auto", placements: [placement("b", 1)] },
    ],
    common: [],
  };

  it("hi ha disposició lliure si alguna pàgina té caixes", () => {
    expect(hasTemplatePages(undefined)).toBe(false);
    expect(hasTemplatePages(two)).toBe(true);
    expect(hasTemplatePages(toAutoPages(two))).toBe(false);
  });

  it("tornar a automàtica no esborra res, i tornar a lliure ho recupera", () => {
    const auto = toAutoPages(two);
    expect(auto.sheets[0]).toEqual({ ...two.sheets[0], mode: "auto" });
    const back = toTemplatePages(auto, [0, 1], {
      area: AREA,
      direction: "row",
      newId: ids(),
    });
    expect(back.sheets[0]).toEqual(two.sheets[0]);
    // La que era automàtica i no tenia caixes, es reparteix en el seu sentit
    expect(back.sheets[1]).toMatchObject({
      mode: "template",
      template: "rows-1",
    });
  });

  it("un document sense pàgines rep la disposició de partida", () => {
    const pages = toTemplatePages(undefined, [0, 1, 2, 3], {
      area: AREA,
      direction: "row",
      newId: ids(),
    });
    expect(pages.sheets).toHaveLength(2);
    expect(hasTemplatePages(pages)).toBe(true);
  });
});

describe("una seqüència nova", () => {
  it("va al final de l'última pàgina si és automàtica", () => {
    const pages: DocumentPages = {
      sheets: [{ id: "sh_1", mode: "auto", placements: [placement("a", 0)] }],
      common: [],
    };
    const result = addNewSequenceToPages(pages, 1, () => "pl_nou");
    expect(result.sheets[0].placements).toEqual([
      placement("a", 0),
      placement("pl_nou", 1),
    ]);
    // Sense tocar les pàgines que rep
    expect(pages.sheets[0].placements).toHaveLength(1);
  });

  it("queda sense col·locar si l'última pàgina té caixes", () => {
    const pages: DocumentPages = {
      sheets: [{ id: "sh_1", mode: "template", placements: [] }],
      common: [],
    };
    expect(addNewSequenceToPages(pages, 1, () => "pl_nou")).toBe(pages);
  });
});

/** La clau de la seqüència d'un bloc, o -1 si no n'és cap. */
const keyOf = (block: { kind: string; sequenceKey?: number }) =>
  block.kind === "sequence" ? (block.sequenceKey ?? -1) : -1;

describe("la disposició d'una pàgina i la dels documents nous (pas 7b)", () => {
  const context = () => ({
    area: AREA,
    direction: "row" as const,
    newId: ids(),
  });

  it("cada pàgina diu la seva: simple, columnes, files o lliure", () => {
    expect(dispositionOf(undefined)).toBe("auto");
    expect(dispositionOf({ id: "s", mode: "auto", placements: [] })).toBe(
      "auto",
    );
    const sheet = (template: string) => ({
      id: "s",
      mode: "template" as const,
      template,
      placements: [],
    });
    expect(dispositionOf(sheet("columns-3"))).toBe("columns");
    expect(dispositionOf(sheet("rows-2"))).toBe("rows");
    expect(dispositionOf(sheet("free"))).toBe("free");
    // Una plantilla aplicada és lliure, amb espais per omplir
    expect(dispositionOf(sheet("week"))).toBe("free");
  });

  it("una pàgina nova neix buida amb la disposició que se li demana", () => {
    for (const disposition of ["auto", "columns", "rows", "free"] as const)
      expect(dispositionOf(newSheetWith(ids(), disposition))).toBe(disposition);
    expect(newSheetWith(ids(), "columns").placements).toEqual([]);
  });

  it("un document nou en columnes té una pàgina amb una columna per seqüència", () => {
    const pages = initialPagesFor("columns", [0, 1], context());
    expect(pages?.sheets).toHaveLength(1);
    const [sheet] = pages?.sheets ?? [];
    expect(sheet.template).toBe("columns-2");
    expect(sheet.placements.map(keyOf)).toEqual([0, 1]);
    expect(dispositionOf(sheet)).toBe("columns");
  });

  it("en files, lliure, i simple sense pàgines pròpies", () => {
    expect(
      dispositionOf(initialPagesFor("rows", [0], context())?.sheets[0]),
    ).toBe("rows");
    const free = initialPagesFor("free", [0], context())?.sheets[0];
    expect(dispositionOf(free)).toBe("free");
    expect(free?.placements).toHaveLength(1);
    expect(initialPagesFor("auto", [0], context())).toBeUndefined();
  });
});
