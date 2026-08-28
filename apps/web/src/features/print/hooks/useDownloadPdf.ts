import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import {
  type PageFormat,
  type PageDimensions,
  pixelsToMM,
  CSS_PRINT_DPI,
} from "@/types/PageFormat";
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

/** Codi propi: el navegador ha tornat una captura en blanc. */
const PDF_EMPTY_CANVAS = "PDF_EMPTY_CANVAS";

/**
 * Resolució de la captura. A 3× una pàgina de 96 dpi surt a 288 dpi, que ja és
 * el sostre útil de l'app: les imatges pujades es guarden a 1.800 px de costat
 * llarg, pensades justament per a aquest màxim.
 */
const CAPTURE_SCALE = 3;

/**
 * Sostre de la captura, en àrea i en costat.
 *
 * Safari a iOS acota totes dues coses i, quan es passen, **no llança res**:
 * retorna el canvas buit i el PDF surt en blanc —i, des del feedback d'A7, amb
 * un missatge dient que ha anat bé. Són els límits publicats de Safari a iOS
 * (16,7 Mpx d'àrea, 4.096 px de costat), no mesurats en un dispositiu: es
 * prenen com el cas pitjor conegut.
 *
 * S'apliquen a tots els navegadors a propòsit, en comptes de mirar quin és.
 * L'A4 no els toca (2.154×3.141 px, 6,8 Mpx) i l'A3 hi topa pel costat en totes
 * dues orientacions: baixa de 288 a 260 dpi, invisible al paper. A canvi no cal
 * mantenir una branca per navegador ni endevinar la versió d'iOS. Amb la mida
 * FULLSCREEN d'una pantalla gran la rebaixa sí que és forta (a 2.560×1.440,
 * 154 dpi), però allà l'alternativa era el full en blanc.
 */
const MAX_CANVAS_AREA_PX = 16_777_216;
const MAX_CANVAS_SIDE_PX = 4096;

/**
 * Per sota d'1× la captura tindria menys resolució que la pantalla mateixa. Si
 * ni tan sols a 1 hi cabés, val més intentar-ho igualment i, si torna en blanc,
 * dir-ho: el guard de sota ho detecta.
 */
const MIN_CAPTURE_SCALE = 1;

/** Escala de captura que respecta els dos sostres per a unes dimensions donades. */
const captureScaleFor = ({ width, height }: PageDimensions): number =>
  Math.max(
    MIN_CAPTURE_SCALE,
    Math.min(
      CAPTURE_SCALE,
      Math.sqrt(MAX_CANVAS_AREA_PX / (width * height)),
      MAX_CANVAS_SIDE_PX / Math.max(width, height),
    ),
  );

/**
 * Escala visual amb què es veu ara mateix un element, transforms d'avantpassats
 * inclosos.
 *
 * `offsetWidth` és l'amplada de disposició, que **no** té en compte cap
 * `transform`; `getBoundingClientRect()` sí. El quocient, doncs, és el factor
 * que el navegador hi aplica per pintar-lo.
 *
 * Torna 1 si no es pot mesurar (element amagat o de zero px): val més capturar
 * a l'escala demanada que dividir per zero i quedar-se sense PDF.
 */
const visualScaleOf = (element: HTMLElement): number => {
  const { width } = element.getBoundingClientRect();
  const layoutWidth = element.offsetWidth;
  if (!layoutWidth || !width) return 1;
  return width / layoutWidth;
};

/**
 * Diu si la captura ha tornat en blanc.
 *
 * html2canvas pinta el fons de blanc opac, així que una captura bona té alfa
 * 255 a tot arreu; la que Safari no ha pogut fer es queda transparent. Es mira
 * una mostra de punts i no el canvas sencer: llegir 33 Mpx costaria més que la
 * captura mateixa, el mateix criteri que ja es va aplicar a l'escaneig d'alfa
 * de les imatges pujades.
 *
 * Si el canvas està tacat, `getImageData` llança i no es pot saber. Llavors no
 * es bloqueja res: el `toDataURL` de després fallarà igualment i el catch
 * general ho recollirà amb el seu propi codi.
 */
