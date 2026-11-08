import { Hair, SaacExtraFields, Sequence, Skin } from "./sequence";
import type { FitzgeraldCategoryColors } from "@features/sequence/saac/fitzgerald";
import { DefaultSettings } from "./ui";
import type {
  DocumentLayout,
  DocumentPages,
  DocumentSheet,
  LicenceOn,
  NamedStyle,
  PagePlacement,
  PartialCardStyle,
  PlacementColumns,
  SequencePlacement,
  SequenceStyleView as SharedSequenceStyleView,
  SheetMode,
  TextBlockStyle,
  TextPlacement,
  UnknownPlacement,
} from "@sequence-arasaac/shared-types";

export type {
  DocumentLayout,
  DocumentPages,
  DocumentSheet,
  LicenceOn,
  NamedStyle,
  PagePlacement,
  PartialCardStyle,
  PlacementColumns,
  SequencePlacement,
  SheetMode,
  TextBlockStyle,
  TextPlacement,
  UnknownPlacement,
};

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
 * Estil del document (el d'un `.saacstyle` i l'estil per defecte de
 * l'usuari). Es declara sobre el `DefaultSettings` local, com `DocumentSAAC`.
 */
export interface SequenceStyle extends DefaultSettings {
  view: SequenceStyleView;
  /**
   * Color de cada categoria de Fitzgerald. Sense valor, els de l'app. El color
   * dels pictogrames sense categoria és `pictApiAra.fitzgerald`.
   */
  fitzgeraldColors?: FitzgeraldCategoryColors;
}

/**
 * Camps del `.saac` v3 que Redux no fa servir però que s'han de tornar a
 * escriure en desar: els desconeguts de cada objecte, la data de creació i les
 * dades de cada seqüència que no són pictogrames (el títol…). Les pàgines
 * (`page.sheets` i `page.common`) i els estils amb nom (`styles`) no hi van:
 * són `pages` i `styles`.
 */
export interface SaacDocumentExtras {
  root?: SaacExtraFields;
  meta?: SaacExtraFields;
  page?: SaacExtraFields;
  style?: SaacExtraFields;
  ui?: SaacExtraFields;
  sequences?: { [key: number]: SaacExtraFields };
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
   * Estil dels pictogrames. Sense valor, el document encara no en té de propi i
   * **hereta l'estil per defecte** de l'usuari: és el cas d'un document nou fins
   * que es desa o se n'edita l'estil (`docs/fonaments/03-model-contingut-estil.md`).
   */
  defaultSettings?: DefaultSettings;
  /** Mides i espaiats de l'estil. Sense valor, hereta com `defaultSettings`. */
  styleView?: SequenceStyleView;
  /**
   * Pàgina del document (B26). Sense valor, hereta les preferències de pàgina
   * de l'usuari, com l'estil: és el cas d'un document nou fins que se'n toca la
   * pàgina o es desa.
   */
  layout?: DocumentLayout;
  /**
   * Les pàgines del document i els seus blocs (ADR-005). Sense valor, el
   * document és una sola pàgina automàtica amb totes les seqüències en ordre:
   * el de sempre, i el de tots els documents d'abans.
   */
  pages?: DocumentPages;
  /** Els estils amb nom del document, que els blocs fan servir per `styleId` */
  styles?: NamedStyle[];
  /** Colors de cada categoria de Fitzgerald. Sense valor, els de l'app. */
  fitzgeraldColors?: FitzgeraldCategoryColors;
  /** Identificador estable de cada seqüència al `.saac` v3 */
  sequenceIds?: { [key: number]: string };
  /** El que el fitxer portava i l'app no fa servir: vegeu `SaacDocumentExtras` */
  saacExtra?: SaacDocumentExtras;
}
