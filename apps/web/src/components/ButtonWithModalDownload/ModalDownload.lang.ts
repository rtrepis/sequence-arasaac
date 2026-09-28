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
  filename: {
    id: "components.buttonWithModalDownload.filename.label",
    defaultMessage: "File name",
    description: "Type save checkbox",
  },
});

export default messages;
