import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Fixa el que van resoldre A10 i B20 del backlog d'UX:
//
// - A10: l'esborrany s'escriu un segon després de desar, i en restaurar-lo
//   aquella hora suplantava la de l'últim canvi. Un document amb còpia fora del
//   navegador tornava, a cada recàrrega, dient «Només en aquest dispositiu».
// - B20: el format de pàgina viu a `ui` i no al document, i ningú el desava fins
//   que es premien les preferències. La seqüència tornava sencera dins d'un A4
//   vertical encara que s'estigués treballant en A3.

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "dues-sequencies.saac",
);

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

/** Carrega el fitxer d'exemple des del menú i espera que hi sigui. */
const loadFixture = async (page: import("@playwright/test").Page) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();
};

test("un document amb còpia en fitxer no torna com a «només en aquest dispositiu»", async ({
  page,
}) => {
  await loadFixture(page);

  const fab = page.getByRole("button", { name: /On es desa la feina/ });
  await expect(fab).toHaveAccessibleName(/Descarregat en un fitxer/);

  // Marge perquè l'esborrany (debounce d'1 s) s'arribi a escriure abans de tallar
  await page.waitForTimeout(1500);
  await page.reload({ waitUntil: "domcontentloaded" });

  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();
  await expect(fab).toHaveAccessibleName(/Descarregat en un fitxer/);
});

test("el format de pàgina torna amb la seqüència", async ({ page }) => {
  await loadFixture(page);

  await page.getByRole("tab", { name: "Vista" }).click();
  const pageSize = page.getByRole("combobox", { name: "Mida de pàgina" });
  await expect(pageSize).toHaveText("A4");

  await pageSize.click();
  await page.getByRole("option", { name: "A3" }).click();
  await expect(pageSize).toHaveText("A3");

  await page.waitForTimeout(1500);
  await page.reload({ waitUntil: "domcontentloaded" });

  // Sense parpelleig: el primer valor que es pinta ja ha de ser el bo, perquè
  // els hooks de la columna copien el format en muntar-se i ja no el tornen a
  // mirar
  await expect(
    page.getByRole("combobox", { name: "Mida de pàgina" }),
  ).toHaveText("A3");
});
