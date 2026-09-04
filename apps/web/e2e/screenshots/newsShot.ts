import { type Page, type Locator } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

// Utillatge compartit de les captures de Novetats.
//
// Els specs anteriors en portaven una còpia cadascun. Amb sis notícies noves
// això serien sis còpies més del mateix mock d'ARASAAC i de la mateixa funció
// de captura, i qualsevol canvi de l'API s'hauria d'anar a buscar a dotze
// llocs. Els specs antics no s'hi migren: no és el que s'ha demanat i cadascun
// porta ajustos propis de posició.

export const IMG_DIR = path.join(process.cwd(), "public/img/news");
const FIXTURES_DIR = path.join(process.cwd(), "e2e/fixtures/images");

// Mides de destinació, les mateixes que van fixar les notícies existents:
// la coberta del carrusel és apaïsada i el pas de detall, gairebé quadrat.
export const COVER = { width: 700, height: 290 };
export const STEP = { width: 700, height: 560 };

// Cursor estàndard (48px). En headless no es renderitza el cursor del sistema,
// així que s'injecta un div amb aquest SVG.
const CURSOR_SVG_DATA_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">' +
    '<path d="M5 2L5 19L9 15L12 22L14 21L11 14L17 14Z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>' +
    "</svg>",
)}`;

// Cursor destacat per a cobertes: 60px amb cercle groc al punt actiu
const CURSOR_SVG_HIGHLIGHT_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24">' +
    '<circle cx="5" cy="2" r="6" fill="rgba(255,220,0,0.5)"/>' +
    '<path d="M5 2L5 19L9 15L12 22L14 21L11 14L17 14Z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>' +
    "</svg>",
)}`;

interface PictogramMock {
  _id: number;
  keywords: Array<{ type: number; meaning: string }>;
  skin: boolean;
  hair: boolean;
}

// Les sis paraules que tenen fixture d'imatge al repositori
const WORDS: Array<[string, number]> = [
  ["menjar", 2349],
  ["beure", 6042],
  ["dormir", 6479],
  ["córrer", 6009],
  ["nedar", 8028],
  ["saltar", 7061],
];

const searchMocks: Record<string, PictogramMock[]> = Object.fromEntries(
  WORDS.map(([word, id]) => [
    word,
    [{ _id: id, keywords: [{ type: 2, meaning: word }], skin: false, hair: false }],
  ]),
);

const imageFixtures: Record<number, string> = Object.fromEntries(
  WORDS.map(([word, id]) => [
    id,
    path.join(FIXTURES_DIR, `${word === "córrer" ? "correr" : word}.png`),
  ]),
);

// Paraules que retorna l'endpoint de keywords: són les que alimenten els
// suggeriments del cercador, i sense elles l'Autocomplete no obre mai.
const KEYWORDS = WORDS.map(([word]) => word);

/**
 * Serveix ARASAAC des del repositori: així les captures no depenen de la
 * xarxa ni canvien de pictograma quan ARASAAC en reordena els resultats.
 */
export const mockArasaac = async (page: Page): Promise<void> => {
  // Les fonts de Google se serveixen buides: la captura no ha d'esperar
  // dotzenes de famílies tipogràfiques que aquí no es jutgen.
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );

  await page.route("**/api.arasaac.org/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (/\/api\/keywords\//.test(pathname)) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ words: KEYWORDS }),
      });
    }

    const searchMatch = pathname.match(/\/pictograms\/\w+\/bestsearch\/(.+)/);
    if (searchMatch) {
      const word = decodeURIComponent(searchMatch[1]);
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(searchMocks[word] ?? []),
      });
    }

    const settingsMatch = pathname.match(/\/pictograms\/[a-z]+\/(\d+)$/);
    if (settingsMatch) {
      const found = Object.values(searchMocks)
        .flat()
        .find((pictogram) => pictogram._id === parseInt(settingsMatch[1]));
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          found ?? { keywords: [{ type: 2 }], skin: false, hair: false },
        ),
      });
    }

    const imageMatch = pathname.match(/\/pictograms\/(\d+)$/);
    if (imageMatch) {
      const fixturePath = imageFixtures[parseInt(imageMatch[1])];
      if (fixturePath && fs.existsSync(fixturePath)) {
        return route.fulfill({
          status: 200,
          contentType: "image/png",
          body: fs.readFileSync(fixturePath),
        });
      }
    }

    await route.continue();
  });
};

