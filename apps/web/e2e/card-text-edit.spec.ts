import { test, expect, Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// El text d'un pictograma s'edita damunt de la seva targeta, a la graella
// d'edició: clicant el text, amb F2 o amb «Edita el text» del menú contextual.
// Retorn o clicar fora desen; Esc ho deixa com era; buit torna a la paraula.

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

/** Carrega el document de prova: la primera seqüència té un pictograma, «prova». */
const loadFixture = async (page: Page): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();
};

/** La targeta per com comença el seu nom: el de la prova acaba amb «personalitzat» */
const card = (page: Page, name: string) =>
  page.getByRole("button", { name: new RegExp(`^${name}`) });

const textInput = (page: Page) =>
  page.getByRole("textbox", { name: "Text del pictograma 1" });

test("clicar el text l'edita a la targeta, i Retorn el desa", async ({
  page,
}) => {
  await loadFixture(page);

  await card(page, "prova, pictograma 1").getByText("prova").click();

  // No s'obre el diàleg: el camp surt damunt de la targeta
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(textInput(page)).toBeFocused();
  await textInput(page).fill("esmorzar");
  await page.keyboard.press("Enter");

  await expect(textInput(page)).toHaveCount(0);
  await expect(card(page, "esmorzar, pictograma 1")).toBeFocused();
});

test("clicar la imatge continua obrint el diàleg", async ({ page }) => {
  await loadFixture(page);

  await card(page, "prova, pictograma 1").getByRole("img").click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(textInput(page)).toHaveCount(0);
});

test("F2 edita el text, i Esc ho deixa com era", async ({ page }) => {
  await loadFixture(page);

  await card(page, "prova, pictograma 1").focus();
  await page.keyboard.press("F2");
  await textInput(page).fill("res");
  await page.keyboard.press("Escape");

  await expect(textInput(page)).toHaveCount(0);
  await expect(card(page, "prova, pictograma 1")).toBeFocused();
});

test("el menú contextual edita el text, i buit torna a la paraula", async ({
  page,
}) => {
  await loadFixture(page);

  // Primer un text propi, desat clicant fora
  await card(page, "prova, pictograma 1").click({ button: "right" });
  await page.getByRole("button", { name: "Edita el text" }).click();
  await textInput(page).fill("dinar");
  await page.mouse.click(5, 790);
  await expect(card(page, "dinar, pictograma 1")).toBeVisible();

  // Després, buit: la targeta torna a dir la paraula cercada
  await card(page, "dinar, pictograma 1").focus();
  await page.keyboard.press("F2");
  await textInput(page).fill("");
  await page.keyboard.press("Enter");
  await expect(card(page, "prova, pictograma 1")).toBeVisible();
});
