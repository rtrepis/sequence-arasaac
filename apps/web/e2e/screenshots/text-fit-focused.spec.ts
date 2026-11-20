import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  COVER,
  IMG_DIR,
  STEP,
  mockArasaac,
  serveGoogleFonts,
  shot,
  waitNoSnackbar,
} from "./newsShot";
import { LOCALES, type Locale, openDemo, t, word } from "./demoDocument";

// Captures de la notícia «text-fit» (N-6 de `docs/PLA-noticies.md`): la marca
// de la targeta quan el text no hi cap, les maneres de fer-l'hi cabre i la
// targeta arreglada. Una tanda per idioma, sobre la primera seqüència del
// document de demostració (fixture 19).
//
// Executar amb el servidor de desenvolupament engegat:
//   npx playwright test e2e/screenshots/text-fit-focused.spec.ts

const NEWS_DIR = "text-fit";

test.use({ locale: "ca-ES", viewport: { width: 1280, height: 800 } });

const out = (locale: Locale, name: string): string =>
  `${NEWS_DIR}/${locale}/${name}.png`;

// Una paraula que no cap a la targeta, en cada idioma
const LONG_WORD: Record<Locale, string> = {
  ca: "Electroencefalograma",
  es: "Electroencefalograma",
  en: "Electroencephalogram",
  fr: "Électroencéphalogramme",
  it: "Elettroencefalogramma",
};

/** Un text de l'app amb `{number}` o `{size}` substituït */
const fill = (text: string, values: Record<string, string>): string =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, value),
    text,
  );

for (const locale of LOCALES) {
  test(`text-fit (${locale}): captures de la notícia`, async ({ page }) => {
    fs.mkdirSync(path.join(IMG_DIR, NEWS_DIR, locale), { recursive: true });
    await mockArasaac(page);
    await serveGoogleFonts(page);
    await openDemo(page, locale);
    await page
      .getByRole("button", {
        name: t(locale, "features.sequence.style.notice.close"),
      })
      .click();

    // El text de «beure», damunt de la mateixa targeta, per una paraula llarga
    const drinkCard = page.getByRole("button", {
      name: new RegExp(`^${word(locale, "beure")}, `),
    });
    await drinkCard.getByText(word(locale, "beure"), { exact: true }).click();
    const input = page.getByRole("textbox", {
      name: fill(t(locale, "components.pictEdit.cardTextInput"), {
        number: "3",
      }),
    });
    await input.fill(LONG_WORD[locale]);
    await page.keyboard.press("Enter");
    await waitNoSnackbar(page);

    // 1. La marca a la targeta, amb el rètol d'ajuda
    const mark = page.getByRole("button", {
      name: fill(t(locale, "components.pictEdit.textOverflow.mark"), {
        number: "3",
      }),
    });
    await expect(mark).toBeVisible();
    const row = page.locator("button:has(.MuiCard-root)").first().locator("xpath=..");
    await mark.hover();
    await page.waitForTimeout(800);
    // Centrada en la marca: així hi cap el rètol d'ajuda sencer
    await shot(page, mark, out(locale, "marca"), {
      size: { width: STEP.width, height: 360 },
      noCursor: true,
    });
    await shot(page, mark, out(locale, "portada"), {
      size: COVER,
      highlight: true,
      mouseOffset: { x: 4, y: 4 },
    });

    // 2. Què es pot fer: la finestra, amb les tres sortides
    await mark.click();
    const options = page.getByRole("dialog", {
      name: t(locale, "components.pictEdit.textOverflow.title"),
    });
    await expect(options).toBeVisible();
    await page.waitForTimeout(600);
    await shot(page, options, out(locale, "opcions"), {
      size: STEP,
      noCursor: true,
    });

    // 3. Amb la lletra del document reduïda, la paraula hi cap
    const fitDocument = t(
      locale,
      "components.pictEdit.textOverflow.fitDocument",
    ).split("{size}")[0];
    await options
      .getByRole("button", { name: new RegExp(`^${fitDocument}`) })
      .click();
    await expect(mark).toHaveCount(0);
    await waitNoSnackbar(page);
    await page.mouse.move(1270, 790);
    await page.waitForTimeout(500);
    await shot(page, row, out(locale, "cap"), {
      size: { width: STEP.width, height: 360 },
      noCursor: true,
    });
  });
}
