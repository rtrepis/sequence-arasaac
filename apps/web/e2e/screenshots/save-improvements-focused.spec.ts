import { test, type Page, type Locator } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

// Directoris de sortida per a imatges i vídeos
const IMG_DIR = path.join(process.cwd(), "public/img/news");
const VIDEO_DIR = path.join(process.cwd(), "public/video/news");
const FIXTURES_DIR = path.join(process.cwd(), "e2e/fixtures/images");

// Generador del cursor SVG (fletxa clàssica negra amb contorn blanc).
// cursorSize permet usar-lo més gran per al pas 1.
const makeCursorSvgUrl = (size: number): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">` +
      '<path d="M5 2L5 19L9 15L12 22L14 21L11 14L17 14Z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>' +
      "</svg>",
  )}`;

// Cursor estàndard (24px) i gran (48px) per al pas 1
const CURSOR_SVG_DATA_URL = makeCursorSvgUrl(24);
const CURSOR_SVG_LARGE_URL = makeCursorSvgUrl(48);

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
  // URL del cursor SVG a injectar. Default: cursor estàndard 24px.
  cursorUrl?: string;
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
    { x: mouseX, y: mouseY, svgUrl: cursorUrl },
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
  "save-improvements-focused: captures contextuals centrades en el protagonista",
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

    // =============================================
    // PAS 1 + COBERTA: Botó de pujar imatge pròpia
    // Protagonista: botó d'upload dins PictogramSearch (a dins de PictEditModal)
    // L'usuari veu el logo de SequenciAAC com a imatge del pictograma.
    // =============================================

    // Clicar al pictograma per obrir el diàleg d'edició
    const pictCard = page.locator('[data-testid="card-pictogram"]').first();
    await pictCard.click();
    await page.waitForTimeout(800);

    // Esperar que el Dialog estigui obert
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 10000 });

    // Pujar el logo de SequenciAAC (favicon.png) com a imatge del pictograma.
    // setInputFiles dispara el handleImageChange que converteix a base64.
    const fileInput = dialog.locator('input[type="file"][accept="image/*"]');
    await fileInput.setInputFiles(
      path.join(process.cwd(), "public/favicon.png"),
    );
    await page.waitForTimeout(800);

    // Localitzar el botó d'upload per aria-label.
    // L'atribut aria-label directe evita ambigüitat amb l'<input> intern.
    const uploadBtn = page
      .locator('[aria-label="Pujar imatge des del dispositiu"]')
      .first();
    await uploadBtn.waitFor({ state: "visible", timeout: 10000 });

    // Coberta carousel: target 700×320px (ratio card 300×140 a 3-per-fila en 1280px)
    // uploadBtn ~38×38px → paddingX=(700-38)/2=331, paddingY=(320-38)/2=141
    await focusedScreenshot(
      page,
      uploadBtn,
      path.join(IMG_DIR, "save-improvements.png"),
      {
        paddingX: 331,
        paddingY: 141,
        mouseOffset: { x: 0, y: 0 },
        cursorUrl: CURSOR_SVG_LARGE_URL,
      },
    );

    // Pas 1: target ~680px ample; uploadBtn ~38px → paddingX=(680-38)/2=321
    await focusedScreenshot(
      page,
      uploadBtn,
      path.join(IMG_DIR, "save-improvements-step1.png"),
      {
        paddingX: 321,
        paddingY: 252,
        mouseOffset: { x: 0, y: 0 },
        cursorUrl: CURSOR_SVG_LARGE_URL,
      },
    );

    // Tancar el diàleg d'edició (botó Desa = últim botó contained del dialog)
    const closeBtn = page.getByRole("button", { name: /Desa|Tanca|Close/i }).last();
    await closeBtn.click();
    await page.waitForTimeout(500);

    // =============================================
    // PAS 2: Diàleg de guardar el fitxer
    // Protagonista: el dialog sencer (checkboxes + nom)
    // =============================================

    // Obrir el drawer de navegació principal (LogoMenu)
    const menuBtn = page.getByRole("button", { name: /Menú principal/i });
    await menuBtn.waitFor({ state: "visible", timeout: 10000 });
    await menuBtn.click();
    await page.waitForTimeout(600);

    // Clicar el botó de descàrrega dins el drawer
    const downloadBtn = page.getByRole("button", { name: /Descarrega/i });
    await downloadBtn.waitFor({ state: "visible", timeout: 10000 });
    await downloadBtn.click();
    await page.waitForTimeout(800);

    // Esperar que el dialog de descàrrega estigui obert
    const saveDialog = page.getByRole("dialog");
    await saveDialog.waitFor({ state: "visible", timeout: 10000 });

    // Pas 2: crop ~700×560 centrat en el dialog de guardar
    await focusedScreenshot(
      page,
      saveDialog,
      path.join(IMG_DIR, "save-improvements-step2.png"),
      { paddingX: 122, paddingY: 125, mouseOffset: { x: 20, y: 20 } },
    );

    // Tancar el dialog de guardar
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // =============================================
    // PAS 3: Controls de mida i espaiat a la pàgina de vista
    // Protagonista: Accordion amb els sliders de sizePict i pictSpaceBetween
    // =============================================

    // Navegar a la pàgina de vista mantenint l'estat Redux
    await page.getByRole("tab", { name: /Vista/i }).click();

    // Esperar que el slider de mida sigui visible (indica que la pàgina ha carregat)
    const sizeSlider = page.getByRole("slider", { name: /Mida/i });
    await sizeSlider.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(1000);

    // L'acordió obert per defecte conté els sliders i botons d'alineació
    const accordion = page
      .locator(".MuiAccordionDetails-root")
      .filter({ has: page.getByRole("slider", { name: /Mida/i }) });
    await accordion.waitFor({ state: "visible", timeout: 10000 });

    // Pas 3: crop ~700×560 centrat en l'acordió de configuració
    await focusedScreenshot(
      page,
      accordion,
      path.join(IMG_DIR, "save-improvements-step3.png"),
      { paddingX: 200, paddingY: 168, mouseOffset: { x: 20, y: 20 } },
    );
  },
);

test.afterEach(async ({ page }, testInfo) => {
  // Desar el vídeo enregistrat a public/video/news/ si el test ha passat
  if (testInfo.status === "passed") {
    const video = page.video();
    if (video) {
      const destPath = path.join(VIDEO_DIR, "save-improvements-guide.webm");
      try {
        await video.saveAs(destPath);
        console.log(`Vídeo desat a: ${destPath}`);
      } catch (e) {
        console.warn(`No s'ha pogut desar el vídeo: ${e}`);
      }
    }
  }
});
