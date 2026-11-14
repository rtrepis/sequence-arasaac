// L'aspecte d'un bloc, amb la cascada del fonament 03 ampliada amb els estils
// amb nom: document → seqüència → estil amb nom del bloc → bloc → pictograma.
// Cada nivell només porta el que canvia. Vegeu
// `docs/decisions/ADR-005-disposicio-lliure.md`.
import type {
  DocumentPages,
  NamedStyle,
  PagePlacement,
  SequenceAlignmentH,
  SequenceAlignmentV,
  SequenceStyle,
  SequenceViewSettings,
  TextPlacement,
} from "@/types/document";
import type { Font, Sequence } from "@/types/sequence";
import { mergeDeep } from "@features/sequence/saac/cascade";
import { DEFAULT_FITZGERALD_CATEGORY_COLORS } from "@features/sequence/saac/fitzgerald";
import { deepEqual, followStyle } from "@features/sequence/style/styleModel";

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

// --- L'aspecte de les targetes d'un bloc amb estil amb nom ---

/**
 * L'estil del document retocat per un estil amb nom: és el que es fa servir
 * per pintar les targetes dels blocs que el fan servir.
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

/**
 * Els pictogrames d'una seqüència tal com es veuen en un bloc amb estil amb
 * nom: el que heretaven de l'estil del document passa a ser el de l'estil amb
 * nom, i els retocs de cada pictograma es conserven (la mateixa regla que
 * canviar l'estil del document, `followStyle`). No toca la seqüència: en torna
 * una còpia, o la mateixa si el bloc no en fa servir cap.
 */
export const blockSequence = (
  pictograms: Sequence,
  documentStyle: SequenceStyle,
  named: NamedStyle | undefined,
): Sequence => {
  if (named === undefined) return pictograms;
  const to = styleWithNamed(documentStyle, named);
  return pictograms.map((pict) => {
    const copy = JSON.parse(JSON.stringify(pict)) as typeof pict;
    followStyle(copy, documentStyle, to);
    return copy;
  });
};

/**
 * La clau amb què es mesura la targeta d'una seqüència en un bloc: la
 * seqüència sola, o la seqüència amb l'estil amb nom, que en pot canviar la
 * lletra i les vores i, per tant, la mida.
 */
export const cardMeasureKey = (
  sequenceKey: number,
  styleId: string | undefined,
): string =>
  styleId === undefined ? String(sequenceKey) : `${sequenceKey}@${styleId}`;

// --- «Aplica el meu estil» (R10) ---

/** L'`id` i el nom de l'estil amb nom que es copia al document. */
export interface MyStyleCopy {
  id: string;
  name: string;
}

/**
 * Un estil sencer com a estil de bloc: l'**estil** dels pictogrames (la
 * targeta, el color, la pell i el cabell). La **distribució** (mida, espai i
 * alineació) no hi va: és del bloc o de la pàgina, i aplicar un estil no la
 * toca. Els estils de bloc d'abans que en porten es continuen pintant.
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
 * Un nom que cap altre estil de bloc del document no fa servir: el nom, o el
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
const sameNamedContent = (a: NamedStyle, b: NamedStyle): boolean =>
  deepEqual(
    { ...a, id: "", name: "", extra: undefined },
    { ...b, id: "", name: "", extra: undefined },
  );

/** On s'aplica: tots els blocs propis d'una pàgina, o un sol bloc. */
export type MyStyleTarget =
  | { kind: "sheet"; sheetIndex: number }
  | { kind: "block"; placementId: string };

/**
 * Aplica un estil a una pàgina o a un bloc: el copia als estils de bloc del
 * document (o en reaprofita un d'igual) i hi apunta els blocs. La distribució
 * de cada bloc (el seu retoc de mida, espai i alineació), els retocs de cada
 * pictograma i l'aspecte propi de cada rètol es conserven. En una pàgina, els
 * blocs comuns no hi entren: surten a totes les pàgines.
 */
export const applyNamedStyle = (
  pages: DocumentPages,
  styles: readonly NamedStyle[] | undefined,
  entry: NamedStyle,
  target: MyStyleTarget,
): { pages: DocumentPages; styles: NamedStyle[] } => {
  const existing = styles?.find((style) => sameNamedContent(style, entry));
  const styleId = existing?.id ?? entry.id;
  const nextStyles = existing
    ? [...(styles ?? [])]
    : [
        ...(styles ?? []),
        { ...entry, name: uniqueStyleName(styles, entry.name) },
      ];
  return {
    styles: nextStyles,
    pages: mapTargetPlacements(pages, target, (placement) => ({
      ...placement,
      styleId,
    })),
  };
};

/** Els blocs que poden fer servir un estil de bloc: de seqüència i de text. */
type StyledPlacement = Exclude<PagePlacement, { kind: "unknown" }>;

const isStyled = (placement: PagePlacement): placement is StyledPlacement =>
  placement.kind === "sequence" || placement.kind === "text";

