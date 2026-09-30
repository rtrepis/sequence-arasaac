import { defineMessages } from "react-intl";

const messages = defineMessages({
  dialogTitle: {
    id: "components.buttonWithModalDownload.dialogTitle",
    defaultMessage: "Save and download",
    description: "Títol del diàleg de descàrrega del fitxer .saac",
  },
  saveDocument: {
    id: "components.buttonWithModalDownload.saveDocument",
    defaultMessage: "Desa el document",
    description:
      "Botó que desa el document (totes les seqüències) amb el seu estil en un fitxer .saac",
  },
  saveStyle: {
    id: "components.buttonWithModalDownload.saveStyle",
    defaultMessage: "Desa l'estil",
    description:
      "Botó del diàleg de desar l'estil: desa només l'estil del document en un fitxer .saacstyle",
  },
  styleDialogTitle: {
    id: "components.buttonWithModalDownload.styleDialogTitle",
    defaultMessage: "Desa l'estil en un fitxer",
    description: "Títol del diàleg per desar només l'estil del document",
  },
  styleHelper: {
    id: "components.buttonWithModalDownload.styleHelper",
    defaultMessage:
      "Només l'aparença del document —fonts, colors, vores, mides i espais—, sense cap seqüència. Es pot aplicar a altres documents.",
    description: "Explicació del diàleg per desar només l'estil",
  },
  save: {
    id: "components.buttonWithModalDownload.save.title",
    defaultMessage: "Save",
    description: "Modal tittle",
  },
  saveHelper: {
    id: "components.buttonWithModalDownload.saveHelper.label",
    defaultMessage:
      "Desa totes les seqüències del document amb el seu estil. Quan l'obris, es veurà tal com ara.",
    description: "Helper save modal",
  },
  whatIsSavedTitle: {
    id: "components.buttonWithModalDownload.whatIsSaved.title",
    defaultMessage: "Què es guarda en un document?",
    description: "Títol del quadre d'ajuda del diàleg de desar el document",
  },
  whatIsSavedSequences: {
    id: "components.buttonWithModalDownload.whatIsSaved.sequences",
    defaultMessage: "Les seqüències i els pictogrames.",
    description: "Quadre «Què es guarda»: primer element de la llista",
  },
  whatIsSavedStyle: {
    id: "components.buttonWithModalDownload.whatIsSaved.style",
    defaultMessage:
      "Com es veuen (lletra, vores, colors, mides), inclosos els canvis fets en un sol pictograma.",
    description: "Quadre «Què es guarda»: l'estil, també el de cada pictograma",
  },
  whatIsSavedPage: {
    id: "components.buttonWithModalDownload.whatIsSaved.page",
    defaultMessage: "La pàgina: mida, orientació i direcció.",
    description: "Quadre «Què es guarda»: la pàgina del document",
  },
  whatIsSavedImages: {
    id: "components.buttonWithModalDownload.whatIsSaved.images",
    defaultMessage: "Les fotos pròpies.",
    description: "Quadre «Què es guarda»: les imatges pujades per l'usuari",
  },
  whatIsNotSaved: {
    id: "components.buttonWithModalDownload.whatIsSaved.not",
    defaultMessage:
      "No es guarden les preferències de l'app, com l'idioma o l'estil per defecte.",
    description: "Quadre «Què es guarda»: el que no hi va",
  },
  filename: {
    id: "components.buttonWithModalDownload.filename.label",
    defaultMessage: "File name",
    description: "Type save checkbox",
  },
});

export default messages;
