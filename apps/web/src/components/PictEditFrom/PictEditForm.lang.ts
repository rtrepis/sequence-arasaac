import { defineMessages } from "react-intl";

const messages = defineMessages({
  title: {
    id: "components.pictEditSettings.settings.label",
    defaultMessage: "Settings Pictogram",
    description: "Title section Pictogram Edit ",
  },
  reset: {
    id: "components.pictEdit.reset",
    defaultMessage: "Restableix",
    description:
      "Botó que esborra els retocs d'aquest pictograma: torna a l'estil del document (es pot desfer)",
  },
  tooltipReset: {
    id: "components.pictEdit.tooltipReset",
    defaultMessage:
      "Torna aquest pictograma a l'estil del document. Es pot desfer.",
    description: "Tooltip del botó «Restableix» del pictograma",
  },
  customized: {
    id: "components.pictEdit.customized",
    defaultMessage: "Pictograma personalitzat",
    description:
      "Indicador: el pictograma té retocs propis, diferents de l'estil del document",
  },
});

export default messages;