/** Canvia els blocs d'on s'aplica (una pàgina, sense els comuns, o un bloc). */
const mapTargetPlacements = (
  pages: DocumentPages,
  target: MyStyleTarget,
  change: (placement: StyledPlacement) => StyledPlacement,
): DocumentPages => {
  const apply = (placement: PagePlacement): PagePlacement =>
    isStyled(placement) ? change(placement) : placement;
  if (target.kind === "sheet")
    return {
      ...pages,
      sheets: pages.sheets.map((sheet, index) =>
        index === target.sheetIndex
          ? { ...sheet, placements: sheet.placements.map(apply) }
          : sheet,
      ),
    };
  const matches = (placement: PagePlacement) =>
    isStyled(placement) && placement.id === target.placementId;
  const applyIfMatches = (placement: PagePlacement) =>
    matches(placement) ? apply(placement) : placement;
  return {
    ...pages,
    sheets: pages.sheets.map((sheet) =>
      sheet.placements.some(matches)
        ? { ...sheet, placements: sheet.placements.map(applyIfMatches) }
        : sheet,
    ),
    common: pages.common.map(applyIfMatches),
  };
};

/** Tots els blocs del document que poden portar estil, comuns inclosos. */
const allStyledPlacements = (pages: DocumentPages): StyledPlacement[] =>
  [
    ...pages.sheets.flatMap((sheet) => sheet.placements),
    ...pages.common,
  ].filter(isStyled);

/**
 * Quants blocs fan servir cada estil de bloc. Un bloc comú compta una vegada,
 * encara que surti a totes les pàgines.
 */
export const styleUseCount = (
  pages: DocumentPages | undefined,
  styleId: string,
): number =>
  pages
    ? allStyledPlacements(pages).filter(
        (placement) => placement.styleId === styleId,
      ).length
    : 0;

/**
 * Els estils de bloc que fan servir els blocs d'on s'aplica (els que existeixen
 * al document), sense repetir.
 */
export const targetStyleIds = (
  pages: DocumentPages | undefined,
  styles: readonly NamedStyle[] | undefined,
  target: MyStyleTarget,
): string[] => {
  if (!pages) return [];
  const placements =
    target.kind === "sheet"
      ? (pages.sheets[target.sheetIndex]?.placements ?? []).filter(isStyled)
      : allStyledPlacements(pages).filter(
          (placement) => placement.id === target.placementId,
        );
  const ids = placements.flatMap((placement) =>
    placement.styleId !== undefined &&
    namedStyleOf(styles, placement.styleId) !== undefined
      ? [placement.styleId]
      : [],
  );
  return ids.filter((id, index) => ids.indexOf(id) === index);
};

/**
 * «Actualitza amb el meu estil»: els estils de bloc `ids` passen a tenir
 * l'estil de `entry`, i canvien tots els blocs que els fan servir, siguin a
 * la pàgina que siguin. Es queden el seu `id` i el seu nom, i la distribució
 * que portessin (dels documents d'abans): l'estil no la toca.
 */
export const updateNamedStyles = (
  styles: readonly NamedStyle[] | undefined,
  ids: readonly string[],
  entry: NamedStyle,
): NamedStyle[] =>
  (styles ?? []).map((style) => {
    if (!ids.includes(style.id)) return style;
    const next: NamedStyle = {
      id: style.id,
      name: style.name,
      pictApiAra: entry.pictApiAra,
      pictSequence: entry.pictSequence,
    };
    if (entry.fitzgeraldColors) next.fitzgeraldColors = entry.fitzgeraldColors;
    if (style.view) next.view = style.view;
    if (style.extra) next.extra = style.extra;
    return next;
  });

/**
 * Treu l'estil de bloc d'un bloc: torna a l'estil del document. Si cap altre
 * bloc no el fa servir, l'estil surt del document.
 */
export const removeNamedStyle = (
  pages: DocumentPages,
  styles: readonly NamedStyle[] | undefined,
  placementId: string,
): { pages: DocumentPages; styles: NamedStyle[] } => {
  const nextPages = mapTargetPlacements(
    pages,
    { kind: "block", placementId },
    (placement) => {
      const next = { ...placement };
      delete next.styleId;
      return next;
    },
  );
  const used = new Set(
    allStyledPlacements(nextPages).map((placement) => placement.styleId),
  );
  return {
    pages: nextPages,
    styles: (styles ?? []).filter((style) => used.has(style.id)),
  };
};

/**
 * La mida mesurada de la targeta d'un bloc: la de la seqüència amb el seu
 * estil amb nom, o la de la seqüència sola si aquesta no s'ha mesurat (encara,
 * o perquè l'estil amb nom ja no hi és).
 */
export const cardSizeOf = <T>(
  sizes: Record<string, T>,
  sequenceKey: number,
  styleId: string | undefined,
): T | undefined =>
  sizes[cardMeasureKey(sequenceKey, styleId)] ?? sizes[String(sequenceKey)];
