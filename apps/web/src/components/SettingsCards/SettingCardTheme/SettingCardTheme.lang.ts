import { defineMessages } from "react-intl";

const messages = defineMessages({
  cardTitle: {
    id: "components.settingCardTheme.title",
    defaultMessage: "Theme",
    description: "Títol de la card de selecció de tema",
  },
  ariaLabel: {
    id: "components.settingCardTheme.ariaLabel",
    defaultMessage: "Select theme",
    description: "Aria label del ToggleButtonGroup de tema",
  },
  light: {
    id: "components.settingCardTheme.light",
    defaultMessage: "Light",
    description: "Opció de tema clar",
  },
  dark: {
    id: "components.settingCardTheme.dark",
    defaultMessage: "Dark",
    description: "Opció de tema fosc",
  },
  system: {
    id: "components.settingCardTheme.system",
    defaultMessage: "System",
    description: "Opció de tema del sistema",
  },
});

export default messages;
