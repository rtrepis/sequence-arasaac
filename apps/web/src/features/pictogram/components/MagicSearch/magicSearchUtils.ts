import { createFilterOptions } from "@mui/material/Autocomplete";
import { Ai } from "@/types/sequence";

// Nombre mínim de lletres de la paraula actual per activar els suggeriments
export const MIN_WORD_LENGTH = 3;

// Màxim de paraules acceptades en una sola cerca
const MAX_WORDS = 60;

const baseFilterOptions = createFilterOptions<string>({
  matchFrom: "start",
  limit: 100,
});

// Extreu la paraula que s'està escrivint ara (la de després de l'última coma)
export const currentWord = (phrase: string): string =>
  phrase.split(",").at(-1)?.trim() ?? "";

// Filtra les keywords per la paraula actual, ignorant el prefix de la frase.
// getOptionLabel és opcional perquè l'Autocomplete el proporciona automàticament,
// però cal indicar-lo quan es crida aquesta funció manualment fora de l'Autocomplete
export const filterByCurrentWord = (
  options: string[],
  state: { inputValue: string; getOptionLabel?: (option: string) => string },
): string[] => {
  const word = currentWord(state.inputValue);
  if (word.length < MIN_WORD_LENGTH) return [];
  return baseFilterOptions(options, {
    ...state,
    inputValue: word,
    getOptionLabel: state.getOptionLabel ?? ((option: string) => option),
  });
};

// Converteix la frase separada per comes en una llista de paraules netes
export const stringToWords = (phrase: string): string[] =>
  phrase
    .split(",", MAX_WORDS)
    .map((word) => word.trim())
    .filter((word) => word !== "");

// Resultat d'interpretar la frase de cerca
export interface ParsedSearchPhrase {
  words: (Ai | string)[];
  isAi: boolean;
}

// Interpreta la frase: si és un JSON amb la clau "ia" prové de l'assistent,
// altrament és entrada manual separada per comes
export const parseSearchPhrase = (phrase: string): ParsedSearchPhrase => {
  try {
    const parsed: unknown = JSON.parse(phrase);
    if (parsed !== null && typeof parsed === "object" && "ia" in parsed) {
      return { words: (parsed as { ia: Ai[] }).ia, isAi: true };
    }
  } catch {
    // No és JSON: seguim amb l'entrada manual
  }
  return { words: stringToWords(phrase), isAi: false };
};
