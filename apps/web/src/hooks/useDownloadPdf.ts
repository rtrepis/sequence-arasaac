import { useCallback, useState } from "react";
import { type PageFormat, pixelsToMM } from "@/types/PageFormat";

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
        scale: 1,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Calcular dimensions en mil·límetres per al PDF
      const widthMM = pixelsToMM(pageFormat.dimensions.width);
      const heightMM = pixelsToMM(pageFormat.dimensions.height);
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
