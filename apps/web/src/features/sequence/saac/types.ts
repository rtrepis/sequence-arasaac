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

export interface V3Page {
  size: PageSize;
  orientation: PageOrientation;
  direction: SequenceDirection;
  sequenceGap: number;
  layout: "flow" | "free";
}

export type V3Image =
  | {
      source: "arasaac";
      id: number;
      alternatives?: number[];
      keywords?: string[];
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
