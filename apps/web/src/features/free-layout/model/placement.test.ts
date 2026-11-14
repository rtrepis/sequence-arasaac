import { describe, expect, it } from "vitest";
import {
  MIN_BOX_MM,
  SHEET_FOOTER_RESERVE_MM,
  boxesOverlap,
  clampBox,
  moveBox,
  resizeBox,
  sheetAreaMm,
} from "./placement";

// Una caixa del mode lliure i el full on viu, en mm (`placement.ts`).

const AREA = { w: 200, h: 275 };

describe("l'àrea útil del full", () => {
  it("és el paper menys el marge d'impressió i la franja del peu", () => {
    // A4 (210 × 297) menys 5 mm per costat, i menys el peu a sota
    expect(sheetAreaMm("A4", "portrait")).toEqual({
      w: 200,
      h: 287 - SHEET_FOOTER_RESERVE_MM,
    });
    expect(sheetAreaMm("A4", "landscape")).toEqual({
      w: 287,
      h: 200 - SHEET_FOOTER_RESERVE_MM,
    });
  });

  it("la pantalla completa no en té: no té mil·límetres", () => {
    expect(sheetAreaMm("FULLSCREEN", "landscape")).toBeNull();
  });
});

describe("encaixar una caixa al full", () => {
  it("una caixa que sobresurt es mou cap a dins sense perdre la mida", () => {
    expect(clampBox({ x: 150, y: 250, w: 100, h: 50 }, AREA)).toEqual({
      x: 100,
      y: 225,
      w: 100,
      h: 50,
    });
    expect(clampBox({ x: -10, y: -3, w: 20, h: 20 }, AREA)).toEqual({
      x: 0,
      y: 0,
      w: 20,
      h: 20,
    });
  });

  it("no pot ser més gran que el full ni més petita que el mínim", () => {
    expect(clampBox({ x: 0, y: 0, w: 500, h: 1 }, AREA)).toEqual({
      x: 0,
      y: 0,
      w: AREA.w,
      h: MIN_BOX_MM,
    });
  });

  it("conserva la resta de camps de la col·locació", () => {
    const placement = {
      id: "pl_1",
      sequenceKey: 2,
      columns: 3,
      x: 300,
      y: 0,
      w: 10,
      h: 10,
    } as const;
    expect(clampBox(placement, AREA)).toMatchObject({
      id: "pl_1",
      sequenceKey: 2,
      columns: 3,
      x: 190,
    });
  });
});

describe("moure i redimensionar", () => {
  it("moure no deixa sortir la caixa del full", () => {
    const box = { x: 5, y: 5, w: 50, h: 50 };
    expect(moveBox(box, 1, 10, AREA)).toEqual({ x: 6, y: 15, w: 50, h: 50 });
    expect(moveBox(box, -10, 0, AREA).x).toBe(0);
    expect(moveBox(box, 1000, 0, AREA).x).toBe(AREA.w - 50);
  });

  it("redimensionar no mou el cantó de dalt a l'esquerra", () => {
    const box = { x: 100, y: 200, w: 50, h: 50 };
    expect(resizeBox(box, 10, -5, AREA)).toEqual({
      x: 100,
      y: 200,
      w: 60,
      h: 45,
    });
    // Ni més enllà del full, ni per sota del mínim
    expect(resizeBox(box, 1000, 1000, AREA)).toEqual({
      x: 100,
      y: 200,
      w: 100,
      h: 75,
    });
    expect(resizeBox(box, -1000, -1000, AREA)).toMatchObject({
      w: MIN_BOX_MM,
      h: MIN_BOX_MM,
    });
  });

  it("dues caixes es trepitgen si comparteixen àrea, no si només es toquen", () => {
    const a = { x: 0, y: 0, w: 10, h: 10 };
    expect(boxesOverlap(a, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
    expect(boxesOverlap(a, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
  });
});
