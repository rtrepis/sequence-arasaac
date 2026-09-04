import { test } from "@playwright/test";
import { COVER, ensureImgDir, mockArasaac, shot } from "./newsShot";

// Captures de la notícia «logo-menu»: el menú principal que s'obre des del logo.
//
// Reescrit perquè el pas 3 ensenyava un selector d'idioma que ja no és al menú
// —va passar a la pestanya Usuari de configuració i a la pantalla d'inici— i
// buscava un botó «ca» que allà dins ja no existeix (troballa N2 del backlog).

test.beforeAll(ensureImgDir);

test("logo-menu: captures de les tres seccions del menú principal", async ({
  page,
}) => {
  await mockArasaac(page);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  await page.getByRole("button", { name: /Menú principal/i }).click();
  await page.waitForTimeout(800);

  // Inici i Novetats són enllaços; Edició i Vista, també. Esperar-ne un
  // confirma que el calaix ja és obert.
  await page
    .getByRole("link", { name: "Inici" })
    .waitFor({ state: "visible", timeout: 15000 });

  // Coberta i pas 1: la secció de navegació
  const navList = page
    .locator("ul")
    .filter({ has: page.getByRole("link", { name: "Inici" }) });

  await shot(page, navList, "logo-menu.png", {
    size: COVER,
    mouseOffset: { x: 40, y: 20 },
    highlight: true,
  });
  await shot(page, navList, "logo-menu-step1.png", {
    mouseOffset: { x: 40, y: 20 },
  });

  // Pas 2: la secció de fitxers
  const fileList = page
    .locator("ul")
    .filter({ has: page.getByRole("button", { name: /Descarrega/i }) });
  await fileList.waitFor({ state: "visible", timeout: 10000 });

  await shot(page, fileList, "logo-menu-step2.png", {
    mouseOffset: { x: 40, y: 20 },
  });

  // Pas 3: la secció de configuració. Ja no hi ha selector d'idioma al calaix:
  // el protagonista és l'ítem que obre el diàleg, que és el que el text nou
  // anomena.
  const settingsList = page
    .locator("ul")
    .filter({ has: page.getByRole("button", { name: "Configuració" }) });
  await settingsList.waitFor({ state: "visible", timeout: 10000 });

  await shot(page, settingsList, "logo-menu-step3.png", {
    mouseOffset: { x: 40, y: 20 },
  });
});
