// La mida dels blocs de les pàgines lliures (pas 7c): en passar una pàgina a
// «Lliure» les caixes fan la mida justa dels seus pictogrames, i després un
// bloc creix si la seqüència li creix per sobre. Si la seqüència es fa més
// petita, la caixa no canvia; si l'usuari fa la caixa més petita, la seqüència
// s'hi adapta (la mida és un màxim, Q2). Vegeu l'ADR-005, decisió 26.
import { createListenerMiddleware } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import type { PagePlacement, SequencePlacement } from "@/types/document";
import { pagesChangedActionCreator } from "@features/sequence/store/documentSlice";
import { selectResolvedSequenceViews } from "@features/sequence/style/styleSelectors";
import type { CardPx } from "../model/blockGrid";
import {
  cardSizeOf,
  namedStyleOf,
  resolveBlockView,
} from "../model/blockStyle";
import { NaturalBoxOf, grownBox, naturalBoxMm } from "../model/naturalBox";
import { dispositionOf } from "../model/pages";
import { sheetAreaMm } from "../model/placement";
import { userLayoutOf } from "@features/sequence/store/documentSlice";

// --- Les targetes mesurades ---

// La vista mesura les targetes de cada seqüència (`CardBaseMeasurer`) i les
// guarda aquí, perquè les regles de sota puguin fer la mida justa d'un bloc
// també quan la vista no hi és (afegir pictogrames a l'edició). Sense mesura,
// la targeta de reserva.
let measuredCards: Record<string, CardPx> = {};

/** La vista hi deixa les targetes que acaba de mesurar. */
export const rememberCardSizes = (sizes: Record<string, CardPx>): void => {
  measuredCards = sizes;
};

/**
 * La caixa justa de cada bloc de seqüència amb l'estat d'ara, o `null` si el
 * full no té mil·límetres (la pantalla completa).
 */
export const naturalBoxOfState = (state: RootState): NaturalBoxOf | null => {
  const { pageSize, orientation } =
    state.document.layout ?? userLayoutOf(state);
  const area = sheetAreaMm(pageSize ?? "A4", orientation ?? "landscape");
  if (!area) return null;
  const views = selectResolvedSequenceViews(state);
  const { content, styles } = state.document;
  return (placement: SequencePlacement) =>
    naturalBoxMm({
      count: content[placement.sequenceKey]?.length ?? 0,
      card: cardSizeOf(measuredCards, placement.sequenceKey, placement.styleId),
      view: resolveBlockView(
        views[placement.sequenceKey],
        namedStyleOf(styles, placement.styleId),
        placement.view,
      ),
      columns: placement.columns,
      area,
    });
};

// --- Créixer quan la seqüència creix ---

const isSequence = (placement: PagePlacement): placement is SequencePlacement =>
  placement.kind === "sequence";

export const blockGrowthListener = createListenerMiddleware();

blockGrowthListener.startListening({
  predicate: (_action, current, previous) =>
    (current as RootState).document !== (previous as RootState).document &&
    (current as RootState).document.pages !== undefined,
  effect: (_action, api) => {
    const now = api.getState() as RootState;
    const before = api.getOriginalState() as RootState;
    const pages = now.document.pages;
    const previousPages = before.document.pages;
    if (!pages || !previousPages) return;
    const naturalNow = naturalBoxOfState(now);
    const naturalBefore = naturalBoxOfState(before);
    if (!naturalNow || !naturalBefore) return;
    const { pageSize, orientation } = now.document.layout ?? userLayoutOf(now);
    const area = sheetAreaMm(pageSize ?? "A4", orientation ?? "landscape");
    if (!area) return;

    const previous = new Map(
      previousPages.sheets
        .flatMap((sheet) => sheet.placements)
        .filter(isSequence)
        .map((placement) => [placement.id, placement]),
    );
    let changed = false;
    const sheets = pages.sheets.map((sheet) => {
      if (dispositionOf(sheet) !== "free") return sheet;
      let sheetChanged = false;
      const placements = sheet.placements.map((placement) => {
        const old = isSequence(placement)
          ? previous.get(placement.id)
          : undefined;
        if (!old || !isSequence(placement)) return placement;
        const grown = grownBox(
          placement,
          naturalBefore(old),
          naturalNow(placement),
          area,
        );
        if (!grown) return placement;
        sheetChanged = true;
        return grown;
      });
      if (!sheetChanged) return sheet;
      changed = true;
      return { ...sheet, placements };
    });
    if (changed) api.dispatch(pagesChangedActionCreator({ ...pages, sheets }));
  },
});
