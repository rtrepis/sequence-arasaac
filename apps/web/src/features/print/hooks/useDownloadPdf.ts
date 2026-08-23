import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { type PageFormat, pixelsToMM, CSS_PRINT_DPI } from "@/types/PageFormat";
import { appBackgrounds, printColors } from "@/style/palette";
import { useFeedback } from "@/context/FeedbackContext";
import {
  classifyRequestFailure,
  type RequestFailure,
} from "@features/backend/api/requestFailure";
import { reportClientError } from "@features/backend/api/clientErrorReport";
import { trackEvent } from "@shared/hooks/usePageTracking";
import messages from "./useDownloadPdf.lang";

// Un error s'ha de poder llegir i, si cal, copiar: més estona a pantalla que una
// confirmació. Mateix criteri que les fallades de desat al núvol.
const ERROR_SNACKBAR_MS = 10000;

/** Codi propi: el full que s'havia de capturar no és a la pàgina. */
const PDF_NO_CONTENT = "PDF_NO_CONTENT";

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
  // Text blanc del mode fosc (peu d'autoria i altres textos de tema) → negre.
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
  const intl = useIntl();
  const { showBackdrop, hideBackdrop, showSnackbar } = useFeedback();

  /** Avisa l'usuari i deixa constància al registre d'errors del client. */
  const reportFailure = useCallback(
    (failure: RequestFailure) => {
      showSnackbar({
        // El codi va amb el missatge: qui només vol treballar l'ignora, i qui ha
        // de mirar què ha passat no depèn d'una consola que al mòbil no existeix
        message: intl.formatMessage(messages.error, { code: failure.code }),
        severity: "error",
        duration: ERROR_SNACKBAR_MS,
      });
      void reportClientError("pdf-export", failure);
    },
    [intl, showSnackbar],
  );

  const downloadPdf = useCallback(async () => {
    // Localitzar el contenidor amb les dimensions reals de la pàgina (sense transform d'escala)
    const contentEl = document.querySelector<HTMLElement>(".preview-content");
    // Sense full no hi ha res a capturar. Es tracta com una fallada i no com un
    // retorn mut: per a qui ha clicat, el clic ha estat igual de real.
    if (!contentEl) {
      reportFailure({ code: PDF_NO_CONTENT, isTransient: false });
      return;
    }

    setIsGenerating(true);
    // La captura bloqueja el fil principal: mentre dura, no es pot fer res més i
    // qualsevol interacció alteraria justament el que s'està capturant. Per això
    // backdrop, com al desat al núvol, i no un avís que deixi la pàgina viva.
    showBackdrop({ message: intl.formatMessage(messages.generating) });
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

      // La descàrrega la confirma el navegador de maneres molt diferents (i a
      // iPadOS, gairebé gens): sense aquest missatge, acabar bé i no fer res
      // s'assemblen massa.
      showSnackbar({
        message: intl.formatMessage(messages.downloaded),
        severity: "success",
      });

      trackEvent({
        event: "download-pdf-view",
        event_category: "View",
        event_label: "Download PDF",
        value: `${pageFormat.size}_${pageFormat.orientation}`,
      });
    } catch (error) {
      // classifyRequestFailure no és només per a peticions: d'una excepció del
      // client en treu CLIENT_EXCEPTION amb el detall, que és exactament el que
      // el registre d'errors necessita per orientar el diagnòstic.
      reportFailure(classifyRequestFailure(error));
    } finally {
      hideBackdrop();
      setIsGenerating(false);
    }
  }, [
    pageFormat,
    intl,
    showBackdrop,
    hideBackdrop,
    showSnackbar,
    reportFailure,
  ]);

  return { downloadPdf, isGenerating };
};
