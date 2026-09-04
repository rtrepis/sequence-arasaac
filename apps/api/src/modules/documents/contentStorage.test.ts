// Tests de la compactació del contingut abans de desar-lo
//
// El que han de garantir és una cosa per damunt de tot: que compactar i tornar a
// expandir doni exactament el mateix. Si això no es compleix, el que se'n va és
// contingut d'usuari, i un document desat abans d'aquest canvi ha de continuar
// llegint-se igual.

import { describe, it, expect } from "vitest";
import {
  MAX_STORED_BEST_ID_PICTS,
  compactContent,
  expandContent,
  type CompactableContent,
} from "./contentStorage";

const font = (color = "#000000") => ({ family: "Arial", color, size: 1 });
const border = (size = 2) => ({ color: "fitzgerald", radius: 20, size });

const defaults = {
  numbered: true,
  textPosition: "bottom",
  font: font(),
  numberFont: font(),
  borderOut: border(),
  borderIn: border(),
};

// Pictograma amb tots els ajustos explícits i iguals als del document, que és
// com els escriu useSearchPictogram en crear-lo
const pict = (bestIdPicts = [1, 2, 3]) => ({
  indexSequence: 0,
  text: "esmorzar",
  cross: false,
  img: {
    searched: { word: "esmorzar", bestIdPicts },
    selectedId: 26527,
    settings: { skin: "white", hair: "brown", color: true },
  },
  settings: {
    numbered: true,
    textPosition: "bottom",
    font: font(),
    numberFont: font(),
    fontSize: 1,
    fontFamily: "Arial",
    borderOut: border(),
    borderIn: border(),
  },
});

const content = (...picts: ReturnType<typeof pict>[]): CompactableContent =>
  ({ "0": picts }) as unknown as CompactableContent;

describe("anada i tornada", () => {
  it("expandir desfà exactament el que compactar ha tret", () => {
    const original = structuredClone(content(pict()));
    const working = structuredClone(original);

    compactContent(working, defaults);
    expandContent(working, defaults);

    expect(working).toEqual(original);
  });

  it("compactar treu de debò els ajustos que repeteixen els del document", () => {
    const working = content(pict());
    compactContent(working, defaults);

    const stored = (working as Record<string, ReturnType<typeof pict>[]>)["0"][0];
    expect(stored.settings).not.toHaveProperty("font");
    expect(stored.settings).not.toHaveProperty("numberFont");
    expect(stored.settings).not.toHaveProperty("borderOut");
    expect(stored.settings).not.toHaveProperty("borderIn");
    expect(stored.settings).not.toHaveProperty("numbered");
  });

  // textPosition es llegeix al PictogramCard sense cap fallback: si desaparegués,
  // el pictograma es dibuixaria sense text
  it("no toca mai textPosition, fontSize ni fontFamily", () => {
    const working = content(pict());
    compactContent(working, defaults);

    const stored = (working as Record<string, ReturnType<typeof pict>[]>)["0"][0];
    expect(stored.settings.textPosition).toBe("bottom");
    expect(stored.settings.fontSize).toBe(1);
    expect(stored.settings.fontFamily).toBe("Arial");
  });
});

describe("el que difereix del document es conserva", () => {
  it("manté un ajust amb un valor propi", () => {
    const custom = pict();
    custom.settings.font = font("#FF0000");
    custom.settings.borderIn = border(9);
    custom.settings.numbered = false;

    const working = content(custom);
    compactContent(working, defaults);
    expandContent(working, defaults);

    const result = (working as Record<string, ReturnType<typeof pict>[]>)["0"][0];
    expect(result.settings.font).toEqual(font("#FF0000"));
    expect(result.settings.borderIn).toEqual(border(9));
    expect(result.settings.numbered).toBe(false);
  });

  // La comparació és camp a camp, no per JSON.stringify: el mateix valor pot
  // arribar amb les claus en un altre ordre segons d'on vingui
  it("reconeix un valor igual encara que les claus vinguin en un altre ordre", () => {
    const reordered = pict();
    reordered.settings.font = { size: 1, color: "#000000", family: "Arial" };

    const working = content(reordered);
    compactContent(working, defaults);

    const stored = (working as Record<string, ReturnType<typeof pict>[]>)["0"][0];
    expect(stored.settings).not.toHaveProperty("font");
  });
});

