import { Hair, Sequence, Skin } from "./sequence";
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

/**
 * Pictograma d'una miniatura de document. Es deriva del contingut en desar i
 * només porta el que cal per pintar la imatge: així el llistat de documents no
 * ha d'arrossegar el contingut sencer només per ensenyar de què va cada document.
 */
export interface DocumentThumbnailPict {
  selectedId: number;
  /** Imatge personalitzada ja pujada (Cloudinary). Mai una data:image en base64. */
  url?: string;
  skin?: Skin;
  hair?: Hair;
  color?: boolean;
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
