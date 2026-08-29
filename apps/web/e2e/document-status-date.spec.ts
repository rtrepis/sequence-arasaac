import { test, expect, Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Fixa el que va resoldre C15 del backlog d'UX: l'indicador d'estat deia l'hora
// però no el dia, i és per a qui torna — justament qui no sap de quin dia és
// l'hora que llegeix. Amb un esborrany que pot ser de fa dies, «des de les
// 18:42» no vol dir res.
//
// El temps es fa passar amb `page.clock`, com al pla del desvetllament: esperar
// fins demà no és una prova.

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "dues-sequencies.saac",
);

test.use({ locale: "ca-ES" });

const stubNetwork = async (page: Page) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
};

const loadFixture = async (page: Page) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();
};

const statusFab = (page: Page) =>
  page.getByRole("button", { name: /On es desa la feina/ });

test("d'avui diu l'hora; d'un altre dia, també el dia", async ({ page }) => {
  // Migdia, per no quedar a tocar del canvi de dia
  await page.clock.install({ time: new Date("2026-08-28T12:00:00") });
  await stubNetwork(page);
  await loadFixture(page);

  // Carregar el fitxer declara la còpia en fitxer: avui, hora sola
  await expect(statusFab(page)).toHaveAccessibleName(
    /Descarregat en un fitxer a les \d{1,2}:\d{2}/,
  );

  // L'endemà, la mateixa còpia s'ha de datar
  await page.clock.setSystemTime(new Date("2026-08-29T09:00:00"));
  await page.getByRole("tab", { name: "1" }).click();

  await expect(statusFab(page)).toHaveAccessibleName(
    /Descarregat en un fitxer el 28\/8\/26 a les \d{1,2}:\d{2}/,
  );
});

test("una feina d'ahir a última hora surt amb data, encara que faci poc", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-08-28T23:50:00") });
  await stubNetwork(page);
  await loadFixture(page);

  await expect(statusFab(page)).toHaveAccessibleName(
    /Descarregat en un fitxer a les \d{1,2}:\d{2}/,
  );

  // Quaranta minuts després, però ja és un altre dia de calendari
  await page.clock.setSystemTime(new Date("2026-08-29T00:30:00"));
  await page.getByRole("tab", { name: "1" }).click();

  await expect(statusFab(page)).toHaveAccessibleName(
    /Descarregat en un fitxer el 28\/8\/26/,
  );
});
