import { defineMessages } from "react-intl";

const messages = defineMessages({
  title: {
    id: "components.pictEditSettings.settings.label",
    defaultMessage: "Settings Pictogram",
    description: "Title section Pictogram Edit ",
  },
  reset: {
    id: "components.pictEdit.reset",
    defaultMessage: "Restore pictogram",
    description:
      "Botó que torna aquest pictograma als valors per defecte de l'usuari",
  },
  tooltipReset: {
    id: "components.pictEdit.tooltipReset",
    defaultMessage: "Return this pictogram to your default values",
    description: "Tooltip del botó de restaurar el pictograma",
  },
});

export default messages;
