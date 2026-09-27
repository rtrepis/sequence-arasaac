import { describe, expect, it } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { documentReducer } from "./documentSlice";
import {
  addPictogramActionCreator,
  addNewSequenceActionCreator,
  documentStyleMaterializedActionCreator,
  loadDocumentSaacActionCreator,
  selectDocumentToSave,
} from "./documentSlice";
import { documentStatusReducer } from "./documentStatusSlice";
import { documentStatusListener } from "./documentStatusMiddleware";
import {
  changeDocumentStyleThunk,
  selectCanUndoStyle,
  selectDocumentHasOwnStyle,
  styleReducer,
  undoStyleChangeThunk,
} from "./styleSlice";
import { uiReducer } from "@features/user-settings/store/uiSlice";
import {
  updateDefaultSettingsActionCreator,
  viewSettingsActionCreator,
} from "@features/user-settings/store/uiSlice";
import {
  selectDocumentStyle,
  selectResolvedSequenceViews,
  selectUserDefaultStyle,
} from "@features/sequence/style/styleSelectors";
import { parseSaacFile } from "@features/sequence/style/saacFile";
import { PictSequence } from "@/types/sequence";
import { SequenceStyle } from "@/types/document";

// Proves de l'estil a l'store: les mateixes peces que fa servir l'app, sense
// React. Cobreixen el cicle de vida de l'estil d'una seqüència.

const makeStore = () =>
  configureStore({
    reducer: {
      document: documentReducer,
      documentStatus: documentStatusReducer,
      ui: uiReducer,
      style: styleReducer,
    },
    middleware: (getDefault) =>
      getDefault().prepend(documentStatusListener.middleware),
  });

type TestStore = ReturnType<typeof makeStore>;
// Els selectors són de l'store sencer; aquí n'hi ha prou amb les branques que llegeixen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const state = (store: TestStore) => store.getState() as any;

const pict = (
  overrides: Partial<PictSequence["settings"]> = {},
): PictSequence => ({
  indexSequence: 0,
  img: {
    searched: { word: "casa", bestIdPicts: [1] },
    selectedId: 1,
    settings: {
      fitzgerald: "#ff0000",
      skin: "white",
      hair: "brown",
      color: true,
    },
  },
  cross: false,
  settings: { textPosition: "bottom", ...overrides },
});

const OTHER_STYLE = (base: SequenceStyle): SequenceStyle => ({
  ...base,
  pictSequence: {
    ...base.pictSequence,
    font: { family: "Escolar", color: "#1a237e", size: 1.4 },
    textPosition: "top",
  },
  view: { ...base.view, sizePict: 2.2, sequenceSpaceBetween: 6 },
});

describe("seqüència nova", () => {
  it("neix amb l'estil per defecte, encara que les preferències arribin després", () => {
    const store = makeStore();
    // Les preferències (del navegador o del compte) arriben després de crear el document
    store.dispatch(
      updateDefaultSettingsActionCreator({
        ...state(store).ui.defaultSettings,
        pictSequence: {
          ...state(store).ui.defaultSettings.pictSequence,
          font: { family: "Memima", color: "#000000", size: 1.3 },
        },
      }),
    );
    store.dispatch(
      viewSettingsActionCreator({
        ...state(store).ui.viewSettings,
        sizePict: 1.7,
      }),
    );

    expect(selectDocumentStyle(state(store))).toEqual(
      selectUserDefaultStyle(state(store)),
    );
    expect(selectResolvedSequenceViews(state(store))[0].sizePict).toBe(1.7);
    expect(selectDocumentHasOwnStyle(state(store))).toBe(false);
  });

  it("en desar-la, el fitxer porta l'estil, i a partir d'aleshores ja és seu", () => {
    const store = makeStore();
    store.dispatch(addPictogramActionCreator(pict()));
    store.dispatch(addNewSequenceActionCreator(1));
    const userDefault = selectUserDefaultStyle(state(store));

    const saved = selectDocumentToSave(state(store));
    expect(saved.defaultSettings).toEqual({
      pictSequence: userDefault.pictSequence,
      pictApiAra: userDefault.pictApiAra,
    });
    expect(saved.styleView).toEqual(userDefault.view);
    expect(Object.keys(saved.viewSettings)).toEqual(["0", "1"]);

    store.dispatch(documentStyleMaterializedActionCreator(userDefault));
    // Canviar l'estil per defecte ja no canvia la seqüència desada
    store.dispatch(
      viewSettingsActionCreator({
        ...state(store).ui.viewSettings,
        sizePict: 3,
      }),
    );
    expect(selectDocumentStyle(state(store)).view.sizePict).toBe(
      userDefault.view.sizePict,
    );
  });

  it("fer explícit l'estil en desar no marca el document com a canviat", () => {
    const store = makeStore();
    store.dispatch(addPictogramActionCreator(pict()));
    const changedAt = state(store).documentStatus.changedAt;
    store.dispatch(
      documentStyleMaterializedActionCreator(
        selectUserDefaultStyle(state(store)),
      ),
    );
    expect(state(store).documentStatus.changedAt).toBe(changedAt);
  });

  it("«Document nou» torna a heretar l'estil per defecte", () => {
    const store = makeStore();
    store.dispatch(
      changeDocumentStyleThunk(
        OTHER_STYLE(selectUserDefaultStyle(state(store))),
        "file",
      ),
    );
    expect(selectDocumentHasOwnStyle(state(store))).toBe(true);

    // El que fa «Document nou» (`startNewDocumentThunk`) sense tocar IndexedDB
    store.dispatch({ type: "document/resetDocument" });
    expect(selectDocumentHasOwnStyle(state(store))).toBe(false);
  });
});

