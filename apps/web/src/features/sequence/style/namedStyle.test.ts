// L'estil de la seqüència a Redux (`docs/plans/PLA-estils.md`, pas 4): les
// targetes de cada seqüència es pinten amb el seu estil, i les d'un bloc
// reassignat amb el del bloc.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createAppStore } from "@app/store";
import type { DocumentSAAC } from "@/types/document";
import { parseSaac } from "@features/sequence/saac/parse";
import { parseContextOf } from "@features/sequence/saac/saacContext";
import {
  addNewSequenceActionCreator,
  changeActiveSAACActionCreator,
  deleteLastSequenceActionCreator,
  loadDocumentSaacActionCreator,
  withSequenceNamesFromExtras,
} from "@features/sequence/store/documentSlice";
import { cardNamedStyleOf, sequenceStyleOf } from "./namedStyle";
import { cardDefaultsOf, resolvePictogram } from "./pictogramStyle";
import {
  selectActiveSequenceCardDefaults,
  selectDocumentCardDefaults,
  selectDocumentStyle,
  selectSequenceCardDefaults,
} from "./styleSelectors";

const FIXTURES = path.resolve(__dirname, "../../../../test/fixtures/saac");

/** Un store amb un document de les fixtures obert. */
const storeWith = (name: string) => {
  const store = createAppStore();
  const text = fs.readFileSync(path.join(FIXTURES, name), "utf8");
  const parsed = parseSaac(text, parseContextOf(store.getState()));
  if (parsed.kind !== "document") throw new Error("no és un document");
  store.dispatch(loadDocumentSaacActionCreator(parsed.document));
  return store;
};

describe("l'estil de la seqüència a Redux", () => {
  it("el bloc fa servir el seu estil reassignat, i si no en té, el de la seqüència", () => {
    const { document } = storeWith("20-estil-de-sequencia.saac").getState();
    expect(cardNamedStyleOf(document, 0)?.id).toBe("st_vores");
    expect(cardNamedStyleOf(document, 0, "st_gran")?.id).toBe("st_gran");
    // Un reassignat que ja no hi és: el de la seqüència
    expect(cardNamedStyleOf(document, 0, "st_res")?.id).toBe("st_vores");
    expect(cardNamedStyleOf(document, 1)).toBeUndefined();
  });

  it("les targetes de cada seqüència, amb el seu estil", () => {
    const state = storeWith("20-estil-de-sequencia.saac").getState();
    const defaultsOf = selectSequenceCardDefaults(state);
    expect(defaultsOf(0).borderIn.size).toBe(0);
    expect(defaultsOf(0).borderOut.size).toBe(0);
    // Sense estil, les del document (el mateix objecte: no torna a pintar)
    expect(defaultsOf(1)).toBe(selectDocumentCardDefaults(state));
    expect(defaultsOf(2).skin).toBe("black");
    expect(defaultsOf(2).textPosition).toBe("top");

    // El retoc del pictograma es resol a sobre de l'estil de la seqüència
    const [, dormir] = state.document.content[2];
    expect(resolvePictogram(dormir, defaultsOf(2)).settings.font).toEqual({
      family: "Roboto",
      color: "#b71c1c",
      size: 1.4,
    });
    expect(
      resolvePictogram(state.document.content[2][0], defaultsOf(2)).img
        .settings.fitzgerald,
    ).toBe("#00796B");
  });

  it("l'estil de la seqüència no porta la distribució", () => {
    const state = storeWith("17-pagines-i-blocs.saac").getState();
    const { document } = state;
    const style = selectDocumentStyle(state);
    // El «Agenda gran» de la 17 porta mida: com a estil de seqüència no hi compta
    const asSequence = sequenceStyleOf(
      style,
      { ...document, sequenceStyleIds: { 0: "st_gran" } },
      0,
    );
    expect(asSequence.view).toEqual(style.view);
    expect(asSequence.pictSequence.font.size).toBe(1.2);
  });

  it("l'edició hereta l'estil de la seqüència activa", () => {
    const store = storeWith("20-estil-de-sequencia.saac");
    store.dispatch(changeActiveSAACActionCreator(2));
    const state = store.getState();
    expect(selectActiveSequenceCardDefaults(state)).toEqual(
      cardDefaultsOf(
        sequenceStyleOf(selectDocumentStyle(state), state.document, 2),
      ),
    );
    store.dispatch(changeActiveSAACActionCreator(1));
    expect(selectActiveSequenceCardDefaults(store.getState())).toEqual(
      selectDocumentCardDefaults(store.getState()),
    );
  });

  it("un document d'abans es pinta igual: totes les seqüències amb l'estil del document", () => {
    const state = storeWith("17-pagines-i-blocs.saac").getState();
    const defaultsOf = selectSequenceCardDefaults(state);
    Object.keys(state.document.content).forEach((key) =>
      expect(defaultsOf(Number(key))).toBe(selectDocumentCardDefaults(state)),
    );
  });

  it("treure l'última seqüència n'esborra el nom i l'estil, i una de nova no en té", () => {
    const store = storeWith("20-estil-de-sequencia.saac");
    store.dispatch(deleteLastSequenceActionCreator());
    expect(store.getState().document.sequenceNames).toEqual({ 0: "Matí" });
    expect(store.getState().document.sequenceStyleIds).toEqual({
      0: "st_vores",
    });
    store.dispatch(addNewSequenceActionCreator(2));
    expect(store.getState().document.sequenceNames?.[2]).toBeUndefined();
    expect(store.getState().document.sequenceStyleIds?.[2]).toBeUndefined();
  });

  it("un esborrany d'abans porta el nom entre els camps desconeguts", () => {
    const draft = {
      content: { 0: [], 1: [] },
      saacExtra: {
        sequences: { 0: { title: "Matí", color: "verd" }, 1: { title: "Nit" } },
      },
    } as unknown as DocumentSAAC;
    const document = withSequenceNamesFromExtras(draft);
    expect(document.sequenceNames).toEqual({ 0: "Matí", 1: "Nit" });
    expect(document.saacExtra?.sequences).toEqual({ 0: { color: "verd" } });
    // Un document d'ara no canvia
    expect(withSequenceNamesFromExtras(document)).toBe(document);
  });
});
