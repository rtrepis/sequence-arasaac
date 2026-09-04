import { test } from "@playwright/test";
import {
  ensureImgDir,
  gotoEditor,
  mockArasaac,
  searchWord,
  shot,
} from "./newsShot";

// Captures de la notícia «user-preferences»: el tab Usuari i el tema fosc.

test.beforeAll(ensureImgDir);

const openSettings = async (page: import("@playwright/test").Page) => {
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Configuració" }).click();
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1200);
};

test("user-preferences: captures del tab Usuari i del tema fosc", async ({
  page,
}) => {
  await mockArasaac(page);
  // Amb un pictograma de debò: el pas 2 ha d'ensenyar que el full es queda
  // blanc en tema fosc, i amb la casella buida no es veuria.
  await gotoEditor(page, 0);
  await searchWord(page, "menjar");
  await page.waitForTimeout(4000);
  await openSettings(page);

  // L'idioma d'interfície arrenca en «en» encara que la URL sigui /ca i tota
  // la pantalla es vegi en català (troballa B23 del backlog). A la captura
  // quedaria com una contradicció, així que primer es marca el que s'hi
  // llegeix. El toggle navega, i això desmunta el diàleg: cal reobrir-lo.
  await page.getByRole("button", { name: "ca", exact: true }).click();
  await page.waitForTimeout(1500);
  // El toggle navega. Si això ha desmuntat el diàleg, es torna a obrir; si no,
  // es continua amb el que ja hi ha a pantalla.
  if (!(await page.getByRole("dialog").isVisible())) await openSettings(page);

  const themeGroup = page.getByRole("group", { name: "Selecciona el tema" });
  await themeGroup.waitFor({ state: "visible", timeout: 15000 });

  // Coberta: la franja de la fila del tema. L'amplada és la del diàleg i no
  // la del grup de botons: centrat en el grup, el títol de la fila —que és el
  // que diu de què és el control— queda fora per l'esquerra.
  await shot(page, themeGroup, "user-preferences.png", {
    size: { width: 1280, height: 290 },
    mouseOffset: { x: 70, y: 30 },
    highlight: true,
  });

  // Pas 1: el tab Usuari sencer, que és el que la descripció anomena
  await shot(page, page.getByRole("dialog"), "user-preferences-step1.png", {
    noCursor: true,
  });

  // Pas 2: l'app en fosc. Es tanca el diàleg perquè es vegi l'editor, que és
  // on l'usuari notarà el canvi.
  await page.getByRole("button", { name: "Fosc" }).click();
  await page.waitForTimeout(800);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1500);

  const editor = page.locator("main, #main-content").first();
  await shot(page, editor, "user-preferences-step2.png", { noCursor: true });
});
