// L'estil i el nom de la seqüència a l'edició (`docs/plans/PLA-estils.md`, pas 5;
// proves de §10.5): triar un estil a la Galeria d'estils, el snackbar de D3 i
// D15, desfer-ho, «Treu els retocs», canviar el nom i treure la seqüència
// oberta.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createAppStore } from "@app/store";
import { parseSaac } from "@features/sequence/saac/parse";
import { parseContextOf } from "@features/sequence/saac/saacContext";
import {
  buildStyleFileV3,
  documentToV3,
  serializeSaac,
} from "@features/sequence/saac/serialize";
import { serializeContextOf } from "@features/sequence/saac/saacContext";
import { cardNamedStyleOf } from "@features/sequence/style/namedStyle";
import { isPictogramCustomized } from "@features/sequence/style/pictogramStyle";
import {
  selectDocumentStyle,
  selectUserDefaultStyle,
} from "@features/sequence/style/styleSelectors";
import {
  changeActiveSAACActionCreator,
  loadDocumentSaacActionCreator,
  removeSequenceActionCreator,
  sequenceRenamedActionCreator,
} from "./documentSlice";
import {
  chooseSequenceStyleThunk,
  removeSequenceRetouchesThunk,
} from "./sequenceStyleThunks";
import { selectCanUndoStyle, undoStyleChangeThunk } from "./styleSlice";

const FIXTURES = path.resolve(__dirname, "../../../../test/fixtures/saac");

/**
 * La fixture 20: «Matí» (0) amb «Sense vores» i dos blocs, un reassignat a
 * «Agenda gran» i l'altre no; un pictograma retocat. «Tarda» (1) sense estil i
 * «Nit» (2) amb «Agenda gran».
 */
const storeWith20 = () => {
  const store = createAppStore();
  const text = fs.readFileSync(
    path.join(FIXTURES, "20-estil-de-sequencia.saac"),
    "utf8",
  );
  const parsed = parseSaac(text, parseContextOf(store.getState()));
  if (parsed.kind !== "document") throw new Error("no és un document");
  store.dispatch(loadDocumentSaacActionCreator(parsed.document));
  return store;
};

const MY_STYLE = "El meu estil";

describe("triar l'estil d'una seqüència", () => {
  it("canvia tots els blocs de la seqüència llevat dels reassignats (D15)", () => {
    const store = storeWith20();
    const myStyle = selectUserDefaultStyle(store.getState());
    store.dispatch(
      chooseSequenceStyleThunk(0, { name: MY_STYLE, style: myStyle }),
    );
    const { document } = store.getState();
    const styleId = document.sequenceStyleIds?.[0];
    expect(styleId).toBeDefined();
    // El bloc sense reassignar, amb l'estil nou; el reassignat, amb el seu
    expect(cardNamedStyleOf(document, 0)?.name).toBe(MY_STYLE);
    expect(cardNamedStyleOf(document, 0, "st_gran")?.id).toBe("st_gran");
    // L'estil vell ja no el fa servir ningú: no hi queda orfe
    expect(document.styles?.map(({ id }) => id)).not.toContain("st_vores");
    // Les altres seqüències, igual
    expect(document.sequenceStyleIds?.[2]).toBe("st_gran");
  });

  it("el snackbar diu l'estil, els retocs i els blocs que no han canviat (D3)", () => {
    const store = storeWith20();
    store.dispatch(
      chooseSequenceStyleThunk(0, {
        name: MY_STYLE,
        style: selectUserDefaultStyle(store.getState()),
      }),
    );
    expect(store.getState().style.undoSnackbar).toMatchObject({
      source: "sequenceStyle",
      details: {
        sequenceKey: 0,
        styleName: MY_STYLE,
        toDocument: false,
        retouched: 1,
        unchangedBlocks: 1,
      },
    });
  });

  it("«L'estil del document» treu l'estil de la seqüència", () => {
    const store = storeWith20();
    store.dispatch(chooseSequenceStyleThunk(2, { name: "El meu estil" }));
    const { document, style } = store.getState();
    expect(document.sequenceStyleIds?.[2]).toBeUndefined();
    // «Agenda gran» encara el fa servir un bloc: no surt del document
    expect(document.styles?.map(({ id }) => id)).toContain("st_gran");
    expect(style.undoSnackbar?.details?.toDocument).toBe(true);
  });

  it("el mateix estil dues vegades no en fa dues còpies", () => {
    const store = storeWith20();
    const myStyle = selectUserDefaultStyle(store.getState());
    store.dispatch(
      chooseSequenceStyleThunk(0, { name: MY_STYLE, style: myStyle }),
    );
    store.dispatch(
      chooseSequenceStyleThunk(1, { name: MY_STYLE, style: myStyle }),
    );
    const { document } = store.getState();
    expect(document.sequenceStyleIds?.[0]).toBe(document.sequenceStyleIds?.[1]);
    expect(
      document.styles?.filter(({ name }) => name.startsWith(MY_STYLE)),
    ).toHaveLength(1);
  });

  it("Desfés ho torna tot", () => {
    const store = storeWith20();
    const before = store.getState().document;
    store.dispatch(
      chooseSequenceStyleThunk(0, {
        name: MY_STYLE,
        style: selectUserDefaultStyle(store.getState()),
      }),
    );
    expect(selectCanUndoStyle(store.getState())).toBe(true);
    store.dispatch(undoStyleChangeThunk());
    expect(store.getState().document).toEqual(before);
  });

  it("«Treu els retocs» els treu, i Desfés torna també l'estil d'abans", () => {
    const store = storeWith20();
    const before = store.getState().document;
    store.dispatch(
      chooseSequenceStyleThunk(0, {
        name: MY_STYLE,
        style: selectUserDefaultStyle(store.getState()),
      }),
    );
    store.dispatch(removeSequenceRetouchesThunk(0));
    const { document, style } = store.getState();
    expect(document.content[0].some(isPictogramCustomized)).toBe(false);
    expect(style.undoSnackbar?.source).toBe("sequenceRetouchesRemoved");
    store.dispatch(undoStyleChangeThunk());
    expect(store.getState().document).toEqual(before);
  });

  it("l'estil triat es desa al fitxer i es torna a llegir igual", () => {
    const store = storeWith20();
    store.dispatch(
      chooseSequenceStyleThunk(1, {
        name: MY_STYLE,
        style: selectUserDefaultStyle(store.getState()),
      }),
    );
    const state = store.getState();
    const file = documentToV3(state.document, serializeContextOf(state));
    const tarda = file.sequences[1];
    expect(tarda.namedStyle).toBe(state.document.sequenceStyleIds?.[1]);
    expect(file.styles?.find(({ id }) => id === tarda.namedStyle)?.name).toBe(
      MY_STYLE,
    );
  });
});

