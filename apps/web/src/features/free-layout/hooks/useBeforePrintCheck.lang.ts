import { defineMessages } from "react-intl";

const messages = defineMessages({
  title: {
    id: "features.freeLayout.beforePrint.title",
    defaultMessage: "Before printing",
    description:
      "Títol de l'avís que surt abans d'imprimir o descarregar el PDF en mode lliure, si hi ha alguna cosa que potser no s'esperava",
  },
  unplaced: {
    id: "features.freeLayout.beforePrint.unplaced",
    defaultMessage:
      "{count, plural, one {# sequence is not on any page and will not be printed.} other {# sequences are not on any page and will not be printed.}}",
    description:
      "Avís abans d'imprimir: quantes seqüències no surten a cap pàgina",
  },
  emptyPages: {
    id: "features.freeLayout.beforePrint.emptyPages",
    defaultMessage:
      "{count, plural, one {Page {pages} is empty.} other {Pages {pages} are empty.}}",
    description:
      "Avís abans d'imprimir: quines pàgines no tenen res; sortiran en blanc",
  },
  cancel: {
    id: "features.freeLayout.beforePrint.cancel",
    defaultMessage: "Cancel",
    description: "Tanca l'avís sense imprimir, per arreglar-ho abans",
  },
  printAnyway: {
    id: "features.freeLayout.beforePrint.printAnyway",
    defaultMessage: "Print anyway",
    description: "Imprimeix tal com està, malgrat l'avís",
  },
  downloadAnyway: {
    id: "features.freeLayout.beforePrint.downloadAnyway",
    defaultMessage: "Download anyway",
    description: "Descarrega el PDF tal com està, malgrat l'avís",
  },
});

export default messages;
