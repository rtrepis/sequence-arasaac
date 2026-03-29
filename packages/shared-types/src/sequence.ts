import { FontFamily } from "./FontFamily";

export type Sequence = PictSequence[];

export interface PictSequence {
  indexSequence: number;
  img: PictApiAra;
  text?: string;
  cross: boolean;
  settings: PictSequenceSettings;
}

export interface PictSequenceSettings {
  numbered?: boolean;
  textPosition?: TextPosition;
  font?: Font;
  numberFont?: Font;
  fontSize?: number;
  fontFamily?: FontFamily;
  borderOut?: Border;
  borderIn?: Border;
}

// Valors per defecte que PictogramCard necessita per al fallback (sense Redux)
export interface PictogramCardDefaults {
  numbered: boolean;
  font: Font;
  numberFont?: Font;
  borderIn: Border;
  borderOut: Border;
}

export type TextPosition = "top" | "bottom" | "none";

export interface Border {
  color: "fitzgerald" | string;
  radius: number;
  size: number;
}

export interface Font {
  family: FontFamily;
  color: string;
  size: number;
}

// PictApiAra amb url opcional — si és data:image/ el backend la puja a Cloudinary i la substitueix per la URL CDN
export interface PictApiAra {
  searched: Word;
  selectedId: number;
  settings: PictApiAraSettings;
  url?: string;
}

export interface Word {
  word: string;
  bestIdPicts: number[];
  keyWords?: string[];
}

export type Skin = "asian" | "aztec" | "black" | "mulatto" | "white";

export type Hair =
  | "black"
  | "blonde"
  | "brown"
  | "darkBrown"
  | "gray"
  | "darkGray"
  | "red";

export interface FitzgeraldColor {
  value: string;
  color: string;
}

export interface PictApiAraSettings {
  hair?: Hair;
  skin?: Skin;
  fitzgerald?: FitzgeraldColor;
  color?: boolean;
}

// Codis d'idioma suportats per l'API ARASAAC — definit com a literal union independent
// (equivalent a `(typeof langTranslateSearch)[number]` de languagesConfigs.ts)
export type Languages =
  | "an" | "ar" | "bg" | "br" | "ca" | "cs" | "da" | "de"
  | "el" | "en" | "es" | "et" | "eu" | "fa" | "fr" | "gl"
  | "he" | "hr" | "hu" | "it" | "ko" | "lt" | "lv" | "mk"
  | "nb" | "nl" | "pl" | "pt" | "ro" | "ru" | "sk" | "sq"
  | "sv" | "sr" | "val" | "uk" | "zh";
