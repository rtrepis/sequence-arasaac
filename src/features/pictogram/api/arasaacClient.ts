import axios from "axios";
import fitzgeraldColors from "../../../data/fitzgeraldColors";
import { Hair, PictApiAraSettings, Skin } from "../../../types/sequence";

const araSaacURL = import.meta.env.VITE_APP_API_ARASAAC_URL;

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
export const buildPictogramUrl = (
  pictogramId: number,
  skin?: Skin,
  hair?: Hair,
  color?: boolean,
): string => {
  if (pictogramId === 0) return "../img/settings/white.svg";
  let path = `${araSaacURL}pictograms/${pictogramId}`;

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  skin &&
    skin !== "white" &&
    (path += `?skin=${skin === "asian" ? "assian" : skin}`);

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  hair &&
    (skin === undefined || skin === "white"
      ? (path += `?hair=${hair}`)
      : (path += `&hair=${hair}`));

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  color === false &&
    (skin === undefined && hair === undefined
      ? (path += `?color=${color}`)
      : (path += `&color=${color}`));

  return path;
};

// Extreu les settings d'aparença de les dades brutes de l'API ARASAAC.
export const extractPictSettings = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  defaults: { skin: Skin; hair: Hair; color: boolean },
): PictApiAraSettings => {
  const settings: PictApiAraSettings = {};

  settings.fitzgerald = fitzgeraldColors[
    data.keywords[0].type as keyof typeof fitzgeraldColors
  ] as unknown as string;

  if (data.skin) settings.skin = defaults.skin;
  if (data.hair) settings.hair = defaults.hair;
  settings.color = defaults.color;

  return { ...settings };
};
