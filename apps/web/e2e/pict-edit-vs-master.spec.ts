import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// El modal d'edició del pictograma s'ha de veure igual que a master: la
// previsualització i la cerca a dalt, l'acordió a sota. Compara captures del
// diàleg (escriptori i 390×844, acordió plegat i desplegat, sense desplaçar,
// un pictograma sense retocs) de la branca amb les de master.
//
// Requereix dos servidors: el de la branca (`baseURL`) i el de master, a
// `MASTER_URL`. Sense `MASTER_URL`, es salta:
//   MASTER_URL=http://localhost:5174 npx playwright test e2e/pict-edit-vs-master.spec.ts

const MASTER_URL = process.env.MASTER_URL;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(
  HERE,
  "..",
  "test",
  "fixtures",
  "saac",
  "01-una-pestanya.saac",
);
const IMAGES = path.join(HERE, "fixtures", "images");
const LOCAL_IMAGE = fs.readFileSync(
  path.join(IMAGES, fs.readdirSync(IMAGES).find((n) => n.endsWith(".png"))!),
);

const VIEWPORTS = {
  escriptori: { width: 1280, height: 800 },
  mobil: { width: 390, height: 844 },
} as const;

test.skip(!MASTER_URL, "Cal MASTER_URL amb el servidor de master");

const mockNetwork = async (page: Page) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
  await page.route(/arasaac\.org\/.*pictograms\/\d+/, (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: LOCAL_IMAGE }),
  );
};

type Shots = { closed: Buffer; open: Buffer };
type Layout = Record<string, number[]>;

/** Posició i mida de les peces del modal, respecte del diàleg. */
const layout = (page: Page): Promise<Layout> =>
  page.getByRole("dialog").evaluate((dialog) => {
    const origin = dialog.getBoundingClientRect();
    const pieces: Record<string, string> = {
      contingut: ".MuiDialogContent-root",
      targeta: '[data-testid="card-pictogram"]',
      cerca: '[role="combobox"]',
      acordio: ".MuiAccordion-root",
      capcalera: ".MuiAccordionSummary-root",
      icona: ".MuiAccordionSummary-content svg",
      // La llista d'ajustos, i no tot el contingut: a master, al final hi
      // havia el botó «Restableix», que ara és a la franja «Personalitzat»
      ajustos: ".MuiAccordionDetails-root > ul",
    };
    const result: Record<string, number[]> = {};
    for (const [name, selector] of Object.entries(pieces)) {
      const element = dialog.querySelector(selector);
      if (!element) continue;
      const r = element.getBoundingClientRect();
      // L'alçada de l'acordió obert inclou l'antic botó «Restableix» (vegeu
      // `ajustos`): se'n compara la posició i l'amplada
      const box = [r.x - origin.x, r.y - origin.y, r.width, r.height];
      if (name === "acordio" && dialog.querySelector(".Mui-expanded"))
        box.pop();
      result[name] = box.map((n) => Math.round(n * 10) / 10);
    }
    return result;
  });

/** Captura el diàleg del primer pictograma, plegat i desplegat. */
const capture = async (
  page: Page,
  origin: string,
  viewport: { width: number; height: number },
): Promise<{ shots: Shots; layouts: { closed: Layout; open: Layout } }> => {
  await page.setViewportSize(viewport);
  await mockNetwork(page);
  await page.goto(`${origin}/ca/create-sequence`, {
    waitUntil: "domcontentloaded",
  });
  // A la branca, el selector de fitxers el munta el menú principal
  const menu = page.getByRole("button", { name: "Menú principal" });
  await page.waitForLoadState("networkidle");
  if (await menu.count()) {
    await menu.click();
    await page.keyboard.press("Escape");
  }
  await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
  const card = page.locator("button:has(.MuiCard-root)").first();
  await expect(card).toBeVisible();
  await card.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.locator(".MuiAccordionSummary-root")).toBeVisible();
  // Sense cap retoc: sense franja
  await expect(page.getByTestId("customized-strip")).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  // Com `toHaveScreenshot`: fins que dues captures seguides són iguals (les
  // vores de la targeta i el text encara es pinten un moment després)
  const shot = async () => {
    let previous = await dialog.screenshot({
      animations: "disabled",
      caret: "hide",
    });
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(250);
      const next = await dialog.screenshot({
        animations: "disabled",
        caret: "hide",
      });
      if (next.equals(previous)) return next;
      previous = next;
    }
    return previous;
  };
  const closed = await shot();
  const closedLayout = await layout(page);

  await dialog.locator(".MuiAccordionSummary-root").click();
  await expect(dialog.locator(".MuiCollapse-entered")).toBeVisible();
  await dialog
    .locator(".MuiDialogContent-root")
    .evaluate((el) => el.scrollTo(0, 0));
  const open = await shot();
  return {
    shots: { closed, open },
    layouts: { closed: closedLayout, open: await layout(page) },
  };
};

