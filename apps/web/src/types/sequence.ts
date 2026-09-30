import { langTranslateSearch } from "../configs/languagesConfigs";
import { FontFamily } from "./FontFamily";
import type { FitzgeraldCategory } from "@features/sequence/saac/fitzgerald";

export type Sequence = PictSequence[];

export interface PictSequence {
  indexSequence: number;
  img: PictApiAra;
  text?: string;
  cross: boolean;
  settings: PictSequenceSettings;
  /** Identificador estable del pictograma al fitxer `.saac` (v3) */
  id?: string;
  /**
   * Camps del fitxer que l'app no coneix: es conserven i es tornen a escriure
   * en desar (`docs/fonaments/06-compatibilitat-i-dades.md`)
   */
  saacExtra?: { pictogram?: SaacExtraFields; image?: SaacExtraFields };
}

/** Camps desconeguts d'un objecte del fitxer, tal com han vingut. */
export type SaacExtraFields = Record<string, unknown>;

export interface PictImg {
  url: string;
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
  /** Color de Fitzgerald dels pictogrames que no en porten cap */
  fitzgerald?: string;
  font: Font;
  numberFont?: Font;
  borderIn: Border;
  borderOut: Border;
}

type MyPartialForEdit<Type> = {
  [Property in keyof Type]?: Type[Property];
} & { indexSequence: number };

type MyPartialApplyAll<Type> = {
  [Property in keyof Type]?: Type[Property];
};

export type SequenceForEdit = MyPartialForEdit<PictSequence>;

export type PictSequenceApplyAll = MyPartialApplyAll<PictSequenceSettings>;

export type PictApiAraApplyAll = MyPartialApplyAll<PictApiAra>;

export type PictApiAraSettingsApplyAll = MyPartialApplyAll<PictApiAraSettings>;

export type PictSequenceSettingsForEdit =
  MyPartialForEdit<PictSequenceSettings>;

export type PictApiAraForEdit = MyPartialForEdit<PictApiAra>;

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
export interface PictApiAra {
  searched: Word;
  selectedId: number;
  settings: PictApiAraSettings;
  url?: string;
  /**
   * Categoria de Fitzgerald de la paraula, que dona ARASAAC. És contingut, no
   * estil. `"none"`: se sap que no en té; sense valor: no se sap (un pictograma
   * d'abans del format v3), i es dedueix del color en desar-lo.
   */
  category?: FitzgeraldCategory | "none";
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

export interface PictApiAraSettings {
  hair?: Hair;
  skin?: Skin;
  fitzgerald?: string;
  color?: boolean;
}

export type Languages = (typeof langTranslateSearch)[number];

export interface Ai {
  word: string;
  text: string;
}
