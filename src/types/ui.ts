import { SettingsT, SkinsT } from "./sequence";

export interface UiI {
  setting: {
    skin: SkinsT;
  };
}
export interface SettingPayloadI {
  setting: SettingsT;
  value: SkinsT;
}
