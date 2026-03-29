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
// Cursor destacat per a covers: 60px amb cercle groc semi-transparent al punt actiu
const CURSOR_SVG_HIGHLIGHT_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24">' +
    '<circle cx="5" cy="2" r="6" fill="rgba(255,220,0,0.5)"/>' +
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
  // URL del cursor SVG a injectar. Default: CURSOR_SVG_DATA_URL.
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
  const { padding = 280, mouseOffset = { x: 35, y: 35 }, cursorUrl = CURSOR_SVG_DATA_URL, cursorSize = 48 } = options;
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
  "new-languages-focused: captures contextuals centrades en el selector d'idioma",
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

    // Esperar que el drawer estigui obert comprovant el link d'Inici
    const iniciaLink = page.getByRole("link", { name: "Inici" });
    await iniciaLink.waitFor({ state: "visible", timeout: 10000 });

    // Localitzar el FormControl del selector d'idioma (Select MUI amb aria-labelledby)
    // El Select de MUI renderitza un div[aria-labelledby="lang-select-label"]
    const langFormControl = page
      .locator('[aria-labelledby="lang-select-label"]')
      .locator("xpath=../..");

    await langFormControl.waitFor({ state: "visible", timeout: 10000 });

    // =============================================
    // COBERTA: drawer + selector d'idioma visible
    // Protagonista: FormControl idioma (~240px ample × ~56px alt)
    // Target coberta: ~700×290px (ratio ~2.4:1)
    // paddingX=(700-240)/2=230, paddingY=(290-56)/2=117
    // =============================================
    await focusedScreenshot(
      page,
      langFormControl,
      path.join(IMG_DIR, "new-languages.png"),
      { paddingX: 230, paddingY: 117, mouseOffset: { x: 30, y: 10 }, cursorUrl: CURSOR_SVG_HIGHLIGHT_URL, cursorSize: 60 },
    );

    // =============================================
    // PAS 1: Drawer obert amb selector d'idioma visible
    // Protagonista: FormControl idioma
    // Target step: ~700×560px
    // paddingX=230, paddingY=(560-56)/2=252
    // =============================================
    await focusedScreenshot(
      page,
      langFormControl,
      path.join(IMG_DIR, "new-languages-step1.png"),
      { paddingX: 230, paddingY: 252, mouseOffset: { x: 30, y: 10 } },
    );

    // =============================================
    // PAS 2: Select obert mostrant els 5 idiomes
    // Clic al combobox per desplegar les opcions
    // =============================================
    const langCombobox = page.getByRole("combobox");
    await langCombobox.click();
    await page.waitForTimeout(400);

    // Protagonista: el listbox desplegable (Paper de MUI)
    const listbox = page.getByRole("listbox");
    await listbox.waitFor({ state: "visible", timeout: 5000 });

    // Target step: ~700×560px (~240px ample × ~210px alt per 5 opcions)
    // paddingX=230, paddingY=(560-210)/2=175
    await focusedScreenshot(
      page,
      listbox,
      path.join(IMG_DIR, "new-languages-step2.png"),
      { paddingX: 230, paddingY: 175, mouseOffset: { x: 30, y: 10 } },
    );

    // =============================================
    // PAS 3: Seleccionar Français i mostrar la UI actualitzada
    // Clic a l'opció Français → navega a /fr/create-sequence
    // =============================================
    const frOption = page.getByRole("option", { name: "Français" });
    await frOption.click();
    await page.waitForTimeout(1200);

    // Re-obrir el drawer (ara en fr)
    const menuBtnFr = page.getByRole("button", { name: /Menu principal|Menú principal|Main menu/i });
    await menuBtnFr.waitFor({ state: "visible", timeout: 10000 });
    await menuBtnFr.click();
    await page.waitForTimeout(600);

    // Re-localitzar el FormControl (ara mostra "Français" seleccionat)
    const langFormControlFr = page
      .locator('[aria-labelledby="lang-select-label"]')
      .locator("xpath=../..");
    await langFormControlFr.waitFor({ state: "visible", timeout: 10000 });

    // Target step: ~700×560px
    await focusedScreenshot(
      page,
      langFormControlFr,
      path.join(IMG_DIR, "new-languages-step3.png"),
      { paddingX: 230, paddingY: 252, mouseOffset: { x: 30, y: 10 } },
    );
  },
);

test.afterEach(async ({ page }, testInfo) => {
  // Desar el vídeo enregistrat a public/video/news/ si el test ha passat
  if (testInfo.status === "passed") {
    const video = page.video();
    if (video) {
      const destPath = path.join(VIDEO_DIR, "new-languages-guide.webm");
      try {
        await video.saveAs(destPath);
        console.log(`Vídeo desat a: ${destPath}`);
      } catch (e) {
        console.warn(`No s'ha pogut desar el vídeo: ${e}`);
      }
    }
  }
});
