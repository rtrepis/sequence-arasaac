// Els estils amb nom a la cascada d'estil (`docs/fonaments/03-model-contingut-estil.md`, §4):
//
//   document → estil de la seqüència, o el reassignat del bloc → pictograma
//
// L'estil de la seqüència i el reassignat d'un bloc són estils amb nom
// (`styles`). El reassignat **substitueix** el de la seqüència, no s'hi suma:
// un bloc té un sol estil (pla dels estils, D10). L'estil de la seqüència només
// porta l'estil (pictogrames i targeta); la distribució (`view`) és de la
// seqüència i del bloc, i no en surt.
import type { NamedStyle, SequenceStyle } from "@/types/document";
import { mergeDeep } from "@features/sequence/saac/cascade";
import { DEFAULT_FITZGERALD_CATEGORY_COLORS } from "@features/sequence/saac/fitzgerald";

/** L'estil amb nom amb aquest `id`, si n'hi ha cap al document. */
export const namedStyleOf = (
  styles: readonly NamedStyle[] | undefined,
  styleId: string | undefined,
): NamedStyle | undefined =>
  styleId === undefined ? undefined : styles?.find(({ id }) => id === styleId);

/**
 * L'estil del document retocat per un estil amb nom: és el que es fa servir
 * per pintar les targetes que el fan servir.
 */
export const styleWithNamed = (
  style: SequenceStyle,
  named: NamedStyle | undefined,
): SequenceStyle =>
  named === undefined
    ? style
    : {
        ...style,
        pictApiAra: { ...style.pictApiAra, ...named.pictApiAra },
        pictSequence: mergeDeep(style.pictSequence, named.pictSequence),
        view: { ...style.view, ...named.view },
        fitzgeraldColors: named.fitzgeraldColors
          ? {
              ...(style.fitzgeraldColors ?? DEFAULT_FITZGERALD_CATEGORY_COLORS),
              ...named.fitzgeraldColors,
            }
          : style.fitzgeraldColors,
      };

/** El que cal saber del document per resoldre l'estil d'una seqüència. */
export interface SequenceStyleSource {
  styles?: readonly NamedStyle[];
  sequenceStyleIds?: { readonly [key: number]: string };
}

/**
 * L'estil amb nom de les targetes d'una seqüència en un bloc: el reassignat
 * del bloc (`styleId`) si en té un que existeixi, i si no el de la seqüència.
 * `undefined`: l'estil del document.
 */
export const cardNamedStyleOf = (
  document: SequenceStyleSource,
  sequenceKey: number,
  styleId?: string,
): NamedStyle | undefined =>
  namedStyleOf(document.styles, styleId) ??
  namedStyleOf(document.styles, document.sequenceStyleIds?.[sequenceKey]);

/**
 * L'estil amb què es pinten els pictogrames d'una seqüència (sense bloc: a
 * l'edició i a la pàgina simple): el del document retocat pel de la seqüència.
 * La distribució de l'estil amb nom no hi entra: és de la seqüència.
 */
export const sequenceStyleOf = (
  style: SequenceStyle,
  document: SequenceStyleSource,
  sequenceKey: number,
): SequenceStyle => {
  const named = cardNamedStyleOf(document, sequenceKey);
  return named === undefined
    ? style
    : { ...styleWithNamed(style, named), view: style.view };
};
