// Punt de muntatge de l'estil dels documents nous (pla dels estils, D1). No
// pinta res.
import { ReactElement, useEffect } from "react";
import { useIntl } from "react-intl";
import type { RootState } from "@/app/store";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { adoptMyStyleThunk } from "@features/sequence/store/documentSlice";
import messages from "./NewDocumentStyleSync.lang";

/** Si ja s'ha restaurat (o descartat) l'esborrany de la sessió anterior. */
const selectDraftRestoreSettled = (state: RootState): boolean =>
  state.documentStatus.draftRestoreSettled;

/** El document encara no té estil propi: acaba de néixer. */
const selectHasNoStyle = (state: RootState): boolean =>
  state.document.defaultSettings === undefined;

/**
 * Un document nou neix amb una còpia del meu estil, amb el nom «El meu estil»
 * en l'idioma de la interfície, i no el segueix mai (fonament 03, §7). Espera
 * que s'hagi restaurat l'esborrany: les preferències del navegador ja hi són,
 * i l'esborrany porta el seu estil. També en dona a un esborrany d'abans que
 * no en tenia, i a cada document que es comença de nou.
 */
const NewDocumentStyleSync = (): ReactElement | null => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const settled = useAppSelector(selectDraftRestoreSettled);
  const hasNoStyle = useAppSelector(selectHasNoStyle);

  useEffect(() => {
    if (settled && hasNoStyle)
      dispatch(adoptMyStyleThunk(intl.formatMessage(messages.myStyleName)));
  }, [dispatch, intl, settled, hasNoStyle]);

  return null;
};

export default NewDocumentStyleSync;
