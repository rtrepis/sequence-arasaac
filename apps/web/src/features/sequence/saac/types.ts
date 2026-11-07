// Tipus del fitxer `.saac` / `.saacstyle` v3. Són el contracte del fitxer: el
// model de Redux no canvia de forma, i `serialize.ts` / `toRedux.ts` en fan la
// conversió. L'esquema formal és `docs/schema/saac-v3.schema.json`.
import type { Border, Font, Hair, Skin, TextPosition } from "@/types/sequence";
import type { SequenceAlignmentH, SequenceAlignmentV } from "@/types/document";
import type { PageOrientation, PageSize, SequenceDirection } from "@/types/ui";
import type { FitzgeraldCategory, FitzgeraldColors } from "./fitzgerald";

export const SAAC_FORMAT = "sequenciaac";
export const SAAC_V3 = 3;
export const DOCUMENT_FILE_EXTENSION = ".saac";
export const STYLE_FILE_EXTENSION = ".saacstyle";

/**
 * El que accepta el selector de fitxers. El tipus es decideix pel contingut, i
 * per això s'hi admeten també els `.txt` i `.json`: els `.saac.txt` que el
 * mòbil desava amb `text/plain` s'han de poder obrir.
 */
export const SAAC_FILE_ACCEPT = [
  DOCUMENT_FILE_EXTENSION,
  STYLE_FILE_EXTENSION,
  ".txt",
  ".json",
  "text/plain",
  "application/json",
  "application/octet-stream",
].join(",");

/** Tipus MIME de la descàrrega: amb `text/plain`, el mòbil hi afegeix `.txt`. */
export const SAAC_DOWNLOAD_MIME = "application/octet-stream";

/** Parcial a qualsevol profunditat: el que porta un retoc. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export interface V3PictogramStyle {
  skin: Skin;
  hair: Hair;
  color: boolean;
  fitzgerald: FitzgeraldColors;
}

export interface V3CardStyle {
  numbered: boolean;
  textPosition: TextPosition;
  font: Font;
  numberFont: Font;
  borderIn: Border;
  borderOut: Border;
}

export interface V3View {
  sizePict: number;
  pictSpaceBetween: number;
  alignmentH: SequenceAlignmentH;
  alignmentV: SequenceAlignmentV;
}

/** Estil complet: el del document i el d'un fitxer d'estil. */
export interface V3Style {
  pictogram: V3PictogramStyle;
  card: V3CardStyle;
  view: V3View;
}

/** Retoc d'un pictograma: el Fitzgerald hi és un sol color. */
export interface V3PictogramOverride {
  pictogram?: Partial<Omit<V3PictogramStyle, "fitzgerald">> & {
    fitzgerald?: string;
  };
  card?: DeepPartial<V3CardStyle>;
}

/** Estil resolt d'una targeta: el Fitzgerald ja és el color que es pinta. */
export interface ResolvedCardStyle {
  pictogram: Omit<V3PictogramStyle, "fitzgerald"> & { fitzgerald: string };
  card: V3CardStyle;
  view: V3View;
}

/** El que tenen tots els blocs: la caixa només hi és on fa falta. */
export interface V3BlockBase {
  id: string;
  /**
   * La caixa, en mil·límetres des del cantó superior esquerre del full. Només
   * a les pàgines amb plantilla i als blocs comuns
   */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  /** L'espai de la plantilla de la pàgina que ocupa */
  slot?: number;
  /** L'`id` d'un estil amb nom del document (`styles`) */
  namedStyle?: string;
  [unknown: string]: unknown;
}

/** Un bloc de seqüència: `sequence` és l'`id` de la seqüència. */
export interface V3SequenceBlock extends V3BlockBase {
  kind: "sequence";
  sequence: string;
  /** Sense valor, `"auto"` */
  columns?: "auto" | number;
  /** Retoc de la vista en aquest bloc, sobre la de la seqüència */
  view?: Partial<V3View>;
}

/** Retoc de l'aspecte d'un bloc de text, sobre `style.card.font`. */
export interface V3TextStyle {
  font?: Partial<Font>;
  bold?: boolean;
  alignmentH?: SequenceAlignmentH;
  alignmentV?: SequenceAlignmentV;
}

/** Un bloc de text: un rètol sense pictograma. */
export interface V3TextBlock extends V3BlockBase {
  kind: "text";
  text: string;
  textStyle?: V3TextStyle;
}

