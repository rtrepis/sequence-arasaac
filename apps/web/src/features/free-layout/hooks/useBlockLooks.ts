// Com es veuen les targetes de cada bloc: les de la seqüència amb l'estil del
// document i, a sobre, l'estil amb nom que li toca: el reassignat del bloc si
// en té, i si no el de la seqüència (fonament 03, §4). Ho fan servir el full (les pàgines en
// blocs i les simples) i el mesurador de targetes.
import { useMemo } from "react";
import { useAppSelector } from "@/app/hooks";
import type { PictogramCardDefaults, Sequence } from "@/types/sequence";
import {
  cardDefaultsOf,
  selectDocumentCardDefaults,
  selectDocumentStyle,
} from "@features/sequence/style/styleSelectors";
import {
  selectDocumentContent,
  selectNamedStyles,
  selectSequenceStyleIds,
} from "../store/freeLayoutThunks";
import {
  cardMeasureKey,
  cardNamedStyleOf,
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
 * estil reassignat (`styleId`). Guarda el que ha calculat mentre no canvien el contingut, els
 * estils ni l'estil del document: el mesurador torna a mesurar cada vegada
 * que rep pictogrames nous, i no ho ha de fer a cada pintada.
 */
export const useBlockLooks = (): ((
  sequenceKey: number,
  styleId: string | undefined,
) => BlockLook) => {
  const content = useAppSelector(selectDocumentContent);
  const styles = useAppSelector(selectNamedStyles);
  const sequenceStyleIds = useAppSelector(selectSequenceStyleIds);
  const documentStyle = useAppSelector(selectDocumentStyle);
  const defaults = useAppSelector(selectDocumentCardDefaults);

  return useMemo(() => {
    const cache = new Map<string, BlockLook>();
    return (sequenceKey: number, styleId: string | undefined): BlockLook => {
      const named = cardNamedStyleOf(
        { styles, sequenceStyleIds },
        sequenceKey,
        styleId,
      );
      const measureKey = cardMeasureKey(sequenceKey, named?.id);
      const cached = cache.get(measureKey);
      if (cached) return cached;
      const pictograms = content[sequenceKey] ?? [];
      const look: BlockLook = named
        ? {
            measureKey,
            // Els pictogrames només porten els seus retocs: la resta la
            // prenen de l'estil amb nom, sense còpies (solució A). La
            // distribució no surt d'aquí: les targetes no la fan servir
            pictograms,
            defaults: cardDefaultsOf(styleWithNamed(documentStyle, named)),
          }
        : { measureKey, pictograms, defaults };
      cache.set(measureKey, look);
      return look;
    };
  }, [content, styles, sequenceStyleIds, documentStyle, defaults]);
};
