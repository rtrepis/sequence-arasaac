import { describe, expect, it } from "vitest";
import type { DocumentPages, SequencePlacement } from "@/types/document";
import {
  addNewSequenceToPages,
  explicitPages,
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
