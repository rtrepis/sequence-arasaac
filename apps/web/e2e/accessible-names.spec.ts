import { test, expect } from "@playwright/test";

// Fixa el que van resoldre B4, B5, B6, C5 i C12 del backlog d'UX: que cap
// control quedi sense nom accessible i que cap nom torni a sortir en anglès en
// una app de cinc idiomes. Són noms, no aspecte: si algun dia es reescriuen els
// textos, aquesta prova és el lloc on consta quins veu un lector de pantalla.

// Els aria-label en anglès que hi havia escrits a mà als grups de toggles
const ENGLISH_ORPHANS = ["left", "right", "center", "top", "bottom"];

const expectNoEnglishOrphans = async (page: import("@playwright/test").Page) => {
  for (const orphan of ENGLISH_ORPHANS) {
    await expect(page.locator(`[aria-label="${orphan}"]`)).toHaveCount(0);
  }
};

test("els controls de seqüències es diuen en l'idioma de l'app", async ({
  page,
}) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });

  // B6: els dos botons eren català hardcodat, sense passar per react-intl
  await page.getByRole("button", { name: "Afegeix una seqüència" }).click();
  await expect(
    page.getByRole("button", { name: "Elimina l'última seqüència" }),
  ).toBeVisible();
  await expect(
    page.getByRole("tablist", { name: "Número de seqüència" }),
  ).toBeVisible();

  // B4: els tabs i el drawer comparteixen un sol parell de missatges
  await expect(page.getByRole("tab", { name: "Editar" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Vista" })).toBeVisible();
  await page.getByRole("button", { name: "Menú principal" }).click();
  await expect(page.getByRole("button", { name: "Editar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Vista" })).toBeVisible();
});

test("la columna de la pàgina de vista té tots els controls amb nom", async ({
  page,
}) => {
  await page.goto("/ca/view-sequence", { waitUntil: "domcontentloaded" });

  // C12: el desplegable arribava al lector de pantalla com un combobox sense nom
  await expect(page.getByLabel("Mida de pàgina")).toBeVisible();

  // C5: el tooltip i l'aria-label surten ara del mateix missatge
  await expect(
    page.getByRole("button", { name: "Seqüència en files" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Esquerra" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Dalt" })).toBeVisible();
  await expectNoEnglishOrphans(page);

  // B5: el botó diu el seu àmbit, i el tooltip (describeChild) no li pren el nom
  await expect(
    page.getByRole("button", { name: "Restaura les seqüències" }),
  ).toBeVisible();
});

test("els botons de restaurar del modal diuen cadascun el seu àmbit", async ({
  page,
}) => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.getByRole("button", { name: "Configuració" }).click();

  await page.getByRole("tab", { name: "Pictogrames" }).click();
  await expect(
    page.getByRole("button", { name: "Restaura els pictogrames" }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Vista" }).click();
  await expect(
    page.getByRole("button", { name: "Restaura la vista" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Esquerra" })).toBeVisible();
  await expectNoEnglishOrphans(page);
});
