import { useEffect } from "react";

/**
 * El full que s'imprimeix, i res més.
 *
 * Abans la impressió sortia de la pàgina sencera i el CSS anava amagant el que
 * no hi havia d'anar: els controls, el menú lateral, els tooltips… Era una
 * llista negra, i cada capa nova de MUI n'era una fuita nova —i no només una
 * taca al paper: MUI col·loca aquestes capes amb una posició **en píxels
 * escrita per JavaScript**, i quan el navegador replanteja la pàgina a
 * l'amplada del full per imprimir, la capa es queda clavada on era a la
 * pantalla. El document passa a ser tan ample com la pantalla i el navegador
 * encongeix tot el dibuix per fer-l'hi cabre: el full sortia al 76 % només per
 * tenir el ratolí damunt del botó d'imprimir (C22 del backlog).
 *
 * Ara és a l'inrevés, i és una llista blanca: es penja una còpia del full al
 * `body` i s'imprimeix **només** això. És el mateix que fa l'exportació a PDF,
 * que captura `.preview-content` i prou, i per això mai no ha patit el
 * problema. El que hi hagi al voltant deixa de tenir cap efecte sobre el paper.
 */

/** Contenidor de la còpia que s'imprimeix. Penja directament del `body`. */
export const PRINT_ROOT_ID = "print-root";

/** Mentre hi és, el `body` només pinta el full (vegeu `generatePrintCSS`). */
export const PRINTING_BODY_CLASS = "printing-sheet";

/** El full a mida real, sense l'escala que l'encabeix a la pantalla. */
const SHEET_SELECTOR = ".preview-content";

const printRoot = (): HTMLElement => {
  const existing = document.getElementById(PRINT_ROOT_ID);
  if (existing) return existing;

  const root = document.createElement("div");
  root.id = PRINT_ROOT_ID;
  // A la pantalla no hi és mai; el CSS d'impressió el mostra amb `!important`
  root.style.display = "none";
  document.body.appendChild(root);
  return root;
};

/**
 * Prepara la còpia del full. Es pot cridar més d'un cop sense conseqüències:
 * el botó la crida abans d'imprimir i el navegador torna a avisar amb
 * `beforeprint`.
 */
export const mountPrintSheet = (): void => {
  const sheet = document.querySelector<HTMLElement>(SHEET_SELECTOR);
  const root = printRoot();
  root.replaceChildren();

  // Sense full no s'amaga res: val més imprimir la pàgina tal com surti que
  // deixar l'usuari amb un paper en blanc i cap explicació
  if (!sheet) {
    document.body.classList.remove(PRINTING_BODY_CLASS);
    return;
  }

  const clone = sheet.cloneNode(true) as HTMLElement;
  // L'escala és per encabir el full a la pantalla; al paper hi va a mida real
  clone.style.transform = "none";
  root.appendChild(clone);
  document.body.classList.add(PRINTING_BODY_CLASS);
};

/** Treu la còpia. El `body` torna a pintar l'app. */
export const unmountPrintSheet = (): void => {
  document.getElementById(PRINT_ROOT_ID)?.replaceChildren();
  document.body.classList.remove(PRINTING_BODY_CLASS);
};

/**
 * Deixa el full a punt cada cop que s'imprimeix, vingui d'on vingui.
 *
 * El botó ja el prepara ell mateix (`printWithOrientation`), però Ctrl+P no
 * passa per cap codi nostre: l'únic avís és `beforeprint`. Amb els dos camins
 * coberts, imprimir amb el teclat i imprimir amb el botó donen el mateix full.
 */
export const usePrintSheet = (): void => {
  useEffect(() => {
    const handleBefore = () => mountPrintSheet();
    const handleAfter = () => unmountPrintSheet();

    window.addEventListener("beforeprint", handleBefore);
    window.addEventListener("afterprint", handleAfter);

    // Els Safari antics no disparen `beforeprint`: allà l'únic avís que hi ha
    // és el canvi de mitjà
    const printMedia = window.matchMedia("print");
    const handleMedia = (event: MediaQueryListEvent) =>
      event.matches ? handleBefore() : handleAfter();
    printMedia.addEventListener?.("change", handleMedia);

    return () => {
      window.removeEventListener("beforeprint", handleBefore);
      window.removeEventListener("afterprint", handleAfter);
      printMedia.removeEventListener?.("change", handleMedia);
      unmountPrintSheet();
    };
  }, []);
};
