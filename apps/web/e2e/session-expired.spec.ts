import { test, expect, Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Fixa el que va resoldre A11 del backlog d'UX: quan el refresc del token falla,
// l'única cosa que passava era que el token de memòria es posava a null. Redux
// continuava amb el correu, el calaix continuava dient qui eres i el diàleg de
// desar ensenyava l'error genèric «Torna-ho a provar» — un reintent que no podia
// funcionar mai.
//
// El backend no hi és: es simula amb `page.route`, que és l'única manera de
// provocar un refresc fallit sense un servidor.

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "dues-sequencies.saac",
);

const EMAIL = "algu@example.com";

// Navegador en català: sense això, `AppBootstrap` cau a l'idioma del navegador
// (anglès) i, en entrar, l'efecte de locale d'`App.tsx` —que només s'executa amb
// sessió— salta de /ca a /en enmig del test. És el salt que descriu B18, i aquí
// només cal que no hi surti pel mig.
test.use({ locale: "ca-ES" });

/** Simula el backend: login que va bé i qualsevol altra cosa amb la sessió morta. */
const mockBackend = async (page: Page, refreshErrorCode: string) => {
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ accessToken: "token-de-prova" }),
    }),
  );

  // La configuració del compte no és el que es prova aquí; el thunk ja té el seu
  // camí per quan no arriba, i així el test no depèn de la forma de l'objecte
  await page.route("**/api/user/ui-settings", (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
  );

  // El desat rebutja amb 401: és el que dispara el refresc
  await page.route("**/api/documents**", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ errorCode: "TOKEN_EXPIRED" }),
    }),
  );

  await page.route("**/api/auth/refresh", (route) =>
    route.fulfill({
      status: refreshErrorCode === "ACCOUNT_SUSPENDED" ? 403 : 401,
      contentType: "application/json",
      body: JSON.stringify({ errorCode: refreshErrorCode }),
    }),
  );

  await page.route("**/api/client-errors", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );
};

const loadFixtureAndLogIn = async (page: Page) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();

  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Inicia sessió" }).click();
  // Pel camp, i no per l'etiqueta: MUI hi afegeix l'asterisc de «required» i
  // «Contrasenya» també és dins de «Mostra la contrasenya»
  await page.locator('input[autocomplete="email"]').fill(EMAIL);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill("Contrasenya-1");
  await page.getByRole("button", { name: "Entra" }).click();

  // El diàleg es tanca sol quan el login va bé; el calaix ja s'havia tancat en
  // obrir-lo. Que hi ha sessió es comprova tot seguit: el botó flotant només
  // ofereix «Desa al núvol» a qui n'hi té.
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

/** Prem «Desa al núvol» des del botó flotant d'estat i confirma el nom. */
const tryToSaveToCloud = async (page: Page) => {
  await page.getByRole("button", { name: /On es desa la feina/ }).click();
  await page.getByRole("menuitem", { name: "Desa al núvol" }).click();
  await page.getByRole("button", { name: /^Desa$|Actualitza/ }).click();
};

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

test("la sessió caduca: es diu, es neteja l'estat i s'ofereix tornar a entrar", async ({
  page,
}) => {
  await mockBackend(page, "REFRESH_TOKEN_EXPIRED");
  await loadFixtureAndLogIn(page);
  await tryToSaveToCloud(page);

  // El diàleg de desar deixa de dir el genèric «Torna-ho a provar»
  await expect(page.getByRole("dialog")).toContainText("La sessió ha caducat");
  await page.getByRole("button", { name: "Cancel·la" }).click();

  // Tancat el diàleg, l'únic avís que queda és el de la sessió: diu les dues
  // coses que importen —què ha passat i que la feina hi és— i ofereix la sortida
  // Pel cos i no per rol sol: el missatge de «fitxer carregat» encara pot ser a
  // pantalla i també és un `alert`
  const notice = page.getByRole("alert").filter({ hasText: "no s'ha perdut" });
  await expect(notice).toContainText("La sessió ha caducat");
  await expect(notice).toContainText("no s'ha perdut");
  await expect(
    notice.getByRole("button", { name: "Torna a entrar" }),
  ).toBeVisible();

  // I l'estat s'ha netejat: el calaix torna a oferir entrar, no el correu
  await page.getByRole("button", { name: "Menú principal" }).click();
  await expect(page.getByRole("button", { name: "Inicia sessió" })).toBeVisible();
  await expect(page.getByText(EMAIL)).toHaveCount(0);
});

test("amb el compte suspès no es convida a tornar a entrar", async ({ page }) => {
  await mockBackend(page, "ACCOUNT_SUSPENDED");
  await loadFixtureAndLogIn(page);
  await tryToSaveToCloud(page);

  // Es tanca el diàleg abans de mirar l'avís: mentre és obert, el seu propi
  // error també parla del compte suspès i les dues alertes es confondrien
  await page.getByRole("button", { name: "Cancel·la" }).click();

  const notice = page.getByRole("alert").filter({ hasText: "no s'ha perdut" });
  await expect(notice).toContainText("suspès");
  await expect(
    notice.getByRole("button", { name: "Torna a entrar" }),
  ).toHaveCount(0);
});

test("qui no ha entrat mai no rep cap avís de sessió", async ({ page }) => {
  await mockBackend(page, "REFRESH_TOKEN_EXPIRED");

  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();

  // La restauració silenciosa de l'arrencada també rep 401 del refresc
  await expect(
    page.getByRole("alert").filter({ hasText: "sessió" }),
  ).toHaveCount(0);
});

test("tornar a entrar fa marxar l'avís", async ({ page }) => {
  await mockBackend(page, "REFRESH_TOKEN_EXPIRED");
  await loadFixtureAndLogIn(page);
  await tryToSaveToCloud(page);

  await page.getByRole("button", { name: "Cancel·la" }).click();
  const notice = page.getByRole("alert").filter({ hasText: "no s'ha perdut" });
  await expect(notice).toBeVisible();

  await notice.getByRole("button", { name: "Torna a entrar" }).click();
  await page.locator('input[autocomplete="email"]').fill(EMAIL);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill("Contrasenya-1");
  await page.getByRole("button", { name: "Entra" }).click();

  // Un avís de sessió caiguda amb la sessió oberta és pitjor que no dir-ne res
  await expect(notice).toHaveCount(0);
});
