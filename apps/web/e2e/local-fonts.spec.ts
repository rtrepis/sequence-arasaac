import { test, expect, Page } from "@playwright/test";

// B27: les fonts de la llista es serveixen des de l'app mateixa. Sense accés a
// Google (sense connexió, o una xarxa d'escola que el bloqueja) el document es
// continua veient tal com es va desar, i cap visita no envia res a Google.

/** Talla tot Google Fonts i apunta cada petició que s'hi intenti fer. */
const blockGoogleFonts = async (page: Page): Promise<string[]> => {
  const requests: string[] = [];
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  return requests;
};

/** Carrega una família al navegador i diu quantes cares n'ha trobat. */
const loadFont = (page: Page, family: string, weight = 400) =>
  page.evaluate(
    async ([f, w]) => (await document.fonts.load(`${w} 16px "${f}"`)).length,
    [family, weight] as const,
  );

test("cap petició a Google Fonts en obrir l'app", async ({ page }) => {
  const requests = await blockGoogleFonts(page);
  await page.goto("/ca/create-sequence", { waitUntil: "networkidle" });

  expect(requests).toEqual([]);
});

test("les fonts de Google es carreguen des de l'app, també en negreta", async ({
  page,
}) => {
  await blockGoogleFonts(page);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });

  for (const family of ["Abel", "Zilla Slab", "Slabo 27px", "Roboto"]) {
    expect(await loadFont(page, family), family).toBeGreaterThan(0);
  }
  expect(await loadFont(page, "Zilla Slab", 700)).toBeGreaterThan(0);
});

test("Atkinson Hyperlegible es pinta amb el nom que fa servir l'app", async ({
  page,
}) => {
  await blockGoogleFonts(page);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });

  // L'app la desa com a «Atkinson-Hyperlegible», amb guionet, i Google la
  // declarava «Atkinson Hyperlegible»: no casava mai
  expect(await loadFont(page, "Atkinson-Hyperlegible")).toBeGreaterThan(0);
});

test("les fonts pròpies continuen carregant-se", async ({ page }) => {
  await blockGoogleFonts(page);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });

  expect(await loadFont(page, "Escolar")).toBeGreaterThan(0);
});
