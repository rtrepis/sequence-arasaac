import { test, expect, Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Fixa el que van resoldre B7 i C14 del backlog d'UX: `features/sequence` no té
// cap `undo`, així que el que protegeix la feina és **on** viu cada acció
// destructiva i **quan** demana confirmació. El criteri és quant costa refer-ho:
// treure un pictograma es refà amb un clic i no es confirma; esborrar una
// seqüència se'ls endú tots i sí que es confirma — però només si en té cap.

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "dues-sequencies.saac",
);

test.beforeEach(async ({ page }) => {
  // Ni tipografies de Google ni pictogrames d'ARASAAC: aquí no es prova cap
  // de les dues coses i la xarxa només afegiria intermitència
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

/** Carrega el document de prova: dues seqüències, la segona amb dos pictogrames. */
const loadFixture = async (page: Page): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  // El drawer és modal: mentre és obert tapa els tabs de seqüències
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();
};

test("una seqüència buida s'esborra sense preguntar res", async ({ page }) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Afegeix una seqüència" }).click();
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();

  await page.getByRole("button", { name: "Elimina l'última seqüència" }).click();

  // Sense res a perdre, la confirmació només seria fricció
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "2" })).toHaveCount(0);
});

test("una seqüència amb pictogrames confirma, i diu quants en perd", async ({
  page,
}) => {
  await loadFixture(page);

  await page.getByRole("button", { name: "Elimina l'última seqüència" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Esborres la seqüència 2?");
  // El cos diu la xifra concreta, no un avís genèric
  await expect(dialog).toContainText("2 pictogrames");

  // Cancel·lar no ha de tocar res
  await dialog.getByRole("button", { name: "Cancel·la" }).click();
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();

  await page.getByRole("button", { name: "Elimina l'última seqüència" }).click();
  await page.getByRole("button", { name: "Esborra la seqüència" }).click();
  await expect(page.getByRole("tab", { name: "2" })).toHaveCount(0);
});

test("cap botó no queda armat en obrir la confirmació", async ({ page }) => {
  await loadFixture(page);
  await page.getByRole("button", { name: "Elimina l'última seqüència" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  // El focus se'l queda el diàleg: el lector de pantalla llegeix què es perd i
  // Enter no consuma res. Si algú hi posés `autoFocus` al botó destructiu,
  // aquesta prova ho ha d'aturar.
  const focusIsButton = await page.evaluate(
    () => document.activeElement?.tagName === "BUTTON",
  );
  expect(focusIsButton).toBe(false);

  // Enter no consuma res: el diàleg segueix obert i espera una decisió. Mentre
  // hi és no es pot mirar cap tab de darrere, perquè un diàleg modal treu la
  // resta de la pàgina de l'arbre d'accessibilitat
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByRole("button", { name: "Cancel·la" }).click();
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();
});

test("al menú contextual, esborrar va l'últim i separat de la resta", async ({
  page,
}) => {
  await loadFixture(page);
  await page.getByRole("tab", { name: "1" }).click();
  await page.locator("button:has(> div)").first().click({ button: "right" });

  const menu = page.getByRole("navigation");
  await expect(menu).toBeVisible();

  // L'ordre és el que veu l'usuari: primer el que més es fa, l'irreversible al final
  const texts = (
    await menu.locator(".MuiListItemText-root").allTextContents()
  )
    .map((text) => text.trim())
    .filter(Boolean);
  expect(texts[0]).toBe("Edita");
  expect(texts[texts.length - 1]).toBe("Elimina");

  // Quatre grups, tres separadors: abans no n'hi havia cap i «Elimina» quedava
  // encaixonat entre accions inofensives
  await expect(menu.locator(".MuiDivider-root")).toHaveCount(3);
});
