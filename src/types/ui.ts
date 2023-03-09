import { SkinsI } from "./sequence";

export type UiSkinsI = SkinsI | "default";

export type SettingItemsI = "skin";

export interface UiI {
  setting: {
    skin: UiSkinsI;
  };
}

export interface SettingItemPayloadI {
  item: SettingItemsI;
  value: UiSkinsI;
}
