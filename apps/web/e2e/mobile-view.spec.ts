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

/** L'avís que surt en obrir un document. */
const loadedNotice = (page: Page): Locator =>
  page.getByText("Fitxer carregat correctament");

/**
 * Obre un document de les fixtures i va a la vista. Per defecte, espera que
 * marxi l'avís de «Fitxer carregat», perquè no tapi res del que es prova.
 */
const openInView = async (
  page: Page,
  name: string,
  { waitNotice = true }: { waitNotice?: boolean } = {},
): Promise<void> => {
  await page.goto("/ca/create-sequence", { waitUntil: "domcontentloaded" });
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(path.join(FIXTURES, name));
  await expect(loadedNotice(page)).toBeVisible();
  await page.locator('a[href$="view-sequence"]').first().click();
  if (waitNotice)
    await expect(loadedNotice(page)).toBeHidden({ timeout: 15000 });
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

/**
 * Un doble toc que ha d'obrir els ajustos. Amb la màquina carregada (diversos
 * treballadors alhora), entre un `tap` i l'altre de Playwright hi pot haver
 * més dels 350 ms que separen un doble toc de dos tocs: si passa, es torna a
 * provar, que és el que faria la persona.
 */
const doubleTapToOpen = async (page: Page, locator: Locator): Promise<void> => {
  await expect(async () => {
    await doubleTapCenter(page, locator);
    await expect(panel(page)).toHaveAttribute("data-snap", "half", {
      timeout: 1500,
    });
  }).toPass({ timeout: 15000 });
};

/** L'element que hi ha de debò en un punt de la pantalla (el que rep el dit). */
const hitAt = (page: Page, x: number, y: number) =>
  page.evaluate(
    ([px, py]) => {
      const hit = document.elementFromPoint(px, py);
      return {
        inFullscreen: Boolean(hit && document.fullscreenElement?.contains(hit)),
        inPanel: Boolean(hit?.closest("[role=region][data-snap]")),
        label:
          hit?.closest("button")?.textContent?.trim() ??
          hit?.textContent?.trim().slice(0, 40) ??
          "",
      };
    },
    [x, y] as const,
  );

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
    await page
      .getByRole("button", { name: "Mostra els ajustos" })
      .press("Enter");
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
    await doubleTapToOpen(page, top);
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

  test("les sortides, a dalt, s'amaguen amb la barra quan el panell puja", async ({
    page,
  }) => {
    await openInView(page, FREE_PORTRAIT);
    const print = page.getByRole("button", { name: "Imprimir" });
    await expect(print).toBeVisible();
    // A dalt de tot, per damunt de la capçalera de la pàgina
    const pageTitle = page.getByRole("button", { name: "Pàgina 1 de 2" });
    expect((await boxOf(print)).y).toBeLessThan((await boxOf(pageTitle)).y);
    // I sota del full, «Afegeix una pàgina», com a l'escriptori
    await expect(
      page.getByRole("button", { name: "Afegeix una pàgina" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Orientació de pàgina" }),
    ).toHaveCount(0);
    await expect(
      page.getByTestId("app-bottom-sheet-header").getByText("Pàgina 1 de 2"),
    ).toBeVisible();

    const bar = page.locator("header.MuiAppBar-root");
    await expect(bar).toBeInViewport();
    await page
      .getByRole("button", { name: "Mostra els ajustos" })
      .press("Enter");
    await expectSnap(page, "half");
    await expect(bar).not.toBeInViewport();
    await expect(print).toBeHidden();
    await page
      .getByRole("button", { name: "Amaga els ajustos" })
      .press("Enter");
    await expectSnap(page, "collapsed");
    await expect(bar).toBeInViewport();
    await expect(print).toBeVisible();
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

  test("pantalla sencera: sota la mida de pàgina, i el full és la pantalla apaïsada", async ({
    page,
  }) => {
    await openInView(page, SIMPLE);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sense viewport");
    await page
      .getByRole("button", { name: "Mostra els ajustos" })
      .press("Enter");
    await expectSnap(page, "half");

    const size = page.getByRole("combobox", { name: "Mida de pàgina" });
    const fullscreen = page.getByRole("checkbox", { name: "Pantalla sencera" });
    await expect(size).toHaveText("A4");
    await fullscreen.check();
    // El paper s'apaga i continua dient quin era
    await expect(size).toHaveAttribute("aria-disabled", "true");
    await expect(size).toHaveText("A4");

    // El full, amb la forma de la pantalla apaïsada, també amb el mòbil dret:
    // la pantalla sencera es mira girada
    await page
      .getByRole("button", { name: "Amaga els ajustos" })
      .press("Enter");
    await expectSnap(page, "collapsed");
    const screen = await page.evaluate(() => ({
      width: Math.max(window.screen.width, window.screen.height),
      height: Math.min(window.screen.width, window.screen.height),
    }));
    await expect
      .poll(async () => {
        const box = await boxOf(sheet(page));
        return Math.abs(box.width / box.height - screen.width / screen.height);
      })
      .toBeLessThan(0.02);

    // En treure-la, torna el paper d'abans
    await page
      .getByRole("button", { name: "Mostra els ajustos" })
      .press("Enter");
    await expectSnap(page, "half");
    await fullscreen.uncheck();
    await expect(size).not.toHaveAttribute("aria-disabled", "true");
    await expect(size).toHaveText("A4");
  });

  // ---- Fase 5: els casos difícils ----

  test("a sencer, els avisos no tapen la franja que torna al full", async ({
    page,
  }) => {
    // Sense esperar que marxi l'avís de «Fitxer carregat»
    await openInView(page, SIMPLE, { waitNotice: false });
    const notice = loadedNotice(page);
    await expect(notice).toBeVisible();

    const drag = await finger(page);
    const headerBox = await boxOf(page.getByTestId("app-bottom-sheet-header"));
    await drag(
      { x: headerBox.x + 40, y: headerBox.y + 8 },
      { x: headerBox.x + 40, y: 20 },
    );
    await expectSnap(page, "full");
    await expect(notice).toBeVisible();

    // L'avís, per sota de la franja; i la franja, a l'abast del dit
    const strip = page.getByRole("button", { name: "Torna al full" });
    const stripBox = await boxOf(strip);
    expect((await boxOf(notice)).y).toBeGreaterThanOrEqual(
      stripBox.y + stripBox.height,
    );
    const hit = await hitAt(
      page,
      stripBox.x + stripBox.width / 2,
      stripBox.y + stripBox.height / 2,
    );
    expect(hit.label).toBe("Torna al full");

    await strip.tap();
    await expectSnap(page, "half");
  });

  test("el doble toc al full no hi fa zoom", async ({ page }) => {
    await openInView(page, FREE_PORTRAIT);
    // `manipulation`: el navegador no espera el segon toc ni amplia, i
    // lliscar i pessigar continuen funcionant
    await expect(page.getByTestId("view-sheet-area")).toHaveCSS(
      "touch-action",
      "manipulation",
    );

    const top = page
      .getByTestId("view-sheet-area")
      .locator(".placement [role=button]")
      .first();
    await doubleTapToOpen(page, top);
    expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(
      1,
    );
  });

  test("amb el teclat virtual obert, el camp de l'autor no queda tapat", async ({
    page,
  }) => {
    await openInView(page, SIMPLE);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sense viewport");
    await page
      .getByRole("button", { name: "Mostra els ajustos" })
      .press("Enter");
    await expectSnap(page, "half");

    const author = page.getByRole("textbox", { name: /autor/i }).first();
    /** El camp, sencer entre la capçalera del panell i la vora de baix. */
    const fieldIsVisible = async (bottom: number): Promise<boolean> => {
      const box = await boxOf(author);
      const header = await boxOf(page.getByTestId("app-bottom-sheet-header"));
      return (
        box.y >= header.y + header.height - 1 && box.y + box.height <= bottom
      );
    };

    // En rebre el focus, el panell el porta a la part que es veu: el
    // navegador sol no ho fa, perquè el panell baixa amb un `transform`
    await author.focus();
    await expect.poll(() => fieldIsVisible(viewport.height)).toBe(true);

    // S'obre el teclat: a Android la finestra s'encongeix (el Safari d'iOS
    // no, i ho diu `visualViewport`; vegeu §9 del pla)
    const keyboard = Math.round(viewport.height * 0.4);
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height - keyboard,
    });
    await expect
      .poll(() => fieldIsVisible(viewport.height - keyboard))
      .toBe(true);
    await expect(author).toBeFocused();

    // I s'hi escriu
    await page.keyboard.type(" i família");
    await expect(author).toHaveValue(/ i família$/);
  });

  test("a la pantalla completa de la pàgina única, el panell no hi és", async ({
    page,
  }) => {
    await openInView(page, SIMPLE);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sense viewport");
    await page
      .getByRole("button", { name: "Aquesta pàgina a pantalla completa" })
      .tap();
    await expect
      .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
      .toBe(true);

    // On era el panell, ara hi ha la pantalla completa
    const hit = await hitAt(page, viewport.width / 2, viewport.height - 10);
    expect(hit.inPanel).toBe(false);
    expect(hit.inFullscreen).toBe(true);
  });

  test("al paper i al PDF no hi ha ni el panell, ni les sortides, ni les fletxes", async ({
    page,
  }) => {
    await openInView(page, FREE_PORTRAIT);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sense viewport");
    // Amb el panell a mig i la fletxa de la vora a la vista
    await page
      .getByRole("button", { name: "Mostra els ajustos" })
      .press("Enter");
    await expectSnap(page, "half");
    const box = await boxOf(sheet(page));
    await page.touchscreen.tap(viewport.width - 8, box.y + box.height - 8);
    await expect(
      page.getByRole("button", { name: "Pàgina següent" }),
    ).toHaveAttribute("data-shown", "true");

    // El PDF captura els fulls (`.preview-content`): cap d'aquestes coses no
    // hi és a dins. Les marques d'edició dels blocs (el menú «⋯») sí, però
    // porten `data-html2canvas-ignore` i no es capturen; al paper, no es veuen
    const leaked = (root: string) =>
      page.evaluate(
        (selector) =>
          Array.from(document.querySelectorAll(selector)).flatMap((node) =>
            Array.from(
              node.querySelectorAll(
                "[role=region], [data-edge-arrow], [data-testid=app-bottom-sheet-header], button",
              ),
            )
              .filter(
                (found) =>
                  !found.closest("[data-html2canvas-ignore]") &&
                  getComputedStyle(found).display !== "none" &&
                  found.getClientRects().length > 0,
              )
              .map((found) => found.outerHTML.slice(0, 60)),
          ),
        root,
      );
    expect(await page.locator(".preview-content").count()).toBe(2);
    expect(await leaked(".preview-content")).toEqual([]);

    // El paper: Ctrl+P avisa amb `beforeprint`, i s'imprimeix només la còpia
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("#print-root")).toBeVisible();
    expect(await leaked("#print-root")).toEqual([]);
    await expect(panel(page)).toBeHidden();
    await expect(page.getByRole("button", { name: "Imprimir" })).toBeHidden();
    await expect(page.locator("[data-edge-arrow]")).toHaveCount(1);
    await expect(page.locator("[data-edge-arrow]")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Torna al full" }),
    ).toHaveCount(0);
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

test.describe("al telèfon, de dret a girat a la pantalla completa", () => {
  const { defaultBrowserType: _browser, ...pixel } = devices["Pixel 7"];
  test.use(pixel);

  test("girat, la pantalla completa funciona i la capa no hi surt (M6, N3)", async ({
    page,
  }) => {
    await openInView(page, FREE_PORTRAIT);
    const upright = page.viewportSize();
    if (!upright) throw new Error("sense viewport");
    await page
      .getByRole("button", { name: "Aquesta pàgina a pantalla completa" })
      .tap();
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.id ?? ""))
      .toBe("view-pages");

    // Es gira el mòbil
    await page.setViewportSize({
      width: upright.height,
      height: upright.width,
    });
    await expect(
      page.getByRole("status").filter({ hasText: "Gira el mòbil" }),
    ).toHaveCount(0);

    // El full, sencer a la pantalla girada, i s'hi passa de pàgina lliscant
    const frame = page.locator("#view-page-frame-0");
    const box = await boxOf(frame);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(upright.width + 1);
    const drag = await finger(page);
    const y = upright.width / 2;
    await drag({ x: upright.height * 0.8, y }, { x: upright.height * 0.2, y });
    await expect(page.locator("#view-page-1")).toBeVisible();
    await expect(page.locator("#view-page-0")).toBeHidden();

    // En sortir de la pantalla completa, girat, la capa hi torna
    await page.evaluate(() => document.exitFullscreen());
    await expect(
      page.getByRole("status").filter({ hasText: "Gira el mòbil" }),
    ).toBeVisible();
  });
});
