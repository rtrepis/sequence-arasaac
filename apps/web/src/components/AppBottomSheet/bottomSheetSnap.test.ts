import { describe, expect, it } from "vitest";
import {
  BOTTOM_SHEET_TOP_GAP,
  bottomSheetHeights,
  pickBottomSheetSnap,
} from "./bottomSheetSnap";

// Pantalla d'un Pixel 7 (412 × 915) amb una capçalera de 60 px
const heights = bottomSheetHeights(915, 60);

describe("bottomSheetHeights", () => {
  it("plegat és la capçalera, mig la meitat i sencer tot menys la franja", () => {
    expect(heights).toEqual({
      collapsed: 60,
      half: 458,
      full: 915 - BOTTOM_SHEET_TOP_GAP,
    });
  });

  it("amb el teclat obert, les parades surten del que queda visible", () => {
    const withKeyboard = bottomSheetHeights(500, 60);
    expect(withKeyboard.half).toBe(250);
    expect(withKeyboard.full).toBe(436);
  });

  it("mai per sota de la capçalera, encara que la pantalla sigui minúscula", () => {
    const tiny = bottomSheetHeights(100, 60);
    expect(tiny.half).toBeGreaterThanOrEqual(60);
    expect(tiny.full).toBeGreaterThanOrEqual(60);
  });
});

describe("pickBottomSheetSnap", () => {
  it("deixat anar a poc a poc, va a la parada més propera", () => {
    expect(pickBottomSheetSnap(100, 0, heights)).toBe("collapsed");
    expect(pickBottomSheetSnap(400, 0, heights)).toBe("half");
    expect(pickBottomSheetSnap(800, 0, heights)).toBe("full");
  });

  it("un gest ràpid cap amunt va a la parada següent, no a la més propera", () => {
    expect(pickBottomSheetSnap(80, 1, heights)).toBe("half");
    expect(pickBottomSheetSnap(470, 1, heights)).toBe("full");
  });

  it("un gest ràpid cap avall va a la parada anterior", () => {
    expect(pickBottomSheetSnap(830, -1, heights)).toBe("half");
    expect(pickBottomSheetSnap(440, -1, heights)).toBe("collapsed");
  });

  it("un gest ràpid més enllà dels extrems es queda a l'extrem", () => {
    expect(pickBottomSheetSnap(851, 2, heights)).toBe("full");
    expect(pickBottomSheetSnap(60, -2, heights)).toBe("collapsed");
  });
});
