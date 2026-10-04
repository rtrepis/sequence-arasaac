import { DocumentSAAC } from "@sequence-arasaac/shared-types";
import { PictSequence, Sequence } from "@/types/sequence";

/**
 * Un pictograma de la seqüència, amb el mínim per pintar-se i els retocs que
 * demani el cas. Els tests no escriuen l'objecte sencer: així, quan
 * `PictSequence` creixi, només canvia aquest fitxer.
 */
export const pictogramFixture = (
  overrides: Partial<PictSequence> = {},
): PictSequence => ({
  indexSequence: 0,
  cross: false,
  text: "breakfast",
  img: {
    searched: { word: "breakfast", bestIdPicts: [26527] },
    selectedId: 26527,
    settings: {},
  },
  settings: { numbered: true, textPosition: "bottom" },
  ...overrides,
});

/** Una seqüència de `length` pictogrames, numerats de 0 endavant. */
export const sequenceFixture = (length: number): Sequence =>
  Array.from({ length }, (_, index) =>
    pictogramFixture({
      indexSequence: index,
      text: `pictogram ${index + 1}`,
      img: {
        searched: { word: `pictogram ${index + 1}`, bestIdPicts: [26527] },
        selectedId: 26527 + index,
        settings: {},
      },
    }),
  );

/**
 * L'estat del document amb una seqüència a la pestanya activa.
 *
 * Sense estil propi (`defaultSettings: undefined`): un document nou hereta
 * l'estil per defecte de l'usuari — vegeu
 * `docs/fonaments/03-model-contingut-estil.md`.
 */
export const documentStateFixture = (
  sequence: Sequence = sequenceFixture(1),
): DocumentSAAC => ({
  id: "test-document",
  title: undefined,
  content: { 0: sequence },
  viewSettings: {},
  activeSAAC: 0,
  order: undefined,
  defaultSettings: undefined,
});
