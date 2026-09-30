// Obrir un fitxer: detecta què és **pel contingut** (mai per l'extensió), el
// valida, el migra si és antic i el tradueix a Redux. Tot el que entra d'un
// fitxer o del núvol passa per aquí. Vegeu
// `docs/fonaments/06-compatibilitat-i-dades.md`, §3 i §4.
//
// La migració es fa en memòria: el fitxer original no es toca, i el format v3
// només s'escriu quan l'usuari desa.
import type { DocumentSAAC, SequenceStyle } from "@/types/document";
import { parseSaacFile } from "@features/sequence/style/saacFile";
import { isPlainObject } from "./cascade";
import { FITZGERALD_NONE_COLOR, isFitzgeraldCategory } from "./fitzgerald";
import {
  SerializeContext,
  UserPage,
  documentToV3,
  newSaacId,
  styleToV3,
} from "./serialize";
import {
  PAGE_KEYS,
  PICTOGRAM_KEYS,
  SEQUENCE_KEYS,
  documentFromV3,
  styleFromV3,
  unknownFields,
} from "./toRedux";
import {
  PICTOGRAM_VARIANTS,
  PictogramVariant,
  SAAC_FORMAT,
  SAAC_V3,
  SaacDocumentV3,
  V3Asset,
  V3Image,
  V3Page,
  V3Pictogram,
  V3PictogramOverride,
  V3Sequence,
  V3Style,
} from "./types";

export interface ParseContext {
  /** Estil per defecte de qui obre: omple el que falti */
  userDefault: SequenceStyle;
  /** Pàgina per defecte de qui obre: la dels documents que no en porten */
  userPage: UserPage;
  /** Identificador d'un document que el fitxer no porta */
  newDocumentId: () => string;
  /** Data d'obrir, ISO (la de creació dels documents antics) */
  now: string;
}

/** El que cal dir a qui obre el document. */
export interface OpenNotices {
  /** És d'una versió anterior i s'ha adaptat */
  legacy: boolean;
  /** No portava estil propi (o sencer) i s'hi ha posat l'estil per defecte */
  withoutStyle: boolean;
  /** És d'una versió més nova que la de l'app */
  newerVersion: boolean;
}

export type ParsedSaac =
  | {
      kind: "document";
      document: DocumentSAAC;
      file: SaacDocumentV3;
      notices: OpenNotices;
    }
  | {
      kind: "style";
      style: SequenceStyle;
      title?: string;
      newerVersion: boolean;
    }
  | { kind: "invalid" };

type PlainObject = Record<string, unknown>;

// --- Completar amb la reserva ---

const ENUMS: Record<string, readonly unknown[]> = {
  skin: ["asian", "aztec", "black", "mulatto", "white"],
  hair: ["black", "blonde", "brown", "darkBrown", "gray", "darkGray", "red"],
  textPosition: ["top", "bottom", "none"],
  alignmentH: ["left", "center", "right"],
  alignmentV: ["top", "center", "bottom"],
  size: ["A4", "A3", "FULLSCREEN"],
  orientation: ["portrait", "landscape"],
  direction: ["row", "column"],
  layout: ["flow", "free"],
};

// Les llistes només valen per als textos: `size` és la mida de la pàgina
// (text) i també el gruix d'una vora (número)
const validValue = (key: string, value: unknown, fallback: unknown): boolean =>
  typeof value === typeof fallback &&
  (typeof value !== "string" ||
    ENUMS[key] === undefined ||
    ENUMS[key].includes(value)) &&
  (typeof value !== "number" || Number.isFinite(value));

/**
 * `value` completat amb `fallback`, camp a camp: del fitxer es pren tot el que
 * té la forma i el valor que toca; la resta surt de la reserva. Diu també si el
 * fitxer ho portava tot.
 */
const completeLike = <T>(
  value: unknown,
  fallback: T,
  key = "",
): { value: T; complete: boolean } => {
  if (isPlainObject(fallback)) {
    if (!isPlainObject(value)) return { value: fallback, complete: false };
    let complete = true;
    const merged: PlainObject = {};
    Object.entries(fallback).forEach(([field, fieldFallback]) => {
      const result = completeLike(value[field], fieldFallback, field);
      merged[field] = result.value;
      complete = complete && result.complete;
    });
    return { value: merged as T, complete };
  }
  return validValue(key, value, fallback)
    ? { value: value as T, complete: true }
    : { value: fallback, complete: false };
};

/**
 * Un retoc: només els camps que existeixen a l'estil complet i tenen el tipus
 * que toca. Un retoc no s'omple: el que no porta, s'hereta.
 */
const filterLike = (value: unknown, shape: unknown, key = ""): unknown => {
  if (isPlainObject(shape)) {
    if (!isPlainObject(value)) return undefined;
    const filtered: PlainObject = {};
    Object.keys(shape).forEach((field) => {
      const result = filterLike(value[field], shape[field], field);
      if (result !== undefined) filtered[field] = result;
    });
    return Object.keys(filtered).length > 0 ? filtered : undefined;
  }
  return validValue(key, value, shape) ? value : undefined;
};

// --- Lectura del v3 ---

