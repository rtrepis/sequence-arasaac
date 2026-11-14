// L'ordre de lectura de les caixes d'un full: de dalt a baix i, a la mateixa
// fila, d'esquerra a dreta. És l'ordre del tabulador, el dels lectors de
// pantalla i el que fan servir les plantilles. No té res a veure amb l'ordre en
// què s'han pintat.
import type { Box } from "./placement";

/**
 * Dues caixes la part de dalt de les quals és a menys d'aquesta distància són
 * a la mateixa fila: a mà, ningú no les alinea al mil·límetre.
 */
export const ROW_TOLERANCE_MM = 5;

/**
 * Les caixes en ordre de lectura. Es fan files a partir de la més alta: una
 * caixa entra a la fila si comença a menys de `ROW_TOLERANCE_MM` de la primera
 * de la fila. Dins de cada fila, d'esquerra a dreta.
 */
export const sortByReadingOrder = <T extends Box>(boxes: readonly T[]): T[] => {
  const byTop = [...boxes].sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: T[][] = [];
  byTop.forEach((box) => {
    const row = rows[rows.length - 1];
    if (row && box.y - row[0].y < ROW_TOLERANCE_MM) row.push(box);
    else rows.push([box]);
  });
  return rows.flatMap((row) => row.sort((a, b) => a.x - b.x));
};
