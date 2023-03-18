export interface ProtoPictogramI {
  index: number;
  number: number;
}

export type SkinsT =
  | "asian"
  | "aztec"
  | "black"
  | "mulatto"
  | "white"
  | "default";

export interface BorderPictI {
  color: string;
  radius: number;
  size: number;
}

export interface WordI {
  keyWord: string;
}

export interface UpdatePictWordI {
  indexPict: number;
  word: WordI;
}
export interface PictogramI extends ProtoPictogramI {
  word: WordI;
  border?: {
    in?: BorderPictI;
    out?: BorderPictI;
  };
  skin?: SkinsT;
}

export type SettingsT = "skin";

export interface MessageI {
  id: string;
  description?: string;
  defaultMessage: string;
}

export interface TypesLangI {
  name: SkinsT;
  message?: MessageI;
}

export interface SettingLangI {
  name: SettingsT;
  types: TypesLangI[];
  message?: MessageI;
}
export type SequenceI = PictogramI[];

export interface SettingsLangI {
  skins: SettingLangI;
}

export interface UpdateSettingI {
  index?: number;
  setting: SettingsT;
  value: SkinsT;
}
