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
import { deepEqual } from "./styleModel";

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

// --- Copiar un estil al document (la Galeria d'estils, «Aplica el meu estil») ---

/** L'`id` i el nom de l'estil amb nom que es copia al document. */
export interface MyStyleCopy {
  id: string;
  name: string;
}

/**
 * Un estil sencer com a estil amb nom: l'**estil** dels pictogrames (la
 * targeta, el color, la pell i el cabell). La **distribució** (mida, espai i
 * alineació) no hi va: és de la seqüència, del bloc o de la pàgina, i triar un
 * estil no la toca. Els estils de bloc d'abans que en porten es continuen
 * pintant.
 */
export const namedStyleFrom = (
  style: SequenceStyle,
  { id, name }: MyStyleCopy,
): NamedStyle => ({
  id,
  name,
  pictApiAra: { ...style.pictApiAra },
  pictSequence: JSON.parse(
    JSON.stringify(style.pictSequence),
  ) as NamedStyle["pictSequence"],
  ...(style.fitzgeraldColors && {
    fitzgeraldColors: { ...style.fitzgeraldColors },
  }),
});

/**
 * Un nom que cap altre estil amb nom del document no fa servir: el nom, o el
 * nom amb un número («El meu estil 2»).
 */
export const uniqueStyleName = (
  styles: readonly NamedStyle[] | undefined,
  name: string,
): string => {
  const taken = new Set((styles ?? []).map((style) => style.name));
  if (!taken.has(name)) return name;
  let n = 2;
  while (taken.has(`${name} ${n}`)) n += 1;
  return `${name} ${n}`;
};

/** Dos estils amb nom diuen el mateix (el nom i l'`id` no compten). */
export const sameNamedContent = (a: NamedStyle, b: NamedStyle): boolean =>
  deepEqual(
    { ...a, id: "", name: "", extra: undefined },
    { ...b, id: "", name: "", extra: undefined },
  );

/**
 * Copia un estil als estils amb nom del document, o en reaprofita un d'igual
 * (fonament 03, §5): torna la llista nova i l'`id` amb què s'hi ha d'apuntar.
 */
export const addNamedStyle = (
  styles: readonly NamedStyle[] | undefined,
  entry: NamedStyle,
): { styles: NamedStyle[]; styleId: string } => {
  const existing = styles?.find((style) => sameNamedContent(style, entry));
  if (existing) return { styles: [...(styles ?? [])], styleId: existing.id };
  return {
    styles: [
      ...(styles ?? []),
      { ...entry, name: uniqueStyleName(styles, entry.name) },
    ],
    styleId: entry.id,
  };
};
