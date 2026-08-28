import { defineMessages } from "react-intl";

const messages = defineMessages({
  panelHint: {
    id: "components.defaultSettings.panelHint",
    defaultMessage:
      "Set how new pictograms will look. To apply the changes to the ones already in the sequence, use «Apply to all».",
    description: "Guia del tab de pictogrames del modal de configuracions",
  },
  pictGuide: {
    id: "components.defaultSettings.pictGuide",
    defaultMessage: "Preview",
    description: "Paraula del pictograma de mostra dels settings per defecte",
  },
  sectionPictogram: {
    id: "components.defaultSettings.sectionPictogram",
    defaultMessage: "Pictogram",
    description: "Títol de la secció de numeració i color al panell de pictogrames",
  },
  sectionText: {
    id: "components.defaultSettings.sectionText",
    defaultMessage: "Text and numbering",
    description: "Títol de la secció de posició de text i tipografies al panell de pictogrames",
  },
  sectionAppearance: {
    id: "components.defaultSettings.sectionAppearance",
    defaultMessage: "Appearance",
    description: "Títol de la secció de pell i cabell al panell de pictogrames",
  },
  reset: {
    id: "components.defaultSettings.reset",
    defaultMessage: "Restore pictograms",
    description: "Botó per restablir els valors de fàbrica de la configuració de pictogrames",
  },
  tooltipReset: {
    id: "components.defaultSettings.tooltipReset",
    defaultMessage: "Return pictogram settings to factory values",
    description: "Tooltip del botó de restaurar la configuració de pictogrames",
  },
});

export default messages;