describe("obrir una seqüència", () => {
  it("es veu amb el seu estil, i les preferències de qui l'obre no la reescriuen (B25)", () => {
    const store = makeStore();
    const userDefault = selectUserDefaultStyle(state(store));
    const fileStyle = OTHER_STYLE(userDefault);
    const parsed = parseSaacFile(
      {
        schemaVersion: 2,
        documentState: {
          id: "f",
          content: { 0: [pict()] },
          viewSettings: {
            0: {
              sizePict: 0.7,
              pictSpaceBetween: 0.5,
              alignmentH: "right",
              alignmentV: "bottom",
            },
          },
          activeSAAC: 0,
          defaultSettings: {
            pictSequence: fileStyle.pictSequence,
            pictApiAra: fileStyle.pictApiAra,
          },
          styleView: fileStyle.view,
        },
      },
      { userDefault, newId: () => "x" },
    );
    if (parsed.kind !== "sequence") throw new Error(parsed.kind);
    store.dispatch(loadDocumentSaacActionCreator(parsed.document));

    expect(selectDocumentStyle(state(store))).toEqual(fileStyle);
    expect(selectResolvedSequenceViews(state(store))[0]).toEqual({
      sizePict: 0.7,
      pictSpaceBetween: 0.5,
      alignmentH: "right",
      alignmentV: "bottom",
    });
    expect(selectDocumentHasOwnStyle(state(store))).toBe(true);
    // Les preferències de qui l'obre no s'han tocat
    expect(selectUserDefaultStyle(state(store))).toEqual(userDefault);
  });
});

describe("«Canvia l'estil»", () => {
  const openedStore = () => {
    const store = makeStore();
    const userDefault = selectUserDefaultStyle(state(store));
    store.dispatch(
      loadDocumentSaacActionCreator({
        id: "d",
        content: {
          0: [
            pict({ font: { ...userDefault.pictSequence.font } }),
            pict({ font: { family: "Caveat", color: "#ff00ff", size: 2 } }),
          ],
        },
        viewSettings: { 0: { ...userDefault.view } },
        activeSAAC: 0,
        defaultSettings: {
          pictSequence: userDefault.pictSequence,
          pictApiAra: userDefault.pictApiAra,
        },
        styleView: userDefault.view,
      }),
    );
    return { store, userDefault };
  };

  it("aplica l'estil amb la regla dels retocs i es pot desfer", () => {
    const { store, userDefault } = openedStore();
    const before = state(store).document;
    const target = OTHER_STYLE(userDefault);

    store.dispatch(changeDocumentStyleThunk(target, "file", target));

    const after = state(store).document;
    expect(selectDocumentStyle(state(store))).toEqual(target);
    expect(after.content[0][0].settings.font).toEqual(target.pictSequence.font);
    expect(after.content[0][1].settings.font.family).toBe("Caveat"); // retoc conservat
    expect(after.content[0][0].settings.textPosition).toBe("top");
    expect(selectResolvedSequenceViews(state(store))[0].sizePict).toBe(2.2);
    expect(state(store).style.notice).toMatchObject({
      kind: "changed",
      source: "file",
    });
    // No toca cap fitxer: el document queda amb canvis sense desar
    expect(state(store).documentStatus.changedAt).not.toBeNull();

    expect(selectCanUndoStyle(state(store))).toBe(true);
    store.dispatch(undoStyleChangeThunk());
    expect(state(store).document).toEqual(before);
    expect(selectCanUndoStyle(state(store))).toBe(false);
  });

  it("«El meu estil per defecte» torna a l'estil de l'usuari", () => {
    const { store, userDefault } = openedStore();
    store.dispatch(changeDocumentStyleThunk(OTHER_STYLE(userDefault), "file"));
    store.dispatch(changeDocumentStyleThunk(userDefault, "userDefault"));
    expect(selectDocumentStyle(state(store))).toEqual(userDefault);
    expect(state(store).document.content[0][1].settings.font.family).toBe(
      "Caveat",
    );
  });

  it("desar el document no li treu el desfer", () => {
    const { store, userDefault } = openedStore();
    store.dispatch(
      changeDocumentStyleThunk(OTHER_STYLE(userDefault), "userDefault"),
    );
    store.dispatch(documentStyleMaterializedActionCreator(userDefault));
    expect(selectCanUndoStyle(state(store))).toBe(true);
  });

  it("si el document s'ha tocat després, el desfer ja no s'ofereix", () => {
    const { store, userDefault } = openedStore();
    store.dispatch(
      changeDocumentStyleThunk(OTHER_STYLE(userDefault), "userDefault"),
    );
    store.dispatch(addPictogramActionCreator(pict()));

    expect(selectCanUndoStyle(state(store))).toBe(false);
    const current = state(store).document;
    store.dispatch(undoStyleChangeThunk());
    // El desfer no s'endú el pictograma que s'ha afegit després
    expect(state(store).document).toBe(current);
  });
});
