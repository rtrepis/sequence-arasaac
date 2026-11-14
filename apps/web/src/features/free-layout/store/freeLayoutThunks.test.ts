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
import {
  selectResolvedSequenceViews,
  selectUserDefaultStyle,
} from "@features/sequence/style/styleSelectors";
import {
  updateDefaultSettingPictSequenceActionCreator,
  viewSettingsActionCreator,
} from "@features/user-settings/store/uiSlice";
import { whereIs } from "../model/placementsOf";
import { stackTemplate } from "../model/templates";
import {
  addSequencesToSheetThunk,
  addSheetThunk,
  applyMyStyleThunk,
  applyTemplateThunk,
  removeBlockStyleThunk,
  removePlacementThunk,
  removeSheetThunk,
  setLicenceOnThunk,
  setSheetDirectionThunk,
  setSheetGapThunk,
  setSheetModeThunk,
  setPlacementCommonThunk,
  setPlacementViewThunk,
  setSheetViewThunk,
  updateMyStyleThunk,
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
  store.dispatch(setSheetModeThunk(0, "template"));
  return store;
};

const layoutOf = (store: ReturnType<typeof createAppStore>) =>
  store.getState().document.pages!;

/** La clau de la seqüència d'un bloc, o -1 si no n'és cap. */
const keyOf = (placement: { kind: string; sequenceKey?: number }) =>
  placement.kind === "sequence" ? (placement.sequenceKey ?? -1) : -1;

