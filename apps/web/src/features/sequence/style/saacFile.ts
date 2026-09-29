// Lectura dels formats d'abans del v3: el `.saac` sense `format` (primitiu,
// antic, 2.1.0) i l'esquema 2 intern que mai no es va publicar.
//
// Ja no escriu res: els fitxers els escriu `features/sequence/saac/`, que
// passa per aquí per llegir els formats antics i després els migra al v3
// (`docs/fonaments/06-compatibilitat-i-dades.md`, §3 i §4).
//
// Formes conegudes, de la més vella a la més nova:
//
// | Forma                                   | Què és                                  |
// |-----------------------------------------|-----------------------------------------|
// | `{ sequence }`                          | Primitiu: una sola seqüència             |
// | `{ documentState }` sense `viewSettings` | Antic                                   |
// | `{ documentState?, defaultSettings? }`  | 2.1.0: les dues claus opcionals i soltes |
// | `{ schemaVersion: 2, documentState }`   | Document amb l'estil a dins              |
// | `{ schemaVersion: 2, style }`           | Fitxer d'estil                           |
//
// Un fitxer sense `schemaVersion` vol dir «2.1.0 o anterior».
import {
  DocumentSAAC,
  DocumentLayout,
  SequenceStyle,
  SequenceStyleView,
  SequenceViewSettings,
} from "@/types/document";
import { DefaultSettings } from "@/types/ui";
import { Sequence } from "@/types/sequence";
import { pictStyleOf, tabViewOf } from "./styleModel";

/** D'on ha sortit l'estil d'un document obert. */
export type StyleOrigin =
  /** El fitxer el portava sencer */
  | "file"
  /** El fitxer en portava una part; la resta és l'estil per defecte */
  | "partial"
  /** El fitxer no en portava: és l'estil per defecte */
  | "default";

export type ParsedSaacFile =
  | { kind: "document"; document: DocumentSAAC; styleOrigin: StyleOrigin }
  | { kind: "style"; style: SequenceStyle }
  | { kind: "invalid" };

// --- Fusió camp a camp ---

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Pren del fitxer tot el que té la mateixa forma que el valor de reserva, camp a
 * camp i a qualsevol profunditat, i omple la resta amb la reserva. Un camp que
 * hi és però amb un tipus que no toca (un número on va un text) compta com a
 * absent: val més l'estil per defecte que un valor que no es pot pintar.
 * Les claus que la reserva no coneix es descarten.
 */
const mergeLike = <T>(
  value: unknown,
  fallback: T,
): { merged: T; complete: boolean } => {
  if (isRecord(fallback)) {
    if (!isRecord(value)) return { merged: fallback, complete: false };

    let complete = true;
    const merged: Record<string, unknown> = {};
    Object.entries(fallback).forEach(([key, fallbackValue]) => {
      const result = mergeLike(value[key], fallbackValue);
      merged[key] = result.merged;
      complete = complete && result.complete;
    });
    return { merged: merged as T, complete };
  }

  if (typeof value === typeof fallback && value !== undefined)
    return { merged: value as T, complete: true };

  return { merged: fallback, complete: false };
};

// Camps de text que només admeten uns valors: la forma no n'hi ha prou
const ENUMS = {
  textPosition: ["top", "bottom", "none"],
  alignmentH: ["left", "center", "right"],
  alignmentV: ["top", "center", "bottom"],
  skin: ["asian", "aztec", "black", "mulatto", "white"],
  hair: ["black", "blonde", "brown", "darkBrown", "gray", "darkGray", "red"],
} as const;

const validEnum = <K extends keyof typeof ENUMS>(
  key: K,
  value: unknown,
): boolean => (ENUMS[key] as readonly unknown[]).includes(value);

/**
 * Estil dels pictogrames d'un fitxer, completat amb l'estil per defecte.
 *
 * Un cas especial: els fitxers antics podien no portar `numberFont`, i llavors
 * els números es pintaven amb la lletra del text. Per veure'ls igual, la lletra
 * dels números que falta surt de la del text **del fitxer**, no de la de
 * l'estil per defecte.
 */
