export interface ProtoPictogramI {
  index: number;
  number: number;
}

export type SkinsI =
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
  skin?: SkinsI;
}

export type SettingItemsI = "skin";

export interface MessageI {
  id: string;
  description?: string;
  defaultMessage: string;
}

export interface SettingItemTypeI {
  name: SkinsI;
  message?: MessageI;
}

export interface SettingItemI {
  name: SettingItemsI;
  types: SettingItemTypeI[];
  message?: MessageI;
}
export type SequenceI = PictogramI[];

export interface SettingsI {
  skins: SettingItemI;
}

export interface UpdateSettingItemI {
  index?: number;
  item: SettingItemsI;
  value: SkinsI;
}
