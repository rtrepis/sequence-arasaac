// El document com a llista de pàgines (R1): cada pàgina és automàtica (el
// flux de sempre) o amb plantilla (caixes). Un document sense pàgines és una
// sola pàgina automàtica amb totes les seqüències: el de sempre, i el de tots
// els documents d'abans. Funcions pures; vegeu
// `docs/decisions/ADR-005-disposicio-lliure.md`.
import type { DocumentPages, DocumentSheet } from "@/types/document";
import { NewLayoutId, emptySheet } from "./sheets";
import {
  DistributeContext,
  buildInitialPages,
  newSequencePlacement,
  sheetToTemplate,
} from "./distribute";

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
