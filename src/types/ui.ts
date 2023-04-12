import { Border, Skins, TextPosition } from "./sequence";

export interface Ui {
  locale?: string;
  viewPage: boolean;
  viewSettings: ViewSettings;
  defaultSettings: DefaultSettings;
}

export interface ViewSettings {
  sizePict: number;
  columnGap: number;
  rowGap: number;
}

interface DefaultSettings {
  pictSequence: DefaultSettingsPictSequence;
  pictApiAra: DefaultSettingsPictAra;
}

interface DefaultSettingsPictAra {
  skin: Skins;
  fitzgerald: string;
}
export interface DefaultSettingsPictSequence {
  numbered: boolean;
  textPosition: TextPosition;
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
