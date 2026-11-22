// Model de l'estil del document: què és, d'on surt i com se n'aplica un de nou.
//
// Funcions pures, sense Redux ni React: les fan servir el lector del `.saac`, els
// reducers del document i els selectors, i es proven soles. Les regles que
// implementen són les de `docs/fonaments/03-model-contingut-estil.md`.
import {
  DocumentSAAC,
  SequenceStyle,
  SequenceStyleView,
  SequenceViewSettings,
} from "@/types/document";
import { DefaultSettings, ViewSettings } from "@/types/ui";
import { DocumentLayout } from "@/types/document";
import { PictSequence } from "@/types/sequence";
import { DEFAULT_FITZGERALD_CATEGORY_COLORS } from "@features/sequence/saac/fitzgerald";

// --- Estil per defecte de l'usuari ---

/**
 * L'estil per defecte de l'usuari surt de les seves preferències: la part dels
 * pictogrames és `defaultSettings`, i la de mides i espaiats, els camps d'estil
 * de `viewSettings`. La resta de `viewSettings` (pàgina, direcció, autor) és
 * disposició, no estil, i no hi entra.
 */
export const buildUserDefaultStyle = (
  defaultSettings: DefaultSettings,
  viewSettings: ViewSettings,
): SequenceStyle => ({
  pictSequence: defaultSettings.pictSequence,
  pictApiAra: defaultSettings.pictApiAra,
  view: {
    sizePict: viewSettings.sizePict,
    pictSpaceBetween: viewSettings.pictSpaceBetween,
    alignmentH: viewSettings.alignmentH,
    alignmentV: viewSettings.alignmentV,
    sequenceSpaceBetween: viewSettings.sequenceSpaceBetween,
  },
  fitzgeraldColors: DEFAULT_FITZGERALD_CATEGORY_COLORS,
});

/** La part de l'estil que es desa com a `defaultSettings`. */
export const pictStyleOf = (style: SequenceStyle): DefaultSettings => ({
  pictSequence: style.pictSequence,
  pictApiAra: style.pictApiAra,
});

/** La vista d'una pestanya que correspon a una vista d'estil. */
export const tabViewOf = (view: SequenceStyleView): SequenceViewSettings => ({
  sizePict: view.sizePict,
  pictSpaceBetween: view.pictSpaceBetween,
  alignmentH: view.alignmentH,
  alignmentV: view.alignmentV,
});

// --- Estil d'un document ---

/**
 * L'estil amb què es veu un document. La part que el document no porta (un
 * document nou que encara no s'ha desat ni se n'ha tocat l'estil) **hereta** la
 * de l'estil per defecte: així un document nou neix amb l'estil de l'usuari
 * encara que les preferències arribin després de crear-la.
 */
export const resolveDocumentStyle = (
  document: Pick<
    DocumentSAAC,
    "defaultSettings" | "styleView" | "fitzgeraldColors"
  >,
  userDefault: SequenceStyle,
): SequenceStyle => ({
  pictSequence:
    document.defaultSettings?.pictSequence ?? userDefault.pictSequence,
  pictApiAra: document.defaultSettings?.pictApiAra ?? userDefault.pictApiAra,
  view: document.styleView ?? userDefault.view,
  fitzgeraldColors:
    document.fitzgeraldColors ??
    userDefault.fitzgeraldColors ??
    DEFAULT_FITZGERALD_CATEGORY_COLORS,
});

/**
 * La vista de cada pestanya. Una pestanya sense `viewSettings` propis segueix la
 * vista de l'estil: és el cas de les pestanyes noves, que no s'escriuen fins que
 * es desa el document.
 */
export const resolveSequenceViews = (
  document: Pick<DocumentSAAC, "content" | "viewSettings">,
  styleView: SequenceStyleView,
): { [key: number]: SequenceViewSettings } => {
  const base = tabViewOf(styleView);
  const resolved: { [key: number]: SequenceViewSettings } = {};

  Object.keys(document.content).forEach((key) => {
    const index = Number(key);
    resolved[index] = document.viewSettings?.[index] ?? base;
  });

  return resolved;
};

/**
 * Omple el document amb l'estil que fa servir, perquè el fitxer o el núvol se
 * l'enduguin sencer: «Desa el document» inclou sempre el seu estil. No canvia res
 * del que es veu; només fa explícit el que s'heretava.
 */
