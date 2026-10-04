// <IntlProvider> amb els textos de la interfície de @sequence-arasaac/i18n.
// Només baixa el catàleg de l'idioma actiu (vegeu ADR-004): mentre arriba el
// primer no pinta res, i en canviar d'idioma manté l'anterior fins que el nou
// és a punt, perquè la pàgina no quedi mai en blanc a mitja feina.
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import {
  getLoadedAppMessages,
  isLangsApp,
  loadAppMessages,
} from "@sequence-arasaac/i18n";
import type { LangsApp, Messages } from "@sequence-arasaac/i18n";

interface AppIntlProviderProps {
  locale: string;
  defaultLocale: string;
  children: ReactNode;
}

interface LoadedCatalog {
  lang: LangsApp;
  messages: Messages;
}

const AppIntlProvider = ({
  locale,
  defaultLocale,
  children,
}: AppIntlProviderProps): ReactElement | null => {
  const lang = isLangsApp(locale) ? locale : null;

  const [loaded, setLoaded] = useState<LoadedCatalog | null>(() => {
    const messages = lang ? getLoadedAppMessages(lang) : undefined;
    return lang && messages ? { lang, messages } : null;
  });

  useEffect(() => {
    if (!lang || loaded?.lang === lang) return;
    let cancelled = false;
    loadAppMessages(lang)
      .then((messages) => {
        if (!cancelled) setLoaded({ lang, messages });
      })
      .catch(() => {
        // Sense el catàleg, react-intl ensenya el defaultMessage dels .lang.ts:
        // millor una pàgina en un altre idioma que una pàgina en blanc
        if (!cancelled) setLoaded({ lang, messages: {} });
      });
    return () => {
      cancelled = true;
    };
  }, [lang, loaded?.lang]);

  // Un locale que no és de l'aplicació no té catàleg: com abans, react-intl
  // cau al defaultMessage de cada text
  if (!lang) {
    return (
      <IntlProvider locale={locale} defaultLocale={defaultLocale}>
        {children}
      </IntlProvider>
    );
  }

  if (!loaded) return null;

  return (
    <IntlProvider
      locale={loaded.lang}
      defaultLocale={defaultLocale}
      messages={loaded.messages}
    >
      {children}
    </IntlProvider>
  );
};

export default AppIntlProvider;
