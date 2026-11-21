// L'estil d'un pictograma amb la solució A del pla dels estils: un pictograma
// guarda **només els seus retocs**, i la resta l'hereta de l'estil que li toca
// (`docs/fonaments/03-model-contingut-estil.md`, §2, §4 i §6;
// `docs/plans/PLA-estils.md`, §3).
//
// Aquí hi ha la resolució (la que fa servir la targeta), si un pictograma té
// retocs (l'indicador «personalitzat»), com se li treuen («Restableix») i com
// es passa del model d'abans, que copiava l'estil a cada pictograma, al d'ara.
import type { SequenceStyle } from "@/types/document";
import type {
  PictApiAra,
  PictApiAraSettings,
  PictogramCardDefaults,
  PictSequence,
  PictSequenceSettings,
} from "@/types/sequence";
import { mergeDeep } from "@features/sequence/saac/cascade";
import {
  DEFAULT_FITZGERALD_CATEGORY_COLORS,
  FITZGERALD_NONE_COLOR,
  categoryOf,
  colorForCategory,
  sameColor,
} from "@features/sequence/saac/fitzgerald";
import {
  PICTOGRAM_VARIANTS,
  type PictogramVariant,
} from "@features/sequence/saac/types";
import { deepEqual } from "./styleModel";

/** Les propietats de la targeta que un pictograma pot retocar. */
const CARD_KEYS = [
  "textPosition",
  "font",
  "numberFont",
  "borderIn",
  "borderOut",
] as const;

/** Les propietats de la imatge que un pictograma pot retocar. */
const IMAGE_KEYS = ["skin", "hair", "color", "fitzgerald"] as const;

/** L'estil que hereten els pictogrames, amb la forma que fa servir la targeta. */
export const cardDefaultsOf = ({
  pictSequence,
  pictApiAra,
  fitzgeraldColors,
}: SequenceStyle): PictogramCardDefaults => ({
  numbered: pictSequence.numbered,
  textPosition: pictSequence.textPosition,
  skin: pictApiAra.skin,
  hair: pictApiAra.hair,
  color: pictApiAra.color,
  fitzgerald: pictApiAra.fitzgerald,
  ...(fitzgeraldColors && { fitzgeraldColors }),
  font: pictSequence.font,
  numberFont: pictSequence.numberFont,
  borderIn: pictSequence.borderIn,
  borderOut: pictSequence.borderOut,
});

/**
 * Quines variants d'ARASAAC admet el pictograma. Els pictogrames d'abans de la
 * solució A no ho deien: ho deia que en portessin el valor.
 */
export const variantsOf = (img: PictApiAra): PictogramVariant[] =>
  img.variants
    ? [...img.variants]
    : PICTOGRAM_VARIANTS.filter((key) => img.settings[key] !== undefined);

/**
 * El pictograma amb tot l'estil resolt: el seu retoc si en té, i si no el de
 * l'estil, propietat a propietat. La pell, el cabell i el color, només si el
 * pictograma els admet; el Fitzgerald, el de la seva categoria. És el que pinta
 * la targeta, i el que es desa al núvol, que encara té la forma d'abans.
 */
export const resolvePictogram = (
  pict: PictSequence,
  defaults: PictogramCardDefaults,
): PictSequence => {
  const variants = variantsOf(pict.img);
  const own = pict.img.settings;
  const { settings } = pict;
  return {
    ...pict,
    img: {
      ...pict.img,
      variants,
      settings: {
        ...(variants.includes("skin") && { skin: own.skin ?? defaults.skin }),
        ...(variants.includes("hair") && { hair: own.hair ?? defaults.hair }),
        ...(variants.includes("color") && {
          color: own.color ?? defaults.color,
        }),
        fitzgerald:
          own.fitzgerald ??
          colorForCategory(
            categoryOf(pict),
            defaults.fitzgeraldColors ?? DEFAULT_FITZGERALD_CATEGORY_COLORS,
            defaults.fitzgerald ?? FITZGERALD_NONE_COLOR,
          ),
      },
    },
    settings: {
      ...settings,
      textPosition: settings.textPosition ?? defaults.textPosition,
      font: mergeDeep(defaults.font, settings.font),
      numberFont: mergeDeep(
        defaults.numberFont ?? defaults.font,
        settings.numberFont,
      ),
      borderIn: mergeDeep(defaults.borderIn, settings.borderIn),
      borderOut: mergeDeep(defaults.borderOut, settings.borderOut),
    },
  };
};

/** El pictograma sense cap retoc: tot l'estil, heretat. */
const withoutRetouches = (pict: PictSequence): PictSequence => {
  const settings: PictSequenceSettings = { ...pict.settings };
  CARD_KEYS.forEach((key) => delete settings[key]);
  const imageSettings: PictApiAraSettings = { ...pict.img.settings };
  IMAGE_KEYS.forEach((key) => delete imageSettings[key]);
  return {
    ...pict,
    img: {
      ...pict.img,
      variants: variantsOf(pict.img),
      settings: imageSettings,
    },
    settings,
  };
};

