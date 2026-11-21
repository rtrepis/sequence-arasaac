import { test, expect, devices, type Locator, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  COVER,
  IMG_DIR,
  mockArasaac,
  phoneScreen,
  phoneShot,
  serveGoogleFonts,
  waitNoSnackbar,
} from "./newsShot";
import {
  LOCALES,
  type Locale,
  gotoView,
  openDemo,
  t,
  word,
} from "./demoDocument";

// Captures de la notícia «mobile-view» (N-3 de `docs/PLA-noticies.md`): la
// vista al mòbil, amb el full sencer, el panell «Ajustos», passar de pàgina i
// la capa del mòbil girat. Són les primeres captures de mòbil: van dins del
// marc de telèfon (D3). Una tanda per idioma, sobre el document de
// demostració (fixture 19).
//
// Executar amb el servidor de desenvolupament engegat:
//   npx playwright test e2e/screenshots/mobile-view-focused.spec.ts

const NEWS_DIR = "mobile-view";

const { defaultBrowserType: _browser, ...pixel } = devices["Pixel 7"];
const { defaultBrowserType: _turned, ...pixelTurned } =
  devices["Pixel 7 landscape"];
test.use({ ...pixel, locale: "ca-ES" });

const out = (locale: Locale, name: string): string =>
  `${NEWS_DIR}/${locale}/${name}.png`;

/** El panell «Ajustos», amb la parada on és */
const panel = (page: Page, locale: Locale): Locator =>
  page.getByRole("region", {
    name: t(locale, "pages.viewSequence.mobile.settings"),
  });

/** Espera que el panell s'aturi a la parada */
const expectSnap = async (
  page: Page,
  locale: Locale,
  snap: string,
): Promise<void> => {
  await expect(panel(page, locale)).toHaveAttribute("data-snap", snap);
  await page.waitForTimeout(700);
};

for (const locale of LOCALES) {
  test(`mobile-view (${locale}): captures de la notícia`, async ({
    page,
    browser,
  }) => {
    fs.mkdirSync(path.join(IMG_DIR, NEWS_DIR, locale), { recursive: true });
    await mockArasaac(page);
    await serveGoogleFonts(page);
    await openDemo(page, locale);
    await gotoView(page);
    // El toc emulat deixa obert el rètol d'ajuda del botó d'imprimir, cosa que
    // amb el dit de debò no passa: és soroll de l'entorn de proves
    await page.addStyleTag({
      content: ".MuiTooltip-popper { visibility: hidden !important; }",
    });
    await page
      .getByRole("button", {
        name: t(locale, "features.sequence.style.notice.close"),
      })
      .click();
    await waitNoSnackbar(page);
    await expectSnap(page, locale, "collapsed");

    // 1. El full sencer, amb el panell plegat
    const whole = await phoneScreen(page);
    await phoneShot(page, [whole], out(locale, "full"));

    // 2. Tocar un bloc n'obre els ajustos: el panell a mig
    // La primera pàgina és simple: cada seqüència es toca pel seu nom
    const block = page
      .getByTestId("view-sheet-area")
      .getByRole("button", { name: new RegExp(`^${word(locale, "Matí")}, `) })
      .first();
    const box = await block.boundingBox();
    if (!box) throw new Error("Bloc no trobat");
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await expectSnap(page, locale, "half");
    const half = await phoneScreen(page);
    await phoneShot(page, [half], out(locale, "ajustos"));

    // 3. Passar de pàgina: la fletxa de la vora, i la pàgina 2
    await page
      .getByRole("button", {
        name: t(locale, "pages.viewSequence.mobile.hideSettings"),
      })
      .press("Enter");
    await expectSnap(page, locale, "collapsed");
    const viewport = page.viewportSize();
    const sheet = page
      .getByTestId("view-sheet-area")
      .locator("[id^=view-page-frame-]");
    const sheetBox = await sheet.boundingBox();
    if (!viewport || !sheetBox) throw new Error("Full no trobat");
    await page.touchscreen.tap(
      viewport.width - 8,
      sheetBox.y + sheetBox.height - 8,
    );
    const next = page.getByRole("button", {
      name: t(locale, "features.freeLayout.page.nextPage"),
    });
    await expect(next).toHaveAttribute("data-shown", "true");
    await page.waitForTimeout(400);
    const arrow = await phoneScreen(page);
    await next.tap();
    await page.waitForTimeout(900);
    const second = await phoneScreen(page);
    await phoneShot(page, [arrow, second], out(locale, "passar-pagina"));

    // Portada: el full, els ajustos i la pàgina següent
    await phoneShot(page, [whole, half, second], out(locale, "portada"), COVER);

    // 4. Amb el mòbil girat, la capa que demana posar-lo dret
    const context = await browser.newContext({
      ...pixelTurned,
      locale: "ca-ES",
    });
    const turned = await context.newPage();
    await mockArasaac(turned);
    await turned.goto(`/${locale}/view-sequence`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      turned.getByRole("status").filter({
        hasText: t(locale, "pages.viewSequence.mobile.rotatePhone").split(":")[0],
      }),
    ).toBeVisible();
    await turned.waitForTimeout(600);
    await phoneShot(page, [await phoneScreen(turned)], out(locale, "girat"));
    await context.close();
  });
}
