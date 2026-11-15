import { test, expect, Page } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

// El menú lateral: un apartat de la configuració per entrada, que obre el
// diàleg directament allà, i «Document nou», com al botó d'estat.

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(HERE, "..", "test", "fixtures", "saac");

test.use({ locale: "ca-ES" });

test.beforeEach(async ({ page }) => {
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

const openMenu = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "Menú principal" }).click();
};

test("cada apartat de la configuració és una entrada que hi va directe", async ({
  page,
}) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });

  for (const tab of ["El meu estil", "Pàgina i distribució", "Usuari"]) {
    await openMenu(page);
    await page.getByRole("button", { name: tab, exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Configuracions" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("tab", { name: tab })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await dialog.getByRole("button", { name: "tancar" }).click();
    await expect(dialog).toBeHidden();
  }
});

test("«Document nou» pregunta si la feina no té còpia, com el botó d'estat", async ({
  page,
}) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });

  // Amb el document buit no hi ha res a buidar
  await openMenu(page);
  await expect(
    page.getByRole("button", { name: "Document nou" }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(path.join(FIXTURES, "02-diverses-pestanyes.saac"));
  await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();
  // Una pestanya més: feina que el fitxer obert no té
  await page
    .getByRole("button", { name: /Afegeix una seqüència/ })
    .first()
    .click();

  await openMenu(page);
  await page.getByRole("button", { name: "Document nou" }).click();
  const confirm = page.getByRole("dialog");
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Cancel·la" }).click();
  await expect(confirm).toBeHidden();
});
