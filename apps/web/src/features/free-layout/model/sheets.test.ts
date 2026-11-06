import { describe, expect, it } from "vitest";
import type { FreeLayout, SequencePlacement } from "@/types/document";
import {
  NewLayoutId,
  addPlacement,
  addSheet,
  copyPlacementToSheet,
  duplicateSheet,
  emptyFreeLayout,
  findPlacement,
  makeCommon,
  makeLocal,
  moveSheet,
  removePlacement,
  removeSequencePlacements,
  removeSheet,
  updatePlacement,
} from "./sheets";

// Operacions sobre fulls i col·locacions (`sheets.ts`). Totes són pures: la
// disposició que reben no canvia mai.

/** Identificadors previsibles: `sh_n1`, `pl_n2`… */
const ids = (): NewLayoutId => {
  let count = 0;
  return (prefix) => `${prefix}_n${(count += 1)}`;
};

const placement = (id: string, sequenceKey: number): SequencePlacement => ({
  id,
  sequenceKey,
  x: 5,
  y: 5,
  w: 100,
  h: 50,
  columns: "auto",
});

/** Dos fulls i una comuna: la forma de la fixture 16. */
const layout = (): FreeLayout => ({
  sheets: [
    { id: "sh_1", placements: [placement("pl_1", 1)] },
    { id: "sh_2", placements: [placement("pl_2", 2), placement("pl_3", 1)] },
  ],
  common: [placement("pl_9", 0)],
});

/** Els `id` de les col·locacions de cada full, i les comunes. */
const shape = ({ sheets, common }: FreeLayout) => ({
  sheets: sheets.map(({ id, placements }) => [id, placements.map((p) => p.id)]),
  common: common.map(({ id }) => id),
});

describe("fulls", () => {
  it("un document sense res col·locat té un full buit", () => {
    expect(emptyFreeLayout(ids())).toEqual({
      sheets: [{ id: "sh_n1", placements: [] }],
      common: [],
    });
  });

  it("un full nou va just després, buit (les comunes ja hi surten)", () => {
    expect(shape(addSheet(layout(), 0, ids())).sheets).toEqual([
      ["sh_1", ["pl_1"]],
      ["sh_n1", []],
      ["sh_2", ["pl_2", "pl_3"]],
    ]);
  });

  it("duplicar fa caixes noves i independents", () => {
    const result = duplicateSheet(layout(), 1, ids());
    expect(shape(result).sheets).toEqual([
      ["sh_1", ["pl_1"]],
      ["sh_2", ["pl_2", "pl_3"]],
      ["sh_n1", ["pl_n2", "pl_n3"]],
    ]);
    const moved = updatePlacement(result, "pl_n2", (p) => ({ ...p, x: 50 }));
    expect(findPlacement(moved, "pl_2")?.placement.x).toBe(5);
  });

  it("esborrar un full en treu les caixes, però sempre en queda un", () => {
    expect(shape(removeSheet(layout(), 0, ids())).sheets).toEqual([
      ["sh_2", ["pl_2", "pl_3"]],
    ]);
    const single: FreeLayout = { ...layout(), sheets: [layout().sheets[0]] };
    expect(shape(removeSheet(single, 0, ids())).sheets).toEqual([
      ["sh_n1", []],
    ]);
  });

  it("moure un full el canvia de lloc", () => {
    expect(shape(moveSheet(layout(), 1, 0)).sheets.map(([id]) => id)).toEqual([
      "sh_2",
      "sh_1",
    ]);
    // Fora de la llista, res
    expect(moveSheet(layout(), 0, 5)).toEqual(layout());
  });
});

describe("col·locacions", () => {
  it("es troben al full o a les comunes", () => {
    expect(findPlacement(layout(), "pl_3")?.location).toBe(1);
    expect(findPlacement(layout(), "pl_9")?.location).toBe("common");
    expect(findPlacement(layout(), "no-hi-és")).toBeUndefined();
  });

  it("afegir una seqüència a un full no la treu d'enlloc", () => {
    const result = addPlacement(layout(), 0, placement("pl_nou", 2));
    expect(shape(result).sheets[0]).toEqual(["sh_1", ["pl_1", "pl_nou"]]);
    expect(findPlacement(result, "pl_2")?.location).toBe(1);
  });

  it("treure'n una treu aquella i prou", () => {
    const result = removePlacement(layout(), "pl_3");
    expect(shape(result).sheets).toEqual([
      ["sh_1", ["pl_1"]],
      ["sh_2", ["pl_2"]],
    ]);
  });

  it("copiar a una pàgina fa una caixa nova al mateix lloc", () => {
    const result = copyPlacementToSheet(layout(), "pl_1", 1, ids());
    const copy = findPlacement(result, "pl_n1");
    expect(copy?.location).toBe(1);
    expect(copy?.placement).toEqual({ ...placement("pl_1", 1), id: "pl_n1" });
  });

  it("«A totes les pàgines» la passa a les comunes, i desfer-ho la torna al full", () => {
    const common = makeCommon(layout(), "pl_2");
    expect(shape(common)).toEqual({
      sheets: [
        ["sh_1", ["pl_1"]],
        ["sh_2", ["pl_3"]],
      ],
      common: ["pl_9", "pl_2"],
    });
    const local = makeLocal(common, "pl_9", 0);
    expect(shape(local)).toEqual({
      sheets: [
        ["sh_1", ["pl_1", "pl_9"]],
        ["sh_2", ["pl_3"]],
      ],
      common: ["pl_2"],
    });
  });

  it("canviar una comuna la canvia a tots els fulls alhora", () => {
    const result = updatePlacement(layout(), "pl_9", (p) => ({ ...p, h: 20 }));
    expect(result.common[0].h).toBe(20);
  });

  it("esborrar una seqüència n'esborra totes les col·locacions", () => {
    expect(shape(removeSequencePlacements(layout(), 1))).toEqual({
      sheets: [
        ["sh_1", []],
        ["sh_2", ["pl_2"]],
      ],
      common: ["pl_9"],
    });
  });

  it("cap operació no toca la disposició que rep", () => {
    const original = layout();
    const before = JSON.stringify(original);
    const newId = ids();
    addSheet(original, 0, newId);
    duplicateSheet(original, 0, newId);
    removeSheet(original, 0, newId);
    moveSheet(original, 0, 1);
    addPlacement(original, 0, placement("x", 0));
    updatePlacement(original, "pl_1", (p) => ({ ...p, x: 0 }));
    removePlacement(original, "pl_1");
    copyPlacementToSheet(original, "pl_1", 1, newId);
    makeCommon(original, "pl_1");
    makeLocal(original, "pl_9", 0);
    removeSequencePlacements(original, 1);
    expect(JSON.stringify(original)).toBe(before);
  });
});
