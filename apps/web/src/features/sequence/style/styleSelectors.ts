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
import { sequenceStyleOf } from "./namedStyle";
import type { PictogramCardDefaults } from "@/types/sequence";

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

/**
 * L'estil dels pictogrames de la seqüència activa: el del document, o el de la
 * seqüència si en té (`sequenceStyleIds`). És el que hereten els pictogrames
 * que s'hi editen, s'hi afegeixen o s'hi enganxen.
 */
export const selectActiveSequenceStyle = createSelector(
  [
    selectDocumentStyle,
    (state: RootState) => state.document.styles,
    (state: RootState) => state.document.sequenceStyleIds,
    (state: RootState) => state.document.activeSAAC,
  ],
  (style, styles, sequenceStyleIds, activeSAAC) =>
    sequenceStyleOf(style, { styles, sequenceStyleIds }, activeSAAC),
);

/** L'estil dels pictogrames de la seqüència activa, amb la forma de `defaultSettings`. */
export const selectActiveSequencePictStyle = createSelector(
  [selectActiveSequenceStyle],
  (style): DefaultSettings => pictStyleOf(style),
);

/** El que hereten els pictogrames de la seqüència activa, per a `PictogramCard`. */
export const selectActiveSequenceCardDefaults = createSelector(
  [selectActiveSequenceStyle],
  cardDefaultsOf,
);

/**
 * El que hereten els pictogrames de cada seqüència, per clau: per a les
 * pàgines que pinten les seqüències soles, sense blocs.
 */
export const selectSequenceCardDefaults = createSelector(
  [
    selectDocumentStyle,
    selectDocumentCardDefaults,
    (state: RootState) => state.document.styles,
    (state: RootState) => state.document.sequenceStyleIds,
  ],
  (
    style,
    documentDefaults,
    styles,
    sequenceStyleIds,
  ): ((sequenceKey: number) => PictogramCardDefaults) => {
    const cache = new Map<number, PictogramCardDefaults>();
    return (sequenceKey) => {
      if (sequenceStyleIds?.[sequenceKey] === undefined)
        return documentDefaults;
      const cached = cache.get(sequenceKey);
      if (cached) return cached;
      const defaults = cardDefaultsOf(
        sequenceStyleOf(style, { styles, sequenceStyleIds }, sequenceKey),
      );
      cache.set(sequenceKey, defaults);
      return defaults;
    };
  },
);
