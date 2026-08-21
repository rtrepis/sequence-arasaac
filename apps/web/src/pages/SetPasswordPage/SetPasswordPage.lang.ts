import { defineMessages } from "react-intl";

// Traduccions de la pàgina d'establiment de contrasenya (verificació inicial i recuperació)
const messages = defineMessages({
  pageTitle: {
    id: "pages.setPassword.pageTitle",
    defaultMessage: "Tria la teva contrasenya",
    description: "Títol de la pàgina d'establiment de contrasenya",
  },
  hint: {
    id: "pages.setPassword.hint",
    defaultMessage:
      "Aquesta contrasenya és la que faràs servir per entrar al teu compte a partir d'ara. Tria'n una que no facis servir enlloc més.",
    description: "Guia inicial de la pàgina d'establiment de contrasenya",
  },
  password: {
    id: "pages.setPassword.password",
    defaultMessage: "Contrasenya",
    description: "Etiqueta del camp contrasenya",
  },
  passwordConfirmation: {
    id: "pages.setPassword.passwordConfirmation",
    defaultMessage: "Repeteix la contrasenya",
    description: "Etiqueta del camp de repetició de la contrasenya",
  },
  mismatch: {
    id: "pages.setPassword.mismatch",
    defaultMessage: "Les contrasenyes no coincideixen",
    description:
      "Error de validació quan les dues contrasenyes no coincideixen",
  },
  submit: {
    id: "pages.setPassword.submit",
    defaultMessage: "Estableix la contrasenya",
    description: "Botó per enviar el formulari d'establiment de contrasenya",
  },
  missingToken: {
    id: "pages.setPassword.missingToken",
    defaultMessage: "Aquest enllaç està incomplet.",
    description: "Error quan l'enllaç no porta cap token",
  },
  forgotPasswordLink: {
    id: "pages.setPassword.forgotPasswordLink",
    defaultMessage: "He oblidat la contrasenya",
    description: "Enllaç a la pàgina de recuperació de contrasenya",
  },
});

export default messages;
