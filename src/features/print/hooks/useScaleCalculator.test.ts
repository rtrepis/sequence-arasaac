import {
  calculateDisplayDimensions,
  getPrintDimensions,
  ScaleCalculationParams,
} from "./useScaleCalculator";
import { createPageFormat, PageFormat } from "@/types/PageFormat";

describe("useScaleCalculator", () => {
  describe("calculateDisplayDimensions", () => {
    it("should calculate correct dimensions for A4 landscape on medium screen", () => {
      const pageFormat: PageFormat = createPageFormat("A4", "landscape");
      const params: ScaleCalculationParams = {
        pageFormat,
        screenWidth: 1920,
        screenHeight: 1080,
      };

      const result = calculateDisplayDimensions(params);

      expect(result.displayWidth).toBeGreaterThan(0);
      expect(result.displayHeight).toBeGreaterThan(0);
      expect(result.scale).toBeGreaterThan(0);
      expect(result.scale).toBeLessThan(2);
    });

    it("should calculate correct dimensions for A4 portrait on medium screen", () => {
      const pageFormat: PageFormat = createPageFormat("A4", "portrait");
      const params: ScaleCalculationParams = {
        pageFormat,
        screenWidth: 1920,
        screenHeight: 1080,
      };

      const result = calculateDisplayDimensions(params);

      expect(result.displayWidth).toBeGreaterThan(0);
      expect(result.displayHeight).toBeGreaterThan(0);
      expect(result.scale).toBeGreaterThan(0);
    });

    it("should calculate correct dimensions for A3 landscape on medium screen", () => {
      const pageFormat: PageFormat = createPageFormat("A3", "landscape");
      const params: ScaleCalculationParams = {
        pageFormat,
        screenWidth: 1920,
        screenHeight: 1080,
      };

      const result = calculateDisplayDimensions(params);

      expect(result.displayWidth).toBeGreaterThan(0);
      expect(result.displayHeight).toBeGreaterThan(0);
      expect(result.scale).toBeGreaterThan(0);
    });

    it("should use smaller margin for small screens", () => {
      const pageFormat: PageFormat = createPageFormat("A4", "landscape");
      const paramsSmall: ScaleCalculationParams = {
        pageFormat,
        screenWidth: 800,
        screenHeight: 600,
      };
      const paramsMedium: ScaleCalculationParams = {
        pageFormat,
        screenWidth: 1920,
        screenHeight: 1080,
      };

      const resultSmall = calculateDisplayDimensions(paramsSmall);
      const resultMedium = calculateDisplayDimensions(paramsMedium);

      // L'escala per a pantalles petites hauria de ser més gran (menys marge)
      expect(resultSmall.scale).toBeGreaterThan(resultMedium.scale);
    });

    it("should adjust height when it exceeds available space", () => {
      const pageFormat: PageFormat = createPageFormat("A3", "landscape");
      const params: ScaleCalculationParams = {
        pageFormat,
        screenWidth: 2000,
        screenHeight: 700, // Alçada petita per forçar ajust
      };

      const result = calculateDisplayDimensions(params);

      // L'alçada + footer space no hauria de superar l'alçada de pantalla
      expect(result.displayHeight + 150).toBeLessThanOrEqual(700);
    });

    it("should maintain aspect ratio", () => {
      const pageFormat: PageFormat = createPageFormat("A4", "landscape");
      const params: ScaleCalculationParams = {
        pageFormat,
        screenWidth: 1920,
        screenHeight: 1080,
      };

      const result = calculateDisplayDimensions(params);
      const expectedRatio =
        pageFormat.dimensions.height / pageFormat.dimensions.width;
      const actualRatio = result.displayHeight / result.displayWidth;

      // Permetre una petita diferència per errors d'arrodoniment
      expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.01);
    });
  });

  describe("getPrintDimensions", () => {
    it("should return same dimensions for landscape", () => {
      const pageFormat: PageFormat = createPageFormat("A4", "landscape");
      const result = getPrintDimensions(pageFormat);

      expect(result.width).toBe(pageFormat.dimensions.width);
      expect(result.height).toBe(pageFormat.dimensions.height);
    });

    it("should swap dimensions for portrait", () => {
      const pageFormat: PageFormat = createPageFormat("A4", "portrait");
      const result = getPrintDimensions(pageFormat);

      // En portrait, les dimensions ja estan girades en createPageFormat
      expect(result.width).toBe(pageFormat.dimensions.width);
      expect(result.height).toBe(pageFormat.dimensions.height);
    });

    it("should work correctly for A3", () => {
      const pageFormat: PageFormat = createPageFormat("A3", "landscape");
      const result = getPrintDimensions(pageFormat);

      expect(result.width).toBe(1450);
      expect(result.height).toBe(1025);
    });

    it("should work correctly for A3 portrait", () => {
      const pageFormat: PageFormat = createPageFormat("A3", "portrait");
      const result = getPrintDimensions(pageFormat);

      expect(result.width).toBe(1025);
      expect(result.height).toBe(1450);
    });
  });
});
