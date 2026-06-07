import { defineMessages } from "react-intl";

const messages = defineMessages({
  pictGuide: {
    id: "components.defaultSettings.pictGuide",
    defaultMessage: "Pictogram guide",
    description: "Pictogram pictogram for default settings",
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
