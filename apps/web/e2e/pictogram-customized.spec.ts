import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Pictograma personalitzat (`docs/fonaments/03-model-contingut-estil.md`, §6):
// la còpia fixa de la previsualització, el «Restableix» a la capçalera de
// «Estil del pictograma», la marca a la graella i «Restableix l'estil» del
// menú contextual.
//
// Requereix el servidor de desenvolupament engegat: `npm run dev` a apps/web.

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(
  HERE,
  "..",
  "test",
  "fixtures",
  "saac",
  "01-una-pestanya.saac",
);
const IMAGES = path.join(HERE, "fixtures", "images");
const LOCAL_IMAGE = fs.readFileSync(
  path.join(IMAGES, fs.readdirSync(IMAGES).find((n) => n.endsWith(".png"))!),
);

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
  await page.route(/arasaac\.org\/.*pictograms\/\d+/, (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: LOCAL_IMAGE }),
  );
});

const header = (page: Page) => page.getByTestId("setting-accordion-header");
const cards = (page: Page) => page.locator("button:has(.MuiCard-root)");
const marks = (page: Page) => page.getByTestId("customized-mark");

const openDocument = async (page: Page) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.keyboard.press("Escape");
  await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
  await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();
};

/** Obre el primer pictograma i en desplega la configuració. */
const openFirstWithSettings = async (page: Page) => {
  await cards(page).first().click();
  const dialog = page.getByRole("dialog");
  const settings = dialog.getByRole("button", {
    name: "Estil del pictograma",
  });
  await settings.click();
  await expect(settings).toHaveAttribute("aria-expanded", "true");
  return { dialog, settings };
};

/**
 * El color (blanc i negre) és un retoc de l'estil del pictograma. Amb un clic
 * del DOM: el d'un interruptor amagat, a coordenades, podia caure fora mentre
 * l'acordió encara s'obria
 */
const toggleColor = async (dialog: Locator) =>
  dialog
    .getByText("Color", { exact: true })
    .locator("xpath=..")
    .locator("input[type=checkbox]")
    .first()
    .evaluate((el: HTMLInputElement) => el.click());

