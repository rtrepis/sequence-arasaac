import { SettingItemsI, SkinsI } from "./sequence";

export interface UiI {
  setting: {
    skin: SkinsI;
  };
  modal: {
    pictEdit: PictEditI;
  };
}

export interface PictEditI {
  isOpen: boolean;
  indexPict: number;
}

export interface SettingItemPayloadI {
  item: SettingItemsI;
  value: SkinsI;
}
