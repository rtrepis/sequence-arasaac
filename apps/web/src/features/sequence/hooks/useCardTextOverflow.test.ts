import { describe, expect, it } from "vitest";
import { fittingFontSize } from "./useCardTextOverflow";

describe("fittingFontSize", () => {
  it("dona la mida més gran, en passos de 0,1, amb què el text hi cap", () => {
    // 125 px de text en 100 px de caixa: hi cap a 0,8 de la mida actual
    expect(fittingFontSize(1, 100, 125)).toBe(0.8);
    expect(fittingFontSize(2, 100, 130)).toBe(1.5);
  });

  it("no s'equivoca de pas quan la proporció és exacta", () => {
    expect(fittingFontSize(1, 80, 100)).toBe(0.8);
    expect(fittingFontSize(1, 70, 100)).toBe(0.7);
  });

  it("torna null si no hi cap ni amb la lletra més petita (0,5)", () => {
    expect(fittingFontSize(1, 100, 250)).toBeNull();
    expect(fittingFontSize(1, 100, 200)).toBe(0.5);
  });
});
