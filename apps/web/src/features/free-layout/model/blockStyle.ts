// L'aspecte d'un bloc, amb la cascada del fonament 03 ampliada amb els estils
// amb nom: document → seqüència → estil amb nom del bloc → bloc → pictograma.
// Cada nivell només porta el que canvia. Vegeu
// `docs/decisions/ADR-005-disposicio-lliure.md`.
import type {
  NamedStyle,
  SequenceAlignmentH,
  SequenceAlignmentV,
  SequenceViewSettings,
  TextPlacement,
} from "@/types/document";
import type { Font } from "@/types/sequence";

/** L'estil amb nom que fa servir el bloc, si en fa servir cap que existeixi. */
export const namedStyleOf = (
  styles: readonly NamedStyle[] | undefined,
  styleId: string | undefined,
): NamedStyle | undefined =>
  styleId === undefined ? undefined : styles?.find(({ id }) => id === styleId);

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
