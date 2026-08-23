// Nom proposat per a un document a partir del que hi ha dins.
//
// Fins ara el document no tenia nom i el llistat del núvol l'anomenava pels últims
// caràcters de l'identificador: amb tres documents desats, tots tres es deien igual
// de poc. El nom ara el posa l'usuari, però la casella no comença en blanc: les
// primeres paraules de la seqüència ja diuen de què va, i acceptar la proposta ha
// de ser tan barat com escriure'n una de nova.

import { DocumentSAAC } from "@/types/document";

// Prou per reconèixer la seqüència; més paraules farien un nom que no cabria enlloc
const TITLE_MAX_WORDS = 4;
export const DOCUMENT_TITLE_MAX_LENGTH = 200;

// Claus de les seqüències en l'ordre en què l'usuari les veu
const sequenceKeysInOrder = (document: DocumentSAAC): number[] => {
  const keys = Object.keys(document.content).map(Number);
  if (!document.order) return keys.sort((a, b) => a - b);

  const ordered = document.order.filter((key) => keys.includes(key));
  const rest = keys
    .filter((key) => !ordered.includes(key))
    .sort((a, b) => a - b);

  return [...ordered, ...rest];
};

/**
 * Proposta de nom: les primeres paraules del document.
 *
 * Retorna una cadena buida si el document encara no té cap pictograma amb text —
 * qui la demana decideix llavors què hi posa, que és cosa de traducció i no d'aquí.
 */
export const suggestDocumentTitle = (document: DocumentSAAC): string => {
  const words: string[] = [];

  for (const key of sequenceKeysInOrder(document)) {
    const sequence = [...(document.content[key] ?? [])].sort(
      (a, b) => a.indexSequence - b.indexSequence,
    );

    for (const pict of sequence) {
      // El text propi mana sobre la paraula cercada: és el que es veu al full
      const word = (pict.text || pict.img.searched.word || "").trim();
      if (word) words.push(word);

      if (words.length === TITLE_MAX_WORDS) {
        return words.join(" ").slice(0, DOCUMENT_TITLE_MAX_LENGTH);
      }
    }
  }

  return words.join(" ").slice(0, DOCUMENT_TITLE_MAX_LENGTH);
};
