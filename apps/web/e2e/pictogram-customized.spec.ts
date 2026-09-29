import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Pictograma personalitzat (`docs/fonaments/03-model-contingut-estil.md`, §6):
// la previsualització fixa del formulari, l'estat a la capçalera de la
// configuració, la marca a la graella i «Restableix l'estil» del menú
// contextual.
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
  const settings = dialog.getByRole("button", { name: /^Configuració/ });
  await settings.click();
  await expect(settings).toHaveAttribute("aria-expanded", "true");
  return { dialog, settings };
};

/** El color (blanc i negre) és un retoc de l'estil del pictograma. */
const toggleColor = async (dialog: Locator) =>
  dialog
    .getByText("Color", { exact: true })
    .locator("xpath=..")
    .locator("input[type=checkbox]")
    .first()
    .click({ force: true });

/** El pictograma 1 del 01, personalitzat i desat. */
const customizeFirst = async (page: Page) => {
  const { dialog, settings } = await openFirstWithSettings(page);
  await toggleColor(dialog);
  await expect(settings).toHaveAccessibleName("Configuració, personalitzat");
  await dialog.getByRole("button", { name: "Tancar" }).click();
  await expect(dialog).toBeHidden();
};

for (const [name, viewport] of [
  ["escriptori", DESKTOP],
  ["mòbil", MOBILE],
] as const) {
  test(`${name}: la previsualització no marxa en desplaçar la configuració`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openDocument(page);
    await openFirstWithSettings(page);

    const content = page.getByRole("dialog").locator(".MuiDialogContent-root");
    const preview = page.getByTestId("pict-edit-preview");
    // L'acordió s'obre amb una transició: es desplaça fins al final quan
    // ja té l'alçada sencera, i es mesura quan tot s'ha aturat
    await expect
      .poll(async () => {
        await content.evaluate((el) => el.scrollTo(0, el.scrollHeight));
        const box = (await content.boundingBox())!;
        const previewBox = (await preview.boundingBox())!;
        return (
          previewBox.y >= box.y - 1 &&
          previewBox.y + previewBox.height <= box.y + box.height + 1 &&
          (await content.evaluate((el) => el.scrollTop > 0))
        );
      })
      .toBe(true);
    await expect(preview.getByTestId("card-pictogram")).toBeVisible();
    const previewBox = (await preview.boundingBox())!;
    expect(previewBox.height).toBeGreaterThan(80);
  });
}

test("la capçalera diu «Personalitzat» i ofereix Restableix només quan toca", async ({
  page,
}) => {
  await openDocument(page);
  const { dialog, settings } = await openFirstWithSettings(page);

  await expect(settings).toHaveAccessibleName("Configuració");
  await expect(dialog.getByRole("button", { name: "Restableix" })).toHaveCount(
    0,
  );

  await toggleColor(dialog);
  await expect(settings).toHaveAccessibleName("Configuració, personalitzat");
  await expect(settings).toContainText("Personalitzat");
  const reset = dialog.getByRole("button", { name: "Restableix" });
  await expect(reset).toBeVisible();
  // Germans, mai un dins de l'altre
  expect(await settings.locator("button").count()).toBe(0);
  const box = (await reset.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);

  await reset.click();
  await expect(dialog.getByText("Estil restablert")).toBeVisible();
  await expect(settings).toHaveAccessibleName("Configuració");
  await expect(settings).toBeFocused();

  // Desfés torna l'estil d'abans al formulari
  await dialog.getByRole("button", { name: "Desfés" }).click();
  await expect(settings).toHaveAccessibleName("Configuració, personalitzat");
});

test("la marca surt a la graella només als pictogrames personalitzats", async ({
  page,
}) => {
  await openDocument(page);
  await expect(marks(page)).toHaveCount(0);

  await customizeFirst(page);
  await expect(marks(page)).toHaveCount(1);
  await expect(cards(page).first().getByTestId("customized-mark")).toHaveCount(
    1,
  );
  await expect(cards(page).first()).toHaveAccessibleName(
    "llevar-se, pictograma 1, personalitzat",
  );
  await expect(cards(page).nth(1)).not.toHaveAccessibleName(/personalitzat/);
  // Informativa: fora del focus, i la captura del PDF la salta
  const mark = marks(page).first();
  await expect(mark).toHaveAttribute("aria-hidden", "true");
  await expect(mark).toHaveAttribute("data-html2canvas-ignore", "true");
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
  // El que ha canviat: la capçalera de la configuració (amb «Personalitzat»
  // i Restableix) i la previsualització fixa. Els controls de dins del
  // formulari tenen errors d'abans d'aquest canvi, apuntats a C20
  const changed = () =>
    new AxeBuilder({ page })
      .include('[data-testid="setting-accordion-header"]')
      .include('[data-testid="pict-edit-preview"]');
  const collapsed = await changed().analyze();
  expect(collapsed.violations).toEqual([]);

  const settings = dialog.getByRole("button", { name: /^Configuració/ });
  await settings.click();
  await expect(settings).toHaveAttribute("aria-expanded", "true");
  const expanded = await changed().analyze();
  expect(expanded.violations).toEqual([]);

  // I el snackbar de Restableix, amb el seu Desfés
  await dialog.getByRole("button", { name: "Restableix" }).click();
  await expect(dialog.getByText("Estil restablert")).toBeVisible();
  const snackbar = await new AxeBuilder({ page })
    .include(".MuiSnackbar-root")
    .analyze();
  expect(snackbar.violations).toEqual([]);
});
