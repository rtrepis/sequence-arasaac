// Constants per als valors per defecte i rangs dels ajustos de visualització
import { ViewSettings } from "@/types/ui";

// --- Valors per defecte per seqüència (documentSlice) ---
export const SEQ_VIEW_DEFAULT_SIZE_PICT = 0.9;
export const SEQ_VIEW_DEFAULT_PICT_SPACE = 1;
export const SEQ_VIEW_DEFAULT_ALIGNMENT_H = "left" as const;
export const SEQ_VIEW_DEFAULT_ALIGNMENT_V = "top" as const;

// --- Valors per defecte globals de visualització (uiSlice) ---
export const VIEW_DEFAULT_SIZE_PICT = 1;
export const VIEW_DEFAULT_PICT_SPACE = 1;
export const VIEW_DEFAULT_SEQ_SPACE = 1;
export const VIEW_DEFAULT_DIRECTION = "row" as const;
export const VIEW_DEFAULT_PAGE_SIZE = "A4" as const;
export const VIEW_DEFAULT_ORIENTATION = "landscape" as const;
export const VIEW_DEFAULT_ALIGNMENT_H = "left" as const;
export const VIEW_DEFAULT_ALIGNMENT_V = "top" as const;
export const VIEW_DEFAULT_AUTHOR = "";

// --- Rangs del slider: mida del pictograma (per seqüència) ---
export const SIZE_PICT_MIN = 0.4;
export const SIZE_PICT_MAX = 3.8;
export const SIZE_PICT_STEP = 0.05;

// --- Rangs del slider: espai entre pictogrames (per seqüència) ---
export const PICT_SPACE_MIN = 0;
export const PICT_SPACE_MAX = 10;
export const PICT_SPACE_STEP = 0.5;

// --- Rangs del slider: espai entre seqüències (global) ---
export const SEQ_SPACE_MIN = 0;
export const SEQ_SPACE_MAX = 10;
export const SEQ_SPACE_STEP = 0.5;

/**
 * Garanteix que tots els camps de `ViewSettings` tinguin un valor vàlid, per si
 * la font els porta incomplets: la BD amb dades d'abans que existís un camp, o
 * un esborrany escrit per una versió anterior de l'app.
 *
 * Viu aquí i no al costat d'un dels dos consumidors perquè en té dos: el desat
 * de preferències (`settingsThunks`) i la restauració de l'esborrany
 * (`useDocumentDraft`).
 */
export const sanitizeViewSettings = (vs: ViewSettings): ViewSettings => ({
  sizePict: vs.sizePict ?? VIEW_DEFAULT_SIZE_PICT,
  pictSpaceBetween: vs.pictSpaceBetween ?? VIEW_DEFAULT_PICT_SPACE,
  sequenceSpaceBetween: vs.sequenceSpaceBetween ?? VIEW_DEFAULT_SEQ_SPACE,
  direction: vs.direction ?? VIEW_DEFAULT_DIRECTION,
  alignmentH: vs.alignmentH ?? VIEW_DEFAULT_ALIGNMENT_H,
  alignmentV: vs.alignmentV ?? VIEW_DEFAULT_ALIGNMENT_V,
  pageSize: vs.pageSize ?? VIEW_DEFAULT_PAGE_SIZE,
  orientation: vs.orientation ?? VIEW_DEFAULT_ORIENTATION,
  author: vs.author ?? VIEW_DEFAULT_AUTHOR,
});