const isCanvasBlank = (canvas: HTMLCanvasElement): boolean => {
  if (canvas.width === 0 || canvas.height === 0) return true;

  const context = canvas.getContext("2d");
  if (!context) return false;

  const maxX = canvas.width - 1;
  const maxY = canvas.height - 1;
  const samples: Array<[number, number]> = [
    [0, 0],
    [maxX, 0],
    [0, maxY],
    [maxX, maxY],
    [Math.floor(maxX / 2), Math.floor(maxY / 2)],
  ];

  try {
    return samples.every(
      ([x, y]) => context.getImageData(x, y, 1, 1).data[3] === 0,
    );
  } catch {
    return false;
  }
};

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

      // html2canvas mesura amb `getBoundingClientRect()`, o sigui **amb el
      // `transform: scale()` visual del full aplicat** (el posa `ViewSquenceSettings`
      // per encabir la previsualització a la pantalla). Sense compensar-lo, el
      // canvas sortia a `natural × escala visual × escala de captura` i la
      // resolució del PDF depenia de com de reduïda es veiés la previsualització:
      // en una tauleta, on es redueix molt més, queia proporcionalment.
      const captureScale = captureScaleFor(pageFormat.dimensions);
      const visualScale = visualScaleOf(contentEl);
      const canvas = await html2canvas(contentEl, {
        // Es demana l'escala inflada perquè, un cop html2canvas hi torni a
        // aplicar la visual, en surti exactament `natural × captureScale`. Es
        // compensa i no s'anul·la el transform al clon perquè les mides i la
        // posició de la captura les calcula html2canvas sobre l'element
        // **original**, abans de clonar: tocar el clon no les mouria.
        scale: captureScale / visualScale,
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

      // La captura pot haver tornat en blanc sense que ningú hagi llançat res.
      // Val més una fallada visible —la mateixa que ja reporta qualsevol altre
      // error d'aquí— que desar un full en blanc dient que ha anat bé.
      if (isCanvasBlank(canvas)) {
        reportFailure({
          code: PDF_EMPTY_CANVAS,
          isTransient: false,
          // Els sostres de dalt encara no s'han validat en cap dispositiu real
          // (backlog B14) i aquests números són l'única manera de fer-ho: saber
          // que una captura ha sortit en blanc no serveix de res si no es diu a
          // quina mida ha passat. El `userAgent` ja el desa el servidor.
          // Des que es compensa l'escala visual, el canvas ha de sortir
          // exactament `full × escala`: si un informe no quadra, el problema és
          // la captura i no el sostre.
          detail:
            `${pageFormat.size} ${pageFormat.orientation} ` +
            `full ${pageFormat.dimensions.width}×${pageFormat.dimensions.height}, ` +
            `escala ${captureScale.toFixed(2)}, ` +
            `canvas ${canvas.width}×${canvas.height}`,
        });
        return;
      }

      // Calcular dimensions en mil·límetres per al PDF
      const widthMM = pixelsToMM(pageFormat.dimensions.width, CSS_PRINT_DPI);
      const heightMM = pixelsToMM(pageFormat.dimensions.height, CSS_PRINT_DPI);

      // FULLSCREEN no és cap paper: les seves dimensions surten de la pantalla,
      // així que el full del PDF es fa a mida. Abans s'encabia en un A4 amb els
      // mil·límetres de la pantalla, i la imatge en sortia escapçada. Avui la
      // barra d'eines no ofereix la descàrrega amb aquesta mida, o sigui que era
      // un defecte latent; es corregeix igualment perquè el hook accepta
      // qualsevol `PageFormat` i el cas especial era una trampa per a qui
      // reobrís el botó.
      const pdf = new jsPDF({
        orientation: pageFormat.orientation,
        unit: "mm",
        format:
          pageFormat.size === "FULLSCREEN"
            ? [widthMM, heightMM]
            : pageFormat.size.toLowerCase(),
      });

      // Les dimensions d'A4 i A3 són les útils (el paper menys els marges), de
      // manera que col·locar la imatge a 0,0 deixava tot el marge a la dreta i a
      // baix. Centrada, el marge queda repartit com a la impressió. Amb
      // FULLSCREEN el full és exactament la imatge i els dos desplaçaments són 0.
      const offsetX = (pdf.internal.pageSize.getWidth() - widthMM) / 2;
      const offsetY = (pdf.internal.pageSize.getHeight() - heightMM) / 2;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        offsetX,
        offsetY,
        widthMM,
        heightMM,
      );
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
