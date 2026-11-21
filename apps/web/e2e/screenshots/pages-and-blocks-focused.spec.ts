import { test, expect, type Locator, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  COVER,
  IMG_DIR,
  STEP,
  mockArasaac,
  serveGoogleFonts,
  shot,
} from "./newsShot";
import {
  LOCALES,
  type Locale,
  gotoView,
  openDemo,
  t,
  withUnplaced,
  word,
} from "./demoDocument";

// Captures de la notícia «pages-and-blocks» (N-1 de `docs/plans/PLA-noticies.md`):
// les pàgines i la seva disposició, les plantilles, els blocs i els rètols.
// Una tanda per idioma, sobre el document de demostració (fixture 19) amb una
// seqüència sense col·locar.
//
// Executar amb el servidor de desenvolupament engegat:
//   npx playwright test e2e/screenshots/pages-and-blocks-focused.spec.ts

const NEWS_DIR = "pages-and-blocks";

// El paper per defecte surt de la regió del navegador
test.use({ locale: "ca-ES", viewport: { width: 1280, height: 900 } });

const out = (locale: Locale, name: string): string =>
  `${NEWS_DIR}/${locale}/${name}.png`;

/** El desplaçament del cursor des del centre de `from` fins a `to`. */
const offsetTo = async (
  from: Locator,
  to: Locator,
  dx = 0,
  dy = 0,
): Promise<{ x: number; y: number }> => {
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  if (!a || !b) throw new Error("Element no trobat per al cursor");
  return {
    x: b.x + Math.min(b.width / 2, 60) + dx - (a.x + a.width / 2),
    y: b.y + b.height / 2 + dy - (a.y + a.height / 2),
  };
};

/** Posa la pàgina `index` a dalt de tot de la finestra. */
const scrollToPage = async (page: Page, index: number): Promise<void> => {
  await page
    .locator(`#view-page-${index}`)
    .evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(300);
};

const pageMenu = (page: Page, locale: Locale, index: number): Locator =>
  page
    .getByRole("button", { name: t(locale, "features.freeLayout.page.moreActions") })
    .nth(index);

/** Tria una disposició al menú «⋯» de la pàgina */
const chooseDisposition = async (
  page: Page,
  locale: Locale,
  key: string,
): Promise<void> => {
  await pageMenu(page, locale, 0).click();
  await page
    .locator(".MuiMenu-paper")
    .getByText(t(locale, key), { exact: true })
    .click();
  await expect(page.locator(".MuiMenu-paper")).toBeHidden();
  await page.waitForTimeout(600);
};

