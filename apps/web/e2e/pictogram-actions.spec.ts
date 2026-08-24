import { test, expect, type Page } from "@playwright/test";

// Accions d'un pictograma des del diàleg d'edició (backlog d'UX, A8).
//
// Requereix el servidor de desenvolupament engegat: `npm run dev` a apps/web.
// Executar amb: `npx playwright test e2e/pictogram-actions.spec.ts`
//
// El menú contextual s'obre amb `contextmenu`, un esdeveniment que el WebKit
// d'iOS no dispara mai: allà, copiar, enganxar, inserir i duplicar no tenien
// cap altra porta. La que hi ha ara és el menú del diàleg, i és la que es prova
// aquí — el clic dret hi entra només per comprovar que ja no tapa la targeta.

const ADD_PICTOGRAM = "Afegir pictograma buit";
const MORE_ACTIONS = "Més accions";
const PASTE = "Enganxa (substitueix)";
const DUPLICATE = "Duplica a continuació";

// Les fonts de Google se serveixen buides: aquí es prova el comportament del
// menú, no la tipografia, i així la prova no depèn de la xarxa.
test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
});

const cards = (page: Page) => page.locator("button:has(> .MuiCard-root)");

/** Obre l'editor amb `amount` pictogrames buits */
const gotoEditor = async (page: Page, amount: number): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  const add = page.getByRole("button", { name: ADD_PICTOGRAM });
  await expect(add).toBeEnabled();
  for (let index = 0; index < amount; index++) await add.click();
  await expect(cards(page)).toHaveCount(amount);
};

/**
 * Escriu el text d'un pictograma dins del diàleg obert. El camp viu a
 * l'acordió de configuració, plegat per defecte, i és el segon camp de text
 * del diàleg: el primer és el cercador de pictogrames.
 */
const typePictogramText = async (page: Page, text: string): Promise<void> => {
  const dialog = page.getByRole("dialog");
  const accordion = dialog
    .getByRole("button", { name: /Configuracions/i })
    .first();
  if ((await accordion.getAttribute("aria-expanded")) !== "true") {
    await accordion.click();
  }
  const field = dialog.locator("input[type='text']").nth(1);
  await expect(field).toBeVisible();
  await field.fill(text);
};

/** Tria una acció del menú del diàleg d'edició */
const runDialogAction = async (page: Page, action: string): Promise<void> => {
  await page
    .getByRole("dialog")
    .getByRole("button", { name: MORE_ACTIONS })
    .click();
  await page.getByRole("button", { name: action }).click();
};

test("el menú contextual no tapa el pictograma que descriu", async ({
  page,
}) => {
  await gotoEditor(page, 1);
  const card = cards(page).first();
  await card.click({ button: "right" });

  const popover = page.locator(".MuiPopover-paper");
  await expect(popover).toBeVisible();

  // El menú diu «Pictograma 1»: s'ha de poder comprovar que l'1 és el que es
  // tenia al davant, i per això comença per sota de la targeta
  const cardBox = await card.boundingBox();
  const popoverBox = await popover.boundingBox();
  expect(cardBox && popoverBox).toBeTruthy();
  expect(popoverBox!.y).toBeGreaterThanOrEqual(
    cardBox!.y + cardBox!.height - 1,
  );
});

test("el diàleg ofereix les accions que no tenen cap altra via, i no repeteix les que sí", async ({
  page,
}) => {
  await gotoEditor(page, 1);
  await cards(page).first().click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: MORE_ACTIONS })
    .click();

  const items = page.locator(".MuiPopover-paper").getByRole("button");
  await expect(items).toHaveText([
    "Copia",
    PASTE,
    "Insereix un buit a continuació",
    DUPLICATE,
  ]);
});

test("enganxar des del diàleg no queda desfet pel desat del formulari", async ({
  page,
}) => {
  await gotoEditor(page, 2);

  // Un pictograma amb text, per poder distingir-lo del que el rep
  await cards(page).nth(0).click();
  await typePictogramText(page, "hola");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Tancar" })
    .click();
  await expect(cards(page).nth(0)).toHaveText("hola");

  await cards(page).nth(0).click({ button: "right" });
  await page.getByRole("button", { name: "Copia", exact: true }).click();

  // El formulari desa el seu estat local en tancar-se: si l'acció no s'ajorna
  // fins que el diàleg ha sortit, aquell desat desfà l'enganxada i sembla que
  // el menú no hagi fet res
  await cards(page).nth(1).click();
  await runDialogAction(page, PASTE);

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(cards(page).nth(1)).toHaveText("hola");
});

test("duplicar des del diàleg insereix la còpia just després", async ({
  page,
}) => {
  await gotoEditor(page, 1);

  await cards(page).nth(0).click();
  await typePictogramText(page, "hola");
  await runDialogAction(page, DUPLICATE);

  await expect(cards(page)).toHaveCount(2);
  // La còpia porta el que s'acabava d'escriure, no el que hi havia en obrir
  await expect(cards(page).nth(0)).toHaveText("hola");
  await expect(cards(page).nth(1)).toHaveText("hola");
});
