import { Hair, Sequence, Skin } from "./sequence";
import { DefaultSettings } from "./ui";
import type {
  DocumentLayout,
  SequenceStyleView as SharedSequenceStyleView,
} from "@sequence-arasaac/shared-types";

export type { DocumentLayout };

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

/** Mides i espaiats de l'estil: vegeu el tipus compartit. */
export type SequenceStyleView = SharedSequenceStyleView;

/**
 * Estil d'una seqüència (el d'un `.saacstyle` i l'estil per defecte de
 * l'usuari). Es declara sobre el `DefaultSettings` local, com `DocumentSAAC`.
 */
export interface SequenceStyle extends DefaultSettings {
  view: SequenceStyleView;
}

export interface DocumentSAAC {
  id: string;
  title?: string;
  content: { [key: number]: Sequence };
  viewSettings: { [key: number]: SequenceViewSettings };
  activeSAAC: number;
  order?: number[];
  author?: string;
  /**
   * Estil dels pictogrames. Sense valor, la seqüència encara no en té de propi i
   * **hereta l'estil per defecte** de l'usuari: és el cas d'un document nou fins
   * que es desa o se n'edita l'estil (`docs/fonaments/sequencia-i-estil.md`).
   */
  defaultSettings?: DefaultSettings;
  /** Mides i espaiats de l'estil. Sense valor, hereta com `defaultSettings`. */
  styleView?: SequenceStyleView;
  /** Disposició, reservada per a B26: ningú no l'escriu encara, però es conserva. */
  layout?: DocumentLayout;
}
