import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Proves de regressió del format `.saac` amb les fixtures de
// `test/fixtures/saac/` (vegeu-ne el README), i de l'estil de la seqüència
// (`docs/fonaments/sequencia-i-estil.md`).
//
// Des de l'esquema 2, desar una seqüència hi afegeix sempre l'estil: tornar a
// desar un fitxer de la 2.1.0 ja no en dona el mateix byte a byte, sinó el
// mateix document amb l'estil a dins. El que sí ha de ser idèntic byte a byte
// és l'anada i tornada d'un fitxer de l'esquema 2.
//
// Són la xarxa del canvi de model de dades que demana el mode lliure
// (`docs/spec-mode-lliure.md` a la branca `feature/mode-lliure`, §4 i §12): un `.saac` desat amb la versió
// d'avui s'ha d'obrir, tornar a desar i veure exactament igual després.
//
// Requereix el servidor de desenvolupament engegat: `npm run dev` a apps/web.
// Executar amb: `npx playwright test e2e/saac-fixtures.spec.ts`

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(HERE, "..", "test", "fixtures", "saac");
const IMAGES = path.join(HERE, "fixtures", "images");

type RoundTrip =
  | "identic"
  | "viewSettings-per-defecte"
  | "sequence-a-documentState"
  | "estil-fusionat";

interface FixtureExpectation {
  pestanyes: Record<string, number> | null;
  activeSAAC: number | null;
  teConfiguracioGlobal: boolean;
  anadaITornada: RoundTrip;
}

// Forma mínima del fitxer que cal per comparar-lo; el tipus complet és el de l'app
interface DocumentState {
  content: Record<string, unknown[]>;
  viewSettings?: Record<string, unknown>;
  activeSAAC: number;
  defaultSettings?: { pictSequence: { font: { family: string } } } | null;
  styleView?: unknown;
  [key: string]: unknown;
}
interface SaacFile {
  schemaVersion?: number;
  documentState?: DocumentState;
  defaultSettings?: { pictSequence: unknown; pictApiAra: unknown };
  sequence?: unknown[];
  style?: { pictSequence: unknown; pictApiAra: unknown; view: unknown };
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(FIXTURES, "manifest.json"), "utf8"),
) as Record<string, FixtureExpectation>;

// La vista que reben les pestanyes que no en porten: la de l'estil per defecte,
// que en un navegador nou és la de `uiSlice` (`VIEW_DEFAULT_*`)
const DEFAULT_TAB_VIEW = {
  sizePict: 1,
  pictSpaceBetween: 1,
  alignmentH: "left",
  alignmentV: "top",
};
// La lletra de l'estil per defecte en un navegador nou
const DEFAULT_FONT_FAMILY = "Roboto";

// Imatges d'ARASAAC i de Cloudinary servides des del disc: les captures no
// poden dependre de la xarxa. Cada id cau sempre a la mateixa imatge.
const LOCAL_IMAGES = fs
  .readdirSync(IMAGES)
  .filter((name) => name.endsWith(".png"))
  .sort()
  .map((name) => fs.readFileSync(path.join(IMAGES, name)));

const localImageFor = (url: string): Buffer => {
  const id = Number(url.match(/pictograms\/(\d+)/)?.[1] ?? url.length);
  return LOCAL_IMAGES[id % LOCAL_IMAGES.length];
};

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  // Qualsevol altra crida a ARASAAC (cerques, paraules clau) no hi ha de ser.
  // Va primer perquè Playwright prova les rutes de l'última a la primera: les
  // de les imatges, registrades després, passen per davant d'aquesta.
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
  await page.route(/arasaac\.org\/.*pictograms\/\d+/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/png",
      body: localImageFor(route.request().url()),
    }),
  );
  await page.route("https://res.cloudinary.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/png",
      body: localImageFor(route.request().url()),
    }),
  );
});

const readFixture = (name: string): string =>
  fs.readFileSync(path.join(FIXTURES, name), "utf8");

type FileInput = string | { name: string; mimeType: string; buffer: Buffer };

/**
 * Obre el fitxer des del menú, com ho faria l'usuari. Un fitxer que només
 * porta estil, obert sense cap seqüència, pregunta si es vol per defecte.
 */
const openFixture = async (
  page: Page,
  file: FileInput,
  { navigate = true }: { navigate?: boolean } = {},
): Promise<void> => {
  if (navigate)
    await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  // El menú es tanca abans de triar el fitxer: tancar-lo després, amb Esc, pot
  // arribar quan ja hi ha un diàleg obert (el d'un fitxer d'estil) i tancar-lo
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.keyboard.press("Escape");
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(typeof file === "string" ? path.join(FIXTURES, file) : file);
};

const expectLoaded = async (page: Page) =>
  expect(page.getByText("Fitxer carregat correctament")).toBeVisible();

/** Desa amb «Descarrega» i en retorna el text tal com surt. */
const downloadSaac = async (
  page: Page,
  kind: "sequence" | "style",
): Promise<string> => {
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Descarrega" }).click();
  const dialog = page.getByRole("dialog");

  const download = page.waitForEvent("download");
  await dialog
    .getByRole("button", {
      name: kind === "sequence" ? "Desa la seqüència" : "Desa l'estil",
    })
    .click();
  return fs.readFileSync(await (await download).path(), "utf8");
};

