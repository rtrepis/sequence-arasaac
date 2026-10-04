import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Proves de regressió del format `.saac` amb les fixtures de
// `test/fixtures/saac/` (vegeu-ne el README), i de l'estil del document
// (`docs/fonaments/03-model-contingut-estil.md`).
//
// Des del format v3 (`docs/decisions/ADR-003-model-document-saac-v3.md`),
// desar escriu sempre el v3: un fitxer antic s'obre, es migra, i en tornar-lo
// a desar en surt un v3. El que ha de ser idèntic és l'anada i tornada d'un v3
// (tret de `meta.updatedAt`), i la vista, que es pinta igual que abans. Les
// proves fines de la migració són a `src/features/sequence/saac/saac.test.ts`.
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

// Forma mínima d'un fitxer v3 per comparar-lo
interface V3File {
  format?: string;
  kind?: string;
  schemaVersion?: number;
  meta?: Record<string, unknown>;
  style?: { card: unknown; pictogram: unknown };
  sequences?: { pictograms: unknown[] }[];
  [key: string]: unknown;
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(FIXTURES, "manifest.json"), "utf8"),
) as Record<string, FixtureExpectation>;

// Els documents antics s'obren amb la pàgina de qui els obre, i el paper per
// defecte surt de la regió del navegador: sense fixar-la, el Chromium de
// Playwright diu «en-US», obriria en Carta i les captures no serien les d'A4
test.use({ locale: "ca-ES" });

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

/** Obre el panell «Estil del document» des de la configuració del menú. */
const openStylePanel = async (page: Page) => {
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Configuració" }).click();
  await page.getByRole("tab", { name: "Estil del document" }).click();
};

/**
 * Desa i en retorna el text tal com surt: el document, amb «Descarrega»; només
 * l'estil, des del panell «Estil del document», que és on viu aquesta acció.
 */
