// Normalització de l'idioma d'aplicació (LangsApp) quan arriba com a string
// no validat (p. ex. el locale que envia el front al signup, abans que
// existeixi cap compte amb langSettings desat).

import type { LangsApp } from "@sequence-arasaac/shared-types";

const LANGS_APP_VALUES: readonly LangsApp[] = ["ca", "en", "es", "fr", "it"];

// Mateix idioma per defecte que la resta de l'app (vegeu langSettingsSchema).
export const DEFAULT_LANGS_APP: LangsApp = "ca";

// Qualsevol valor desconegut, buit o absent cau al català — mai llança.
export const toLangsApp = (value: string | undefined): LangsApp =>
  LANGS_APP_VALUES.includes(value as LangsApp) ? (value as LangsApp) : DEFAULT_LANGS_APP;