interface ShotOptions {
  // Mida de destinació de la captura
  size?: { width: number; height: number };
  // Desplaçament del cursor respecte al centre del protagonista
  mouseOffset?: { x: number; y: number };
  // Cursor destacat (cercle groc), per a les cobertes
  highlight?: boolean;
  // No dibuixar cap cursor: per a captures on el protagonista és un panell
  noCursor?: boolean;
}

/**
 * Captura centrada en el protagonista, amb el cursor injectat.
 * El clip es calcula des de la mida de destinació, no d'un padding fix: així
 * totes les cobertes surten a la mateixa proporció i el carrusel no salta.
 */
export const shot = async (
  page: Page,
  protagonist: Locator,
  fileName: string,
  options: ShotOptions = {},
): Promise<void> => {
  const {
    size = STEP,
    mouseOffset = { x: 35, y: 35 },
    highlight = false,
    noCursor = false,
  } = options;

  const box = await protagonist.boundingBox();
  if (!box) throw new Error(`Element no trobat per a la captura: ${fileName}`);

  const viewport = page.viewportSize()!;
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  const clipWidth = Math.min(viewport.width, Math.max(size.width, box.width));
  const clipHeight = Math.min(viewport.height, Math.max(size.height, box.height));
  const clipX = Math.max(
    0,
    Math.min(centerX - clipWidth / 2, viewport.width - clipWidth),
  );
  const clipY = Math.max(
    0,
    Math.min(centerY - clipHeight / 2, viewport.height - clipHeight),
  );

  if (!noCursor) {
    const mouseX = Math.min(
      viewport.width - 5,
      Math.max(5, centerX + mouseOffset.x),
    );
    const mouseY = Math.min(
      viewport.height - 5,
      Math.max(5, centerY + mouseOffset.y),
    );

    // Moure el ratolí de debò activa els estats :hover del CSS
    await page.mouse.move(mouseX, mouseY);

    await page.evaluate(
      ({ x, y, svgUrl, size: cursorSize }) => {
        document.getElementById("__pw_cursor__")?.remove();
        const element = document.createElement("div");
        element.id = "__pw_cursor__";
        element.style.cssText = [
          "position:fixed",
          `left:${x}px`,
          `top:${y}px`,
          `width:${cursorSize}px`,
          `height:${cursorSize}px`,
          "z-index:2147483647",
          "pointer-events:none",
          `background-image:url("${svgUrl}")`,
          "background-repeat:no-repeat",
          "background-size:contain",
        ].join(";");
        document.body.appendChild(element);
      },
      {
        x: mouseX,
        y: mouseY,
        svgUrl: highlight ? CURSOR_SVG_HIGHLIGHT_URL : CURSOR_SVG_DATA_URL,
        size: highlight ? 60 : 48,
      },
    );
  }

  await page.screenshot({
    path: path.join(IMG_DIR, fileName),
    clip: { x: clipX, y: clipY, width: clipWidth, height: clipHeight },
  });

  await page.evaluate(() => {
    document.getElementById("__pw_cursor__")?.remove();
  });
};

/** Obre l'editor amb `amount` pictogrames buits */
export const gotoEditor = async (
  page: Page,
  amount: number,
): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  const add = page.getByRole("button", { name: "Afegir pictograma buit" });
  await add.waitFor({ state: "visible", timeout: 30000 });
  for (let index = 0; index < amount; index++) await add.click();
};

/** Cerca una paraula i espera que el pictograma aparegui a la seqüència */
export const searchWord = async (page: Page, word: string): Promise<void> => {
  await page.fill("#search", word);
  // Amb suggeriments a la vista, l'Autocomplete porta `autoHighlight`: l'Enter
  // acceptaria l'opció marcada en comptes d'enviar el formulari, i la cerca no
  // sortiria mai. Es tanca la llista abans de prémer-lo.
  await page.press("#search", "Escape");
  await page.press("#search", "Enter");
  await page.waitForFunction(
    () =>
      document.querySelectorAll('[data-testid="card-pictogram"]').length >= 1,
    { timeout: 30000 },
  );
};

export const ensureImgDir = (): void => {
  fs.mkdirSync(IMG_DIR, { recursive: true });
};