/** Píxels diferents entre dues captures, i la imatge de la diferència. */
const diff = async (
  page: Page,
  a: Buffer,
  b: Buffer,
): Promise<{ sameSize: boolean; different: number; image: string }> =>
  page.evaluate(
    async ([a64, b64]) => {
      const load = async (src: string) => {
        const img = new Image();
        img.src = `data:image/png;base64,${src}`;
        await img.decode();
        return img;
      };
      const [ia, ib] = await Promise.all([load(a64), load(b64)]);
      const width = Math.max(ia.width, ib.width);
      const height = Math.max(ia.height, ib.height);
      const pixels = (img: HTMLImageElement) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, width, height);
      };
      const pa = pixels(ia);
      const pb = pixels(ib);
      const out = document.createElement("canvas");
      out.width = width;
      out.height = height;
      const octx = out.getContext("2d")!;
      const result = octx.createImageData(width, height);
      let different = 0;
      // Les cantonades arrodonides del diàleg deixen veure la pàgina de
      // darrere, que no és la mateixa: no compten
      const CORNER = 40;
      const inCorner = (i: number) => {
        const x = (i / 4) % width;
        const y = Math.floor(i / 4 / width);
        return (
          (x < CORNER || x >= width - CORNER) &&
          (y < CORNER || y >= height - CORNER)
        );
      };
      for (let i = 0; i < pa.data.length; i += 4) {
        // Un píxel canvia si cap veí a 1 px de l'altra captura no s'hi
        // assembla: el text es rasteritza amb diferències d'antialiàsing
        // d'una càrrega a l'altra, fins i tot entre dues càrregues de master.
        // El layout exacte el comprova `layout()`
        const x = (i / 4) % width;
        const y = Math.floor(i / 4 / width);
        let matches = false;
        for (let dy = -1; dy <= 1 && !matches; dy++)
          for (let dx = -1; dx <= 1 && !matches; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const j = (ny * width + nx) * 4;
            matches =
              Math.abs(pa.data[i] - pb.data[j]) +
                Math.abs(pa.data[i + 1] - pb.data[j + 1]) +
                Math.abs(pa.data[i + 2] - pb.data[j + 2]) <=
              30;
          }
        const changed = !matches && !inCorner(i);
        if (changed) different++;
        const gray = (pa.data[i] + pa.data[i + 1] + pa.data[i + 2]) / 12 + 170;
        result.data[i] = changed ? 255 : gray;
        result.data[i + 1] = changed ? 0 : gray;
        result.data[i + 2] = changed ? 0 : gray;
        result.data[i + 3] = 255;
      }
      octx.putImageData(result, 0, 0);
      return {
        sameSize: ia.width === ib.width && ia.height === ib.height,
        different,
        image: out.toDataURL("image/png").split(",")[1],
      };
    },
    [a.toString("base64"), b.toString("base64")] as const,
  );

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test(`${name}: el modal és el de master`, async ({
    browser,
    baseURL,
  }, testInfo) => {
    const context = await browser.newContext();
    const master = await capture(
      await context.newPage(),
      MASTER_URL!,
      viewport,
    );
    const branchContext = await browser.newContext();
    const branch = await capture(
      await branchContext.newPage(),
      process.env.BRANCH_URL ?? baseURL!,
      viewport,
    );

    const page = await context.newPage();
    for (const state of ["closed", "open"] as const) {
      expect
        .soft(branch.layouts[state], `${state}: layout`)
        .toEqual(master.layouts[state]);
      const result = await diff(page, master.shots[state], branch.shots[state]);
      const save = async (label: string, data: Buffer) => {
        const file = testInfo.outputPath(`${name}-${state}-${label}.png`);
        fs.writeFileSync(file, data);
        await testInfo.attach(`${name}-${state}-${label}`, {
          path: file,
          contentType: "image/png",
        });
      };
      await save("master", master.shots[state]);
      await save("branca", branch.shots[state]);
      await save("diferencia", Buffer.from(result.image, "base64"));
      expect.soft(result.sameSize, `${state}: mateixa mida`).toBe(true);
      expect.soft(result.different, `${state}: píxels diferents`).toBe(0);
    }
    await context.close();
    await branchContext.close();
  });
}
