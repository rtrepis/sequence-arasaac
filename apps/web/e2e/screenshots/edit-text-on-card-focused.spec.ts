import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  COVER,
  IMG_DIR,
  STEP,
  mockArasaac,
  serveGoogleFonts,
  shot,
} from "./newsShot";

// Captures de la notícia «edit-text-on-card» (el text del pictograma s'edita
// damunt de la targeta), una tanda per idioma: cada versió de la notícia
// ensenya l'app en el seu idioma. Es fan amb un document de demostració fix,
// sense dades personals, i els noms dels botons es llegeixen dels fitxers de
// traducció.
//
// Executar amb el servidor de desenvolupament engegat:
//   npx playwright test e2e/screenshots/edit-text-on-card-focused.spec.ts

const LOCALES = ["ca", "es", "en", "fr", "it"] as const;
type Locale = (typeof LOCALES)[number];

const NEWS_DIR = "edit-text-on-card";

const messages = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "languages", `${locale}.json`),
        "utf8",
      ),
    ) as Record<string, { defaultMessage: string }>,
  ]),
) as Record<Locale, Record<string, { defaultMessage: string }>>;

/** El text real de l'app, en aquest idioma */
const t = (locale: Locale, key: string): string =>
  messages[locale][key].defaultMessage;

// Una rutina amb els sis pictogrames que el repositori serveix sense xarxa
// (`newsShot.ts`), en l'idioma de cada captura
const ROUTINE: Record<Locale, string[]> = {
  ca: ["dormir", "menjar", "beure", "córrer", "saltar", "nedar"],
  es: ["dormir", "comer", "beber", "correr", "saltar", "nadar"],
  en: ["sleep", "eat", "drink", "run", "jump", "swim"],
  fr: ["dormir", "manger", "boire", "courir", "sauter", "nager"],
  it: ["dormire", "mangiare", "bere", "correre", "saltare", "nuotare"],
};
const IDS = [6479, 2349, 6042, 6009, 7061, 8028];
/** El pictograma que es reescriu: el segon, «menjar» */
const EDITED = 1;
/** Les captures de la graella: la fila de targetes, sense el buit de sota */
const ROW = { width: 700, height: 300 };
/** El text nou que s'hi escriu */
const NEW_TEXT: Record<Locale, string> = {
  ca: "esmorzar",
  es: "desayunar",
  en: "breakfast",
  fr: "petit-déjeuner",
  it: "colazione",
};

/** El document de demostració: la rutina, amb el text a sota de cada targeta */
const demoDocument = (locale: Locale): string => {
  const content = ROUTINE[locale].map((word, index) => ({
    indexSequence: index,
    img: {
      searched: { word, bestIdPicts: [IDS[index]] },
      selectedId: IDS[index],
      settings: {
        fitzgerald: "#4CAf50",
        skin: "white",
        hair: "brown",
        color: true,
      },
    },
    settings: {
      fontSize: 1,
      textPosition: "bottom",
      borderIn: { color: "fitzgerald", radius: 20, size: 2 },
      borderOut: { color: "#999999", radius: 20, size: 2 },
    },
    cross: false,
  }));
  return JSON.stringify({
    schemaVersion: 2,
    documentState: {
      id: "demo-document-news",
      content: { 0: content },
      viewSettings: {
        0: {
          sizePict: 0.9,
          pictSpaceBetween: 1,
          alignmentH: "left",
          alignmentV: "top",
        },
      },
      activeSAAC: 0,
    },
  });
};

const out = (locale: Locale, name: string): string =>
  `${NEWS_DIR}/${locale}/${name}.png`;

/** Espera que marxin els avisos flotants, que taparien les captures */
const waitNoSnackbar = async (page: Page): Promise<void> => {
  await expect(page.locator(".MuiSnackbar-root")).toHaveCount(0, {
    timeout: 15000,
  });
};

