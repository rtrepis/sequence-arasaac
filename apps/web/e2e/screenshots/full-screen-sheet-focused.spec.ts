import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  COVER,
  IMG_DIR,
  mockArasaac,
  serveGoogleFonts,
  shot,
  waitNoSnackbar,
} from "./newsShot";
import { LOCALES, type Locale, gotoView, openDemo, t } from "./demoDocument";

// Captures de la notícia «full-screen-sheet» (N-4 de `docs/PLA-noticies.md`):
// l'interruptor «Pantalla sencera», el full amb la forma de la pantalla i la
// pantalla completa, que ara només hi és amb la pantalla sencera. Una tanda
// per idioma, sobre el document de demostració (fixture 19).
//
// Executar amb el servidor de desenvolupament engegat:
//   npx playwright test e2e/screenshots/full-screen-sheet-focused.spec.ts

const NEWS_DIR = "full-screen-sheet";

test.use({ locale: "ca-ES", viewport: { width: 1280, height: 800 } });

const out = (locale: Locale, name: string): string =>
  `${NEWS_DIR}/${locale}/${name}.png`;

for (const locale of LOCALES) {
  test(`full-screen-sheet (${locale}): captures de la notícia`, async ({
    page,
  }) => {
    fs.mkdirSync(path.join(IMG_DIR, NEWS_DIR, locale), { recursive: true });
    // Una pantalla de 16:9, la més habitual: Chromium sense cap no fa cas de
    // l'opció `screen` de Playwright, i es canvia `window.screen` a mà
    await page.addInitScript(() => {
      Object.defineProperty(Screen.prototype, "width", { get: () => 1920 });
      Object.defineProperty(Screen.prototype, "height", { get: () => 1080 });
    });
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

    // 1. L'interruptor, sota la mida de pàgina
    const fullSheet = page.getByRole("checkbox", {
      name: t(locale, "pages.viewSequence.fullScreen.label"),
    });
    await fullSheet.check();
    await waitNoSnackbar(page);
    await page.waitForTimeout(800);
    await shot(page, fullSheet, out(locale, "interruptor"), {
      size: { width: 700, height: 420 },
      mouseOffset: { x: 6, y: 6 },
    });
    await shot(page, fullSheet, out(locale, "portada"), {
      size: COVER,
      highlight: true,
      mouseOffset: { x: 6, y: 6 },
    });

    // 2. El full pren la forma de la pantalla: la pàgina lliure, amb els blocs
    await page
      .locator("#view-page-2")
      .evaluate((element) => element.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(500);
    await shot(page, page.locator("#view-page-frame-2"), out(locale, "full"), {
      size: { width: 900, height: 560 },
      noCursor: true,
    });

    // 3. La pantalla completa, amb el botó de dalt
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    const button = page.getByRole("button", {
      name: t(locale, "pages.viewSequence.tooltip.fullscreen"),
    });
    await shot(page, button, out(locale, "boto"), {
      size: { width: 700, height: 300 },
      mouseOffset: { x: 4, y: 6 },
    });
    await button.click();
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.id ?? ""))
      .toBe("view-pages");
    // A la pàgina lliure, amb el rètol: la fletxa de la vora, des del teclat
    const next = page.getByRole("button", {
      name: t(locale, "features.freeLayout.page.nextPage"),
    });
    for (let turn = 0; turn < 2; turn++) {
      await next.press("Enter");
      await page.waitForTimeout(700);
    }
    await page.mouse.move(640, 790);
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: path.join(IMG_DIR, out(locale, "pantalla-completa")),
    });
    await page.keyboard.press("Escape");
  });
}
