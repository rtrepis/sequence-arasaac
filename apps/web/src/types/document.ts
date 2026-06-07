import { Sequence } from "./sequence";
import { DefaultSettings } from "./ui";

export type SequenceAlignmentH = "left" | "center" | "right";
export type SequenceAlignmentV = "top" | "center" | "bottom";

export interface SequenceViewSettings {
  sizePict: number;
  pictSpaceBetween: number;
  alignmentH: SequenceAlignmentH;
  alignmentV: SequenceAlignmentV;
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
