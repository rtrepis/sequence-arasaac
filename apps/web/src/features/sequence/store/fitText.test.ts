import { describe, expect, it } from "vitest";
import { createAppStore } from "@app/store";
import { addPictogramActionCreator } from "./documentSlice";
import {
  fitDocumentTextThunk,
  fitPictogramTextThunk,
  undoStyleChangeThunk,
} from "./styleSlice";
import { selectDocumentStyle } from "@features/sequence/style/styleSelectors";
import { isPictogramCustomized } from "@features/sequence/style/pictogramStyle";
import type { PictSequence } from "@/types/sequence";

// Reduir la lletra perquè el text hi càpiga (B28): d'un sol pictograma o de
// tot el document, totes dues amb el desfer dels canvis d'estil.

const makeStore = () => createAppStore();

type TestStore = ReturnType<typeof makeStore>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const state = (store: TestStore) => store.getState() as any;

const pict = (
  index: number,
  settings: Partial<PictSequence["settings"]> = {},
): PictSequence => ({
  indexSequence: index,
  img: {
    searched: { word: "previsualització", bestIdPicts: [6456] },
    selectedId: 6456,
    settings: {
      fitzgerald: "#4CAf50",
      skin: "white",
      hair: "brown",
      color: true,
    },
    category: "verb",
  },
  cross: false,
  settings: { textPosition: "bottom", ...settings },
});

describe("reduir la lletra d'un pictograma", () => {
  it("en fa un retoc amb la mida nova i la resta de la lletra del document", () => {
    const store = makeStore();
    store.dispatch(addPictogramActionCreator(pict(0)));
    store.dispatch(addPictogramActionCreator(pict(1)));
    const documentFont = selectDocumentStyle(state(store)).pictSequence.font;

    store.dispatch(fitPictogramTextThunk(0, 0.7));

    const [fitted, other] = state(store).document.content[0];
    expect(fitted.settings.font).toEqual({ ...documentFont, size: 0.7 });
    expect(
      isPictogramCustomized(fitted, selectDocumentStyle(state(store))),
    ).toBe(true);
    // Els altres i l'estil del document no es toquen
    expect(other.settings.font).toBeUndefined();
    expect(selectDocumentStyle(state(store)).pictSequence.font).toEqual(
      documentFont,
    );
    expect(state(store).style.undoSnackbar).toMatchObject({
      source: "fitTextPictogram",
    });
  });

  it("Desfés el torna a com era", () => {
    const store = makeStore();
    store.dispatch(addPictogramActionCreator(pict(0)));
    const before = state(store).document.content[0][0];

    store.dispatch(fitPictogramTextThunk(0, 0.7));
    store.dispatch(undoStyleChangeThunk());

    expect(state(store).document.content[0][0]).toBe(before);
  });
});

describe("reduir la lletra de tot el document", () => {
  it("canvia la mida de l'estil del document i cap pictograma no queda retocat", () => {
    const store = makeStore();
    store.dispatch(addPictogramActionCreator(pict(0)));
    store.dispatch(addPictogramActionCreator(pict(1)));
    const before = selectDocumentStyle(state(store)).pictSequence.font;

    store.dispatch(fitDocumentTextThunk(0.8));

    const style = selectDocumentStyle(state(store));
    expect(style.pictSequence.font).toEqual({ ...before, size: 0.8 });
    state(store).document.content[0].forEach((p: PictSequence) =>
      expect(isPictogramCustomized(p, style)).toBe(false),
    );
    expect(state(store).style.undoSnackbar).toMatchObject({
      source: "fitTextDocument",
    });
  });

  it("conserva la mida pròpia d'un pictograma retocat", () => {
    const store = makeStore();
    const documentFont = selectDocumentStyle(state(store)).pictSequence.font;
    const own = { ...documentFont, size: 1.6 };
    store.dispatch(addPictogramActionCreator(pict(0, { font: own })));

    store.dispatch(fitDocumentTextThunk(0.8));

    expect(state(store).document.content[0][0].settings.font).toEqual(own);
  });

  it("Desfés torna la mida d'abans", () => {
    const store = makeStore();
    store.dispatch(addPictogramActionCreator(pict(0)));
    const before = selectDocumentStyle(state(store)).pictSequence.font.size;

    store.dispatch(fitDocumentTextThunk(0.8));
    store.dispatch(undoStyleChangeThunk());

    expect(selectDocumentStyle(state(store)).pictSequence.font.size).toBe(
      before,
    );
  });
});
