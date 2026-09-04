import { test } from "@playwright/test";
import { COVER, ensureImgDir, mockArasaac, shot } from "./newsShot";

// Captures de la notícia «new-languages»: on es canvia l'idioma de l'app.
//
// Reescrit sencer: els passos 1 i 2 explicaven el selector del menú lateral,
// que ja no hi és. Avui l'idioma de la interfície viu a la pestanya Usuari del
// diàleg de configuració (troballa N2 del backlog).

test.beforeAll(ensureImgDir);

test("new-languages: captures del canvi d'idioma des de configuració", async ({
  page,
}) => {
  await mockArasaac(page);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // Pas 1: el camí fins a la configuració
  await page.getByRole("button", { name: /Menú principal/i }).click();
  await page.waitForTimeout(800);

  const settingsItem = page.getByRole("button", { name: "Configuració" });
  await settingsItem.waitFor({ state: "visible", timeout: 15000 });
  await shot(page, settingsItem, "new-languages-step1.png", {
    mouseOffset: { x: 40, y: 20 },
  });

  await settingsItem.click();
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1500);

  // Coberta i pas 2: la fila «Interfície», amb els cinc idiomes a la vista.
  // L'amplada és la del diàleg i no la del grup de botons: centrat en el grup,
  // el títol de la fila queda fora per l'esquerra.
  const langGroup = page.getByRole("group", {
    name: "Selecciona l'idioma de la interfície",
  });
  await langGroup.waitFor({ state: "visible", timeout: 15000 });

  // La interfície arrenca marcada en «en» encara que la URL sigui /ca i tot
  // es vegi en català (troballa B23). En una notícia que va precisament
  // d'idiomes, això es llegiria com un error de l'app: es marca el que s'hi
  // veu abans de fotografiar-ho. El toggle navega i desmunta el diàleg.
  await page.getByRole("button", { name: "ca", exact: true }).click();
  await page.waitForTimeout(1500);
  if (!(await page.getByRole("dialog").isVisible())) {
    await page.getByRole("button", { name: /Menú principal/i }).click();
    await page.getByRole("button", { name: "Configuració" }).click();
    await page.getByRole("dialog").waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(1200);
  }

  // La secció «Idioma» i no el diàleg sencer: el tab Usuari complet ja és la
  // captura de la notícia del tema fosc, i dues notícies amb la mateixa
  // imatge no expliquen res.
  await shot(page, langGroup, "new-languages.png", {
    size: { width: 1280, height: COVER.height },
    mouseOffset: { x: 70, y: 30 },
    highlight: true,
  });
  await shot(page, langGroup, "new-languages-step2.png", {
    size: { width: 1280, height: 400 },
    mouseOffset: { x: 70, y: 30 },
  });

  // Pas 3: triar «fr» i ensenyar l'app en francès
  await page.getByRole("button", { name: "fr", exact: true }).click();
  await page.waitForTimeout(2500);

  await shot(page, page.locator("body"), "new-languages-step3.png", {
    size: { width: 1280, height: 800 },
    noCursor: true,
  });
});
