import { test } from "@playwright/test";
import { ensureImgDir, mockArasaac, shot } from "./newsShot";

// Captures de la notícia «search-suggestions»: suggeriments amb tabulador i
// la seqüència que surt d'escriure una frase sencera.

test.beforeAll(ensureImgDir);

test("search-suggestions: captures del cercador amb suggeriments", async ({
  page,
}) => {
  await mockArasaac(page);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const search = page.locator("#search");
  await search.waitFor({ state: "visible", timeout: 20000 });

  // Coberta i pas 1: el desplegable de suggeriments amb el xip «Tab»
  await search.click();
  await search.type("men", { delay: 120 });
  await page.waitForTimeout(1200);

  // Coberta centrada en la llista de suggeriments i no en el camp: el camp
  // ocupa tota l'amplada de la pàgina, i el retall que en sortia queia sobre
  // la franja verda de la barra, que a la targeta del carrusel no diu res.
  await shot(page, page.getByRole("option").first(), "search-suggestions.png", {
    size: { width: 815, height: 300 },
    mouseOffset: { x: 0, y: 40 },
    highlight: true,
  });
  // Prou alt per al camp i la llista de suggeriments, i no més: per sota no hi
  // ha res, i amb els 560 de sempre la meitat de la captura era buida.
  await shot(page, search, "search-suggestions-step1.png", {
    size: { width: 700, height: 300 },
    mouseOffset: { x: 0, y: 60 },
  });

  // Pas 2: la frase sencera es converteix en seqüència
  await search.fill("menjar, beure, dormir");
  await page.press("#search", "Escape");
  await page.press("#search", "Enter");
  await page.waitForFunction(
    () =>
      document.querySelectorAll('[data-testid="card-pictogram"]').length >= 3,
    { timeout: 60000 },
  );
  await page.waitForTimeout(1500);

  const sequence = page.locator('[data-testid="card-pictogram"]').first();
  await shot(page, sequence, "search-suggestions-step2.png", {
    noCursor: true,
  });
});
