import { defineMessages } from "react-intl";

const messages = defineMessages({
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
    defaultMessage: "Personalitzat",
    description:
      "Estat a la capçalera de la configuració: el pictograma té retocs propis, diferents de l'estil del document",
  },
  settings: {
    id: "components.pictEdit.settings",
    defaultMessage: "Configuració",
    description:
      "Nom accessible del botó que obre i tanca la configuració del pictograma",
  },
  settingsCustomized: {
    id: "components.pictEdit.settingsCustomized",
    defaultMessage: "Configuració, personalitzat",
    description:
      "Nom accessible del botó de la configuració quan el pictograma té retocs propis",
  },
  resetDone: {
    id: "components.pictEdit.resetDone",
    defaultMessage: "Estil restablert",
    description:
      "Snackbar després de «Restableix» un pictograma: se n'han tret els retocs (es pot desfer)",
  },
  undo: {
    id: "components.pictEdit.undo",
    defaultMessage: "Desfés",
    description: "Botó del snackbar que desfà «Restableix» dins del formulari",
  },
});

export default messages;
