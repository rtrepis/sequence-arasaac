import { FontFamily } from "./FontFamily";

export type Sequence = PictSequence[];

export interface PictSequence {
  indexSequence: number;
  img: PictApiAra;
  text?: string;
  cross: boolean;
  settings: PictSequenceSettings;
}

export interface PictImg {
  url: string;
}
export interface PictSequenceSettings {
  numbered?: boolean;
  textPosition?: TextPosition;
  font?: Font;
  fontSize?: number;
  fontFamily?: FontFamily;
  borderOut?: Border;
  borderIn?: Border;
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

export type Languages = "ca" | "es" | "en";
