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

/**
 * Part de l'estil del document que no és de cada pictograma: mida, separació i
 * alineació dels pictogrames, i espai entre seqüències.
 *
 * És la base de les pestanyes: cada pestanya porta els seus `viewSettings`, i els
 * que coincideixen amb aquesta base segueixen l'estil quan es canvia (vegeu
 * `docs/fonaments/03-model-contingut-estil.md`).
 */
export interface SequenceStyleView extends SequenceViewSettings {
  sequenceSpaceBetween: number;
}

/**
 * Estil del document (el que s'aplica a totes les seves seqüències): fonts, colors, vores, numeració, aparença dels
 * pictogrames, mides i espaiats. És el que porta un fitxer `.saacstyle` i el que
 * l'usuari té com a «estil per defecte».
 */
export interface SequenceStyle extends DefaultSettings {
  view: SequenceStyleView;
}

/**
 * Disposició del document (direcció i format de pàgina). És contingut, no
 * estil, i viatjarà al `.saac` amb B26. Avui **ningú no l'escriu**: l'esquema 2
 * l'admet ja com a opcional perquè B26 no hagi d'obrir una versió 3, i qui la
 * rep la conserva tal com arriba.
 */
export interface DocumentLayout {
  direction?: "row" | "column";
  pageSize?: "A4" | "A3" | "FULLSCREEN";
  orientation?: "landscape" | "portrait";
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
   * Estil dels pictogrames del document. Opcional per als documents d'abans de
   * l'esquema 2, que no en portaven: en obrir-los s'omple amb l'estil per defecte.
   */
  defaultSettings?: DefaultSettings;
  /** Mides i espaiats de l'estil. Opcional pel mateix motiu que `defaultSettings`. */
  styleView?: SequenceStyleView;
  /** Reservat per a B26: vegeu `DocumentLayout`. */
  layout?: DocumentLayout;
}
