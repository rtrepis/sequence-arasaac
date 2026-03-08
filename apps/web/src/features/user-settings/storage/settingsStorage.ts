// Servei centralitzat de persistència per a la configuració de l'usuari.
// Tota la lògica de sessionStorage/localStorage per a settings és aquí.
import { DefaultSettings, LangsApp } from "../../../types/ui";

const STORAGE_KEYS = {
  defaultSettings: "pictDefaultSettings",
  langSettings: "langSettings",
} as const;

// Configuració de llengua que es persisteix (sense keywords, que venen de l'API)
export interface LangStorageSettings {
  app: LangsApp;
  search: string;
}

// Llegeix de sessionStorage primer, localStorage com a fallback (el patró existent)
const readFromStorage = (key: string): string | null =>
  sessionStorage.getItem(key) ?? localStorage.getItem(key);

// Desa a sessionStorage i localStorage simultàniament
const writeToStorage = (key: string, value: string): void => {
  sessionStorage.setItem(key, value);
  localStorage.setItem(key, value);
};

export const getStoredSettings = (): DefaultSettings | null => {
  const raw = readFromStorage(STORAGE_KEYS.defaultSettings);
  if (raw === null) return null;
  return JSON.parse(raw) as DefaultSettings;
};

export const saveSettings = (settings: DefaultSettings): void => {
  writeToStorage(STORAGE_KEYS.defaultSettings, JSON.stringify(settings));
};

export const getStoredLangSettings = (): LangStorageSettings | null => {
  const raw = readFromStorage(STORAGE_KEYS.langSettings);
  if (raw === null) return null;
  return JSON.parse(raw) as LangStorageSettings;
};

export const saveLangSettings = (lang: LangStorageSettings): void => {
  writeToStorage(STORAGE_KEYS.langSettings, JSON.stringify(lang));
};
