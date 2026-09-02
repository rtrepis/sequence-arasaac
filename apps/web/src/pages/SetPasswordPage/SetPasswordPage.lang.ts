import { defineMessages } from "react-intl";

// Traduccions de la pàgina d'establiment de contrasenya (verificació inicial i recuperació)
const messages = defineMessages({
  pageTitle: {
    id: "pages.setPassword.pageTitle",
    defaultMessage: "Tria la teva contrasenya",
    description: "Títol de la pàgina d'establiment de contrasenya",
  },
  pageTitleReset: {
    id: "pages.setPassword.pageTitleReset",
    defaultMessage: "Tria una contrasenya nova",
    description:
      "Títol quan el compte ja té contrasenya i la nova en substitueix una d'existent",
  },
  greeting: {
    id: "pages.setPassword.greeting",
    defaultMessage: "Hola, {name}!",
    description: "Salutació amb el nom del compte de l'enllaç",
  },
  hintFirst: {
    id: "pages.setPassword.hintFirst",
    defaultMessage:
      "És la primera contrasenya d'aquest compte: a partir d'ara serà la que faràs servir per entrar-hi. Tria'n una que no facis servir enlloc més.",
    description: "Guia quan el compte encara no té contrasenya",
  },
  hintReplace: {
    id: "pages.setPassword.hintReplace",
    defaultMessage:
      "La contrasenya nova substituirà la que hi tens ara i tancarà les sessions obertes en altres dispositius. Tria'n una que no facis servir enlloc més.",
    description: "Guia quan el compte ja té contrasenya",
  },
  checkingTitle: {
    id: "pages.setPassword.checkingTitle",
    defaultMessage: "Comprovant l'enllaç",
    description: "Títol mentre es comprova de quin compte és l'enllaç",
  },
  checking: {
    id: "pages.setPassword.checking",
    defaultMessage: "Mirem de quin compte és aquest enllaç…",
    description: "Missatge d'espera mentre es comprova l'enllaç",
  },
  invalidLinkTitle: {
    id: "pages.setPassword.invalidLinkTitle",
    defaultMessage: "Aquest enllaç no serveix",
    description: "Títol de la pantalla d'enllaç incomplet o caducat",
  },
  notYou: {
    id: "pages.setPassword.notYou",
    defaultMessage:
      "No has demanat cap contrasenya? Tanca aquesta pàgina sense fer res: l'enllaç caduca sol i el compte no es toca.",
    description: "Avís per a qui rep un enllaç que no ha demanat",
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
