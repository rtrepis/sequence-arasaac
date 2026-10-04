import { useEffect } from "react";
import {
  PageFormat,
  CSS_PAGE_SIZE,
  CSS_PRINT_DPI,
  PRINT_MARGIN_MM,
  regionalPaperSize,
} from "../utils/pageFormat";
import { pixelsToMM } from "../utils/pageUnits";
import { printColors } from "@/style/palette";
import {
  mountPrintSheet,
  PRINT_ROOT_ID,
  PRINTING_BODY_CLASS,
} from "./usePrintSheet";

/**
 * Genera el CSS d'impressió per al pageFormat donat.
 * Sempre usa CSS_PRINT_DPI (96) per la conversió px→mm,
 * independentment del DPI de pantalla o del monitor connectat.
 */
export function generatePrintCSS(pageFormat: PageFormat): string {
  const widthMM = pixelsToMM(pageFormat.dimensions.width, CSS_PRINT_DPI);
  const heightMM = pixelsToMM(pageFormat.dimensions.height, CSS_PRINT_DPI);
  // La pantalla sencera no és cap paper: s'imprimeix en el de cada dia de qui
  // imprimeix, que als EUA o a Mèxic és el Carta i no l'A4
  const paper =
    pageFormat.size === "FULLSCREEN"
      ? regionalPaperSize(navigator.languages)
      : pageFormat.size;

  return `
    @media print {
      @page {
        size: ${CSS_PAGE_SIZE[paper]} ${pageFormat.orientation};
        /* El mateix marge que ja es descompta del paper per calcular el full
           (\`calculateUsableDimensions\`). Així la caixa de la pàgina i el full
           fan exactament la mateixa mida i el full queda centrat sol. */
        margin: ${PRINT_MARGIN_MM}mm;
      }

      /* **Al paper hi va el full, i res més.**
         No s'amaga el que sobra —això era una llista negra, i cada capa nova de
         MUI n'era una fuita—: es pinta només la còpia del full que
         \`usePrintSheet\` penja del \`body\`. Tota la resta, l'app inclosa i les
         capes que MUI hi posa amb un portal (menú lateral, tooltips, menús,
         avisos, diàlegs), queda fora per defecte i no pot tornar a entrar-hi.
         La classe del \`body\` només hi és si la còpia s'ha pogut fer: si no,
         val més imprimir la pàgina tal com surti que un paper en blanc. */
      body.${PRINTING_BODY_CLASS} > * {
        display: none !important;
      }

      body.${PRINTING_BODY_CLASS} > #${PRINT_ROOT_ID} {
        display: block !important;
      }

      /* El document fa exactament el full: no hi ha res que desbordi el paper
         i, per tant, res que faci encongir el dibuix per fer-l'hi cabre */
      html,
      body {
        width: ${widthMM}mm !important;
        height: ${heightMM}mm !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }

      #${PRINT_ROOT_ID},
      #${PRINT_ROOT_ID} > * {
        width: ${widthMM}mm !important;
        height: ${heightMM}mm !important;
        overflow: hidden !important;
        /* L'escala de la previsualització és per encabir el full a la pantalla */
        transform: none !important;
      }

      /* La impressió sempre és sobre paper blanc, també en tema fosc */
      html,
      body,
      #${PRINT_ROOT_ID},
      #${PRINT_ROOT_ID} .MuiPaper-root {
        background-color: ${printColors.background} !important;
      }

      #${PRINT_ROOT_ID} {
        color: ${printColors.text};
      }
    }
  `;
}

/**
 * Aplica els estils d'impressió al DOM immediatament.
 * Cridar just abans de window.print() per garantir que el CSS és fresc.
 */
export function applyPrintStyles(pageFormat: PageFormat): void {
  const styleId = "dynamic-print-styles";
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = generatePrintCSS(pageFormat);
}

/**
 * Hook per gestionar els estils CSS d'impressió reactius.
 * S'actualitza automàticament quan canvia el pageFormat.
 */
export function usePrintStyles(pageFormat: PageFormat) {
  useEffect(() => {
    applyPrintStyles(pageFormat);
  }, [pageFormat]);
}

/**
 * Imprimeix el full.
 *
 * Prepara la còpia aquí mateix i no espera el `beforeprint` del navegador:
 * així el botó no depèn que l'esdeveniment arribi ni de quan arribi. Ctrl+P sí
 * que hi depèn, i per això `usePrintSheet` també l'escolta.
 */
export function printWithOrientation(pageFormat: PageFormat) {
  // Valors frescos, per si el format ha canviat des de l'últim render
  applyPrintStyles(pageFormat);
  mountPrintSheet();

  // Petit delay per assegurar que el DOM ha processat els nous estils
  setTimeout(() => {
    window.print();
  }, 150);
}
