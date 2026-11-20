import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// El document de demostració de les notícies de pàgines (N-1), el meu estil
// (N-2), la vista al mòbil (N-3) i la pantalla sencera (N-4): la fixture
// `19-demostracio-noticies.saac`, la mateixa per a totes (D4 de
// `docs/PLA-noticies.md`). El contingut del document no es tradueix a l'app,
// però cada versió de la notícia l'ha d'ensenyar en el seu idioma: aquí se'n
// tradueixen els títols, les paraules i el rètol abans d'obrir-lo.

export const LOCALES = ["ca", "es", "en", "fr", "it"] as const;
export type Locale = (typeof LOCALES)[number];

const FIXTURE = path.join(
  process.cwd(),
  "test/fixtures/saac/19-demostracio-noticies.saac",
);

const messages = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(
      fs.readFileSync(
        path.join(
          process.cwd(),
          "../../packages/i18n/messages/app",
          `${locale}.json`,
        ),
        "utf8",
      ),
    ) as Record<string, string | { message: string }>,
  ]),
) as Record<Locale, Record<string, string | { message: string }>>;

/** El text real de l'app, en aquest idioma */
export const t = (locale: Locale, key: string): string => {
  // El català porta text i descripció; els altres idiomes, només el text
  const entry = messages[locale][key];
  if (entry === undefined) throw new Error(`Clau no trobada: ${key}`);
  return typeof entry === "string" ? entry : entry.message;
};

// Les paraules del document, del català a cada idioma
const WORDS: Record<string, Record<Locale, string>> = {
  Dissabte: { ca: "Dissabte", es: "Sábado", en: "Saturday", fr: "Samedi", it: "Sabato" },
  Matí: { ca: "Matí", es: "Mañana", en: "Morning", fr: "Matin", it: "Mattina" },
  Pati: { ca: "Pati", es: "Patio", en: "Playground", fr: "Récré", it: "Cortile" },
  Piscina: { ca: "Piscina", es: "Piscina", en: "Pool", fr: "Piscine", it: "Piscina" },
  dormir: { ca: "dormir", es: "dormir", en: "sleep", fr: "dormir", it: "dormire" },
  menjar: { ca: "menjar", es: "comer", en: "eat", fr: "manger", it: "mangiare" },
  beure: { ca: "beure", es: "beber", en: "drink", fr: "boire", it: "bere" },
  córrer: { ca: "córrer", es: "correr", en: "run", fr: "courir", it: "correre" },
  saltar: { ca: "saltar", es: "saltar", en: "jump", fr: "sauter", it: "saltare" },
  nedar: { ca: "nedar", es: "nadar", en: "swim", fr: "nager", it: "nuotare" },
};

/** Una paraula del document, en aquest idioma */
export const word = (locale: Locale, catalan: string): string =>
  WORDS[catalan]?.[locale] ?? catalan;

interface DemoPictogram {
  word: string;
}
interface DemoSequence {
  title: string;
  pictograms: DemoPictogram[];
}
interface DemoBlock {
  kind: string;
  text?: string;
}
interface DemoFile {
  meta: { title: string };
  page: { sheets: { blocks: DemoBlock[] }[] } & Record<string, unknown>;
  sequences: DemoSequence[];
}

/**
 * El document en aquest idioma. `edit` en permet retocar una còpia abans de
 * desar-la (una notícia que necessita el document en pantalla sencera, per
 * exemple).
 */
export const demoDocument = (
  locale: Locale,
  edit: (document: DemoFile) => void = () => undefined,
): string => {
  const document = JSON.parse(fs.readFileSync(FIXTURE, "utf8")) as DemoFile;
  document.meta.title = word(locale, document.meta.title);
  document.sequences.forEach((sequence) => {
    sequence.title = word(locale, sequence.title);
    sequence.pictograms.forEach((pictogram) => {
      pictogram.word = word(locale, pictogram.word);
    });
  });
  document.page.sheets.forEach((sheet) =>
    sheet.blocks.forEach((block) => {
      if (block.kind === "text" && block.text)
        block.text = word(locale, block.text);
    }),
  );
  edit(document);
  // Fora de la carpeta del test: amb accents a la ruta, el selector de
  // fitxers no rebia el fitxer
  const file = path.join(os.tmpdir(), `sequenciaac-demo-${locale}.saac`);
  fs.writeFileSync(file, JSON.stringify(document));
  return file;
};

/**
 * Obre el document de demostració a l'editor, en aquest idioma, i espera que
 * marxi l'avís de «Fitxer carregat».
 */
export const openDemo = async (
  page: Page,
  locale: Locale,
  edit?: (document: DemoFile) => void,
): Promise<void> => {
  await page.goto(`/${locale}/create-sequence`, {
    waitUntil: "domcontentloaded",
  });
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(demoDocument(locale, edit));
  await expect(page.locator(".MuiSnackbar-root")).toHaveCount(1, {
    timeout: 15000,
  });
  await expect(page.locator(".MuiSnackbar-root")).toHaveCount(0, {
    timeout: 15000,
  });
};

/** Va a la vista des de l'editor i espera el primer full. */
export const gotoView = async (page: Page): Promise<void> => {
  await page.locator('a[href$="view-sequence"]').first().click();
  await expect(page.locator("#view-page-frame-0")).toBeVisible();
};
