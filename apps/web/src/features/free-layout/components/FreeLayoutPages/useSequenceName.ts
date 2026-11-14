import { useCallback } from "react";
import { useIntl } from "react-intl";
import { useAppSelector } from "@/app/hooks";
import {
  selectSequenceExtras,
  selectSequenceKeys,
} from "@features/free-layout/store/freeLayoutThunks";
import messages from "./FreeLayoutPages.lang";

/**
 * El nom d'una seqüència: el títol que porta el fitxer, si en té, o «Seqüència
 * N», amb el número de la seva pestanya. És el que diuen les caixes, la llista
 * per afegir-ne i el calaix.
 */
export const useSequenceName = (): ((sequenceKey: number) => string) => {
  const intl = useIntl();
  const keys = useAppSelector(selectSequenceKeys);
  const extras = useAppSelector(selectSequenceExtras);
  return useCallback(
    (sequenceKey: number) => {
      const title = extras?.[sequenceKey]?.title;
      if (typeof title === "string" && title.trim()) return title;
      return intl.formatMessage(messages.sequenceName, {
        number: keys.indexOf(sequenceKey) + 1,
      });
    },
    [extras, intl, keys],
  );
};
