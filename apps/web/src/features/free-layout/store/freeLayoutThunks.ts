// Les accions sobre les pàgines del document (ADR-005): les fan servir la
// columna de la vista, la capçalera de cada pàgina i el menú de cada bloc.
// Calculen les pàgines noves amb les funcions pures de `model/` i les desen al
// document.
// Les que substitueixen feina es poden desfer amb el snackbar de sempre
// (`undoableStyleChangeThunk`), que és l'únic desfer de l'app.
import type { AnyAction } from "@reduxjs/toolkit";
import type { AppThunk, RootState } from "@/app/store";
import type {
  DocumentLayout,
  DocumentPages,
  PlacementColumns,
  SequenceViewSettings,
} from "@/types/document";
import {
  pagesChangedActionCreator,
  userLayoutOf,
} from "@features/sequence/store/documentSlice";
import {
  FreeLayoutChangeSource,
  undoableStyleChangeThunk,
} from "@features/sequence/store/styleSlice";
import { newSaacId } from "@features/sequence/saac/serialize";
import { SheetArea, sheetAreaMm } from "../model/placement";
import { addSequencesToSheet, applyTemplateToSheet } from "../model/distribute";
import {
  blockViewRetouch,
  namedStyleOf,
  resolveBlockView,
} from "../model/blockStyle";
import { selectResolvedSequenceViews } from "@features/sequence/style/styleSelectors";
import { hasTemplatePages, toAutoPages, toTemplatePages } from "../model/pages";
import {
  NewLayoutId,
  addSheet,
  copyPlacementToSheet,
  duplicateSheet,
  findPlacement,
  makeCommon,
  makeLocal,
  moveSheet,
  removePlacement,
  removeSheet,
  updatePlacement,
} from "../model/sheets";
import { LayoutTemplate } from "../model/templates";

/** Identificadors nous de fulls i col·locacions: els mateixos que escriu el fitxer. */
const newLayoutId: NewLayoutId = (prefix) => newSaacId(prefix);

/** La pàgina del document: la seva, o la de les preferències si encara l'hereta. */
export const selectPageLayout = (state: RootState): DocumentLayout =>
  state.document.layout ?? userLayoutOf(state);

/**
 * «Disposició: Lliure»: si alguna pàgina del document té caixes. Mentre la
 * vista no pinti les pàgines automàtiques soles, un document amb totes les
 * pàgines automàtiques es pinta com sempre, amb totes les seqüències.
 */
export const selectIsFreeLayout = (state: RootState): boolean =>
  hasTemplatePages(state.document.pages);

/** L'àrea útil d'un full del document, en mm. `null` amb la pantalla completa. */
export const selectSheetArea = (state: RootState): SheetArea | null => {
  const { pageSize, orientation } = selectPageLayout(state);
  return sheetAreaMm(pageSize ?? "A4", orientation ?? "landscape");
};

/** Les pàgines del document, si en té de pròpies. */
export const selectPages = (state: RootState): DocumentPages | undefined =>
  state.document.pages;

/** Els estils amb nom del document. */
export const selectNamedStyles = (state: RootState) => state.document.styles;

/** Els pictogrames de cada seqüència del document. */
export const selectDocumentContent = (state: RootState) =>
  state.document.content;

/** El que el fitxer portava de cada seqüència i l'app no fa servir (el títol…). */
export const selectSequenceExtras = (state: RootState) =>
  state.document.saacExtra?.sequences;

/** Les claus de les seqüències del document, en l'ordre de les pestanyes. */
export const selectSequenceKeys = (state: RootState): number[] =>
  Object.keys(state.document.content)
    .map(Number)
    .sort((a, b) => a - b);

/**
 * Canvia les pàgines amb `change`. Si es passa `source`, el canvi es pot
 * desfer i en surt el snackbar amb «Desfés»; si no, no substitueix res i qui
 * l'ha demanat diu el seu missatge.
 */
const changeFreeLayout =
  (
    change: (pages: DocumentPages, area: SheetArea) => DocumentPages,
    source?: FreeLayoutChangeSource,
  ): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { pages } = state.document;
    const area = selectSheetArea(state);
    if (!pages || !area) return;
    const action = (): AnyAction =>
      pagesChangedActionCreator(change(pages, area));
    if (source) dispatch(undoableStyleChangeThunk(action, source));
    else dispatch(action());
  };

/**
 * «Disposició: Automàtica / Lliure», per a tot el document mentre la columna
 * no ho ofereixi pàgina a pàgina. «Lliure» posa caixes a totes les pàgines: les
 * que ja en tenien les recuperen tal com eren, i un document sense pàgines rep
 * la disposició de partida. «Automàtica» no esborra res (la plantilla i les
 * caixes es conserven), però canvia el que es desa: per això es pot desfer.
 */
