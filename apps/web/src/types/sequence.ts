import { langTranslateSearch } from "../configs/languagesConfigs";
import { FontFamily } from "./FontFamily";
import type {
  FitzgeraldCategory,
  FitzgeraldCategoryColors,
} from "@features/sequence/saac/fitzgerald";
import type { PictogramVariant } from "@features/sequence/saac/types";

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
/**
 * Els retocs de la targeta d'un pictograma: **només** el que l'usuari ha
 * canviat (solució A del pla dels estils). Sense valor, s'hereta de l'estil.
 * `textPosition: "none"` és el retoc «sense text», sempre explícit.
 */
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

// L'estil que hereten els pictogrames: el que la targeta fa servir per a tot
// el que el pictograma no retoca (sense Redux)
export interface PictogramCardDefaults {
  numbered: boolean;
  textPosition: TextPosition;
  skin: Skin;
  hair: Hair;
  color: boolean;
  /** Color de Fitzgerald dels pictogrames que no tenen categoria */
  fitzgerald?: string;
  /** Color de Fitzgerald de cada categoria; sense, els de l'app */
  fitzgeraldColors?: FitzgeraldCategoryColors;
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
  /** Els retocs de la imatge (pell, cabell, color, Fitzgerald): només els de l'usuari */
  settings: PictApiAraSettings;
  /**
   * Quines variants d'ARASAAC admet el pictograma. Sense valor (un pictograma
   * d'abans de la solució A), les que porta a `settings`
   */
  variants?: PictogramVariant[];
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
