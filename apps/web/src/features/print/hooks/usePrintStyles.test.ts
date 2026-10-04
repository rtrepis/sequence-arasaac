import { afterEach, describe, expect, it, vi } from "vitest";
import { generatePrintCSS } from "./usePrintStyles";
import { PRINTING_BODY_CLASS, PRINT_ROOT_ID } from "./usePrintSheet";
import {
  createPageFormat,
  CSS_PRINT_DPI,
  PRINT_MARGIN_MM,
} from "../utils/pageFormat";
import { pixelsToMM } from "../utils/pageUnits";

const A4_LANDSCAPE = createPageFormat("A4", "landscape");
const sheetWidthMM = pixelsToMM(A4_LANDSCAPE.dimensions.width, CSS_PRINT_DPI);
const sheetHeightMM = pixelsToMM(A4_LANDSCAPE.dimensions.height, CSS_PRINT_DPI);

describe("generatePrintCSS", () => {
  it("hauria de demanar el paper i l'orientació del format", () => {
    expect(generatePrintCSS(A4_LANDSCAPE)).toContain("size: A4 landscape");
  });

  it("hauria de dir al CSS els papers nord-americans pel seu nom", () => {
    expect(generatePrintCSS(createPageFormat("LETTER", "portrait"))).toContain(
      "size: letter portrait",
    );
    // El CSS diu `ledger` al paper d'11 × 17″
    expect(generatePrintCSS(createPageFormat("TABLOID", "landscape"))).toContain(
      "size: ledger landscape",
    );
  });

  describe("pantalla sencera", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    const fullScreenCSS = (languages: string[]) => {
      vi.stubGlobal("navigator", { ...navigator, languages });
      return generatePrintCSS(createPageFormat("FULLSCREEN", "landscape"));
    };

    it("hauria d'imprimir en A4 a Europa", () => {
      expect(fullScreenCSS(["ca-ES", "ca"])).toContain("size: A4 landscape");
    });

    it("hauria d'imprimir en Carta on el paper de cada dia és el Carta", () => {
      expect(fullScreenCSS(["es-MX", "es"])).toContain(
        "size: letter landscape",
      );
    });
  });

  it("hauria de deixar el mateix marge que es descompta del paper", () => {
    // La caixa de la pàgina i el full fan la mateixa mida: el full queda
    // centrat sol i el navegador no ha d'encongir res per fer-l'hi cabre
    expect(generatePrintCSS(A4_LANDSCAPE)).toContain(
      `margin: ${PRINT_MARGIN_MM}mm`,
    );
  });

  it("hauria de pintar només el full, i amagar tota la resta", () => {
    const css = generatePrintCSS(A4_LANDSCAPE);

    // Llista blanca, no llista negra: tot el que penja del `body` queda fora
    // —l'app i les capes que MUI hi posa amb un portal— i només hi entra la
    // còpia del full. Vegeu C22 del backlog
    expect(css).toMatch(
      new RegExp(
        `body\\.${PRINTING_BODY_CLASS} > \\*\\s*\\{[^}]*display: none !important`,
      ),
    );
    expect(css).toMatch(
      new RegExp(
        `body\\.${PRINTING_BODY_CLASS} > #${PRINT_ROOT_ID}\\s*\\{[^}]*display: block !important`,
      ),
    );
  });

  it("no hauria d'enumerar cap capa flotant: la llista negra era el problema", () => {
    const css = generatePrintCSS(A4_LANDSCAPE);

    expect(css).not.toContain("MuiDrawer");
    expect(css).not.toContain("MuiPopper");
    expect(css).not.toContain("MuiTooltip");
    expect(css).not.toContain("NotPrint");
  });

  it("hauria de fer el document exactament del mida del full", () => {
    const css = generatePrintCSS(A4_LANDSCAPE);

    // Res que desbordi el paper vol dir res que faci encongir el dibuix
    expect(css).toMatch(
      new RegExp(
        `html,\\s*body\\s*\\{[^}]*width: ${sheetWidthMM}mm[^}]*height: ${sheetHeightMM}mm`,
      ),
    );
  });

  it("hauria de donar al full les mides del paper, en mil·límetres", () => {
    const css = generatePrintCSS(A4_LANDSCAPE);

    expect(css).toMatch(
      new RegExp(
        `#${PRINT_ROOT_ID}[^{]*\\{[^}]*width: ${sheetWidthMM}mm[^}]*height: ${sheetHeightMM}mm`,
      ),
    );
  });

  it("hauria de treure l'escala de la previsualització, que només és per pantalla", () => {
    const css = generatePrintCSS(A4_LANDSCAPE);

    expect(css).toMatch(
      new RegExp(`#${PRINT_ROOT_ID}[^{]*\\{[^}]*transform: none !important`),
    );
  });

  it("hauria d'imprimir sempre sobre paper blanc, també en tema fosc", () => {
    const css = generatePrintCSS(A4_LANDSCAPE);

    expect(css).toMatch(/background-color: #[0-9a-fA-F]{3,6} !important/);
  });
});
