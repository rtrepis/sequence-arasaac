import { defineMessages } from "react-intl";

const messages = defineMessages({
  panelHint: {
    id: "components.defaultSettings.userPanel.panelHint",
    defaultMessage:
      "Settings for your account: languages, theme and images. They apply everywhere.",
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
  sectionImages: {
    id: "components.defaultSettings.userPanel.sectionImages",
    defaultMessage: "Images",
    description: "Títol de la secció d'imatges al panel d'usuari",
  },
  sectionStorage: {
    id: "components.defaultSettings.userPanel.sectionStorage",
    defaultMessage: "Your account space",
    description: "Títol de la secció de consum del compte al panel d'usuari",
  },
  saveSuccess: {
    id: "components.defaultSettings.userPanel.saveSuccess",
    defaultMessage: "User settings saved",
    description: "Snackbar quan els settings d'usuari s'han desat correctament",
  },
});

export default messages;
