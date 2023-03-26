export type Sequence = PictSequence[];

export interface PictSequence {
  indexSequence: number;
  img: PictApiAra;
  text?: string;
  settings: PictSequenceSettings;
}
export interface PictSequenceSettings {
  textPosition?: "top" | "bottom";
  border?: {
    out?: Border;
    in?: Border;
  };
}
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

export type Skins =
  | "asian"
  | "aztec"
  | "black"
  | "mulatto"
  | "white"
  | "default";

export interface UpdateSelectedId {
  indexSequence: number;
  selectedId: number;
}

export interface UpdateSearched {
  indexSequence: number;
  searched: Word;
}

export interface PictApiAraSettings {
  skin: Skins;
}
export interface UpdateSetting<S extends ApiAraPictSettings> {
  indexSequence?: number;
  setting: S;
  value: S extends "skin" ? Skins : never;
}
export type SettingToUpdate = SkinToUpdate;

export type SkinToUpdate = UpdateSetting<"skin">;

export interface UpdateAllSetting {
  setting: ApiAraPictSettings;
  value: Skins;
}

export type ApiAraPictSettings = "skin";
