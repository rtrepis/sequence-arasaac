import axios from "axios";
import { Hair, PictApiAraSettings, Skin } from "../../../types/sequence";
import {
  DEFAULT_FITZGERALD_CATEGORY_COLORS,
  FITZGERALD_NONE_COLOR,
  FitzgeraldCategory,
  FitzgeraldCategoryColors,
  categoryFromArasaacType,
  colorForCategory,
} from "@features/sequence/saac/fitzgerald";

const araSaacURL = import.meta.env.VITE_APP_API_ARASAAC_URL;

/**
 * El pictograma en blanc: el del lloc buit d'una seqüència i el que es pinta
 * quan una imatge no arriba (`PictogramCard`).
 */
export const EMPTY_PICTOGRAM_URL = "../img/settings/white.svg";

// Cerca pictogrames per paraula. Retorna l'array de dades brutes de l'API.
export const searchPictogramByWord = async (
  word: string,
  locale: string,
  isExtends?: boolean,
): Promise<unknown[]> => {
  const search = isExtends ? "search" : "bestsearch";
  const { data } = await axios.get(
    `${araSaacURL}pictograms/${locale}/${search}/${word.toLocaleLowerCase()}`,
  );
  return data;
};

// Obté les dades d'un pictograma per ID.
export const fetchPictogramData = async (
  id: number,
  locale: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const { data } = await axios.get(
    `${araSaacURL}pictograms/${locale}/${id}`,
  );
  return data;
};

// Obté les paraules clau disponibles per a un idioma.
export const fetchKeywordsForLocale = async (
  locale: string,
): Promise<string[]> => {
  const { data } = await axios.get(`${araSaacURL}keywords/${locale}`);
  return data.words;
};

// Construeix la URL del pictograma amb paràmetres d'aparença (skin, hair, color).
//
// Els paràmetres s'ajunten tots alhora i la interrogació la posa qui els uneix.
// Encadenant-los a mà, cada condició havia d'endevinar si ja n'hi havia cap
// abans, i amb pell blanca i sense cabell no ho encertava: el blanc i negre hi
// arribava com a `&color=false`, sense cap `?` al davant, i aquella adreça no
// torna cap imatge. Passava en treure el color d'un pictograma al seu
// formulari, que és on la pell blanca és el valor de sortida.
export const buildPictogramUrl = (
  pictogramId: number,
  skin?: Skin,
  hair?: Hair,
  color?: boolean,
): string => {
  if (pictogramId === 0) return EMPTY_PICTOGRAM_URL;

  const params = new URLSearchParams();
  // La pell blanca és la del pictograma tal com ve: no cal demanar-la
  if (skin && skin !== "white")
    params.set("skin", skin === "asian" ? "assian" : skin);
  if (hair) params.set("hair", hair);
  // Només es demana el blanc i negre; en color ja ve
  if (color === false) params.set("color", "false");

  const query = params.toString();
  return `${araSaacURL}pictograms/${pictogramId}${query ? `?${query}` : ""}`;
};

// Categoria de Fitzgerald d'un pictograma d'ARASAAC: el tipus de la primera
// paraula clau. És contingut del pictograma, no estil.
export const extractPictCategory = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): FitzgeraldCategory | "none" =>
  categoryFromArasaacType(data?.keywords?.[0]?.type) ?? "none";

// Extreu les settings d'aparença de les dades brutes de l'API ARASAAC. El color
// de Fitzgerald és el de la categoria a l'estil del document; sense categoria,
// el dels que no en tenen (abans hi havia un taronja fix, `#FFCD94`).
export const extractPictSettings = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  defaults: { skin: Skin; hair: Hair; color: boolean; fitzgerald?: string },
  categoryColors: FitzgeraldCategoryColors = DEFAULT_FITZGERALD_CATEGORY_COLORS,
): PictApiAraSettings => {
  const settings: PictApiAraSettings = {};

  settings.fitzgerald = colorForCategory(
    extractPictCategory(data),
    categoryColors,
    defaults.fitzgerald ?? FITZGERALD_NONE_COLOR,
  );

  if (data.skin) settings.skin = defaults.skin;
  if (data.hair) settings.hair = defaults.hair;
  settings.color = defaults.color;

  return { ...settings };
};
