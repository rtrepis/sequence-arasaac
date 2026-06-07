import { Border, Font, Hair, Skin, TextPosition } from "./sequence";

// Idiomes suportats per la interfície de l'aplicació (subconjunt de Languages)
export type LangsApp = "ca" | "en" | "es" | "fr" | "it";

export type ThemeMode = "light" | "dark" | "system";

export type PageSize = "A4" | "A3" | "FULLSCREEN";

export interface ViewSettings {
  sizePict: number;
  pictSpaceBetween: number;
  sequenceSpaceBetween: number;
  alignmentH: "left" | "center" | "right";
  alignmentV: "top" | "center" | "bottom";
  direction: "row" | "column";
  pageSize: PageSize;
  orientation: "landscape" | "portrait";
  author: string;
}

export interface UserUiSettings {
  lang: { app: LangsApp; search: string };
  theme: ThemeMode;
  viewSettings?: ViewSettings;
  defaultSettings: DefaultSettings;
}

export interface DefaultSettings {
  pictSequence: DefaultSettingsPictSequence;
  pictApiAra: DefaultSettingsPictAra;
}

export interface DefaultSettingsPictAra {
  hair: Hair;
  skin: Skin;
  fitzgerald: string;
  color: boolean;
}

export interface DefaultSettingsPictSequence {
  numbered: boolean;
  textPosition: TextPosition;
  font: Font;
  numberFont: Font;
  borderOut: Border;
  borderIn: Border;
}
