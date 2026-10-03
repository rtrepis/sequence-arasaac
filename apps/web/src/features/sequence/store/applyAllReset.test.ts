import { describe, expect, it } from "vitest";
import { createAppStore } from "@app/store";
import {
  addPictogramActionCreator,
  documentReducer,
  updatePictSequenceActionCreator,
} from "./documentSlice";
import { documentStatusReducer } from "./documentStatusSlice";
import { documentStatusListener } from "./documentStatusMiddleware";
import {
  applyToAllPictogramsThunk,
  resetPictogramStyleThunk,
  selectCanUndoStyle,
  styleReducer,
  undoStyleChangeThunk,
  undoableStyleChangeThunk,
} from "./styleSlice";
import { uiReducer } from "@features/user-settings/store/uiSlice";
import { selectDocumentStyle } from "@features/sequence/style/styleSelectors";
import { pictogramStyleOverride } from "@features/sequence/saac/serialize";
import {
  isPictogramCustomized,
  resetPictogramStyle,
} from "@features/sequence/style/pictogramStyle";
import type { PictSequence } from "@/types/sequence";

// «Aplica a tots» i «Restableix» amb el desfer que ja existia (ADR-003,
// decisió 12), i l'indicador «personalitzat» (fonament 03, §6).

const makeStore = () => createAppStore();

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

describe("Restableix l'estil", () => {
  const retouched = () =>
    pict(
      0,
      {
        borderIn: { color: "#ff00ff", radius: 0, size: 9 },
        font: { family: "Escolar", color: "#123456", size: 2 },
      },
      { color: false, fitzgerald: "#000000" },
    );

  it("treu tots els retocs i conserva el contingut i la categoria", () => {
    const store = makeStore();
    const style = selectDocumentStyle(state(store));
    const before = { ...retouched(), text: "L'escola", cross: true };
    expect(isPictogramCustomized(before, style)).toBe(true);

    const after = resetPictogramStyle(before, style);
    expect(isPictogramCustomized(after, style)).toBe(false);
    expect(after.text).toBe("L'escola");
    expect(after.cross).toBe(true);
    expect(after.img.category).toBe("verb");
    expect(after.img.selectedId).toBe(before.img.selectedId);
    // El Fitzgerald torna al color de la categoria, no al gris de l'estil
    expect(after.img.settings.fitzgerald).toBe("#4CAf50");
    expect(after.settings.font).toBeUndefined();
  });

  it("no hi posa pell si el pictograma no en té", () => {
    const store = makeStore();
    const style = selectDocumentStyle(state(store));
    const withoutSkin = pict(0, {}, { skin: undefined });
    expect(
      resetPictogramStyle(withoutSkin, style).img.settings,
    ).not.toHaveProperty("skin");
  });

  it("des del menú contextual s'aplica al moment, i Desfés el recupera", () => {
    const store = makeStore();
    store.dispatch(addPictogramActionCreator(retouched()));
    const before = state(store).document.content[0][0];
    const style = selectDocumentStyle(state(store));

    store.dispatch(resetPictogramStyleThunk(0));
    const reset = state(store).document.content[0][0];
    expect(isPictogramCustomized(reset, style)).toBe(false);
    expect(reset.id).toBe(before.id);
    expect(state(store).style.undoSnackbar).toMatchObject({ source: "reset" });

    store.dispatch(undoStyleChangeThunk());
    expect(state(store).document.content[0][0]).toBe(before);
    expect(isPictogramCustomized(before, style)).toBe(true);
  });
});
