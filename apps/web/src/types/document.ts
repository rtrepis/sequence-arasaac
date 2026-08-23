import { Hair, Sequence, Skin } from "./sequence";
import { DefaultSettings } from "./ui";

export type SequenceAlignmentH = "left" | "center" | "right";
export type SequenceAlignmentV = "top" | "center" | "bottom";

export interface SequenceViewSettings {
  sizePict: number;
  pictSpaceBetween: number;
  alignmentH: SequenceAlignmentH;
  alignmentV: SequenceAlignmentV;
}

/**
 * Pictograma d'una miniatura de document. El backend la deriva del contingut en
 * desar-lo; el client només l'ha de saber pintar, com pinta el pictograma a
 * l'editor, sense arrossegar el contingut sencer per fer-ho.
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