describe("el nom de la seqüència", () => {
  it("es canvia, i buit torna a «Seqüència N»", () => {
    const store = storeWith20();
    store.dispatch(sequenceRenamedActionCreator({ key: 1, name: "  Tarda " }));
    expect(store.getState().document.sequenceNames?.[1]).toBe("Tarda");
    store.dispatch(sequenceRenamedActionCreator({ key: 0, name: " " }));
    expect(store.getState().document.sequenceNames?.[0]).toBeUndefined();
  });

  it("canviar-lo després de triar un estil fa que ja no es pugui desfer", () => {
    const store = storeWith20();
    store.dispatch(chooseSequenceStyleThunk(1, { name: MY_STYLE }));
    expect(selectCanUndoStyle(store.getState())).toBe(true);
    store.dispatch(sequenceRenamedActionCreator({ key: 1, name: "Tarda" }));
    expect(selectCanUndoStyle(store.getState())).toBe(false);
  });
});

describe("treure la seqüència oberta (D21)", () => {
  it("treu la del mig, i les de després baixen una clau amb tot el que és seu", () => {
    const store = storeWith20();
    const before = store.getState().document;
    store.dispatch(removeSequenceActionCreator(1));
    const { document } = store.getState();
    expect(Object.keys(document.content)).toEqual(["0", "1"]);
    expect(document.content[1]).toBe(before.content[2]);
    expect(document.sequenceNames).toEqual({ 0: "Matí", 1: "Nit" });
    expect(document.sequenceStyleIds).toEqual({ 0: "st_vores", 1: "st_gran" });
    expect(document.sequenceIds).toEqual({
      0: before.sequenceIds?.[0],
      1: before.sequenceIds?.[2],
    });
    // El bloc de la «Tarda» se'n va; el de la «Nit» apunta a la clau nova
    const autoSheet = document.pages?.sheets[1];
    expect(
      autoSheet?.placements.map((placement) =>
        placement.kind === "sequence" ? placement.sequenceKey : null,
      ),
    ).toEqual([1]);
  });

  it("la seqüència oberta passa a ser la que n'ocupa el lloc", () => {
    const store = storeWith20();
    store.dispatch(changeActiveSAACActionCreator(2));
    store.dispatch(removeSequenceActionCreator(2));
    expect(store.getState().document.activeSAAC).toBe(1);
    store.dispatch(removeSequenceActionCreator(0));
    expect(store.getState().document.activeSAAC).toBe(0);
    // L'única que queda no es pot treure
    store.dispatch(removeSequenceActionCreator(0));
    expect(Object.keys(store.getState().document.content)).toEqual(["0"]);
  });

  it("el document que queda es desa i es torna a obrir igual", () => {
    const store = storeWith20();
    store.dispatch(removeSequenceActionCreator(0));
    const state = store.getState();
    const text = serializeSaac(
      documentToV3(state.document, serializeContextOf(state)),
    );
    const parsed = parseSaac(text, parseContextOf(state));
    if (parsed.kind !== "document") throw new Error("no és un document");
    expect(parsed.document.sequenceNames).toEqual({ 1: "Nit" });
    expect(parsed.document.sequenceStyleIds).toEqual({ 1: "st_gran" });
  });
});

describe("«Desa en un fitxer» de la galeria (D18)", () => {
  it("fa un `.saacstyle` vàlid amb el nom de l'estil", () => {
    const store = storeWith20();
    const style = selectDocumentStyle(store.getState());
    const text = serializeSaac(buildStyleFileV3(style, "El meu estil"));
    const parsed = parseSaac(text, parseContextOf(store.getState()));
    expect(parsed.kind).toBe("style");
    if (parsed.kind !== "style") return;
    expect(parsed.title).toBe("El meu estil");
    expect(parsed.style.pictSequence).toEqual(style.pictSequence);
  });
});
