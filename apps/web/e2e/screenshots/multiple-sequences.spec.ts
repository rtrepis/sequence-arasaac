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
  correr: [{ _id: 2719, keywords: [{ type: 3, meaning: "correr" }], skin: false, hair: false }],
  saltar: [{ _id: 2804, keywords: [{ type: 3, meaning: "saltar" }], skin: false, hair: false }],
  nedar: [{ _id: 6568, keywords: [{ type: 3, meaning: "nedar" }], skin: false, hair: false }],
};

// Mapa ID → fitxer de fixture PNG local
const imageFixtures: Record<number, string> = {
  2349: path.join(FIXTURES_DIR, "menjar.png"),
  2276: path.join(FIXTURES_DIR, "beure.png"),
  2369: path.join(FIXTURES_DIR, "dormir.png"),
  2719: path.join(FIXTURES_DIR, "correr.png"),
  2804: path.join(FIXTURES_DIR, "saltar.png"),
  6568: path.join(FIXTURES_DIR, "nedar.png"),
};

test.beforeAll(() => {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
});

test("multiple-sequences: captures i vídeo per la guia de novetats", async ({
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
      const id = parseInt(settingsMatch[1]);
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
      const id = parseInt(imageMatch[1]);
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
  // EDIT PAGE - PAS 1: Cercar pictogrames a seq 1
  // =============================================
  await page.goto("/ca/create-sequence");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);

  // Cercar 3 conceptes per la seqüència 1
  await page.fill("#search", "menjar, beure, dormir");
  await page.press("#search", "Enter");
  // Esperar que apareguin els 3 pictogrames via data-testid del PictogramCard
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="card-pictogram"]').length >= 3,
    { timeout: 30000 },
  );
  await page.waitForTimeout(1000);

  // Captura pas 1: seqüència 1 plena + botó + visible → també és la portada
  await page.screenshot({
    path: path.join(IMG_DIR, "multiple-sequences-step1.png"),
  });
  await page.screenshot({
    path: path.join(IMG_DIR, "multiple-sequences.png"),
  });

  // =============================================
  // EDIT PAGE - PAS 2: Afegir seq 2 i navegar
  // =============================================
  // Clic al botó "Afegir seqüència" (MUI Tooltip posa aria-label al span wrapper)
  await page.locator('[aria-label="Afegir seqüència"] button').click();
  await page.waitForTimeout(500);

  // Navegar a la tab 2 (#vertical-tab-1)
  await page.click("#vertical-tab-1");
  await page.waitForTimeout(500);

  // Cercar pictogrames per la seqüència 2
  await page.fill("#search", "correr, saltar, nedar");
  await page.press("#search", "Enter");
  // El TabPanel mostra només la seq activa → esperar ≥3 pictogrames de la seq 2
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="card-pictogram"]').length >= 3,
    { timeout: 30000 },
  );
  await page.waitForTimeout(1000);

  // Captura pas 2: seqüència 2 activa amb 2 pestanyes visibles
  await page.screenshot({
    path: path.join(IMG_DIR, "multiple-sequences-step2.png"),
  });

  // =============================================
  // VIEW PAGE - PAS 3: Ajustar totes les seqüències
  // =============================================
  // Navegar a Vista via React Router (manté l'estat Redux de les seqüències)
  await page.getByRole("tab", { name: /Vista/i }).click();
  // Esperar que el slider "Mida" sigui visible i estable (acordió expandit per defecte)
  const sizeSlider = page.getByRole("slider", { name: "Mida" });
  await sizeSlider.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(600);

  // applyAll=true per defecte → un sol acordió visible
  // El MUI Slider thumb intercepta events de ratolí → usar focus() via JS + teclat
  await sizeSlider.evaluate((el: HTMLElement) => el.focus());
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(500);

  // Captura pas 3: view amb totes les seqüències augmentades globalment
  await page.screenshot({
    path: path.join(IMG_DIR, "multiple-sequences-step3.png"),
  });

  // =============================================
  // VIEW PAGE - PAS 4: Ajustar una seqüència sola
  // =============================================
  // Desactivar el switch "Apply to all" / "Aplicar tots" (el component usa clau sense traducció ca)
  await page.getByRole("checkbox", { name: /apply.*(all|tots)/i }).click();
  await page.waitForTimeout(500);

  // Expandir l'acordió de la seqüència 2 (label: "Sequence 2" o "Seqüència 2")
  await page.getByRole("button", { name: /sequence 2|seqüència 2/i }).click();
  await page.waitForTimeout(400);

  // Trobar el slider "Mida" dins l'acordió de Seqüència 2
  const seq2Accordion = page
    .locator(".MuiAccordion-root")
    .filter({ has: page.getByRole("button", { name: /sequence 2|seqüència 2/i }) });
  const seq2SizeSlider = seq2Accordion.getByRole("slider", { name: "Mida" });
  await seq2SizeSlider.waitFor({ state: "visible", timeout: 10000 });

  // El MUI Slider thumb intercepta events de ratolí → usar focus() via JS + teclat
  await seq2SizeSlider.evaluate((el: HTMLElement) => el.focus());
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(600);

  // Captura pas 4: view amb la seqüència 2 ajustada individualment
  await page.screenshot({
    path: path.join(IMG_DIR, "multiple-sequences-step4.png"),
  });
});

test.afterEach(async ({ page }, testInfo) => {
  // Desar el vídeo enregistrat a public/video/news/ si el test ha passat
  if (testInfo.status === "passed") {
    const video = page.video();
    if (video) {
      const destPath = path.join(
        VIDEO_DIR,
        "multiple-sequences-guide.webm",
      );
      try {
        await video.saveAs(destPath);
        console.log(`Vídeo desat a: ${destPath}`);
      } catch (e) {
        console.warn(`No s'ha pogut desar el vídeo: ${e}`);
      }
    }
  }
});
