import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Fixa el que van resoldre C8 i C7 del backlog d'UX:
//
// - C8: a «Descarrega», el que es pinta i el que se n'endú el fitxer han de ser
//   el mateix valor. Abans, la configuració entrava dins del `.saac` amb la
//   casella desmarcada.
// - C7: per sota de `sm` el Snackbar de MUI s'estén de banda a banda i tapava el
//   `DocumentStatusFab` justament quan l'usuari acabava de desar.

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

test("el .saac s'endú exactament el que diuen les caselles", async ({
  page,
}) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();

  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Descarrega" }).click();

  const sequence = page.getByRole("checkbox", { name: "Seqüència" });
  const settings = page.getByRole("checkbox", {
    name: "Configuració predeterminada",
  });

  // El que es veu: la seqüència marcada, la configuració no
  await expect(sequence).toBeChecked();
  await expect(settings).not.toBeChecked();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Desa/ }).click();
  const file = await (await download).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of file) chunks.push(Buffer.from(chunk));
  const saved = JSON.parse(Buffer.concat(chunks).toString("utf8"));

  // El que es desa: el mateix
  expect(saved).toHaveProperty("documentState");
  expect(saved).not.toHaveProperty("defaultSettings");
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

  const fabBox = await fab.boundingBox();
  const alertBox = await alert.boundingBox();
  expect(fabBox).not.toBeNull();
  expect(alertBox).not.toBeNull();

  // El snackbar acaba abans que comenci el botó: no hi ha encavalcament
  // horitzontal, que és l'única manera de conviure a la mateixa franja de baix
  expect(alertBox!.x + alertBox!.width).toBeLessThanOrEqual(fabBox!.x);
});