/**
 * Només els retocs: treu del pictograma el que és igual al que heretaria. És
 * el que fa el formulari en desar (només escriu el que es diferencia), i la
 * lectura del que encara té la forma d'abans (esborranys, núvol, fitxers
 * antics). Un retoc igual a l'estil deixa de ser un retoc, com en desar
 * (`diffStyle`).
 */
export const stripInherited = (
  pict: PictSequence,
  defaults: PictogramCardDefaults,
): PictSequence => {
  const bare = withoutRetouches(pict);
  const inherited = resolvePictogram(bare, defaults);
  const settings: PictSequenceSettings = { ...bare.settings };
  CARD_KEYS.forEach((key) => {
    const own = pict.settings[key];
    if (own === undefined) return;
    // Un objecte pot ser parcial: es compara un cop resolt
    const resolved =
      typeof own === "object" ? mergeDeep(inherited.settings[key], own) : own;
    if (!deepEqual(resolved, inherited.settings[key]))
      (settings as Record<string, unknown>)[key] = own;
  });
  const imageSettings: PictApiAraSettings = { ...bare.img.settings };
  const variants = bare.img.variants ?? [];
  const own = pict.img.settings;
  (["skin", "hair", "color"] as const).forEach((key) => {
    if (
      own[key] !== undefined &&
      variants.includes(key) &&
      own[key] !== inherited.img.settings[key]
    )
      (imageSettings as Record<string, unknown>)[key] = own[key];
  });
  const fitzgerald = inherited.img.settings.fitzgerald;
  if (
    own.fitzgerald !== undefined &&
    (fitzgerald === undefined || !sameColor(own.fitzgerald, fitzgerald))
  )
    imageSettings.fitzgerald = own.fitzgerald;
  return {
    ...bare,
    img: { ...bare.img, settings: imageSettings },
    settings,
  };
};

/**
 * Un pictograma amb la forma d'abans de la solució A (esborranys, núvol,
 * fitxers antics), amb només els retocs. Abans, sense posició del text la
 * targeta no en pintava cap: és el retoc «sense text», explícit (E3).
 */
export const pictogramFromLegacy = (
  pict: PictSequence,
  defaults: PictogramCardDefaults,
): PictSequence =>
  stripInherited(
    {
      ...pict,
      settings: {
        ...pict.settings,
        textPosition: pict.settings.textPosition ?? "none",
      },
    },
    defaults,
  );

/**
 * Té retocs propis? És l'indicador «personalitzat»: no es compara amb cap
 * estil, i canviar-lo no encén ni apaga cap marca (fonament 03, §6).
 */
export const isPictogramCustomized = (pictogram: PictSequence): boolean =>
  CARD_KEYS.some((key) => pictogram.settings[key] !== undefined) ||
  IMAGE_KEYS.some((key) => pictogram.img.settings[key] !== undefined);

/**
 * El pictograma sense cap retoc («Restableix»): ho hereta tot. El contingut
 * (paraula, text, imatge, creu, categoria) no es toca, i el Fitzgerald torna al
 * color de la seva categoria.
 */
export const resetPictogramStyle = (pictogram: PictSequence): PictSequence =>
  withoutRetouches(pictogram);

// --- Documents amb la forma d'abans ---

/** El document amb cada pictograma passat per `change`. */
const mapPictograms = <
  T extends { content: { [key: number]: PictSequence[] } },
>(
  document: T,
  change: (pict: PictSequence) => PictSequence,
): T => ({
  ...document,
  content: Object.fromEntries(
    Object.entries(document.content).map(([key, sequence]) => [
      key,
      sequence.map(change),
    ]),
  ),
});

/**
 * El document amb la forma d'abans de la solució A, la que guarda el núvol
 * (`documentState`): cada pictograma amb l'estil resolt, i les variants que
 * admet dites pels valors que porta, com sempre.
 */
export const documentToLegacyPictograms = <
  T extends { content: { [key: number]: PictSequence[] } },
>(
  document: T,
  style: SequenceStyle,
): T => {
  const defaults = cardDefaultsOf(style);
  return mapPictograms(document, (pict) => {
    const resolved = resolvePictogram(pict, defaults);
    const img = { ...resolved.img };
    delete img.variants;
    return { ...resolved, img };
  });
};

/** El contrari: un document amb la forma d'abans, amb només els retocs. */
export const documentFromLegacyPictograms = <
  T extends { content: { [key: number]: PictSequence[] } },
>(
  document: T,
  style: SequenceStyle,
): T => {
  const defaults = cardDefaultsOf(style);
  return mapPictograms(document, (pict) => pictogramFromLegacy(pict, defaults));
};
