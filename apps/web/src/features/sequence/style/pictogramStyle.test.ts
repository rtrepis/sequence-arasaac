// La solució A del pla dels estils (`docs/plans/PLA-estils.md`, §3.4): un
// pictograma guarda només els seus retocs, i la resta l'hereta. I D1: un
// document nou neix amb una còpia del meu estil i no el segueix.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createAppStore } from "@app/store";
import type { DocumentSAAC, SequenceStyle } from "@/types/document";
import type { PictSequence } from "@/types/sequence";
import {
  addPictogramActionCreator,
  adoptMyStyleThunk,
  restoreDraftDocumentThunk,
} from "@features/sequence/store/documentSlice";
import { changeDocumentStyleThunk } from "@features/sequence/store/styleSlice";
import { updateDefaultSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { documentToV3, serializeSaac } from "@features/sequence/saac/serialize";
import { parseSaac } from "@features/sequence/saac/parse";
import {
  parseContextOf,
  serializeContextOf,
} from "@features/sequence/saac/saacContext";
import { DEFAULT_FITZGERALD_CATEGORY_COLORS } from "@features/sequence/saac/fitzgerald";
import useNewPictogram from "@features/pictogram/hooks/useNewPictogram";
import {
  selectDocumentCardDefaults,
  selectDocumentStyle,
} from "./styleSelectors";
import {
  cardDefaultsOf,
  documentFromLegacyPictograms,
  documentToLegacyPictograms,
  isPictogramCustomized,
  pictogramFromLegacy,
  resolvePictogram,
} from "./pictogramStyle";

const makeStore = () => createAppStore();
type TestStore = ReturnType<typeof makeStore>;

/** Un document nou, ja nascut: amb la còpia del meu estil (D1). */
const newDocumentStore = (): TestStore => {
  const store = makeStore();
  store.dispatch(adoptMyStyleThunk("El meu estil"));
  return store;
};

/** Un pictograma d'ARASAAC del verb «menjar», sense cap retoc. */
const plainPictogram = (
  index = 0,
  settings: PictSequence["settings"] = {},
  img: PictSequence["img"]["settings"] = {},
): PictSequence => ({
  indexSequence: index,
  img: {
    searched: { word: "menjar", bestIdPicts: [6456] },
    selectedId: 6456,
    settings: img,
    variants: ["skin", "hair", "color"],
    category: "verb",
  },
  cross: false,
  settings,
});

const savedFile = (store: TestStore) =>
  documentToV3(store.getState().document, {
    ...serializeContextOf(store.getState()),
    now: "2026-11-21T10:00:00.000Z",
  });

const reopen = (store: TestStore, text: string): DocumentSAAC => {
  const parsed = parseSaac(text, parseContextOf(store.getState()));
  if (parsed.kind !== "document") throw new Error("no és un document");
  return parsed.document;
};

describe("crear un pictograma", () => {
  it("no hi escriu cap estil", () => {
    const { getPictogramEmptyWithDefaultSettings } = useNewPictogram();
    const pict = getPictogramEmptyWithDefaultSettings(0);
    expect(pict.settings).toEqual({});
    expect(pict.img.settings).toEqual({});
    expect(isPictogramCustomized(pict)).toBe(false);
  });
});

describe("D1: el document nou no segueix el meu estil", () => {
  it("neix amb una còpia del meu estil, amb el nom", () => {
    const store = newDocumentStore();
    const { document, ui } = store.getState();
    expect(document.defaultSettings).toEqual(ui.defaultSettings);
    expect(document.styleName).toBe("El meu estil");
    // I el nom va al fitxer
    expect(savedFile(store).style.name).toBe("El meu estil");
  });

  it("si ja té estil, no el toca", () => {
    const store = newDocumentStore();
    const before = store.getState().document;
    store.dispatch(adoptMyStyleThunk("Un altre nom"));
    expect(store.getState().document).toBe(before);
  });

  it("E1: canviar el meu estil no canvia el document ni encén cap marca", () => {
    const store = newDocumentStore();
    store.dispatch(addPictogramActionCreator(plainPictogram()));
    const before = selectDocumentCardDefaults(store.getState());
    const mine = store.getState().ui.defaultSettings;

    store.dispatch(
      updateDefaultSettingsActionCreator({
        ...mine,
        pictSequence: { ...mine.pictSequence, textPosition: "top" },
        pictApiAra: { ...mine.pictApiAra, skin: "black" },
      }),
    );

    expect(selectDocumentCardDefaults(store.getState())).toEqual(before);
    const [pict] = store.getState().document.content[0];
    expect(isPictogramCustomized(pict)).toBe(false);
  });
});

describe("la targeta hereta el que no retoca", () => {
  it("canviar l'estil del document canvia la targeta sencera i no hi posa la marca", () => {
    const store = newDocumentStore();
    store.dispatch(addPictogramActionCreator(plainPictogram()));
    const style = selectDocumentStyle(store.getState());
    const other: SequenceStyle = {
      ...style,
      pictSequence: {
        ...style.pictSequence,
        textPosition: "top",
        borderOut: { color: "#000000", radius: 0, size: 6 },
      },
      pictApiAra: { ...style.pictApiAra, skin: "asian", color: false },
    };

    store.dispatch(changeDocumentStyleThunk(other, "fitTextDocument"));

    const [pict] = store.getState().document.content[0];
    const card = resolvePictogram(
      pict,
      selectDocumentCardDefaults(store.getState()),
    );
    expect(card.settings.textPosition).toBe("top");
    expect(card.settings.borderOut).toEqual(other.pictSequence.borderOut);
    expect(card.img.settings).toMatchObject({ skin: "asian", color: false });
    expect(isPictogramCustomized(pict)).toBe(false);
  });

  it("la pell, el cabell i el color, només si el pictograma els admet", () => {
    const pict: PictSequence = {
      ...plainPictogram(),
      img: { ...plainPictogram().img, variants: ["color"] },
    };
    const { settings } = resolvePictogram(
      pict,
      cardDefaultsOf(selectDocumentStyle(newDocumentStore().getState())),
    ).img;
    expect(settings).not.toHaveProperty("skin");
    expect(settings).not.toHaveProperty("hair");
    expect(settings).toHaveProperty("color");
  });
});

describe("desar", () => {
  it("un document sense retocs no escriu cap estil de pictograma", () => {
    const store = newDocumentStore();
    store.dispatch(addPictogramActionCreator(plainPictogram(0)));
    store.dispatch(addPictogramActionCreator(plainPictogram(1)));
    savedFile(store).sequences[0].pictograms.forEach((pict) =>
      expect(pict).not.toHaveProperty("style"),
    );
  });

  it("E3: «sense text» es desa explícit i es torna a obrir sense text", () => {
    const store = newDocumentStore();
    // L'estil del document té text; aquest pictograma no
    expect(
      selectDocumentStyle(store.getState()).pictSequence.textPosition,
    ).not.toBe("none");
    store.dispatch(
      addPictogramActionCreator(plainPictogram(0, { textPosition: "none" })),
    );
    store.dispatch(addPictogramActionCreator(plainPictogram(1)));

    const file = savedFile(store);
    expect(file.sequences[0].pictograms[0].style?.card?.textPosition).toBe(
      "none",
    );
    expect(file.sequences[0].pictograms[1]).not.toHaveProperty("style");

    const reopened = reopen(store, serializeSaac(file));
    const [silent, plain] = reopened.content[0];
    expect(silent.settings.textPosition).toBe("none");
    // L'altre hereta: si l'estil canvia la posició, el segueix
    expect(plain.settings.textPosition).toBeUndefined();
    const top = {
      ...cardDefaultsOf(selectDocumentStyle(store.getState())),
      textPosition: "top" as const,
    };
    expect(resolvePictogram(plain, top).settings.textPosition).toBe("top");
    expect(resolvePictogram(silent, top).settings.textPosition).toBe("none");
  });

  it("Fitzgerald: sense retoc, el color de la categoria de l'estil; amb un de triat, aquell", () => {
    const style = selectDocumentStyle(newDocumentStore().getState());
    const colors = {
      ...DEFAULT_FITZGERALD_CATEGORY_COLORS,
      verb: "#123456",
    };
    const defaults = cardDefaultsOf({ ...style, fitzgeraldColors: colors });
    expect(
      resolvePictogram(plainPictogram(), defaults).img.settings.fitzgerald,
    ).toBe("#123456");
    const chosen = plainPictogram(0, {}, { fitzgerald: "#ff00ff" });
    expect(resolvePictogram(chosen, defaults).img.settings.fitzgerald).toBe(
      "#ff00ff",
    );
    expect(isPictogramCustomized(chosen)).toBe(true);
  });
});

describe("la forma d'abans (esborranys, núvol, fitxers antics)", () => {
  /** Un pictograma com els desava l'app abans: l'estil copiat a dins. */
  const copied = (style: SequenceStyle): PictSequence => ({
    ...plainPictogram(),
    img: {
      searched: { word: "menjar", bestIdPicts: [6456] },
      selectedId: 6456,
      settings: {
        skin: style.pictApiAra.skin,
        hair: style.pictApiAra.hair,
        color: style.pictApiAra.color,
        fitzgerald: DEFAULT_FITZGERALD_CATEGORY_COLORS.verb,
      },
      category: "verb",
    },
    settings: {
      textPosition: style.pictSequence.textPosition,
      borderIn: style.pictSequence.borderIn,
      borderOut: style.pictSequence.borderOut,
    },
  });

  it("un esborrany vell es llegeix sense marques falses, una sola vegada", () => {
    const store = makeStore();
    const style = selectDocumentStyle(store.getState());
    const legacy: DocumentSAAC = {
      ...store.getState().document,
      content: {
        0: [
          copied(style),
          // Un de retocat de debò, i un sense posició (que no pintava text)
          {
            ...copied(style),
            settings: { ...copied(style).settings, textPosition: "top" },
          },
          { ...copied(style), settings: {} },
        ],
      },
    };

    store.dispatch(
      restoreDraftDocumentThunk({ document: legacy, retouchesOnly: false }),
    );

    const [plain, top, silent] = store.getState().document.content[0];
    expect(isPictogramCustomized(plain)).toBe(false);
    expect(plain.img.variants).toEqual(["skin", "hair", "color"]);
    expect(top.settings).toEqual({ textPosition: "top" });
    expect(silent.settings).toEqual({ textPosition: "none" });

    // Un esborrany que ja té la forma d'ara no es torna a convertir
    const current = store.getState().document;
    store.dispatch(
      restoreDraftDocumentThunk({ document: current, retouchesOnly: true }),
    );
    expect(store.getState().document).toBe(current);
  });

  it("el núvol: d'anada, valors resolts; de tornada, els mateixos retocs", () => {
    const store = newDocumentStore();
    const style = selectDocumentStyle(store.getState());
    const doc: DocumentSAAC = {
      ...store.getState().document,
      content: {
        0: [
          plainPictogram(0),
          plainPictogram(1, { textPosition: "none" }, { skin: "asian" }),
        ],
      },
    };

    const toCloud = documentToLegacyPictograms(doc, style);
    const [plain] = toCloud.content[0];
    expect(plain.settings.textPosition).toBe(style.pictSequence.textPosition);
    expect(plain.img.settings.skin).toBe(style.pictApiAra.skin);
    expect(plain.img).not.toHaveProperty("variants");

    expect(documentFromLegacyPictograms(toCloud, style).content).toEqual(
      doc.content,
    );
  });

  it("un retoc igual a l'estil no és un retoc", () => {
    const store = makeStore();
    const style = selectDocumentStyle(store.getState());
    expect(
      isPictogramCustomized(
        pictogramFromLegacy(copied(style), cardDefaultsOf(style)),
      ),
    ).toBe(false);
  });
});

describe("les fixtures v3 fan el viatge d'anada i tornada iguals", () => {
  const FIXTURES = path.resolve(__dirname, "../../../../test/fixtures/saac");
  // La 15 està escrita a mà, sense `variants` ni `alternatives`: l'app els
  // escriu explícits (com abans de la solució A). D'aquesta, només els retocs
  const V3_FIXTURES = [
    "16-mode-lliure.saac",
    "17-pagines-i-blocs.saac",
    "18-pantalla-sencera.saac",
    "19-demostracio-noticies.saac",
  ];

  const roundTrip = (name: string) => {
    const text = fs.readFileSync(path.join(FIXTURES, name), "utf8");
    const store = makeStore();
    const document = reopen(store, text);
    return {
      original: JSON.parse(text),
      again: documentToV3(document, serializeContextOf(store.getState())),
    };
  };

  it.each(V3_FIXTURES)("%s: els pictogrames i l'estil, idèntics", (name) => {
    const { original, again } = roundTrip(name);
    expect(again.style).toEqual(original.style);
    expect(again.sequences).toEqual(original.sequences);
  });

  it("15-paper-carta.saac: els mateixos retocs", () => {
    const { original, again } = roundTrip("15-paper-carta.saac");
    expect(again.style).toEqual(original.style);
    const stylesOf = (file: {
      sequences: { pictograms: { style?: unknown }[] }[];
    }) =>
      file.sequences.map((sequence) =>
        sequence.pictograms.map((pict) => pict.style),
      );
    expect(stylesOf(again)).toEqual(stylesOf(original));
  });
});
