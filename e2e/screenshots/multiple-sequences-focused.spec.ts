import { test, type Page, type Locator } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

// Directoris de sortida per a imatges i vídeos
const IMG_DIR = path.join(process.cwd(), "public/img/news");
const VIDEO_DIR = path.join(process.cwd(), "public/video/news");
const FIXTURES_DIR = path.join(process.cwd(), "e2e/fixtures/images");

// Cursor SVG (fletxa clàssica negra amb contorn blanc) per fer-lo visible en captures headless
const CURSOR_SVG_DATA_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">' +
    '<path d="M5 2L5 19L9 15L12 22L14 21L11 14L17 14Z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>' +
    "</svg>",
)}`;

// Interfície per als mocks de cerca
interface PictogramMock {
  _id: number;
  keywords: Array<{ type: number; meaning: string }>;
  skin: boolean;
  hair: boolean;
}

// Mocks de la resposta de cerca (ID + metadata per a makeSettingsProperty)
const searchMocks: Record<string, PictogramMock[]> = {
  menjar: [
    { _id: 2349, keywords: [{ type: 2, meaning: "menjar" }], skin: false, hair: false },
  ],
  beure: [
    { _id: 2276, keywords: [{ type: 3, meaning: "beure" }], skin: false, hair: false },
  ],
  dormir: [
    { _id: 2369, keywords: [{ type: 3, meaning: "dormir" }], skin: false, hair: false },
  ],
  correr: [
    { _id: 2719, keywords: [{ type: 3, meaning: "correr" }], skin: false, hair: false },
  ],
  saltar: [
    { _id: 2804, keywords: [{ type: 3, meaning: "saltar" }], skin: false, hair: false },
  ],
  nedar: [
    { _id: 6568, keywords: [{ type: 3, meaning: "nedar" }], skin: false, hair: false },
  ],
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

// Opcions de la captura centrada
interface FocusedOptions {
  // Marge al voltant de l'element protagonista (px). Default 280.
  padding?: number;
  // Override horitzontal del padding (prioritat sobre padding).
  paddingX?: number;
  // Override vertical del padding (prioritat sobre padding).
  paddingY?: number;
  // Desplaçament del cursor respecte al centre de l'element. Default {x:35, y:35}.
  mouseOffset?: { x: number; y: number };
}

// Captura centrada en el protagonista amb cursor visual injectat.
// headless no renderitza el cursor del sistema — s'injecta un div amb l'SVG del cursor.
const focusedScreenshot = async (
  page: Page,
  protagonist: Locator,
  outputPath: string,
  options: FocusedOptions = {},
): Promise<void> => {
  const { padding = 280, mouseOffset = { x: 35, y: 35 } } = options;
  const px = options.paddingX ?? padding;
  const py = options.paddingY ?? padding;

  const box = await protagonist.boundingBox();
  if (!box) throw new Error(`Element no trobat per a la captura: ${outputPath}`);

  const viewport = page.viewportSize()!;

  // Centrar l'element dins del clip
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const clipWidth = Math.min(viewport.width, box.width + px * 2);
  const clipHeight = Math.min(viewport.height, box.height + py * 2);
  const clipX = Math.max(
    0,
    Math.min(centerX - clipWidth / 2, viewport.width - clipWidth),
  );
  const clipY = Math.max(
    0,
    Math.min(centerY - clipHeight / 2, viewport.height - clipHeight),
  );

  // Posició del cursor: aprop però sense cobrir l'element
  const mouseX = Math.min(
    viewport.width - 5,
    Math.max(5, centerX + mouseOffset.x),
  );
  const mouseY = Math.min(
    viewport.height - 5,
    Math.max(5, centerY + mouseOffset.y),
  );

  // Moure el ratolí real activa els estats :hover CSS
  await page.mouse.move(mouseX, mouseY);

  // Injectar div cursor visible (headless no mostra el cursor del sistema)
  await page.evaluate(
    ({
      x,
      y,
      svgUrl,
    }: {
      x: number;
      y: number;
      svgUrl: string;
    }) => {
      document.getElementById("__pw_cursor__")?.remove();
      const el = document.createElement("div");
      el.id = "__pw_cursor__";
      el.style.cssText = [
        "position:fixed",
        `left:${x}px`,
        `top:${y}px`,
        "width:48px",
        "height:48px",
        "z-index:2147483647",
        "pointer-events:none",
        `background-image:url("${svgUrl}")`,
        "background-repeat:no-repeat",
        "background-size:contain",
      ].join(";");
      document.body.appendChild(el);
    },
    { x: mouseX, y: mouseY, svgUrl: CURSOR_SVG_DATA_URL },
  );

  await page.screenshot({
    path: outputPath,
    clip: { x: clipX, y: clipY, width: clipWidth, height: clipHeight },
  });

  // Netejar cursor injectat per no interferir amb interaccions posteriors
  await page.evaluate(() => {
    document.getElementById("__pw_cursor__")?.remove();
  });
};

test.beforeAll(() => {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
});

test(
  "multiple-sequences-focused: captures contextuals centrades en el protagonista",
  async ({ page }) => {
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
    // Protagonista: botó + per afegir nova seqüència
    // =============================================
    await page.goto("/ca/create-sequence");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    // Cercar 3 conceptes per la seqüència 1
    await page.fill("#search", "menjar, beure, dormir");
    await page.press("#search", "Enter");
    // Esperar que apareguin els 3 pictogrames via data-testid del PictogramCard
    await page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid="card-pictogram"]').length >= 3,
      { timeout: 30000 },
    );
    await page.waitForTimeout(1000);

    // Pas 1: target ~680px ample; addBtn ~40px → paddingX=(680-40)/2=320
    const addSeqButton = page.locator('[aria-label="Afegir seqüència"] button');
    await focusedScreenshot(
      page,
      addSeqButton,
      path.join(IMG_DIR, "multiple-sequences-step1.png"),
      { paddingX: 320, paddingY: 300, mouseOffset: { x: 30, y: 30 } },
    );

    // =============================================
    // EDIT PAGE - PAS 2: Afegir seq 2 i navegar
    // Protagonista: pestanya 2 activa (nova pestanya creada)
    // =============================================
    // Clic al botó "Afegir seqüència"
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
      () =>
        document.querySelectorAll('[data-testid="card-pictogram"]').length >= 3,
      { timeout: 30000 },
    );
    await page.waitForTimeout(1000);

    // Pas 2: target ~680px ample; tab2 ~180px → paddingX=(680-180)/2=250
    const tab2 = page.locator("#vertical-tab-1");
    await focusedScreenshot(
      page,
      tab2,
      path.join(IMG_DIR, "multiple-sequences-step2.png"),
      { paddingX: 250, paddingY: 260, mouseOffset: { x: 25, y: 25 } },
    );

    // Coberta carousel: target ~700×320px (ratio card 300×140 a 3-per-fila)
    // tabList vertical de seqüències (aria-orientation="vertical")
    const tabList = page.locator('[role="tablist"][aria-orientation="vertical"]');
    await focusedScreenshot(
      page,
      tabList,
      path.join(IMG_DIR, "multiple-sequences.png"),
      { paddingX: 220, paddingY: 60, mouseOffset: { x: 30, y: 20 } },
    );

    // =============================================
    // VIEW PAGE - PAS 3: Ajustar totes les seqüències
    // Protagonista: slider de mida global
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

    // Pas 3: target ~680px ample; slider ~300px → paddingX=(680-300)/2=190
    await focusedScreenshot(
      page,
      sizeSlider,
      path.join(IMG_DIR, "multiple-sequences-step3.png"),
      { paddingX: 190, paddingY: 280, mouseOffset: { x: -40, y: 35 } },
    );

    // =============================================
    // VIEW PAGE - PAS 4: Ajustar una seqüència sola
    // Protagonista: slider de mida dins l'acordió de seqüència 2
    // =============================================
    // Desactivar el switch "Aplicar a totes"
    await page.getByRole("checkbox", { name: /aplicar a totes/i }).click();
    await page.waitForTimeout(500);

    // Expandir l'acordió de la seqüència 2
    await page
      .getByRole("button", { name: /sequence 2|seqüència 2/i })
      .click();
    await page.waitForTimeout(400);

    // Trobar el slider "Mida" dins l'acordió de Seqüència 2
    const seq2Accordion = page
      .locator(".MuiAccordion-root")
      .filter({
        has: page.getByRole("button", { name: /sequence 2|seqüència 2/i }),
      });
    const seq2SizeSlider = seq2Accordion.getByRole("slider", { name: "Mida" });
    await seq2SizeSlider.waitFor({ state: "visible", timeout: 10000 });

    // El MUI Slider thumb intercepta events de ratolí → usar focus() via JS + teclat
    await seq2SizeSlider.evaluate((el: HTMLElement) => el.focus());
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(600);

    // Pas 4: target ~680px ample; slider ~300px → paddingX=(680-300)/2=190
    await focusedScreenshot(
      page,
      seq2SizeSlider,
      path.join(IMG_DIR, "multiple-sequences-step4.png"),
      { paddingX: 190, paddingY: 280, mouseOffset: { x: -40, y: 35 } },
    );
  },
);

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
