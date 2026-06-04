import { Border, Font, Hair, Skin, TextPosition } from "./sequence";
import { PageSize, PageOrientation } from "./PageFormat";

export type { PageSize, PageOrientation };

export type LangsApp = "ca" | "en" | "es" | "fr" | "it";

export type ThemeMode = "light" | "dark" | "system";

export interface Ui {
  lang: { app: LangsApp; search: string; keywords: string[] };
  theme: ThemeMode;
  viewSettings: ViewSettings;
  defaultSettings: DefaultSettings;
}

export type SequenceDirection = "row" | "column";

export interface ViewSettings {
  sizePict: number;
  pictSpaceBetween: number;
  sequenceSpaceBetween: number;
  alignment: "left" | "center" | "right";
  direction: SequenceDirection;
  pageSize: PageSize;
  orientation: PageOrientation;
  author: string;
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
  numberFont: Font;
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
