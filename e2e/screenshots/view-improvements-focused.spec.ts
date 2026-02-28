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
};

// Mapa ID → fitxer de fixture PNG local
const imageFixtures: Record<number, string> = {
  2349: path.join(FIXTURES_DIR, "menjar.png"),
  2276: path.join(FIXTURES_DIR, "beure.png"),
  2369: path.join(FIXTURES_DIR, "dormir.png"),
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
  "view-improvements-focused: captures contextuals centrades en el protagonista",
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
    // EDIT PAGE: Afegir pictogrames a la seqüència
    // =============================================
    await page.goto("/ca/create-sequence");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    await page.fill("#search", "menjar, beure, dormir");
    await page.press("#search", "Enter");
    await page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid="card-pictogram"]').length >= 3,
      { timeout: 30000 },
    );
    await page.waitForTimeout(1000);

    // Navegar a Vista via React Router (manté l'estat Redux de les seqüències)
    await page.getByRole("tab", { name: /Vista/i }).click();

    // =============================================
    // VIEW PAGE - PAS 1: Previsualització = Impressió
    // Protagonista: contenidor de previsualització (.preview-container)
    // =============================================
    const previewContainer = page.locator(".preview-container");
    await previewContainer.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(1000);

    // Coberta carousel: target ~700×320px (ratio card 300×140 a 3-per-fila)
    // previewContainer ~260px ample, ~200px alt → paddingX=(700-260)/2=220, paddingY=(320-200)/2=60
    await focusedScreenshot(
      page,
      previewContainer,
      path.join(IMG_DIR, "view-improvements.png"),
      { paddingX: 220, paddingY: 60, mouseOffset: { x: 30, y: 30 } },
    );

    // Pas 1: target ~680px ample; previewContainer ~320px → paddingX=(680-320)/2=180
    await focusedScreenshot(
      page,
      previewContainer,
      path.join(IMG_DIR, "view-improvements-step1.png"),
      { paddingX: 180, paddingY: 280, mouseOffset: { x: 30, y: 30 } },
    );

    // =============================================
    // VIEW PAGE - PAS 2: Controls d'alineació i direcció
    // Protagonista: grup de botons d'alineació (ToggleButtonGroup)
    // =============================================
    // L'acordió és obert per defecte amb una sola seqüència
    const sizeSlider = page.getByRole("slider", { name: "Mida" });
    await sizeSlider.waitFor({ state: "visible", timeout: 10000 });
    await page.waitForTimeout(500);

    // El ToggleButtonGroup d'alineació conté els botons left/center/right
    const alignmentGroup = page
      .getByRole("group")
      .filter({ has: page.locator('[aria-label="left"]') });
    await alignmentGroup.waitFor({ state: "visible", timeout: 10000 });

    // Pas 2: target ~680px ample; alignmentGroup ~120px → paddingX=(680-120)/2=280
    await focusedScreenshot(
      page,
      alignmentGroup,
      path.join(IMG_DIR, "view-improvements-step2.png"),
      { paddingX: 280, paddingY: 280, mouseOffset: { x: 30, y: 30 } },
    );

    // =============================================
    // VIEW PAGE - PAS 3: Botó de desar la seqüència
    // Protagonista: ítem de descàrrega dins el drawer de navegació
    // =============================================
    // Obrir el drawer de navegació principal (LogoMenu)
    const menuBtn = page.getByRole("button", { name: /Menú principal/i });
    await menuBtn.waitFor({ state: "visible", timeout: 10000 });
    await menuBtn.click();
    await page.waitForTimeout(600);

    // Trobar l'ítem de descàrrega dins el drawer
    const downloadItem = page.getByRole("button", { name: /Descarrega/i });
    await downloadItem.waitFor({ state: "visible", timeout: 10000 });

    // Pas 3: target ~680px ample; downloadItem ~270px → paddingX=(680-270)/2=205
    await focusedScreenshot(
      page,
      downloadItem,
      path.join(IMG_DIR, "view-improvements-step3.png"),
      { paddingX: 205, paddingY: 40, mouseOffset: { x: 25, y: 15 } },
    );
  },
);

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
