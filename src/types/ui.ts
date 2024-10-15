import { Border, Font, Hair, Skin, TextPosition } from "./sequence";

export type Langs = "ca" | "en" | "es";

export interface Ui {
  lang?: Langs;
  viewSettings: ViewSettings;
  defaultSettings: DefaultSettings;
}

export interface ViewSettings {
  sizePict: number;
  columnGap: number;
  rowGap: number;
}

export interface DefaultSettings {
  pictSequence: DefaultSettingsPictSequence;
  pictApiAra: DefaultSettingsPictAra;
}

interface DefaultSettingsPictAra {
  hair: Hair;
  skin: Skin;
  fitzgerald: string;
  color: boolean;
}
export interface DefaultSettingsPictSequence {
  numbered: boolean;
  textPosition: TextPosition;
  font: Font;
  borderOut: Border;
  borderIn: Border;
}

type MyPartialForEdit<Type> = {
  [Property in keyof Type]?: Type[Property];
};

export type BorderForEdit = MyPartialForEdit<Border>;

export type DefaultSettingsForEdit = MyPartialForEdit<DefaultSettings>;

export type DefaultSettingsPictApiAraForEdit =
  MyPartialForEdit<DefaultSettingsPictAra>;

export type DefaultSettingsPictSequenceForEdit =
  MyPartialForEdit<DefaultSettingsPictSequence>;
