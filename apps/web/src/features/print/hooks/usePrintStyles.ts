import { useEffect } from "react";
import { PageFormat, CSS_PRINT_DPI } from "@/types/PageFormat";
import { printColors } from "@/style/palette";

/**
 * Genera el CSS d'impressió per al pageFormat donat.
 * Sempre usa CSS_PRINT_DPI (96) per la conversió px→mm,
 * independentment del DPI de pantalla o del monitor connectat.
 */
export function generatePrintCSS(pageFormat: PageFormat): string {
  const widthMM = (pageFormat.dimensions.width * 25.4) / CSS_PRINT_DPI;
  const heightMM = (pageFormat.dimensions.height * 25.4) / CSS_PRINT_DPI;

  return `
    @media print {
      @page {
        size: ${pageFormat.size === "FULLSCREEN" ? "A4" : pageFormat.size} ${pageFormat.orientation};
        margin: 10px;
      }

      form {
        width: ${widthMM}mm !important;
        overflow: hidden !important;
      }

      .preview-container {
        border: none !important;
        outline: none !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
        width: ${widthMM}mm !important;
        height: ${heightMM}mm !important;
      }

      .preview-container > div {
        transform: none !important;
      }

      /* Xarxa de seguretat: la impressió sempre és sobre paper blanc. Les
         superfícies de full ja ho són a pantalla (token sheetSurface);
         aquí es garanteix també per al body i qualsevol Paper interior. */
      body,
      .preview-container,
      .preview-content,
      .preview-container .MuiPaper-root {
        background-color: ${printColors.background} !important;
      }

      .preview-container,
      .preview-content {
        color: ${printColors.text};
      }

      .controls,
      .displayFullScreen,
      [class*="NotPrint"] {
        display: none !important;
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
 * Funció helper per imprimir amb l'orientació correcta
 * Soluciona problemes de navegadors que no respecten @page
 */
export function printWithOrientation(pageFormat: PageFormat) {
  // Forçar aplicació dels estils d'impressió amb valors frescos just abans d'imprimir
  applyPrintStyles(pageFormat);

  // Petit delay per assegurar que el DOM ha processat els nous estils
  setTimeout(() => {
    window.print();
  }, 150);
}
