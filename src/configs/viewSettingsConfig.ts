// Constants per als valors per defecte i rangs dels ajustos de visualització

// --- Valors per defecte per seqüència (documentSlice) ---
export const SEQ_VIEW_DEFAULT_SIZE_PICT = 0.9;
export const SEQ_VIEW_DEFAULT_PICT_SPACE = 1;
export const SEQ_VIEW_DEFAULT_ALIGNMENT = "left" as const;

// --- Valors per defecte globals de visualització (uiSlice) ---
export const VIEW_DEFAULT_SIZE_PICT = 1;
export const VIEW_DEFAULT_PICT_SPACE = 1;
export const VIEW_DEFAULT_SEQ_SPACE = 1;
export const VIEW_DEFAULT_DIRECTION = "row" as const;

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
