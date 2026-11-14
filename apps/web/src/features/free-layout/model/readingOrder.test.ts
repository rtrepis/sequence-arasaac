import { describe, expect, it } from "vitest";
import { ROW_TOLERANCE_MM, sortByReadingOrder } from "./readingOrder";

// L'ordre de lectura de les caixes: de dalt a baix i, a la mateixa fila,
// d'esquerra a dreta (`readingOrder.ts`).

const box = (id: string, x: number, y: number) => ({ id, x, y, w: 10, h: 10 });

describe("sortByReadingOrder", () => {
  it("de dalt a baix, i a la mateixa fila d'esquerra a dreta", () => {
    const boxes = [
      box("baix", 0, 100),
      box("dreta", 100, 0),
      box("esquerra", 0, 0),
    ];
    expect(sortByReadingOrder(boxes).map(({ id }) => id)).toEqual([
      "esquerra",
      "dreta",
      "baix",
    ]);
  });

  it("dues caixes gairebé a la mateixa alçada són a la mateixa fila", () => {
    const boxes = [
      box("dreta", 100, 0),
      box("esquerra", 0, ROW_TOLERANCE_MM - 1),
    ];
    expect(sortByReadingOrder(boxes).map(({ id }) => id)).toEqual([
      "esquerra",
      "dreta",
    ]);
  });

  it("una escala de caixes no es fon en una sola fila", () => {
    // Cada una és a menys de la tolerància de l'anterior, però no de la primera
    const step = ROW_TOLERANCE_MM - 1;
    const boxes = [box("c", 0, step * 2), box("b", 50, step), box("a", 100, 0)];
    expect(sortByReadingOrder(boxes).map(({ id }) => id)).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("no toca la llista que rep", () => {
    const boxes = [box("b", 0, 100), box("a", 0, 0)];
    sortByReadingOrder(boxes);
    expect(boxes.map(({ id }) => id)).toEqual(["b", "a"]);
  });
});
