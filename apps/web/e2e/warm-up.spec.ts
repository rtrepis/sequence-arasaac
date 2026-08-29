import { test, expect, Page } from "@playwright/test";

// Fixa el que va resoldre B17 del backlog d'UX: Render adorm el servei als 15
// minuts i qui torna a la pestanya l'endemà pagava el desvetllament sencer al
// primer «Desa al núvol». El ping preventiu ja existia, però només el cridaven
// l'entrada al compte i el registre.
//
// El temps es fa passar amb `page.clock`: esperar cinc minuts de debò no és una
// prova, és una espera.

const EMAIL = "algu@example.com";

test.use({ locale: "ca-ES" });

/** Compta els `GET /health` que surten de la pàgina. */
const countWarmUps = (page: Page): { get: () => number } => {
  let count = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/health")) count += 1;
  });
  return { get: () => count };
};

const mockBackend = async (page: Page) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());

  await page.route("**/api/health", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ accessToken: "token-de-prova" }),
    }),
  );
  await page.route("**/api/auth/refresh", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ errorCode: "REFRESH_TOKEN_MISSING" }),
    }),
  );
  await page.route("**/api/user/ui-settings", (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
  );
};

/** Amaga o torna a mostrar la pestanya, com fa el navegador de debò. */
const setVisibility = (page: Page, state: "hidden" | "visible") =>
  page.evaluate((value) => {
    Object.defineProperty(window.document, "visibilityState", {
      value,
      configurable: true,
    });
    window.document.dispatchEvent(new Event("visibilitychange"));
  }, state);

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

test("es desperta el servidor en tornar d'una absència llarga, no d'una de curta", async ({
  page,
}) => {
  await page.clock.install();
  await mockBackend(page);
  const warmUps = countWarmUps(page);

  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await logIn(page);

  // Entrar ja en dispara un (l'AuthModal), que de passada consumeix el coixí de
  // 10 minuts: cal deixar-lo passar perquè les comprovacions següents mesurin
  // el que volen mesurar i no el coixí
  await expect.poll(warmUps.get).toBe(1);
  await page.clock.fastForward("11:00");

  // Absència curta: no n'ha de sortir cap
  await setVisibility(page, "hidden");
  await page.clock.fastForward("01:00");
  await setVisibility(page, "visible");
  await page.waitForTimeout(300);
  expect(warmUps.get()).toBe(1);

  // Absència llarga: ara sí
  await setVisibility(page, "hidden");
  await page.clock.fastForward("06:00");
  await setVisibility(page, "visible");
  await expect.poll(warmUps.get).toBe(2);
});

test("sense sessió no es desperta ningú", async ({ page }) => {
  await page.clock.install();
  await mockBackend(page);
  const warmUps = countWarmUps(page);

  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });

  await setVisibility(page, "hidden");
  await page.clock.fastForward("30:00");
  await setVisibility(page, "visible");
  await page.waitForTimeout(300);

  // L'app funciona sencera sense compte: no ha de tocar el servidor per res
  expect(warmUps.get()).toBe(0);
});

test("obrir el diàleg de desar desperta el servidor", async ({ page }) => {
  await page.clock.install();
  await mockBackend(page);
  const warmUps = countWarmUps(page);

  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await logIn(page);
  await expect.poll(warmUps.get).toBe(1);

  // Passat el coixí, obrir el diàleg n'ha de disparar un altre
  await page.clock.fastForward("11:00");
  await page.getByRole("button", { name: /On es desa la feina/ }).click();
  await page.getByRole("menuitem", { name: "Desa al núvol" }).click();

  await expect.poll(warmUps.get).toBe(2);
});
