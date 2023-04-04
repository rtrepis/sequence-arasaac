export type Sequence = PictSequence[];

export interface PictSequence {
  indexSequence: number;
  img: PictApiAra;
  text?: string;
  settings: PictSequenceSettings;
}
export interface PictSequenceSettings {
  numbered?: boolean;
  textPosition?: TextPosition;
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

export type PictSequenceForEdit = MyPartialForEdit<PictSequenceSettings>;

export type PictApiAraForEdit = MyPartialForEdit<PictApiAra>;

export type TextPosition = "top" | "bottom" | "none";
export interface Border {
  color: "fitzgerald" | string;
  radius: number;
  size: number;
}

interface PictApiAra {
  searched: Word;
  selectedId: number;
  settings: PictApiAraSettings;
}

export interface Word {
  word: string;
  bestIdPicts: number[];
  keyWords?: string[];
  IdPicts?: number[];
}

export type Skins = "asian" | "aztec" | "black" | "mulatto" | "white";

export interface PictApiAraSettings {
  skin?: Skins;
  fitzgerald?: string;
}
