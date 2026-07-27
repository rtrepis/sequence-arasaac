import { useCallback, useState } from "react";
import { type PageFormat, pixelsToMM, CSS_PRINT_DPI } from "@/types/PageFormat";
import { appBackgrounds, printColors } from "@/style/palette";

/** Converteix un canal d'un color hex (#RRGGBB) al seu valor decimal */
const hexChannels = (hex: string): number[] => {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((offset) => parseInt(clean.slice(offset, offset + 2), 16));
};

/**
 * Patró que casa un color de tema tant en forma hex (#RRGGBB, com l'emet
 * emotion en dev) com en forma rgb(r, g, b) (com queda en serialitzar el
 * CSSOM, que és el que fa html2canvas en clonar els <style>).
 */
const themeColorPattern = (hex: string): RegExp =>
  new RegExp(`(?:${hex}\\b|rgb\\(${hexChannels(hex).join(",\\s*")}\\))`, "gi");

/**
 * Substitucions de colors de tema per a la captura del PDF: el resultat ha de
 * ser sempre paper blanc amb text fosc, independentment del tema actiu.
 * Només es normalitzen colors derivats del tema; els colors de contingut
 * triats per l'usuari (font, vores, fitzgerald) no coincideixen amb aquests
 * patrons i es conserven.
 */
const themeColorReplacements: Array<[RegExp, string]> = [
  // Fons del tema (zona de treball fosca, paper fosc i paper verdós clar) → blanc
  [themeColorPattern(appBackgrounds.dark.default), printColors.background],
  [themeColorPattern(appBackgrounds.dark.paper), printColors.background],
  [themeColorPattern(appBackgrounds.light.paper), printColors.background],
  // Text blanc del mode fosc (inclou el que emet getDisplayColor) → negre.
  // El grup ([;{\s]) evita falsos positius com "background-color:#fff".
  [
    /([;{\s])color:\s*(?:#fff\b|#ffffff\b|white\b|rgb\(255,\s*255,\s*255\))/gi,
    `$1color:${printColors.text}`,
  ],
  // Text translúcid blanc de MUI dark → mateix nivell d'opacitat en negre
  [/rgba\(255,\s*255,\s*255,\s*(0?\.\d+)\)/g, "rgba(0,0,0,$1)"],
];

/**
 * Hook per generar i descarregar la seqüència com a fitxer PDF.
 * Captura l'element .preview-content (dimensions reals, sense escala visual)
 * amb html2canvas i el converteix a PDF amb jsPDF.
 * Les llibreries es carreguen dinàmicament al primer ús per no augmentar el bundle inicial.
 */
export const useDownloadPdf = (pageFormat: PageFormat) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPdf = useCallback(async () => {
    // Localitzar el contenidor amb les dimensions reals de la pàgina (sense transform d'escala)
    const contentEl = document.querySelector<HTMLElement>(".preview-content");
    if (!contentEl) return;

    setIsGenerating(true);
    try {
      // Importació dinàmica: html2canvas + jspdf es carreguen al primer clic (~500KB)
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Capturar el contingut real al 100% de resolució
      // html2canvas ignora el transform:scale() visual — llegeix les dimensions CSS naturals
      const canvas = await html2canvas(contentEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Normalitzar els colors del tema directament als <style> generats per
          // emotion perquè la captura sigui sempre en clar (paper blanc, text fosc)
          clonedDoc.documentElement.style.colorScheme = "light";
          clonedDoc.querySelectorAll("style").forEach((el) => {
            if (!el.textContent) return;
            el.textContent = themeColorReplacements.reduce(
              (css, [pattern, replacement]) => css.replace(pattern, replacement),
              el.textContent,
            );
          });
          // Xarxa de seguretat: fons blanc garantit a la zona capturada
          const safetyStyle = clonedDoc.createElement("style");
          safetyStyle.textContent = `
            .preview-content,
            .preview-content .MuiPaper-root {
              background-color: ${printColors.background} !important;
            }
            /* El PDF sempre és en clar: es neutralitza la inversió
               del pictograma sense color del mode fosc */
            .preview-content img {
              filter: none !important;
            }
          `;
          clonedDoc.head.appendChild(safetyStyle);
        },
      });

      // Calcular dimensions en mil·límetres per al PDF
      const widthMM = pixelsToMM(pageFormat.dimensions.width, CSS_PRINT_DPI);
      const heightMM = pixelsToMM(pageFormat.dimensions.height, CSS_PRINT_DPI);
      const pdfSize = pageFormat.size === "FULLSCREEN" ? "A4" : pageFormat.size;

      const pdf = new jsPDF({
        orientation: pageFormat.orientation,
        unit: "mm",
        format: pdfSize.toLowerCase(),
      });

      // Afegir la imatge capturada ocupant tota la pàgina
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, widthMM, heightMM);
      pdf.save("sequencia.pdf");
    } finally {
      setIsGenerating(false);
    }
  }, [pageFormat]);

  return { downloadPdf, isGenerating };
};
