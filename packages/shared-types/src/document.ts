import { Border, Font, Hair, Sequence, Skin, TextPosition } from "./sequence";
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
 * Pàgina del document: format, orientació i direcció. És contingut, no estil,
 * i viatja al `.saac` a `page` (B26). Les pàgines amb els seus blocs no hi
 * són: van a `DocumentPages` (ADR-005).
 */
export interface DocumentLayout {
  /** La de les pàgines automàtiques que no en diuen cap de pròpia */
  direction?: "row" | "column";
  pageSize?: PageSize;
  orientation?: "landscape" | "portrait";
}

/**
 * Com es col·loquen els blocs d'una pàgina: `"auto"`, un darrere l'altre com
 * sempre (amb la direcció i l'espai); `"template"`, cadascun a la seva caixa.
 */
export type SheetMode = "auto" | "template";

/** Columnes de la graella d'un bloc: les que hi caben millor, o un nombre fix. */
export type PlacementColumns = "auto" | number;

/**
 * El que tenen tots els blocs que l'app entén. La caixa és en mil·límetres des
 * del cantó superior esquerre del full; en una pàgina automàtica no es fa
 * servir i no s'escriu, però es conserva per si la pàgina torna a tenir caixes.
 */
interface PlacementBase {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** L'espai de la plantilla de la pàgina que ocupa, si en té */
  slot?: number;
  /** L'estil amb nom del document (`DocumentSAAC.styles`) que fa servir */
  styleId?: string;
  /** Camps del fitxer que l'app no coneix: es tornen a escriure en desar */
  extra?: Record<string, unknown>;
}

/**
 * Un bloc de seqüència: una seqüència posada en una pàgina. Una mateixa
 * seqüència pot tenir molts blocs, en pàgines diferents o a la mateixa.
 */
export interface SequencePlacement extends PlacementBase {
  kind: "sequence";
  /** La seqüència: la clau de `content` a l'app; al fitxer, el seu `id` */
  sequenceKey: number;
  columns: PlacementColumns;
  /** Retoc de la vista només en aquest bloc, sobre la de la seqüència */
  view?: Partial<SequenceViewSettings>;
}

/** Retoc de l'aspecte d'un bloc de text, sobre la lletra de l'estil. */
export interface TextBlockStyle {
  font?: Partial<Font>;
  bold?: boolean;
  alignmentH?: SequenceAlignmentH;
  alignmentV?: SequenceAlignmentV;
}

/** Un bloc de text: un rètol sense pictograma («Primer», «Avui és…»). */
export interface TextPlacement extends PlacementBase {
  kind: "text";
  /** El text, amb `\n` entre línies. És contingut: no es tradueix */
  text: string;
  textStyle?: TextBlockStyle;
}

/**
 * Un bloc que l'app no entén (d'un tipus nou, d'una versió posterior). No es
 * pinta, però es conserva tal com era i es torna a escriure al seu lloc.
 */
export interface UnknownPlacement {
  kind: "unknown";
  id: string;
  /** El bloc tal com era al fitxer */
  raw: Record<string, unknown>;
}

/** Qualsevol bloc d'una pàgina. */
export type PagePlacement =
  | SequencePlacement
  | TextPlacement
  | UnknownPlacement;

/** Una pàgina del document, amb els seus blocs en ordre. */
export interface DocumentSheet {
  id: string;
  mode: SheetMode;
  /** Només en una pàgina automàtica; sense valor, la de `DocumentLayout` */
  direction?: "row" | "column";
  /** La plantilla que té la pàgina, si en té (R2). Es recorda també en automàtica */
  template?: string;
  placements: PagePlacement[];
  /** Camps del fitxer que l'app no coneix: es tornen a escriure en desar */
  extra?: Record<string, unknown>;
}

/**
 * Les pàgines del document, en ordre, i els blocs comuns, que surten a totes
 * les pàgines al mateix lloc.
 */
export interface DocumentPages {
  sheets: DocumentSheet[];
  common: PagePlacement[];
}

/** Lletra i vores d'un estil amb nom: només el que canvia. */
export interface PartialCardStyle {
  numbered?: boolean;
  textPosition?: TextPosition;
  font?: Partial<Font>;
  numberFont?: Partial<Font>;
  borderIn?: Partial<Border>;
  borderOut?: Partial<Border>;
}

/**
 * Un estil amb nom del document: un retoc de l'estil del document que poden
 * fer servir molts blocs alhora. És l'entrada del catàleg d'estils (R10)
 * copiada dins del document, que així continua sent autocontingut.
 */
export interface NamedStyle {
  id: string;
  name: string;
  pictApiAra?: Partial<DefaultSettings["pictApiAra"]>;
  pictSequence?: PartialCardStyle;
  view?: Partial<SequenceViewSettings>;
  /** Colors de les categories de Fitzgerald que canvia */
  fitzgeraldColors?: Record<string, string>;
  /** Camps del fitxer que l'app no coneix: es tornen a escriure en desar */
  extra?: Record<string, unknown>;
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
  /** Les pàgines i els seus blocs. Sense valor, una sola pàgina automàtica */
  pages?: DocumentPages;
  /** Els estils amb nom del document */
  styles?: NamedStyle[];
}
