import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Fixa el que va resoldre A10 del backlog d'UX:
//
// - A10: l'esborrany s'escriu un segon després de desar, i en restaurar-lo
//   aquella hora suplantava la de l'últim canvi. Un document amb còpia fora del
//   navegador tornava, a cada recàrrega, dient «Només en aquest dispositiu».

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
