import { defineMessages } from "react-intl";

const messages = defineMessages({
  panelHint: {
    id: "components.defaultSettings.userPanel.panelHint",
    defaultMessage:
      "Settings for your account: app language, search language and theme. They apply everywhere.",
    description: "Guia del tab d'usuari del modal de configuracions",
  },
  sectionLanguage: {
    id: "components.defaultSettings.userPanel.sectionTitle",
    defaultMessage: "Language",
    description: "Títol de la secció d'idiomes al panel d'usuari",
  },
  sectionAppearance: {
    id: "components.defaultSettings.userPanel.sectionAppearance",
    defaultMessage: "Appearance",
    description: "Títol de la secció d'aparença al panel d'usuari",
  },
  saveSuccess: {
    id: "components.defaultSettings.userPanel.saveSuccess",
    defaultMessage: "User settings saved",
    description: "Snackbar quan els settings d'usuari s'han desat correctament",
  },
  saveError: {
    id: "components.defaultSettings.userPanel.saveError",
    defaultMessage: "Error saving user settings",
    description: "Snackbar quan hi ha error en desar els settings d'usuari",
  },
});

export default messages;
