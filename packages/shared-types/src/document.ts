import { Hair, Sequence, Skin } from "./sequence";
import { DefaultSettings, PageSize } from "./ui";

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
 * Pàgina del document: format, orientació, direcció i disposició. És contingut,
 * no estil, i viatja al `.saac` a `page` (B26). Les col·locacions del mode
 * lliure no hi són: van a `FreeLayout`.
 */
export interface DocumentLayout {
  direction?: "row" | "column";
  pageSize?: PageSize;
  orientation?: "landscape" | "portrait";
  /**
   * Disposició de les seqüències sobre la pàgina. Sense valor, `"flow"`: el
   * mode d'abans, que és el per defecte. Amb `"free"`, les seqüències van on
   * diu `FreeLayout` (vegeu `docs/decisions/ADR-005-disposicio-lliure.md`).
   */
  mode?: PageLayoutMode;
}

/** `"flow"`: les seqüències es col·loquen soles. `"free"`: on diu l'usuari. */
export type PageLayoutMode = "flow" | "free";

/** Columnes de la graella d'una caixa: les que hi caben millor, o un nombre fix. */
export type PlacementColumns = "auto" | number;

/**
 * Una seqüència posada en un lloc d'un full, amb la seva caixa. Una mateixa
 * seqüència pot tenir moltes col·locacions, en fulls diferents o al mateix.
 * Les mides són en mil·límetres des del cantó superior esquerre del full.
 */
export interface SequencePlacement {
  id: string;
  /** La seqüència: la clau de `content` a l'app; al fitxer, el seu `id` */
  sequenceKey: number;
  x: number;
  y: number;
  w: number;
  h: number;
  columns: PlacementColumns;
  /** Camps del fitxer que l'app no coneix: es tornen a escriure en desar */
  extra?: Record<string, unknown>;
}

/** Una pàgina del document en mode lliure, amb les seves col·locacions. */
export interface FreeSheet {
  id: string;
  placements: SequencePlacement[];
  /** Camps del fitxer que l'app no coneix: es tornen a escriure en desar */
  extra?: Record<string, unknown>;
}

/**
 * La disposició lliure: els fulls en ordre, i les col·locacions comunes, que
 * surten a tots els fulls al mateix lloc.
 */
export interface FreeLayout {
  sheets: FreeSheet[];
  common: SequencePlacement[];
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
