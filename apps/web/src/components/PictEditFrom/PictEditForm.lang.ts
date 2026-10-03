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
  styleSection: {
    id: "components.pictEdit.styleSection",
    defaultMessage: "Estil del pictograma",
    description:
      "Capçalera de la configuració del pictograma: diu què s'obre en desplegar-la",
  },
  styleSectionSubtitle: {
    id: "components.pictEdit.styleSectionSubtitle",
    defaultMessage: "Personalització",
    description:
      "Segona línia de la capçalera de la configuració del pictograma: el que s'hi fa és personalitzar-lo respecte de l'estil del document",
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