const asUpload = (text: string, name: string): FileInput => ({
  name,
  mimeType: "text/plain",
  buffer: Buffer.from(text, "utf8"),
});

for (const [name, expected] of Object.entries(manifest)) {
  test.describe(name, () => {
    test("s'obre amb les pestanyes i els pictogrames que té", async ({
      page,
    }) => {
      await openFixture(page, name);
      if (!expected.pestanyes) {
        // «Només preferències» s'interpreta com a fitxer d'estil
        await expect(
          page.getByRole("dialog", {
            name: "Vols fer servir aquest estil per defecte?",
          }),
        ).toBeVisible();
        return;
      }
      await expectLoaded(page);

      const tabs = page
        .getByRole("tablist", { name: "Número de seqüència" })
        .getByRole("tab");
      await expect(tabs).toHaveCount(Object.keys(expected.pestanyes).length);

      // L'editor només pinta la pestanya activa
      const active = String(expected.activeSAAC);
      await expect(page.getByTestId("card-pictogram")).toHaveCount(
        expected.pestanyes[active],
      );
    });

    test("desar-lo de nou conserva el document i hi posa l'estil", async ({
      page,
    }) => {
      await openFixture(page, name);
      const original = JSON.parse(readFixture(name)) as SaacFile;

      if (!expected.pestanyes) {
        // Fitxer d'estil sense seqüència oberta: es fa servir per defecte, i
        // «Desa l'estil» en torna el mateix estil
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Fes-lo servir per defecte" })
          .click();
        await expect(
          page.getByText("S'ha desat com a estil per defecte"),
        ).toBeVisible();
        const savedText = await downloadSaac(page, "style");
        const saved = JSON.parse(savedText) as SaacFile;
        // Un fitxer d'estil de l'esquema 2 torna byte a byte
        if (original.schemaVersion === 2) {
          expect(savedText).toBe(readFixture(name));
          return;
        }
        expect(saved.schemaVersion).toBe(2);
        expect(saved.style?.pictSequence).toEqual(
          original.defaultSettings?.pictSequence,
        );
        expect(saved.style?.pictApiAra).toEqual(
          original.defaultSettings?.pictApiAra,
        );
        return;
      }
      await expectLoaded(page);

      const savedText = await downloadSaac(page, "sequence");
      const saved = JSON.parse(savedText) as SaacFile;
      expect(saved.schemaVersion).toBe(2);
      expect(saved).not.toHaveProperty("defaultSettings");
      const state = saved.documentState!;
      expect(state.styleView).toBeDefined();

      if (original.schemaVersion === 2) {
        // Esquema 2: el mateix fitxer, byte a byte
        expect(savedText).toBe(readFixture(name));
      } else if (expected.anadaITornada === "identic") {
        // El document, igual; l'estil, el que portava el fitxer o el per defecte
        const { defaultSettings, styleView: _style, ...rest } = state;
        const originalState = { ...original.documentState! };
        delete originalState.defaultSettings;
        expect(rest).toEqual(originalState);
        if (expected.teConfiguracioGlobal)
          expect(defaultSettings).toEqual(original.defaultSettings);
        else
          expect(defaultSettings?.pictSequence.font.family).toBe(
            DEFAULT_FONT_FAMILY,
          );
      } else if (expected.anadaITornada === "estil-fusionat") {
        // Estil parcial: el que porta el fitxer, i la resta del per defecte
        const fileStyle = original.defaultSettings as unknown as {
          pictSequence: { font: unknown };
          pictApiAra: unknown;
        };
        const savedStyle = state.defaultSettings as unknown as {
          pictSequence: { font: unknown; numberFont: unknown };
          pictApiAra: unknown;
        };
        expect(state.content).toEqual(original.documentState!.content);
        expect(state.viewSettings).toEqual(original.documentState!.viewSettings);
        expect(savedStyle.pictSequence).toMatchObject(fileStyle.pictSequence);
        expect(savedStyle.pictApiAra).toEqual(fileStyle.pictApiAra);
        // Sense lletra per als números, la del text del fitxer
        expect(savedStyle.pictSequence.numberFont).toEqual(
          fileStyle.pictSequence.font,
        );
      } else if (expected.anadaITornada === "viewSettings-per-defecte") {
        // Sense vista al fitxer: la de l'estil per defecte a totes les pestanyes
        expect(state.content).toEqual(original.documentState!.content);
        expect(state.viewSettings).toEqual(
          Object.fromEntries(
            Object.keys(state.content).map((key) => [key, DEFAULT_TAB_VIEW]),
          ),
        );
        expect(state.activeSAAC).toBe(original.documentState!.activeSAAC);
        expect(state.title).toBe(original.documentState!.title);
      } else {
        // Format primitiu: la seqüència és la primera pestanya d'un document nou
        expect(state.content["0"]).toEqual(original.sequence);
      }

      // L'esquema 2 sí que fa l'anada i tornada byte a byte
      await openFixture(page, asUpload(savedText, "tornada.saac"), {
        navigate: false,
      });
      // Just després de desar, l'avís diu «desat»: el de «carregat» vol dir
      // que el fitxer ja s'ha tornat a llegir
      await expectLoaded(page);
      expect(await downloadSaac(page, "sequence")).toBe(savedText);
    });

    if (expected.pestanyes) {
      test("la vista es pinta igual que abans", async ({ page }) => {
        await openFixture(page, name);
        await expectLoaded(page);
        // L'avís de càrrega cau damunt del full
        await expect(page.getByText("Fitxer carregat correctament")).toBeHidden(
          { timeout: 15000 },
        );
        await page.getByRole("tab", { name: "Vista" }).click();

        const sheet = page.locator(".preview-content");
        await expect(sheet).toBeVisible();
        // Tipografies pròpies i imatges carregades abans de fer la captura
        await page.evaluate(() => document.fonts.ready);
        await expect
          .poll(() =>
            sheet.evaluate((element) =>
              Array.from(element.querySelectorAll("img")).every(
                (img) => img.complete,
              ),
            ),
          )
          .toBe(true);

        await expect(sheet).toHaveScreenshot(`${name}.png`);
      });
    }
  });
}

