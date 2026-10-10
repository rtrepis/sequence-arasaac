// L'idioma en què es veu l'app ara mateix (B23).
//
// Mana la URL: un enllaç `/fr/…` s'obre en francès, tingui l'usuari desat
// l'idioma que tingui, amb compte o sense. La preferència (`ui.lang.app`)
// només decideix on aterra qui entra per una adreça sense idioma (l'arrel, o
// les adreces antigues), i és el que es fa servir fora de les rutes `/:locale`.
import { useParams } from "react-router-dom";
import { LANGS_APP } from "@sequence-arasaac/i18n";
import { useAppSelector } from "@/app/hooks";
import { LangsApp } from "@/types/ui";

const isAppLang = (value: string | undefined): value is LangsApp =>
  LANGS_APP.includes(value as LangsApp);

export const useCurrentLocale = (): LangsApp => {
  const { locale } = useParams<{ locale: string }>();
  const preferred = useAppSelector((state) => state.ui.lang.app);
  return isAppLang(locale) ? locale : preferred;
};

/**
 * La mateixa adreça en un altre idioma: es canvia el primer segment si és un
 * idioma de l'app. Sense idioma a l'adreça, s'hi posa davant.
 */
export const pathInLocale = (pathname: string, locale: LangsApp): string => {
  const segments = pathname.split("/").filter(Boolean);
  const rest = isAppLang(segments[0]) ? segments.slice(1) : segments;
  return `/${[locale, ...rest].join("/")}`;
};
