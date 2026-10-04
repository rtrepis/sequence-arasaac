import { describe, expect, it } from "vitest";
import { mmToPixels, pixelsToMM } from "./pageUnits";
import { CSS_PRINT_DPI } from "./pageFormat";

describe("pageUnits", () => {
  it("hauria de convertir una polzada als píxels del DPI que se li digui", () => {
    expect(mmToPixels(25.4, 96)).toBe(96);
    expect(mmToPixels(25.4, 300)).toBe(300);
  });

  it("hauria de convertir l'amplada d'un A4 a píxels d'impressió", () => {
    // 210 mm a 96 DPI: 210 / 25,4 × 96 = 793,7 → 794
    expect(mmToPixels(210, CSS_PRINT_DPI)).toBe(794);
  });

  it("hauria d'arrodonir al píxel", () => {
    expect(Number.isInteger(mmToPixels(297, CSS_PRINT_DPI))).toBe(true);
  });

  it("hauria de tornar al punt de partida en desfer la conversió", () => {
    const millimeters = 190;
    const pixels = mmToPixels(millimeters, CSS_PRINT_DPI);

    expect(pixelsToMM(pixels, CSS_PRINT_DPI)).toBeCloseTo(millimeters, 1);
  });

  it("hauria de donar menys píxels per al mateix paper amb menys DPI", () => {
    expect(mmToPixels(100, 72)).toBeLessThan(mmToPixels(100, 96));
  });
});
