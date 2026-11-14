import { describe, expect, it } from "vitest";
import { resolveColumns } from "./blockGrid";

// Les columnes de dins d'un bloc segons el repartiment de la pàgina.

describe("resolveColumns", () => {
  it("amb un nombre triat, mana el nombre", () => {
    expect(resolveColumns(3, "columns", 8)).toBe(3);
  });

  it("automàtiques: en una pàgina en columnes, una columna", () => {
    expect(resolveColumns("auto", "columns", 5)).toBe(1);
  });

  it("automàtiques: en una pàgina en files, una sola fila", () => {
    expect(resolveColumns("auto", "rows", 5)).toBe(5);
  });

  it("automàtiques: amb una plantilla, les que hi caben millor", () => {
    expect(resolveColumns("auto", "template", 5)).toBe("auto");
    expect(resolveColumns("auto", undefined, 5)).toBe("auto");
  });
});
