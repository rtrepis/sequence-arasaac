import { PictApiAraSettings } from "@/types/sequence";

// Perfil d'una paraula: associa una paraula a overrides d'aparença del pictograma
// Exemple: "Oscar" → { skin: "black", hair: "darkBrown" }
export interface WordProfile {
  word: string;
  overrides: Partial<PictApiAraSettings>;
  selectedId?: number;
  customImageUrl?: string;
}

// Pictograma mostrat mentre la paraula encara no en té cap de triat
export const DEFAULT_WORD_PICT_ID = 6009;

// Nombre màxim de paraules del vocabulari personal al pla gratuït
export const FREE_TIER_MAX_WORDS = 3;
