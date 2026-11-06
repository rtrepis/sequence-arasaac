// Les accions de la disposició lliure (ADR-005): les fan servir la columna de
// la vista, la capçalera de cada pàgina i el menú de cada caixa. Calculen la
// disposició nova amb les funcions pures de `model/` i la desen al document.
// Les que substitueixen feina es poden desfer amb el snackbar de sempre
// (`undoableStyleChangeThunk`), que és l'únic desfer de l'app.
import type { AnyAction } from "@reduxjs/toolkit";
import type { AppThunk, RootState } from "@/app/store";
import type {
  DocumentLayout,
  FreeLayout,
  PageLayoutMode,
  PlacementColumns,
} from "@/types/document";
import {
  freeLayoutChangedActionCreator,
  layoutModeChangedActionCreator,
  userLayoutOf,
} from "@features/sequence/store/documentSlice";
import {
  FreeLayoutChangeSource,
  undoableStyleChangeThunk,
} from "@features/sequence/store/styleSlice";
import { newSaacId } from "@features/sequence/saac/serialize";
import { SheetArea, sheetAreaMm } from "../model/placement";
import {
  addSequencesToSheet,
  applyTemplateToSheet,
  buildInitialLayout,
} from "../model/distribute";
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

/** Si el document és en mode lliure. */
export const selectIsFreeLayout = (state: RootState): boolean =>
  state.document.layout?.mode === "free";

/** L'àrea útil d'un full del document, en mm. `null` amb la pantalla completa. */
export const selectSheetArea = (state: RootState): SheetArea | null => {
  const { pageSize, orientation } = selectPageLayout(state);
  return sheetAreaMm(pageSize ?? "A4", orientation ?? "landscape");
};

/** La disposició lliure del document, si en té. */
export const selectFreeLayout = (state: RootState): FreeLayout | undefined =>
  state.document.freeLayout;

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
 * Canvia la disposició lliure amb `change`. Si es passa `source`, el canvi es
 * pot desfer i en surt el snackbar amb «Desfés»; si no, no substitueix res i
 * qui l'ha demanat diu el seu missatge.
 */
const changeFreeLayout =
  (
    change: (layout: FreeLayout, area: SheetArea) => FreeLayout,
    source?: FreeLayoutChangeSource,
  ): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { freeLayout } = state.document;
    const area = selectSheetArea(state);
    if (!freeLayout || !area) return;
    const action = (): AnyAction =>
      freeLayoutChangedActionCreator(change(freeLayout, area));
    if (source) dispatch(undoableStyleChangeThunk(action, source));
    else dispatch(action());
  };

/**
 * La disposició de partida, si el document és en mode lliure i encara no en
 * té: un document que passa a «Lliure» per primer cop, o un fitxer que ho
 * diu però no porta cap pàgina.
 */
export const ensureFreeLayoutThunk = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const area = selectSheetArea(state);
  if (!selectIsFreeLayout(state) || state.document.freeLayout || !area) return;
  dispatch(
    freeLayoutChangedActionCreator(
      buildInitialLayout(selectSequenceKeys(state), {
        area,
        direction: selectPageLayout(state).direction ?? "row",
        newId: newLayoutId,
      }),
    ),
  );
};

/**
 * «Disposició: Automàtica / Lliure». Passar a lliure no substitueix res: si ja
 * hi havia una disposició lliure, es recupera tal com era. Tornar a automàtica
 * tampoc no l'esborra, però en desar no s'escriu: per això es pot desfer.
 */
export const setLayoutModeThunk =
  (mode: PageLayoutMode): AppThunk =>
  (dispatch, getState) => {
    const base = selectPageLayout(getState());
    const action = () => layoutModeChangedActionCreator({ mode, base });
    if (mode === "flow") {
      dispatch(undoableStyleChangeThunk(action, "layoutFlow"));
      return;
    }
    dispatch(action());
    dispatch(ensureFreeLayoutThunk());
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
  changeFreeLayout((layout) => addSheet(layout, afterIndex, newLayoutId));

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
    const { freeLayout } = getState().document;
    const found = freeLayout && findPlacement(freeLayout, placementId);
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
    updatePlacement(layout, placementId, (placement) => ({
      ...placement,
      columns,
    })),
  );
