import { describe, expect, it } from "vitest";
import {
  calculateUsableDimensions,
  createPageFormat,
  isMediumScreen,
  CSS_PRINT_DPI,
  PAPER_DIMENSIONS_MM,
  PRINT_MARGIN_MM,
} from "./pageFormat";
import { mmToPixels } from "./pageUnits";

/**
 * El que s'espera es **deriva** del paper, no es clava al test: així el test
 * diu la regla —ISO 216 menys els marges, a 96 DPI CSS— i no una fotografia
 * dels números d'un dia. Aquest fitxer esperava 975×689 per a un A4 apaïsat,
 * que eren unes constants escrites a mà i esborrades el febrer; ningú no se'n
 * va assabentar perquè la suite no s'executava.
 */
const usablePx = (paperMM: number) =>
  mmToPixels(paperMM - PRINT_MARGIN_MM * 2, CSS_PRINT_DPI);

const A4_SHORT = usablePx(PAPER_DIMENSIONS_MM.A4.width);
const A4_LONG = usablePx(PAPER_DIMENSIONS_MM.A4.height);
const A3_SHORT = usablePx(PAPER_DIMENSIONS_MM.A3.width);
const A3_LONG = usablePx(PAPER_DIMENSIONS_MM.A3.height);

describe("pageFormat", () => {
  describe("calculateUsableDimensions", () => {
    it("hauria de descomptar el marge a banda i banda", () => {
      const result = calculateUsableDimensions(100, 200, 10);

      expect(result.width).toBe(mmToPixels(80, CSS_PRINT_DPI));
      expect(result.height).toBe(mmToPixels(180, CSS_PRINT_DPI));
    });

    it("hauria de convertir sempre a 96 DPI CSS, que és com imprimeix el navegador", () => {
      const result = calculateUsableDimensions(
        PAPER_DIMENSIONS_MM.A4.width,
        PAPER_DIMENSIONS_MM.A4.height,
      );

      expect(result.width).toBe(A4_SHORT);
      expect(result.height).toBe(A4_LONG);
    });
  });

  describe("createPageFormat", () => {
    it("hauria de donar l'A4 apaïsat amb el costat llarg a l'amplada", () => {
      const result = createPageFormat("A4", "landscape");

      expect(result.size).toBe("A4");
      expect(result.orientation).toBe("landscape");
      expect(result.dimensions).toEqual({ width: A4_LONG, height: A4_SHORT });
    });

    it("hauria de donar l'A4 vertical amb el costat llarg a l'alçada", () => {
      const result = createPageFormat("A4", "portrait");

      expect(result.dimensions).toEqual({ width: A4_SHORT, height: A4_LONG });
    });

    it("hauria de donar l'A3 amb les mides del seu paper", () => {
      expect(createPageFormat("A3", "landscape").dimensions).toEqual({
        width: A3_LONG,
        height: A3_SHORT,
      });
      expect(createPageFormat("A3", "portrait").dimensions).toEqual({
        width: A3_SHORT,
        height: A3_LONG,
      });
    });

    it("hauria de fer l'A3 més gran que l'A4", () => {
      const a3 = createPageFormat("A3", "landscape").dimensions;
      const a4 = createPageFormat("A4", "landscape").dimensions;

      expect(a3.width).toBeGreaterThan(a4.width);
      expect(a3.height).toBeGreaterThan(a4.height);
    });

    it("hauria d'intercanviar les dues mides en girar l'orientació", () => {
      const landscape = createPageFormat("A4", "landscape");
      const portrait = createPageFormat("A4", "portrait");

      expect(landscape.dimensions.width).toBe(portrait.dimensions.height);
      expect(landscape.dimensions.height).toBe(portrait.dimensions.width);
    });

    it("hauria de prendre la mida de la pantalla en pantalla completa", () => {
      const landscape = createPageFormat("FULLSCREEN", "landscape");
      const portrait = createPageFormat("FULLSCREEN", "portrait");
      const long = Math.max(window.screen.width, window.screen.height);
      const short = Math.min(window.screen.width, window.screen.height);

      expect(landscape.dimensions).toEqual({ width: long, height: short });
      expect(portrait.dimensions).toEqual({ width: short, height: long });
    });
  });

  describe("isMediumScreen", () => {
    it("hauria de considerar mitjana una pantalla de més de 900 px", () => {
      expect(isMediumScreen(901)).toBe(true);
      expect(isMediumScreen(1920)).toBe(true);
    });

    it("no hauria de considerar mitjana una pantalla de 900 px o menys", () => {
      expect(isMediumScreen(900)).toBe(false);
      expect(isMediumScreen(600)).toBe(false);
    });
  });
});
