import { test } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

// Directoris de sortida per a imatges i vídeos
const IMG_DIR = path.join(process.cwd(), "public/img/news");
const VIDEO_DIR = path.join(process.cwd(), "public/video/news");
const FIXTURES_DIR = path.join(process.cwd(), "e2e/fixtures/images");

// Interfície per als mocks de cerca
interface PictogramMock {
  _id: number;
  keywords: Array<{ type: number; meaning: string }>;
  skin: boolean;
  hair: boolean;
}

// Mocks de la resposta de cerca (ID + metadata per a makeSettingsProperty)
const searchMocks: Record<string, PictogramMock[]> = {
  menjar: [{ _id: 2349, keywords: [{ type: 2, meaning: "menjar" }], skin: false, hair: false }],
  beure: [{ _id: 2276, keywords: [{ type: 3, meaning: "beure" }], skin: false, hair: false }],
  dormir: [{ _id: 2369, keywords: [{ type: 3, meaning: "dormir" }], skin: false, hair: false }],
};

// Mapa ID → fitxer de fixture PNG local
const imageFixtures: Record<number, string> = {
  2349: path.join(FIXTURES_DIR, "menjar.png"),
  2276: path.join(FIXTURES_DIR, "beure.png"),
  2369: path.join(FIXTURES_DIR, "dormir.png"),
};

test.beforeAll(() => {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
});

test("view-improvements: captures i vídeo per la guia de novetats", async ({
  page,
}) => {
  // Interceptar totes les crides a l'API d'ARASAAC i servir dades locals
  await page.route("**/api.arasaac.org/**", async (route) => {
    const urlObj = new URL(route.request().url());
    const pathname = urlObj.pathname;

    // Keywords: GET /api/keywords/{locale}
    if (/\/api\/keywords\//.test(pathname)) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ words: [] }),
      });
    }

    // Cerca: GET /api/pictograms/{locale}/bestsearch/{paraula}
    const searchMatch = pathname.match(/\/pictograms\/\w+\/bestsearch\/(.+)/);
    if (searchMatch) {
      const word = searchMatch[1];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(searchMocks[word] ?? []),
      });
    }

    // Configuració: GET /api/pictograms/{locale}/{id}  (locale = lletres, id = número)
    const settingsMatch = pathname.match(/\/pictograms\/[a-z]+\/(\d+)$/);
    if (settingsMatch) {
      const id = Number.parseInt(settingsMatch[1]);
      const found = Object.values(searchMocks)
        .flat()
        .find((p) => p._id === id);
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          found ?? { keywords: [{ type: 2 }], skin: false, hair: false },
        ),
      });
    }

    // Imatge: GET /api/pictograms/{id}  (id numèric directe, sense locale)
    const imageMatch = pathname.match(/\/pictograms\/(\d+)$/);
    if (imageMatch) {
      const id = Number.parseInt(imageMatch[1]);
      const fixturePath = imageFixtures[id];
      if (fixturePath && fs.existsSync(fixturePath)) {
        return route.fulfill({
          status: 200,
          contentType: "image/png",
          body: fs.readFileSync(fixturePath),
        });
      }
    }

    // Qualsevol altra crida: deixar passar
    await route.continue();
  });

  // =============================================
  // EDIT PAGE: Afegir pictogrames
  // =============================================
  await page.goto("/ca/create-sequence");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);

  await page.fill("#search", "menjar, beure, dormir");
  await page.press("#search", "Enter");
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="card-pictogram"]').length >= 3,
    { timeout: 30000 },
  );
  await page.waitForTimeout(1000);

  // =============================================
  // VIEW PAGE - PAS 1: Previsualització = Impressió
  // =============================================
  await page.getByRole("tab", { name: /Vista/i }).click();
  const previewContainer = page.locator(".preview-container");
  await previewContainer.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1000);

  // Captura pas 1: previsualització visible
  await page.screenshot({
    path: path.join(IMG_DIR, "view-improvements-step1.png"),
  });
  // Portada: mateix estat
  await page.screenshot({
    path: path.join(IMG_DIR, "view-improvements.png"),
  });

  // =============================================
  // VIEW PAGE - PAS 2: Controls d'alineació i direcció
  // =============================================
  // Els controls d'alineació estan dins l'acordió obert per defecte
  const sizeSlider = page.getByRole("slider", { name: "Mida" });
  await sizeSlider.waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(500);

  // Captura pas 2: controls de configuració visibles (alineació + direcció)
  await page.screenshot({
    path: path.join(IMG_DIR, "view-improvements-step2.png"),
  });

  // =============================================
  // VIEW PAGE - PAS 3: Botó de desar al drawer de navegació
  // =============================================
  // Obrir el drawer de navegació principal (LogoMenu)
  const menuBtn = page.getByRole("button", { name: /Menú principal/i });
  await menuBtn.waitFor({ state: "visible", timeout: 10000 });
  await menuBtn.click();
  await page.waitForTimeout(600);

  // L'ítem de descàrrega dins el drawer
  const downloadItem = page.getByRole("button", { name: /Descarrega/i });
  await downloadItem.waitFor({ state: "visible", timeout: 10000 });
  await downloadItem.hover();
  await page.waitForTimeout(500);

  // Captura pas 3: ítem de desar visible al drawer
  await page.screenshot({
    path: path.join(IMG_DIR, "view-improvements-step3.png"),
  });
});

test.afterEach(async ({ page }, testInfo) => {
  // Desar el vídeo enregistrat a public/video/news/ si el test ha passat
  if (testInfo.status === "passed") {
    const video = page.video();
    if (video) {
      const destPath = path.join(VIDEO_DIR, "view-improvements-guide.webm");
      try {
        await video.saveAs(destPath);
        console.log(`Vídeo desat a: ${destPath}`);
      } catch (e) {
        console.warn(`No s'ha pogut desar el vídeo: ${e}`);
      }
    }
  }
});
