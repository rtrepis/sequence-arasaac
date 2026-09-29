import { test, type Page } from "@playwright/test";
import {
  DEVICE_SCALE,
  gotoEditor,
  mockArasaac,
  postShot,
  searchWord,
  wordsFor,
  type ShotLocale,
} from "./linkedinShot";

// Captures per a publicacions de LinkedIn, en castellà i anglès. Reprodueixen
// els passos de cinc notícies de Novetats però no en sobreescriuen cap
// imatge: es desen a `e2e/linkedin/img/<idioma>/`.

// Noms accessibles de cada idioma (els mateixos de `languages/*.json`)
const LABELS: Record<
  ShotLocale,
  {
    addEmpty: string;
    statusFab: RegExp;
    moreActions: string;
    mainMenu: string;
    settings: string;
    theme: string;
    addSequence: string;
    deleteLast: string;
    suggestion: string;
  }
> = {
  es: {
    addEmpty: "Añadir pictograma vacío",
    statusFab: /Dónde se guarda el trabajo/,
    moreActions: "Más acciones",
    mainMenu: "Menú principal",
    settings: "Configuración",
    theme: "Selecciona el tema",
    addSequence: "Añadir secuencia",
    deleteLast: "Eliminar la última secuencia",
    suggestion: "casa",
  },
  en: {
    addEmpty: "Add pictogram empty",
    statusFab: /Where your work is saved/,
    moreActions: "More actions",
    mainMenu: "Main menu",
    settings: "Settings",
    theme: "Select theme",
    addSequence: "Add sequence",
    deleteLast: "Delete last sequence",
    suggestion: "house",
  },
};

const LOCALES: ShotLocale[] = ["es", "en"];

test.use({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: DEVICE_SCALE });

for (const locale of LOCALES) {
  const labels = LABELS[locale];
  const [firstWord, secondWord, thirdWord] = wordsFor(locale);

  test.describe(`linkedin ${locale}`, () => {
    test.beforeEach(async ({ page }) => {
      await mockArasaac(page, locale);
    });

    test("autosave-draft-step2", async ({ page, browser }) => {
      await gotoEditor(page, locale, labels.addEmpty, 0);
      await searchWord(page, firstWord);
      await searchWord(page, secondWord);
      await searchWord(page, thirdWord);
      // Que marxin els avisos de «pictogrames afegits»
      await page.waitForTimeout(6000);

      const fab = page.getByRole("button", { name: labels.statusFab });
      await fab.waitFor({ state: "visible", timeout: 15000 });
      await fab.click();
      await page.waitForTimeout(800);
      // Retall ajustat al panell i al botó, que queden al racó de baix
      await postShot(browser, page, fab, locale, "autosave-draft-step2.png", {
        width: 440,
        height: 400,
      });
    });

    test("pictogram-actions-touch-step2", async ({ page, browser }) => {
      await gotoEditor(page, locale, labels.addEmpty, 0);
      await searchWord(page, firstWord);
      await page.waitForTimeout(4000);

      await page.locator("button:has(.MuiCard-root)").first().click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor({ state: "visible", timeout: 15000 });
      await page.waitForTimeout(800);

      await dialog.getByRole("button", { name: labels.moreActions }).click();
      const popover = page.locator(".MuiPopover-paper");
      await popover.waitFor({ state: "visible", timeout: 10000 });
      await page.waitForTimeout(500);
      // El diàleg sencer amb el menú obert a sobre
      const dialogPaper = page.locator(".MuiDialog-paper");
      await postShot(browser, page, dialogPaper, locale, "pictogram-actions-touch-step2.png", {
        width: 620,
        height: 560,
      });
    });

    test("search-suggestions-step1", async ({ page, browser }) => {
      await page.goto(`/${locale}/create-sequence`, { waitUntil: "domcontentloaded" });
      const search = page.locator("#search");
      await search.waitFor({ state: "visible", timeout: 20000 });
      await page.waitForTimeout(1500);

      await search.click();
      await search.type(labels.suggestion, { delay: 120 });
      const listbox = page.getByRole("listbox");
      await listbox.waitFor({ state: "visible", timeout: 10000 });
      await page.waitForTimeout(800);

      // Centrat entre el camp i la llista, perquè hi surtin tots dos
      const firstOption = page.getByRole("option").first();
      await firstOption.hover();
      await postShot(browser, page, listbox, locale, "search-suggestions-step1.png", {
        width: 640,
        height: 420,
      });
    });

    test("user-preferences-step1", async ({ page, browser }) => {
      const openSettings = async (target: Page) => {
        await target.getByRole("button", { name: labels.mainMenu }).click();
        await target.getByRole("button", { name: labels.settings }).click();
        await target.getByRole("dialog").waitFor({ state: "visible", timeout: 15000 });
        await target.waitForTimeout(1200);
      };

      // Finestra més estreta: el diàleg ocupa tota l'amplada, i a 1280 px les
      // files d'ajustos quedaven petites al mig d'una franja buida
      await page.setViewportSize({ width: 960, height: 800 });
      await gotoEditor(page, locale, labels.addEmpty, 0);
      await searchWord(page, firstWord);
      await page.waitForTimeout(4000);
      await openSettings(page);

      // L'idioma d'interfície arrenca en «en» encara que la URL digui un altre
      // idioma (B23 del backlog): es marca el que s'hi llegeix
      await page.getByRole("button", { name: locale, exact: true }).click();
      await page.waitForTimeout(1500);
      if (!(await page.getByRole("dialog").isVisible())) await openSettings(page);

      // L'idioma de cerca també arrenca en anglès: es posa el de la captura
      await page.locator("#languagesSearch").click();
      await page.locator(`li[data-value="${locale}"]`).click();
      // El ratolí es queda a sobre d'un botó i en surt el tooltip: s'aparta
      // a la zona buida de l'esquerra del diàleg
      await page.mouse.move(100, 500);
      await page.waitForTimeout(800);

      await page
        .getByRole("group", { name: labels.theme })
        .waitFor({ state: "visible", timeout: 15000 });
      const dialog = page.getByRole("dialog");
      // Només la part de dalt: sota les files d'ajustos el diàleg és buit
      await postShot(
        browser,
        page,
        page.locator(".MuiDialog-paper"),
        locale,
        "user-preferences-step1.png",
        { width: 700, height: 680 },
        "top",
      );
    });

    test("safe-delete-step1", async ({ page, browser }) => {
      await page.goto(`/${locale}/create-sequence`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);
      await searchWord(page, firstWord);
      await page.waitForTimeout(800);

      // Una segona seqüència amb contingut, perquè la confirmació en compti
      await page.getByRole("button", { name: labels.addSequence }).click();
      await page.waitForTimeout(500);
      await searchWord(page, secondWord);
      await page.waitForTimeout(800);

      await page.getByRole("button", { name: labels.deleteLast }).click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor({ state: "visible", timeout: 15000 });
      await page.waitForTimeout(600);
      await postShot(
        browser,
        page,
        page.locator(".MuiDialog-paper"),
        locale,
        "safe-delete-step1.png",
        { width: 480, height: 320 },
      );
    });
  });
}
