import { test, expect, devices, Page, Locator } from "@playwright/test";

// `AppBottomSheet` sol (fase 3 de `docs/plans/fets/PLA-vista-mobil.md`), amb el dit de
// debò, en un telèfon i en una tauleta emulats. El munta l'arnès
// `e2e/harness/bottom-sheet.html`: la vista encara no el fa servir (fase 4).

const HARNESS = "/e2e/harness/bottom-sheet.html";

/** Franja que el panell deixa a dalt a sencer (`BOTTOM_SHEET_TOP_GAP`). */
const TOP_GAP = 64;

const sheet = (page: Page): Locator =>
  page.getByRole("region", { name: "Ajustos" });

const header = (page: Page): Locator =>
  page.getByTestId("app-bottom-sheet-header");

/** On comença el panell, en px des de dalt de la finestra. */
const sheetTop = async (page: Page): Promise<number> => {
  const box = await sheet(page).boundingBox();
  if (!box) throw new Error("panell no trobat");
  return box.y;
};

/** Espera que el panell s'aturi a una parada (la transició dura 250 ms). */
const expectSnap = async (page: Page, snap: string): Promise<void> => {
  await expect(sheet(page)).toHaveAttribute("data-snap", snap);
  // Dues lectures iguals seguides: el panell ja no es mou
  await expect
    .poll(async () => {
      const first = await sheetTop(page);
      await page.waitForTimeout(80);
      return Math.abs((await sheetTop(page)) - first);
    })
    .toBeLessThan(1);
};

/** Gestos tàctils de debò (Playwright no en té per arrossegar). */
const finger = async (page: Page) => {
  const cdp = await page.context().newCDPSession(page);
  const send = (type: "touchStart" | "touchMove" | "touchEnd", x = 0, y = 0) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y }],
    });

  /**
   * Arrossega de (x, fromY) a (x, toY) en `steps` passos. Amb `pause`, el dit
   * s'atura a cada pas: és un gest lent, i el panell va a la parada més propera
   * i no a la següent. Amb `hold`, el dit s'atura abans d'aixecar-se.
   *
   * Sense `hold`, Chromium emulat pren el gest per un «fling» i es menja el toc
   * següent, com si servís per aturar-lo: un toc a la franja just després
   * d'arrossegar no faria res. A un mòbil de debò es comprova a la fase 5.
   */
  return async (
    x: number,
    fromY: number,
    toY: number,
    {
      steps = 12,
      pause = 0,
      hold = 0,
    }: { steps?: number; pause?: number; hold?: number } = {},
  ): Promise<void> => {
    await send("touchStart", x, fromY);
    for (let step = 1; step <= steps; step += 1) {
      await send("touchMove", x, fromY + ((toY - fromY) * step) / steps);
      if (pause) await page.waitForTimeout(pause);
    }
    if (hold) await page.waitForTimeout(hold);
    await send("touchEnd");
  };
};

/** Un punt de la nansa, a l'esquerra del botó de la capçalera. */
const grabPoint = async (page: Page): Promise<{ x: number; y: number }> => {
  const box = await header(page).boundingBox();
  if (!box) throw new Error("capçalera no trobada");
  return { x: box.x + 40, y: box.y + 8 };
};

