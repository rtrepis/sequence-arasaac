import { SettingItemsI, SkinsI } from "./sequence";

export interface UiI {
  setting: {
    skin: SkinsI;
  };
}
export interface SettingItemPayloadI {
  item: SettingItemsI;
  value: SkinsI;
}
