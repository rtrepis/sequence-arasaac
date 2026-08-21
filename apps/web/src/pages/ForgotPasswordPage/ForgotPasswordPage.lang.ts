import { defineMessages } from "react-intl";

// Traduccions de la pàgina de recuperació de contrasenya
const messages = defineMessages({
  pageTitle: {
    id: "pages.forgotPassword.pageTitle",
    defaultMessage: "Recupera la contrasenya",
    description: "Títol de la pàgina de recuperació de contrasenya",
  },
  hint: {
    id: "pages.forgotPassword.hint",
    defaultMessage:
      "Escriu el correu del teu compte i t'enviarem un enllaç per triar una contrasenya nova.",
    description: "Guia inicial de la pàgina de recuperació de contrasenya",
  },
  email: {
    id: "pages.forgotPassword.email",
    defaultMessage: "Correu electrònic",
    description: "Etiqueta del camp correu",
  },
  submit: {
    id: "pages.forgotPassword.submit",
    defaultMessage: "Envia l'enllaç",
    description: "Botó per demanar l'enllaç de recuperació",
  },
  success: {
    id: "pages.forgotPassword.success",
    defaultMessage:
      "Si {email} té un compte, hi hem enviat un enllaç per triar una contrasenya nova. Revisa també la carpeta de spam.",
    description:
      "Missatge sempre igual, existeixi o no el compte, per no revelar quins correus estan registrats",
  },
  goToApp: {
    id: "pages.forgotPassword.goToApp",
    defaultMessage: "Ves a l'aplicació",
    description: "Botó per tornar a l'aplicació des de la pantalla d'èxit",
  },
});

export default messages;
