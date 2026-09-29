import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

// El panell «Estil del document» (docs/fonaments/03-model-contingut-estil.md):
//
// - Les quatre accions d'estil, en l'ordre dels fonaments: botons en
//   escriptori, menú «⋯» («Accions d'estil») en mòbil, tot amb el teclat i
//   dianes de 44 px, i el focus on toca en obrir i tancar el menú.
// - La previsualització hi cap sempre, també amb els valors màxims de vora,
//   mida de lletra i numeració: abans el pictograma sobresortia del requadre.

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCUMENT = path.join(
  HERE,
  "..",
  "test",
  "fixtures",
  "saac",
  "01-una-pestanya.saac",
);
const EXTREME_STYLE = path.join(HERE, "fixtures", "estil-extrem.saacstyle");

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 360, height: 740 };

const ACTIONS = [
  "Aplica el meu estil per defecte",
  "Carrega un estil des d'un fitxer…",
  "Desa com a estil per defecte",
  "Desa l'estil en un fitxer…",
];

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

const openFile = async (page: Page, file: string) => {
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.keyboard.press("Escape");
  await page.locator('input[type="file"]').first().setInputFiles(file);
};

const openStylePanel = async (page: Page) => {
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Configuració" }).click();
  await page.getByRole("tab", { name: "Estil del document" }).click();
  await expect(
    page.getByRole("heading", { name: "Estil del document" }),
  ).toBeVisible();
};

test("escriptori: les quatre accions són botons, en ordre i de 44 px", async ({
  page,
}) => {
  await page.setViewportSize(DESKTOP);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await openStylePanel(page);

  const region = page.getByRole("region", { name: "Estil del document" });
  const buttons = region.getByRole("button");
  await expect(buttons).toHaveText(ACTIONS);
  for (const button of await buttons.all()) {
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await expect(
    page.getByRole("button", { name: "Accions d'estil" }),
  ).toHaveCount(0);

  // Amb el teclat, en l'ordre en què es llegeixen
  await buttons.first().focus();
  for (const name of ACTIONS.slice(1)) {
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name })).toBeFocused();
  }
});

test("mòbil: menú «⋯» amb el teclat, i el focus hi torna", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await openFile(page, DOCUMENT);
  await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();
  await openStylePanel(page);

  const more = page.getByRole("button", { name: "Accions d'estil" });
  const box = (await more.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await expect(more).toHaveAttribute("aria-haspopup", "menu");

  // Obrir amb Enter: el focus va al primer element, i les fletxes hi passen
  await more.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  // Amb el menú obert, la resta queda `aria-hidden`: es busca pel selector
  await expect(page.locator('[aria-haspopup="menu"]')).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(menu.getByRole("menuitem")).toHaveText(ACTIONS);
  await expect(menu.getByRole("menuitem").first()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(menu.getByRole("menuitem").nth(1)).toBeFocused();
  // El menú entra amb una animació d'escala: es mesura quan ha acabat
  for (const item of await menu.getByRole("menuitem").all()) {
    await expect
      .poll(async () => (await item.boundingBox())!.height)
      .toBeGreaterThanOrEqual(44);
  }

  // Esc el tanca i torna el focus al «⋯»
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(more).toBeFocused();

  // Triar una acció també el torna al «⋯», i el «Desfés» és el següent tabulador
  await page.keyboard.press("Enter");
  await expect(menu.getByRole("menuitem").first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("S'ha aplicat el teu estil per defecte al document."),
  ).toBeVisible();
  await expect(more).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Desfés" })).toBeFocused();
});

for (const [name, viewport] of [
  ["escriptori", DESKTOP],
  ["360 px", MOBILE],
] as const) {
  test(`${name}: la previsualització hi cap amb els valors màxims`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
    await openFile(page, DOCUMENT);
    await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();
    // Vores de 10, lletra i números a mida 2, numerat i text a dalt
    await openFile(page, EXTREME_STYLE);
    // Obert com a document, pregunta què se'n fa (model v3)
    await page
      .getByRole("dialog", {
        name: "Aquest fitxer és un estil, no un document",
      })
      .getByRole("button", { name: "Aplica'l a aquest document" })
      .click();
    await expect(
      page.getByText("S'ha aplicat l'estil del fitxer al document."),
    ).toBeVisible();
    await openStylePanel(page);

    const frame = page.getByTestId("settings-preview-frame");
    const card = frame.getByTestId("card-pictogram");
    await page.evaluate(() => document.fonts.ready);

    await expect
      .poll(async () => {
        const outer = (await frame.boundingBox())!;
        const inner = (await card.boundingBox())!;
        return (
          inner.x >= outer.x - 0.5 &&
          inner.y >= outer.y - 0.5 &&
          inner.x + inner.width <= outer.x + outer.width + 0.5 &&
          inner.y + inner.height <= outer.y + outer.height + 0.5
        );
      })
      .toBe(true);

    // I no s'ha deformat: la mateixa proporció que la targeta sense escalar
    const ratio = await card.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return (
        box.width / box.height / (element.offsetWidth / element.offsetHeight)
      );
    });
    expect(ratio).toBeCloseTo(1, 2);

    await expect(frame).toHaveScreenshot(
      `previsualitzacio-extrema-${viewport.width}.png`,
    );
  });
}
