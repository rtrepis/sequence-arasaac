// De Redux al fitxer v3: «Desa el document» i «Desa l'estil en un fitxer…».
//
// Redux conserva la forma de sempre (valors sencers a cada pictograma); aquí es
// tradueix al contracte del fitxer, amb `diffStyle` a cada nivell perquè els
// retocs siguin mínims. Vegeu `docs/fonaments/06-compatibilitat-i-dades.md`.
import { version as appVersion } from "../../../../package.json";
import type { DocumentSAAC, SequenceStyle } from "@/types/document";
import type { PictSequence } from "@/types/sequence";
import type { PageOrientation, PageSize, SequenceDirection } from "@/types/ui";
import { resolveDocumentStyle } from "@features/sequence/style/styleModel";
import { diffDeep, diffStyle } from "./cascade";
import {
  DEFAULT_FITZGERALD_CATEGORY_COLORS,
  FitzgeraldCategory,
  FitzgeraldCategoryColors,
  categoryFromColor,
  colorForCategory,
  sameColor,
} from "./fitzgerald";
import {
  SAAC_FORMAT,
  SAAC_V3,
  SaacDocumentV3,
  SaacStyleFileV3,
  V3Asset,
  V3Image,
  V3Page,
  V3Pictogram,
  V3PictogramOverride,
  V3Sequence,
  V3Style,
  V3View,
} from "./types";

/** Pàgina per defecte de qui desa: la que hereta un document sense pàgina. */
export interface UserPage {
  size: PageSize;
  orientation: PageOrientation;
  direction: SequenceDirection;
}

export interface SerializeContext {
  userDefault: SequenceStyle;
  userPage: UserPage;
  /** Genera un identificador nou amb el prefix donat */
  newId: (prefix: "seq" | "p") => string;
  /** Data de desar, ISO */
  now: string;
}

export const newSaacId = (prefix: "seq" | "p"): string =>
  `${prefix}_${Math.random().toString(36).substring(2, 10)}`;

// --- Estil ---

/** L'estil de Redux amb la forma del fitxer. */
export const styleToV3 = (
  style: SequenceStyle,
  categoryColors: FitzgeraldCategoryColors = style.fitzgeraldColors ??
    DEFAULT_FITZGERALD_CATEGORY_COLORS,
): V3Style => {
  const { pictSequence, pictApiAra, view } = style;
  return {
    pictogram: {
      skin: pictApiAra.skin,
      hair: pictApiAra.hair,
      color: pictApiAra.color,
      fitzgerald: { ...categoryColors, none: pictApiAra.fitzgerald },
    },
    card: {
      numbered: pictSequence.numbered,
      textPosition: pictSequence.textPosition,
      font: pictSequence.font,
      // L'estil ple sempre en porta; per si de cas, la del text, que és el
      // que pinta la targeta quan no n'hi ha
      numberFont: pictSequence.numberFont ?? pictSequence.font,
      borderIn: pictSequence.borderIn,
      borderOut: pictSequence.borderOut,
    },
    view: {
      sizePict: view.sizePict,
      pictSpaceBetween: view.pictSpaceBetween,
      alignmentH: view.alignmentH,
      alignmentV: view.alignmentV,
    },
  };
};

/** «Desa l'estil en un fitxer…»: només l'aparença, sense pàgina. */
export const buildStyleFileV3 = (
  style: SequenceStyle,
  title?: string,
): SaacStyleFileV3 => ({
  format: SAAC_FORMAT,
  kind: "style",
  schemaVersion: SAAC_V3,
  ...(title ? { meta: { title } } : {}),
  style: styleToV3(style),
});

// --- Imatges ---

/** Hash curt i estable (FNV-1a) per anomenar una imatge. */
const hashString = (text: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};

const EXTENSION_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

const mimeOf = (url: string): string => {
  const dataMime = /^data:(image\/[^;,]+)/.exec(url);
  if (dataMime) return dataMime[1];
  const extension = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(url)?.[1]?.toLowerCase();
  return (extension && EXTENSION_MIME[extension]) ?? "image/*";
};

/**
 * Registre de les imatges pròpies d'un document: cada imatge hi és un sol cop,
 * encara que la facin servir molts pictogrames.
 */
