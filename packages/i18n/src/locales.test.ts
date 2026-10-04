import { describe, expect, it } from "vitest";
import { DEFAULT_LANGS_APP, LANGS_APP, isLangsApp, toLangsApp } from "./locales";

describe("locales", () => {
  it("l'idioma per defecte és un dels idiomes de l'aplicació", () => {
    expect(LANGS_APP).toContain(DEFAULT_LANGS_APP);
  });

  it("reconeix els idiomes de l'aplicació i prou", () => {
    for (const lang of LANGS_APP) expect(isLangsApp(lang)).toBe(true);
    expect(isLangsApp("de")).toBe(false);
    expect(isLangsApp("")).toBe(false);
    expect(isLangsApp(undefined)).toBe(false);
  });

  it("normalitza qualsevol valor desconegut, buit o absent a l'idioma per defecte", () => {
    expect(toLangsApp("fr")).toBe("fr");
    expect(toLangsApp("FR")).toBe(DEFAULT_LANGS_APP);
    expect(toLangsApp("xx")).toBe(DEFAULT_LANGS_APP);
    expect(toLangsApp("")).toBe(DEFAULT_LANGS_APP);
    expect(toLangsApp(undefined)).toBe(DEFAULT_LANGS_APP);
  });
});
