import { test, expect, devices, type Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// L'edició al mòbil (pla dels estils, pas 8; proves de §10.5): una seqüència
// per pantalla, sense pestanyes. Es passa de seqüència lliscant o amb les
// fletxes ‹ ›, «2 de 3» obre la llista, el «⋯» és el de sempre, i la cerca és
// a baix i puja amb el teclat (D22). Objectius tàctils de 44 px.

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "test",
  "fixtures",
  "saac",
  "20-estil-de-sequencia.saac",
);

const { defaultBrowserType: _browser, ...pixel } = devices["Pixel 7"];
test.use({ ...pixel, locale: "ca-ES" });

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

/** Obre la fixture 20: «Matí», «Sequence 2» (sense nom) i «Nit». */
const open = async (page: Page): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
  await expect(page.getByText("Fitxer carregat correctament")).toBeVisible();
};

const heading = (page: Page) =>
  page.getByTestId("sequence-header").getByRole("heading");

/** Un lliscament amb el dit (Playwright no en té): CDP, com a la vista */
const swipe = async (page: Page, fromX: number, toX: number, y: number) => {
  const cdp = await page.context().newCDPSession(page);
  const send = (type: "touchStart" | "touchMove" | "touchEnd", x = 0) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y }],
    });
  await send("touchStart", fromX);
  for (let step = 1; step <= 10; step += 1)
    await send("touchMove", fromX + ((toX - fromX) * step) / 10);
  await page.waitForTimeout(120);
  await send("touchEnd");
};

test("sense pestanyes ni comptador: la capçalera, la graella i la cerca a baix", async ({
  page,
}) => {
  await open(page);
  await expect(heading(page)).toHaveText("Matí");
  await expect(
    page.getByRole("tablist", { name: "Número de seqüència" }),
  ).toHaveCount(0);
  await expect(page.getByText("Pictogrames:")).toHaveCount(0);
  const bar = page.getByTestId("edit-bottom-bar");
  await expect(
    bar.getByRole("combobox", { name: /Cerca màgica/ }),
  ).toBeVisible();
  const box = (await bar.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(Math.round(box.y + box.height)).toBe(viewport.height);
});

test("les fletxes, lliscar i la llista «2 de 3» canvien de seqüència", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Seqüència següent" }).click();
  await expect(heading(page)).toHaveText("Seqüència 2");
  await page.getByRole("button", { name: "Seqüència anterior" }).click();
  await expect(heading(page)).toHaveText("Matí");

  // Lliscar cap a l'esquerra, sobre la graella, va a la següent
  const grid = (await page.getByTestId("sequence-swipe").boundingBox())!;
  const y = grid.y + 80;
  await swipe(page, grid.x + grid.width * 0.85, grid.x + grid.width * 0.15, y);
  await expect(heading(page)).toHaveText("Seqüència 2");
  await swipe(page, grid.x + grid.width * 0.15, grid.x + grid.width * 0.85, y);
  await expect(heading(page)).toHaveText("Matí");

  await page
    .getByRole("button", { name: "Seqüència 1 de 3. Totes les seqüències" })
    .click();
  await page.getByRole("menuitem", { name: /^3\. Nit/ }).click();
  await expect(heading(page)).toHaveText("Nit");
  await expect(
    page.getByRole("button", { name: "Seqüència següent" }),
  ).toBeDisabled();
});

test("el «⋯» és el de la seqüència oberta", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: /^Accions de «Matí»/ }).click();
  await expect(
    page.getByRole("menuitem", { name: "Treu aquesta seqüència" }),
  ).toBeVisible();
});

test("la barra de baix puja amb el teclat (viewport visible simulat)", async ({
  page,
}) => {
  await open(page);
  // Safari d'iOS no encongeix la finestra: el teclat tapa 300 px de baix
  await page.evaluate(() => {
    const visual = window.visualViewport!;
    Object.defineProperty(visual, "height", {
      configurable: true,
      get: () => window.innerHeight - 300,
    });
    visual.dispatchEvent(new Event("resize"));
  });
  const bar = page.getByTestId("edit-bottom-bar");
  await expect
    .poll(async () => {
      const box = (await bar.boundingBox())!;
      return Math.round(page.viewportSize()!.height - (box.y + box.height));
    })
    .toBe(300);
});

test("tots els controls de la capçalera fan 44 px com a mínim", async ({
  page,
}) => {
  await open(page);
  const header = page.getByTestId("sequence-header");
  for (const name of [
    "Seqüència anterior",
    "Seqüència següent",
    /^Estil:/,
    /^Accions de/,
  ]) {
    const box = (await header.getByRole("button", { name }).boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});
