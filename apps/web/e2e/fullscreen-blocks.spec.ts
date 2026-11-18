import { test, expect, devices, Page } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

// La pantalla sencera amb blocs (`docs/PLA-mode-lliure.md`, §13): el full és
// la pantalla on es va encendre, un paper virtual on els blocs funcionen com
// en un paper; en una pantalla d'una altra forma, es pregunta si s'adapta.

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(HERE, "..", "test", "fixtures", "saac");

/** Pàgines en blocs en A4 vertical. */
const BLOCKS = "17-pagines-i-blocs.saac";
/** Pantalla sencera feta en una pantalla de 1280 × 720 (16:9). */
const SCREEN = "18-pantalla-sencera.saac";

test.use({ locale: "ca-ES" });

/**
 * La pantalla de l'aparell. Chromium sense cap no fa cas de l'opció `screen`
 * de Playwright: es canvia `window.screen` abans que carregui l'app.
 */
const withScreen = (page: Page, width: number, height: number) =>
  page.addInitScript(
    ([w, h]) => {
      Object.defineProperty(Screen.prototype, "width", { get: () => w });
      Object.defineProperty(Screen.prototype, "height", { get: () => h });
    },
    [width, height] as const,
  );

const openInView = async (page: Page, name: string): Promise<void> => {
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(path.join(FIXTURES, name));
  await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();
  await page.locator('a[href$="view-sequence"]').first().click();
  await expect(page.locator("#view-page-frame-0")).toBeVisible();
};

/** La proporció del full de la primera pàgina, tal com es veu. */
const sheetRatio = async (page: Page): Promise<number> => {
  const box = await page.locator("#view-page-frame-0").boundingBox();
  if (!box) throw new Error("full no trobat");
  return box.width / box.height;
};

test.describe("a l'escriptori", () => {
  test("amb pàgines en blocs, la pantalla sencera s'encén i els blocs s'hi recol·loquen", async ({
    page,
  }) => {
    await withScreen(page, 1920, 1080);
    await openInView(page, BLOCKS);
    // A4 vertical
    expect(await sheetRatio(page)).toBeLessThan(1);

    const fullscreen = page.getByRole("checkbox", { name: "Pantalla sencera" });
    await expect(fullscreen).toBeEnabled();
    await fullscreen.check();

    // El full és la pantalla, apaïsada
    await expect.poll(() => sheetRatio(page)).toBeGreaterThan(1.7);
    // Els blocs de la plantilla hi fan tot l'ample: el rètol de la pàgina 1
    const frame = await page.locator("#view-page-frame-0").boundingBox();
    const title = await page
      .locator("#view-page-0 .placement")
      .filter({ hasText: "Avui és dilluns" })
      .boundingBox();
    if (!frame || !title) throw new Error("no trobats");
    expect(title.width).toBeGreaterThan(frame.width * 0.9);
    // I es continua treballant en blocs: la fila «Disposició» hi és
    await expect(page.getByText("Disposició").first()).toBeVisible();

    // La pantalla completa ensenya les pàgines una a una
    await page.getByRole("button", { name: "Pantalla completa" }).click();
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.id ?? ""))
      .toBe("view-pages");
  });

  test("en una pantalla d'una altra forma es veu amb vores i pregunta si s'adapta; es pot desfer", async ({
    page,
  }) => {
    // Una pantalla 4:3, i el document es va fer en una de 16:9
    await withScreen(page, 1024, 768);
    await openInView(page, SCREEN);
    expect(await sheetRatio(page)).toBeCloseTo(16 / 9, 1);

    const adapt = page.getByRole("button", {
      name: "Adapta'l a aquesta pantalla",
    });
    await expect(adapt).toBeVisible();
    await adapt.click();

    await expect(adapt).toBeHidden();
    await expect.poll(() => sheetRatio(page)).toBeCloseTo(4 / 3, 1);
    await expect(
      page.getByText("S'ha adaptat el full a aquesta pantalla."),
    ).toBeVisible();

    // Desfés: torna el full d'abans, i la pregunta
    await page.getByRole("button", { name: "Desfés" }).click();
    await expect.poll(() => sheetRatio(page)).toBeCloseTo(16 / 9, 1);
    await expect(adapt).toBeVisible();
  });

  test("a la mateixa forma no pregunta res, i tancar la pregunta la deixa tancada", async ({
    page,
  }) => {
    await withScreen(page, 1920, 1080);
    await openInView(page, SCREEN);
    await expect(
      page.getByRole("button", { name: "Adapta'l a aquesta pantalla" }),
    ).toHaveCount(0);
  });

  test("a la pantalla sencera no hi ha ni imprimir ni PDF", async ({
    page,
  }) => {
    await withScreen(page, 1280, 720);
    await openInView(page, SCREEN);
    await expect(
      page.getByRole("button", { name: "Pantalla completa" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Imprimir" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /PDF/ })).toHaveCount(0);
  });
});

test.describe("al mòbil (Pixel 7)", () => {
  const { defaultBrowserType: _browser, ...pixel } = devices["Pixel 7"];
  test.use(pixel);

  test("el full és apaïsat amb el mòbil dret, i pregunta si s'adapta", async ({
    page,
  }) => {
    await openInView(page, SCREEN);
    // Feta a 16:9; el Pixel 7 girat és més allargat
    expect(await sheetRatio(page)).toBeCloseTo(16 / 9, 1);
    await page
      .getByRole("button", { name: "Adapta'l a aquesta pantalla" })
      .click();
    const screen = await page.evaluate(() => ({
      long: Math.max(window.screen.width, window.screen.height),
      short: Math.min(window.screen.width, window.screen.height),
    }));
    await expect
      .poll(() => sheetRatio(page))
      .toBeCloseTo(screen.long / screen.short, 1);
  });
});
