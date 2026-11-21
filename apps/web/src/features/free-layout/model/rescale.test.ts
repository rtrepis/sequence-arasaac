import { describe, expect, it } from "vitest";
import type { DocumentPages } from "@/types/document";
import { rescalePages, sameArea } from "./rescale";
import { freeRegion, slotToBox, stackTemplate } from "./templates";

// Recol·locar els blocs quan el full canvia de mida o de forma (la pantalla
// sencera): els d'una plantilla segueixen el seu espai; els moguts a mà
// s'escalen en proporció.

const FROM = { w: 200, h: 100 };
const TO = { w: 300, h: 300 };

const pages = (): DocumentPages => {
  const template = stackTemplate(2, "rows");
  const region = freeRegion(FROM, []);
  return {
    common: [],
    sheets: [
      {
        id: "sh_1",
        mode: "template",
        template: template.id,
        placements: template.slots.map((slot, index) => ({
          id: `pl_${index}`,
          kind: "sequence" as const,
          sequenceKey: index,
          columns: "auto" as const,
          slot: index,
          ...slotToBox(slot, region),
        })),
      },
      {
        id: "sh_2",
        mode: "template",
        template: "free",
        placements: [
          {
            id: "pl_free",
            kind: "text",
            text: "Bon dia",
            x: 20,
            y: 10,
            w: 50,
            h: 20,
          },
        ],
      },
      {
        id: "sh_3",
        mode: "auto",
        placements: [
          {
            id: "pl_auto",
            kind: "sequence",
            sequenceKey: 0,
            columns: "auto",
            x: 0,
            y: 0,
            w: 0,
            h: 0,
          },
        ],
      },
    ],
  };
};

describe("rescalePages", () => {
  it("els blocs d'una plantilla queden on els posaria la plantilla al full nou", () => {
    const result = rescalePages(pages(), FROM, TO);
    const template = stackTemplate(2, "rows");
    const region = freeRegion(TO, []);
    result.sheets[0].placements.forEach((placement, index) => {
      expect(placement).toMatchObject(slotToBox(template.slots[index], region));
    });
  });

  it("els moguts a mà s'escalen en proporció, en amplada i en alçada", () => {
    const [block] = rescalePages(pages(), FROM, TO).sheets[1].placements;
    expect(block).toMatchObject({ x: 30, y: 30, w: 75, h: 60 });
  });

  it("els d'una pàgina automàtica, sense caixa, no es toquen", () => {
    const before = pages();
    const after = rescalePages(before, FROM, TO);
    expect(after.sheets[2].placements[0]).toBe(before.sheets[2].placements[0]);
  });

  it("si el full no canvia, les pàgines són les mateixes", () => {
    const before = pages();
    expect(rescalePages(before, FROM, { ...FROM })).toBe(before);
    expect(sameArea(FROM, { w: 200.001, h: 100 })).toBe(true);
  });

  it("anar i tornar deixa els blocs on eren", () => {
    const before = pages();
    const back = rescalePages(rescalePages(before, FROM, TO), TO, FROM);
    back.sheets.forEach((sheet, sheetIndex) =>
      sheet.placements.forEach((placement, index) => {
        const original = before.sheets[sheetIndex].placements[index] as {
          x: number;
          y: number;
          w: number;
          h: number;
        };
        const { x, y, w, h } = placement as typeof original;
        expect(x).toBeCloseTo(original.x, 6);
        expect(y).toBeCloseTo(original.y, 6);
        expect(w).toBeCloseTo(original.w, 6);
        expect(h).toBeCloseTo(original.h, 6);
      }),
    );
  });
});
