import { describe, expect, it } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import {
  addPictogramActionCreator,
  documentReducer,
  updatePictSequenceActionCreator,
} from "./documentSlice";
import { documentStatusReducer } from "./documentStatusSlice";
import { documentStatusListener } from "./documentStatusMiddleware";
import {
  applyToAllPictogramsThunk,
  selectCanUndoStyle,
  styleReducer,
  undoStyleChangeThunk,
  undoableStyleChangeThunk,
} from "./styleSlice";
import { uiReducer } from "@features/user-settings/store/uiSlice";
import { selectDocumentStyle } from "@features/sequence/style/styleSelectors";
import { pictogramStyleOverride } from "@features/sequence/saac/serialize";
import type { PictSequence } from "@/types/sequence";

// «Aplica a tots» i «Restableix» amb el desfer que ja existia (ADR-003,
// decisió 12), i l'indicador «personalitzat» (fonament 03, §6).

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const state = (store: TestStore) => store.getState() as any;

const pict = (
  index: number,
  settings: Partial<PictSequence["settings"]> = {},
  img: Partial<PictSequence["img"]["settings"]> = {},
): PictSequence => ({
  indexSequence: index,
  img: {
    searched: { word: "menjar", bestIdPicts: [6456] },
    selectedId: 6456,
    settings: {
      fitzgerald: "#4CAf50",
      skin: "white",
      hair: "brown",
      color: true,
      ...img,
    },
    category: "verb",
  },
  cross: false,
  settings: { textPosition: "bottom", ...settings },
});

describe("Aplica a tots", () => {
  it("canvia l'estil del document i treu el retoc de tots els pictogrames", () => {
    const store = makeStore();
    store.dispatch(
      addPictogramActionCreator(
        pict(0, { borderOut: { color: "#ff0000", radius: 1, size: 1 } }),
      ),
    );
    store.dispatch(addPictogramActionCreator(pict(1)));
    const borderOut = { color: "#123456", radius: 8, size: 4 };

    store.dispatch(applyToAllPictogramsThunk({ pictSequence: { borderOut } }));

    const style = selectDocumentStyle(state(store));
    expect(style.pictSequence.borderOut).toEqual(borderOut);
    const picts: PictSequence[] = state(store).document.content[0];
    picts.forEach((p) => {
      expect(p.settings.borderOut).toEqual(borderOut);
      // Ja no és un retoc
      expect(pictogramStyleOverride(p, style)?.card?.borderOut).toBeUndefined();
    });
    expect(state(store).style.undoSnackbar).toMatchObject({
      source: "applyAll",
    });
  });

  it("només posa la pell als pictogrames que en tenen", () => {
    const store = makeStore();
    store.dispatch(addPictogramActionCreator(pict(0)));
    store.dispatch(addPictogramActionCreator(pict(1, {}, { skin: undefined })));

    store.dispatch(
      applyToAllPictogramsThunk({ pictApiAra: { skin: "black" } }),
    );

    const [withSkin, withoutSkin]: PictSequence[] =
      state(store).document.content[0];
    expect(withSkin.img.settings.skin).toBe("black");
    expect(withoutSkin.img.settings.skin).toBeUndefined();
  });

  it("es pot desfer", () => {
    const store = makeStore();
    store.dispatch(addPictogramActionCreator(pict(0)));
    const before = state(store).document;

    store.dispatch(
      applyToAllPictogramsThunk({ pictSequence: { textPosition: "top" } }),
    );
    expect(selectCanUndoStyle(state(store))).toBe(true);
    store.dispatch(undoStyleChangeThunk());

    expect(state(store).document.content).toBe(before.content);
    expect(state(store).document.defaultSettings).toBe(before.defaultSettings);
  });
});

describe("Restableix i l'indicador «personalitzat»", () => {
  it("el color de la categoria no és un retoc; un altre color, sí", () => {
    const store = makeStore();
    const style = selectDocumentStyle(state(store));
    expect(pictogramStyleOverride(pict(0), style)).toBeUndefined();
    expect(
      pictogramStyleOverride(pict(0, {}, { fitzgerald: "#000000" }), style),
    ).toEqual({ pictogram: { fitzgerald: "#000000" } });
  });

  it("restablir un pictograma es pot desfer", () => {
    const store = makeStore();
    const retouched = pict(0, {
      borderIn: { color: "#ff00ff", radius: 0, size: 9 },
    });
    store.dispatch(addPictogramActionCreator(retouched));
    const before = state(store).document.content;
    const style = selectDocumentStyle(state(store));
    const { id } = state(store).document.content[0][0];

    const reset: PictSequence = {
      ...pict(0),
      id,
      settings: {
        textPosition: style.pictSequence.textPosition,
        borderIn: style.pictSequence.borderIn,
        borderOut: style.pictSequence.borderOut,
      },
      img: {
        ...pict(0).img,
        settings: {
          ...pict(0).img.settings,
          skin: style.pictApiAra.skin,
          hair: style.pictApiAra.hair,
          color: style.pictApiAra.color,
        },
      },
    };
    store.dispatch(
      undoableStyleChangeThunk(
        () => updatePictSequenceActionCreator(reset),
        "reset",
      ),
    );
    const now = state(store).document.content[0][0];
    expect(pictogramStyleOverride(now, style)).toBeUndefined();
    expect(state(store).style.undoSnackbar).toMatchObject({ source: "reset" });

    store.dispatch(undoStyleChangeThunk());
    expect(state(store).document.content).toBe(before);
  });
});
