// Idiomes de l'aplicació: l'única llista del projecte (vegeu ADR-004).
// Afegir-ne un és afegir-lo aquí i posar-ne els fitxers de textos.

export const LANGS_APP = ["ca", "en", "es", "fr", "it"] as const;

export type LangsApp = (typeof LANGS_APP)[number];

// Idioma per defecte i idioma font de les traduccions
export const DEFAULT_LANGS_APP: LangsApp = "ca";

// Indica si un valor qualsevol és un idioma de l'aplicació
export const isLangsApp = (value: string | undefined): value is LangsApp =>
  (LANGS_APP as readonly string[]).includes(value ?? "");

// Normalitza un idioma que arriba com a string no validat (p. ex. el locale
// que envia el front al signup). Qualsevol valor desconegut, buit o absent cau
// a l'idioma per defecte — mai llança.
export const toLangsApp = (value: string | undefined): LangsApp =>
  isLangsApp(value) ? value : DEFAULT_LANGS_APP;
