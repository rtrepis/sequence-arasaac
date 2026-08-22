import { test, expect, type Page } from "@playwright/test";

// Feedback de la generació del PDF (backlog d'UX, A7).
//
// Requereix el servidor de desenvolupament engegat: `npm run dev` a apps/web.
// Executar amb: `npx playwright test e2e/download-pdf-feedback.spec.ts`
//
// Es prova sobre una seqüència buida a propòsit: el que s'hi mira és el feedback,
// no el contingut del full, i així no cal cap dada d'ARASAAC.

const PDF_BUTTON = "Descarregar PDF";
const GENERATING_TEXT = "S'està generant el PDF…";
const DOWNLOADED_TEXT = "PDF descarregat";

// Les fonts de Google se serveixen buides. Aquí es prova el feedback, no la
// tipografia, i html2canvas espera els fulls d'estil externs abans de capturar:
// amb dotzenes de famílies, el test dependria de la xarxa i trigaria eternament.
test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
});

/** Retarda la càrrega d'html2canvas perquè l'estat «generant» duri prou per mirar-lo */
const slowDownCapture = async (page: Page, delayMs: number): Promise<void> => {
  await page.route("**/html2canvas*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.continue();
  });
};

const gotoView = async (page: Page): Promise<void> => {
  await page.goto("/ca/view-sequence", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".preview-content")).toBeAttached();
};

test("diu que està generant, i ho diu com a regió d'estat", async ({ page }) => {
  await slowDownCapture(page, 2000);
  await gotoView(page);

  await page.getByRole("button", { name: PDF_BUTTON }).click();

  // El missatge del backdrop és concret, no un «Carregant…» genèric
  const notice = page.getByText(GENERATING_TEXT);
  await expect(notice).toBeVisible();

  // I viu dins d'una regió d'estat: sense això, qui no mira la pantalla no
  // s'assabenta que hi ha una operació bloquejant en marxa
  const statusRegion = page.locator('[role="status"]', {
    hasText: GENERATING_TEXT,
  });
  await expect(statusRegion).toHaveAttribute("aria-live", "polite");
});

test("el botó no surt de l'ordre de tabulació mentre genera", async ({
  page,
}) => {
  await slowDownCapture(page, 2000);
  await gotoView(page);

  const pdfButton = page.getByRole("button", { name: PDF_BUTTON });
  await pdfButton.focus();
  await page.keyboard.press("Enter");

  await expect(page.getByText(GENERATING_TEXT)).toBeVisible();

  // `disabled` trauria el botó de l'ordre de tabulació i el focus saltaria al
  // body sense cap anunci: la fallada original d'A7
  await expect(pdfButton).not.toHaveAttribute("disabled", /.*/);
  await expect(pdfButton).toHaveAttribute("aria-disabled", "true");
  await expect(pdfButton).toHaveAttribute("aria-busy", "true");
  await expect(pdfButton).toBeFocused();
});

test("confirma quan el PDF s'ha descarregat", async ({ page }) => {
  await gotoView(page);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: PDF_BUTTON }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sequencia.pdf");

  // L'estat final no pot ser idèntic a l'inicial: la barra de descàrregues del
  // navegador no compta, perquè a iPadOS gairebé no existeix
  await expect(page.getByText(DOWNLOADED_TEXT)).toBeVisible();

  // I el botó deixa de dir que està ocupat: es pot tornar a generar
  const pdfButton = page.getByRole("button", { name: PDF_BUTTON });
  await expect(pdfButton).toHaveAttribute("aria-busy", "false");
});

test("una fallada de la captura es diu i es registra", async ({ page }) => {
  // Canvas contaminat: el cas real que feia petar `toDataURL` sense que ningú
  // ho veiés, perquè el hook no tenia `catch`
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.toDataURL = () => {
      throw new DOMException("Tainted canvas", "SecurityError");
    };
  });

  // El registre d'errors del client, interceptat: aquí no hi ha backend
  const reported: Array<Record<string, unknown>> = [];
  await page.route("**/api/client-errors", async (route) => {
    reported.push(route.request().postDataJSON());
    await route.fulfill({ status: 204, body: "" });
  });

  await gotoView(page);
  await page.getByRole("button", { name: PDF_BUTTON }).click();

  // El codi va amb el missatge: s'ha de poder dictar sense obrir cap consola
  await expect(page.getByText(/No s'ha pogut generar el PDF/)).toBeVisible();
  await expect(page.getByText(/CLIENT_EXCEPTION/)).toBeVisible();

  // I no s'anuncia cap èxit que no ha passat
  await expect(page.getByText(DOWNLOADED_TEXT)).toBeHidden();

  // La fallada ha arribat al registre, no només a la pantalla
  await expect
    .poll(() => reported.length, { timeout: 5000 })
    .toBeGreaterThan(0);
  expect(reported[0]).toMatchObject({
    code: "CLIENT_EXCEPTION",
    context: "pdf-export",
  });

  // El backdrop es tanca encara que hagi petat: el `finally` no depèn de l'èxit
  await expect(page.getByText(GENERATING_TEXT)).toBeHidden();
});
