import { test, expect, Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// L'ordre dels pictogrames es canvia arrossegant la targeta a la graella
// d'edició, o amb «Mou abans» i «Mou després» del menú del pictograma.

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "dues-sequencies.saac",
);

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
});

/** La targeta per com comença el seu nom */
const card = (page: Page, name: string) =>
  page.getByRole("button", { name: new RegExp(`^${name}`) });

/**
 * Carrega el document de prova i hi deixa tres pictogrames: «prova», un de
 * buit i «prova» una altra vegada.
 */
const loadThreeCards = async (page: Page): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Menú principal" }).click();
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "2" })).toBeVisible();

  await card(page, "prova, pictograma 1").click({ button: "right" });
  await page.getByRole("button", { name: "Duplica a continuació" }).click();
  await card(page, "prova, pictograma 1").click({ button: "right" });
  await page.getByRole("button", { name: /^Insereix/ }).click();
  await expect(card(page, "prova, pictograma 3")).toBeVisible();
  // El menú tarda a tancar-se, i mentrestant la seva capa es queda el ratolí
  await expect(page.locator(".MuiPopover-root")).toHaveCount(0);
};

/** Arrossega una targeta damunt d'una altra amb el ratolí */
const drag = async (page: Page, from: string, to: string): Promise<void> => {
  const source = await card(page, from).boundingBox();
  const target = await card(page, to).boundingBox();
  if (!source || !target) throw new Error("targeta no trobada");
  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    { steps: 15 },
  );
  await page.mouse.up();
};

test("arrossegar una targeta damunt d'una altra en canvia l'ordre", async ({
  page,
}) => {
  await loadThreeCards(page);

  await drag(page, "prova, pictograma 1", "Pictograma 2");

  await expect(card(page, "Pictograma 1")).toBeVisible();
  await expect(card(page, "prova, pictograma 2")).toBeVisible();
  await expect(card(page, "prova, pictograma 3")).toBeVisible();
  // Deixar anar no obre el diàleg d'edició
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("deixar anar la targeta al seu lloc no la mou ni obre el diàleg", async ({
  page,
}) => {
  await loadThreeCards(page);
  const box = await card(page, "Pictograma 2").boundingBox();
  if (!box) throw new Error("targeta no trobada");

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2, {
    steps: 5,
  });
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 5,
  });
  await page.mouse.up();

  await expect(card(page, "Pictograma 2")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("un clic a la targeta continua obrint el diàleg", async ({ page }) => {
  await loadThreeCards(page);

  await card(page, "Pictograma 2").click();

  await expect(page.getByRole("dialog")).toBeVisible();
});

test("«Mou després» del menú canvia l'ordre", async ({ page }) => {
  await loadThreeCards(page);

  await card(page, "prova, pictograma 1").click({ button: "right" });
  await expect(page.getByRole("button", { name: "Mou abans" })).toHaveCount(0);
  await page.getByRole("button", { name: "Mou després" }).click();

  await expect(card(page, "Pictograma 1")).toBeVisible();
  await expect(card(page, "prova, pictograma 2")).toBeVisible();
});