const mergePictStyle = (
  value: unknown,
  fallback: DefaultSettings,
): { merged: DefaultSettings; complete: boolean } => {
  const source = isRecord(value) ? value : {};
  const pictSequence = isRecord(source.pictSequence)
    ? { ...source.pictSequence }
    : undefined;

  // Deduir-la del fitxer no la fa venir del fitxer: l'estil continua sent parcial
  const numberFontDerived =
    !!pictSequence &&
    pictSequence.numberFont === undefined &&
    isRecord(pictSequence.font);
  if (pictSequence && numberFontDerived)
    pictSequence.numberFont = pictSequence.font;

  const { merged, complete } = mergeLike({ ...source, pictSequence }, fallback);

  let allValid = complete && !numberFontDerived;
  if (!validEnum("textPosition", merged.pictSequence.textPosition)) {
    merged.pictSequence.textPosition = fallback.pictSequence.textPosition;
    allValid = false;
  }
  if (!validEnum("skin", merged.pictApiAra.skin)) {
    merged.pictApiAra.skin = fallback.pictApiAra.skin;
    allValid = false;
  }
  if (!validEnum("hair", merged.pictApiAra.hair)) {
    merged.pictApiAra.hair = fallback.pictApiAra.hair;
    allValid = false;
  }

  return { merged, complete: allValid };
};

/**
 * Vista d'una pestanya o d'un estil, completada amb la reserva. Accepta
 * l'alineació única d'abans de separar horitzontal i vertical, com fa l'API.
 */
const mergeView = <T extends SequenceViewSettings>(
  value: unknown,
  fallback: T,
): { merged: T; complete: boolean } => {
  const source = isRecord(value) ? { ...value } : undefined;
  if (
    source &&
    source.alignmentH === undefined &&
    source.alignment !== undefined
  )
    source.alignmentH = source.alignment;

  const { merged, complete } = mergeLike(source, fallback);

  let allValid = complete;
  if (!validEnum("alignmentH", merged.alignmentH)) {
    merged.alignmentH = fallback.alignmentH;
    allValid = false;
  }
  if (!validEnum("alignmentV", merged.alignmentV)) {
    merged.alignmentV = fallback.alignmentV;
    allValid = false;
  }

  return { merged, complete: allValid };
};

/** Un estil complet a partir del que porti un fitxer d'estil. */
export const mergeStyle = (
  value: unknown,
  fallback: SequenceStyle,
): { style: SequenceStyle; complete: boolean } => {
  const source = isRecord(value) ? value : {};
  const pict = mergePictStyle(source, pictStyleOf(fallback));
  const view = mergeView(source.view, fallback.view);

  return {
    style: { ...pict.merged, view: view.merged },
    complete: pict.complete && view.complete,
  };
};

// --- Documents ---

// El fitzgerald d'un pictograma podia ser l'objecte { value, color } d'abans; el
// client espera el color i prou. L'API fa el mateix en llegir de la base de dades.
const normalizeContent = (
  content: Record<string, unknown>,
): { [key: number]: Sequence } => {
  const normalized: { [key: number]: Sequence } = {};

  Object.entries(content).forEach(([key, sequence]) => {
    if (!Array.isArray(sequence)) return;
    normalized[Number(key)] = sequence.map((pict: Sequence[number]) => {
      const fitzgerald: unknown = pict?.img?.settings?.fitzgerald;
      if (isRecord(fitzgerald) && typeof fitzgerald.color === "string")
        return {
          ...pict,
          img: {
            ...pict.img,
            settings: { ...pict.img.settings, fitzgerald: fitzgerald.color },
          },
        };
      return pict;
    });
  });

  return normalized;
};

const sortedKeys = (
  content: { [key: number]: Sequence },
  order?: number[],
): number[] => {
  const keys = Object.keys(content)
    .map(Number)
    .sort((a, b) => a - b);
  const first = order?.find((key) => keys.includes(key));
  return first === undefined
    ? keys
    : [first, ...keys.filter((k) => k !== first)];
};

/**
 * Tradueix l'estat d'un document de qualsevol època al model d'avui, amb
 * l'estil sempre ple:
 *
 * - **Estil dels pictogrames**: el del document (esquema 2), o el
 *   `defaultSettings` que el 2.1.0 desava al costat, o l'estil per defecte. El
 *   que falti d'un estil parcial s'omple camp a camp amb l'estil per defecte.
 * - **Vista de l'estil**: la del document (esquema 2). Els documents d'abans no
 *   en tenien; la base és la vista de la primera pestanya, que és la que
 *   comparteixen totes quan s'ajusten juntes. Sense cap pestanya amb vista,
 *   l'estil per defecte.
 * - **Vista de cada pestanya**: la seva, completada amb la de l'estil.
 */
