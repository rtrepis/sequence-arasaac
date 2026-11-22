import { defineMessages } from "react-intl";

// Textos del «+» de la barra de baix de l'edició al mòbil (pla dels estils, pas 8)
const messages = defineMessages({
  add: {
    id: "features.sequence.bottomBar.add",
    defaultMessage: "Afegeix",
    description:
      "Nom accessible i tooltip del botó «+» de la barra de baix de l'edició al mòbil: obre el menú per afegir un pictograma o una seqüència",
  },
  addPictogram: {
    id: "features.sequence.bottomBar.addPictogram",
    defaultMessage: "Afegeix un pictograma",
    description:
      "Opció del menú «+»: afegeix una targeta buida al final de la seqüència oberta",
  },
  pictogramAdded: {
    id: "features.sequence.bottomBar.pictogramAdded",
    defaultMessage: "S'ha afegit un pictograma buit al final.",
    description: "Confirmació d'«Afegeix un pictograma» del menú «+»",
  },
  full: {
    id: "features.sequence.bottomBar.full",
    defaultMessage: "Una seqüència pot tenir {max} pictogrames com a molt.",
    description:
      "Avís d'«Afegeix un pictograma» quan la seqüència ja té el màxim de pictogrames",
  },
});

export default messages;
