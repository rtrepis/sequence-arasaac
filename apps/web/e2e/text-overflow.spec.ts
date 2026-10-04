import { test, expect, Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// B28: una paraula que no hi cap es talla dins de la targeta. A la graella
// d'edició, la targeta ho avisa amb una marca, i la marca ofereix reduir la
// lletra (de tot el document o només d'aquell pictograma) o editar el text.

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "dues-sequencies.saac",
);

const LONG_WORD = "Electroencefalogrames";

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

/** Document de prova amb una paraula massa llarga al primer pictograma. */
const loadWithLongWord = async (page: Page): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();

  await page
    .getByRole("button", { name: /^prova, pictograma 1/ })
    .getByText("prova")
    .click();
  const input = page.getByRole("textbox", { name: "Text del pictograma 1" });
  await input.fill(LONG_WORD);
  await page.keyboard.press("Enter");
};

const mark = (page: Page) =>
  page.getByRole("button", { name: "Pictograma 1: el text no hi cap" });

test("una paraula que no hi cap encén la marca, al costat de «personalitzat»", async ({
  page,
}) => {
  await loadWithLongWord(page);

  await expect(mark(page)).toBeVisible();
  // Les dues marques, l'una al costat de l'altra i sense tapar-se
  const warning = await mark(page).locator("span").first().boundingBox();
  const customized = await page.getByTestId("customized-mark").boundingBox();
  expect(warning && customized).toBeTruthy();
  expect(warning!.x + warning!.width).toBeLessThanOrEqual(customized!.x);
});

test("reduir la lletra del document la fa cabre, i Desfés la torna", async ({
  page,
}) => {
  await loadWithLongWord(page);

  await mark(page).click();
  const options = page.getByRole("dialog", { name: "El text no hi cap" });
  await expect(options).toBeVisible();
  await options
    .getByRole("button", { name: /^Redueix la lletra de tot el document a/ })
    .click();

  await expect(
    page.getByText(
      "S'ha reduït la lletra de tot el document perquè el text hi càpiga.",
    ),
  ).toBeVisible();
  await expect(mark(page)).toHaveCount(0);

  await page.getByRole("button", { name: "Desfés" }).click();
  await expect(mark(page)).toBeVisible();
});

test("reduir només la d'aquest pictograma el deixa personalitzat", async ({
  page,
}) => {
  await loadWithLongWord(page);

  await mark(page).click();
  await page
    .getByRole("button", { name: /^Redueix la lletra només d'aquest/ })
    .click();

  await expect(mark(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: /^Electroencefalogrames, pictograma 1, personalitzat/,
    }),
  ).toBeVisible();
});

test("«Edita el text» obre el camp damunt de la targeta", async ({ page }) => {
  await loadWithLongWord(page);

  await mark(page).click();
  await page.getByRole("button", { name: "Edita el text" }).click();

  await expect(
    page.getByRole("textbox", { name: "Text del pictograma 1" }),
  ).toBeFocused();
});

/** Mida de la lletra del text, en píxels, a la còpia del full que s'imprimeix. */
const printedTextSize = async (page: Page): Promise<number> => {
  // La còpia es fa en avisar `beforeprint`: amb el full encara per pintar,
  // sortiria buida
  await expect(page.locator("[data-card-text]").first()).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  // L'app també munta la còpia quan canvia el mitjà: si la torna a muntar
  // mentre es llegeix, l'element queda fora del document i no té mida
  let size = NaN;
  await expect
    .poll(async () => {
      size = await page
        .locator("#print-root [data-card-text]")
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      return size;
    })
    .toBeGreaterThan(0);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await page.emulateMedia({ media: "screen" });
  return size;
};

test("B32: la impressió respecta la mida de la lletra que s'ha triat", async ({
  page,
}) => {
  await loadWithLongWord(page);
  const viewLink = page.locator('a[href*="view-sequence"]').first();
  const editLink = page.locator('a[href*="create-sequence"]').first();

  await viewLink.click();
  const before = await printedTextSize(page);

  await editLink.click();
  await mark(page).click();
  const reduce = page.getByRole("button", {
    name: /^Redueix la lletra de tot el document a/,
  });
  const size = Number(
    (await reduce.textContent())!.match(/(\d+[,.]\d+)/)![1].replace(",", "."),
  );
  await reduce.click();

  await viewLink.click();
  const after = await printedTextSize(page);

  expect(after / before).toBeCloseTo(size, 2);
});
