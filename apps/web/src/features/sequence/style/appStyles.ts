// Els estils de l'app de la Galeria d'estils (pla dels estils, pas 9; D30 i
// D31; `docs/estudis/ESTUDI-estils-de-targetes.md`, §3 i §6).
//
// Cada estil és **complet**, com El meu estil: porta tot el que s'hi pot
// configurar (la targeta, la pell, el cabell, el color i els colors de
// Fitzgerald), i **no es pot editar**: per tenir-ne un de semblant, «Fes-lo el
// meu estil» (D7). Tots porten **Atkinson Hyperlegible**, al text i al número.
//
// La distribució (mida, espai, alineació) no és estil: la vista que porten és
// la de la base, i en triar-lo no es copia (`namedStyleFrom`).
import type { SequenceStyle, SequenceStyleView } from "@/types/document";
import type { Border, Font } from "@/types/sequence";
import type { DefaultSettingsPictSequence } from "@/types/ui";
import {
  DEFAULT_BORDER_IN_COLOR,
  DEFAULT_COLOR,
  DEFAULT_FITZGERALD,
  DEFAULT_FONT_SIZE,
  DEFAULT_HAIR,
  DEFAULT_SKIN,
} from "@/configs/defaultSettingsConfig";
import { appStyleBorderColors, printColors } from "@/style/palette";
import { DEFAULT_FITZGERALD_CATEGORY_COLORS } from "@features/sequence/saac/fitzgerald";

/** Els estils de l'app, en l'ordre de la galeria. */
export const APP_STYLE_KEYS = [
  "noBorders",
  "categoryColor",
  "toCut",
  "numberedSteps",
] as const;

export type AppStyleKey = (typeof APP_STYLE_KEYS)[number];

/** La lletra de tots els estils de l'app (D31) */
const APP_STYLE_FONT: Font = {
  family: "Atkinson-Hyperlegible",
  color: printColors.text,
  size: DEFAULT_FONT_SIZE,
};

/** Sense vora: gruix 0 (la targeta ho llegeix com «sense vora») */
const NO_BORDER: Border = {
  color: appStyleBorderColors.grey,
  radius: 0,
  size: 0,
};

/** La targeta de cada estil (`docs/estudis/ESTUDI-estils-de-targetes.md`, §3) */
const CARDS: Record<AppStyleKey, DefaultSettingsPictSequence> = {
  // El pictograma sol, amb el text a baix i sense número (V2 i V3 de l'estudi)
  noBorders: {
    numbered: false,
    textPosition: "bottom",
    font: APP_STYLE_FONT,
    numberFont: APP_STYLE_FONT,
    borderOut: NO_BORDER,
    borderIn: NO_BORDER,
  },
  // Un marc gruixut del color de la categoria, sense contorn exterior
  categoryColor: {
    numbered: false,
    textPosition: "bottom",
    font: APP_STYLE_FONT,
    numberFont: APP_STYLE_FONT,
    borderOut: NO_BORDER,
    borderIn: { color: DEFAULT_BORDER_IN_COLOR, radius: 12, size: 6 },
  },
  // Un contorn de tinta gruixut, que és la línia de tall
  toCut: {
    numbered: false,
    textPosition: "bottom",
    font: APP_STYLE_FONT,
    numberFont: APP_STYLE_FONT,
    borderOut: { color: appStyleBorderColors.ink, radius: 4, size: 4 },
    borderIn: NO_BORDER,
  },
  // El número gran, que agrupa el contorn amb la imatge i el text
  numberedSteps: {
    numbered: true,
    textPosition: "bottom",
    font: APP_STYLE_FONT,
    numberFont: { ...APP_STYLE_FONT, size: 1.4 },
    borderOut: { color: appStyleBorderColors.grey, radius: 12, size: 2 },
    borderIn: NO_BORDER,
  },
};

/**
 * Un estil de l'app sencer. `view` és la distribució de la base, que no és de
 * l'estil i no es copia: hi és perquè la mostra es pinti com la resta.
 */
export const appStyleOf = (
  key: AppStyleKey,
  view: SequenceStyleView,
): SequenceStyle => ({
  pictSequence: CARDS[key],
  pictApiAra: {
    skin: DEFAULT_SKIN,
    hair: DEFAULT_HAIR,
    fitzgerald: DEFAULT_FITZGERALD,
    color: DEFAULT_COLOR,
  },
  fitzgeraldColors: DEFAULT_FITZGERALD_CATEGORY_COLORS,
  view,
});
