// L'aspecte d'un bloc, amb la cascada del fonament 03: per a l'estil,
// document → estil de la seqüència, o el reassignat del bloc → pictograma; per
// a la distribució, document → seqüència → estil reassignat del bloc (els
// d'abans en porten) → bloc. Cada nivell només porta el que canvia. Vegeu
// `docs/decisions/ADR-005-disposicio-lliure.md`.
import type {
  DocumentPages,
  NamedStyle,
  PagePlacement,
  SequenceAlignmentH,
  SequenceAlignmentV,
  SequenceViewSettings,
  TextPlacement,
} from "@/types/document";
import type { Font } from "@/types/sequence";
import {
  cardNamedStyleOf,
  namedStyleOf,
  type SequenceStyleSource,
} from "@features/sequence/style/namedStyle";

// La resolució dels estils amb nom (el de la seqüència i el reassignat del
// bloc) viu amb l'estil, a `features/sequence/style/namedStyle.ts`
export {
  cardNamedStyleOf,
  namedStyleFrom,
  namedStyleOf,
  styleWithNamed,
  uniqueStyleName,
  type MyStyleCopy,
} from "@features/sequence/style/namedStyle";

/**
 * La vista d'un bloc de seqüència: la de la seqüència (que ja porta la del
 * document), retocada per l'estil amb nom del bloc i pel retoc del bloc.
 */
export const resolveBlockView = (
  sequenceView: SequenceViewSettings,
  named: NamedStyle | undefined,
  blockView: Partial<SequenceViewSettings> | undefined,
): SequenceViewSettings => ({
  ...sequenceView,
  ...named?.view,
  ...blockView,
});

/**
 * El retoc que cal desar perquè un bloc es vegi amb `view`: només el que es
 * diferencia de `base` (la vista de la seqüència amb l'estil amb nom), com la
 * resta de la cascada. Sense cap diferència, `undefined`: el bloc no porta retoc.
 */
export const blockViewRetouch = (
  base: SequenceViewSettings,
  view: SequenceViewSettings,
): Partial<SequenceViewSettings> | undefined => {
  const retouch: Partial<SequenceViewSettings> = {};
  if (view.sizePict !== base.sizePict) retouch.sizePict = view.sizePict;
  if (view.pictSpaceBetween !== base.pictSpaceBetween)
    retouch.pictSpaceBetween = view.pictSpaceBetween;
  if (view.alignmentH !== base.alignmentH) retouch.alignmentH = view.alignmentH;
  if (view.alignmentV !== base.alignmentV) retouch.alignmentV = view.alignmentV;
  return Object.keys(retouch).length > 0 ? retouch : undefined;
};

/** L'aspecte resolt d'un bloc de text. */
export interface ResolvedTextStyle {
  font: Font;
  bold: boolean;
  alignmentH: SequenceAlignmentH;
  alignmentV: SequenceAlignmentV;
}

/** Sense retoc, un rètol va centrat i sense negreta. */
export const TEXT_BLOCK_DEFAULTS: Omit<ResolvedTextStyle, "font"> = {
  bold: false,
  alignmentH: "center",
  alignmentV: "center",
};

/**
 * L'aspecte d'un bloc de text: la lletra de les targetes del document (perquè
 * el rètol i les targetes facin joc), la de l'estil amb nom si en té, i el
 * retoc del bloc.
 */
export const resolveTextBlockStyle = (
  documentFont: Font,
  named: NamedStyle | undefined,
  block: Pick<TextPlacement, "textStyle">,
): ResolvedTextStyle => {
  const { font, ...rest } = block.textStyle ?? {};
  return {
    ...TEXT_BLOCK_DEFAULTS,
    ...rest,
    font: { ...documentFont, ...named?.pictSequence?.font, ...font },
  };
};

// --- L'aspecte de les targetes d'un bloc ---

/**
 * La clau amb què es mesura la targeta d'una seqüència en un bloc: la
 * seqüència sola, o la seqüència amb l'estil amb nom que la pinta (el seu o el
 * reassignat del bloc, `cardNamedStyleOf`), que en pot canviar la lletra i les
 * vores i, per tant, la mida.
 */
export const cardMeasureKey = (
  sequenceKey: number,
  styleId: string | undefined,
): string =>
  styleId === undefined ? String(sequenceKey) : `${sequenceKey}@${styleId}`;

// --- L'estil reassignat d'un bloc (pla dels estils, pas 6) ---

/**
 * Reassigna l'estil d'un bloc (`styleId`), o li treu la reassignació
 * (`undefined`: torna a l'estil de la seqüència). Només canvia aquell bloc,
 * també si és comú; la seva distribució es queda.
 */
export const withPlacementStyle = (
  pages: DocumentPages,
  placementId: string,
  styleId: string | undefined,
): DocumentPages => {
  const change = (placement: PagePlacement): PagePlacement => {
    if (placement.kind === "unknown" || placement.id !== placementId)
      return placement;
    const next = { ...placement };
    if (styleId === undefined) delete next.styleId;
    else next.styleId = styleId;
    return next;
  };
  return {
    ...pages,
    sheets: pages.sheets.map((sheet) =>
      sheet.placements.some(({ id }) => id === placementId)
        ? { ...sheet, placements: sheet.placements.map(change) }
        : sheet,
    ),
    common: pages.common.map(change),
  };
};

/**
 * La mida mesurada de la targeta d'un bloc: la de la seqüència amb l'estil amb
 * nom que la pinta (`cardNamedStyleOf`), o la de la seqüència sola si aquesta
 * no s'ha mesurat (encara, o perquè l'estil amb nom ja no hi és).
 */
export const cardSizeOf = <T>(
  sizes: Record<string, T>,
  document: SequenceStyleSource,
  sequenceKey: number,
  styleId: string | undefined,
): T | undefined =>
  sizes[
    cardMeasureKey(
      sequenceKey,
      cardNamedStyleOf(document, sequenceKey, styleId)?.id,
    )
  ] ?? sizes[String(sequenceKey)];
