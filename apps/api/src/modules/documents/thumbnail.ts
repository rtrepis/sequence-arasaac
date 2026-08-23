// Derivació de la miniatura d'un document
//
// La miniatura es calcula en desar i es guarda al document perquè el llistat
// pugui ensenyar de què va cada seqüència sense llegir-ne el contingut sencer:
// amb els documents que porten imatges pròpies, «llegir-ho tot per fer una
// miniatura» seria transferir megabytes per pintar tres quadradets.
//
// No es genera cap imatge nova ni es puja res: la miniatura són referències als
// pictogrames que el document ja té, i el client les pinta com les pinta a
// l'editor. Així no costa ni un byte de Cloudinary ni de la quota de l'usuari.

import type { DocumentThumbnailPict } from "@sequence-arasaac/shared-types";
import type { CreateDocumentInput } from "./validators";

// Tres pictogrames: prou per reconèixer la seqüència d'un cop d'ull i prou pocs
// perquè la fila del llistat no es converteixi en una tira de pictogrames.
export const THUMBNAIL_MAX_PICTS = 3;

// Clau de la primera seqüència segons l'ordre que hagi triat l'usuari; si no hi
// ha ordre desat, l'ordre numèric de les claus.
const sequenceKeysInOrder = (
  content: CreateDocumentInput["content"],
  order?: number[]
): string[] => {
  const keys = Object.keys(content);
  if (!order) return keys.sort((a, b) => Number(a) - Number(b));

  const ordered = order.map(String).filter((key) => key in content);
  const rest = keys
    .filter((key) => !ordered.includes(key))
    .sort((a, b) => Number(a) - Number(b));

  return [...ordered, ...rest];
};

/**
 * Primers pictogrames del document, en l'ordre en què l'usuari els veu.
 *
 * Es recorren les seqüències fins a trobar-ne amb pictogrames: la primera
 * seqüència pot ser buida (l'usuari n'ha creat una i encara no l'ha omplert) i
 * una miniatura buida amb contingut a la segona seria una miniatura mentidera.
 */
export const buildDocumentThumbnail = (
  content: CreateDocumentInput["content"],
  order?: number[]
): DocumentThumbnailPict[] => {
  const thumbnail: DocumentThumbnailPict[] = [];

  for (const key of sequenceKeysInOrder(content, order)) {
    const sequence = [...content[key]].sort(
      (a, b) => a.indexSequence - b.indexSequence
    );

    for (const pict of sequence) {
      // Una data:image no hi entra mai: la miniatura es calcula després de pujar
      // les imatges, i desar-hi el base64 duplicaria el pes de tot el document.
      const url = pict.img.url?.startsWith("data:image/")
        ? undefined
        : pict.img.url;

      thumbnail.push({
        selectedId: pict.img.selectedId,
        ...(url ? { url } : {}),
        ...(pict.img.settings.skin ? { skin: pict.img.settings.skin } : {}),
        ...(pict.img.settings.hair ? { hair: pict.img.settings.hair } : {}),
        ...(pict.img.settings.color !== undefined
          ? { color: pict.img.settings.color }
          : {}),
      });

      if (thumbnail.length === THUMBNAIL_MAX_PICTS) return thumbnail;
    }
  }

  return thumbnail;
};
