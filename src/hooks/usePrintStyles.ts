import { useEffect } from "react";
import { PageFormat } from "@/types/PageFormat";

/**
 * Hook per gestionar els estils CSS d'impressió
 * Soluciona el problema que @page no es recalcula automàticament
 */
export function usePrintStyles(pageFormat: PageFormat) {
  useEffect(() => {
    // Crear/actualitzar l'element style per a impressió
    const styleId = "dynamic-print-styles";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Generar CSS dinàmic per a impressió
    const printCSS = `
      @media print {
        @page {
          size: ${pageFormat.size === "FULLSCREEN" ? "A4" : pageFormat.size} ${pageFormat.orientation};
          margin: 10px;
        }
        
        /* Forçar orientació al body també */
        body {
          ${
            pageFormat.orientation === "portrait"
              ? "width: 210mm; height: 297mm;"
              : "width: 297mm; height: 210mm;"
          }
        }
        
        .preview-container {
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: ${pageFormat.dimensions.width}px !important;
          height: ${pageFormat.dimensions.height}px !important;
        }
        
        .preview-container > div {
          transform: none !important;
        }
        
        /* Amagar elements no imprimibles */
        .controls,
        .displayFullScreen,
        [class*="NotPrint"] {
          display: none !important;
        }
      }
    `;

    styleElement.textContent = printCSS;

    // Cleanup en desmuntar
    return () => {
      // No eliminem l'element, només l'actualitzem
      // per evitar problemes amb múltiples renders
    };
  }, [pageFormat]);
}

/**
 * Funció helper per imprimir amb l'orientació correcta
 * Soluciona problemes de navegadors que no respecten @page
 */
export function printWithOrientation(pageFormat: PageFormat) {
  // Desar orientació actual de la pàgina
  const currentOrientation = window.matchMedia("(orientation: portrait)")
    .matches
    ? "portrait"
    : "landscape";

  // Si l'orientació física de la pantalla no coincideix amb la desitjada,
  // mostrar un avís a l'usuari
  if (
    currentOrientation !== pageFormat.orientation &&
    pageFormat.size !== "FULLSCREEN"
  ) {
    console.warn(
      `Print orientation (${pageFormat.orientation}) may not match screen orientation (${currentOrientation})`,
    );
  }

  // Forçar recalcul dels estils abans d'imprimir
  window.dispatchEvent(new Event("beforeprint"));

  // Petit delay per assegurar que els estils s'han aplicat
  setTimeout(() => {
    window.print();
  }, 100);
}
