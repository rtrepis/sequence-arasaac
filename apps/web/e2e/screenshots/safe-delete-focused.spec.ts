import { test } from "@playwright/test";
import {
  COVER,
  ensureImgDir,
  gotoEditor,
  mockArasaac,
  searchWord,
  shot,
} from "./newsShot";

// Captures de la notícia «safe-delete»: la confirmació en esborrar una
// seqüència amb contingut, i «Elimina» separat al final del menú.

test.beforeAll(ensureImgDir);

test("safe-delete: captures de la confirmació i del menú del pictograma", async ({
  page,
}) => {
  await mockArasaac(page);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await searchWord(page, "menjar");
  await page.waitForTimeout(800);

  // Una segona seqüència, també amb contingut, perquè la confirmació digui
  // una xifra de debò
  await page.getByRole("button", { name: "Afegeix una seqüència" }).click();
  await page.waitForTimeout(500);
  await searchWord(page, "beure");
  await page.waitForTimeout(800);

  await page.getByRole("button", { name: "Elimina l'última seqüència" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(600);

  // Coberta i pas 1: la confirmació, que diu quants pictogrames se'n van
  await shot(page, dialog, "safe-delete.png", { size: COVER, noCursor: true });
  await shot(page, dialog, "safe-delete-step1.png", { noCursor: true });

  await dialog.getByRole("button", { name: "Cancel·la" }).click();
  await page.waitForTimeout(600);

  // Pas 2: «Elimina» al final del menú contextual, sol i separat. És el menú
  // del clic dret (MouseActionList) i no el del diàleg d'edició: el del diàleg
  // omet «Elimina» precisament perquè allà ja hi ha el botó del peu.
  await gotoEditor(page, 1);
  await page
    .locator("button:has(> .MuiCard-root)")
    .first()
    .click({ button: "right" });

  const popover = page.locator(".MuiPopover-paper");
  await popover.waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(500);
  await shot(page, popover, "safe-delete-step2.png", { noCursor: true });
});
