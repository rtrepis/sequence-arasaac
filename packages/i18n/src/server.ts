// Traductor dels textos que escriu el back (vegeu ADR-004, decisió 8): els
// correus. Fa servir @formatjs/intl, el mateix motor ICU que react-intl, perquè
// la sintaxi dels catàlegs sigui la mateixa al front i al back.
//
// Va en una entrada a part (`@sequence-arasaac/i18n/server`) perquè el web no
// s'emporti mai els catàlegs de correu ni el motor sencer.
import { createIntl, createIntlCache } from "@formatjs/intl";
import type { IntlShape } from "@formatjs/intl";
import { DEFAULT_LANGS_APP } from "./locales";
import type { LangsApp } from "./locales";
import { toMessages } from "./catalog";
import type { SourceCatalog, TranslationCatalog } from "./catalog";
import ca from "../messages/email/ca.json";
import en from "../messages/email/en.json";
import es from "../messages/email/es.json";
import fr from "../messages/email/fr.json";
import it from "../messages/email/it.json";

// Claus dels correus, tretes del catàleg font: una clau mal escrita no compila
export type EmailMessageKey = keyof typeof ca;

// Un catàleg per idioma: si se n'afegeix un a LANGS_APP, això deixa de compilar
const EMAIL_CATALOGS: Record<LangsApp, SourceCatalog | TranslationCatalog> = {
  ca,
  en,
  es,
  fr,
  it,
};

export type EmailTranslator = (
  key: EmailMessageKey,
  values?: Record<string, string>,
) => string;

const cache = createIntlCache();
const intls = new Map<LangsApp, IntlShape<string>>();

const intlFor = (locale: LangsApp): IntlShape<string> => {
  const existing = intls.get(locale);
  if (existing) return existing;
  const intl = createIntl(
    {
      locale,
      defaultLocale: DEFAULT_LANGS_APP,
      messages: toMessages(EMAIL_CATALOGS[locale]),
    },
    cache,
  );
  intls.set(locale, intl);
  return intl;
};

// Tradueix els textos dels correus a l'idioma demanat. Els valors s'hi
// insereixen com a text, sense interpretar-los: un nom amb claus o cometes surt
// tal qual
export const createTranslator =
  (locale: LangsApp): EmailTranslator =>
  (key, values) =>
    intlFor(locale).formatMessage({ id: key }, values);
