// Selectors de l'estil: quin és l'estil per defecte de l'usuari i amb quin es
// veu el document obert. Tot el que pinta pictogrames del document ha de llegir
// l'estil d'aquí, no de `ui.defaultSettings`: les preferències de qui obre una
// seqüència no la reescriuen (`docs/fonaments/sequencia-i-estil.md`).
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { DefaultSettings } from "@/types/ui";
import { PictogramCardDefaults } from "@/types/sequence";
import {
  buildUserDefaultStyle,
  pictStyleOf,
  resolveDocumentStyle,
  resolveSequenceViews,
} from "./styleModel";

export const selectUserDefaultStyle = createSelector(
  [
    (state: RootState) => state.ui.defaultSettings,
    (state: RootState) => state.ui.viewSettings,
  ],
  buildUserDefaultStyle,
);

export const selectDocumentStyle = createSelector(
  [
    (state: RootState) => state.document.defaultSettings,
    (state: RootState) => state.document.styleView,
    selectUserDefaultStyle,
  ],
  (defaultSettings, styleView, userDefault) =>
    resolveDocumentStyle({ defaultSettings, styleView }, userDefault),
);

/** L'estil dels pictogrames del document, amb la forma de `defaultSettings`. */
export const selectDocumentPictStyle = createSelector(
  [selectDocumentStyle],
  (style): DefaultSettings => pictStyleOf(style),
);

/** La vista de cada pestanya, amb la de l'estil a les que no en tenen. */
export const selectResolvedSequenceViews = createSelector(
  [
    (state: RootState) => state.document.content,
    (state: RootState) => state.document.viewSettings,
    selectDocumentStyle,
  ],
  (content, viewSettings, style) =>
    resolveSequenceViews({ content, viewSettings }, style.view),
);

/** Els valors de reserva que `PictogramCard` necessita, a partir d'un estil. */
export const cardDefaultsOf = ({
  pictSequence,
}: DefaultSettings): PictogramCardDefaults => ({
  numbered: pictSequence.numbered,
  font: pictSequence.font,
  numberFont: pictSequence.numberFont,
  borderIn: pictSequence.borderIn,
  borderOut: pictSequence.borderOut,
});

export const selectDocumentCardDefaults = createSelector(
  [selectDocumentPictStyle],
  cardDefaultsOf,
);