const readPictogramOverride = (
  value: unknown,
  style: V3Style,
): V3PictogramOverride | undefined => {
  if (!isPlainObject(value)) return undefined;
  const pictogramShape = {
    ...style.pictogram,
    fitzgerald: FITZGERALD_NONE_COLOR,
  };
  // Al retoc, el Fitzgerald és un sol color, no la taula
  const pictogram = filterLike(
    value.pictogram,
    pictogramShape,
  ) as V3PictogramOverride["pictogram"];
  const card = filterLike(
    value.card,
    style.card,
  ) as V3PictogramOverride["card"];
  if (!pictogram && !card) return undefined;
  return { ...(pictogram && { pictogram }), ...(card && { card }) };
};

const readImage = (
  value: unknown,
  assets: Record<string, V3Asset>,
): V3Image => {
  if (!isPlainObject(value)) return { source: "none" };
  const numbers = (list: unknown): number[] | undefined =>
    Array.isArray(list) && list.every((n) => typeof n === "number")
      ? (list as number[])
      : undefined;
  const strings = (list: unknown): string[] | undefined =>
    Array.isArray(list) && list.every((s) => typeof s === "string")
      ? (list as string[])
      : undefined;

  if (value.source === "arasaac" && typeof value.id === "number") {
    const alternatives = numbers(value.alternatives);
    const keywords = strings(value.keywords);
    const variants = strings(value.variants)?.filter(
      (variant): variant is PictogramVariant =>
        (PICTOGRAM_VARIANTS as readonly string[]).includes(variant),
    );
    return {
      ...value,
      source: "arasaac",
      id: value.id,
      ...(alternatives && { alternatives }),
      ...(keywords && { keywords }),
      ...(variants && { variants }),
    } as V3Image;
  }
  if (
    value.source === "own" &&
    typeof value.asset === "string" &&
    assets[value.asset] !== undefined
  )
    return value as V3Image;

  // Una imatge que no es pot pintar és una targeta sense imatge
  return { ...value, source: "none" } as V3Image;
};

const readPictogram = (
  value: unknown,
  style: V3Style,
  assets: Record<string, V3Asset>,
): V3Pictogram => {
  const raw = isPlainObject(value) ? value : {};
  const override = readPictogramOverride(raw.style, style);
  const { category } = raw;
  return {
    ...unknownFields(raw, PICTOGRAM_KEYS),
    id: typeof raw.id === "string" && raw.id ? raw.id : newSaacId("p"),
    word: typeof raw.word === "string" ? raw.word : "",
    ...(typeof raw.text === "string" && { text: raw.text }),
    cross: raw.cross === true,
    ...(isFitzgeraldCategory(category) && { category }),
    image: readImage(raw.image, assets),
    ...(override && { style: override }),
  };
};

const readAssets = (value: unknown): Record<string, V3Asset> => {
  if (!isPlainObject(value)) return {};
  const assets: Record<string, V3Asset> = {};
  Object.entries(value).forEach(([id, asset]) => {
    if (
      isPlainObject(asset) &&
      ((typeof asset.data === "string" &&
        asset.data.startsWith("data:image/")) ||
        typeof asset.url === "string")
    )
      assets[id] = {
        mime: typeof asset.mime === "string" ? asset.mime : "image/*",
        ...(typeof asset.data === "string" && { data: asset.data }),
        ...(typeof asset.url === "string" && { url: asset.url }),
      };
  });
  return assets;
};

/** Document v3, completat i validat. `null` si no té la forma d'un document. */
const readV3Document = (
  raw: PlainObject,
  context: ParseContext,
): { file: SaacDocumentV3; complete: boolean } | null => {
  if (!Array.isArray(raw.sequences)) return null;

  const fallbackStyle = styleToV3(context.userDefault);
  const style = completeLike<V3Style>(raw.style, fallbackStyle);
  const page = completeLike<V3Page>(raw.page, {
    ...context.userPage,
    sequenceGap: context.userDefault.view.sequenceSpaceBetween,
    layout: "flow",
  });
  const assets = readAssets(raw.assets);

  const sequences: V3Sequence[] = raw.sequences.map((value: unknown) => {
    const sequence = isPlainObject(value) ? value : {};
    const view = isPlainObject(sequence.style)
      ? (filterLike(sequence.style.view, style.value.view) as
          | V3Sequence["style"]
          | undefined)
      : undefined;
    return {
      ...unknownFields(sequence, SEQUENCE_KEYS),
      id:
        typeof sequence.id === "string" && sequence.id
          ? sequence.id
          : newSaacId("seq"),
      ...(view && { style: { view } }),
      pictograms: Array.isArray(sequence.pictograms)
        ? sequence.pictograms.map((pictogram: unknown) =>
            readPictogram(pictogram, style.value, assets),
          )
        : [],
    } as V3Sequence;
  });
  // Un document té sempre com a mínim una seqüència
  if (sequences.length === 0)
    sequences.push({ id: newSaacId("seq"), pictograms: [] });

  const meta = isPlainObject(raw.meta) ? raw.meta : {};
  const ui = isPlainObject(raw.ui) ? raw.ui : undefined;

  return {
    file: {
      ...raw,
      format: SAAC_FORMAT,
      kind: "document",
      schemaVersion: raw.schemaVersion as number,
      meta: {
        ...meta,
        id:
          typeof meta.id === "string" && meta.id
            ? meta.id
            : context.newDocumentId(),
        ...(typeof meta.title === "string"
          ? { title: meta.title }
          : { title: undefined }),
        ...(typeof meta.author === "string"
          ? { author: meta.author }
          : { author: undefined }),
      },
      page: {
        ...(isPlainObject(raw.page) && unknownFields(raw.page, PAGE_KEYS)),
        ...page.value,
      },
      style: { ...(isPlainObject(raw.style) ? raw.style : {}), ...style.value },
      sequences,
      ...(Object.keys(assets).length > 0 && { assets }),
      ...(ui && { ui }),
    },
    complete: style.complete,
  };
};