const createAssetRegistry = () => {
  const assets: Record<string, V3Asset> = {};
  const byUrl = new Map<string, string>();

  const add = (url: string): string => {
    const known = byUrl.get(url);
    if (known) return known;

    const base = `img_${hashString(url)}`;
    let id = base;
    for (let n = 2; assets[id] !== undefined; n += 1) id = `${base}_${n}`;

    assets[id] = url.startsWith("data:")
      ? { mime: mimeOf(url), data: url }
      : { mime: mimeOf(url), url };
    byUrl.set(url, id);
    return id;
  };

  return { add, assets };
};

// --- Pictogrames ---

const imageOf = (
  pict: PictSequence,
  addAsset: (url: string) => string,
): V3Image => {
  const { url, selectedId, searched } = pict.img;
  // Les URL `blob:` són temporals: la targeta tampoc no les pinta
  if (url && !url.startsWith("blob:"))
    return {
      source: "own",
      asset: addAsset(url),
      // El pictograma d'ARASAAC que hi havia, per si es treu la imatge pròpia
      ...(selectedId > 0 && { id: selectedId }),
    };

  if (selectedId > 0)
    return {
      source: "arasaac",
      id: selectedId,
      ...(searched.bestIdPicts.length > 0 && {
        alternatives: searched.bestIdPicts,
      }),
      ...(searched.keyWords && { keywords: searched.keyWords }),
    };

  return { source: "none" };
};

/**
 * Categoria del pictograma. Si no se sap (un pictograma d'abans del v3), es
 * dedueix del color: només si és exactament el d'una categoria.
 */
export const categoryOf = (pict: PictSequence): FitzgeraldCategory | "none" => {
  if (pict.img.category !== undefined) return pict.img.category;
  const color = pict.img.settings.fitzgerald;
  return (color !== undefined && categoryFromColor(color)) || "none";
};

const pictogramOverride = (
  pict: PictSequence,
  style: V3Style,
  category: FitzgeraldCategory | "none",
): V3PictogramOverride | undefined => {
  const { skin, hair, color, fitzgerald } = pict.img.settings;
  const { none, ...categoryColors } = style.pictogram.fitzgerald;
  const expectedColor = colorForCategory(category, categoryColors, none);

  const pictogram = diffDeep(
    {
      skin: style.pictogram.skin,
      hair: style.pictogram.hair,
      color: style.pictogram.color,
    },
    { skin, hair, color },
  ) as V3PictogramOverride["pictogram"];
  const fitzgeraldOverride =
    fitzgerald !== undefined && !sameColor(fitzgerald, expectedColor)
      ? fitzgerald
      : undefined;

  const { settings } = pict;
  const card = diffDeep(style.card, {
    // Sense posició, la targeta no pintava el text: és «none»
    textPosition: settings.textPosition ?? "none",
    font: settings.font,
    numberFont: settings.numberFont,
    borderIn: settings.borderIn,
    borderOut: settings.borderOut,
    // `numbered`, `fontSize` i `fontFamily` del pictograma no hi són: la
    // targeta no els ha fet servir mai per pintar
  }) as V3PictogramOverride["card"];

  const pictogramPart =
    pictogram || fitzgeraldOverride
      ? {
          ...pictogram,
          ...(fitzgeraldOverride && { fitzgerald: fitzgeraldOverride }),
        }
      : undefined;

  if (!pictogramPart && !card) return undefined;
  return {
    ...(pictogramPart && { pictogram: pictogramPart }),
    ...(card && { card }),
  };
};

const pictogramToV3 = (
  pict: PictSequence,
  style: V3Style,
  context: SerializeContext,
  addAsset: (url: string) => string,
): V3Pictogram => {
  const category = categoryOf(pict);
  const override = pictogramOverride(pict, style, category);
  const extra = pict.saacExtra;

  return {
    ...extra?.pictogram,
    id: pict.id ?? context.newId("p"),
    word: pict.img.searched.word,
    ...(pict.text !== undefined && { text: pict.text }),
    cross: pict.cross,
    ...(category !== "none" && { category }),
    image: { ...extra?.image, ...imageOf(pict, addAsset) } as V3Image,
    ...(override && { style: override }),
  };
};

// --- Document ---

