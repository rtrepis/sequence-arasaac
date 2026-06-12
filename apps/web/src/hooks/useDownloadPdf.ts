import { useCallback, useState } from "react";
import { type PageFormat, pixelsToMM, CSS_PRINT_DPI } from "@/types/PageFormat";

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
          // Substituir colors dark mode de MUI directament als <style> generats per emotion.
          // MUI dark: fons #121212, text rgba(255,255,255,x) → light: #fff, rgba(0,0,0,x)
          clonedDoc.documentElement.style.colorScheme = "light";
          clonedDoc.querySelectorAll("style").forEach((el) => {
            if (!el.textContent) return;
            el.textContent = el.textContent
              .replace(/#121212/g, "#ffffff")
              // rgba amb i sense zero inicial (emotion pot emetre les dues formes)
              .replace(/rgba\(255,\s*255,\s*255,\s*\.87\)/g, "rgba(0,0,0,0.87)")
              .replace(/rgba\(255,\s*255,\s*255,\s*0\.87\)/g, "rgba(0,0,0,0.87)")
              .replace(/rgba\(255,\s*255,\s*255,\s*\.6\)/g, "rgba(0,0,0,0.6)")
              .replace(/rgba\(255,\s*255,\s*255,\s*0\.6\)/g, "rgba(0,0,0,0.6)")
              .replace(/rgba\(255,\s*255,\s*255,\s*\.38\)/g, "rgba(0,0,0,0.38)")
              .replace(/rgba\(255,\s*255,\s*255,\s*0\.38\)/g, "rgba(0,0,0,0.38)")
              .replace(/rgba\(255,\s*255,\s*255,\s*\.12\)/g, "rgba(0,0,0,0.12)")
              .replace(/rgba\(255,\s*255,\s*255,\s*0\.12\)/g, "rgba(0,0,0,0.12)")
              .replace(/rgba\(255,\s*255,\s*255,\s*\.08\)/g, "rgba(0,0,0,0.08)")
              .replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, "rgba(0,0,0,0.08)")
              .replace(/rgba\(255,\s*255,\s*255,\s*\.05\)/g, "rgba(0,0,0,0.05)")
              .replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, "rgba(0,0,0,0.05)");
          });
          // Injecció CSS de seguretat: força text negre per a Typography i elements inline.
          // Cobreix casos on emotion emet #fff, rgb(255,255,255) o altres formats no capturats pel regex.
          const safetyStyle = clonedDoc.createElement("style");
          safetyStyle.textContent = `
            .preview-content .MuiTypography-root,
            .preview-content span,
            .preview-content p {
              color: rgba(0, 0, 0, 0.87) !important;
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
