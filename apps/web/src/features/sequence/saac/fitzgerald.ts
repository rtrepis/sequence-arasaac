// Fitzgerald: la categoria de la paraula (contingut) i el color de cada
// categoria (estil). Vegeu `docs/fonaments/03-model-contingut-estil.md`,
// «El color de Fitzgerald».
import fitzgeraldColors from "@/data/fitzgeraldColors";
import { DEFAULT_FITZGERALD } from "@/configs/defaultSettingsConfig";
import type { PictSequence } from "@/types/sequence";

export const FITZGERALD_CATEGORIES = [
  "properNoun",
  "noun",
  "verb",
  "descriptive",
  "socialContent",
  "miscellaneous",
] as const;

export type FitzgeraldCategory = (typeof FITZGERALD_CATEGORIES)[number];

/** Color de cada categoria (sense el dels pictogrames que no en tenen). */
export type FitzgeraldCategoryColors = Record<FitzgeraldCategory, string>;

/** Taula completa del fitxer: les categories i `none`. */
export type FitzgeraldColors = FitzgeraldCategoryColors & { none: string };

const categoryEntries = Object.values(fitzgeraldColors) as {
  value: FitzgeraldCategory;
  color: string;
}[];

/** Els colors de l'app: amb aquests neix l'estil de qualsevol document. */
export const DEFAULT_FITZGERALD_CATEGORY_COLORS: FitzgeraldCategoryColors =
  categoryEntries.reduce(
    (colors, { value, color }) => ({ ...colors, [value]: color }),
    {} as FitzgeraldCategoryColors,
  );

/** El color dels pictogrames sense categoria. */
export const FITZGERALD_NONE_COLOR = DEFAULT_FITZGERALD;

export const isFitzgeraldCategory = (
  value: unknown,
): value is FitzgeraldCategory =>
  (FITZGERALD_CATEGORIES as readonly unknown[]).includes(value);

/**
 * Forma comparable d'un color: sense distingir majúscules, i amb la forma
 * curta (`#666`) desplegada (`#666666`).
 */
export const normalizeHex = (color: string): string => {
  const lower = color.trim().toLowerCase();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(lower);
  return short
    ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`
    : lower;
};

export const sameColor = (a: string, b: string): boolean =>
  normalizeHex(a) === normalizeHex(b);

/** Categoria que dona ARASAAC: el tipus de la primera paraula clau. */
export const categoryFromArasaacType = (
  type: unknown,
): FitzgeraldCategory | undefined =>
  fitzgeraldColors[type as keyof typeof fitzgeraldColors]?.value as
    | FitzgeraldCategory
    | undefined;

/**
 * Categoria deduïda del color d'un fitxer antic: només si el color és
 * exactament el d'una categoria de la taula de l'app.
 */
export const categoryFromColor = (
  color: string,
): FitzgeraldCategory | undefined =>
  FITZGERALD_CATEGORIES.find((category) =>
    sameColor(DEFAULT_FITZGERALD_CATEGORY_COLORS[category], color),
  );

/** Color que toca a un pictograma segons la seva categoria. */
export const colorForCategory = (
  category: FitzgeraldCategory | "none" | undefined,
  categoryColors: FitzgeraldCategoryColors,
  noneColor: string,
): string =>
  category === undefined || category === "none"
    ? noneColor
    : categoryColors[category];

/**
 * Categoria d'un pictograma de Redux. Si no se sap (un pictograma d'abans del
 * v3), es dedueix del color: només si és exactament el d'una categoria.
 */
export const categoryOf = (pict: PictSequence): FitzgeraldCategory | "none" => {
  if (pict.img.category !== undefined) return pict.img.category;
  const color = pict.img.settings.fitzgerald;
  return (color !== undefined && categoryFromColor(color)) || "none";
};
