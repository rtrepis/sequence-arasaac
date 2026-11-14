// El document com a llista de pàgines (R1): cada pàgina és automàtica (el
// flux de sempre) o amb plantilla (caixes). Un document sense pàgines és una
// sola pàgina automàtica amb totes les seqüències: el de sempre, i el de tots
// els documents d'abans. Funcions pures; vegeu
// `docs/decisions/ADR-005-disposicio-lliure.md`.
import type { DocumentPages, DocumentSheet } from "@/types/document";
import type { PageDisposition } from "@/types/ui";
import { NewLayoutId, emptySheet } from "./sheets";
import {
  DistributeContext,
  applyTemplateToSheet,
  buildInitialPages,
  newSequencePlacement,
  sheetToTemplate,
} from "./distribute";
import {
  FREE_TEMPLATE,
  MAX_LINES,
  arrangementOf,
  arrangementTemplate,
} from "./templates";

/**
 * Les pàgines del document. Sense pàgines, la que el document fa servir sense
 * dir-ho: una sola pàgina automàtica amb totes les seqüències, en ordre.
 */
export const explicitPages = (
  pages: DocumentPages | undefined,
  sequenceKeys: readonly number[],
  newId: NewLayoutId,
): DocumentPages =>
  pages ?? {
    sheets: [
      {
        ...emptySheet(newId, "auto"),
        placements: sequenceKeys.map((key) => newSequencePlacement(key, newId)),
      },
    ],
    common: [],
  };

/**
 * Si alguna pàgina té caixes. Mentre la vista no pinta pàgines automàtiques
 * soles (vegeu `docs/PLA-mode-lliure.md`), és el que decideix si la vista
 * pinta les pàgines o el flux de sempre, amb totes les seqüències.
 */
export const hasTemplatePages = (pages: DocumentPages | undefined): boolean =>
  !!pages && pages.sheets.some(({ mode }) => mode === "template");

/**
 * «Disposició: Lliure» per a tot el document: totes les pàgines passen a tenir
 * caixes (`sheetToTemplate`). Un document sense pàgines rep la disposició de
 * partida (`buildInitialPages`).
 */
export const toTemplatePages = (
  pages: DocumentPages | undefined,
  sequenceKeys: readonly number[],
  context: DistributeContext,
): DocumentPages => {
  if (!pages) return buildInitialPages(sequenceKeys, context);
  return {
    ...pages,
    sheets: pages.sheets.map((sheet) => sheetToTemplate(sheet, pages, context)),
  };
};

/**
 * «Disposició: Automàtica» per a tot el document: totes les pàgines passen a
 * ser automàtiques. No s'esborra res: la plantilla, els espais i les caixes es
 * conserven, i tornar a «Lliure» les recupera.
 */
export const toAutoPages = (pages: DocumentPages): DocumentPages => ({
  ...pages,
  sheets: pages.sheets.map(
    (sheet): DocumentSheet =>
      sheet.mode === "auto" ? sheet : { ...sheet, mode: "auto" },
  ),
});

/**
 * Una seqüència nova, creada a l'edició. Si l'última pàgina és automàtica, hi
 * va al final: qui treballa en flux no ha de veure desaparèixer cap pestanya.
 * Si té plantilla, la seqüència queda sense col·locar: decidir a quina pàgina
 * va és de l'usuari.
 */
export const addNewSequenceToPages = (
  pages: DocumentPages,
  sequenceKey: number,
  newId: NewLayoutId,
): DocumentPages => {
  const last = pages.sheets.length - 1;
  if (pages.sheets[last]?.mode !== "auto") return pages;
  return {
    ...pages,
    sheets: pages.sheets.map((sheet, index) =>
      index === last
        ? {
            ...sheet,
            placements: [
              ...sheet.placements,
              newSequencePlacement(sequenceKey, newId),
            ],
          }
        : sheet,
    ),
  };
};

// --- La disposició d'una pàgina (pas 7) ---

/**
 * La disposició d'una pàgina, tal com la tria l'usuari: simple, columnes,
 * files o lliure. Una plantilla aplicada és lliure, amb espais per omplir.
 * Sense pàgina (un document sense pàgines pròpies), simple.
 */
export const dispositionOf = (
  sheet: DocumentSheet | undefined,
): PageDisposition => {
  if (!sheet || sheet.mode === "auto") return "auto";
  const arrangement = arrangementOf(sheet.template);
  return arrangement.kind === "template" ? "free" : arrangement.kind;
};

/**
 * Una pàgina buida amb una disposició: en columnes o en files, n'hi ha una
 * que creix amb cada bloc que s'hi afegeix (ADR-005, decisió 22).
 */
export const newSheetWith = (
  newId: NewLayoutId,
  disposition: PageDisposition,
): DocumentSheet => {
  if (disposition === "auto") return emptySheet(newId, "auto");
  return {
    ...emptySheet(newId, "template"),
    template: disposition === "free" ? FREE_TEMPLATE.id : `${disposition}-1`,
  };
};

/**
 * Les pàgines amb què comença un document nou amb la disposició de les
 * preferències: una sola pàgina amb totes les seqüències. Simple és la de
 * sempre, sense pàgines pròpies (`undefined`).
 */
export const initialPagesFor = (
  disposition: PageDisposition,
  sequenceKeys: readonly number[],
  context: DistributeContext,
): DocumentPages | undefined => {
  if (disposition === "auto") return undefined;
  const simple = explicitPages(undefined, sequenceKeys, context.newId);
  if (disposition === "free") {
    const sheet = sheetToTemplate(simple.sheets[0], simple, context);
    return { ...simple, sheets: [{ ...sheet, template: FREE_TEMPLATE.id }] };
  }
  const count = sequenceKeys.length;
  return applyTemplateToSheet(
    simple,
    0,
    arrangementTemplate(
      disposition,
      Math.min(Math.max(count, 1), MAX_LINES),
      count,
    ),
    context.area,
  );
};
