import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Proves de regressió del format `.saac` amb les fixtures de
// `test/fixtures/saac/` (vegeu-ne el README).
//
// Són la xarxa del canvi de model de dades que demana el mode lliure
// (`docs/spec-mode-lliure.md`, §4 i §12): un `.saac` desat amb la versió
// d'avui s'ha d'obrir, tornar a desar i veure exactament igual després.
//
// Requereix el servidor de desenvolupament engegat: `npm run dev` a apps/web.
// Executar amb: `npx playwright test e2e/saac-fixtures.spec.ts`

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(HERE, "..", "test", "fixtures", "saac");
const IMAGES = path.join(HERE, "fixtures", "images");

type RoundTrip = "identic" | "viewSettings-per-defecte" | "sequence-a-documentState";

interface FixtureExpectation {
  pestanyes: Record<string, number> | null;
  activeSAAC: number | null;
  teConfiguracioGlobal: boolean;
  anadaITornada: RoundTrip;
}

// Forma mínima del fitxer que cal per comparar-lo; el tipus complet és el de l'app
interface SaacFile {
  documentState?: {
    content: Record<string, unknown[]>;
    viewSettings?: Record<string, unknown>;
    activeSAAC: number;
  };
  defaultSettings?: unknown;
  sequence?: unknown[];
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(FIXTURES, "manifest.json"), "utf8"),
) as Record<string, FixtureExpectation>;

// La vista que el carregador posa a les pestanyes que no en porten
// (`DEFAULT_SEQUENCE_VIEW` de `documentSlice`)
const DEFAULT_SEQUENCE_VIEW = {
  sizePict: 0.9,
  pictSpaceBetween: 1,
  alignmentH: "left",
  alignmentV: "top",
};

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

/** Obre el fitxer des del menú, com ho faria l'usuari. */
const openFixture = async (page: Page, name: string): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', path.join(FIXTURES, name));
  await page.keyboard.press("Escape");
  await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();
};

/** Torna a desar amb «Descarrega» i en retorna el text tal com surt. */
const downloadSaac = async (
  page: Page,
  { sequence, settings }: { sequence: boolean; settings: boolean },
): Promise<string> => {
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Descarrega" }).click();
  const dialog = page.getByRole("dialog");

  const sequenceBox = dialog.getByRole("checkbox", { name: "Seqüència" });
  if (sequence) await sequenceBox.check();
  else if (await sequenceBox.count()) await sequenceBox.uncheck();

  const settingsBox = dialog.getByRole("checkbox", {
    name: "Configuració predeterminada",
  });
  if (settings) await settingsBox.check();
  else await settingsBox.uncheck();

  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Descarrega" }).click();
  return fs.readFileSync(await (await download).path(), "utf8");
};

for (const [name, expected] of Object.entries(manifest)) {
  test.describe(name, () => {
    test("s'obre amb les pestanyes i els pictogrames que té", async ({
      page,
    }) => {
      await openFixture(page, name);
      if (!expected.pestanyes) return;

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

    test("desar-lo de nou dona el mateix document", async ({ page }) => {
      await openFixture(page, name);
      const original = JSON.parse(readFixture(name)) as SaacFile;
      const hasDocument = expected.pestanyes !== null;

      const saved = await downloadSaac(page, {
        sequence: hasDocument,
        settings: expected.teConfiguracioGlobal,
      });

      if (expected.anadaITornada === "identic") {
        // Byte a byte: l'ordre de les claus també forma part del format
        expect(saved).toBe(readFixture(name));
        return;
      }

      const parsed = JSON.parse(saved) as SaacFile;

      if (expected.anadaITornada === "viewSettings-per-defecte") {
        const withDefaults = structuredClone(original);
        const state = withDefaults.documentState!;
        state.viewSettings = Object.fromEntries(
          Object.keys(state.content).map((key) => [
            key,
            { ...DEFAULT_SEQUENCE_VIEW },
          ]),
        );
        expect(parsed).toEqual(withDefaults);
        return;
      }

      // Format primitiu: la seqüència acaba a la pestanya activa d'un document nou
      expect(parsed.documentState?.content["0"]).toEqual(original.sequence);
    });

    if (expected.pestanyes) {
      test("la vista es pinta igual que abans", async ({ page }) => {
        await openFixture(page, name);
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
