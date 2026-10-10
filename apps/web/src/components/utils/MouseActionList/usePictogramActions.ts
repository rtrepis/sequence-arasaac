import React from "react";
import { useAppDispatch } from "../../../app/hooks";
import {
  insertPictogramActionCreator,
  movePictogramActionCreator,
  renumberSequenceActionCreator,
  subtractPictogramActionCreator,
  updatePictSequenceActionCreator,
} from "@features/sequence/store/documentSlice";
import useNewPictogram from "@features/pictogram/hooks/useNewPictogram";
import { resetPictogramStyleThunk } from "@features/sequence/store/styleSlice";
import { PictSequence } from "../../../types/sequence";

/** Les accions que es poden fer sobre un pictograma de la seqüència. */
export type PictogramActionKey =
  | "copy"
  | "paste"
  | "edit"
  | "editText"
  | "delete"
  | "insert"
  | "duplicate"
  | "moveBefore"
  | "moveAfter"
  | "resetStyle";

interface PictogramActionsParams {
  pictogram: PictSequence;
  editAction: () => void;
  /** Edita el text damunt de la targeta. Sense, l'acció no fa res */
  editTextAction?: () => void;
  copyAction: React.Dispatch<React.SetStateAction<PictSequence>> | undefined;
  pasteObject: PictSequence | undefined;
}

/**
 * Font única de les accions d'un pictograma. Viu en un hook, i no dins de
 * `MouseActionList`, perquè el mateix conjunt s'ofereix des de dos llocs: el
 * menú contextual (clic dret o pulsació llarga nadiua) i el diàleg d'edició,
 * que és l'única via dels dispositius on el navegador no dispara mai
 * `contextmenu` — tot el WebKit d'iOS, iPad inclòs.
 */
export const usePictogramActions = ({
  pictogram,
  editAction,
  editTextAction,
  copyAction,
  pasteObject,
}: PictogramActionsParams): Record<PictogramActionKey, () => void> => {
  const dispatch = useAppDispatch();
  const { getPictogramEmptyWithDefaultSettings: pictogramEmpty } =
    useNewPictogram();

  /** Insereix a la seqüència i renumera perquè els índexs no quedin amb forats */
  const insertAfter = (newPictogram: PictSequence) => {
    dispatch(insertPictogramActionCreator(newPictogram));
    dispatch(renumberSequenceActionCreator());
  };

  return {
    copy: () => copyAction?.(pictogram),

    paste: () => {
      if (!pasteObject) return;
      dispatch(
        updatePictSequenceActionCreator({
          ...pasteObject,
          indexSequence: pictogram.indexSequence,
        }),
      );
    },

    edit: editAction,

    editText: () => editTextAction?.(),

    delete: () => {
      dispatch(subtractPictogramActionCreator(pictogram.indexSequence));
      dispatch(renumberSequenceActionCreator());
    },

    insert: () => insertAfter(pictogramEmpty(pictogram.indexSequence + 1)),

    duplicate: () =>
      insertAfter({
        ...pictogram,
        indexSequence: pictogram.indexSequence + 1,
      }),

    // Si ja és el primer o l'últim, el reducer no fa res
    moveBefore: () =>
      dispatch(
        movePictogramActionCreator({
          from: pictogram.indexSequence,
          to: pictogram.indexSequence - 1,
        }),
      ),

    moveAfter: () =>
      dispatch(
        movePictogramActionCreator({
          from: pictogram.indexSequence,
          to: pictogram.indexSequence + 1,
        }),
      ),

    // Fora del formulari d'edició: s'aplica al document al moment, amb Desfés
    resetStyle: () =>
      dispatch(resetPictogramStyleThunk(pictogram.indexSequence)),
  };
};
