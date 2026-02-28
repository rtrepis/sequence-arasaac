import { test, type Page, type Locator } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

// Directoris de sortida per a imatges i vídeos
const IMG_DIR = path.join(process.cwd(), "public/img/news");
const VIDEO_DIR = path.join(process.cwd(), "public/video/news");

// Cursor SVG (fletxa clàssica negra amb contorn blanc) per fer-lo visible en captures headless
const CURSOR_SVG_DATA_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">' +
    '<path d="M5 2L5 19L9 15L12 22L14 21L11 14L17 14Z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>' +
    "</svg>",
)}`;

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
  "logo-menu-focused: captures contextuals centrades en el protagonista",
  async ({ page }) => {
    // Interceptar crides a l'API d'ARASAAC per evitar dependències de xarxa
    await page.route("**/api.arasaac.org/**", async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      if (/\/api\/keywords\//.test(pathname)) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ words: [] }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Navegar a la pàgina d'edició
    await page.goto("/ca/create-sequence");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Obrir el drawer de navegació principal (LogoMenu)
    const menuBtn = page.getByRole("button", { name: /Menú principal/i });
    await menuBtn.waitFor({ state: "visible", timeout: 10000 });
    await menuBtn.click();
    await page.waitForTimeout(600);

    // =============================================
    // COBERTA + PAS 1: Secció de navegació
    // Protagonista: llista de navegació (Inici, Novetats, Edita, Previsualitza)
    // Nota: Inici i Novetats rendeixen com <a> (Link component), no com button
    // =============================================

    // Esperar que el drawer estigui obert comprovant el link d'Inici
    const iniciaLink = page.getByRole("link", { name: "Inici" });
    await iniciaLink.waitFor({ state: "visible", timeout: 10000 });

    const navList = page.locator("ul").filter({
      has: page.getByRole("link", { name: "Inici" }),
    });

    // Coberta carousel: target ~700×320px (ratio card 300×140 a 3-per-fila en 1280px)
    // navList ~260px ample, ~200px alt → paddingX=(700-260)/2=220, paddingY=(320-200)/2=60
    await focusedScreenshot(
      page,
      navList,
      path.join(IMG_DIR, "logo-menu.png"),
      { paddingX: 220, paddingY: 60, mouseOffset: { x: 30, y: 20 } },
    );

    // Pas 1: target ~680px ample (contingut article NewsDetailPage)
    // navList ~260px ample → paddingX=(680-260)/2=210
    await focusedScreenshot(
      page,
      navList,
      path.join(IMG_DIR, "logo-menu-step1.png"),
      { paddingX: 210, paddingY: 190, mouseOffset: { x: 30, y: 20 } },
    );

    // =============================================
    // PAS 2: Secció de fitxers (Descarrega + Carrega)
    // Protagonista: llista amb els botons Descarrega i Carrega
    // =============================================
    const fileList = page.locator("ul").filter({
      has: page.getByRole("button", { name: /Descarrega/i }),
    });
    await fileList.waitFor({ state: "visible", timeout: 10000 });

    // Pas 2: target ~680px ample → paddingX=210
    await focusedScreenshot(
      page,
      fileList,
      path.join(IMG_DIR, "logo-menu-step2.png"),
      { paddingX: 210, paddingY: 230, mouseOffset: { x: 30, y: 20 } },
    );

    // =============================================
    // PAS 3: Configuració + Selector d'idioma
    // Protagonista: selector d'idioma — paddingY generós per incloure el botó
    // de Configuració per sobre
    // =============================================
    // ButtonGroup amb aria-label "Idioma" que conté els botons ca/es/en
    const langSelector = page
      .locator("button", { hasText: "ca" })
      .locator("xpath=../..");
    await langSelector.waitFor({ state: "visible", timeout: 10000 });

    // Pas 3: target ~680px ample → paddingX=210
    await focusedScreenshot(
      page,
      langSelector,
      path.join(IMG_DIR, "logo-menu-step3.png"),
      { paddingX: 210, paddingY: 220, mouseOffset: { x: 30, y: -20 } },
    );
  },
);

test.afterEach(async ({ page }, testInfo) => {
  // Desar el vídeo enregistrat a public/video/news/ si el test ha passat
  if (testInfo.status === "passed") {
    const video = page.video();
    if (video) {
      const destPath = path.join(VIDEO_DIR, "logo-menu-guide.webm");
      try {
        await video.saveAs(destPath);
        console.log(`Vídeo desat a: ${destPath}`);
      } catch (e) {
        console.warn(`No s'ha pogut desar el vídeo: ${e}`);
      }
    }
  }
});
