import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { configureStore } from "@reduxjs/toolkit";
import {
  addPictogramActionCreator,
  documentReducer,
  selectDocumentToSave,
} from "@features/sequence/store/documentSlice";
import { documentStatusReducer } from "@features/sequence/store/documentStatusSlice";
import { styleReducer } from "@features/sequence/store/styleSlice";
import { uiReducer } from "@features/user-settings/store/uiSlice";
import type { DocumentSAAC } from "@/types/document";
import { parseSaacValue } from "./parse";
import { parseContextOf } from "./saacContext";

// El núvol conserva la forma de l'API (`documentState` compactat); el front
// converteix en llegir i en desar (ADR-003, decisió 11). Els comptes estan
// apagats: la conversió es prova aquí, sense servidor.

const FIXTURES = path.resolve(__dirname, "../../../../test/fixtures/saac");
const documentStateOf = (name: string): DocumentSAAC =>
  JSON.parse(fs.readFileSync(path.join(FIXTURES, name), "utf8")).documentState;

const makeStore = () =>
  configureStore({
    reducer: {
      document: documentReducer,
      documentStatus: documentStatusReducer,
      ui: uiReducer,
      style: styleReducer,
    },
  });

describe("llegir del núvol", () => {
  it("un document de l'API es migra en llegir-lo, amb el seu id", () => {
    const store = makeStore();
    // Tal com el retorna l'API: el `documentState`, sense res al costat
    const fromApi = documentStateOf("02-diverses-pestanyes.saac");
    const parsed = parseSaacValue(
      { documentState: fromApi },
      parseContextOf(store.getState()),
    );
    if (parsed.kind !== "document") throw new Error(parsed.kind);

    expect(parsed.document.id).toBe(fromApi.id);
    expect(parsed.document.title).toBe(fromApi.title);
    // La seqüència buida es descarta, com en un fitxer
    expect(Object.keys(parsed.document.content)).toHaveLength(3);
    // No toca les preferències de qui l'obre
    expect(store.getState().ui).toEqual(makeStore().getState().ui);
  });

  it("les imatges de Cloudinary queden referenciades per URL, sense descarregar-les", () => {
    const store = makeStore();
    const parsed = parseSaacValue(
      { documentState: documentStateOf("03-fonts-personalitzades.saac") },
      parseContextOf(store.getState()),
    );
    if (parsed.kind !== "document") throw new Error(parsed.kind);

    const cloud = Object.values(parsed.file.assets ?? {}).filter(
      (asset) => asset.url,
    );
    expect(cloud).toHaveLength(1);
    expect(cloud[0].url).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    expect(cloud[0].data).toBeUndefined();
  });
});

describe("desar al núvol", () => {
  it("s'envia la forma de l'API, amb l'estil i la pàgina que el document heretava", () => {
    const store = makeStore();
    store.dispatch(
      addPictogramActionCreator({
        indexSequence: 0,
        img: {
          searched: { word: "menjar", bestIdPicts: [6456] },
          selectedId: 6456,
          settings: { fitzgerald: "#4CAf50", color: true },
          category: "verb",
        },
        cross: false,
        settings: { textPosition: "bottom" },
      }),
    );

    const payload = selectDocumentToSave(store.getState());
    const { viewSettings } = store.getState().ui;

    expect(payload.content[0]).toHaveLength(1);
    expect(payload.defaultSettings).toBeDefined();
    expect(payload.styleView).toBeDefined();
    expect(payload.layout).toEqual({
      pageSize: viewSettings.pageSize,
      orientation: viewSettings.orientation,
      direction: viewSettings.direction,
    });
    // Res del format v3 (format, sequences, assets): el núvol no el coneix
    expect(payload).not.toHaveProperty("sequences");
    expect(payload).not.toHaveProperty("format");
  });
});
