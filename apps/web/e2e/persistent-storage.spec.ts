import { test, expect, Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Fixa el que va resoldre C16 del backlog d'UX: l'esborrany vivia en
// emmagatzematge que el navegador pot desallotjar i ningú li havia demanat mai
// que no ho fes.
//
// `navigator.storage` es reemplaça per un doble que compta les crides: el
// comportament real de `persist()` el decideix cada navegador (Chrome amb una
// heurística silenciosa, Firefox amb un diàleg que vol un gest de l'usuari), i
// el que aquí es pot comprovar és que es demana, quan es demana i que no es
// demana dues vegades.

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "dues-sequencies.saac",
);

interface StorageDouble {
  persisted: boolean;
}

declare global {
  interface Window {
    __persistCalls: number;
  }
}

const installStorageDouble = (page: Page, { persisted }: StorageDouble) =>
  page.addInitScript((alreadyPersisted) => {
    window.__persistCalls = 0;
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: {
        persisted: () => Promise.resolve(alreadyPersisted),
        persist: () => {
          window.__persistCalls += 1;
          return Promise.resolve(true);
        },
      },
    });
  }, persisted);

const persistCalls = (page: Page): Promise<number> =>
  page.evaluate(() => window.__persistCalls);

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

const loadFixture = async (page: Page) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();
};

test("desar el primer esborrany demana que no el desallotgin", async ({
  page,
}) => {
  await installStorageDouble(page, { persisted: false });
  await loadFixture(page);

  // El desat va amb un segon de retard
  await expect.poll(() => persistCalls(page)).toBe(1);

  // I només una vegada per càrrega: obrir el botó d'estat no en demana una altra
  await page.getByRole("button", { name: /On es desa la feina/ }).click();
  await page.waitForTimeout(300);
  expect(await persistCalls(page)).toBe(1);
});

test("obrir el botó d'estat també ho demana, que és el camí de Firefox", async ({
  page,
}) => {
  await installStorageDouble(page, { persisted: false });

  // Sense document no s'escriu cap esborrany, així que la primera petició no
  // pot venir del desat: ha de venir del gest
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  expect(await persistCalls(page)).toBe(0);

  await page.getByRole("button", { name: /On es desa la feina/ }).click();
  await expect.poll(() => persistCalls(page)).toBe(1);
});

test("si ja està concedit no es demana res", async ({ page }) => {
  await installStorageDouble(page, { persisted: true });
  await loadFixture(page);

  await page.getByRole("button", { name: /On es desa la feina/ }).click();
  await page.waitForTimeout(1800);

  expect(await persistCalls(page)).toBe(0);
});

test("un navegador sense l'API no en surt perjudicat", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: undefined,
    });
  });

  await loadFixture(page);

  // La feina es continua desant i recuperant igual: aquest pla no pot
  // empitjorar res
  await page.waitForTimeout(1600);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();
});