describe("passar una pàgina a blocs i tornar", () => {
  it("passar a blocs fa explícita la pàgina i hi col·loca totes les seqüències", () => {
    const store = freeStore(3);
    expect(layoutOf(store).sheets).toHaveLength(1);
    expect(layoutOf(store).sheets[0].mode).toBe("template");
    expect(layoutOf(store).sheets[0].placements.map(keyOf)).toEqual([0, 1, 2]);
  });

  it("passar a blocs reparteix en tantes files (o columnes) com seqüències, en el sentit de la pàgina", () => {
    const rows = freeStore(5);
    expect(layoutOf(rows).sheets[0].template).toBe("rows-5");

    const store = createAppStore({
      document: {
        ...documentWith(4),
        layout: {
          pageSize: "A4",
          orientation: "portrait",
          direction: "column",
        },
      },
    });
    store.dispatch(setSheetModeThunk(0, "template"));
    expect(layoutOf(store).sheets[0].template).toBe("columns-4");
  });

  it("tornar a contínua conserva els blocs, i tornar a blocs els recupera tal com eren", () => {
    const store = freeStore(2);
    const before = layoutOf(store);

    store.dispatch(setSheetModeThunk(0, "auto"));

    expect(layoutOf(store).sheets[0].mode).toBe("auto");
    expect(layoutOf(store).sheets[0].placements).toBe(
      before.sheets[0].placements,
    );

    store.dispatch(setSheetModeThunk(0, "template"));

    expect(layoutOf(store)).toEqual(before);
  });

  it("cada pàgina té el seu mode", () => {
    const store = freeStore(2);
    store.dispatch(addSheetThunk(0));
    expect(layoutOf(store).sheets.map(({ mode }) => mode)).toEqual([
      "template",
      "auto",
    ]);
  });

  it("afegir una pàgina a un document sense pàgines en fa explícita la primera", () => {
    const store = createAppStore({ document: documentWith(2) });
    store.dispatch(addSheetThunk(0));
    const { sheets } = layoutOf(store);
    expect(sheets.map(({ mode }) => mode)).toEqual(["auto", "auto"]);
    expect(sheets[0].placements.map(keyOf)).toEqual([0, 1]);
  });

  it("la direcció, l'espai i la llicència són de cada pàgina o del document", () => {
    const store = createAppStore({ document: documentWith(2) });
    store.dispatch(addSheetThunk(0));
    store.dispatch(setSheetDirectionThunk(1, "column"));
    store.dispatch(setSheetGapThunk(1, 4));
    store.dispatch(setLicenceOnThunk("last"));
    const pages = layoutOf(store);
    expect(pages.sheets[1]).toMatchObject({
      direction: "column",
      sequenceGap: 4,
    });
    expect(pages.sheets[0]).not.toHaveProperty("direction");
    expect(pages.licenceOn).toBe("last");

    store.dispatch(setLicenceOnThunk("every"));

    expect(layoutOf(store)).not.toHaveProperty("licenceOn");
  });

  it("amb la pantalla completa no hi ha mil·límetres, i no es construeix res", () => {
    const store = createAppStore({
      document: {
        ...documentWith(1),
        layout: { pageSize: "FULLSCREEN", orientation: "landscape" },
      },
    });
    store.dispatch(setSheetModeThunk(0, "template"));
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

    store.dispatch(setSheetModeThunk(0, "auto"));
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

describe("la vista d'un bloc (nivell «Bloc»)", () => {
  /** El primer bloc de seqüència de la primera pàgina. */
  const firstBlock = (store: ReturnType<typeof createAppStore>) => {
    const placement = layoutOf(store).sheets[0].placements[0];
    if (placement.kind !== "sequence") throw new Error("no és de seqüència");
    return placement;
  };

  it("desa només el retoc, i la seqüència i els altres blocs no canvien", () => {
    const store = freeStore(2);
    const before = store.getState().document.viewSettings;
    const { id } = firstBlock(store);

    store.dispatch(setPlacementViewThunk(id, { alignmentV: "bottom" }));

    expect(firstBlock(store).view).toEqual({ alignmentV: "bottom" });
    expect(layoutOf(store).sheets[0].placements[1]).not.toHaveProperty("view");
    expect(store.getState().document.viewSettings).toEqual(before);
  });

  it("tornar al valor de la seqüència treu el retoc", () => {
    const store = freeStore(1);
    const { id } = firstBlock(store);
    store.dispatch(setPlacementViewThunk(id, { pictSpaceBetween: 7 }));
    expect(firstBlock(store).view).toEqual({ pictSpaceBetween: 7 });

    const base = selectResolvedSequenceViews(store.getState())[0];
    store.dispatch(
      setPlacementViewThunk(id, { pictSpaceBetween: base.pictSpaceBetween }),
    );

    expect(firstBlock(store)).not.toHaveProperty("view");
  });
});

describe("la mateixa configuració a tots els blocs d'una pàgina", () => {
  it("posa els mateixos valors a tots els blocs de la pàgina, i les altres no canvien", () => {
    const store = freeStore(3);
    store.dispatch(addSheetThunk(0));
    store.dispatch(addSequencesToSheetThunk(1, [0]));

    store.dispatch(setSheetViewThunk(0, { pictSpaceBetween: 6 }));

    const [first, second] = layoutOf(store).sheets;
    first.placements.forEach((placement) =>
      expect(placement).toMatchObject({ view: { pictSpaceBetween: 6 } }),
    );
    second.placements.forEach((placement) =>
      expect(placement).not.toHaveProperty("view"),
    );
  });
});

describe("«Aplica el meu estil» (R10)", () => {
  /** Un document en blocs i el meu estil amb una mida que no és la del document. */
  const storeWithMyStyle = () => {
    const store = freeStore(3);
    const ui = store.getState().ui.viewSettings;
    store.dispatch(viewSettingsActionCreator({ ...ui, sizePict: 1.7 }));
    return store;
  };

  it("a una pàgina: copia el meu estil al document i hi apunta tots els blocs propis", () => {
    const store = storeWithMyStyle();
    const [first] = layoutOf(store).sheets[0].placements;
    store.dispatch(setPlacementViewThunk(first.id, { sizePict: 0.5 }));

    store.dispatch(
      applyMyStyleThunk({ kind: "sheet", sheetIndex: 0 }, "El meu estil"),
    );

    const styles = store.getState().document.styles ?? [];
    expect(styles).toHaveLength(1);
    expect(styles[0].name).toBe("El meu estil");
    // La distribució no és de l'estil: el bloc es queda la seva
    expect(styles[0]).not.toHaveProperty("view");
    const mine = selectUserDefaultStyle(store.getState());
    expect(styles[0].pictSequence).toEqual(mine.pictSequence);
    layoutOf(store).sheets[0].placements.forEach((placement) => {
      expect(placement.kind === "sequence" && placement.styleId).toBe(
        styles[0].id,
      );
    });
    expect(layoutOf(store).sheets[0].placements[0]).toMatchObject({
      view: { sizePict: 0.5 },
    });
    expect(store.getState().style.undoSnackbar).toMatchObject({
      source: "myStyleSheet",
    });
  });

  it("a un bloc: només aquell, i tornar-lo a aplicar reaprofita l'estil", () => {
    const store = storeWithMyStyle();
    const [first, second] = layoutOf(store).sheets[0].placements;

    store.dispatch(
      applyMyStyleThunk(
        { kind: "block", placementId: first.id },
        "El meu estil",
      ),
    );
    store.dispatch(
      applyMyStyleThunk(
        { kind: "block", placementId: second.id },
        "El meu estil",
      ),
    );

    const styles = store.getState().document.styles ?? [];
    expect(styles).toHaveLength(1);
    const [a, b, c] = layoutOf(store).sheets[0].placements;
    expect(a.kind === "sequence" && a.styleId).toBe(styles[0].id);
    expect(b.kind === "sequence" && b.styleId).toBe(styles[0].id);
    expect(c.kind === "sequence" && c.styleId).toBeUndefined();
    expect(store.getState().style.undoSnackbar).toMatchObject({
      source: "myStyleBlock",
    });
  });

  it("es desfà sencer: els blocs i l'estil copiat", () => {
    const store = storeWithMyStyle();
    const before = store.getState().document;

    store.dispatch(
      applyMyStyleThunk({ kind: "sheet", sheetIndex: 0 }, "El meu estil"),
    );
    expect(selectCanUndoStyle(store.getState())).toBe(true);
    store.dispatch(undoStyleChangeThunk());

    expect(store.getState().document.pages).toEqual(before.pages);
    expect(store.getState().document.styles).toEqual(before.styles);
  });

  it("un document sense pàgines pròpies les fa explícites", () => {
    const store = createAppStore({ document: documentWith(2) });
    store.dispatch(
      applyMyStyleThunk({ kind: "sheet", sheetIndex: 0 }, "El meu estil"),
    );
    const { sheets } = layoutOf(store);
    expect(sheets).toHaveLength(1);
    expect(sheets[0].mode).toBe("auto");
    expect(
      sheets[0].placements.every(
        (placement) => placement.kind === "sequence" && placement.styleId,
      ),
    ).toBe(true);
  });
});

describe("«Actualitza amb el meu estil» i treure l'estil de bloc (R7)", () => {
  it("canvia tots els blocs amb aquell estil, també els d'altres pàgines, i es desfà", () => {
    const store = freeStore(3);
    const [first, second] = layoutOf(store).sheets[0].placements;
    store.dispatch(
      applyMyStyleThunk(
        { kind: "block", placementId: first.id },
        "El meu estil",
      ),
    );
    store.dispatch(
      applyMyStyleThunk(
        { kind: "block", placementId: second.id },
        "El meu estil",
      ),
    );
    const [before] = store.getState().document.styles ?? [];
    store.dispatch(
      updateDefaultSettingPictSequenceActionCreator({ textPosition: "top" }),
    );

    store.dispatch(
      updateMyStyleThunk({ kind: "block", placementId: first.id }),
    );

    const styles = store.getState().document.styles ?? [];
    expect(styles).toHaveLength(1);
    expect(styles[0]).toMatchObject({ id: before.id, name: before.name });
    expect(styles[0].pictSequence?.textPosition).toBe("top");
    expect(store.getState().style.undoSnackbar).toMatchObject({
      source: "myStyleUpdate",
    });
    store.dispatch(undoStyleChangeThunk());
    expect(store.getState().document.styles).toEqual([before]);
  });

  it("sense cap estil de bloc no fa res", () => {
    const store = freeStore(2);
    const before = store.getState().document;
    store.dispatch(updateMyStyleThunk({ kind: "sheet", sheetIndex: 0 }));
    expect(store.getState().document).toBe(before);
  });

  it("treure'l torna el bloc a l'estil del document, i es desfà", () => {
    const store = freeStore(2);
    const [first] = layoutOf(store).sheets[0].placements;
    store.dispatch(
      applyMyStyleThunk(
        { kind: "block", placementId: first.id },
        "El meu estil",
      ),
    );
    const applied = store.getState().document;

    store.dispatch(removeBlockStyleThunk(first.id));

    expect(layoutOf(store).sheets[0].placements[0]).not.toHaveProperty(
      "styleId",
    );
    expect(store.getState().document.styles).toEqual([]);
    expect(store.getState().style.undoSnackbar).toMatchObject({
      source: "blockStyleRemove",
    });
    store.dispatch(undoStyleChangeThunk());
    expect(store.getState().document.pages).toEqual(applied.pages);
    expect(store.getState().document.styles).toEqual(applied.styles);
  });
});
