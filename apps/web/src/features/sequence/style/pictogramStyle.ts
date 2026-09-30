// L'estil propi d'un pictograma: si en té (l'indicador «personalitzat») i com
// se li treu («Restableix»). El fan servir el formulari d'edició i el menú
// contextual de la graella, perquè tots dos diguin i facin el mateix
// (`docs/fonaments/03-model-contingut-estil.md`, §5 i §6).
import type { SequenceStyle } from "@/types/document";
import type { PictSequence } from "@/types/sequence";
import { pictogramStyleOverride } from "@features/sequence/saac/serialize";
import {
  DEFAULT_FITZGERALD_CATEGORY_COLORS,
  categoryOf,
  colorForCategory,
} from "@features/sequence/saac/fitzgerald";

/** Té retocs propis respecte de l'estil del document? */
export const isPictogramCustomized = (
  pictogram: PictSequence,
  documentStyle: SequenceStyle,
): boolean => pictogramStyleOverride(pictogram, documentStyle) !== undefined;

/**
 * El pictograma sense cap retoc: pren l'estil del document. El contingut
 * (paraula, text, imatge, creu, categoria) no es toca, i el Fitzgerald torna al
 * color de la seva categoria. Pell, cabell i color només es posen si el
 * pictograma els admet.
 */
export const resetPictogramStyle = (
  pictogram: PictSequence,
  documentStyle: SequenceStyle,
): PictSequence => {
  const { pictApiAra, pictSequence } = documentStyle;
  const current = pictogram.img.settings;
  return {
    ...pictogram,
    img: {
      ...pictogram.img,
      settings: {
        ...(current.skin !== undefined && { skin: pictApiAra.skin }),
        ...(current.hair !== undefined && { hair: pictApiAra.hair }),
        ...(current.color !== undefined && { color: pictApiAra.color }),
        fitzgerald: colorForCategory(
          categoryOf(pictogram),
          documentStyle.fitzgeraldColors ?? DEFAULT_FITZGERALD_CATEGORY_COLORS,
          pictApiAra.fitzgerald,
        ),
      },
    },
    // Lletra i números fora: sense valor, la targeta fa servir els de l'estil
    settings: {
      textPosition: pictSequence.textPosition,
      borderIn: { ...pictSequence.borderIn },
      borderOut: { ...pictSequence.borderOut },
    },
  };
};
