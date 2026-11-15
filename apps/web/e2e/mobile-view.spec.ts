import { test, expect, devices, Page, Locator } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// La vista al mòbil (fase 4 de `docs/PLA-vista-mobil.md`): el full a la
// pantalla i els ajustos al panell de baix. Els tres casos de §1 del pla, amb
// el dit de debò, en un telèfon i en una tauleta en vertical emulats:
//
// 1. Tornar al full: la pàgina no es desplaça, i el full no surt mai del tot
//    de la pantalla.
// 2. Arrossegar un bloc: el dit el mou, i ni la pàgina ni el panell es mouen.
// 3. Seleccionar la fila de dalt amb el full vertical: el panell puja a mig i
//    el bloc tocat continua a la vista, a sobre del panell.
//
// Requereix el servidor de desenvolupament engegat (`npx vite`, a apps/web).

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(HERE, "..", "test", "fixtures", "saac");
const IMAGES = path.join(HERE, "fixtures", "images");
const LOCAL_IMAGE = fs.readFileSync(
  path.join(
    IMAGES,
    fs.readdirSync(IMAGES).find((name) => name.endsWith(".png"))!,
  ),
);

/** Una pàgina en mode lliure, A4 vertical, amb dues pàgines i un bloc a dalt. */
const FREE_PORTRAIT = "16-mode-lliure.saac";
/** La pàgina única de sempre, amb diverses seqüències. */
const SIMPLE = "02-diverses-pestanyes.saac";

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("https://**.arasaac.org/**", (route) => route.abort());
  await page.route(/arasaac\.org\/.*pictograms\/\d+/, (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: LOCAL_IMAGE }),
  );
});

/** Obre un document de les fixtures i va a la vista. */
const openInView = async (page: Page, name: string): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(path.join(FIXTURES, name));
  const loaded = page.getByText("Fitxer carregat correctament");
  await expect(loaded).toBeVisible();
  await page.locator('a[href$="view-sequence"]').first().click();
  // L'avís sura damunt del panell: a sencer, taparia la franja de dalt
  await expect(loaded).toBeHidden({ timeout: 15000 });
  await expect(panel(page)).toBeVisible();
  await expectSnap(page, "collapsed");
};

const panel = (page: Page): Locator =>
  page.getByRole("region", { name: "Ajustos" });

/** On comença el panell, en px des de dalt de la finestra. */
const panelTop = async (page: Page): Promise<number> => {
  const box = await panel(page).boundingBox();
  if (!box) throw new Error("panell no trobat");
  return box.y;
};

/** Espera que el panell s'aturi a una parada. */
const expectSnap = async (page: Page, snap: string): Promise<void> => {
  await expect(panel(page)).toHaveAttribute("data-snap", snap);
  await expect
    .poll(async () => {
      const first = await panelTop(page);
      await page.waitForTimeout(80);
      return Math.abs((await panelTop(page)) - first);
    })
    .toBeLessThan(1);
};

/** El full que es veu: el marc de la pàgina activa. */
const sheet = (page: Page): Locator =>
  page.getByTestId("view-sheet-area").locator("[id^=view-page-frame-]");

const boxOf = async (
  locator: Locator,
): Promise<{ x: number; y: number; width: number; height: number }> => {
  const box = await locator.boundingBox();
  if (!box) throw new Error("element no trobat");
  return box;
};

/** Gestos tàctils de debò (Playwright no en té per arrossegar). */
const finger = async (page: Page) => {
  const cdp = await page.context().newCDPSession(page);
  const send = (type: "touchStart" | "touchMove" | "touchEnd", x = 0, y = 0) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y }],
    });

  return async (
    from: { x: number; y: number },
    to: { x: number; y: number },
    steps = 12,
  ): Promise<void> => {
    await send("touchStart", from.x, from.y);
    for (let step = 1; step <= steps; step += 1)
      await send(
        "touchMove",
        from.x + ((to.x - from.x) * step) / steps,
        from.y + ((to.y - from.y) * step) / steps,
      );
    // El dit s'atura abans d'aixecar-se: sense, Chromium emulat pren el gest
    // per un «fling» i es menja el toc següent (vegeu `bottom-sheet.spec.ts`)
    await page.waitForTimeout(120);
    await send("touchEnd");
  };
};

