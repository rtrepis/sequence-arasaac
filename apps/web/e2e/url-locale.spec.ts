import { test, expect, Page } from "@playwright/test";

// B23: l'idioma el mana la URL, amb compte o sense. L'idioma desat només
// decideix on aterra qui entra per l'arrel, i canviar-lo a la configuració
// porta la mateixa pàgina a l'idioma nou.

test.beforeEach(async ({ page }) => {
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

/** Desa el castellà com a idioma d'un usuari sense compte, com ho fa l'app. */
const preferSpanish = async (page: Page): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Configuració" }).click();
  await page.getByRole("button", { name: "es", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/create-sequence/);
};

test("canviar l'idioma a la configuració porta la mateixa pàgina a l'idioma nou", async ({
  page,
}) => {
  await page.goto("/ca/view-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Configuració" }).click();

  // Marcat, el que es veu
  await expect(
    page.getByRole("button", { name: "ca", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "fr", exact: true }).click();

  await expect(page).toHaveURL(/\/fr\/view-sequence/);
});

test("un enllaç amb idioma s'obre en aquell idioma, encara que se n'hagi desat un altre", async ({
  page,
}) => {
  await preferSpanish(page);
  // Tancar la configuració la desa al navegador
  await page.keyboard.press("Escape");
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("userUi") ?? "{}")?.lang?.app,
      ),
    )
    .toBe("es");

  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });

  // Es queda en català: la URL mana
  await expect(
    page.getByRole("button", { name: "Menú principal" }),
  ).toBeVisible();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/\/ca\/create-sequence/);
});

test("per l'arrel, sense idioma a l'adreça, aterra en l'idioma desat", async ({
  page,
}) => {
  await preferSpanish(page);
  await page.keyboard.press("Escape");
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("userUi") ?? "{}")?.lang?.app,
      ),
    )
    .toBe("es");

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("button", { name: "Iniciar", exact: true }),
  ).toBeVisible();
});
