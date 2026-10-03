import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { IMG_DIR, mockArasaac, serveGoogleFonts, shot } from "./newsShot";
import {
  STRUCTURE_LABELS,
  documentStructureHtml,
} from "./templates/documentStructure";

// Captures de la notícia «documents-everywhere» (el nou model de document),
// una tanda per idioma: cada versió de la notícia ensenya l'app en el seu
// idioma. Es fan amb un document de demostració fix, sense dades personals, i
// els noms dels botons es llegeixen dels fitxers de traducció.
//
// Executar amb el servidor de desenvolupament engegat:
//   npx playwright test e2e/screenshots/documents-everywhere-focused.spec.ts

const LOCALES = ["ca", "es", "en", "fr", "it"] as const;
type Locale = (typeof LOCALES)[number];

const NEWS_DIR = "documents-everywhere";
const FIXTURES = path.join(process.cwd(), "test/fixtures/saac");

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

// Una rutina del matí amb els sis pictogrames que el repositori serveix sense
// xarxa (`newsShot.ts`), en l'idioma de cada captura
const ROUTINE: Record<Locale, string[]> = {
  ca: ["dormir", "menjar", "beure", "córrer", "saltar", "nedar"],
  es: ["dormir", "comer", "beber", "correr", "saltar", "nadar"],
  en: ["sleep", "eat", "drink", "run", "jump", "swim"],
  fr: ["dormir", "manger", "boire", "courir", "sauter", "nager"],
  it: ["dormire", "mangiare", "bere", "correre", "saltare", "nuotare"],
};
const IDS = [6479, 2349, 6042, 6009, 7061, 8028];
/** El pictograma personalitzat: el segon, amb la vora vermella */
const CUSTOMIZED = 1;

/**
 * Un document desat amb una versió anterior de l'app: així la mateixa tanda
 * ensenya l'avís dels documents antics. Un pictograma porta una vora d'un
 * altre color, que és un canvi propi.
 */
const demoDocument = (locale: Locale): string => {
  const card = (color: string, size: number) => ({
    fontSize: 1,
    textPosition: "bottom",
    borderIn: { color: "fitzgerald", radius: 20, size: 2 },
    borderOut: { color, radius: 20, size },
  });
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
    settings: index === CUSTOMIZED ? card("#D32F2F", 5) : card("#999999", 2),
    cross: false,
  }));
  return JSON.stringify({
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

const openMenu = async (page: Page, locale: Locale): Promise<void> => {
  await page
    .getByRole("button", {
      name: t(locale, "components.logoMenu.menuAriaLabel"),
    })
    .click();
};

/** Obre un fitxer pel selector de «Carrega» */
const loadFile = async (
  page: Page,
  locale: Locale,
  file: string,
): Promise<void> => {
  await openMenu(page, locale);
  // El selector és dins del menú: s'hi posa el fitxer quan ja hi és
  const input = page.locator('input[type="file"]').first();
  await input.waitFor({ state: "attached" });
  await page.keyboard.press("Escape");
  await input.setInputFiles(file);
};

for (const locale of LOCALES) {
  test(`documents-everywhere (${locale}): captures de la notícia`, async ({
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

    // 1. L'avís del document antic
    // Fora de la carpeta del test: el seu nom porta accents («notícia»), i
    // amb una ruta així el selector de fitxers no rebia el fitxer
    const demo = path.join(os.tmpdir(), `sequenciaac-rutina-${locale}.saac`);
    fs.writeFileSync(demo, demoDocument(locale));
    await loadFile(page, locale, demo);
    const notice = page.getByRole("status").filter({
      hasText: t(locale, "features.sequence.style.notice.legacy"),
    });
    await expect(notice).toBeVisible();
    const cards = page.locator("button:has(.MuiCard-root)");
    await expect(cards).toHaveCount(ROUTINE[locale].length);
    await expect(page.getByTestId("customized-mark")).toHaveCount(1);
    await waitNoSnackbar(page);
    await shot(page, notice, out(locale, "avis-antic"), {
      size: { width: 1100, height: 150 },
      noCursor: true,
    });

    // 2. La graella, amb la marca només al pictograma personalitzat
    const customized = cards.nth(CUSTOMIZED);
    await shot(page, customized, out(locale, "marca-graella"), {
      size: { width: 760, height: 300 },
      noCursor: true,
    });

    // 3. El menú del pictograma, amb «Restableix l'estil»
    await customized.click({ button: "right" });
    const reset = page.getByRole("button", {
      name: t(locale, "components.mouseActionList.resetStyle"),
    });
    await expect(reset).toBeVisible();
    await page.waitForTimeout(400);
    await shot(
      page,
      page.locator(".MuiPopover-paper"),
      out(locale, "menu-restableix"),
      {
        size: { width: 700, height: 560 },
        // A la dreta de l'opció, sense tapar-ne el text
        mouseOffset: { x: 150, y: 4 },
      },
    );
    await page.keyboard.press("Escape");
    await expect(reset).toBeHidden();

    // 4. La finestra d'edició, amb «Restableix» a la capçalera de l'estil
    await customized.click();
    const editDialog = page.getByRole("dialog");
    await expect(
      page
        .getByTestId("setting-accordion-header")
        .getByRole("button", {
          name: /Restableix|Restablecer|Reset|Réinitialiser|Ripristina/,
        }),
    ).toBeVisible();
    await page.waitForTimeout(600);
    await shot(page, editDialog, out(locale, "estil-pictograma"), {
      size: { width: 700, height: 560 },
      noCursor: true,
    });
    await page.keyboard.press("Escape");
    await expect(editDialog).toBeHidden();

    // 5. Desar, amb el quadre «Què es guarda en un document?»
    await openMenu(page, locale);
    await page
      .getByRole("button", {
        name: t(locale, "components.appNavigationDrawer.download"),
      })
      .click();
    const saveDialog = page.getByRole("dialog", {
      name: t(locale, "components.buttonWithModalDownload.dialogTitle"),
    });
    await expect(saveDialog).toBeVisible();
    await page.waitForTimeout(600);
    await shot(page, saveDialog, out(locale, "desar"), {
      size: { width: 700, height: 560 },
      noCursor: true,
    });
    await page.keyboard.press("Escape");
    await expect(saveDialog).toBeHidden();

    // 6. Un fitxer d'estil obert des de «Carrega»
    await loadFile(
      page,
      locale,
      path.join(FIXTURES, "09-esquema-2-estil.saacstyle"),
    );
    const styleDialog = page.getByRole("dialog", {
      name: t(locale, "features.sequence.style.styleFileOpened.title"),
    });
    await expect(styleDialog).toBeVisible();
    await page.waitForTimeout(600);
    await shot(page, styleDialog, out(locale, "fitxer-estil"), {
      size: { width: 700, height: 360 },
      noCursor: true,
    });
    await page.keyboard.press("Escape");

    // 7. El dibuix de «Com està pensat un document», i la portada
    const labels = STRUCTURE_LABELS[locale];
    await page.setViewportSize({ width: 900, height: 620 });
    await page.setContent(documentStructureHtml(labels));
    await page
      .locator("#structure")
      .screenshot({ path: path.join(IMG_DIR, out(locale, "estructura")) });
    await page.setViewportSize({ width: 700, height: 290 });
    await page.setContent(documentStructureHtml(labels, { wide: true }));
    await page.screenshot({ path: path.join(IMG_DIR, out(locale, "portada")) });
  });
}
