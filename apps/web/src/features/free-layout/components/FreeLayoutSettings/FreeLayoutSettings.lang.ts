import { defineMessages } from "react-intl";

const messages = defineMessages({
  section: {
    id: "features.freeLayout.settings.section",
    defaultMessage: "Layout",
    description:
      "Títol de la secció de la columna de la vista on es tria com es col·loquen les seqüències a la pàgina",
  },
  layout: {
    id: "features.freeLayout.settings.layout",
    defaultMessage: "Layout",
    description: "Títol de la fila: disposició automàtica o lliure",
  },
  layoutFlow: {
    id: "features.freeLayout.settings.layoutFlow",
    defaultMessage: "Automatic: the sequences arrange themselves on one page",
    description:
      "Nom accessible i tooltip de l'opció de disposició automàtica, la de sempre",
  },
  layoutFree: {
    id: "features.freeLayout.settings.layoutFree",
    defaultMessage: "Free: you choose which page each sequence goes on",
    description:
      "Nom accessible i tooltip de l'opció de disposició lliure, amb pàgines",
  },
  freeOn: {
    id: "features.freeLayout.settings.freeOn",
    defaultMessage:
      "Free layout. Add pages, choose a template or add sequences to each page.",
    description: "Confirmació d'haver passat a la disposició lliure",
  },
  paperChanged: {
    id: "features.freeLayout.settings.paperChanged",
    defaultMessage: "Free layout needs paper: the page is now {paper}.",
    description:
      "Confirmació d'haver passat a disposició lliure des de pantalla completa: la pàgina passa a un paper",
  },
  unplaced: {
    id: "features.freeLayout.settings.unplaced",
    defaultMessage: "Not on any page",
    description:
      "Títol de la fila amb les seqüències del document que no surten a cap pàgina",
  },
  unplacedNone: {
    id: "features.freeLayout.settings.unplacedNone",
    defaultMessage: "All sequences are on some page",
    description: "Quan no hi ha cap seqüència sense col·locar",
  },
  unplacedHint: {
    id: "features.freeLayout.settings.unplacedHint",
    defaultMessage:
      "The ones on this list are not printed: add them with “Add a sequence” on each page.",
    description: "Explicació sota la llista de seqüències sense col·locar",
  },
  sizeFromBox: {
    id: "features.freeLayout.settings.sizeFromBox",
    defaultMessage: "In free layout, the box decides the size.",
    description:
      "Al lloc del control de mida de la seqüència, en disposició lliure: la mida dels pictogrames surt de la caixa",
  },
});

export default messages;
