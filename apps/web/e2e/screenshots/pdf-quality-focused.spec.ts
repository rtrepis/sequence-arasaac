import { test } from "@playwright/test";
import { COVER, ensureImgDir, mockArasaac, searchWord, shot } from "./newsShot";

// Captures de la notícia «pdf-quality»: el que es veu a la previsualització és
// el que surt al PDF, i mentre es genera l'app diu què està fent.

test.beforeAll(ensureImgDir);

test("pdf-quality: captures de la previsualització i del missatge de generació", async ({
  page,
}) => {
  await mockArasaac(page);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await searchWord(page, "menjar");
  await page.waitForTimeout(1000);

  await page.getByRole("tab", { name: /Vista/i }).click();
  const preview = page.locator(".preview-container");
  await preview.waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(1500);

  // Coberta i pas 1: el full de previsualització, que és el que s'exporta
  await shot(page, preview, "pdf-quality.png", {
    size: COVER,
    noCursor: true,
  });
  await shot(page, preview, "pdf-quality-step1.png", { noCursor: true });

  // Pas 2: el missatge mentre es genera. La descàrrega es descarta: aquí
  // només interessa el que l'usuari veu durant l'espera.
  page.on("download", (download) => void download.cancel());
  await page.getByRole("button", { name: "Descarregar PDF" }).click();
  await page
    .getByText("S'està generant el PDF…")
    .waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(300);

  const backdrop = page.locator(".MuiBackdrop-root").first();
  await shot(page, backdrop, "pdf-quality-step2.png", { noCursor: true });
});
