import { test, expect, Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Fixa les tres coses que van sortir en obrir el «Desa com a»:
//
// - L'estat groc: seguir treballant damunt d'un document que ja té còpia el
//   tornava a «Només en aquest dispositiu», amb el mateix verd que un document
//   acabat de desar. El panell només s'obre amb el clic, així que el color del
//   botó era l'única diferència visible i no n'hi havia cap.
// - «Desa'n una còpia»: desar sobre un document del núvol només en podia
//   substituir la versió; no hi havia manera de derivar-ne un de nou.
// - Tancar la sessió deixava el document —i l'esborrany del navegador, que
//   sobreviu al refresc— a l'usuari següent, amb l'id del compte que l'havia
//   desat a dins. El vocabulari ja se n'anava en sortir, i pel mateix motiu: en
//   AAC el dispositiu es comparteix.

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "dues-sequencies.saac",
);

const EMAIL = "algu@example.com";

// Ids de MongoDB de mentida: 24 caràcters hexadecimals, que és el que mira
// `isMongoId` per saber si el document ja és al núvol
const CLOUD_ID = "a".repeat(24);
const COPY_ID = "b".repeat(24);

// Sense això `AppBootstrap` cau a l'idioma del navegador i l'efecte de locale
// salta de /ca a /en enmig del test (B18)
test.use({ locale: "ca-ES" });

/** Simula el backend: login, desat i tancament de sessió, tots correctes. */
const mockBackend = async (page: Page): Promise<void> => {
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ accessToken: "token-de-prova" }),
    }),
  );

  await page.route("**/api/auth/logout", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );

  // La configuració del compte no és el que es prova aquí
  await page.route("**/api/user/ui-settings", (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
  );

  // El desat torna el document tal com l'ha rebut, amb l'id que li tocaria: el
  // primer POST el crea, el segon (la còpia) en crea un de nou
  let saves = 0;
  await page.route("**/api/documents**", (route) => {
    if (route.request().method() !== "POST") return route.fallback();

    saves += 1;
    return route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        ...(route.request().postDataJSON() as Record<string, unknown>),
        id: saves === 1 ? CLOUD_ID : COPY_ID,
      }),
    });
  });
};

const loadFixture = async (page: Page): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  // El calaix és modal: mentre és obert tapa els tabs de seqüències
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();
};

const logIn = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Inicia sessió" }).click();
  await page.locator('input[autocomplete="email"]').fill(EMAIL);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill("Contrasenya-1");
  await page.getByRole("button", { name: "Entra" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

const statusFab = (page: Page) =>
  page.getByRole("button", { name: /On es desa la feina/ });

/** Desa al núvol des del botó flotant, amb el nom indicat. */
const saveToCloud = async (page: Page, title: string): Promise<void> => {
  await statusFab(page).click();
  await page.getByRole("menuitem", { name: "Desa al núvol" }).click();
  await page.getByRole("textbox", { name: /Nom del document/ }).fill(title);
  await page.getByRole("button", { name: "Desa", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

test("amb còpia en fitxer, el primer canvi diu que la còpia s'ha quedat enrere", async ({
  page,
}) => {
  await loadFixture(page);
  await expect(statusFab(page)).toHaveAccessibleName(
    /Descarregat en un fitxer a les/,
  );

  const borderWhenSaved = await statusFab(page).evaluate(
    (fab) => getComputedStyle(fab).borderColor,
  );

  await page.getByRole("button", { name: "Afegeix una seqüència" }).click();
  await expect(page.getByRole("tab", { name: "3" })).toBeVisible();

  // Ni «desat» ni «només en aquest dispositiu»: la còpia hi és, però és d'abans
  await expect(statusFab(page)).toHaveAccessibleName(
    /Amb canvis nous des del fitxer descarregat a les/,
  );

  // I es veu sense obrir res: el panell només s'obre amb el clic, així que el
  // color del botó és l'única diferència que hi ha de cua d'ull
  const borderWhenStale = await statusFab(page).evaluate(
    (fab) => getComputedStyle(fab).borderColor,
  );
  expect(borderWhenStale).not.toBe(borderWhenSaved);

  // I el que es perdria en començar de zero no és tot: és el que s'ha fet des
  // d'aleshores, i el diàleg ho ha de dir així
  await statusFab(page).click();
  await page.getByRole("menuitem", { name: "Document nou" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "La còpia desada és d'abans",
  );
});

test("es pot desar una còpia sense tocar l'original, i cal donar-li un nom propi", async ({
  page,
}) => {
  await mockBackend(page);
  await loadFixture(page);
  await logIn(page);
  await saveToCloud(page, "Esmorzar");

  await expect(statusFab(page)).toHaveAccessibleName(/Desat al núvol a les/);

  // Es continua treballant: la còpia del núvol es queda enrere
  await page.getByRole("button", { name: "Afegeix una seqüència" }).click();
  await expect(statusFab(page)).toHaveAccessibleName(
    /Amb canvis nous des del desat al núvol de les/,
  );

  await statusFab(page).click();
  await page.getByRole("menuitem", { name: "Desa al núvol" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Actualitza al núvol");

  // Amb el nom de l'original, la còpia no es desa: al llistat quedarien dues
  // files iguals i és l'únic lloc on es tria què es carrega i què s'esborra
  await dialog.getByRole("button", { name: "Desa'n una còpia" }).click();
  await expect(dialog).toContainText("nom diferent");
  await expect(dialog).toBeVisible();

  await page.getByRole("textbox", { name: /Nom del document/ }).fill("Berenar");
  await dialog.getByRole("button", { name: "Desa'n una còpia" }).click();

  // I es diu que, a partir d'ara, es treballa sobre la còpia
  await expect(page.getByRole("alert")).toContainText("Berenar");
  await expect(page.getByRole("alert")).toContainText("ara hi treballes");
  await expect(statusFab(page)).toHaveAccessibleName(/Desat al núvol a les/);
});

test("tancar la sessió tanca el document, i abans avisa si no té còpia", async ({
  page,
}) => {
  await mockBackend(page);
  await loadFixture(page);
  await logIn(page);
  await page.getByRole("button", { name: "Afegeix una seqüència" }).click();

  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Tanca sessió" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Tanques la sessió?");
  // La sortida que evita la pèrdua en comptes de consumar-la: encara hi ha sessió
  await expect(
    dialog.getByRole("button", { name: "Desa al núvol abans" }),
  ).toBeVisible();

  // Cancel·lar no toca res
  await dialog.getByRole("button", { name: "Cancel·la" }).click();
  await expect(page.getByRole("tab", { name: "3" })).toBeVisible();

  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Tanca sessió" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Tanca sessió" })
    .click();

  // El document se'n va amb la sessió: ni a pantalla ni a l'esborrany
  await expect(page.getByRole("tab", { name: "2" })).toHaveCount(0);
  await expect(page.getByRole("alert")).toContainText(
    "El document també s'ha tancat",
  );
});
