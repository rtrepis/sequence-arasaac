import { test, expect, Page, BrowserContext } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Fixa el que va resoldre B19 del backlog d'UX: l'esborrany és un sol registre
// per a tot el navegador i cada pestanya hi escrivia el seu document sense mirar
// què hi havia. La pestanya que tornava del fons amb el document de fa una
// estona se'l carregava —i, de passada, esborrava del magatzem les imatges que
// el seu document no fa servir—, sense que ningú digués res.
//
// Les dues pàgines van dins del **mateix context**: és el que fa que comparteixin
// l'IndexedDB de l'origen, com dues pestanyes del mateix navegador.

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "dues-sequencies.saac",
);

const stubNetwork = async (context: BrowserContext) => {
  await context.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await context.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await context.route("https://**.arasaac.org/**", (route) => route.abort());
};

const openEditor = async (context: BrowserContext): Promise<Page> => {
  const page = await context.newPage();
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  return page;
};

const loadFixture = async (page: Page) => {
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();
};

/** Afegeix una seqüència: canvi de contingut que dispara l'escriptura. */
const addSequence = async (page: Page) => {
  const before = await page.getByRole("tab", { name: /^\d+$/ }).count();
  await page.getByRole("button", { name: "Afegeix una seqüència" }).click();
  await expect(page.getByRole("tab", { name: /^\d+$/ })).toHaveCount(before + 1);
  // Marge per al debounce d'1 s de l'esborrany
  await page.waitForTimeout(1600);
};

test("la pestanya del fons no s'endú la feina de l'altra", async ({
  context,
}) => {
  await stubNetwork(context);

  // Pestanya A: carrega el document i el deixa desat a l'esborrany
  const tabA = await openEditor(context);
  await loadFixture(tabA);
  await addSequence(tabA);

  // Pestanya B: arrenca, restaura les 3 i hi treballa fins a 5. Ha de sumar-ne
  // més que la A perquè el recompte distingeixi de qui és el document restaurat:
  // amb el mateix nombre a totes dues, la prova passaria fins i tot amb la feina
  // perduda
  const tabB = await openEditor(context);
  await expect(tabB.getByRole("tab", { name: "3" })).toBeVisible();
  await addSequence(tabB);
  await addSequence(tabB);
  await expect(tabB.getByRole("tab", { name: "5" })).toBeVisible();

  // Pestanya A torna al primer pla amb el document de fa una estona i hi toca:
  // abans, aquesta escriptura deixava a IndexedDB la seva versió, de 4
  await tabA.bringToFront();
  await addSequence(tabA);
  await expect(tabA.getByRole("tab", { name: "4" })).toBeVisible();

  // El que es restaura en recarregar continua sent la feina bona, la de 5
  await tabB.reload({ waitUntil: "domcontentloaded" });
  await expect(tabB.getByRole("tab", { name: "5" })).toBeVisible();
});

test("la pestanya bloquejada ho diu i deixa de prometre que desa", async ({
  context,
}) => {
  await stubNetwork(context);

  const tabA = await openEditor(context);
  await loadFixture(tabA);
  await addSequence(tabA);

  const tabB = await openEditor(context);
  await expect(tabB.getByRole("tab", { name: "3" })).toBeVisible();
  await addSequence(tabB);

  await tabA.bringToFront();
  await addSequence(tabA);

  await expect(
    tabA.getByRole("alert").filter({ hasText: "Una altra pestanya" }),
  ).toBeVisible();

  // I el botó d'estat ho diu, en comptes de quedar-se en «Desant…» per sempre.
  // Pel nom accessible del botó, que és on l'estat es llegeix sense obrir res
  await expect(
    tabA.getByRole("button", {
      name: /On es desa la feina: Una altra pestanya té feina més nova/,
    }),
  ).toBeVisible();
});

test("amb una sola pestanya no canvia res", async ({ context }) => {
  await stubNetwork(context);

  const page = await openEditor(context);
  await loadFixture(page);
  await addSequence(page);

  // Cap avís de conflicte, i el que es desa és el que hi ha
  await expect(page.getByRole("alert").filter({ hasText: "pestanya" })).toHaveCount(0);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("tab", { name: "3" })).toBeVisible();

  // Recarregar sense tocar res no ha d'escriure cap esborrany nou: amagar la
  // pestanya just després no pot fer saltar cap conflicte
  await page.evaluate(() =>
    window.document.dispatchEvent(new Event("visibilitychange")),
  );
  await page.waitForTimeout(500);
  await expect(page.getByRole("alert").filter({ hasText: "pestanya" })).toHaveCount(0);
});
