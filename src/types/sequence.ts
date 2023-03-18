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
  userText?: string;
  pictograms: number[];
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

export type SequenceI = PictogramI[];

export interface UpdateSettingI {
  index?: number;
  setting: SettingsT;
  value: SkinsT;
}
