import { type Page, type Locator, type Browser } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { appBackgrounds, appPalette } from "../../src/style/palette";

// Utillatge de les captures per a LinkedIn.
//
// Viu apart de `screenshots/newsShot.ts` a propòsit: les imatges de Novetats
// tenen mides fixades pel carrusel i no s'han de tocar. Aquestes surten en
// castellà i anglès, en format quadrat de publicació, i es desen fora de
// `public/` perquè no formen part de l'app.

export type ShotLocale = "es" | "en";

export const OUT_DIR = path.join(process.cwd(), "e2e/linkedin/img");
const FIXTURES_DIR = path.join(process.cwd(), "e2e/fixtures/images");

// Format de publicació de LinkedIn: quadrat 1:1, que el feed mostra sencer
// tant a l'ordinador com al mòbil
export const POST = { width: 1200, height: 1200 };
// Marge entre la captura i la vora del quadrat
const POST_MARGIN = 90;

// Densitat de la captura: al doble perquè, un cop encabida al quadrat, la
// interfície no quedi borrosa
export const DEVICE_SCALE = 2;

interface PictogramMock {
  _id: number;
  keywords: Array<{ type: number; meaning: string }>;
  skin: boolean;
  hair: boolean;
}

// Paraules de cada idioma associades a les imatges de fixture del repositori
const WORDS: Record<ShotLocale, Array<[string, number, string]>> = {
  es: [
    ["comer", 2349, "menjar"],
    ["beber", 6042, "beure"],
    ["dormir", 6479, "dormir"],
  ],
  en: [
    ["eat", 2349, "menjar"],
    ["drink", 6042, "beure"],
    ["sleep", 6479, "dormir"],
  ],
};

// Suggeriments del cercador: paraules que comencen per la de la captura,
// perquè el desplegable surti ple
const SUGGESTIONS: Record<ShotLocale, string[]> = {
  es: [
    "casa",
    "casa adosada",
    "casa de campo",
    "casa de muñecas",
    "casa del árbol",
    "casa rural",
    "casada",
    "casado",
    "casamiento",
    "casarse",
  ],
  en: [
    "house",
    "house of cards",
    "houseboat",
    "housefly",
    "household",
    "housekeeper",
    "houseplant",
    "housewife",
    "housework",
  ],
};

/** Serveix ARASAAC des del repositori, amb les paraules de l'idioma */
export const mockArasaac = async (
  page: Page,
  locale: ShotLocale,
): Promise<void> => {
  const words = WORDS[locale];
  const searchMocks: Record<string, PictogramMock[]> = Object.fromEntries(
    words.map(([word, id]) => [
      word,
      [{ _id: id, keywords: [{ type: 2, meaning: word }], skin: false, hair: false }],
    ]),
  );
  const imageFixtures: Record<number, string> = Object.fromEntries(
    words.map(([, id, fixture]) => [id, path.join(FIXTURES_DIR, `${fixture}.png`)]),
  );
  const keywords = [...words.map(([word]) => word), ...SUGGESTIONS[locale]];

  // Les fonts de Google se serveixen buides: la captura no les ha d'esperar
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );

  await page.route("**/api.arasaac.org/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (/\/api\/keywords\//.test(pathname)) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ words: keywords }),
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

/** Paraules de cerca de l'idioma, en l'ordre de les fixtures */
export const wordsFor = (locale: ShotLocale): string[] =>
  WORDS[locale].map(([word]) => word);

/**
 * Retalla la zona centrada en el protagonista i l'encabeix en un quadrat de
 * publicació, sobre el gris verdós de la paleta.
 */
export const postShot = async (
  browser: Browser,
  page: Page,
  protagonist: Locator,
  locale: ShotLocale,
  fileName: string,
  crop: { width: number; height: number },
  // «top» arrenca el retall a dalt del protagonista, per als diàlegs alts
  // que tenen el contingut concentrat a la part de dalt
  align: "center" | "top" = "center",
): Promise<void> => {
  const box = await protagonist.boundingBox();
  if (!box) throw new Error(`Element no trobat per a la captura: ${fileName}`);

  const viewport = page.viewportSize()!;
  const centerX = box.x + box.width / 2;
  const clipWidth = Math.min(viewport.width, Math.max(crop.width, box.width));
  const clipHeight = Math.min(
    viewport.height,
    align === "top" ? crop.height : Math.max(crop.height, box.height),
  );
  const centerY =
    align === "top" ? box.y + clipHeight / 2 : box.y + box.height / 2;
  const clipX = Math.max(0, Math.min(centerX - clipWidth / 2, viewport.width - clipWidth));
  const clipY = Math.max(0, Math.min(centerY - clipHeight / 2, viewport.height - clipHeight));

  const raw = await page.screenshot({
    clip: { x: clipX, y: clipY, width: clipWidth, height: clipHeight },
  });

  // La captura s'escala a la mida màxima que hi cap amb el marge
  const scale = Math.min(
    (POST.width - POST_MARGIN * 2) / clipWidth,
    (POST.height - POST_MARGIN * 2) / clipHeight,
  );

  const frame = await browser.newPage({
    viewport: POST,
    deviceScaleFactor: 1,
  });
  await frame.setContent(`
    <html>
      <body style="margin:0;width:${POST.width}px;height:${POST.height}px;
        display:flex;align-items:center;justify-content:center;
        background:${appPalette.secondary.light};">
        <img src="data:image/png;base64,${raw.toString("base64")}"
          style="width:${Math.round(clipWidth * scale)}px;
            height:${Math.round(clipHeight * scale)}px;
            border-radius:16px;
            border:6px solid ${appPalette.primary.main};
            background:${appBackgrounds.light.default};" />
      </body>
    </html>
  `);
  await frame.locator("img").evaluate((image: HTMLImageElement) => image.decode());

  const dir = path.join(OUT_DIR, locale);
  fs.mkdirSync(dir, { recursive: true });
  await frame.screenshot({ path: path.join(dir, fileName) });
  await frame.close();
};

/** Obre l'editor de l'idioma amb `amount` pictogrames buits */
export const gotoEditor = async (
  page: Page,
  locale: ShotLocale,
  addLabel: string,
  amount: number,
): Promise<void> => {
  await page.goto(`/${locale}/create-sequence`, { waitUntil: "domcontentloaded" });
  const add = page.getByRole("button", { name: addLabel });
  await add.waitFor({ state: "visible", timeout: 30000 });
  for (let index = 0; index < amount; index++) await add.click();
};

/** Cerca una paraula i espera que el pictograma aparegui a la seqüència */
export const searchWord = async (page: Page, word: string): Promise<void> => {
  await page.fill("#search", word);
  // Es tanca la llista de suggeriments perquè l'Enter enviï el formulari
  await page.press("#search", "Escape");
  await page.press("#search", "Enter");
  await page.waitForFunction(
    () =>
      document.querySelectorAll('[data-testid="card-pictogram"]').length >= 1,
    { timeout: 30000 },
  );
};
