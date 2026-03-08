import { test, type Page, type Locator } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

// Directoris de sortida per a imatges
const IMG_DIR = path.join(process.cwd(), "public/img/news");

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
});

test(
  "number-font-focused: captures del panell de configuració de font dels números",
  async ({ page }) => {
    // =============================================
    // Navegar a la pàgina d'edició i obrir el menú
    // =============================================
    await page.goto("/ca/create-sequence");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Obrir el menú principal (logo)
    await page.getByRole("button", { name: /Menú principal/i }).click();
    await page.waitForTimeout(600);

    // Clic a Configuració al drawer
    await page.getByRole("button", { name: /^Configuració$/i }).click();
    await page.waitForTimeout(600);

    // Esperar que el diàleg de configuració sigui visible
    await page.getByRole("dialog").waitFor({ state: "visible" });
    await page.waitForTimeout(500);

    // =============================================
    // PAS 1: Switch de Numeració (desactivat)
    // Protagonista: el span clicable del switch (aria-label="Numeració")
    // Nota: MUI Switch posa l'aria-label al span MuiButtonBase, no a l'input interior
    // =============================================
    const numberedSwitch = page.locator('[aria-label="Numeració"]');
    await numberedSwitch.waitFor({ state: "visible" });

    // Assegurar que el switch és desactivat (si estava activat, desactivar-lo)
    const isChecked = await numberedSwitch.locator("input").isChecked();
    if (isChecked) {
      await numberedSwitch.click();
      await page.waitForTimeout(400);
    }

    // Pas 1: target ~680px ample; switch ~38px → paddingX=(680-38)/2=321
    await focusedScreenshot(
      page,
      numberedSwitch,
      path.join(IMG_DIR, "number-font-step1.png"),
      { paddingX: 321, paddingY: 80, mouseOffset: { x: 40, y: 20 } },
    );

    // =============================================
    // PAS 2: Activar el switch de Numeració
    // Protagonista: el span clicable del switch (activat)
    // =============================================
    await numberedSwitch.click();
    await page.waitForTimeout(500);

    // Pas 2: ídem pas 1
    await focusedScreenshot(
      page,
      numberedSwitch,
      path.join(IMG_DIR, "number-font-step2.png"),
      { paddingX: 321, paddingY: 80, mouseOffset: { x: 40, y: 20 } },
    );

    // =============================================
    // PAS 3: Nova secció Font dels números
    // Protagonista: el heading "Font dels números" (element compacte)
    // Evitar el <li> sencer que és ample com tot el diàleg (~1260px)
    // =============================================
    const fontGroupHeading = page.getByText("Font dels números");
    await fontGroupHeading.waitFor({ state: "visible" });
    await page.waitForTimeout(300);

    // Pas 3: target ~680px ample; heading ~200px → paddingX=(680-200)/2=240
    await focusedScreenshot(
      page,
      fontGroupHeading,
      path.join(IMG_DIR, "number-font-step3.png"),
      { paddingX: 240, paddingY: 100, mouseOffset: { x: 40, y: 30 } },
    );

    // =============================================
    // COBERTA CAROUSEL — target 700×320px
    // ratio card 300×140 a 3-per-fila (1280px viewport) → ratio 2.14:1
    // Switch ~38×38px → paddingX=(700-38)/2=331, paddingY=(320-38)/2=141
    // =============================================
    await focusedScreenshot(
      page,
      numberedSwitch,
      path.join(IMG_DIR, "number-font.png"),
      { paddingX: 331, paddingY: 141, mouseOffset: { x: 40, y: 20 } },
    );
  },
);
