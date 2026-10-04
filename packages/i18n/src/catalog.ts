// Catàlegs de textos (vegeu ADR-004). El català és l'idioma font: cada entrada
// porta el text i una descripció per a qui tradueix. Els altres idiomes només
// porten el text.
import type { LangsApp } from "./locales";

export interface SourceEntry {
  message: string;
  description?: string;
}

// Catàleg de l'idioma font (ca.json)
export type SourceCatalog = Record<string, SourceEntry>;

// Catàleg d'un idioma traduït (es.json, en.json…)
export type TranslationCatalog = Record<string, string>;

// Textos llestos per a l'intèrpret d'ICU: clau → text
export type Messages = Record<string, string>;

// Treu de qualsevol catàleg només el text de cada clau
export const toMessages = (catalog: SourceCatalog | TranslationCatalog): Messages =>
  Object.fromEntries(
    Object.entries(catalog).map(([key, value]) => [
      key,
      typeof value === "string" ? value : value.message,
    ]),
  );

// Catàlegs de la interfície ja carregats, per no tornar-los a demanar
const loadedApp = new Map<LangsApp, Messages>();

// Textos de la interfície d'un idioma, si ja s'han carregat
export const getLoadedAppMessages = (lang: LangsApp): Messages | undefined =>
  loadedApp.get(lang);

interface CatalogModule {
  default: SourceCatalog | TranslationCatalog;
}

// Carrega els textos de la interfície (`app` i `errors`) només de l'idioma
// demanat: l'empaquetador en fa un fragment per idioma i espai de noms, i el
// navegador només baixa els que fa servir
export const loadAppMessages = async (lang: LangsApp): Promise<Messages> => {
  const cached = loadedApp.get(lang);
  if (cached) return cached;
  const [app, errors]: [CatalogModule, CatalogModule] = await Promise.all([
    import(`../messages/app/${lang}.json`),
    import(`../messages/errors/${lang}.json`),
  ]);
  const messages = { ...toMessages(app.default), ...toMessages(errors.default) };
  loadedApp.set(lang, messages);
  return messages;
};
