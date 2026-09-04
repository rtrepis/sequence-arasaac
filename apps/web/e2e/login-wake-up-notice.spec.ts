import { test, expect, Page } from "@playwright/test";

// Fixa A12 del backlog d'UX: la pantalla d'inici és on es fa el primer login del
// dia —i per tant on Render és més probable que estigui adormit— i era l'únic
// layout que no muntava l'avís de desvetllament. En prémer «Entra» els camps es
// bloquejaven i durant prop d'un minut no apareixia cap explicació.
//
// La prova no espera el desvetllament de debò: reté la resposta del login fins
// que ha comprovat el que volia comprovar.

const EMAIL = "algu@example.com";

test.use({ locale: "ca-ES" });

const mockBackend = async (page: Page): Promise<void> => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());

  await page.route("**/api/health", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await page.route("**/api/auth/refresh", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ errorCode: "REFRESH_TOKEN_MISSING" }),
    }),
  );
};

test("el login lent de la pantalla d'inici diu què passa i deixa seguir escrivint", async ({
  page,
}) => {
  await mockBackend(page);

  // El servidor que s'està despertant: la petició queda en vol fins que la
  // prova la deixa anar
  let releaseLogin = (): void => {};
  const sleepingServer = new Promise<void>((resolve) => {
    releaseLogin = resolve;
  });
  await page.route("**/api/auth/login", async (route) => {
    await sleepingServer;
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ errorCode: "INVALID_CREDENTIALS" }),
    });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "Inicia sessió" }).click();
  const email = page.locator('input[autocomplete="email"]');
  await email.fill(EMAIL);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill("Contrasenya-1");
  await page.getByRole("button", { name: "Entra" }).click();

  // L'avís apareix passat el llindar de 3 s de `backendStatus`
  await expect(page.getByText(/Connectant amb el teu compte/)).toBeVisible({
    timeout: 10000,
  });

  // I mentre s'espera es pot corregir el correu: el bloqueig dels camps era
  // justament el que feia semblar que l'app s'hagués penjat
  await expect(email).toBeEditable();
  await email.fill("altre@example.com");
  await expect(email).toHaveValue("altre@example.com");

  // El botó es diu ocupat, però no surt de l'ordre de tabulació: el `disabled`
  // de debò és el que el trauria del tabulador sense avisar ningú
  const submit = page.getByRole("button", { name: "Entra" });
  await expect(submit).toHaveAttribute("aria-busy", "true");
  await expect(submit).toHaveAttribute("aria-disabled", "true");
  await expect(submit).toHaveJSProperty("disabled", false);
  await expect(submit).toHaveAttribute("tabindex", "0");

  // Quan el servidor respon, l'avís marxa sol
  releaseLogin();
  await expect(page.getByText(/Connectant amb el teu compte/)).toHaveCount(0);
});
