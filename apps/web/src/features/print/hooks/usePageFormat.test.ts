import {
  createPageFormat,
  isMediumScreen,
  PAGE_FORMATS,
} from "@/types/PageFormat";

describe("pageFormat", () => {
  describe("createPageFormat", () => {
    it("should create A4 landscape format correctly", () => {
      const result = createPageFormat("A4", "landscape");

      expect(result.size).toBe("A4");
      expect(result.orientation).toBe("landscape");
      expect(result.dimensions.width).toBe(975);
      expect(result.dimensions.height).toBe(689);
    });

    it("should create A4 portrait format correctly", () => {
      const result = createPageFormat("A4", "portrait");

      expect(result.size).toBe("A4");
      expect(result.orientation).toBe("portrait");
      // En portrait, s'intercanvien width i height
      expect(result.dimensions.width).toBe(689);
      expect(result.dimensions.height).toBe(975);
    });

    it("should create A3 landscape format correctly", () => {
      const result = createPageFormat("A3", "landscape");

      expect(result.size).toBe("A3");
      expect(result.orientation).toBe("landscape");
      expect(result.dimensions.width).toBe(1450);
      expect(result.dimensions.height).toBe(1025);
    });

    it("should create A3 portrait format correctly", () => {
      const result = createPageFormat("A3", "portrait");

      expect(result.size).toBe("A3");
      expect(result.orientation).toBe("portrait");
      expect(result.dimensions.width).toBe(1025);
      expect(result.dimensions.height).toBe(1450);
    });

    it("should create FULLSCREEN format correctly", () => {
      const result = createPageFormat("FULLSCREEN", "landscape");

      expect(result.size).toBe("FULLSCREEN");
      expect(result.orientation).toBe("landscape");
      expect(result.dimensions.width).toBeGreaterThan(0);
      expect(result.dimensions.height).toBeGreaterThan(0);
    });

    it("should swap dimensions for portrait orientation", () => {
      const landscape = createPageFormat("A4", "landscape");
      const portrait = createPageFormat("A4", "portrait");

      expect(landscape.dimensions.width).toBe(portrait.dimensions.height);
      expect(landscape.dimensions.height).toBe(portrait.dimensions.width);
    });
  });

  describe("PAGE_FORMATS", () => {
    it("should contain all required page sizes", () => {
      expect(PAGE_FORMATS).toHaveProperty("A4");
      expect(PAGE_FORMATS).toHaveProperty("A3");
      expect(PAGE_FORMATS).toHaveProperty("FULLSCREEN");
    });

    it("should have positive dimensions for all formats", () => {
      Object.values(PAGE_FORMATS).forEach((format) => {
        expect(format.width).toBeGreaterThan(0);
        expect(format.height).toBeGreaterThan(0);
      });
    });

    it("should have A3 larger than A4", () => {
      expect(PAGE_FORMATS.A3.width).toBeGreaterThan(PAGE_FORMATS.A4.width);
      expect(PAGE_FORMATS.A3.height).toBeGreaterThan(PAGE_FORMATS.A4.height);
    });
  });

  describe("isMediumScreen", () => {
    it("should return false for screens <= 900px", () => {
      expect(isMediumScreen(800)).toBe(false);
      expect(isMediumScreen(900)).toBe(false);
      expect(isMediumScreen(600)).toBe(false);
    });

    it("should return true for screens > 900px", () => {
      expect(isMediumScreen(901)).toBe(true);
      expect(isMediumScreen(1024)).toBe(true);
      expect(isMediumScreen(1920)).toBe(true);
    });

    it("should handle edge case at 900px", () => {
      expect(isMediumScreen(900)).toBe(false);
      expect(isMediumScreen(901)).toBe(true);
    });
  });
});
