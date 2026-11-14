import { describe, expect, it } from "vitest";
import {
  calculateDisplayDimensions,
  getPrintDimensions,
} from "./useScaleCalculator";
import {
  createPageFormat,
  FOOTER_SPACE,
  SCREEN_MARGINS,
} from "../utils/pageFormat";

describe("useScaleCalculator", () => {
  describe("calculateDisplayDimensions", () => {
    it("no hauria de passar mai d'escala 1: la previsualització no pot sortir més gran que el full", () => {
      const result = calculateDisplayDimensions({
        pageFormat: createPageFormat("A4", "landscape"),
        screenWidth: 1920,
        screenHeight: 1080,
      });

      expect(result.scale).toBe(1);
    });

    it("hauria d'encongir la previsualització quan el full no hi cap", () => {
      const result = calculateDisplayDimensions({
        pageFormat: createPageFormat("A3", "landscape"),
        screenWidth: 800,
        screenHeight: 600,
      });

      expect(result.scale).toBeGreaterThan(0);
      expect(result.scale).toBeLessThan(1);
    });

    it("hauria de deixar més escala a la pantalla que reserva menys marge", () => {
      // Just als dos costats del llindar de `isMediumScreen` (900 px), i amb
      // una pantalla alta perquè l'escala la decideixi el marge i no l'alçada
      const narrow = calculateDisplayDimensions({
        pageFormat: createPageFormat("A4", "landscape"),
        screenWidth: 900,
        screenHeight: 2000,
      });
      const wide = calculateDisplayDimensions({
        pageFormat: createPageFormat("A4", "landscape"),
        screenWidth: 901,
        screenHeight: 2000,
      });

      expect(narrow.scale).toBeGreaterThan(wide.scale);
    });

    it("hauria de deixar lloc al peu quan l'alçada va justa", () => {
      const screenHeight = 700;

      const result = calculateDisplayDimensions({
        pageFormat: createPageFormat("A3", "landscape"),
        screenWidth: 2000,
        screenHeight,
      });

      expect(result.displayHeight + FOOTER_SPACE).toBeLessThanOrEqual(
        screenHeight,
      );
    });

    it("a l'amplada, un full vertical no queda limitat per l'alçada", () => {
      // Un portàtil de 1366 × 768 amb un A4 vertical: sencer, l'alçada el deixa
      // a ~0,6; a l'amplada hi cap a mida real
      const params = {
        pageFormat: createPageFormat("A4", "portrait"),
        screenWidth: 1366,
        screenHeight: 768,
      };
      const page = calculateDisplayDimensions(params);
      const width = calculateDisplayDimensions({ ...params, fit: "width" });

      expect(page.displayHeight + FOOTER_SPACE).toBeLessThanOrEqual(768);
      expect(page.scale).toBeLessThan(0.7);
      expect(width.scale).toBe(1);
      expect(width.displayHeight).toBeGreaterThan(768);
    });

    it("a l'amplada tampoc no passa mai d'escala 1", () => {
      const result = calculateDisplayDimensions({
        pageFormat: createPageFormat("A4", "portrait"),
        screenWidth: 3000,
        screenHeight: 500,
        fit: "width",
      });

      expect(result.scale).toBe(1);
    });

    it("sense la columna d'ajustos al costat, el full guanya amplada", () => {
      // Una tauleta apaïsada: aquí el que limita és l'amplada
      const params = {
        pageFormat: createPageFormat("A4", "landscape"),
        screenWidth: 1024,
        screenHeight: 2000,
      };
      const beside = calculateDisplayDimensions(params);
      const hidden = calculateDisplayDimensions({
        ...params,
        settingsBeside: false,
      });

      expect(hidden.scale).toBeGreaterThan(beside.scale);
      expect(hidden.displayWidth).toBeCloseTo(1024 - SCREEN_MARGINS.small);
    });

    it("al mòbil, amagar la columna no canvia res: ja és a sota del full", () => {
      const params = {
        pageFormat: createPageFormat("A4", "portrait"),
        screenWidth: 412,
        screenHeight: 915,
      };
      expect(
        calculateDisplayDimensions({ ...params, settingsBeside: false }),
      ).toEqual(calculateDisplayDimensions(params));
    });

    it("hauria de mantenir la proporció del full", () => {
      const pageFormat = createPageFormat("A4", "portrait");

      const result = calculateDisplayDimensions({
        pageFormat,
        screenWidth: 1920,
        screenHeight: 1080,
      });

      const paperRatio =
        pageFormat.dimensions.height / pageFormat.dimensions.width;
      const displayRatio = result.displayHeight / result.displayWidth;
      expect(displayRatio).toBeCloseTo(paperRatio, 2);
    });
  });

  describe("getPrintDimensions", () => {
    it("hauria d'imprimir les mides del format, que ja venen orientades", () => {
      const landscape = createPageFormat("A3", "landscape");
      const portrait = createPageFormat("A3", "portrait");

      expect(getPrintDimensions(landscape)).toEqual(landscape.dimensions);
      expect(getPrintDimensions(portrait)).toEqual(portrait.dimensions);
    });

    it("hauria de girar les mides entre apaïsat i vertical", () => {
      const landscape = getPrintDimensions(createPageFormat("A3", "landscape"));
      const portrait = getPrintDimensions(createPageFormat("A3", "portrait"));

      expect(portrait.width).toBe(landscape.height);
      expect(portrait.height).toBe(landscape.width);
    });
  });
});

describe("al mòbil", () => {
  it("el full fa l'amplada del verd dels ajustos: la finestra menys 2 px a cada costat", () => {
    const result = calculateDisplayDimensions({
      pageFormat: createPageFormat("A4", "landscape"),
      screenWidth: 390,
      screenHeight: 844,
    });
    expect(result.displayWidth).toBeCloseTo(390 - SCREEN_MARGINS.phone);
    expect(SCREEN_MARGINS.phone).toBe(4);
  });
});
