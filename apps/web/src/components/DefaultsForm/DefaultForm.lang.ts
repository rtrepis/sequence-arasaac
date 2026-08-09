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
  saveSuccess: {
    id: "components.defaultSettings.saveSuccess",
    defaultMessage: "Settings saved to server",
    description: "Snackbar quan els settings s'han desat correctament al servidor",
  },
  saveError: {
    id: "components.defaultSettings.saveError",
    defaultMessage: "Error saving settings to server",
    description: "Snackbar quan hi ha error en desar els settings al servidor",
  },
  reset: {
    id: "components.defaultSettings.reset",
    defaultMessage: "Reset",
    description: "Botó per restablir els valors de fàbrica de la configuració de pictogrames",
  },
  tooltipReset: {
    id: "components.defaultSettings.tooltipReset",
    defaultMessage: "Reset to application defaults",
    description: "Tooltip del botó Reset de pictogrames",
  },
});

export default messages;