const downloadSaac = async (
  page: Page,
  kind: "document" | "style",
): Promise<string> => {
  if (kind === "document") {
    await page.getByRole("button", { name: "Menú principal" }).click();
    await page.getByRole("button", { name: "Descarrega" }).click();
  } else {
    await openStylePanel(page);
    await page
      .getByRole("button", { name: "Desa l'estil en un fitxer…" })
      .click();
  }
  const dialog = page.getByRole("dialog", {
    name:
      kind === "document" ? "Desa i descarrega" : "Desa l'estil en un fitxer",
  });

  const download = page.waitForEvent("download");
  await dialog
    .getByRole("button", {
      name: kind === "document" ? "Desa el document" : "Desa l'estil",
    })
    .click();
  const text = fs.readFileSync(await (await download).path(), "utf8");
  // Es tanca la configuració, si s'havia obert
  if (kind === "style") {
    await expect(dialog).toBeHidden();
    await page.keyboard.press("Escape");
  }
  return text;
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
            name: "Aquest fitxer és un estil, no un document",
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

    test("desar-lo de nou dona un v3, que torna igual", async ({ page }) => {
      await openFixture(page, name);
      const original = JSON.parse(readFixture(name)) as SaacFile;

      if (!expected.pestanyes) {
        // Fitxer d'estil sense document obert: es fa servir per defecte, i
        // «Desa l'estil» en torna el mateix estil, en v3
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Fes-lo el meu estil per defecte" })
          .click();
        await expect(
          page.getByText("S'ha desat com a estil per defecte"),
        ).toBeVisible();
        const saved = JSON.parse(await downloadSaac(page, "style")) as V3File;
        expect(saved).toMatchObject({
          format: "sequenciaac",
          kind: "style",
          schemaVersion: 3,
        });
        const source = original.style ?? original.defaultSettings!;
        expect(saved.style!.card).toMatchObject(
          source.pictSequence as Record<string, unknown>,
        );
        const { fitzgerald: _none, ...pictogram } = source.pictApiAra as Record<
          string,
          unknown
        >;
        expect(saved.style!.pictogram).toMatchObject(pictogram);
        return;
      }
      await expectLoaded(page);

      const savedText = await downloadSaac(page, "document");
      const saved = JSON.parse(savedText) as V3File;
      expect(saved).toMatchObject({
        format: "sequenciaac",
        kind: "document",
        schemaVersion: 3,
      });
      // Les pestanyes buides es descarten; els pictogrames, tots
      expect(saved.sequences!.map((s) => s.pictograms.length)).toEqual(
        Object.values(expected.pestanyes),
      );

      // L'anada i tornada d'un v3: el mateix fitxer, tret de l'hora de desar
      await openFixture(page, asUpload(savedText, "tornada.saac"), {
        navigate: false,
      });
      await expectLoaded(page);
      const again = JSON.parse(await downloadSaac(page, "document")) as V3File;
      expect({ ...again, meta: { ...again.meta, updatedAt: "" } }).toEqual({
        ...saved,
        meta: { ...saved.meta, updatedAt: "" },
      });
    });

    if (expected.pestanyes) {
      test("la vista es pinta igual que abans", async ({ page }) => {
        await openFixture(page, name);
        await expectLoaded(page);
        // L'avís de càrrega cau damunt del full
        await expect(page.getByText("Fitxer carregat correctament")).toBeHidden(
          { timeout: 15000 },
        );
        // El bàner d'obrir (versió anterior, estil propi) no és del document:
        // es tanca perquè no desplaci el full ni una fracció de píxel
        const closeBanner = page
          .getByRole("status")
          .getByRole("button", { name: "Tanca l'avís" });
        if (await closeBanner.count()) await closeBanner.click();
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

// --- Estil del document ---

const banner = (page: Page) =>
  page.getByRole("status").filter({ hasText: "Aquest document" });

test.describe("estil del document", () => {
  test("un document amb estil propi ho diu en un bàner, que porta al panell", async ({
    page,
  }) => {
    await openFixture(page, "02-diverses-pestanyes.saac");
    await expectLoaded(page);

    // Bàner d'estat: dins d'una regió viva educada, no s'imprimeix
    const ownStyle = page.getByText("Aquest document té el seu propi estil.");
    await expect(ownStyle).toBeVisible();
    await expect(banner(page)).toHaveCount(1);
    await expect(banner(page)).toHaveAttribute("aria-live", "polite");

    const open = banner(page).getByRole("button", {
      name: "Estil del document",
    });
    await open.click();
    const settings = page.getByRole("dialog", { name: "Configuracions" });
    await expect(
      settings.getByRole("heading", { name: "Estil del document" }),
    ).toBeVisible();
    await expect(
      settings.getByText("S'aplica a totes les seqüències d'aquest document."),
    ).toBeVisible();

    // En tancar, el focus torna al botó del bàner
    await page.keyboard.press("Escape");
    await expect(settings).toBeHidden();
    await expect(open).toBeFocused();
  });

  test("«Aplica el meu estil per defecte» es pot desfer des del snackbar", async ({
    page,
  }) => {
    await openFixture(page, "02-diverses-pestanyes.saac");
    await expectLoaded(page);
    // Com era abans del canvi (desar no s'endú el desfer)
    const original = JSON.parse(await downloadSaac(page, "document")) as V3File;

    await openStylePanel(page);
    await page
      .getByRole("button", { name: "Aplica el meu estil per defecte" })
      .click();
    const applied = page.getByText(
      "S'ha aplicat el teu estil per defecte al document.",
    );
    await expect(applied).toBeVisible();
    // Tancar la configuració («Configuració desada») no s'endú el «Desfés»
    await page.keyboard.press("Escape");
    await expect(applied).toBeVisible();

    // Amb l'estil per defecte: sense numerar i amb la vista per defecte. Obrir
    // el 02 (que portava configuració) no ha tocat l'estil per defecte de l'usuari
    const changed = JSON.parse(await downloadSaac(page, "document")) as {
      style: { card: { numbered: boolean }; view: { sizePict: number } };
      sequences: { style?: { view?: { sizePict?: number } } }[];
    };
    expect(changed.style.card.numbered).toBe(false);
    expect(
      changed.sequences[0].style?.view?.sizePict ?? changed.style.view.sizePict,
    ).toBe(1);

    // Desfer torna exactament al que hi havia
    await page.getByRole("button", { name: "Desfés" }).click();
    await expect(page.getByText("S'ha desfet el canvi d'estil")).toBeVisible();
    const undone = JSON.parse(await downloadSaac(page, "document")) as V3File;
    expect(undone.style).toEqual(original.style);
    expect(undone.sequences).toEqual(original.sequences);
  });

  test("el «Desfés» s'abasta amb el teclat just després de l'acció", async ({
    page,
  }) => {
    await openFixture(page, "02-diverses-pestanyes.saac");
    await expectLoaded(page);
    await openStylePanel(page);

    const apply = page.getByRole("button", {
      name: "Aplica el meu estil per defecte",
    });
    await apply.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByText("S'ha aplicat el teu estil per defecte al document."),
    ).toBeVisible();

    // El snackbar és al DOM just després de les quatre accions
    for (let i = 0; i < 3; i += 1) await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Desfés" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByText("S'ha desfet el canvi d'estil")).toBeVisible();
  });

  test("el bàner es tanca amb el teclat i té dianes de 44 px", async ({
    page,
  }) => {
    await openFixture(page, "02-diverses-pestanyes.saac");
    await expectLoaded(page);
    const text = page.getByText("Aquest document té el seu propi estil.");
    await expect(text).toBeVisible();

    const close = page.getByRole("button", { name: "Tanca l'avís" });
    for (const button of [
      close,
      banner(page).getByRole("button", { name: "Estil del document" }),
    ]) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    expect((await close.boundingBox())!.width).toBeGreaterThanOrEqual(44);

    await close.focus();
    await page.keyboard.press("Escape");
    await expect(text).toBeHidden();
  });

  test("un fitxer d'estil s'aplica al document obert, amb desfer", async ({
    page,
  }) => {
    await openFixture(page, "02-diverses-pestanyes.saac");
    await expectLoaded(page);
    await openFixture(page, "05-nomes-configuracio.saac", { navigate: false });

    // Obert com a document, pregunta què se'n fa
    await page
      .getByRole("dialog", {
        name: "Aquest fitxer és un estil, no un document",
      })
      .getByRole("button", { name: "Aplica'l a aquest document" })
      .click();
    await expect(
      page.getByText("S'ha aplicat l'estil del fitxer al document."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Desfés" })).toBeVisible();

    // I des del panell es fa servir per defecte
    await openStylePanel(page);
    await page
      .getByRole("button", { name: "Desa com a estil per defecte" })
      .click();
    await expect(
      page.getByText("S'ha desat com a estil per defecte"),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    const style = JSON.parse(
      readFixture("05-nomes-configuracio.saac"),
    ) as SaacFile;
    const saved = JSON.parse(await downloadSaac(page, "style")) as V3File;
    expect(saved.style?.card).toMatchObject(
      style.defaultSettings?.pictSequence as Record<string, unknown>,
    );
  });
});
