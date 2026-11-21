// La cascada d'estil: document → estil de la seqüència, o el reassignat del
// bloc → pictograma. Vegeu `docs/fonaments/03-model-contingut-estil.md`, «La
// cascada d'estil».
//
// - `mergeDeep` combina propietat a propietat, a qualsevol profunditat: a cada
//   propietat guanya el nivell més proper al pictograma.
// - `diffDeep` en fa l'invers: el que un nivell té diferent del de sobre. És el
//   que es desa, perquè els retocs siguin mínims.
import { deepEqual } from "@features/sequence/style/styleModel";
import { colorForCategory } from "./fitzgerald";
import type {
  ResolvedCardStyle,
  SaacDocumentV3,
  V3Block,
  V3ForeignBlock,
  V3NamedStyle,
  V3PictogramOverride,
  V3Style,
  V3View,
} from "./types";

type PlainObject = Record<string, unknown>;

export const isPlainObject = (value: unknown): value is PlainObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * `base` amb `override` a sobre, propietat a propietat. Un `undefined` de
 * l'override no esborra res: vol dir «no hi ha retoc».
 */
export const mergeDeep = <T>(base: T, override: unknown): T => {
  if (!isPlainObject(base) || !isPlainObject(override))
    return (override === undefined ? base : override) as T;

  const merged: PlainObject = { ...base };
  Object.entries(override).forEach(([key, value]) => {
    if (value === undefined) return;
    merged[key] = mergeDeep((base as PlainObject)[key], value);
  });
  return merged as T;
};

/**
 * El que `full` té diferent de `base`, propietat a propietat. `undefined` si
 * no hi ha cap diferència: és el que permet ometre un `style` buit.
 */
export const diffDeep = (base: unknown, full: unknown): unknown => {
  if (full === undefined) return undefined;
  if (isPlainObject(base) && isPlainObject(full)) {
    const diff: PlainObject = {};
    Object.keys(full).forEach((key) => {
      const d = diffDeep(base[key], full[key]);
      if (d !== undefined) diff[key] = d;
    });
    return Object.keys(diff).length === 0 ? undefined : diff;
  }
  return deepEqual(base, full) ? undefined : full;
};

/** `diffStyle(base, full)`: només el que difereix del nivell superior. */
export const diffStyle = <T>(base: T, full: T): Partial<T> | undefined =>
  diffDeep(base, full) as Partial<T> | undefined;

/** La vista d'una seqüència: la del document amb el retoc de la seqüència. */
export const resolveSequenceView = (
  documentView: V3View,
  sequenceView: Partial<V3View> | undefined,
): V3View => mergeDeep(documentView, sequenceView);

/**
 * L'estil d'una targeta a partir de l'estil del document, la vista de la seva
 * seqüència i el retoc del pictograma. Amb el Fitzgerald resolt a un color:
 * el del retoc, o el de la categoria, o el dels que no en tenen.
 */
export const resolveCardStyle = (
  documentStyle: V3Style,
  sequenceView: Partial<V3View> | undefined,
  pictogram: {
    category?: string;
    style?: V3PictogramOverride;
  },
): ResolvedCardStyle => {
  const { fitzgerald: colors, ...pictogramBase } = documentStyle.pictogram;
  const { fitzgerald: override, ...pictogramOverride } =
    pictogram.style?.pictogram ?? {};

  const { none, ...categoryColors } = colors;
  const category =
    pictogram.category !== undefined && pictogram.category in categoryColors
      ? (pictogram.category as keyof typeof categoryColors)
      : undefined;

  return {
    pictogram: {
      ...mergeDeep(pictogramBase, pictogramOverride),
      fitzgerald: override ?? colorForCategory(category, categoryColors, none),
    },
    card: mergeDeep(documentStyle.card, pictogram.style?.card),
    view: resolveSequenceView(documentStyle.view, sequenceView),
  };
};

/**
 * L'estil del document amb un estil amb nom a sobre: és l'estil de partida dels
 * pictogrames d'una seqüència que en té (o d'un bloc reassignat). Només
 * l'estil: la distribució (`view`) és de la seqüència i del bloc.
 */
export const styleWithNamedV3 = (
  documentStyle: V3Style,
  named: V3NamedStyle | undefined,
): V3Style =>
  named === undefined
    ? documentStyle
    : {
        ...documentStyle,
        pictogram: mergeDeep(documentStyle.pictogram, named.pictogram),
        card: mergeDeep(documentStyle.card, named.card),
      };

/** L'estil amb nom d'un document v3 amb aquest `id`, si n'hi ha cap. */
const namedStyleOfV3 = (
  document: SaacDocumentV3,
  styleId: string | undefined,
): V3NamedStyle | undefined =>
  styleId === undefined
    ? undefined
    : document.styles?.find(({ id }) => id === styleId);

/** L'estil de partida dels pictogrames d'una seqüència: el document i el seu estil. */
export const sequenceStyleOfV3 = (
  document: SaacDocumentV3,
  sequenceId: string,
): V3Style => {
  const sequence = document.sequences.find(({ id }) => id === sequenceId);
  return styleWithNamedV3(
    document.style,
    namedStyleOfV3(document, sequence?.namedStyle),
  );
};

/**
 * `resolveStyle(doc, sequenceId, pictogramId, blockId?)`: l'estil amb què es
 * pinta un pictograma d'un document v3. L'estil amb nom que toca és el
 * reassignat del bloc si se'n diu un i en té, i si no el de la seqüència; el
 * reassignat **substitueix** el de la seqüència. `undefined` si la seqüència o
 * el pictograma no hi són.
 */
export const resolveStyle = (
  document: SaacDocumentV3,
  sequenceId: string,
  pictogramId: string,
  blockId?: string,
): ResolvedCardStyle | undefined => {
  const sequence = document.sequences.find(({ id }) => id === sequenceId);
  const pictogram = sequence?.pictograms.find(({ id }) => id === pictogramId);
  if (!sequence || !pictogram) return undefined;

  const blocks: readonly (V3Block | V3ForeignBlock)[] = [
    ...(document.page.sheets?.flatMap(({ blocks: list }) => list) ?? []),
    ...(document.page.common ?? []),
  ];
  const block =
    blockId === undefined
      ? undefined
      : blocks.find(
          (candidate): candidate is V3Block =>
            candidate.kind !== "foreign" && candidate.id === blockId,
        );
  const named =
    namedStyleOfV3(document, block?.namedStyle) ??
    namedStyleOfV3(document, sequence.namedStyle);

  return resolveCardStyle(
    styleWithNamedV3(document.style, named),
    sequence.style?.view,
    pictogram,
  );
};
