// Del fitxer v3 a Redux: el que es carrega en obrir un document.
//
// Redux guarda els valors sencers a cada pictograma (com sempre). Aquí es
// resolen amb la mateixa cascada que fa servir la targeta, i el que el fitxer
// porta i l'app no fa servir es guarda a `saacExtra` per tornar-lo a escriure.
import type {
  DocumentPages,
  DocumentSAAC,
  DocumentSheet,
  NamedStyle,
  PagePlacement,
  SequenceStyle,
  SequenceViewSettings,
} from "@/types/document";
import type {
  PictSequence,
  PictSequenceSettings,
  SaacExtraFields,
} from "@/types/sequence";
import type { DefaultSettings } from "@/types/ui";
import { isPlainObject, mergeDeep, resolveCardStyle } from "./cascade";
import type { FitzgeraldCategoryColors } from "./fitzgerald";
import { PICTOGRAM_VARIANTS } from "./types";
import type {
  PictogramVariant,
  SaacDocumentV3,
  V3Block,
  V3ForeignBlock,
  V3NamedStyle,
  V3Pictogram,
  V3Style,
  V3View,
} from "./types";

/** Els camps d'un objecte del fitxer que l'app no coneix. */
export const unknownFields = (
  object: object,
  known: readonly string[],
): SaacExtraFields | undefined => {
  const extra = Object.fromEntries(
    Object.entries(object as Record<string, unknown>).filter(
      ([key]) => !known.includes(key),
    ),
  );
  return Object.keys(extra).length > 0 ? extra : undefined;
};

const ROOT_KEYS = [
  "format",
  "kind",
  "schemaVersion",
  "savedWith",
  "meta",
  "page",
  "style",
  "sequences",
  "styles",
  "assets",
  "ui",
] as const;
const META_KEYS = ["id", "title", "author", "updatedAt"] as const;
export const PAGE_KEYS = [
  "size",
  "orientation",
  "direction",
  "sequenceGap",
  "layout",
  "sheets",
  "common",
] as const;
// `placements` és el nom que tenien els blocs a les fases 1–3: es llegeix i
// no es torna a escriure
export const SHEET_KEYS = [
  "id",
  "mode",
  "direction",
  "template",
  "blocks",
  "placements",
] as const;
export const BLOCK_KEYS = [
  "id",
  "kind",
  "x",
  "y",
  "w",
  "h",
  "slot",
  "namedStyle",
  "sequence",
  "columns",
  "view",
  "text",
  "textStyle",
] as const;
export const NAMED_STYLE_KEYS = [
  "id",
  "name",
  "pictogram",
  "card",
  "view",
] as const;
const STYLE_KEYS = ["pictogram", "card", "view"] as const;
export const SEQUENCE_KEYS = ["id", "style", "pictograms"] as const;
export const PICTOGRAM_KEYS = [
  "id",
  "word",
  "text",
  "cross",
  "category",
  "image",
  "style",
] as const;
const IMAGE_KEYS = [
  "variants",
  "source",
  "id",
  "alternatives",
  "keywords",
  "asset",
] as const;

/** L'estil del fitxer amb la forma de Redux (`SequenceStyle`). */
export const styleFromV3 = (
  style: V3Style,
  sequenceGap: number,
): SequenceStyle => {
  const { none, ...categoryColors } = style.pictogram.fitzgerald;
  return {
    pictApiAra: {
      skin: style.pictogram.skin,
      hair: style.pictogram.hair,
      color: style.pictogram.color,
      fitzgerald: none,
    },
    pictSequence: { ...style.card },
    view: { ...style.view, sequenceSpaceBetween: sequenceGap },
    fitzgeraldColors: categoryColors as FitzgeraldCategoryColors,
  };
};

