import { describe, expect, it } from "vitest";
import { createAppStore } from "@app/store";
import {
  addPictogramActionCreator,
  documentAuthorChangedActionCreator,
  documentStyleMaterializedActionCreator,
  loadDocumentSaacActionCreator,
  selectDocumentToSave,
} from "./documentSlice";
import { viewSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { selectDocumentStyle } from "@features/sequence/style/styleSelectors";
import { documentToV3 } from "@features/sequence/saac/serialize";
import { parseSaacValue } from "@features/sequence/saac/parse";
import {
  parseContextOf,
  serializeContextOf,
} from "@features/sequence/saac/saacContext";
import type { PictSequence } from "@/types/sequence";

// L'autor és del document (B21): el seu, o el de les preferències mentre un
// document nou no en té cap. Les preferències només canvien quan l'usuari les
// desa, i un fitxer sense autor no hereta el de qui l'obre.

const makeStore = () => createAppStore();
type TestStore = ReturnType<typeof makeStore>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const state = (store: TestStore) => store.getState() as any;

const pict: PictSequence = {
  indexSequence: 0,
  img: {
    searched: { word: "casa", bestIdPicts: [1] },
    selectedId: 1,
    settings: { fitzgerald: "#ff0000" },
  },
  cross: false,
  settings: { textPosition: "bottom" },
};

const withUserAuthor = (store: TestStore, author: string) =>
  store.dispatch(
    viewSettingsActionCreator({ ...state(store).ui.viewSettings, author }),
  );

const savedAuthor = (store: TestStore) =>
  documentToV3(state(store).document, serializeContextOf(state(store))).meta
    .author;

describe("autor del document", () => {
  it("un document nou hereta l'autor de les preferències, i en desar-lo s'hi escriu", () => {
    const store = makeStore();
    withUserAuthor(store, "Rosa");
    store.dispatch(addPictogramActionCreator(pict));

    expect(state(store).document.author).toBeUndefined();
    expect(selectDocumentToSave(state(store)).author).toBe("Rosa");
    expect(savedAuthor(store)).toBe("Rosa");
  });

  it("canviar-lo és un canvi del document, i no toca les preferències", () => {
    const store = makeStore();
    withUserAuthor(store, "Rosa");
    // Un document sense cap canvi encara
    expect(state(store).documentStatus.changedAt).toBeFalsy();

    store.dispatch(documentAuthorChangedActionCreator("Jordi"));

    expect(state(store).document.author).toBe("Jordi");
    expect(state(store).ui.viewSettings.author).toBe("Rosa");
    expect(state(store).documentStatus.changedAt).toBeTruthy();
    expect(savedAuthor(store)).toBe("Jordi");
  });

  it("buit vol dir sense autor: no torna a heretar el de les preferències", () => {
    const store = makeStore();
    withUserAuthor(store, "Rosa");
    store.dispatch(documentAuthorChangedActionCreator(""));

    expect(selectDocumentToSave(state(store)).author).toBe("");
    expect(savedAuthor(store)).toBeUndefined();
  });

  it("un fitxer sense autor s'obre sense autor, no amb el de qui l'obre", () => {
    const store = makeStore();
    withUserAuthor(store, "Rosa");
    store.dispatch(addPictogramActionCreator(pict));
    // Un fitxer desat sense autor
    store.dispatch(documentAuthorChangedActionCreator(""));
    const file = documentToV3(
      state(store).document,
      serializeContextOf(state(store)),
    );
    // L'obre una altra persona, amb el seu autor per defecte
    const other = makeStore();
    withUserAuthor(other, "Pere");
    const parsed = parseSaacValue(file, parseContextOf(state(other)));
    if (parsed.kind !== "document") throw new Error("no és un document");
    other.dispatch(loadDocumentSaacActionCreator(parsed.document));

    expect(state(other).document.author).toBe("");
    expect(selectDocumentToSave(state(other)).author).toBe("");
  });

  it("un fitxer amb autor s'obre amb el seu", () => {
    const store = makeStore();
    store.dispatch(addPictogramActionCreator(pict));
    store.dispatch(documentAuthorChangedActionCreator("Jordi"));
    const file = documentToV3(
      state(store).document,
      serializeContextOf(state(store)),
    );
    const other = makeStore();
    withUserAuthor(other, "Rosa");

    const parsed = parseSaacValue(file, parseContextOf(state(other)));
    if (parsed.kind !== "document") throw new Error("no és un document");
    other.dispatch(loadDocumentSaacActionCreator(parsed.document));

    expect(state(other).document.author).toBe("Jordi");
  });

  it("en descarregar-lo, l'autor que heretava passa a ser seu", () => {
    const store = makeStore();
    withUserAuthor(store, "Rosa");
    store.dispatch(
      documentStyleMaterializedActionCreator({
        style: selectDocumentStyle(state(store)),
        layout: { pageSize: "A4", orientation: "landscape", direction: "row" },
        author: "Rosa",
      }),
    );
    withUserAuthor(store, "Pere");

    expect(state(store).document.author).toBe("Rosa");
  });
});
