import { PictApiAraSettings } from "@/types/sequence";

// Perfil d'una paraula: associa una paraula a overrides d'aparença del pictograma
// Exemple: "Oscar" → { skin: "black", hair: "darkBrown" }
export interface WordProfile {
  word: string;
  overrides: Partial<PictApiAraSettings>;
}