describe("documents desats abans d'aquest canvi", () => {
  it("expandir no altera un document que ja porta tots els ajustos", () => {
    const legacy = structuredClone(content(pict()));
    const working = structuredClone(legacy);

    expandContent(working, defaults);

    expect(working).toEqual(legacy);
  });

  // Els documents antics poden no portar defaultSettings: sense valors amb què
  // comparar, ometre un ajust voldria dir perdre'l
  it("sense defaultSettings no toca cap ajust", () => {
    const original = structuredClone(content(pict()));
    const working = structuredClone(original);

    compactContent(working, undefined);
    expandContent(working, undefined);

    expect(working).toEqual(original);
  });
});

describe("resultats de cerca", () => {
  it("es retallen conservant els primers", () => {
    const many = Array.from({ length: 80 }, (_, i) => 1000 + i);
    const working = content(pict(many));
    compactContent(working, defaults);

    const stored = (working as Record<string, ReturnType<typeof pict>[]>)["0"][0];
    expect(stored.img.searched.bestIdPicts).toHaveLength(MAX_STORED_BEST_ID_PICTS);
    expect(stored.img.searched.bestIdPicts[0]).toBe(1000);
  });

  // L'única cosa d'aquest mòdul que no torna: el retall és a propòsit, i el que
  // es perd es recupera amb el botó d'ampliar la cerca del selector
  it("el retall no es desfà en expandir", () => {
    const many = Array.from({ length: 40 }, (_, i) => 1000 + i);
    const working = content(pict(many));

    compactContent(working, defaults);
    expandContent(working, defaults);

    const stored = (working as Record<string, ReturnType<typeof pict>[]>)["0"][0];
    expect(stored.img.searched.bestIdPicts).toHaveLength(MAX_STORED_BEST_ID_PICTS);
  });

  it("es deixen igual si ja en caben", () => {
    const working = content(pict([7, 8, 9]));
    compactContent(working, defaults);

    const stored = (working as Record<string, ReturnType<typeof pict>[]>)["0"][0];
    expect(stored.img.searched.bestIdPicts).toEqual([7, 8, 9]);
  });

  // -1 és «no trobat» i 0 és «sense resultats»: els llegeix PictogramSearch per
  // decidir si ensenya l'avís i el botó d'ampliar la cerca
  it("conserva els valors sentinella", () => {
    for (const sentinel of [[-1], [0]]) {
      const working = content(pict(sentinel));
      compactContent(working, defaults);
      const stored = (working as Record<string, ReturnType<typeof pict>[]>)["0"][0];
      expect(stored.img.searched.bestIdPicts).toEqual(sentinel);
    }
  });
});

describe("expansió sense referències compartides", () => {
  // Assignar l'objecte del defaultSettings tal qual faria que tots els
  // pictogrames d'un document apuntessin al mateix, i tocar-ne un els canviaria
  // tots. Avui la resposta se serialitza tot seguit i no es notaria.
  it("cada pictograma rep la seva còpia dels valors del document", () => {
    const working = content(pict(), pict());
    compactContent(working, defaults);
    expandContent(working, defaults);

    const picts = (working as Record<string, ReturnType<typeof pict>[]>)["0"];
    expect(picts[0].settings.font).not.toBe(defaults.font);
    expect(picts[0].settings.font).not.toBe(picts[1].settings.font);
    expect(picts[0].settings.borderIn).not.toBe(picts[1].settings.borderIn);
  });
});