export const normalizeDocumentState = (
  raw: unknown,
  options: {
    userDefault: SequenceStyle;
    /** `defaultSettings` que el 2.1.0 desava fora del document */
    siblingDefaultSettings?: unknown;
  },
): { document: DocumentSAAC; styleOrigin: StyleOrigin } | null => {
  if (!isRecord(raw) || !isRecord(raw.content)) return null;
  const { userDefault, siblingDefaultSettings } = options;

  const content = normalizeContent(raw.content);
  if (Object.keys(content).length === 0) content[0] = [];

  const order = Array.isArray(raw.order)
    ? raw.order.filter((key): key is number => typeof key === "number")
    : undefined;
  const keys = sortedKeys(content, order);
  const rawViews = isRecord(raw.viewSettings) ? raw.viewSettings : {};

  // Estil dels pictogrames
  const pictSource = raw.defaultSettings ?? siblingDefaultSettings;
  const pict =
    pictSource === undefined || pictSource === null
      ? null
      : mergePictStyle(pictSource, pictStyleOf(userDefault));

  // Vista de l'estil
  const firstTabView = keys
    .map((key) => rawViews[String(key)])
    .find((view) => view !== undefined);
  const styleViewSource: unknown =
    raw.styleView ??
    (firstTabView !== undefined
      ? {
          ...(firstTabView as object),
          sequenceSpaceBetween: userDefault.view.sequenceSpaceBetween,
        }
      : undefined);
  const view =
    styleViewSource === undefined
      ? null
      : mergeView<SequenceStyleView>(styleViewSource, userDefault.view);
  // Una vista deduïda de la primera pestanya no és «estil parcial»: el fitxer
  // no en tenia cap, i el que es compara és el que ell porta
  const viewFromFile = raw.styleView !== undefined;

  const styleView = view?.merged ?? userDefault.view;
  const tabBase = tabViewOf(styleView);

  const viewSettings: { [key: number]: SequenceViewSettings } = {};
  keys.forEach((key) => {
    viewSettings[key] = mergeView(rawViews[String(key)], tabBase).merged;
  });

  const activeSAAC =
    typeof raw.activeSAAC === "number" && content[raw.activeSAAC] !== undefined
      ? raw.activeSAAC
      : keys[0];

  const layout = isRecord(raw.layout)
    ? (raw.layout as DocumentLayout)
    : undefined;

  const document: DocumentSAAC = {
    id: typeof raw.id === "string" ? raw.id : "",
    ...(typeof raw.title === "string" && { title: raw.title }),
    content,
    viewSettings,
    activeSAAC,
    ...(order && { order }),
    ...(typeof raw.author === "string" && { author: raw.author }),
    defaultSettings: pict?.merged ?? pictStyleOf(userDefault),
    styleView,
    ...(layout && { layout }),
  };

  const styleOrigin: StyleOrigin =
    pict === null && !viewFromFile
      ? "default"
      : pict !== null && pict.complete && (!viewFromFile || !!view?.complete)
        ? "file"
        : "partial";

  return { document, styleOrigin };
};

/**
 * Llegeix el contingut d'un fitxer ja interpretat com a JSON.
 *
 * `newId` dona l'identificador d'un document que el fitxer no porta (el format
 * primitiu no en tenia).
 */
export const parseSaacFile = (
  raw: unknown,
  options: { userDefault: SequenceStyle; newId: () => string },
): ParsedSaacFile => {
  if (!isRecord(raw)) return { kind: "invalid" };
  const { userDefault, newId } = options;

  // Fitxer d'estil de l'esquema 2
  if (isRecord(raw.style)) {
    return { kind: "style", style: mergeStyle(raw.style, userDefault).style };
  }

  // Document (2.1.0, antic o esquema 2)
  if (isRecord(raw.documentState)) {
    const normalized = normalizeDocumentState(raw.documentState, {
      userDefault,
      siblingDefaultSettings: raw.defaultSettings,
    });
    if (normalized === null) return { kind: "invalid" };
    if (normalized.document.id === "") normalized.document.id = newId();
    return { kind: "document", ...normalized };
  }

  // Primitiu: una sola seqüència, sense estil
  if (Array.isArray(raw.sequence)) {
    const normalized = normalizeDocumentState(
      { id: newId(), content: { 0: raw.sequence }, activeSAAC: 0 },
      { userDefault },
    );
    if (normalized === null) return { kind: "invalid" };
    return { kind: "document", ...normalized };
  }

  // Antic «només preferències»: s'interpreta com a fitxer d'estil
  if (isRecord(raw.defaultSettings)) {
    return {
      kind: "style",
      style: mergeStyle(raw.defaultSettings, userDefault).style,
    };
  }

  return { kind: "invalid" };
};
