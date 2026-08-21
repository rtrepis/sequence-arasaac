import { defineMessages } from "react-intl";

// Traduccions de la pàgina de creació de compte
const messages = defineMessages({
  pageTitle: {
    id: "pages.signup.pageTitle",
    defaultMessage: "Crea el teu compte",
    description: "Títol de la pàgina de signup",
  },
  hint: {
    id: "pages.signup.hint",
    defaultMessage:
      "Amb un compte pots desar les teves seqüències al núvol i recuperar-les des de qualsevol dispositiu. T'enviarem un correu per confirmar l'adreça i triar la contrasenya — encara no cal que en posis cap aquí.",
    description: "Guia inicial de la pàgina de signup",
  },
  name: {
    id: "pages.signup.name",
    defaultMessage: "Nom",
    description: "Etiqueta del camp nom",
  },
  useCase: {
    id: "pages.signup.useCase",
    defaultMessage: "Com faràs servir l'aplicació?",
    description: "Etiqueta del selector d'ús de l'aplicació",
  },
  useCaseFamily: {
    id: "pages.signup.useCaseFamily",
    defaultMessage: "En família",
    description: "Opció d'ús de l'aplicació: família",
  },
  useCaseTeacher: {
    id: "pages.signup.useCaseTeacher",
    defaultMessage: "Com a docent",
    description: "Opció d'ús de l'aplicació: docent",
  },
  useCaseProfessional: {
    id: "pages.signup.useCaseProfessional",
    defaultMessage: "Com a professional (logopeda, terapeuta...)",
    description: "Opció d'ús de l'aplicació: professional",
  },
  useCaseOther: {
    id: "pages.signup.useCaseOther",
    defaultMessage: "Altres",
    description: "Opció d'ús de l'aplicació: altres",
  },
  useCaseOtherLabel: {
    id: "pages.signup.useCaseOtherLabel",
    defaultMessage: "Explica'ns breument com la faràs servir (opcional)",
    description: 'Etiqueta del camp de text lliure quan l\'ús és "altres"',
  },
  email: {
    id: "pages.signup.email",
    defaultMessage: "Correu electrònic",
    description: "Etiqueta del camp correu",
  },
  submit: {
    id: "pages.signup.submit",
    defaultMessage: "Crea el compte",
    description: "Botó per enviar el formulari de signup",
  },
  loginLink: {
    id: "pages.signup.loginLink",
    defaultMessage: "Ja tens compte? Inicia sessió",
    description: "Enllaç per tornar a l'aplicació i obrir el login",
  },
  successTitle: {
    id: "pages.signup.successTitle",
    defaultMessage: "Revisa el teu correu",
    description: "Títol de la pantalla d'èxit després del signup",
  },
  success: {
    id: "pages.signup.success",
    defaultMessage:
      "T'hem enviat un correu a {email} amb un enllaç per confirmar l'adreça i triar la contrasenya. Si no el veus a la safata d'entrada, mira també a spam.",
    description: "Missatge d'èxit després del signup",
  },
  goToApp: {
    id: "pages.signup.goToApp",
    defaultMessage: "Ves a l'aplicació",
    description: "Botó per tornar a l'aplicació des de la pantalla d'èxit",
  },
});

export default messages;
