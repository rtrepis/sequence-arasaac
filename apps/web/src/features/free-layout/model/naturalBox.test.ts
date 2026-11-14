import { describe, expect, it } from "vitest";
import type { DocumentPages, SequenceViewSettings } from "@/types/document";
import { fitSheetBlocks, grownBox, naturalBoxMm } from "./naturalBox";

// La mida justa d'un bloc de seqüència i les regles de les pàgines lliures (pas 7c).

const AREA = { w: 270, h: 180 };
const VIEW: SequenceViewSettings = {
  sizePict: 1,
  pictSpaceBetween: 0,
  alignmentH: "center",
  alignmentV: "center",
};
// Una targeta de 96 × 96 px d'impressió fa 25,4 mm de costat
const CARD = { w: 96, h: 96 };

describe("la caixa justa d'un bloc", () => {
  it("en una fila, i en més si no hi caben", () => {
    const one = naturalBoxMm({
      count: 3,
      card: CARD,
      view: VIEW,
      columns: "auto",
      area: AREA,
    });
    expect(one.w).toBeCloseTo(3 * 25.4 + 0.5, 1);
    expect(one.h).toBeCloseTo(25.4 + 0.5, 1);
    // Deu en una fila no hi caben (270 mm): en caben 10 per fila? 10 × 25,4 = 254
    const many = naturalBoxMm({
      count: 12,
      card: CARD,
      view: VIEW,
      columns: "auto",
      area: AREA,
    });
    expect(many.h).toBeCloseTo(2 * 25.4 + 0.5, 1);
  });

  it("amb columnes triades, la mida i l'espai de la distribució", () => {
    const box = naturalBoxMm({
      count: 4,
      card: CARD,
      view: { ...VIEW, sizePict: 0.5 },
      columns: 2,
      area: AREA,
    });
    expect(box.w).toBeCloseTo(25.4 + 0.5, 1);
    expect(box.h).toBeCloseTo(25.4 + 0.5, 1);
  });

  it("sense pictogrames, la d'un; i mai més gran que el full", () => {
    const empty = naturalBoxMm({
      count: 0,
      card: CARD,
      view: VIEW,
      columns: "auto",
      area: AREA,
    });
    expect(empty.w).toBeCloseTo(25.9, 1);
    const huge = naturalBoxMm({
      count: 40,
      card: CARD,
      view: { ...VIEW, sizePict: 3 },
      columns: "auto",
      area: AREA,
    });
    // Tres per fila (3 × 76,2 mm), i l'alçada, la del full
    expect(huge.w).toBeCloseTo(3 * 76.2 + 0.5, 1);
    expect(huge.h).toBe(AREA.h);
  });
});

describe("passar a lliure i créixer", () => {
  const pages = (): DocumentPages => ({
    sheets: [
      {
        id: "s",
        mode: "template",
        template: "free",
        placements: [
          {
            kind: "sequence",
            id: "a",
            sequenceKey: 0,
            x: 200,
            y: 10,
            w: 60,
            h: 160,
            columns: "auto",
          },
          {
            kind: "text",
            id: "t",
            text: "Hola",
            x: 0,
            y: 0,
            w: 50,
            h: 20,
          },
        ],
      },
    ],
    common: [],
  });

  it("en passar a lliure, els blocs de seqüència fan la mida justa, dins del full", () => {
    const fitted = fitSheetBlocks(pages(), 0, () => ({ w: 100, h: 30 }), AREA);
    expect(fitted.sheets[0].placements[0]).toMatchObject({
      x: 170,
      y: 10,
      w: 100,
      h: 30,
    });
    // Els rètols no canvien
    expect(fitted.sheets[0].placements[1]).toMatchObject({ w: 50, h: 20 });
  });

  it("si la caixa justa trepitjaria un altre bloc, va al primer lloc lliure", () => {
    const two: DocumentPages = {
      sheets: [
        {
          id: "s",
          mode: "template",
          template: "free",
          placements: [
            {
              kind: "sequence",
              id: "a",
              sequenceKey: 0,
              x: 0,
              y: 0,
              w: 50,
              h: 50,
              columns: "auto",
            },
            {
              kind: "sequence",
              id: "b",
              sequenceKey: 1,
              x: 0,
              y: 60,
              w: 50,
              h: 50,
              columns: "auto",
            },
          ],
        },
      ],
      common: [],
    };
    // La primera es fa alta (100 mm) i trepitjaria la segona
    const fitted = fitSheetBlocks(
      two,
      0,
      (placement) =>
        placement.id === "a" ? { w: 120, h: 100 } : { w: 120, h: 40 },
      AREA,
    );
    const [a, b] = fitted.sheets[0].placements;
    expect(a).toMatchObject({ x: 0, y: 0, w: 120, h: 100 });
    // Al costat de la primera, a dalt
    expect(b).toMatchObject({ x: 120, y: 0, w: 120, h: 40 });
  });

  it("creix si la seqüència creix i ja no hi cap; si s'encongeix, no", () => {
    const box = { x: 0, y: 0, w: 60, h: 30 };
    expect(grownBox(box, { w: 50, h: 30 }, { w: 80, h: 30 }, AREA)).toEqual({
      x: 0,
      y: 0,
      w: 80,
      h: 30,
    });
    expect(
      grownBox(box, { w: 80, h: 30 }, { w: 50, h: 30 }, AREA),
    ).toBeUndefined();
    // La seqüència ha crescut però encara hi cap (l'usuari havia fet la caixa gran)
    expect(
      grownBox({ ...box, w: 200 }, { w: 50, h: 30 }, { w: 80, h: 30 }, AREA),
    ).toBeUndefined();
    // La caixa feta més petita que la seqüència: si la seqüència no canvia, no creix
    expect(
      grownBox({ ...box, w: 20 }, { w: 80, h: 30 }, { w: 80, h: 30 }, AREA),
    ).toBeUndefined();
  });
});