/**
 * Un bloc que l'app no entén, **només a la lectura**: `raw` és el bloc tal
 * com era al fitxer, i és el que es torna a escriure. Al fitxer no hi ha mai
 * cap `kind: "foreign"`; si n'hi hagués un, seria un bloc desconegut més.
 */
export interface V3ForeignBlock {
  kind: "foreign";
  raw: Record<string, unknown>;
}

export type V3Block = V3SequenceBlock | V3TextBlock;

/**
 * Una pàgina del document. A la lectura, `blocks` també pot portar els blocs
 * que l'app no entén (`V3ForeignBlock`).
 */
export interface V3Sheet {
  id: string;
  mode: "auto" | "template";
  /** Només en automàtica; sense valor, la de `page.direction` */
  direction?: SequenceDirection;
  /** L'`id` de la plantilla de la pàgina, si en té */
  template?: string;
  blocks: (V3Block | V3ForeignBlock)[];
  [unknown: string]: unknown;
}

export interface V3Page {
  size: PageSize;
  orientation: PageOrientation;
  /** La de les pàgines automàtiques que no en diuen cap */
  direction: SequenceDirection;
  sequenceGap: number;
  /**
   * Obsolet: s'escriu sempre `"flow"`, perquè les versions anteriors el
   * llegeixen. Només els fitxers de les fases 1–3 del mode lliure hi deien
   * `"free"`; ara és cada pàgina la que diu com es col·loquen els blocs
   */
  layout: "flow" | "free";
  /** Les pàgines, en ordre. Sense valor, una sola pàgina automàtica */
  sheets?: V3Sheet[];
  /** Els blocs que surten a totes les pàgines, sempre amb caixa */
  common?: (V3Block | V3ForeignBlock)[];
}

/**
 * Un estil amb nom: un retoc de l'estil del document, amb la mateixa forma que
 * els retocs (`pictogram.fitzgerald` hi és una taula parcial, com al document).
 */
export interface V3NamedStyle {
  id: string;
  name: string;
  pictogram?: Partial<Omit<V3PictogramStyle, "fitzgerald">> & {
    fitzgerald?: Partial<FitzgeraldColors>;
  };
  card?: DeepPartial<V3CardStyle>;
  view?: Partial<V3View>;
  [unknown: string]: unknown;
}

export const PICTOGRAM_VARIANTS = ["skin", "hair", "color"] as const;
export type PictogramVariant = (typeof PICTOGRAM_VARIANTS)[number];

export type V3Image =
  | {
      source: "arasaac";
      id: number;
      alternatives?: number[];
      keywords?: string[];
      /**
       * Les opcions d'aparença que admet aquest pictograma d'ARASAAC (no tots
       * tenen pell o cabell). És contingut: ho diu ARASAAC, no l'estil
       */
      variants?: PictogramVariant[];
    }
  | {
      source: "own";
      asset: string;
      /** El pictograma d'ARASAAC que la imatge pròpia substitueix */
      id?: number;
    }
  | { source: "none" };

export interface V3Pictogram {
  id: string;
  word: string;
  text?: string;
  cross?: boolean;
  category?: FitzgeraldCategory;
  image: V3Image;
  style?: V3PictogramOverride;
  [unknown: string]: unknown;
}

export interface V3Sequence {
  id: string;
  title?: string;
  style?: { view?: Partial<V3View> };
  pictograms: V3Pictogram[];
  [unknown: string]: unknown;
}

export interface V3Asset {
  mime: string;
  data?: string;
  url?: string;
}

export interface V3Meta {
  id?: string;
  title?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  [unknown: string]: unknown;
}

export interface SaacDocumentV3 {
  format: typeof SAAC_FORMAT;
  kind: "document";
  schemaVersion: number;
  savedWith?: string;
  meta: V3Meta;
  page: V3Page;
  style: V3Style;
  sequences: V3Sequence[];
  /** Els estils amb nom, que els blocs fan servir per `namedStyle` */
  styles?: V3NamedStyle[];
  assets?: Record<string, V3Asset>;
  ui?: { activeSequence?: string; [unknown: string]: unknown };
  [unknown: string]: unknown;
}

export interface SaacStyleFileV3 {
  format: typeof SAAC_FORMAT;
  kind: "style";
  schemaVersion: number;
  meta?: { title?: string };
  style: V3Style;
}
