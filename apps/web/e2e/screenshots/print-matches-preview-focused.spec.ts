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
import { LOCALES, type Locale, gotoView, openDemo, t } from "./demoDocument";

// Captures de la notícia «print-matches-preview» (N-7 de
// `docs/PLA-noticies.md`): el full de la vista és el que s'imprimeix, el
// paper Carta i Tabloide, i la llicència del peu, que no es pot treure si el
// document té autor. Una tanda per idioma, sobre el document de demostració
// (fixture 19).
//
// Executar amb el servidor de desenvolupament engegat:
//   npx playwright test e2e/screenshots/print-matches-preview-focused.spec.ts

const NEWS_DIR = "print-matches-preview";

// El paper per defecte surt de la regió del navegador: un de Catalunya, A4
test.use({ locale: "ca-ES", viewport: { width: 1280, height: 860 } });

const out = (locale: Locale, name: string): string =>
  `${NEWS_DIR}/${locale}/${name}.png`;

// Qui ha fet el document: una aula, cap persona
const AUTHOR: Record<Locale, string> = {
  ca: "Aula 3",
  es: "Aula 3",
  en: "Class 3",
  fr: "Classe 3",
  it: "Aula 3",
};

for (const locale of LOCALES) {
  test(`print-matches-preview (${locale}): captures de la notícia`, async ({
    page,
  }) => {
    fs.mkdirSync(path.join(IMG_DIR, NEWS_DIR, locale), { recursive: true });
    await mockArasaac(page);
    await serveGoogleFonts(page);
    await openDemo(page, locale);
    await gotoView(page);
    await page
      .getByRole("button", {
        name: t(locale, "features.sequence.style.notice.close"),
      })
      .click();
    await waitNoSnackbar(page);
    await page.waitForTimeout(400);

    // 1. El full, amb el botó d'imprimir: el que es veu és el que surt
    const print = page.getByRole("button", {
      name: t(locale, "pages.viewSequence.tooltip.print"),
    });
    const sheet = page.locator("#view-page-frame-0");
    const sheetBox = await sheet.boundingBox();
    const printBox = await print.boundingBox();
    if (!sheetBox || !printBox) throw new Error("Full no trobat");
    await page.mouse.move(printBox.x + printBox.width / 2, printBox.y + 4);
    await page.waitForTimeout(800);
    await shot(page, sheet, out(locale, "full"), {
      size: { width: 1280, height: 700 },
      mouseOffset: {
        x: printBox.x + printBox.width / 2 - (sheetBox.x + sheetBox.width / 2),
        y: printBox.y + printBox.height / 2 - (sheetBox.y + sheetBox.height / 2),
      },
    });
    await shot(page, print, out(locale, "portada"), {
      size: COVER,
      highlight: true,
      mouseOffset: { x: 4, y: 6 },
    });

    // 2. La mida de pàgina, amb Carta i Tabloide
    await page
      .getByRole("combobox", {
        name: t(locale, "pages.viewSequence.pageSize.label"),
      })
      .click();
    const options = page.getByRole("listbox");
    await expect(
      options.getByText(t(locale, "pages.viewSequence.pageSize.tabloid")),
    ).toBeVisible();
    await page.waitForTimeout(500);
    await shot(page, options, out(locale, "paper"), {
      size: { width: STEP.width, height: 420 },
      mouseOffset: { x: 92, y: 4 },
    });
    await page.keyboard.press("Escape");
    await expect(options).toBeHidden();

    // 3. Amb autor, la llicència hi va sempre, i l'ajuda diu per què
    const author = page.getByRole("textbox", {
      name: t(locale, "pages.viewSequence.authSequence.label"),
    });
    await author.fill(AUTHOR[locale]);
    await author.blur();
    const forced = page.getByText(
      t(locale, "pages.viewSequence.licence.forcedHelperText"),
    );
    await expect(forced).toBeVisible();
    await page.waitForTimeout(500);
    await shot(page, forced, out(locale, "llicencia"), {
      size: { width: STEP.width, height: 420 },
      noCursor: true,
    });
  });
}
