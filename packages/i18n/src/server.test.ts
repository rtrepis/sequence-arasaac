import { describe, expect, it } from "vitest";
import { createTranslator } from "./server";

describe("createTranslator", () => {
  it("tradueix a l'idioma demanat", () => {
    expect(createTranslator("fr")("email.passwordReset.heading")).toBe(
      "Récupérez votre mot de passe",
    );
  });

  it("saluda amb el nom o sense", () => {
    const t = createTranslator("ca");
    expect(t("email.greeting", { hasName: "yes", name: "Anna" })).toBe("Hola, Anna!");
    expect(t("email.greeting", { hasName: "no", name: "" })).toBe("Hola!");
  });

  it("insereix el nom tal qual, encara que porti sintaxi ICU", () => {
    const t = createTranslator("en");
    expect(t("email.greeting", { hasName: "yes", name: "{x} O'Brien" })).toBe(
      "Hi, {x} O'Brien!",
    );
  });
});
