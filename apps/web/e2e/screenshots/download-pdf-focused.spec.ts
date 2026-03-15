import { test, type Page, type Locator } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

// Directoris de sortida per a imatges i vídeos
const IMG_DIR = path.join(process.cwd(), "public/img/news");
const VIDEO_DIR = path.join(process.cwd(), "public/video/news");
const FIXTURES_DIR = path.join(process.cwd(), "e2e/fixtures/images");

// Cursor estàndard (48px)
const CURSOR_SVG_DATA_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">' +
    '<path d="M5 2L5 19L9 15L12 22L14 21L11 14L17 14Z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>' +
    "</svg>",
)}`;

// Cursor destacat per a covers: 60px amb cercle groc semi-transparent al punt actiu
const CURSOR_SVG_HIGHLIGHT_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24">' +
    '<circle cx="5" cy="2" r="6" fill="rgba(255,220,0,0.5)"/>' +
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

// Mocks de la resposta de cerca
const searchMocks: Record<string, PictogramMock[]> = {
  menjar: [
    {
      _id: 2349,
      keywords: [{ type: 2, meaning: "menjar" }],
      skin: false,
      hair: false,
    },
  ],
};

// Mapa ID → fitxer de fixture PNG local
const imageFixtures: Record<number, string> = {
  2349: path.join(FIXTURES_DIR, "menjar.png"),
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
  // URL del cursor SVG a injectar. Default: cursor estàndard 48px.
  cursorUrl?: string;
  // Mida del div cursor (px). Default 48.
  cursorSize?: number;
}

// Captura centrada en el protagonista amb cursor visual injectat.
// headless no renderitza el cursor del sistema — s'injecta un div amb l'SVG del cursor.
const focusedScreenshot = async (
  page: Page,
  protagonist: Locator,
  outputPath: string,
  options: FocusedOptions = {},
): Promise<void> => {
  const {
    padding = 280,
    mouseOffset = { x: 35, y: 35 },
    cursorUrl = CURSOR_SVG_DATA_URL,
    cursorSize = 48,
  } = options;
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
      size,
    }: {
      x: number;
      y: number;
      svgUrl: string;
      size: number;
    }) => {
      document.getElementById("__pw_cursor__")?.remove();
      const el = document.createElement("div");
      el.id = "__pw_cursor__";
      el.style.cssText = [
        "position:fixed",
        `left:${x}px`,
        `top:${y}px`,
        `width:${size}px`,
        `height:${size}px`,
        "z-index:2147483647",
        "pointer-events:none",
        `background-image:url("${svgUrl}")`,
        "background-repeat:no-repeat",
        "background-size:contain",
      ].join(";");
      document.body.appendChild(el);
    },
    { x: mouseX, y: mouseY, svgUrl: cursorUrl, size: cursorSize },
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
  "download-pdf-focused: captures contextuals centrades en el botó de descàrrega PDF",
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

      // Configuració: GET /api/pictograms/{locale}/{id}
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

      // Imatge: GET /api/pictograms/{id}
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
    // EDIT PAGE: Afegir un pictograma a la seqüència
    // =============================================
    await page.goto("/ca/create-sequence");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    await page.fill("#search", "menjar");
    await page.press("#search", "Enter");
    await page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid="card-pictogram"]').length >= 1,
      { timeout: 30000 },
    );
    await page.waitForTimeout(1000);

    // Navegar a la pàgina de vista mantenint l'estat Redux
    await page.getByRole("tab", { name: /Vista/i }).click();

    // =============================================
    // VIEW PAGE - PAS 1 + COBERTA: Botó de descàrrega PDF
    // Protagonista: botó "download pdf" (aria-label="download pdf")
    // =============================================
    const pdfBtn = page.locator('[aria-label="download pdf"]');
    await pdfBtn.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(500);

    // Coberta carousel: target ~700×290px (ratio ~2.4:1 apaïsada)
    // pdfBtn ~46×46px → paddingX=(700-46)/2=327, paddingY=(290-46)/2=122
    await focusedScreenshot(
      page,
      pdfBtn,
      path.join(IMG_DIR, "download-pdf.png"),
      {
        paddingX: 327,
        paddingY: 122,
        mouseOffset: { x: 0, y: 0 },
        cursorUrl: CURSOR_SVG_HIGHLIGHT_URL,
        cursorSize: 60,
      },
    );

    // Pas 1: target ~700×560px
    // paddingX=327, paddingY=(560-46)/2=257
    await focusedScreenshot(
      page,
      pdfBtn,
      path.join(IMG_DIR, "download-pdf-step1.png"),
      {
        paddingX: 327,
        paddingY: 257,
        mouseOffset: { x: 0, y: 0 },
      },
    );

    // =============================================
    // VIEW PAGE - PAS 2: Vista prèvia de la seqüència
    // Protagonista: contenidor de previsualització (.preview-container)
    // =============================================
    const previewContainer = page.locator(".preview-container");
    await previewContainer.waitFor({ state: "visible", timeout: 10000 });

    // Pas 2: target ~700×560px
    // previewContainer té dimensions visuals (escala reduïda): ~500px ample, ~400px alt
    // paddingX=(700-500)/2=100, paddingY=(560-400)/2=80
    await focusedScreenshot(
      page,
      previewContainer,
      path.join(IMG_DIR, "download-pdf-step2.png"),
      {
        paddingX: 100,
        paddingY: 80,
        mouseOffset: { x: 30, y: 30 },
      },
    );
  },
);

test.afterEach(async ({ page }, testInfo) => {
  // Desar el vídeo enregistrat a public/video/news/ si el test ha passat
  if (testInfo.status === "passed") {
    const video = page.video();
    if (video) {
      const destPath = path.join(VIDEO_DIR, "download-pdf-guide.webm");
      try {
        await video.saveAs(destPath);
        console.log(`Vídeo desat a: ${destPath}`);
      } catch (e) {
        console.warn(`No s'ha pogut desar el vídeo: ${e}`);
      }
    }
  }
});
