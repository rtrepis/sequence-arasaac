import { test, expect, type Locator, type Page } from "@playwright/test";
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
import {
  LOCALES,
  type Locale,
  gotoView,
  openDemo,
  t,
  word,
} from "./demoDocument";

// Captures de la notícia «my-style» (N-2 de `docs/plans/PLA-noticies.md`): el meu
// estil a la configuració, portar-lo a una pàgina o a un bloc, i posar-lo al
// dia quan canvia. Una tanda per idioma, sobre el document de demostració
// (fixture 19), que té un estil diferent del de fàbrica: numerat i amb el text
// a sota.
//
// Executar amb el servidor de desenvolupament engegat:
//   npx playwright test e2e/screenshots/my-style-focused.spec.ts

const NEWS_DIR = "my-style";

test.use({ locale: "ca-ES", viewport: { width: 1280, height: 900 } });

const out = (locale: Locale, name: string): string =>
  `${NEWS_DIR}/${locale}/${name}.png`;

/** El desplaçament del cursor des del centre de `from` fins a la dreta del text de `to`. */
const offsetTo = async (
  from: Locator,
  to: Locator,
  dx = 0,
): Promise<{ x: number; y: number }> => {
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  if (!a || !b) throw new Error("Element no trobat per al cursor");
  return {
    x: b.x + Math.min(b.width / 2, 60) + dx - (a.x + a.width / 2),
    y: b.y + b.height / 2 - (a.y + a.height / 2),
  };
};

/** Obre «El meu estil» a la configuració, des de la roda dentada de la barra */
const openMyStyle = async (page: Page, locale: Locale): Promise<void> => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page
    .locator("header")
    .getByRole("button", {
      name: t(locale, "components.defaultSettings.settings.title"),
      exact: true,
    })
    .click();
  await page
    .getByRole("tab", {
      name: t(locale, "components.defaultSettings.tab.pictograms"),
    })
    .click();
  await page.waitForTimeout(700);
};

/** Treu la selecció clicant un racó buit del full: el full net, com s'imprimirà */
const deselect = async (sheet: Locator): Promise<void> => {
  const box = await sheet.boundingBox();
  if (!box) throw new Error("Full no trobat");
  await sheet.click({ position: { x: 40, y: box.height - 60 } });
  await sheet.page().waitForTimeout(500);
};

const menuItem = (page: Page, locale: Locale, key: string): Locator =>
  page
    .locator(".MuiMenu-paper")
    .getByText(t(locale, key), { exact: true });

for (const locale of LOCALES) {
  test(`my-style (${locale}): captures de la notícia`, async ({ page }) => {
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

    // 1. El meu estil, a la configuració
    await openMyStyle(page, locale);
    const dialog = page.getByRole("dialog");
    await page.screenshot({
      path: path.join(IMG_DIR, out(locale, "configuracio")),
      clip: { x: 0, y: 0, width: 1280, height: 600 },
    });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // 2. «Aplica el meu estil» al menú de la pàgina
    const thirdPage = page.locator("#view-page-2");
    await thirdPage.evaluate((element) =>
      element.scrollIntoView({ block: "start" }),
    );
    await page.waitForTimeout(300);
    const pageMenuButton = thirdPage.getByRole("button", {
      name: t(locale, "features.freeLayout.page.moreActions"),
    });
    await pageMenuButton.click();
    const menu = page.locator(".MuiMenu-paper");
    await expect(menu).toBeVisible();
    await page.waitForTimeout(400);
    await shot(page, menu, out(locale, "menu-pagina"), {
      size: STEP,
      mouseOffset: await offsetTo(
        menu,
        menuItem(page, locale, "features.freeLayout.applyMyStyle"),
        90,
      ),
    });
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();

    // 3. Només un bloc amb el meu estil: sense numeració i amb el text a dalt
    const morning = thirdPage.locator(".placement").nth(1);
    const blockMenu = thirdPage.getByRole("button", {
      name: t(locale, "features.freeLayout.placement.actions").replace(
        "{name}",
        word(locale, "Matí"),
      ),
    });
    await morning.click();
    await blockMenu.click();
    await menuItem(page, locale, "features.freeLayout.applyMyStyle").click();
    await expect(menu).toBeHidden();
    await waitNoSnackbar(page);
    const thirdSheet = page.locator("#view-page-frame-2");
    await deselect(thirdSheet);
    await shot(page, thirdSheet, out(locale, "bloc-diferent"), {
      size: { width: 900, height: 640 },
      noCursor: true,
    });
    await shot(page, morning, out(locale, "portada"), {
      size: COVER,
      highlight: true,
      mouseOffset: { x: 150, y: 60 },
    });

    // 4. Canvia el meu estil (el marc exterior, del color de la categoria) i
    //    el bloc es posa al dia amb «Actualitza amb el meu estil». El blanc i
    //    negre no serviria: les imatges de prova no en tenen
    await openMyStyle(page, locale);
    await dialog
      .getByText(t(locale, "components.settingCardBorder.fitzgeraldKey.label"), {
        exact: true,
      })
      .first()
      .click();
    await page.waitForTimeout(400);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await thirdPage.evaluate((element) =>
      element.scrollIntoView({ block: "start" }),
    );
    await morning.click();
    await blockMenu.click();
    await expect(menu).toBeVisible();
    await page.waitForTimeout(400);
    await shot(page, menu, out(locale, "menu-actualitza"), {
      size: STEP,
      mouseOffset: await offsetTo(
        menu,
        menuItem(page, locale, "features.freeLayout.updateMyStyle"),
        200,
      ),
    });
    await menuItem(page, locale, "features.freeLayout.updateMyStyle").click();
    await expect(menu).toBeHidden();
    await waitNoSnackbar(page);
    await deselect(thirdSheet);
    await shot(page, thirdSheet, out(locale, "actualitzat"), {
      size: { width: 900, height: 640 },
      noCursor: true,
    });
  });
}
