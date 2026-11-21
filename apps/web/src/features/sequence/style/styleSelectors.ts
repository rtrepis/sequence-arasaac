// Selectors de l'estil: quin és l'estil per defecte de l'usuari i amb quin es
// veu el document obert. Tot el que pinta pictogrames del document ha de llegir
// l'estil d'aquí, no de `ui.defaultSettings`: les preferències de qui obre un
// document no el reescriuen (`docs/fonaments/03-model-contingut-estil.md`).
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { DefaultSettings } from "@/types/ui";
import {
  buildUserDefaultStyle,
  pictStyleOf,
  resolveDocumentStyle,
  resolveSequenceViews,
} from "./styleModel";
import { cardDefaultsOf } from "./pictogramStyle";

export { cardDefaultsOf };

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

/** L'estil que hereten els pictogrames del document, per a `PictogramCard`. */
export const selectDocumentCardDefaults = createSelector(
  [selectDocumentStyle],
  cardDefaultsOf,
);
