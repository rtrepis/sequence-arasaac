import { describe, expect, it } from "vitest";
import { createAppStore } from "@/app/store";
import { sequenceFixture } from "@/test/fixtures/document";
import type { DocumentSAAC } from "@/types/document";
import {
  addNewSequenceActionCreator,
  deleteLastSequenceActionCreator,
} from "@features/sequence/store/documentSlice";
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

// Les accions sobre les pàgines amb l'store de debò: el document, i el desfer
// de sempre per a les que substitueixen feina.

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
  store.getState().document.pages!;

/** La clau de la seqüència d'un bloc, o -1 si no n'és cap. */
const keyOf = (placement: { kind: string; sequenceKey?: number }) =>
  placement.kind === "sequence" ? (placement.sequenceKey ?? -1) : -1;

describe("passar a «Lliure» i tornar", () => {
  it("passar a lliure col·loca totes les seqüències, sense que en desaparegui cap", () => {
    const store = freeStore(3);
    expect(layoutOf(store).sheets[0].mode).toBe("template");
    expect(layoutOf(store).sheets[0].placements.map(keyOf)).toEqual([0, 1, 2]);
  });

  it("tornar a automàtica conserva les pàgines i els blocs, i es pot desfer", () => {
    const store = freeStore(2);
    const before = layoutOf(store);

    store.dispatch(setLayoutModeThunk("flow"));

    expect(layoutOf(store).sheets.map(({ mode }) => mode)).toEqual(["auto"]);
    expect(layoutOf(store).sheets[0].placements).toBe(
      before.sheets[0].placements,
    );
    expect(selectCanUndoStyle(store.getState())).toBe(true);

    store.dispatch(undoStyleChangeThunk());

    expect(layoutOf(store)).toBe(before);
  });

  it("tornar a lliure recupera la disposició tal com era", () => {
    const store = freeStore(2);
    store.dispatch(addSheetThunk(0));
    const before = layoutOf(store);

    store.dispatch(setLayoutModeThunk("flow"));
    store.dispatch(setLayoutModeThunk("free"));

    expect(layoutOf(store)).toEqual(before);
  });

  it("amb la pantalla completa no hi ha mil·límetres, i no es construeix res", () => {
    const store = createAppStore({
      document: {
        ...documentWith(1),
        layout: { pageSize: "FULLSCREEN", orientation: "landscape" },
      },
    });
    store.dispatch(setLayoutModeThunk("free"));
    expect(store.getState().document.pages).toBeUndefined();
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
    expect(whereIs(layoutOf(store), keyOf(first)).sheets).toEqual([]);
    store.dispatch(undoStyleChangeThunk());
    expect(whereIs(layoutOf(store), keyOf(first)).sheets).toEqual([0]);

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
    expect(whereIs(layoutOf(store), keyOf(first))).toEqual({
      common: true,
      sheets: [],
    });
    // Posar-la-hi no substitueix res: no hi ha cap desfer pendent d'això
    expect(selectCanUndoStyle(store.getState())).toBe(false);

    store.dispatch(setPlacementCommonThunk(first.id, false, 1));
    expect(whereIs(layoutOf(store), keyOf(first))).toEqual({
      common: false,
      sheets: [1],
    });
    expect(selectCanUndoStyle(store.getState())).toBe(true);
  });

  it("una seqüència nova va a l'última pàgina si és automàtica; si no, enlloc", () => {
    const store = freeStore(2);
    store.dispatch(addNewSequenceActionCreator(2));
    expect(whereIs(layoutOf(store), 2)).toEqual({ common: false, sheets: [] });

    store.dispatch(setLayoutModeThunk("flow"));
    store.dispatch(addNewSequenceActionCreator(3));
    expect(whereIs(layoutOf(store), 3)).toEqual({ common: false, sheets: [0] });
  });

  it("un document sense pàgines continua sense, encara que tingui seqüències noves", () => {
    const store = createAppStore({ document: documentWith(1) });
    store.dispatch(addNewSequenceActionCreator(1));
    expect(store.getState().document.pages).toBeUndefined();
  });

  it("esborrar l'última seqüència n'esborra els blocs", () => {
    const store = freeStore(3);
    store.dispatch(deleteLastSequenceActionCreator());
    expect(whereIs(layoutOf(store), 2)).toEqual({ common: false, sheets: [] });
    expect(whereIs(layoutOf(store), 1).sheets).toEqual([0]);
  });
});