const pictogramToRedux = (
  pictogram: V3Pictogram,
  indexSequence: number,
  document: SaacDocumentV3,
): PictSequence => {
  const resolved = resolveCardStyle(document.style, undefined, pictogram);
  const { image, style } = pictogram;
  const card = style?.card;

  // Els objectes (lletra, vores) només hi van si el pictograma els retoca: la
  // targeta fa servir els de l'estil quan no n'hi ha
  const settings: PictSequenceSettings = {
    textPosition: resolved.card.textPosition,
    ...(card?.font && { font: resolved.card.font }),
    ...(card?.numberFont && { numberFont: resolved.card.numberFont }),
    ...(card?.borderIn && { borderIn: resolved.card.borderIn }),
    ...(card?.borderOut && { borderOut: resolved.card.borderOut }),
  };

  const asset =
    image.source === "own" ? document.assets?.[image.asset] : undefined;
  const url = asset?.data ?? asset?.url;
  const selectedId =
    image.source === "arasaac"
      ? image.id
      : image.source === "own"
        ? (image.id ?? 0)
        : 0;
  const alternatives =
    image.source === "arasaac"
      ? (image.alternatives ?? [image.id])
      : [selectedId];

  // Sense la llista (un fitxer v3 escrit per una altra eina), un pictograma
  // d'ARASAAC les admet totes: és el que feia la targeta amb l'estil
  const variants: readonly PictogramVariant[] =
    image.source === "arasaac" ? (image.variants ?? PICTOGRAM_VARIANTS) : [];

  const pictogramExtra = unknownFields(pictogram, PICTOGRAM_KEYS);
  const imageExtra = unknownFields(image, IMAGE_KEYS);

  return {
    id: pictogram.id,
    indexSequence,
    img: {
      searched: {
        word: pictogram.word,
        bestIdPicts: alternatives,
        ...(image.source === "arasaac" &&
          image.keywords && { keyWords: image.keywords }),
      },
      selectedId,
      // Només les opcions que admet el pictograma: el formulari d'edició ho
      // mira per saber quins ajustos ensenya, i la URL d'ARASAAC per saber
      // quins paràmetres hi posa
      settings: {
        ...(variants.includes("skin") && { skin: resolved.pictogram.skin }),
        ...(variants.includes("hair") && { hair: resolved.pictogram.hair }),
        ...(variants.includes("color") && { color: resolved.pictogram.color }),
        fitzgerald: resolved.pictogram.fitzgerald,
      },
      ...(url && { url }),
      category: pictogram.category ?? "none",
    },
    ...(pictogram.text !== undefined && { text: pictogram.text }),
    cross: pictogram.cross ?? false,
    settings,
    ...((pictogramExtra || imageExtra) && {
      saacExtra: {
        ...(pictogramExtra && { pictogram: pictogramExtra }),
        ...(imageExtra && { image: imageExtra }),
      },
    }),
  };
};

/** Un bloc del fitxer amb la forma de Redux. */
const blockFromV3 = (
  block: V3Block | V3ForeignBlock,
  sequenceKeyOf: ReadonlyMap<string, number>,
): PagePlacement | undefined => {
  if (block.kind !== "sequence" && block.kind !== "text") {
    // El lector l'embolcalla; un fitxer escrit per l'app el porta tal com era
    const raw: Record<string, unknown> =
      block.kind === "foreign" && isPlainObject(block.raw)
        ? block.raw
        : (block as unknown as Record<string, unknown>);
    return {
      kind: "unknown",
      id: typeof raw.id === "string" ? raw.id : "",
      raw,
    };
  }
  const extra = unknownFields(block, BLOCK_KEYS);
  const base = {
    id: block.id,
    // Una pàgina automàtica no en porta: el bloc no en té fins que en té una
    x: block.x ?? 0,
    y: block.y ?? 0,
    w: block.w ?? 0,
    h: block.h ?? 0,
    ...(block.slot !== undefined && { slot: block.slot }),
    ...(block.namedStyle !== undefined && { styleId: block.namedStyle }),
    ...(extra && { extra }),
  };
  if (block.kind === "text")
    return {
      ...base,
      kind: "text",
      text: block.text,
      ...(block.textStyle && { textStyle: block.textStyle }),
    };
  const sequenceKey = sequenceKeyOf.get(block.sequence);
  if (sequenceKey === undefined) return undefined;
  return {
    ...base,
    kind: "sequence",
    sequenceKey,
    columns: block.columns ?? "auto",
    ...(block.view && { view: block.view }),
  };
};

/**
 * Les pàgines amb la forma de Redux: cada bloc de seqüència apunta a la clau
 * de `content`, que és la posició de la seqüència al fitxer. Sense pàgines al
 * fitxer, `undefined`: una sola pàgina automàtica, la de sempre.
 */
const pagesFromV3 = (document: SaacDocumentV3): DocumentPages | undefined => {
  const { sheets, common } = document.page;
  if (!sheets) return undefined;

  const sequenceKeyOf = new Map(
    document.sequences.map(({ id }, key) => [id, key]),
  );
  const blocksOf = (
    list: readonly (V3Block | V3ForeignBlock)[],
  ): PagePlacement[] =>
    list.flatMap((block) => {
      const placement = blockFromV3(block, sequenceKeyOf);
      return placement ? [placement] : [];
    });

  return {
    sheets: sheets.map((sheet): DocumentSheet => {
      const extra = unknownFields(sheet, SHEET_KEYS);
      return {
        id: sheet.id,
        mode: sheet.mode,
        ...(sheet.direction && { direction: sheet.direction }),
        ...(sheet.template && { template: sheet.template }),
        placements: blocksOf(sheet.blocks),
        ...(extra && { extra }),
      };
    }),
    common: blocksOf(common ?? []),
  };
};