/** El pictograma 1 del 01, personalitzat i desat. */
const customizeFirst = async (page: Page) => {
  const { dialog } = await openFirstWithSettings(page);
  await toggleColor(dialog);
  await expect(
    header(page).getByRole("button", { name: "Restableix" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Tancar" }).click();
  await expect(dialog).toBeHidden();
};

const scroller = (page: Page) =>
  page.getByRole("dialog").locator(".MuiDialogContent-root");

for (const [name, viewport] of [
  ["escriptori", DESKTOP],
  ["mòbil", MOBILE],
] as const) {
  test(`${name}: desplaçada fins al final, una previsualització es veu`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openDocument(page);
    await openFirstWithSettings(page);

    const content = scroller(page);
    const copy = page.getByTestId("pict-edit-preview-copy");
    // Sense desplaçar, només l'original
    await expect(copy).toHaveCount(0);

    // L'acordió s'obre amb una transició: es desplaça fins al final quan ja
    // té l'alçada sencera
    await expect
      .poll(async () => {
        await content.evaluate((el) => el.scrollTo(0, el.scrollHeight));
        return copy.count();
      })
      .toBe(1);
    const box = (await content.boundingBox())!;
    const copyCard = copy.getByTestId("card-pictogram");
    await expect(copyCard).toBeVisible();
    // Baixa des de dalt: es mesura quan ha acabat d'entrar
    await expect
      .poll(async () => (await copyCard.boundingBox())!.y)
      .toBeGreaterThanOrEqual(box.y - 1);
    const cardBox = (await copyCard.boundingBox())!;
    expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(box.y + box.height);
    expect(cardBox.height).toBeGreaterThan(80);
    // Només per a la vista: fora del lector i del teclat
    await expect(copy).toHaveAttribute("aria-hidden", "true");
    await expect(copy).toHaveAttribute("inert", "");

    // L'original torna a la vista i la còpia desapareix
    await content.evaluate((el) => el.scrollTo(0, 0));
    await expect(copy).toHaveCount(0);
    await expect(page.getByTestId("pict-edit-preview")).toBeInViewport();
  });
}

test("amb moviment reduït, la còpia apareix sense animació", async ({
  page,
}) => {
  await openDocument(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFirstWithSettings(page);
  const content = scroller(page);
  const copy = page.getByTestId("pict-edit-preview-copy");
  await expect
    .poll(async () => {
      await content.evaluate((el) => el.scrollTo(0, el.scrollHeight));
      return copy.count();
    })
    .toBe(1);
  // Sense durada: apareix d'una vegada, sense lliscar
  // (0 s, o la centèsima de mil·lisegon que el CSS global de moviment
  // reduït posa a totes les transicions)
  const duration = await copy.evaluate((el) =>
    parseFloat(getComputedStyle(el).transitionDuration),
  );
  expect(duration).toBeLessThan(0.001);
});

test("«Restableix» surt a la capçalera només quan toca, i es treu ell mateix", async ({
  page,
}) => {
  await openDocument(page);
  const { dialog, settings } = await openFirstWithSettings(page);

  const reset = () => header(page).getByRole("button", { name: "Restableix" });
  await expect(reset()).toHaveCount(0);
  // La capçalera diu sempre què s'obre, personalitzat o no
  await expect(settings).toHaveAccessibleName(/Estil del pictograma/);

  await toggleColor(dialog);
  await expect(reset()).toBeVisible();
  // Germans, mai un dins de l'altre
  expect(await settings.locator("button").count()).toBe(0);
  const box = (await reset().boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  // Tots dos a la mateixa fila: el botó, a la dreta del que desplega
  const headerBox = (await header(page).boundingBox())!;
  const settingsBox = (await settings.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(settingsBox.x + settingsBox.width - 1);
  expect(box.y).toBeGreaterThanOrEqual(headerBox.y - 1);
  expect(box.y + box.height).toBeLessThanOrEqual(
    headerBox.y + headerBox.height + 1,
  );

  // L'ordre del focus: la capçalera i després «Restableix»
  await settings.focus();
  await page.keyboard.press("Tab");
  await expect(reset()).toBeFocused();

  await reset().click();
  await expect(reset()).toHaveCount(0);
  await expect(dialog.getByText("Estil restablert")).toBeVisible();
  await expect(settings).toBeFocused();

  // Desfés torna l'estil d'abans al formulari, i el botó
  await dialog.getByRole("button", { name: "Desfés" }).click();
  await expect(reset()).toBeVisible();
});

test("el que s'edita no salta quan «Restableix» apareix o desapareix", async ({
  page,
}) => {
  await page.setViewportSize(MOBILE);
  await openDocument(page);
  const { dialog } = await openFirstWithSettings(page);
  const content = scroller(page);

  // Acordió obert del tot i desplaçat fins al control
  await expect(dialog.locator(".MuiCollapse-entered")).toHaveCount(1);
  const colorLabel = dialog.getByText("Color", { exact: true });
  await colorLabel.evaluate((el) => el.scrollIntoView({ block: "center" }));
  expect(await content.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  const before = (await colorLabel.boundingBox())!.y;

  // Amb el teclat: un clic de Playwright desplaçaria per si sol
  const colorSwitch = colorLabel
    .locator("xpath=..")
    .locator("input[type=checkbox]")
    .first();
  await colorSwitch.evaluate((el) => el.focus({ preventScroll: true }));
  await page.keyboard.press("Space");
  const reset = header(page).getByRole("button", { name: "Restableix" });
  await expect(reset).toBeVisible();
  expect(Math.abs((await colorLabel.boundingBox())!.y - before)).toBeLessThan(
    1,
  );

  // I quan desapareix (Restableix des de «Més accions», sense moure res)
  await dialog.getByRole("button", { name: "Més accions" }).click();
  await page.getByRole("button", { name: "Restableix l'estil" }).click();
  await expect(reset).toHaveCount(0);
  expect(Math.abs((await colorLabel.boundingBox())!.y - before)).toBeLessThan(
    1,
  );
});

test("la marca surt a la graella només als pictogrames personalitzats", async ({
  page,
}) => {
  await openDocument(page);
  await expect(marks(page)).toHaveCount(0);

  await customizeFirst(page);
  await expect(marks(page)).toHaveCount(1);
  // La marca és germana del botó de la targeta, no filla: l'avís de text
  // tallat, que va a la mateixa fila, és un botó i no pot anar dins d'un altre
  await expect(
    cards(page).first().locator("..").getByTestId("customized-mark"),
  ).toHaveCount(1);
  await expect(cards(page).first()).toHaveAccessibleName(
    "llevar-se, pictograma 1, personalitzat",
  );
  await expect(cards(page).nth(1)).not.toHaveAccessibleName(/personalitzat/);
  // Informativa: fora del focus, i la captura del PDF la salta
  const mark = marks(page).first();
  await expect(mark).toHaveAttribute("aria-hidden", "true");
  await expect(mark.locator("..")).toHaveAttribute(
    "data-html2canvas-ignore",
    "true",
  );
});

test("la marca no surt a la vista, la pantalla completa ni el PDF", async ({
  page,
}) => {
  await openDocument(page);
  await customizeFirst(page);
  await expect(marks(page)).toHaveCount(1);

  // La vista és el que s'imprimeix i el que captura el PDF
  await page.getByRole("tab", { name: "Vista" }).click();
  const sheet = page.locator(".preview-content");
  await expect(sheet.getByTestId("card-pictogram").first()).toBeVisible();
  await expect(marks(page)).toHaveCount(0);

  // La pantalla completa pinta el mateix full, més gran
  await page.getByRole("combobox").filter({ hasText: /A4|A3/ }).first().click();
  await page.getByRole("option", { name: /completa|sencera/i }).click();
  await page.getByRole("button", { name: "Pantalla completa" }).click();
  await expect(marks(page)).toHaveCount(0);
});

test("flux amb teclat: menú contextual → «Restableix l'estil» → Desfés", async ({
  page,
}) => {
  await openDocument(page);
  await customizeFirst(page);
  const card = cards(page).first();

  await card.focus();
  await page.keyboard.press("Shift+F10");
  const reset = page.getByRole("button", { name: "Restableix l'estil" });
  await expect(reset).toBeVisible();
  // Pel menú, amb el tabulador
  for (let i = 0; i < 12; i++) {
    if (await reset.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(reset).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.getByText("Estil restablert")).toBeVisible();
  await expect(marks(page)).toHaveCount(0);

  const undo = page.getByRole("button", { name: "Desfés" });
  await undo.focus();
  await page.keyboard.press("Enter");
  await expect(marks(page)).toHaveCount(1);

  // Sense retocs, el menú no ofereix restablir
  await page.keyboard.press("Escape");
  await cards(page).nth(1).focus();
  await page.keyboard.press("Shift+F10");
  await expect(
    page.getByRole("button", { name: "Duplica a continuació" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Restableix l'estil" }),
  ).toHaveCount(0);
});

test("axe: el formulari (configuració plegada i desplegada) i la graella", async ({
  page,
}) => {
  await openDocument(page);
  await customizeFirst(page);
  // La targeta personalitzada i la seva marca. `heading-order` queda fora: la
  // targeta ja pintava el text amb un `h3` abans d'aquest canvi (C20)
  const grid = await new AxeBuilder({ page })
    .include("button:has(.MuiCard-root)")
    .disableRules(["heading-order"])
    .analyze();
  expect(grid.violations).toEqual([]);

  await cards(page).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // El que ha canviat: la capçalera de la configuració (amb el seu
  // «Restableix») i la previsualització (i la seva còpia fixa). Els controls
  // de dins del formulari tenen errors d'abans d'aquest canvi, apuntats a C20
  const changed = () =>
    new AxeBuilder({ page })
      .include('[data-testid="setting-accordion-header"]')
      .include('[data-testid="pict-edit-preview"]');
  const collapsed = await changed().analyze();
  expect(collapsed.violations).toEqual([]);

  const settings = dialog.getByRole("button", {
    name: "Estil del pictograma",
  });
  await settings.click();
  await expect(settings).toHaveAttribute("aria-expanded", "true");
  const expanded = await changed().analyze();
  expect(expanded.violations).toEqual([]);

  const content = scroller(page);
  const copy = page.getByTestId("pict-edit-preview-copy");
  await expect
    .poll(async () => {
      await content.evaluate((el) => el.scrollTo(0, el.scrollHeight));
      return copy.count();
    })
    .toBe(1);
  const withCopy = await changed()
    .include('[data-testid="pict-edit-preview-copy"]')
    .analyze();
  expect(withCopy.violations).toEqual([]);

  // I el snackbar de Restableix, amb el seu Desfés
  await header(page).getByRole("button", { name: "Restableix" }).click();
  await expect(dialog.getByText("Estil restablert")).toBeVisible();
  const snackbar = await new AxeBuilder({ page })
    .include(".MuiSnackbar-root")
    .analyze();
  expect(snackbar.violations).toEqual([]);
});

test.describe("al mòbil tàctil", () => {
  test.use({ viewport: MOBILE, hasTouch: true, isMobile: true });

  test("tocar la barra d'un slider no el canvia; arrossegar-ne el botó, sí", async ({
    page,
  }) => {
    await openDocument(page);
    const { dialog } = await openFirstWithSettings(page);
    await expect(dialog.locator(".MuiCollapse-entered")).toHaveCount(1);
    expect(
      await page.evaluate(() => matchMedia("(pointer: coarse)").matches),
    ).toBe(true);

    const root = dialog
      .locator(".MuiSlider-root")
      .filter({ has: page.getByRole("slider", { name: "Radi" }) })
      .first();
    const slider = root.getByRole("slider");
    await root.scrollIntoViewIfNeeded();
    const before = await slider.getAttribute("aria-valuenow");

    // El dit cau a la barra, lluny del botó (com en desplaçar la pàgina)
    const box = (await root.boundingBox())!;
    const thumb = (await root.locator(".MuiSlider-thumb").boundingBox())!;
    const farX =
      thumb.x > box.x + box.width / 2 ? box.x + 10 : box.x + box.width - 10;
    await page.touchscreen.tap(farX, box.y + box.height / 2);
    await expect(slider).toHaveAttribute("aria-valuenow", before!);

    // Al mòbil, el slider no comença arran del títol
    const label = dialog.getByText("Radi", { exact: true }).first();
    const labelBox = (await label.boundingBox())!;
    expect(box.x - labelBox.x).toBeGreaterThanOrEqual(15);

    // Arrossegant el botó, sí que canvia
    const cdp = await page.context().newCDPSession(page);
    const x = thumb.x + thumb.width / 2;
    const y = thumb.y + thumb.height / 2;
    const touch = (type: string, px: number) =>
      cdp.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: type === "touchEnd" ? [] : [{ x: px, y }],
      });
    await touch("touchStart", x);
    await touch("touchMove", x + 40);
    await touch("touchMove", x + 80);
    await touch("touchEnd", x + 80);
    await expect(slider).not.toHaveAttribute("aria-valuenow", before!);
  });
});
