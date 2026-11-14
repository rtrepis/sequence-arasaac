// Punt de muntatge de la disposició dels documents nous (pas 7b). No pinta res.
import { ReactElement, useEffect } from "react";
import type { RootState } from "@/app/store";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectDefaultDisposition,
  selectIsBlankNewDocument,
  syncNewDocumentPagesThunk,
} from "@features/free-layout/store/freeLayoutThunks";

/** Si ja s'ha restaurat (o descartat) l'esborrany de la sessió anterior. */
const selectDraftRestoreSettled = (state: RootState): boolean =>
  state.documentStatus.draftRestoreSettled;

/**
 * Un document nou i buit comença amb la disposició de les preferències
 * («Pàgina i distribució»), i la segueix en viu mentre és buit, com la pàgina
 * i l'estil (fonament 03, §7): si les preferències del compte arriben tard,
 * o l'usuari les canvia, el document buit se les emporta. Espera que s'hagi
 * restaurat l'esborrany, que porta la seva disposició.
 */
const NewDocumentPagesSync = (): ReactElement | null => {
  const dispatch = useAppDispatch();
  const settled = useAppSelector(selectDraftRestoreSettled);
  const blank = useAppSelector(selectIsBlankNewDocument);
  const disposition = useAppSelector(selectDefaultDisposition);

  useEffect(() => {
    if (settled && blank) dispatch(syncNewDocumentPagesThunk());
  }, [dispatch, settled, blank, disposition]);

  return null;
};

export default NewDocumentPagesSync;