const omitUndefined = <T extends Record<string, unknown>>(object: T): T =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  ) as T;

/**
 * El document de Redux amb la forma del fitxer v3. Un document que heretava
 * l'estil o la pàgina de l'usuari se'ls endú escrits: a partir d'aquí són seus.
 */
export const documentToV3 = (
  document: DocumentSAAC,
  context: SerializeContext,
): SaacDocumentV3 => {
  const reduxStyle = resolveDocumentStyle(document, context.userDefault);
  const style = styleToV3(
    reduxStyle,
    document.fitzgeraldColors ?? DEFAULT_FITZGERALD_CATEGORY_COLORS,
  );
  const extra = document.saacExtra ?? {};
  const { add: addAsset, assets } = createAssetRegistry();

  const keys = Object.keys(document.content)
    .map(Number)
    .sort((a, b) => a - b);

  const sequences: V3Sequence[] = keys.map((key) => {
    const view = document.viewSettings?.[key];
    const viewDiff = view
      ? diffStyle<V3View>(style.view, {
          sizePict: view.sizePict,
          pictSpaceBetween: view.pictSpaceBetween,
          alignmentH: view.alignmentH,
          alignmentV: view.alignmentV,
        })
      : undefined;
    const pictograms = [...document.content[key]]
      .sort((a, b) => a.indexSequence - b.indexSequence)
      .map((pict) => pictogramToV3(pict, style, context, addAsset));

    return {
      ...extra.sequences?.[key],
      id: document.sequenceIds?.[key] ?? context.newId("seq"),
      ...(viewDiff && { style: { view: viewDiff } }),
      pictograms,
    };
  });

  const activeIndex = keys.indexOf(document.activeSAAC);
  const { layout: pageLayout, ...pageExtra } = extra.page ?? {};
  const page: V3Page = {
    ...pageExtra,
    size: document.layout?.pageSize ?? context.userPage.size,
    orientation: document.layout?.orientation ?? context.userPage.orientation,
    direction: document.layout?.direction ?? context.userPage.direction,
    sequenceGap: reduxStyle.view.sequenceSpaceBetween,
    layout: pageLayout === "free" ? "free" : "flow",
  };

  return {
    ...extra.root,
    format: SAAC_FORMAT,
    kind: "document",
    schemaVersion: SAAC_V3,
    savedWith: appVersion,
    meta: omitUndefined({
      ...extra.meta,
      id: document.id,
      title: document.title,
      author: document.author,
      createdAt:
        typeof extra.meta?.createdAt === "string"
          ? extra.meta.createdAt
          : context.now,
      updatedAt: context.now,
    }),
    page,
    style: { ...extra.style, ...style },
    sequences,
    ...(Object.keys(assets).length > 0 && { assets }),
    ui: {
      ...extra.ui,
      activeSequence: sequences[activeIndex >= 0 ? activeIndex : 0].id,
    },
  };
};

/** El JSON del fitxer, en una sola línia com sempre. */
export const serializeSaac = (file: SaacDocumentV3 | SaacStyleFileV3): string =>
  JSON.stringify(file);

/**
 * Els identificadors que `documentToV3` ha generat, per escriure'ls a Redux
 * després de desar: així el pròxim desat en fa servir els mateixos. Els dels
 * pictogrames, per seqüència i per `indexSequence`.
 */
export interface SaacIds {
  sequenceIds: { [key: number]: string };
  pictogramIds: { [key: number]: { [indexSequence: number]: string } };
}

export const idsOf = (
  document: DocumentSAAC,
  file: SaacDocumentV3,
): SaacIds => {
  const keys = Object.keys(document.content)
    .map(Number)
    .sort((a, b) => a - b);
  const sequenceIds: SaacIds["sequenceIds"] = {};
  const pictogramIds: SaacIds["pictogramIds"] = {};
  keys.forEach((key, index) => {
    sequenceIds[key] = file.sequences[index].id;
    const sorted = [...document.content[key]].sort(
      (a, b) => a.indexSequence - b.indexSequence,
    );
    pictogramIds[key] = {};
    sorted.forEach((pict, i) => {
      pictogramIds[key][pict.indexSequence] =
        file.sequences[index].pictograms[i].id;
    });
  });
  return { sequenceIds, pictogramIds };
};