for (const locale of LOCALES) {
  test(`pages-and-blocks (${locale}): captures de la notícia`, async ({
    page,
  }) => {
    fs.mkdirSync(path.join(IMG_DIR, NEWS_DIR, locale), { recursive: true });
    await mockArasaac(page);
    await serveGoogleFonts(page);
    await openDemo(page, locale, withUnplaced);
    await gotoView(page);
    await page
      .getByRole("button", { name: t(locale, "features.sequence.style.notice.close") })
      .click();
    await page.waitForTimeout(400);

    // 6b. «Sense col·locar», a la columna: la seqüència que no és a cap pàgina
    const putOnPage = page.getByRole("button", {
      name: t(locale, "features.freeLayout.levels.putOnPageLabel")
        .replace("{name}", word(locale, "Nit"))
        .replace("{number}", "1"),
    });
    await expect(putOnPage).toBeVisible();
    await shot(page, putOnPage, out(locale, "sense-collocar"), {
      size: { width: 700, height: 420 },
      mouseOffset: { x: 10, y: 6 },
    });

    // 1. El menú «⋯» de la pàgina, amb la disposició a dalt
    await pageMenu(page, locale, 0).click();
    const menu = page.locator(".MuiMenu-paper");
    await expect(menu).toBeVisible();
    await page.waitForTimeout(400);
    await shot(page, menu, out(locale, "menu-pagina"), {
      size: STEP,
      mouseOffset: await offsetTo(
        menu,
        menu.getByText(t(locale, "features.freeLayout.page.modeColumns"), {
          exact: true,
        }),
        110,
      ),
    });
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();

    // 2. La mateixa pàgina en columnes, en files i lliure
    await scrollToPage(page, 0);
    const firstSheet = page.locator("#view-page-frame-0");
    for (const [key, name] of [
      ["features.freeLayout.page.modeColumns", "columnes"],
      ["features.freeLayout.page.modeRows", "files"],
      ["features.freeLayout.page.modeFree", "lliure"],
    ] as const) {
      await chooseDisposition(page, locale, key);
      if (name === "lliure") {
        // A la lliure, cada bloc va on el poses: el segon, cap a la dreta
        await page.locator("#view-page-0 .placement").nth(1).click();
        for (let step = 0; step < 4; step++)
          await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(400);
      }
      await shot(page, firstSheet, out(locale, name), {
        size: { width: 900, height: 640 },
        noCursor: true,
      });
    }

    // 3. Les plantilles: passar per damunt de «Primer / Després» la dibuixa
    await scrollToPage(page, 1);
    await pageMenu(page, locale, 1).click();
    await page
      .getByRole("menuitem", {
        name: t(locale, "features.freeLayout.page.chooseTemplate"),
      })
      .click();
    // El selector del full (la columna també en té un, al nivell «Pàgina»)
    const firstThen = page.locator(".MuiPopover-paper").getByText(
      t(locale, "features.freeLayout.template.firstThen"),
      { exact: true },
    );
    await expect(firstThen).toBeVisible();
    await firstThen.hover();
    await page.waitForTimeout(700);
    const secondSheet = page.locator("#view-page-frame-1");
    await shot(page, secondSheet, out(locale, "plantilles"), {
      size: { width: 900, height: 640 },
      // Damunt de la miniatura, sense tapar-ne el nom
      mouseOffset: await offsetTo(secondSheet, firstThen, 0, -34),
    });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // 4. Moure un bloc a la pàgina lliure
    await scrollToPage(page, 2);
    const thirdPage = page.locator("#view-page-2");
    const thirdSheet = page.locator("#view-page-frame-2");
    const morning = thirdPage.locator(".placement").nth(1);
    await morning.click();
    // Amb el teclat: cada fletxa el mou una casella de la quadrícula
    for (const key of ["ArrowRight", "ArrowRight", "ArrowDown"]) {
      await page.keyboard.press(key);
    }
    await page.waitForTimeout(500);
    await shot(page, thirdSheet, out(locale, "moure-bloc"), {
      size: { width: 900, height: 640 },
      mouseOffset: await offsetTo(thirdSheet, morning, 40),
    });

    // Portada: el bloc seleccionat, damunt de la quadrícula
    await shot(page, morning, out(locale, "portada"), {
      size: COVER,
      highlight: true,
      mouseOffset: { x: 150, y: 70 },
    });

    // 6a. El menú del bloc: a totes les pàgines, copiar a una altra
    await thirdPage
      .getByRole("button", {
        name: t(locale, "features.freeLayout.placement.actions").replace(
          "{name}",
          word(locale, "Matí"),
        ),
      })
      .click();
    const blockMenu = page.locator(".MuiMenu-paper");
    await expect(blockMenu).toBeVisible();
    await page.waitForTimeout(400);
    await shot(page, blockMenu, out(locale, "menu-bloc"), {
      size: STEP,
      mouseOffset: await offsetTo(
        blockMenu,
        blockMenu.getByText(t(locale, "features.freeLayout.placement.onEveryPage"), {
          exact: true,
        }),
        220,
      ),
    });
    await page.keyboard.press("Escape");
    await expect(blockMenu).toBeHidden();

    // 5. Un rètol: el bloc de text i els seus ajustos a la columna
    await thirdPage.locator(".placement").nth(0).click();
    await page.waitForTimeout(600);
    await shot(page, thirdSheet, out(locale, "retol"), {
      size: { width: 1280, height: 640 },
      noCursor: true,
    });

    // 7. «Pàgina i distribució» a la configuració
    // La barra de dalt s'amaga en baixar: es torna a dalt de tot
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    // La roda dentada de la barra (en anglès i italià, el panell de la vista
    // al mòbil té el mateix nom)
    await page
      .locator("header")
      .getByRole("button", {
        name: t(locale, "components.defaultSettings.settings.title"),
        exact: true,
      })
      .click();
    await page
      .getByRole("tab", { name: t(locale, "components.defaultSettings.tab.view") })
      .click();
    const help = page.getByText(
      t(locale, "components.viewSettingsPanel.dispositionHelp"),
    );
    await expect(help).toBeVisible();
    await page.waitForTimeout(600);
    await shot(page, help, out(locale, "configuracio"), {
      size: { width: 1280, height: 600 },
      noCursor: true,
    });
  });
}