/** Obre el document de demostració pel selector de «Carrega» */
const loadDemo = async (page: Page, locale: Locale): Promise<void> => {
  // Fora de la carpeta del test: amb accents a la ruta, el selector de
  // fitxers no rebia el fitxer
  const file = path.join(os.tmpdir(), `sequenciaac-text-${locale}.saac`);
  fs.writeFileSync(file, demoDocument(locale));
  await page
    .getByRole("button", {
      name: t(locale, "components.logoMenu.menuAriaLabel"),
    })
    .click();
  const input = page.locator('input[type="file"]').first();
  await input.waitFor({ state: "attached" });
  await page.keyboard.press("Escape");
  await input.setInputFiles(file);
};

for (const locale of LOCALES) {
  test(`edit-text-on-card (${locale}): captures de la notícia`, async ({
    page,
  }) => {
    fs.mkdirSync(path.join(IMG_DIR, NEWS_DIR, locale), { recursive: true });
    await page.setViewportSize({ width: 1280, height: 800 });
    await mockArasaac(page);
    await serveGoogleFonts(page);
    await page.goto(`/${locale}/create-sequence`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    await loadDemo(page, locale);
    const cards = page.locator("button:has(.MuiCard-root)");
    await expect(cards).toHaveCount(ROUTINE[locale].length);
    await waitNoSnackbar(page);
    const card = cards.nth(EDITED);
    const input = page.getByRole("textbox", {
      name: t(locale, "components.pictEdit.cardTextInput").replace(
        "{number}",
        String(EDITED + 1),
      ),
    });

    // 1. El menú del pictograma, amb «Edita el text»
    await card.click({ button: "right" });
    const editText = page.getByRole("button", {
      name: t(locale, "components.mouseActionList.editText"),
    });
    await expect(editText).toBeVisible();
    await page.waitForTimeout(400);
    const menu = page.locator(".MuiPopover-paper");
    const menuBox = await menu.boundingBox();
    const optionBox = await editText.boundingBox();
    if (!menuBox || !optionBox) throw new Error("Menú no trobat");
    await shot(page, menu, out(locale, "menu"), {
      size: STEP,
      // Damunt de «Edita el text», a la dreta del seu nom
      mouseOffset: {
        x: optionBox.x + optionBox.width * 0.75 - (menuBox.x + menuBox.width / 2),
        y: optionBox.y + optionBox.height / 2 - (menuBox.y + menuBox.height / 2),
      },
    });
    // Clicar l'opció deixaria el cursor damunt la targeta: es tanca el menú
    await page.keyboard.press("Escape");
    await expect(editText).toBeHidden();

    // 2. Clicar el text de la targeta: surt el camp, i s'hi escriu el text nou
    await card.getByText(ROUTINE[locale][EDITED], { exact: true }).click();
    await expect(input).toBeFocused();
    await input.pressSequentially(NEW_TEXT[locale]);
    await page.waitForTimeout(300);
    const inputBox = await input.boundingBox();
    const cardBox = await card.boundingBox();
    if (!inputBox || !cardBox) throw new Error("Targeta no trobada");
    await shot(page, card, out(locale, "escriure"), {
      size: ROW,
      // El cursor, a la dreta del camp i sense tapar-ne el text
      mouseOffset: {
        x: cardBox.width / 2 - 10,
        y: inputBox.y + inputBox.height / 2 - (cardBox.y + cardBox.height / 2),
      },
    });

    // 3. La portada: la mateixa escena, apaïsada, amb la fila sencera
    await shot(page, cards.nth(2), out(locale, "portada"), {
      size: COVER,
      noCursor: true,
    });

    // 4. Retorn desa: la targeta ja diu el text nou
    await page.keyboard.press("Enter");
    await expect(input).toHaveCount(0);
    await expect(card.getByText(NEW_TEXT[locale], { exact: true })).toBeVisible();
    await page.mouse.move(5, 790);
    await page.waitForTimeout(300);
    await shot(page, card, out(locale, "desat"), {
      size: ROW,
      noCursor: true,
    });
  });
}