/** Un toc al centre d'un element, i un doble toc. */
const tapCenter = async (page: Page, locator: Locator): Promise<void> => {
  const box = await boxOf(locator);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
};
const doubleTapCenter = async (page: Page, locator: Locator): Promise<void> => {
  const box = await boxOf(locator);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(80);
  await page.touchscreen.tap(x, y);
};

const runSuite = (): void => {
  test("cas 1: la pàgina no es desplaça i el full no es perd mai", async ({
    page,
  }) => {
    await openInView(page, SIMPLE);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sense viewport");
    const drag = await finger(page);

    // Plegat: el full sencer a la pantalla, a sobre del panell
    let box = await boxOf(sheet(page));
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(await panelTop(page));

    // El dit que llisca amunt sobre el full no desplaça res
    await drag(
      { x: box.x + box.width / 2, y: box.y + box.height - 10 },
      { x: box.x + box.width / 2, y: box.y + 10 },
    );
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    // A mig, el full s'encongeix i hi cap sencer a sobre (E1)
    await page.getByRole("button", { name: "Mostra els ajustos" }).tap();
    await expectSnap(page, "half");
    await expect
      .poll(async () => {
        const current = await boxOf(sheet(page));
        return current.y + current.height <= (await panelTop(page)) + 1;
      })
      .toBe(true);
    box = await boxOf(sheet(page));
    expect(box.y).toBeGreaterThanOrEqual(0);

    // L'scroll de dins del panell tampoc no mou la pàgina
    const panelBox = await boxOf(panel(page));
    await drag(
      { x: panelBox.x + 40, y: panelBox.y + panelBox.height - 40 },
      { x: panelBox.x + 40, y: panelBox.y + 120 },
    );
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    // A sencer, del full en queda la franja, que torna a mig
    const header = page.getByTestId("app-bottom-sheet-header");
    const headerBox = await boxOf(header);
    await drag(
      { x: headerBox.x + 40, y: headerBox.y + 8 },
      { x: headerBox.x + 40, y: 20 },
    );
    await expectSnap(page, "full");
    await page.getByRole("button", { name: "Torna al full" }).tap();
    await expectSnap(page, "half");
    await expect(sheet(page)).toBeInViewport();
  });

  test("cas 2: arrossegar un bloc el mou, i no mou ni la pàgina ni el panell", async ({
    page,
  }) => {
    await openInView(page, FREE_PORTRAIT);
    const block = page.getByRole("button", { name: /^Tarda|^Matí/ }).first();
    // A la disposició lliure, un toc selecciona i el panell no puja (D1)
    await tapCenter(page, block);
    await expect(block).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(400);
    await expectSnap(page, "collapsed");

    const before = await boxOf(block);
    const drag = await finger(page);
    await drag(
      { x: before.x + before.width / 2, y: before.y + before.height / 2 },
      { x: before.x + before.width / 2, y: before.y + before.height / 2 + 60 },
      20,
    );

    await expect
      .poll(async () => (await boxOf(block)).y - before.y)
      .toBeGreaterThan(20);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expectSnap(page, "collapsed");
  });

  test("cas 3: tocar la fila de dalt del full vertical porta el panell a mig, i el bloc es veu", async ({
    page,
  }) => {
    await openInView(page, FREE_PORTRAIT);
    // El bloc de dalt de tot de la pàgina (el comú, «Avui»)
    const top = page
      .getByTestId("view-sheet-area")
      .locator(".placement [role=button]")
      .first();

    // A la disposició lliure, el doble toc obre els ajustos (D1)
    await doubleTapCenter(page, top);
    await expectSnap(page, "half");
    await expect(top).toHaveAttribute("aria-pressed", "true");

    // El bloc tocat, sencer a sobre del panell
    await expect
      .poll(async () => {
        const box = await boxOf(top);
        return box.y >= 0 && box.y + box.height <= (await panelTop(page)) + 1;
      })
      .toBe(true);
    // I el seu nivell, obert a dalt del panell
    const levelHeader = page.locator("#view-level-block-header");
    await expect(levelHeader).toHaveAttribute("aria-expanded", "true");
    await expect(levelHeader).toBeInViewport();
  });

  test("a sobre del full només hi ha les sortides; la barra s'amaga amb el panell", async ({
    page,
  }) => {
    await openInView(page, FREE_PORTRAIT);
    await expect(page.getByRole("button", { name: "Imprimir" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Orientació de pàgina" }),
    ).toHaveCount(0);
    await expect(
      page.getByTestId("app-bottom-sheet-header").getByText("Pàgina 1 de 2"),
    ).toBeVisible();

    const bar = page.locator("header.MuiAppBar-root");
    await expect(bar).toBeInViewport();
    await page.getByRole("button", { name: "Mostra els ajustos" }).tap();
    await expectSnap(page, "half");
    await expect(bar).not.toBeInViewport();
    await page.getByRole("button", { name: "Amaga els ajustos" }).tap();
    await expectSnap(page, "collapsed");
    await expect(bar).toBeInViewport();
  });

  test("tocar la vora fa sortir la fletxa, que passa de pàgina", async ({
    page,
  }) => {
    await openInView(page, FREE_PORTRAIT);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sense viewport");
    const next = page.getByRole("button", { name: "Pàgina següent" });
    await expect(next).toHaveAttribute("data-shown", "false");

    // La vora dreta, a l'alçada del full però fora dels blocs
    const box = await boxOf(sheet(page));
    await page.touchscreen.tap(viewport.width - 8, box.y + box.height - 8);
    await expect(next).toHaveAttribute("data-shown", "true");
    await expectSnap(page, "collapsed");

    await next.tap();
    await expect(
      page.getByTestId("app-bottom-sheet-header").getByText("Pàgina 2 de 2"),
    ).toBeVisible();
    // Als 2 segons, desapareix
    await expect(
      page.getByRole("button", { name: "Pàgina anterior" }),
    ).toHaveAttribute("data-shown", "false", { timeout: 4000 });
  });

  test("a la pantalla completa es passa de pàgina lliscant (N1)", async ({
    page,
  }) => {
    await openInView(page, FREE_PORTRAIT);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sense viewport");
    await page
      .getByRole("button", { name: "Aquesta pàgina a pantalla completa" })
      .tap();
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.id ?? ""))
      .toBe("view-pages");

    const drag = await finger(page);
    const y = viewport.height / 2;
    await drag({ x: viewport.width * 0.8, y }, { x: viewport.width * 0.2, y });

    // La pàgina 2 és la que es veu a la pantalla completa
    await expect(page.locator("#view-page-1")).toBeVisible();
    await expect(page.locator("#view-page-0")).toBeHidden();
    // I no s'hi selecciona res: tocar el full no hi treu el panell
    await page.touchscreen.tap(viewport.width / 2, y);
    await expect(panel(page)).toHaveAttribute("data-snap", "collapsed");
  });
};

test.use({ locale: "ca-ES" });

test.describe("al telèfon (Pixel 7)", () => {
  const { defaultBrowserType: _browser, ...pixel } = devices["Pixel 7"];
  test.use(pixel);
  runSuite();
});

test.describe("a la tauleta en vertical (iPad Mini)", () => {
  const { defaultBrowserType: _browser, ...ipad } = devices["iPad Mini"];
  test.use(ipad);
  runSuite();
});

test.describe("al telèfon girat (Pixel 7 apaïsat)", () => {
  const { defaultBrowserType: _browser, ...turned } =
    devices["Pixel 7 landscape"];
  test.use(turned);

  test("surt la capa que demana posar el mòbil dret (N3)", async ({ page }) => {
    await page.goto("/ca/view-sequence", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("status").filter({ hasText: "Gira el mòbil" }),
    ).toBeVisible();
  });
});
