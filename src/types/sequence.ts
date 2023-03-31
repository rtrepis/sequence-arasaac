export type Sequence = PictSequence[];

export interface PictSequence {
  indexSequence: number;
  img: PictApiAra;
  text?: string;
  settings: PictSequenceSettings;
}
export interface PictSequenceSettings {
  textPosition: "top" | "bottom";
  border?: {
    out?: Border;
    in?: Border;
  };
}

export type TextPosition = "top" | "bottom";
export interface Border {
  color: string;
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

export interface UpdateSelectedId {
  indexSequence: number;
  selectedId: number;
}

export interface UpdateSearched {
  indexSequence: number;
  searched: Word;
}

export interface PictApiAraSettings {
  skin?: Skins;
}

export interface UpDateSettingsPictApiAra {
  indexSequence?: number;
  settings: PictApiAraSettings;
}

export interface upDateSettingsPictSequence {
  indexSequence?: number;
  settings: PictSequenceSettings;
}

export interface upDateSettingsTry {
  indexSequence?: number;
  settings: PictSequenceSettings & PictApiAraSettings;
}

export type PictAllSettings = {
  skin: Skins;
  textPosition: TextPosition;
};

//export type PictAllSettings = PictSequenceSettings & PictApiAraSettings;
