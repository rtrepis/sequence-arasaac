import { SettingsT, SkinsT } from "./sequence";

export interface SettingsLangI {
  skins: SettingLangI;
}

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