/**
 * Els estils amb nom amb la forma de Redux, la mateixa que `SequenceStyle`:
 * el color dels pictogrames sense categoria és `pictApiAra.fitzgerald`, i el
 * de les categories, `fitzgeraldColors`.
 */
export const namedStyleFromV3 = (style: V3NamedStyle): NamedStyle => {
  const extra = unknownFields(style, NAMED_STYLE_KEYS);
  const { fitzgerald, ...pictogram } = style.pictogram ?? {};
  const { none, ...categoryColors } = fitzgerald ?? {};
  const pictApiAra = {
    ...pictogram,
    ...(none !== undefined && { fitzgerald: none }),
  };
  return {
    id: style.id,
    name: style.name,
    ...(Object.keys(pictApiAra).length > 0 && { pictApiAra }),
    ...(style.card && { pictSequence: style.card }),
    ...(style.view && { view: style.view }),
    ...(Object.keys(categoryColors).length > 0 && {
      fitzgeraldColors: categoryColors as Record<string, string>,
    }),
    ...(extra && { extra }),
  };
};

/**
 * El document v3 amb la forma de Redux. `document` ja ha de venir complet
 * (el lector l'ha validat i n'ha omplert el que faltava).
 */
export const documentFromV3 = (document: SaacDocumentV3): DocumentSAAC => {
  const reduxStyle = styleFromV3(document.style, document.page.sequenceGap);
  const tabBase: V3View = document.style.view;

  const content: DocumentSAAC["content"] = {};
  const viewSettings: { [key: number]: SequenceViewSettings } = {};
  const sequenceIds: { [key: number]: string } = {};
  const sequenceExtras: { [key: number]: SaacExtraFields } = {};

  document.sequences.forEach((sequence, key) => {
    content[key] = sequence.pictograms.map((pictogram, index) =>
      pictogramToRedux(pictogram, index, document),
    );
    viewSettings[key] = mergeDeep(tabBase, sequence.style?.view);
    sequenceIds[key] = sequence.id;
    const extra = unknownFields(sequence, SEQUENCE_KEYS);
    if (extra) sequenceExtras[key] = extra;
  });

  const pages = pagesFromV3(document);

  const activeIndex = document.sequences.findIndex(
    ({ id }) => id === document.ui?.activeSequence,
  );

  const rootExtra = unknownFields(document, ROOT_KEYS);
  const metaExtra = unknownFields(document.meta, META_KEYS);
  const pageExtra = unknownFields(document.page, PAGE_KEYS);
  const styleExtra = unknownFields(document.style, STYLE_KEYS);
  const uiExtra = document.ui
    ? unknownFields(document.ui, ["activeSequence"])
    : undefined;

  const defaultSettings: DefaultSettings = {
    pictApiAra: reduxStyle.pictApiAra,
    pictSequence: reduxStyle.pictSequence,
  };

  return {
    id: document.meta.id ?? "",
    ...(document.meta.title !== undefined && { title: document.meta.title }),
    // Un document obert té sempre el seu autor: si el fitxer no en porta, és
    // que no en té, i no hereta el de qui l'obre (B21)
    author: document.meta.author ?? "",
    content,
    viewSettings,
    activeSAAC: activeIndex >= 0 ? activeIndex : 0,
    defaultSettings,
    styleView: reduxStyle.view,
    layout: {
      pageSize: document.page.size,
      orientation: document.page.orientation,
      direction: document.page.direction,
    },
    ...(pages && { pages }),
    ...(document.styles && { styles: document.styles.map(namedStyleFromV3) }),
    fitzgeraldColors: reduxStyle.fitzgeraldColors,
    sequenceIds,
    saacExtra: {
      ...(rootExtra && { root: rootExtra }),
      ...(metaExtra && { meta: metaExtra }),
      ...(pageExtra && { page: pageExtra }),
      ...(styleExtra && { style: styleExtra }),
      ...(uiExtra && { ui: uiExtra }),
      ...(Object.keys(sequenceExtras).length > 0 && {
        sequences: sequenceExtras,
      }),
    },
  };
};
