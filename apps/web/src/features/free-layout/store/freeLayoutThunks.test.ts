import { describe, expect, it } from "vitest";
import { createAppStore } from "@/app/store";
import { sequenceFixture } from "@/test/fixtures/document";
import type { DocumentSAAC } from "@/types/document";
import {
  addNewSequenceActionCreator,
  addPictogramActionCreator,
  deleteLastSequenceActionCreator,
} from "@features/sequence/store/documentSlice";
import { pictogramFixture } from "@/test/fixtures/document";
import {
  resetSequencePictogramsThunk,
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
import type { PageDisposition } from "@/types/ui";
import { whereIs } from "../model/placementsOf";
import { stackTemplate } from "../model/templates";
import { layoutAreaMm } from "../model/placement";
import {
  addSequencesToSheetThunk,
  addSheetThunk,
  applyTemplateThunk,
  removePlacementThunk,
  removeSheetThunk,
  setLicenceOnThunk,
  setSheetDirectionThunk,
  setSheetGapThunk,
  setSheetModeThunk,
  setPlacementCommonThunk,
  setPlacementViewThunk,
  setSheetViewThunk,
  addNewSequenceThunk,
  adaptToScreenThunk,
  changePageLayoutThunk,
  syncNewDocumentPagesThunk,
  setSheetFreeThunk,
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

  it("a la pantalla sencera també es treballa en blocs, sobre el paper virtual de la pantalla", () => {
    const store = createAppStore({
      document: {
        ...documentWith(1),
        layout: {
          pageSize: "FULLSCREEN",
          orientation: "landscape",
          screen: { width: 1280, height: 720 },
        },
      },
    });
    store.dispatch(setSheetModeThunk(0, "template"));
    const [block] = layoutOf(store).sheets[0].placements;
    // Una sola seqüència: tot el full virtual (338,67 mm d'ample)
    expect(block).toMatchObject({ x: 0, y: 0 });
    expect((block as { w: number }).w).toBeCloseTo(338.667, 2);
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

describe("la disposició de les preferències (pas 7b)", () => {
  /** Un document nou i buit, i les preferències amb aquesta disposició. */
  const blankStore = (disposition: PageDisposition) => {
    const store = createAppStore({
      document: {
        id: "nou",
        content: { 0: [] },
        viewSettings: {},
        activeSAAC: 0,
      },
    });
    const ui = store.getState().ui.viewSettings;
    store.dispatch(
      viewSettingsActionCreator({ ...ui, pageSize: "A4", disposition }),
    );
    return store;
  };

  it("un document nou i buit comença amb la disposició, i la segueix en viu", () => {
    const store = blankStore("columns");
    store.dispatch(syncNewDocumentPagesThunk());
    const [sheet] = layoutOf(store).sheets;
    expect(sheet).toMatchObject({ mode: "template", template: "columns-1" });
    // No és un canvi de l'usuari: el document no queda «sense desar»
    expect(store.getState().documentStatus.changedAt).toBeNull();

    const ui = store.getState().ui.viewSettings;
    store.dispatch(viewSettingsActionCreator({ ...ui, disposition: "auto" }));
    store.dispatch(syncNewDocumentPagesThunk());
    expect(store.getState().document.pages).toBeUndefined();
  });

  it("un document amb feina no canvia", () => {
    const store = createAppStore({ document: documentWith(2) });
    const ui = store.getState().ui.viewSettings;
    store.dispatch(viewSettingsActionCreator({ ...ui, disposition: "rows" }));
    store.dispatch(syncNewDocumentPagesThunk());
    expect(store.getState().document.pages).toBeUndefined();
  });

  it("una pàgina nova neix amb la disposició de les preferències", () => {
    const store = freeStore(2);
    const ui = store.getState().ui.viewSettings;
    store.dispatch(viewSettingsActionCreator({ ...ui, disposition: "rows" }));
    store.dispatch(addSheetThunk(0));
    expect(layoutOf(store).sheets[1]).toMatchObject({
      mode: "template",
      template: "rows-1",
      placements: [],
    });
  });

  it("una seqüència nova va a l'última pàgina en columnes: una columna més", () => {
    const store = blankStore("columns");
    store.dispatch(syncNewDocumentPagesThunk());
    store.dispatch(addNewSequenceThunk(1));
    const [sheet] = layoutOf(store).sheets;
    expect(sheet.template).toBe("columns-2");
    expect(sheet.placements.map(keyOf)).toEqual([0, 1]);
  });
});

describe("els blocs de les pàgines lliures (pas 7c)", () => {
  const boxOf = (store: ReturnType<typeof createAppStore>, index = 0) => {
    const placement = layoutOf(store).sheets[0].placements[index];
    return {
      w: placement.kind !== "unknown" ? placement.w : 0,
      h: placement.kind !== "unknown" ? placement.h : 0,
    };
  };

  it("en passar a lliure, les caixes fan la mida dels pictogrames", () => {
    const store = freeStore(2);
    const before = boxOf(store);
    store.dispatch(setSheetFreeThunk(0));
    const after = boxOf(store);
    // En columnes, cada caixa feia tota l'alçada del full; ara, la d'una fila
    expect(after.h).toBeLessThan(before.h);
    expect(layoutOf(store).sheets[0].template).toBe("free");
  });

  it("si la seqüència creix per sobre de la caixa, la caixa creix; si es fa petita, no", () => {
    const store = freeStore(2);
    store.dispatch(setSheetFreeThunk(0));
    const fitted = boxOf(store);
    // Un pictograma més a la primera seqüència (l'activa)
    store.dispatch(addPictogramActionCreator(pictogramFixture()));
    const grown = boxOf(store);
    expect(grown.w).toBeGreaterThan(fitted.w);

    store.dispatch(deleteLastSequenceActionCreator());
    store.dispatch(
      setPlacementViewThunk(layoutOf(store).sheets[0].placements[0].id, {
        sizePict: 0.5,
      }),
    );
    expect(boxOf(store)).toEqual(grown);
  });
});

describe("«Restableix els pictogrames d'aquesta seqüència» (B35)", () => {
  it("treu els retocs de tots els pictogrames de la seqüència, encara que no sigui l'activa, i es desfà", () => {
    const document = documentWith(2);
    const style = createAppStore({ document }).getState();
    const textPosition =
      selectUserDefaultStyle(style).pictSequence.textPosition === "top"
        ? "bottom"
        : "top";
    document.content[1] = document.content[1].map((pict) => ({
      ...pict,
      settings: { ...pict.settings, textPosition },
    }));
    const store = createAppStore({ document });
    const before = store.getState().document.content;

    store.dispatch(resetSequencePictogramsThunk(1));

    const after = store.getState().document.content;
    after[1].forEach((pict) =>
      expect(pict.settings.textPosition).not.toBe(textPosition),
    );
    // L'altra seqüència no es toca
    expect(after[0]).toEqual(before[0]);
    expect(store.getState().style.undoSnackbar).toMatchObject({
      source: "resetSequence",
    });
    store.dispatch(undoStyleChangeThunk());
    expect(store.getState().document.content[1]).toEqual(before[1]);
  });
});

describe("la pantalla sencera amb blocs", () => {
  const SCREEN = { width: 1280, height: 720 };
  const box = (placement: unknown) =>
    placement as { x: number; y: number; w: number; h: number };

  it("passar-hi desa la pantalla d'ara i hi recol·loca els blocs; tornar al paper l'oblida", () => {
    const store = freeStore(2);
    const base = store.getState().document.layout!;
    const [first] = layoutOf(store).sheets[0].placements;
    expect(box(first).w).toBeCloseTo(200, 3);

    store.dispatch(
      changePageLayoutThunk(
        { pageSize: "FULLSCREEN", orientation: "landscape" },
        base,
      ),
    );
    const layout = store.getState().document.layout!;
    // jsdom no té pantalla: la de 1280 × 720
    expect(layout).toMatchObject({ pageSize: "FULLSCREEN", screen: SCREEN });
    // El bloc de la plantilla fa tot l'ample del full virtual
    const [moved] = layoutOf(store).sheets[0].placements;
    expect(box(moved).w).toBeCloseTo(layoutAreaMm(layout).w, 3);

    store.dispatch(changePageLayoutThunk({ pageSize: "A4" }, layout));
    const paper = store.getState().document.layout!;
    expect(paper).not.toHaveProperty("screen");
    expect(box(layoutOf(store).sheets[0].placements[0]).w).toBeCloseTo(
      layoutAreaMm(paper).w,
      3,
    );
  });

  it("entre dos papers, els blocs no es mouen, com sempre", () => {
    const store = freeStore(2);
    const before = layoutOf(store);
    store.dispatch(
      changePageLayoutThunk(
        { pageSize: "A3" },
        store.getState().document.layout!,
      ),
    );
    expect(layoutOf(store)).toBe(before);
  });

  it("adaptar-la a una altra pantalla recol·loca els blocs, i es pot desfer", () => {
    const store = createAppStore({
      document: {
        ...documentWith(2),
        layout: {
          pageSize: "FULLSCREEN",
          orientation: "landscape",
          // Feta en una pantalla 4:3
          screen: { width: 1024, height: 768 },
        },
      },
    });
    store.dispatch(setSheetModeThunk(0, "template"));
    const before = store.getState().document;

    store.dispatch(adaptToScreenThunk());
    const adapted = store.getState().document;
    expect(adapted.layout?.screen).toEqual(SCREEN);
    expect(adapted.pages).not.toBe(before.pages);
    expect(box(adapted.pages!.sheets[0].placements[0]).w).toBeCloseTo(
      layoutAreaMm(adapted.layout!).w,
      3,
    );
    expect(store.getState().style.undoSnackbar?.source).toBe("adaptScreen");
    expect(selectCanUndoStyle(store.getState())).toBe(true);

    store.dispatch(undoStyleChangeThunk());
    expect(store.getState().document.layout).toBe(before.layout);
    expect(store.getState().document.pages).toBe(before.pages);
  });

  it("la pantalla desada no fa res amb un paper: adaptar no hi fa res", () => {
    const store = freeStore(1);
    const before = store.getState().document;
    store.dispatch(adaptToScreenThunk());
    expect(store.getState().document).toBe(before);
  });
});