// --- Estil de la seqüència ---

const notice = (page: Page) => page.getByRole("status").filter({ hasText: /./ });

test.describe("estil de la seqüència", () => {
  test("una seqüència amb estil propi ho diu, i «Canvia l'estil» es pot desfer", async ({
    page,
  }) => {
    await openFixture(page, "02-diverses-pestanyes.saac");
    await expectLoaded(page);

    // Avís discret, no bloquejant, en una regió viva educada
    const ownStyle = page.getByText("Aquesta seqüència té el seu propi estil.");
    await expect(ownStyle).toBeVisible();
    await expect(page.locator('[aria-live="polite"]').filter({ has: ownStyle })).toHaveCount(1);

    await notice(page).getByRole("button", { name: "Canvia l'estil" }).click();
    await page
      .getByRole("dialog", { name: "Canvia l'estil" })
      .getByRole("button", { name: /El meu estil per defecte/ })
      .click();
    await expect(
      page.getByText("S'ha aplicat el teu estil per defecte a aquesta seqüència."),
    ).toBeVisible();

    // Amb l'estil per defecte: sense numerar i amb la vista per defecte. Obrir
    // el 02 (que portava configuració) no ha tocat l'estil per defecte de l'usuari
    const changed = JSON.parse(await downloadSaac(page, "sequence")) as SaacFile;
    const changedState = changed.documentState as unknown as {
      defaultSettings: { pictSequence: { numbered: boolean } };
      viewSettings: Record<string, { sizePict: number }>;
    };
    expect(changedState.defaultSettings.pictSequence.numbered).toBe(false);
    expect(changedState.viewSettings["0"].sizePict).toBe(1);

    // Desfer torna exactament al que hi havia (desar no s'ha endut el desfer)
    await notice(page).getByRole("button", { name: "Desfés" }).click();
    await expect(page.getByText("S'ha desfet el canvi d'estil")).toBeVisible();
    const undone = JSON.parse(await downloadSaac(page, "sequence")) as SaacFile;
    const original = JSON.parse(readFixture("02-diverses-pestanyes.saac")) as SaacFile;
    expect(undone.documentState?.defaultSettings).toEqual(original.defaultSettings);
    expect(undone.documentState?.viewSettings).toEqual(
      original.documentState?.viewSettings,
    );
  });

  test("l'avís es tanca amb el teclat", async ({ page }) => {
    await openFixture(page, "02-diverses-pestanyes.saac");
    await expectLoaded(page);
    const text = page.getByText("Aquesta seqüència té el seu propi estil.");
    await expect(text).toBeVisible();

    const close = page.getByRole("button", { name: "Tanca l'avís" });
    const box = await close.boundingBox();
    // Diana tàctil de 44 px (WCAG 2.5.8 en demana 24; la casa, 44)
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await close.focus();
    await page.keyboard.press("Escape");
    await expect(text).toBeHidden();
  });

  test("un fitxer d'estil s'aplica a la seqüència oberta i es pot fer per defecte", async ({
    page,
  }) => {
    await openFixture(page, "02-diverses-pestanyes.saac");
    await expectLoaded(page);
    await openFixture(page, "05-nomes-configuracio.saac", { navigate: false });

    await expect(
      page.getByText("S'ha aplicat l'estil del fitxer a aquesta seqüència."),
    ).toBeVisible();
    await notice(page)
      .getByRole("button", { name: "Desa com a estil per defecte" })
      .click();
    await expect(page.getByText("S'ha desat com a estil per defecte")).toBeVisible();

    // L'estil per defecte és ara el del fitxer: «Document nou» el rep
    const style = JSON.parse(readFixture("05-nomes-configuracio.saac")) as SaacFile;
    const saved = JSON.parse(await downloadSaac(page, "style")) as SaacFile;
    expect(saved.style?.pictSequence).toEqual(style.defaultSettings?.pictSequence);
  });
});
