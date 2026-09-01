import { test, expect, Page } from "@playwright/test";

// Fixa el que va resoldre B18 del backlog d'UX: amb compte, l'app es pintava amb
// la configuració que hi havia al navegador *abans* d'entrar-hi i esperava la
// del compte. Amb Render adormit, això vol dir fins a un minut amb un altre tema
// i un altre idioma, i després un salt d'URL a mitja feina.
//
// El servidor es simula, i la resposta de la configuració s'alenteix a propòsit:
// és la lentitud, no el contingut, el que fa visible el problema.

const EMAIL = "algu@example.com";

test.use({ locale: "ca-ES" });

const ACCOUNT_SETTINGS = {
  lang: { app: "en", search: "en" },
  theme: "dark",
  defaultSettings: {
    pictApiAra: { skin: "white", fitzgerald: "#FFFFFF", hair: "brown" },
    pictSequence: {
      font: { family: "Arial", color: "#000000", size: 1 },
      numbered: false,
      textPosition: "bottom",
      borderIn: { color: "#000000", radius: 0, size: 0 },
      borderOut: { color: "#000000", radius: 0, size: 0 },
    },
  },
  emailVerified: true,
  tier: "free",
};

/**
 * El backend simulat. Els dos interruptors es mouen durant la prova: la primera
 * visita és sense sessió (com qualsevol primera vegada al dispositiu) i la
 * segona càrrega arriba amb la cookie viva i el servidor lent, que és quan es
 * veu el problema.
 */
const mockBackend = async (page: Page) => {
  const control = { sessionAlive: false, settingsDelayMs: 0 };

  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());

  await page.route("**/api/auth/login", (route) => {
    control.sessionAlive = true;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ accessToken: "token-de-prova" }),
    });
  });

  await page.route("**/api/auth/logout", (route) => {
    control.sessionAlive = false;
    return route.fulfill({ status: 204, body: "" });
  });

  await page.route("**/api/auth/refresh", (route) =>
    control.sessionAlive
      ? route.fulfill({
          status: 200,
          contentType: "application/json",
          // El token porta un payload llegible: `refreshSessionThunk` en treu el correu
          body: JSON.stringify({
            accessToken: `x.${btoa(JSON.stringify({ email: EMAIL, userId: "1" }))}.y`,
          }),
        })
      : route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ errorCode: "REFRESH_TOKEN_MISSING" }),
        }),
  );

  await page.route("**/api/user/ui-settings", async (route) => {
    if (control.settingsDelayMs > 0)
      await new Promise((resolve) =>
        setTimeout(resolve, control.settingsDelayMs),
      );

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(ACCOUNT_SETTINGS),
    });
  });

  await page.route("**/api/health", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );

  return control;
};

const logIn = async (page: Page) => {
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Inicia sessió" }).click();
  await page.locator('input[autocomplete="email"]').fill(EMAIL);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill("Contrasenya-1");
  await page.getByRole("button", { name: "Entra" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

test("a la segona càrrega, la configuració del compte hi és sense esperar el servidor", async ({
  page,
}) => {
  const control = await mockBackend(page);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await logIn(page);

  // Amb la configuració del compte aplicada, la URL ja és la del seu idioma
  await expect(page).toHaveURL(/\/en\/create-sequence/);

  // Segona càrrega amb el servidor lent: el que es vegi abans de la resposta és
  // el que aquest pla arregla
  control.settingsDelayMs = 5000;
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/en\/create-sequence/, { timeout: 3000 });
  await expect(page.getByRole("button", { name: "Main menu" })).toBeVisible({
    timeout: 3000,
  });
});

test("tancar sessió recupera la configuració d'abans i no deixa la del compte", async ({
  page,
}) => {
  await mockBackend(page);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await logIn(page);
  await expect(page).toHaveURL(/\/en\/create-sequence/);

  await page.getByRole("button", { name: "Main menu" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();

  // Torna l'idioma d'abans d'entrar-hi…
  await expect(page).toHaveURL(/\/ca\/create-sequence/);
  // …i el navegador no es queda la cara del compte
  expect(
    await page.evaluate(() => localStorage.getItem("accountUi")),
  ).toBeNull();
});

test("la caché no es queda mai el vocabulari", async ({ page }) => {
  await mockBackend(page);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await logIn(page);
  await expect(page).toHaveURL(/\/en\/create-sequence/);

  const cached = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("accountUi") ?? "{}"),
  );

  expect(cached.wordProfiles).toEqual([]);
  // Ni estat del compte: el decideix el servidor a cada petició
  expect(cached.tier).toBeUndefined();
  expect(cached.emailVerified).toBeUndefined();
});
