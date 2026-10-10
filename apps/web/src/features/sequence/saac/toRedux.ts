// Del fitxer v3 a Redux: el que es carrega en obrir un document.
//
// Redux guarda els valors sencers a cada pictograma (com sempre). Aquí es
// resolen amb la mateixa cascada que fa servir la targeta, i el que el fitxer
// porta i l'app no fa servir es guarda a `saacExtra` per tornar-lo a escriure.
import type {
  DocumentSAAC,
  SequenceStyle,
  SequenceViewSettings,
} from "@/types/document";
import type {
  PictSequence,
  PictSequenceSettings,
  SaacExtraFields,
} from "@/types/sequence";
import type { DefaultSettings } from "@/types/ui";
import { mergeDeep, resolveCardStyle } from "./cascade";
import type { FitzgeraldCategoryColors } from "./fitzgerald";
import { PICTOGRAM_VARIANTS } from "./types";
import type {
  PictogramVariant,
  SaacDocumentV3,
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
  "assets",
  "ui",
] as const;
const META_KEYS = ["id", "title", "author", "updatedAt"] as const;
export const PAGE_KEYS = [
  "size",
  "orientation",
  "direction",
  "sequenceGap",
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
