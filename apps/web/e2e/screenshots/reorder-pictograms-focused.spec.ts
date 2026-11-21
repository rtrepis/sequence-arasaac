import { test, expect, devices, type Locator, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  COVER,
  IMG_DIR,
  STEP,
  mockArasaac,
  phoneScreen,
  phoneShot,
  serveGoogleFonts,
  shot,
} from "./newsShot";
import { LOCALES, type Locale, openDemo, t, word } from "./demoDocument";

// Captures de la notícia «reorder-pictograms» (N-5 de `docs/plans/PLA-noticies.md`):
// canviar l'ordre dels pictogrames arrossegant-los a l'edició, amb el ratolí i
// amb el dit, i el menú amb «Enganxa», que diu què hi ha copiat. Una tanda per
// idioma, sobre la primera seqüència del document de demostració (fixture 19).
//
// Executar amb el servidor de desenvolupament engegat:
//   npx playwright test e2e/screenshots/reorder-pictograms-focused.spec.ts

const NEWS_DIR = "reorder-pictograms";

test.use({ locale: "ca-ES", viewport: { width: 1280, height: 800 } });

const out = (locale: Locale, name: string): string =>
  `${NEWS_DIR}/${locale}/${name}.png`;

/** La targeta d'un pictograma, per la seva paraula */
const card = (page: Page, locale: Locale, catalan: string): Locator =>
  page.getByRole("button", {
    name: new RegExp(`^${word(locale, catalan)}, `),
  });

const centerOf = async (
  locator: Locator,
): Promise<{ x: number; y: number }> => {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Targeta no trobada");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

/** Tanca l'avís de l'estil propi del document, que no és d'aquesta notícia */
const closeNotice = async (page: Page, locale: Locale): Promise<void> => {
  await page
    .getByRole("button", {
      name: t(locale, "features.sequence.style.notice.close"),
    })
    .click();
  await page.waitForTimeout(300);
};

/** La graella de la seqüència: la fila de targetes */
const grid = (page: Page): Locator =>
  page.locator("button:has(.MuiCard-root)").first().locator("xpath=..");

for (const locale of LOCALES) {
  test(`reorder-pictograms (${locale}): captures amb el ratolí`, async ({
    page,
  }) => {
    fs.mkdirSync(path.join(IMG_DIR, NEWS_DIR, locale), { recursive: true });
    await mockArasaac(page);
    await serveGoogleFonts(page);
    await openDemo(page, locale);
    await closeNotice(page, locale);

    // 1. Arrossegant «dormir» fins al final, a mig camí
    const sleep = card(page, locale, "dormir");
    const from = await centerOf(sleep);
    const to = await centerOf(card(page, locale, "beure"));
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x - 40, to.y + 10, { steps: 15 });
    await page.waitForTimeout(500);
    const row = grid(page);
    await page.screenshot({
      path: path.join(IMG_DIR, out(locale, "arrossegant")),
      clip: await clipAround(page, row, STEP.width, 340),
    });
    await page.mouse.move(to.x, to.y, { steps: 5 });
    await page.mouse.up();
    await expect(card(page, locale, "dormir")).toHaveAccessibleName(/ 3$/);
    await page.waitForTimeout(500);
    await shot(page, row, out(locale, "nou-ordre"), {
      size: { width: STEP.width, height: 340 },
      noCursor: true,
    });
    await shot(page, card(page, locale, "dormir"), out(locale, "portada"), {
      size: COVER,
      highlight: true,
      mouseOffset: { x: 0, y: 10 },
    });

    // 3. Copia «menjar» i obre el menú d'un altre: «Enganxa» diu què hi ha
    await card(page, locale, "menjar").click({ button: "right" });
    await page
      .getByRole("button", {
        name: t(locale, "components.mouseActionList.copy"),
        exact: true,
      })
      .click();
    await expect(page.locator(".MuiPopover-root")).toHaveCount(0);
    await card(page, locale, "beure").click({ button: "right" });
    const paste = page.getByRole("button", {
      name: new RegExp(
        t(locale, "components.mouseActionList.paste").replace(/[()]/g, "\\$&"),
      ),
    });
    await expect(paste).toBeVisible();
    await page.waitForTimeout(400);
    await shot(page, page.locator(".MuiPopover-paper"), out(locale, "enganxa"), {
      size: STEP,
      mouseOffset: { x: 150, y: -60 },
    });
  });
}

const clipAround = async (
  page: Page,
  locator: Locator,
  width: number,
  height: number,
): Promise<{ x: number; y: number; width: number; height: number }> => {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error("Element no trobat");
  const w = Math.min(viewport.width, Math.max(width, box.width));
  const h = Math.min(viewport.height, Math.max(height, box.height));
  return {
    x: Math.max(0, Math.min(box.x + box.width / 2 - w / 2, viewport.width - w)),
    y: Math.max(0, Math.min(box.y + box.height / 2 - h / 2, viewport.height - h)),
    width: w,
    height: h,
  };
};

test.describe("amb el dit", () => {
  const { defaultBrowserType: _browser, ...pixel } = devices["Pixel 7"];
  test.use(pixel);

  for (const locale of LOCALES) {
    test(`reorder-pictograms (${locale}): captures amb el dit`, async ({
      page,
    }) => {
      fs.mkdirSync(path.join(IMG_DIR, NEWS_DIR, locale), { recursive: true });
      await mockArasaac(page);
      await serveGoogleFonts(page);
      await openDemo(page, locale);
      await closeNotice(page, locale);
      const cdp = await page.context().newCDPSession(page);
      const finger = (
        type: "touchStart" | "touchMove" | "touchEnd",
        x = 0,
        y = 0,
      ) =>
        cdp.send("Input.dispatchTouchEvent", {
          type,
          touchPoints: type === "touchEnd" ? [] : [{ x, y }],
        });

      // 2a. Mantenir premut i moure el dit: la targeta es mou
      const sleep = card(page, locale, "dormir");
      await sleep.scrollIntoViewIfNeeded();
      const from = await centerOf(sleep);
      const to = await centerOf(card(page, locale, "menjar"));
      await finger("touchStart", from.x, from.y);
      await page.waitForTimeout(400);
      await sleep.dispatchEvent("contextmenu");
      for (let step = 1; step <= 8; step++)
        await finger(
          "touchMove",
          from.x + ((to.x - from.x) * step) / 10,
          from.y + ((to.y - from.y) * step) / 10,
        );
      await page.waitForTimeout(400);
      const moving = await phoneScreen(page);
      for (let step = 9; step <= 10; step++)
        await finger(
          "touchMove",
          from.x + ((to.x - from.x) * step) / 10,
          from.y + ((to.y - from.y) * step) / 10,
        );
      await finger("touchEnd");
      await page.waitForTimeout(600);

      // 2b. Mantenir premut i deixar anar sense moure'l: el menú
      const drink = card(page, locale, "beure");
      const point = await centerOf(drink);
      await finger("touchStart", point.x, point.y);
      await page.waitForTimeout(400);
      await finger("touchEnd");
      await expect(
        page.getByRole("button", {
          name: t(locale, "components.mouseActionList.moveBefore"),
        }),
      ).toBeVisible();
      await page.waitForTimeout(500);
      const menu = await phoneScreen(page);
      await phoneShot(page, [moving, menu], out(locale, "amb-el-dit"));
    });
  }
});
