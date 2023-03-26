import { ApiAraPictSettings, Skins } from "./sequence";

export interface SettingsLangI {
  skins: SettingLangI;
}

export interface MessageI {
  id: string;
  description?: string;
  defaultMessage: string;
}

export interface TypesLangI {
  name: Skins;
  message?: MessageI;
}

export interface SettingLangI {
  name: ApiAraPictSettings;
  types: TypesLangI[];
  message?: MessageI;
}
