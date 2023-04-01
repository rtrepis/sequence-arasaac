import { PictSequenceSettings, Skins } from "./sequence";

export interface Ui {
  locale?: string;
  defaultSettings: DefaultSettings;
}

interface DefaultSettings {
  pictSequence: PictSequenceSettings;
  pictApiAra: DefaultSettingsPictAra;
}

interface DefaultSettingsPictAra {
  skin: Skins;
  fitzgerald: string;
}

type MyPartialForEdit<Type> = {
  [Property in keyof Type]?: Type[Property];
};

export type DefaultSettingsForEdit = MyPartialForEdit<DefaultSettings>;

export type DefaultSettingsPictApiAraForEdit =
  MyPartialForEdit<DefaultSettingsPictAra>;

export type DefaultSettingsPictSequenceForEdit =
  MyPartialForEdit<PictSequenceSettings>;
