import { test, expect, Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// B21: l'autor és del document. La pàgina de vista ensenya el del document
// obert, el que s'hi escriu va al document (i al fitxer que es descarrega), i
// les preferències de l'usuari no canvien si no les desa.

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(HERE, "..", "test", "fixtures", "saac");

test.beforeEach(async ({ page }) => {
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

/** Obre `02-diverses-pestanyes.saac`, que porta l'autor «Aula de Suport». */
const openFixture = async (page: Page): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.keyboard.press("Escape");
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(path.join(FIXTURES, "02-diverses-pestanyes.saac"));
  await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();
};

// La barra de dalt s'amaga en baixar (i entra amb una animació en tornar):
// es puja a dalt de tot abans de fer-la servir
const goTo = async (
  page: Page,
  route: "view-sequence" | "create-sequence",
): Promise<void> => {
  await page.evaluate(() => window.scrollTo(0, 0));
  const link = page.locator(`a[href*="${route}"]`).first();
  await expect(link).toBeInViewport();
  await link.click();
};

const authorField = (page: Page) =>
  page.getByRole("textbox", { name: /autor/i }).first();

const downloadedAuthor = async (page: Page): Promise<unknown> => {
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Descarrega" }).click();
  const dialog = page.getByRole("dialog", { name: "Desa i descarrega" });
  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Desa el document" }).click();
  const file = JSON.parse(
    fs.readFileSync(await (await download).path(), "utf8"),
  );
  return file.meta.author;
};

test("la vista ensenya l'autor del document obert", async ({ page }) => {
  await openFixture(page);
  await goTo(page, "view-sequence");

  await expect(authorField(page)).toHaveValue("Aula de Suport");
});

test("l'autor que s'escriu a la vista va al document i al fitxer", async ({
  page,
}) => {
  await openFixture(page);
  await goTo(page, "view-sequence");
  await authorField(page).fill("Marta");

  // Anar a Edició i tornar no el perd
  await goTo(page, "create-sequence");
  await goTo(page, "view-sequence");
  await expect(authorField(page)).toHaveValue("Marta");

  await goTo(page, "create-sequence");
  expect(await downloadedAuthor(page)).toBe("Marta");
});