const runSuite = (): void => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HARNESS);
    await expect(sheet(page)).toBeVisible();
    await expectSnap(page, "collapsed");
  });

  test("plegat, només es veu la capçalera", async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sense viewport");
    const headerBox = await header(page).boundingBox();
    if (!headerBox) throw new Error("capçalera no trobada");

    await expectSnap(page, "collapsed");
    expect(
      Math.abs(viewport.height - headerBox.height - (await sheetTop(page))),
    ).toBeLessThan(2);
    await expect(page.getByText("Document › Pàgina 1")).toBeVisible();
    await expect(page.getByLabel("Ajust 1", { exact: true })).toBeHidden();
  });

  test("tocar el botó el porta a mig, al 50 % de la pantalla", async ({
    page,
  }) => {
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sense viewport");

    const show = page.getByRole("button", { name: "Mostra els ajustos" });
    await expect(show).toHaveAttribute("aria-expanded", "false");
    // Amagat a la vista, però a l'ordre de tabulació: s'hi arriba amb el teclat
    await show.press("Enter");

    await expectSnap(page, "half");
    expect(Math.abs((await sheetTop(page)) - viewport.height / 2)).toBeLessThan(
      2,
    );
    await expect(
      page.getByRole("button", { name: "Amaga els ajustos" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByLabel("Ajust 1", { exact: true })).toBeVisible();
  });

  test("el botó d'estat es queda damunt del panell plegat, i el panell el tapa quan puja", async ({
    page,
  }) => {
    const fab = page.getByRole("button", { name: /^On es desa la feina/ });
    const fabBox = async (): Promise<{ y: number; bottom: number }> => {
      const box = await fab.boundingBox();
      if (!box) throw new Error("botó d'estat no trobat");
      return { y: box.y, bottom: box.y + box.height };
    };

    await expectSnap(page, "collapsed");
    const collapsed = await fabBox();
    expect(collapsed.bottom).toBeLessThanOrEqual(await sheetTop(page));

    await page
      .getByRole("button", { name: "Mostra els ajustos" })
      .press("Enter");
    await expectSnap(page, "half");
    // No es mou, i el panell hi passa per damunt: el dit hi toca el panell
    expect((await fabBox()).y).toBe(collapsed.y);
    expect(collapsed.y).toBeGreaterThan(await sheetTop(page));
    const box = await fab.boundingBox();
    if (!box) throw new Error("botó d'estat no trobat");
    const onPanel = await page.evaluate(
      ([x, y]) =>
        Boolean(
          document.elementFromPoint(x, y)?.closest("[role=region][data-snap]"),
        ),
      [box.x + box.width / 2, box.y + box.height / 2] as const,
    );
    expect(onPanel).toBe(true);

    // En baixar el panell, torna a ser a la vista
    await page
      .getByRole("button", { name: "Amaga els ajustos" })
      .press("Enter");
    await expectSnap(page, "collapsed");
    await expect(fab).toBeInViewport();
  });

  test("arrossegant la nansa fins a dalt va a sencer, i la franja torna a mig", async ({
    page,
  }) => {
    const drag = await finger(page);
    const { x, y } = await grabPoint(page);

    await drag(x, y, 10, { hold: 300 });

    await expectSnap(page, "full");
    expect(Math.abs((await sheetTop(page)) - TOP_GAP)).toBeLessThan(2);

    const strip = page.getByRole("button", { name: "Torna al full" });
    const stripBox = await strip.boundingBox();
    expect(stripBox?.y).toBe(0);
    expect(stripBox?.height).toBe(TOP_GAP);

    await strip.tap();
    await expectSnap(page, "half");
    await expect(strip).toHaveCount(0);
  });

  test("un gest lent s'atura a la parada més propera", async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sense viewport");
    const drag = await finger(page);
    const { x, y } = await grabPoint(page);

    // Fins a una mica per sota de la meitat, a poc a poc (uns 0,2 px/ms, per
    // sota del llindar del gest ràpid)
    await drag(x, y, viewport.height * 0.55, { steps: 40, pause: 40 });

    await expectSnap(page, "half");
  });

  test("arrossegant la nansa cap avall, de mig a plegat", async ({ page }) => {
    await page
      .getByRole("button", { name: "Mostra els ajustos" })
      .press("Enter");
    await expectSnap(page, "half");

    const drag = await finger(page);
    const { x, y } = await grabPoint(page);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sense viewport");

    await drag(x, y, viewport.height - 10);

    await expectSnap(page, "collapsed");
    await expect(
      page.getByRole("button", { name: "Mostra els ajustos" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("el contingut fa scroll per dins i no mou el panell", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Mostra els ajustos" })
      .press("Enter");
    await expectSnap(page, "half");
    const before = await sheetTop(page);

    // Lliscar cap amunt sobre el contingut, fora dels lliscadors
    const label = await page
      .getByText("Ajust 3", { exact: true })
      .boundingBox();
    if (!label) throw new Error("ajust no trobat");
    const drag = await finger(page);
    await drag(label.x + 4, label.y + label.height / 2, label.y - 200);

    await expectSnap(page, "half");
    expect(Math.abs((await sheetTop(page)) - before)).toBeLessThan(1);
    // L'últim ajust s'hi pot arribar: el contingut és sencer a mig
    await page.getByLabel("Ajust 30").scrollIntoViewIfNeeded();
    await expect(page.getByLabel("Ajust 30")).toBeInViewport();
    await expectSnap(page, "half");
  });

  test("res del panell no surt al paper", async ({ page }) => {
    await page
      .getByRole("button", { name: "Mostra els ajustos" })
      .press("Enter");
    await expectSnap(page, "half");
    await page.emulateMedia({ media: "print" });

    await expect(sheet(page)).toBeHidden();
  });
};

test.use({ locale: "ca-ES" });

test.describe("al telèfon (Pixel 7)", () => {
  const { defaultBrowserType: _browser, ...pixel } = devices["Pixel 7"];
  test.use(pixel);
  runSuite();
});

test.describe("a la tauleta en vertical (iPad Mini)", () => {
  // El panell també hi va, per sota de `md` (M7). Amb Chromium: la suite no
  // canvia de navegador dins d'un grup
  const { defaultBrowserType: _browser, ...ipad } = devices["iPad Mini"];
  test.use(ipad);
  runSuite();
});
