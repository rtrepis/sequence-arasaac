import { test } from "@playwright/test";
import { COVER, ensureImgDir, gotoEditor, mockArasaac, shot } from "./newsShot";

// Captures de la notícia «pictogram-actions-touch»: les accions del pictograma
// dins del diàleg d'edició, que és la porta que hi ha al tàctil.

test.beforeAll(ensureImgDir);

test("pictogram-actions: captures del menú d'accions del diàleg", async ({
  page,
}) => {
  await mockArasaac(page);
  await gotoEditor(page, 1);

  await page.locator("button:has(> .MuiCard-root)").first().click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(800);

  const moreActions = dialog.getByRole("button", { name: "Més accions" });
  await moreActions.waitFor({ state: "visible", timeout: 10000 });

  // Coberta i pas 1: el botó de més accions a la capçalera del diàleg
  await shot(page, moreActions, "pictogram-actions-touch.png", {
    size: COVER,
    mouseOffset: { x: 0, y: 0 },
    highlight: true,
  });
  await shot(page, moreActions, "pictogram-actions-touch-step1.png", {
    mouseOffset: { x: 0, y: 0 },
  });

  // Pas 2: el menú obert, amb les sis accions
  await moreActions.click();
  const popover = page.locator(".MuiPopover-paper");
  await popover.waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(500);
  await shot(page, popover, "pictogram-actions-touch-step2.png", {
    noCursor: true,
  });
});
