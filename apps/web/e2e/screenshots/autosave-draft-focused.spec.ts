import { test } from "@playwright/test";
import {
  ensureImgDir,
  gotoEditor,
  mockArasaac,
  searchWord,
  shot,
} from "./newsShot";

// Captures de la notícia «autosave-draft»: el botó flotant que diu on és la feina.

const FAB = /On es desa la feina/;

test.beforeAll(ensureImgDir);

test("autosave-draft: captures del botó d'estat del document", async ({
  page,
}) => {
  await mockArasaac(page);
  await gotoEditor(page, 0);
  // Tres pictogrames perquè l'editor no surti buit, i una espera llarga
  // perquè els avisos de «pictogrames afegits» ja hagin marxat: duren tres
  // segons i sortirien a la captura tapant el racó del botó.
  await searchWord(page, "menjar");
  await searchWord(page, "beure");
  await searchWord(page, "dormir");
  await page.waitForTimeout(6000);

  const fab = page.getByRole("button", { name: FAB });
  await fab.waitFor({ state: "visible", timeout: 15000 });

  // Coberta: la pantalla sencera. Qualsevol retall centrat en el botó surt
  // gairebé tot blanc —el racó de l'editor és buit—, i la targeta del
  // carrusel el retalla per `object-fit: cover`, de manera que del full
  // sencer se'n queda la franja dels pictogrames, que és el que s'hi
  // reconeix a 140 px d'alt.
  await shot(page, page.locator("body"), "autosave-draft.png", {
    size: { width: 1280, height: 800 },
    noCursor: true,
  });

  // Pas 1: la pàgina sencera. El pas diu «a baix a la dreta hi ha un botó
  // nou», i això només es pot ensenyar amb els altres tres cantons a la
  // vista; centrat en el botó, la captura era un rectangle blanc amb una
  // taca verda en una punta.
  await shot(page, page.locator("body"), "autosave-draft-step1.png", {
    // La finestra sencera: el `body` fa l'alçada del contingut, i amb la mida
    // de pas de sempre el retall es menjava justament la franja de baix, que
    // és on hi ha el botó.
    size: { width: 1280, height: 800 },
    noCursor: true,
  });

  // Pas 2: obert, amb la frase d'estat i les accions
  await fab.click();
  await page.waitForTimeout(800);
  // Menys alt que la resta: el panell i el botó ocupen només la franja de
  // baix, i amb els 560 de sempre la meitat de la captura era full en blanc.
  await shot(page, fab, "autosave-draft-step2.png", {
    size: { width: 700, height: 470 },
    noCursor: true,
  });
});
