import { Border, Font, Hair, Skin, TextPosition } from "./sequence";

// Idiomes suportats per la interfície de l'aplicació (subconjunt de Languages)
export type LangsApp = "ca" | "en" | "es";

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