// --- Migració dels formats antics ---

/**
 * Un document de Redux llegit d'un format antic, amb la forma del v3. Les regles
 * són les de la taula de migració: les seqüències buides es descarten, el
 * Fitzgerald dels que no tenen categoria és el de l'app, i la pàgina és la de
 * qui obre.
 */
export const legacyDocumentToV3 = (
  legacy: DocumentSAAC,
  context: Pick<ParseContext, "userDefault" | "userPage" | "now">,
): SaacDocumentV3 => {
  const document: DocumentSAAC = {
    ...legacy,
    content: { ...legacy.content },
    viewSettings: { ...legacy.viewSettings },
  };

  const keys = Object.keys(document.content)
    .map(Number)
    .sort((a, b) => a - b);
  const nonEmpty = keys.filter((key) => document.content[key].length > 0);
  // Si totes són buides, se'n conserva una: un document en té sempre una
  const kept = nonEmpty.length > 0 ? nonEmpty : keys.slice(0, 1);
  keys
    .filter((key) => !kept.includes(key))
    .forEach((key) => {
      delete document.content[key];
      delete document.viewSettings[key];
    });
  if (!kept.includes(document.activeSAAC)) document.activeSAAC = kept[0];

  // El Fitzgerald amb què naixien els pictogrames era una preferència: el dels
  // que no tenen categoria és el de l'app
  if (document.defaultSettings)
    document.defaultSettings = {
      ...document.defaultSettings,
      pictApiAra: {
        ...document.defaultSettings.pictApiAra,
        fitzgerald: FITZGERALD_NONE_COLOR,
      },
    };

  // Identificadors deterministes: el mateix fitxer antic dona sempre el mateix
  // document, i no poden coincidir amb els aleatoris (`p_` + 8 caràcters)
  let count = 0;
  const serializeContext: SerializeContext = {
    userDefault: context.userDefault,
    userPage: context.userPage,
    newId: (prefix) => `${prefix}_${(count += 1)}`,
    now: context.now,
  };
  return documentToV3(document, serializeContext);
};

// --- Punt d'entrada ---

/** Llegeix el text d'un fitxer (o el JSON del núvol) i decideix què és. */
export const parseSaac = (text: string, context: ParseContext): ParsedSaac => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { kind: "invalid" };
  }
  return parseSaacValue(raw, context);
};

export const parseSaacValue = (
  raw: unknown,
  context: ParseContext,
): ParsedSaac => {
  if (!isPlainObject(raw)) return { kind: "invalid" };

  if (raw.format === SAAC_FORMAT) {
    if (typeof raw.schemaVersion !== "number" || raw.schemaVersion < SAAC_V3)
      return { kind: "invalid" };
    const newerVersion = raw.schemaVersion > SAAC_V3;

    if (raw.kind === "style") {
      const style = completeLike<V3Style>(
        raw.style,
        styleToV3(context.userDefault),
      );
      const title =
        isPlainObject(raw.meta) && typeof raw.meta.title === "string"
          ? raw.meta.title
          : undefined;
      return {
        kind: "style",
        style: styleFromV3(
          style.value,
          context.userDefault.view.sequenceSpaceBetween,
        ),
        ...(title && { title }),
        newerVersion,
      };
    }

    if (raw.kind === "document") {
      const read = readV3Document(raw, context);
      if (read === null) return { kind: "invalid" };
      return {
        kind: "document",
        document: documentFromV3(read.file),
        file: read.file,
        notices: {
          legacy: false,
          withoutStyle: !read.complete,
          newerVersion,
        },
      };
    }

    return { kind: "invalid" };
  }

  // Formats sense `format`: 2.1.0, antic, primitiu i l'esquema 2 intern
  const legacy = parseSaacFile(raw, {
    userDefault: context.userDefault,
    newId: context.newDocumentId,
  });
  if (legacy.kind === "invalid") return legacy;
  if (legacy.kind === "style")
    return { kind: "style", style: legacy.style, newerVersion: false };

  const file = legacyDocumentToV3(legacy.document, context);
  return {
    kind: "document",
    document: documentFromV3(file),
    file,
    notices: {
      legacy: true,
      withoutStyle: legacy.styleOrigin !== "file",
      newerVersion: false,
    },
  };
};
