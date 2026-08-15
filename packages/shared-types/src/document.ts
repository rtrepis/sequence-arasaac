import { Sequence } from "./sequence";
import { DefaultSettings } from "./ui";

export type SequenceAlignmentH = "left" | "center" | "right";
export type SequenceAlignmentV = "top" | "center" | "bottom";

/**
 * Alineació d'abans de separar horitzontal i vertical. Només es conserva per poder
 * llegir documents desats amb el format antic; res de nou l'ha d'escriure.
 */
export type SequenceAlignmentLegacy = SequenceAlignmentH;

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
