// Com es veuen les targetes de cada bloc: les de la seqüència amb l'estil del
// document, o, si el bloc fa servir un estil amb nom (R10, «Aplica el meu
// estil»), amb aquell estil per sobre. Ho fan servir el full (les pàgines en
// blocs i les simples) i el mesurador de targetes.
import { useMemo } from "react";
import { useAppSelector } from "@/app/hooks";
import type { PictogramCardDefaults, Sequence } from "@/types/sequence";
import {
  cardDefaultsOf,
  selectDocumentCardDefaults,
  selectDocumentStyle,
} from "@features/sequence/style/styleSelectors";
import { pictStyleOf } from "@features/sequence/style/styleModel";
import {
  selectDocumentContent,
  selectNamedStyles,
} from "../store/freeLayoutThunks";
import {
  blockSequence,
  cardMeasureKey,
  namedStyleOf,
  styleWithNamed,
} from "../model/blockStyle";

/** Les targetes d'un bloc: els pictogrames i els valors de reserva de la targeta. */
export interface BlockLook {
  /** Amb quina clau es mesura (`cardMeasureKey`) */
  measureKey: string;
  pictograms: Sequence;
  defaults: PictogramCardDefaults;
}

/**
 * Torna una funció que diu com es veu una seqüència en un bloc amb (o sense)
 * estil amb nom. Guarda el que ha calculat mentre no canvien el contingut, els
 * estils ni l'estil del document: el mesurador torna a mesurar cada vegada
 * que rep pictogrames nous, i no ho ha de fer a cada pintada.
 */
export const useBlockLooks = (): ((
  sequenceKey: number,
  styleId: string | undefined,
) => BlockLook) => {
  const content = useAppSelector(selectDocumentContent);
  const styles = useAppSelector(selectNamedStyles);
  const documentStyle = useAppSelector(selectDocumentStyle);
  const defaults = useAppSelector(selectDocumentCardDefaults);

  return useMemo(() => {
    const cache = new Map<string, BlockLook>();
    return (sequenceKey: number, styleId: string | undefined): BlockLook => {
      const named = namedStyleOf(styles, styleId);
      const measureKey = cardMeasureKey(sequenceKey, named?.id);
      const cached = cache.get(measureKey);
      if (cached) return cached;
      const pictograms = content[sequenceKey] ?? [];
      const look: BlockLook = named
        ? {
            measureKey,
            pictograms: blockSequence(pictograms, documentStyle, named),
            defaults: cardDefaultsOf(
              pictStyleOf(styleWithNamed(documentStyle, named)),
            ),
          }
        : { measureKey, pictograms, defaults };
      cache.set(measureKey, look);
      return look;
    };
  }, [content, styles, documentStyle, defaults]);
};
