import { DocumentSAAC } from "@/types/document";

/**
 * Un document «verge» és el que crea documentSlice en arrencar: sense títol i
 * sense cap pictograma. Ni s'hi restaura res a sobre ni se'n desa cap còpia de
 * l'esborrany —desar-lo només serviria per esborrar l'esborrany bo—, i un
 * fitxer d'estil obert amb un document verge no té cap contingut a què
 * aplicar-se.
 */
export const isPristineDocument = (document: DocumentSAAC): boolean => {
  const sequences = Object.values(document.content);

  return (
    document.title === undefined &&
    sequences.length <= 1 &&
    sequences.every((sequence) => sequence.length === 0)
  );
};
