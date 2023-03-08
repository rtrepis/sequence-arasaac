export interface PictogramI {
  index: number;
  number: number;
  border?: {
    in?: BorderPictI;
    out?: BorderPictI;
  };
  skin?: SkinsI;
}
export interface BorderPictI {
  color: string;
  radius: number;
  size: number;
}

export type SkinsI = "asian" | "aztec" | "black" | "mulatto" | "white";

export interface MessageI {
  id: string;
  description?: string;
  defaultMessage: string;
}

export interface SettingItemTypeI {
  name: SkinsI;
  message: MessageI;
}

export interface SettingItemI {
  name: string;
  types: SettingItemTypeI[];
  message: MessageI;
}
export type SequenceI = PictogramI[];

export interface SettingsI {
  skins: SettingItemI;
}
