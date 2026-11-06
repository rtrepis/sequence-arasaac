import { describe, expect, it } from "vitest";
import { createAppStore } from "@/app/store";
import { sequenceFixture } from "@/test/fixtures/document";
import type { DocumentSAAC } from "@/types/document";
import { deleteLastSequenceActionCreator } from "@features/sequence/store/documentSlice";
import {
  selectCanUndoStyle,
  undoStyleChangeThunk,
} from "@features/sequence/store/styleSlice";
import { whereIs } from "../model/placementsOf";
import { stackTemplate } from "../model/templates";
import {
  addSequencesToSheetThunk,
  addSheetThunk,
  applyTemplateThunk,
  removePlacementThunk,
  removeSheetThunk,
  setLayoutModeThunk,
  setPlacementCommonThunk,
} from "./freeLayoutThunks";

// Les accions de la disposició lliure sobre l'store de debò: el document, i el
// desfer de sempre per a les que substitueixen feina.

/** Un document de tres seqüències en A4 vertical, amb la pàgina pròpia. */
const documentWith = (count: number): DocumentSAAC => ({
  id: "doc",
  content: Object.fromEntries(
    Array.from({ length: count }, (_, key) => [key, sequenceFixture(2)]),
  ),
  viewSettings: {},
  activeSAAC: 0,
  layout: { pageSize: "A4", orientation: "portrait", direction: "row" },
});

const freeStore = (count = 3) => {
  const store = createAppStore({ document: documentWith(count) });
  store.dispatch(setLayoutModeThunk("free"));
  return store;
};

const layoutOf = (store: ReturnType<typeof createAppStore>) =>
  store.getState().document.freeLayout!;

describe("passar a «Lliure» i tornar", () => {
  it("passar a lliure col·loca totes les seqüències, sense que en desaparegui cap", () => {
    const store = freeStore(3);
    const { layout } = store.getState().document;
    expect(layout).toMatchObject({ mode: "free", pageSize: "A4" });
    expect(
      layoutOf(store).sheets[0].placements.map((p) => p.sequenceKey),
    ).toEqual([0, 1, 2]);
  });

  it("tornar a automàtica conserva la disposició, i es pot desfer", () => {
    const store = freeStore(2);
    const before = layoutOf(store);

    store.dispatch(setLayoutModeThunk("flow"));

    expect(store.getState().document.layout?.mode).toBeUndefined();
    expect(store.getState().document.freeLayout).toBe(before);
    expect(selectCanUndoStyle(store.getState())).toBe(true);

    store.dispatch(undoStyleChangeThunk());

    expect(store.getState().document.layout?.mode).toBe("free");
  });

  it("tornar a lliure recupera la disposició tal com era", () => {
    const store = freeStore(2);
    store.dispatch(addSheetThunk(0));
    const before = layoutOf(store);

    store.dispatch(setLayoutModeThunk("flow"));
    store.dispatch(setLayoutModeThunk("free"));

    expect(layoutOf(store)).toBe(before);
  });

  it("amb la pantalla completa no hi ha mil·límetres, i no es construeix res", () => {
    const store = createAppStore({
      document: {
        ...documentWith(1),
        layout: { pageSize: "FULLSCREEN", orientation: "landscape" },
      },
    });
    store.dispatch(setLayoutModeThunk("free"));
    expect(store.getState().document.freeLayout).toBeUndefined();
  });
});

describe("pàgines i seqüències", () => {
  it("afegir seqüències a una pàgina les hi posa sense treure-les d'on eren, i es pot desfer", () => {
    const store = freeStore(2);
    store.dispatch(addSheetThunk(0));

    store.dispatch(addSequencesToSheetThunk(1, [0]));

    expect(whereIs(layoutOf(store), 0)).toEqual({
      common: false,
      sheets: [0, 1],
    });
    store.dispatch(undoStyleChangeThunk());
    expect(whereIs(layoutOf(store), 0).sheets).toEqual([0]);
  });

  it("aplicar una plantilla es pot desfer", () => {
    const store = freeStore(2);
    const before = layoutOf(store);
    store.dispatch(applyTemplateThunk(0, stackTemplate(2, "columns")));
    expect(layoutOf(store)).not.toBe(before);
    store.dispatch(undoStyleChangeThunk());
    expect(layoutOf(store)).toBe(before);
  });

  it("treure una seqüència d'una pàgina i esborrar una pàgina es poden desfer", () => {
    const store = freeStore(2);
    const [first] = layoutOf(store).sheets[0].placements;

    store.dispatch(removePlacementThunk(first.id));
    expect(whereIs(layoutOf(store), first.sequenceKey).sheets).toEqual([]);
    store.dispatch(undoStyleChangeThunk());
    expect(whereIs(layoutOf(store), first.sequenceKey).sheets).toEqual([0]);

    store.dispatch(addSheetThunk(0));
    store.dispatch(removeSheetThunk(0));
    expect(layoutOf(store).sheets).toHaveLength(1);
    store.dispatch(undoStyleChangeThunk());
    expect(layoutOf(store).sheets).toHaveLength(2);
  });

  it("«A totes les pàgines» i desfer-ho", () => {
    const store = freeStore(2);
    store.dispatch(addSheetThunk(0));
    const [first] = layoutOf(store).sheets[0].placements;

    store.dispatch(setPlacementCommonThunk(first.id, true, 0));
    expect(whereIs(layoutOf(store), first.sequenceKey)).toEqual({
      common: true,
      sheets: [],
    });
    // Posar-la-hi no substitueix res: no hi ha cap desfer pendent d'això
    expect(selectCanUndoStyle(store.getState())).toBe(false);

    store.dispatch(setPlacementCommonThunk(first.id, false, 1));
    expect(whereIs(layoutOf(store), first.sequenceKey)).toEqual({
      common: false,
      sheets: [1],
    });
    expect(selectCanUndoStyle(store.getState())).toBe(true);
  });

  it("esborrar l'última seqüència n'esborra les col·locacions", () => {
    const store = freeStore(3);
    store.dispatch(deleteLastSequenceActionCreator());
    expect(whereIs(layoutOf(store), 2)).toEqual({ common: false, sheets: [] });
    expect(whereIs(layoutOf(store), 1).sheets).toEqual([0]);
  });
});
