import { defineMessages } from "react-intl";

const messages = defineMessages({
  title: {
    id: "features.freeLayout.addSequence.title",
    defaultMessage: "Add sequences to page {number}",
    description:
      "Títol del diàleg per posar seqüències del document en una pàgina del mode lliure",
  },
  hint: {
    id: "features.freeLayout.addSequence.hint",
    defaultMessage:
      "A sequence can be on more than one page. Adding it here does not remove it from where it already is.",
    description:
      "Explicació a dalt del diàleg per afegir seqüències a una pàgina",
  },
  pictograms: {
    id: "features.freeLayout.addSequence.pictograms",
    defaultMessage: "{count, plural, one {# pictogram} other {# pictograms}}",
    description: "Quants pictogrames té una seqüència, a la llista del diàleg",
  },
  unplaced: {
    id: "features.freeLayout.addSequence.unplaced",
    defaultMessage: "not on any page",
    description: "Al diàleg, una seqüència que encara no surt a cap pàgina",
  },
  onPages: {
    id: "features.freeLayout.addSequence.onPages",
    defaultMessage:
      "{count, plural, one {on page {pages}} other {on pages {pages}}}",
    description:
      "Al diàleg, les pàgines on ja surt una seqüència: «a les pàgines 1 i 3»",
  },
  onEveryPage: {
    id: "features.freeLayout.addSequence.onEveryPage",
    defaultMessage: "on every page",
    description: "Al diàleg, una seqüència que ja surt a totes les pàgines",
  },
  nothingChosen: {
    id: "features.freeLayout.addSequence.nothingChosen",
    defaultMessage: "Choose at least one sequence.",
    description:
      "Avís del diàleg quan es prem «Afegeix» sense haver triat cap seqüència",
  },
  cancel: {
    id: "features.freeLayout.addSequence.cancel",
    defaultMessage: "Cancel",
    description: "Botó per tancar el diàleg sense afegir res",
  },
  add: {
    id: "features.freeLayout.addSequence.add",
    defaultMessage: "Add",
    description:
      "Botó principal del diàleg: posa les seqüències triades a la pàgina",
  },
});

export default messages;
