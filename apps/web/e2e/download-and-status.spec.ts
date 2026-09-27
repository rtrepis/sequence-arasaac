import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { FLOATING_EDGE_GAP } from "../src/style/appShape";

// Fixa el que van resoldre C8 i C7 del backlog d'UX:
//
// - C8: a «Descarrega», el que es pinta i el que se n'endú el fitxer han de ser
//   el mateix valor. Abans eren dues caselles; ara són dues accions, «Desa la
//   seqüència» (sempre amb l'estil) i «Desa l'estil» (docs/fonaments/sequencia-i-estil.md).
// - C7: per sota de `sm` el Snackbar de MUI s'estén de banda a banda i tapava el
//   `DocumentStatusFab` justament quan l'usuari acabava de desar. Els avisos
//   comparteixen ara l'àncora dels controls flotants (16 px), de manera que
//   l'avís i el botó tenen la mateixa base i el mateix marge de cantó (C19).

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "dues-sequencies.saac",
);

// Amplada de mòbil: per sota del breakpoint `sm` (600px), que és on el snackbar
// ocupa tota l'amplada inferior
const MOBILE = { width: 390, height: 844 };

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

test("«Desa la seqüència» s'endú sempre l'estil, i «Desa l'estil» només l'estil", async ({
  page,
}) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();

  const save = async (button: string) => {
    await page.getByRole("button", { name: "Menú principal" }).click();
    await page.getByRole("button", { name: "Descarrega" }).click();
    const dialog = page.getByRole("dialog");
    // Ja no hi ha caselles: no es pot desar una seqüència sense estil
    await expect(dialog.getByRole("checkbox")).toHaveCount(0);
    const download = page.waitForEvent("download");
    await dialog.getByRole("button", { name: button }).click();
    const file = await (await download).createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of file) chunks.push(Buffer.from(chunk));
    return {
      name: (await download).suggestedFilename(),
      json: JSON.parse(Buffer.concat(chunks).toString("utf8")),
    };
  };

  const sequence = await save("Desa la seqüència");
  expect(sequence.name).toMatch(/\.saac$/);
  expect(sequence.json.schemaVersion).toBe(2);
  expect(sequence.json.documentState).toHaveProperty("defaultSettings");
  expect(sequence.json.documentState).toHaveProperty("styleView");
  // Les preferències d'interfície no entren mai dins del document
  expect(sequence.json).not.toHaveProperty("defaultSettings");

  const style = await save("Desa l'estil");
  expect(style.name).toMatch(/\.saacstyle$/);
  expect(Object.keys(style.json).sort()).toEqual(["schemaVersion", "style"]);
});

test("el snackbar no tapa el botó d'estat en mòbil", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");

  const fab = page.getByRole("button", { name: /On es desa la feina/ });
  await expect(fab).toBeVisible();

  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();

  // El `Grow` de MUI encara està escalant l'avís quan es fa visible: mesurar-lo
  // abans que acabi dona una caixa més petita i enfonsada que la definitiva
  await expect
    .poll(() => alert.evaluate((node) => getComputedStyle(node).transform))
    .toBe("none");

  const fabBox = await fab.boundingBox();
  const alertBox = await alert.boundingBox();
  expect(fabBox).not.toBeNull();
  expect(alertBox).not.toBeNull();

  // El snackbar acaba abans que comenci el botó: no hi ha encavalcament
  // horitzontal, que és l'única manera de conviure a la mateixa franja de baix
  expect(alertBox!.x + alertBox!.width).toBeLessThanOrEqual(fabBox!.x);

  // I hi conviuen alineats: la mateixa base que el botó —els 8 px de MUI el
  // deixaven caure per sota— i l'àncora de la casa al cantó esquerre
  const alertBottom = alertBox!.y + alertBox!.height;
  const fabBottom = fabBox!.y + fabBox!.height;
  expect(Math.abs(alertBottom - fabBottom)).toBeLessThanOrEqual(1);
  expect(Math.abs(alertBox!.x - FLOATING_EDGE_GAP)).toBeLessThanOrEqual(1);
});
