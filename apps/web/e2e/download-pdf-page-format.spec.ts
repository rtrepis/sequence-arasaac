import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

// Format de la pàgina del PDF i captura en blanc (backlog d'UX, B9 i A9).
//
// Requereix el servidor de desenvolupament engegat: `npm run dev` a apps/web.
// Executar amb: `npx playwright test e2e/download-pdf-page-format.spec.ts`
//
// El que es mira aquí és el fitxer que surt, no la pantalla: la mida del full
// (`/MediaBox`) i on hi cau la imatge. Són les dues coses que cap prova de la
// interfície pot confirmar, i justament on hi havia la fallada.

const PDF_BUTTON = "Descarregar PDF";
const FULLSCREEN_OPTION = "Pantalla sencera";
const PAGE_SIZE_LABEL = "Mida de pàgina";

const MM_TO_PT = 72 / 25.4;

// Les fonts de Google se serveixen buides: html2canvas espera els fulls d'estil
// externs abans de capturar i aquí no s'hi prova cap tipografia.
test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
});

const gotoView = async (page: Page): Promise<void> => {
  await page.goto("/ca/view-sequence", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".preview-content")).toBeAttached();
};

/** Descarrega el PDF i en retorna el contingut cru, per llegir-ne les estructures. */
const downloadPdfSource = async (page: Page): Promise<string> => {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: PDF_BUTTON }).click();
  const download = await downloadPromise;
  const path = await download.path();
  // latin1: el cos d'un PDF barreja text i binari, i aquí només se'n llegeix
  // la part de text. Amb utf8 els bytes alts es corromprien.
  return readFileSync(path, "latin1");
};

/** Mida del full declarada al PDF, en punts. */
const mediaBox = (pdf: string): { width: number; height: number } => {
  const match = pdf.match(
    /\/MediaBox\s*\[\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s*\]/,
  );
  if (!match) throw new Error("El PDF no declara cap /MediaBox");
  return { width: Number(match[3]), height: Number(match[4]) };
};

/** Rectangle on es dibuixa la imatge, en punts (matriu `cm` del flux de contingut). */
const imagePlacement = (
  pdf: string,
): { width: number; height: number; x: number; y: number } => {
  const match = pdf.match(
    /q\s+([\d.-]+)\s+0\s+0\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+cm/,
  );
  if (!match) throw new Error("El PDF no col·loca cap imatge");
  return {
    width: Number(match[1]),
    height: Number(match[2]),
    x: Number(match[3]),
    y: Number(match[4]),
  };
};

test("amb A4, el full és un A4 i la imatge hi va centrada", async ({ page }) => {
  await gotoView(page);
  const pdf = await downloadPdfSource(page);

  // A4 són 210×297 mm; l'orientació pot canviar-ne l'ordre
  const { width, height } = mediaBox(pdf);
  const sides = [width, height].sort((a, b) => a - b);
  expect(sides[0]).toBeCloseTo(210 * MM_TO_PT, 0);
  expect(sides[1]).toBeCloseTo(297 * MM_TO_PT, 0);

  // Les dimensions del full són les útils (el paper menys els marges), així que
  // la imatge no omple la pàgina: el que s'hi mira és que el que sobra quedi
  // repartit. A 0,0 tot el marge requeia a la dreta i a baix.
  const image = imagePlacement(pdf);
  expect(image.x).toBeCloseTo((width - image.width) / 2, 1);
  expect(image.y).toBeCloseTo((height - image.height) / 2, 1);
  expect(image.x).toBeGreaterThan(1);
});

test("amb pantalla sencera no s'ofereix la descàrrega del PDF", async ({
  page,
}) => {
  await gotoView(page);

  // El desplegable ja té nom accessible: `GlobalViewControls` lliga el `labelId`
  // del `SettingRow` amb l'`aria-labelledby` del `Select` (backlog C12).
  await page.getByLabel(PAGE_SIZE_LABEL).click();
  await page.getByRole("option", { name: FULLSCREEN_OPTION }).click();

  // Amb aquesta mida la barra només ofereix «pantalla completa»: ni imprimir ni
  // PDF. És la raó per la qual el full mal dimensionat que descrivia B9 no
  // arriba mai a l'usuari, i queda fixat aquí perquè es vegi si algú torna a
  // oferir la descàrrega: el hook ja fa el full a mida, però qui reobri el botó
  // ha de saber que aquesta prova l'estava esperant.
  await expect(
    page.getByRole("button", { name: "Pantalla completa" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: PDF_BUTTON })).toHaveCount(0);
});

test("una captura en blanc es diu, i no es desa cap full buit", async ({
  page,
}) => {
  // Safari a iOS retorna el canvas transparent quan se'n passa la mida, sense
  // llançar res. Es reprodueix pel senyal que el codi mira: alfa 0 a tot arreu.
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (
      ...args: Parameters<typeof original>
    ) {
      const data = original.apply(this, args);
      data.data.fill(0);
      return data;
    };
  });

  const reported: Array<Record<string, unknown>> = [];
  await page.route("**/api/client-errors", async (route) => {
    reported.push(route.request().postDataJSON());
    await route.fulfill({ status: 204, body: "" });
  });

  await gotoView(page);

  let downloaded = false;
  page.on("download", () => {
    downloaded = true;
  });

  await page.getByRole("button", { name: PDF_BUTTON }).click();

  // Es diu que ha fallat, amb el codi propi d'aquest cas
  await expect(page.getByText(/No s'ha pogut generar el PDF/)).toBeVisible();
  await expect(page.getByText(/PDF_EMPTY_CANVAS/)).toBeVisible();

  // I sobretot: no s'anuncia cap èxit ni es desa cap fitxer en blanc
  await expect(page.getByText("PDF descarregat")).toBeHidden();
  expect(downloaded).toBe(false);

  await expect.poll(() => reported.length, { timeout: 5000 }).toBeGreaterThan(0);
  expect(reported[0]).toMatchObject({
    code: "PDF_EMPTY_CANVAS",
    context: "pdf-export",
  });

  // El codi sol no serveix per decidir el llindar de B14: cal saber a quina mida
  // ha passat. El detall porta el format, les dimensions del full, l'escala
  // aplicada i el canvas que n'ha sortit (el `userAgent` ja el desa el servidor).
  const detail = String(reported[0].detail);
  expect(detail).toMatch(
    /^A4 (landscape|portrait) full \d+×\d+, escala \d+\.\d{2}, canvas \d+×\d+$/,
  );
});
