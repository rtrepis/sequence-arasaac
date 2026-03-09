import { Sequence } from "./sequence";
import { DefaultSettings } from "./ui";

export type SequenceAlignment = "left" | "center" | "right";

export interface SequenceViewSettings {
  sizePict: number;
  pictSpaceBetween: number;
  alignment: SequenceAlignment;
}

export interface DocumentSAAC {
  id: string;
  title?: string;
  content: { [key: number]: Sequence };
  viewSettings: { [key: number]: SequenceViewSettings };
  activeSAAC: number;
  order?: number[];
  author?: string;
  defaultSettings?: DefaultSettings;
}