export const setLayoutModeThunk =
  (mode: "flow" | "free"): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { pages } = state.document;
    if (mode === "flow") {
      if (!pages) return;
      dispatch(
        undoableStyleChangeThunk(
          () => pagesChangedActionCreator(toAutoPages(pages)),
          "layoutFlow",
        ),
      );
      return;
    }
    const area = selectSheetArea(state);
    if (!area) return;
    dispatch(
      pagesChangedActionCreator(
        toTemplatePages(pages, selectSequenceKeys(state), {
          area,
          direction: selectPageLayout(state).direction ?? "row",
          newId: newLayoutId,
        }),
      ),
    );
  };

/** Afegeix seqüències a una pàgina i la torna a repartir (es pot desfer). */
export const addSequencesToSheetThunk =
  (sheetIndex: number, sequenceKeys: readonly number[]): AppThunk =>
  (dispatch, getState) => {
    const direction = selectPageLayout(getState()).direction ?? "row";
    dispatch(
      changeFreeLayout(
        (layout, area) =>
          addSequencesToSheet(layout, sheetIndex, sequenceKeys, {
            area,
            direction,
            newId: newLayoutId,
          }),
        "layoutAddSequences",
      ),
    );
  };

/** Aplica una plantilla a una pàgina (es pot desfer). */
export const applyTemplateThunk = (
  sheetIndex: number,
  template: LayoutTemplate,
): AppThunk =>
  changeFreeLayout(
    (layout, area) => applyTemplateToSheet(layout, sheetIndex, template, area),
    "layoutTemplate",
  );

/** Una pàgina nova, buida, darrere de `afterIndex`. */
export const addSheetThunk = (afterIndex: number): AppThunk =>
  changeFreeLayout((layout) =>
    addSheet(layout, afterIndex, newLayoutId, "template"),
  );

/** Una còpia de la pàgina, darrere de l'original. */
export const duplicateSheetThunk = (index: number): AppThunk =>
  changeFreeLayout((layout) => duplicateSheet(layout, index, newLayoutId));

/** Canvia una pàgina de lloc. */
export const moveSheetThunk = (from: number, to: number): AppThunk =>
  changeFreeLayout((layout) => moveSheet(layout, from, to));

/** Esborra una pàgina i les seves col·locacions (es pot desfer). */
export const removeSheetThunk = (index: number): AppThunk =>
  changeFreeLayout(
    (layout) => removeSheet(layout, index, newLayoutId),
    "layoutRemoveSheet",
  );

/** Treu aquesta col·locació, i prou (es pot desfer). */
export const removePlacementThunk = (placementId: string): AppThunk =>
  changeFreeLayout(
    (layout) => removePlacement(layout, placementId),
    "layoutRemovePlacement",
  );

/** Una còpia independent de la col·locació a una altra pàgina. */
export const copyPlacementToSheetThunk = (
  placementId: string,
  sheetIndex: number,
): AppThunk =>
  changeFreeLayout((layout) =>
    copyPlacementToSheet(layout, placementId, sheetIndex, newLayoutId),
  );

/**
 * «A totes les pàgines». Posar-la-hi no treu res; treure-la la deixa només a
 * la pàgina on s'és i la treu de les altres, i per això es pot desfer.
 */
export const setPlacementCommonThunk =
  (placementId: string, common: boolean, sheetIndex: number): AppThunk =>
  (dispatch, getState) => {
    const { pages } = getState().document;
    const found = pages && findPlacement(pages, placementId);
    if (!found || (found.location === "common") === common) return;
    dispatch(
      common
        ? changeFreeLayout((layout) => makeCommon(layout, placementId))
        : changeFreeLayout(
            (layout) => makeLocal(layout, placementId, sheetIndex),
            "layoutUncommon",
          ),
    );
  };

/** Les columnes de la graella d'una caixa. */
export const setPlacementColumnsThunk = (
  placementId: string,
  columns: PlacementColumns,
): AppThunk =>
  changeFreeLayout((layout) =>
    updatePlacement(layout, placementId, (placement) =>
      placement.kind === "sequence" ? { ...placement, columns } : placement,
    ),
  );

/**
 * Canvia la vista d'un bloc de seqüència (el nivell «Bloc» de la columna, M1).
 * Es desa només el retoc: el que es diferencia de la vista de la seqüència
 * retocada per l'estil amb nom del bloc. Les altres còpies de la seqüència no
 * canvien.
 */
export const setPlacementViewThunk =
  (placementId: string, change: Partial<SequenceViewSettings>): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { pages, styles } = state.document;
    const found = pages && findPlacement(pages, placementId);
    if (!found || found.placement.kind !== "sequence") return;
    const sequenceView =
      selectResolvedSequenceViews(state)[found.placement.sequenceKey];
    if (!sequenceView) return;
    const base = resolveBlockView(
      sequenceView,
      namedStyleOf(styles, found.placement.styleId),
      undefined,
    );
    const view = blockViewRetouch(base, {
      ...resolveBlockView(base, undefined, found.placement.view),
      ...change,
    });
    dispatch(
      changeFreeLayout((layout) =>
        updatePlacement(layout, placementId, (placement) => {
          if (placement.kind !== "sequence") return placement;
          const next = { ...placement, view };
          // Sense retoc, el bloc no en porta cap: el fitxer no l'escriu
          if (!view) delete next.view;
          return next;
        }),
      ),
    );
  };
