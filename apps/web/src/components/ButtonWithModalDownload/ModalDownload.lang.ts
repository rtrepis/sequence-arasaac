import { defineMessages } from "react-intl";

const messages = defineMessages({
  dialogTitle: {
    id: "components.buttonWithModalDownload.dialogTitle",
    defaultMessage: "Save and download",
    description: "Títol del diàleg de descàrrega del fitxer .saac",
  },
  saveSequence: {
    id: "components.buttonWithModalDownload.saveSequence",
    defaultMessage: "Desa la seqüència",
    description:
      "Botó que desa la seqüència amb el seu estil en un fitxer .saac",
  },
  saveStyle: {
    id: "components.buttonWithModalDownload.saveStyle",
    defaultMessage: "Desa l'estil",
    description:
      "Botó que desa només l'estil de la seqüència en un fitxer .saacstyle",
  },
  save: {
    id: "components.buttonWithModalDownload.save.title",
    defaultMessage: "Save",
    description: "Modal tittle",
  },
  saveHelper: {
    id: "components.buttonWithModalDownload.saveHelper.label",
    defaultMessage:
      "Desa la seqüència amb el seu estil, o només l'estil per fer-lo servir en altres seqüències.",
    description: "Helper save modal",
  },
  filename: {
    id: "components.buttonWithModalDownload.filename.label",
    defaultMessage: "File name",
    description: "Type save checkbox",
  },
});

export default messages;
