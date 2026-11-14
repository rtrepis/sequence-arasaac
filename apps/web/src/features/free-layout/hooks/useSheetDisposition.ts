import type { RootState } from "@/app/store";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { isBoxed } from "@features/free-layout/model/placement";
import {
  Arrangement,
  LayoutTemplate,
  arrangementOf,
  arrangementTemplate,
} from "@features/free-layout/model/templates";
import {
  selectPages,
  setSheetFreeThunk,
  setSheetModeThunk,
} from "@features/free-layout/store/freeLayoutThunks";

/** Quantes seqüències té el document (un número, perquè no torni a pintar). */
const selectSequenceCount = (state: RootState): number =>
  Object.keys(state.document.content).length;

/** Quantes columnes o files com a molt es poden triar. */
export const MAX_LINES = 6;

/** Els modes del repartiment d'una pàgina en blocs. */
export type ArrangementMode = "columns" | "rows" | "free";

/**
 * La disposició d'una pàgina, en una sola tria: simple (`auto`, les
 * seqüències una darrere l'altra) o en blocs repartits en columnes, en files
 * o lliures. Una plantilla aplicada és lliure, amb espais per omplir.
 */
export type Disposition = "auto" | ArrangementMode;

export interface SheetDisposition {
  disposition: Disposition;
  arrangement: Arrangement;
  /** Quants blocs amb caixa té la pàgina */
  count: number;
  change: (next: Disposition) => void;
}

/**
 * La disposició d'una pàgina i com es canvia, la mateixa a la columna (nivell
 * «Pàgina») i al menú «⋯» de la pàgina. `apply` aplica una plantilla amb
 * l'avís de si no hi cap tot (`useApplyTemplate`).
 */
export const useSheetDisposition = (
  sheetIndex: number,
  apply: (template: LayoutTemplate) => void,
): SheetDisposition => {
  const dispatch = useAppDispatch();
  const pages = useAppSelector(selectPages);
  // Sense pàgines pròpies, la pàgina única té totes les seqüències
  const sequenceCount = useAppSelector(selectSequenceCount);
  const sheet = pages?.sheets[sheetIndex];
  const mode = sheet?.mode ?? "auto";
  const count = sheet
    ? sheet.placements.filter(isBoxed).length
    : pages
      ? 0
      : sequenceCount;
  const arrangement = arrangementOf(sheet?.template);
  const arrangementMode: ArrangementMode =
    arrangement.kind === "template" ? "free" : arrangement.kind;
  const disposition: Disposition = mode === "auto" ? "auto" : arrangementMode;
  // Tants com blocs, com a molt els que es poden triar
  const lines = Math.min(Math.max(count, 1), MAX_LINES);

  const change = (next: Disposition) => {
    if (next === disposition) return;
    if (next === "auto") {
      dispatch(setSheetModeThunk(sheetIndex, "auto"));
      return;
    }
    if (mode === "auto") {
      // Si es torna al repartiment que tenia, les caixes d'abans hi tornen
      if (sheet?.template !== undefined && arrangementMode === next) {
        dispatch(setSheetModeThunk(sheetIndex, "template"));
        return;
      }
      if (next === "free") {
        dispatch(setSheetModeThunk(sheetIndex, "template"));
        dispatch(setSheetFreeThunk(sheetIndex));
        return;
      }
      apply(arrangementTemplate(next, lines, count));
      return;
    }
    // Lliure no mou res: els blocs es queden on són
    if (next === "free") {
      dispatch(setSheetFreeThunk(sheetIndex));
      return;
    }
    // De columnes a files (o al revés) es queda el nombre
    const n = arrangement.kind === "template" ? lines : arrangement.n;
    apply(arrangementTemplate(next, n, count));
  };

  return { disposition, arrangement, count, change };
};
