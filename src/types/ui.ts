import { PictApiAraSettings, PictSequenceSettings } from "./sequence";

export interface Ui {
  locale?: string;
  defaultSettings: {
    pictSequence?: PictSequenceSettings;
    PictApiAra: PictApiAraSettings;
  };
}