export const materializeDocumentStyle = (
  document: DocumentSAAC,
  style: SequenceStyle,
  layout?: DocumentLayout,
): DocumentSAAC => ({
  ...document,
  defaultSettings: pictStyleOf(style),
  styleView: style.view,
  viewSettings: resolveSequenceViews(document, style.view),
  fitzgeraldColors:
    style.fitzgeraldColors ??
    document.fitzgeraldColors ??
    DEFAULT_FITZGERALD_CATEGORY_COLORS,
  ...((document.layout ?? layout) && { layout: document.layout ?? layout }),
});

// --- Comparació ---

/**
 * Igualtat profunda que no depèn de l'ordre de les claus: el mateix estil pot
 * arribar amb les claus en un ordre d'un fitxer i en un altre de Redux.
 */
export const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null ||
    Array.isArray(a) !== Array.isArray(b)
  )
    return false;

  const recordA = a as Record<string, unknown>;
  const recordB = b as Record<string, unknown>;
  const keysA = Object.keys(recordA).filter((k) => recordA[k] !== undefined);
  const keysB = Object.keys(recordB).filter((k) => recordB[k] !== undefined);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => deepEqual(recordA[key], recordB[key]));
};

/**
 * Dos estils són el mateix? L'espai entre seqüències no hi compta: és de la
 * pàgina, no de l'estil (ADR-003, decisió 9), encara que Redux el guardi aquí.
 */
export const stylesEqual = (a: SequenceStyle, b: SequenceStyle): boolean =>
  deepEqual(
    { ...a, view: tabViewOf(a.view) },
    { ...b, view: tabViewOf(b.view) },
  );

// --- Aplicar un estil a un document ---

const VIEW_KEYS = [
  "sizePict",
  "pictSpaceBetween",
  "alignmentH",
  "alignmentV",
] as const;

/**
 * Aplica un estil nou **sobre el document que rep** (el fan servir els reducers,
 * amb Immer). La regla és la dels fonaments:
 *
 * - Els pictogrames no es toquen: només porten els seus retocs, que es
 *   conserven, i la resta l'hereten del nou (solució A del pla dels estils).
 * - La vista d'una pestanya **igual** a la de l'estil vell segueix la nova; la
 *   **diferent** és un retoc i es conserva. Un retoc que casualment era igual a
 *   l'estil vell es tracta com a no retocat: no hi ha manera de distingir-los,
 *   i el desfer cobreix l'error.
 * - L'espai entre seqüències no canvia: és de la pàgina (ADR-003, decisió 9).
 */
export const applyStyleToDocument = (
  document: DocumentSAAC,
  from: SequenceStyle,
  to: SequenceStyle,
): void => {
  Object.keys(document.viewSettings ?? {}).forEach((key) => {
    const view = document.viewSettings[Number(key)];
    VIEW_KEYS.forEach((field) => {
      if (view[field] === from.view[field])
        (view as unknown as Record<string, unknown>)[field] = to.view[field];
    });
  });

  document.defaultSettings = structuredCopy(pictStyleOf(to));
  document.styleView = {
    ...to.view,
    sequenceSpaceBetween: from.view.sequenceSpaceBetween,
  };
  document.fitzgeraldColors = {
    ...(to.fitzgeraldColors ?? DEFAULT_FITZGERALD_CATEGORY_COLORS),
  };
};

// Còpia de dades JSON planes (fonts i vores): `structuredClone` no hi és als
// navegadors més vells que l'app encara suporta
const structuredCopy = <T>(value: T): T =>
  value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);

// --- Fonts ---

/** Totes les famílies de lletra que fa servir un document amb un estil. */
export const fontFamiliesUsed = (
  document: Pick<DocumentSAAC, "content">,
  style: SequenceStyle,
): string[] => {
  const families = new Set<string>();
  const add = (family?: string) => {
    if (family) families.add(family);
  };

  add(style.pictSequence.font.family);
  if (style.pictSequence.numbered) add(style.pictSequence.numberFont?.family);

  Object.values(document.content).forEach((sequence) =>
    sequence.forEach((pict: PictSequence) => {
      add(pict.settings.font?.family);
      if (style.pictSequence.numbered) add(pict.settings.numberFont?.family);
    }),
  );

  return Array.from(families).sort();
};

/**
 * Pila de lletra amb reserva: si el dispositiu no té la font que demana el
 * document (fitxer d'una versió més nova, o sense connexió a Google Fonts), el
 * text surt en una sans-serif del sistema i no en la serif per defecte del
 * navegador, que en CAA es llegeix pitjor.
 */
export const fontStack = (family: string): string =>
  `"${family.replace(/"/g, "")}", sans-serif`;
