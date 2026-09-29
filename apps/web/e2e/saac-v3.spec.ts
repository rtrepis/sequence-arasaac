import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Model de document `.saac` v3 (`docs/decisions/ADR-003-model-document-saac-v3.md`):
// la descàrrega, els avisos en obrir, els diàlegs nous amb axe, i un flux
// complet només amb el teclat: obrir un fitxer antic → canviar un pictograma →
// Restableix → Desa.
//
// Requereix el servidor de desenvolupament engegat: `npm run dev` a apps/web.
// Executar amb: `npx playwright test e2e/saac-v3.spec.ts`

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(HERE, "..", "test", "fixtures", "saac");
const IMAGES = path.join(HERE, "fixtures", "images");

const LOCAL_IMAGE = fs.readFileSync(
  path.join(
    IMAGES,
    fs.readdirSync(IMAGES).find((name) => name.endsWith(".png"))!,
  ),
);

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
  await page.route(/arasaac\.org\/.*pictograms\/\d+/, (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: LOCAL_IMAGE }),
  );
  await page.route("https://res.cloudinary.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: LOCAL_IMAGE }),
  );
});

const openFixture = async (page: Page, name: string): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.keyboard.press("Escape");
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(path.join(FIXTURES, name));
};

/** Prem Tab (o Maj+Tab) fins que `target` té el focus. */
const tabTo = async (
  page: Page,
  target: Locator,
  { backwards = false, max = 80 } = {},
): Promise<void> => {
  for (let i = 0; i < max; i++) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press(backwards ? "Shift+Tab" : "Tab");
  }
  throw new Error("No s'hi arriba amb el tabulador");
};

const saveDocument = async (page: Page) => {
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Descarrega" }).click();
  const dialog = page.getByRole("dialog", { name: "Desa i descarrega" });
  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Desa el document" }).click();
  return download;
};

test("desar dona un .saac en format v3", async ({ page }) => {
  await openFixture(page, "02-diverses-pestanyes.saac");
  await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();

  const download = await saveDocument(page);
  expect(download.suggestedFilename()).toMatch(/\.saac$/);
  const file = JSON.parse(fs.readFileSync(await download.path(), "utf8"));
  expect(file).toMatchObject({
    format: "sequenciaac",
    kind: "document",
    schemaVersion: 3,
  });
  // La seqüència buida del 02 no hi és
  expect(file.sequences).toHaveLength(3);
});

test("el diàleg de desar explica què es guarda", async ({ page }) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Descarrega" }).click();
  const dialog = page.getByRole("dialog", { name: "Desa i descarrega" });
  await expect(
    dialog.getByRole("heading", { name: "Què es guarda en un document?" }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();
  expect(results.violations).toEqual([]);
});

test("un document antic ho diu, en una regió viva", async ({ page }) => {
  await openFixture(page, "01-una-pestanya.saac");
  const banner = page.getByRole("status").filter({
    hasText: "Aquest document és d'una versió anterior.",
  });
  await expect(banner).toBeVisible();
  await expect(banner).toHaveAttribute("aria-live", "polite");
  await expect(banner).toContainText(
    "No portava estil propi, i hi hem aplicat el teu estil per defecte.",
  );
});

test("una versió més nova avisa", async ({ page }) => {
  await openFixture(page, "14-versio-99.saac");
  await expect(
    page.getByText(
      "Aquest document s'ha creat amb una versió més nova de SequenciAAC.",
      { exact: false },
    ),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include('[role="status"]')
    .analyze();
  expect(results.violations).toEqual([]);
});

test("un fitxer malmès no s'obre, i es diu", async ({ page }) => {
  await openFixture(page, "13-malmes.saac");
  await expect(
    page.getByText(
      "No s'ha pogut obrir. No és un document de SequenciAAC o està malmès.",
    ),
  ).toBeVisible();
});

test("un .saac.txt s'obre com un .saac", async ({ page }) => {
  await openFixture(page, "11-una-pestanya.saac.txt");
  await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();
});

test("un estil obert com a document pregunta què se'n fa", async ({ page }) => {
  // Primer un document, perquè l'estil s'hi pugui aplicar
  await openFixture(page, "01-una-pestanya.saac");
  await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.keyboard.press("Escape");
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(path.join(FIXTURES, "09-esquema-2-estil.saacstyle"));

  const dialog = page.getByRole("dialog", {
    name: "Aquest fitxer és un estil, no un document",
  });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Aplica'l a aquest document" }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Fes-lo el meu estil per defecte" }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();
  expect(results.violations).toEqual([]);

  // Es tanca amb Esc, sense fer res
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("flux amb teclat: obrir un fitxer antic, canviar un pictograma, Restableix i Desa", async ({
  page,
}) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });

  // Obrir: el menú i «Carrega» amb el teclat; el selector de fitxers és del
  // sistema operatiu
  const menu = page.getByRole("button", { name: "Menú principal" });
  await tabTo(page, menu);
  await page.keyboard.press("Enter");
  const load = page.getByRole("button", { name: "Carrega", exact: true });
  // El menú s'obre amb una transició: s'espera que hi sigui abans de tabular
  await expect(load).toBeVisible();
  await tabTo(page, load);
  await expect(load).toBeFocused();
  const chooser = page.waitForEvent("filechooser");
  await page.keyboard.press("Enter");
  await (await chooser).setFiles(path.join(FIXTURES, "01-una-pestanya.saac"));
  await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();

  // Editar el primer pictograma
  const card = page.locator("button:has(> .MuiCard-root)").first();
  await tabTo(page, card);
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Canviar-lo: el color (blanc i negre) és un retoc de l'estil
  const accordion = dialog.getByRole("button", { name: /Configuracions/i });
  await tabTo(page, accordion.first());
  if ((await accordion.first().getAttribute("aria-expanded")) !== "true")
    await page.keyboard.press("Enter");
  const colorSwitch = dialog.locator('input[type="checkbox"]').first();
  await tabTo(page, colorSwitch);
  await page.keyboard.press("Space");
  const customized = dialog.getByText("Pictograma personalitzat");
  await expect(customized).toBeVisible();

  // Restableix
  const reset = dialog.getByRole("button", { name: "Restableix" });
  await tabTo(page, reset, { backwards: true });
  await page.keyboard.press("Enter");
  await expect(customized).toBeHidden();

  // Tancar el diàleg desa el pictograma; el «Desfés» n'és el missatge
  const close = dialog.getByRole("button", { name: "Tancar" });
  await tabTo(page, close);
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(
    page.getByText("El pictograma torna a tenir l'estil del document."),
  ).toBeVisible();

  // Desa
  await tabTo(page, menu);
  await page.keyboard.press("Enter");
  const download = page.getByRole("button", { name: "Descarrega" });
  await tabTo(page, download);
  await page.keyboard.press("Enter");
  const saveDialog = page.getByRole("dialog", { name: "Desa i descarrega" });
  const save = saveDialog.getByRole("button", { name: "Desa el document" });
  await tabTo(page, save);
  const file = page.waitForEvent("download");
  await page.keyboard.press("Enter");
  const saved = JSON.parse(fs.readFileSync(await (await file).path(), "utf8"));
  expect(saved.schemaVersion).toBe(3);
  // El primer pictograma no té cap retoc de color
  expect(saved.sequences[0].pictograms[0].style?.pictogram?.color).toBe(
    undefined,
  );
});
