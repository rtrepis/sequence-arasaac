import { defineMessages } from "react-intl";

// Traduccions del camp de contrasenya amb ull
const messages = defineMessages({
  show: {
    id: "components.passwordField.show",
    defaultMessage: "Mostra la contrasenya",
    description: "Nom accessible del botó que destapa la contrasenya",
  },
  hide: {
    id: "components.passwordField.hide",
    defaultMessage: "Amaga la contrasenya",
    description: "Nom accessible del botó que torna a tapar la contrasenya",
  },
});

export default messages;
