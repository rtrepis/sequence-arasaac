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
  emailHelp: {
    id: "pages.forgotPassword.emailHelp",
    defaultMessage: "L'adreça amb què vas crear el compte.",
    description: "Ajuda del camp correu",
  },
  successTitle: {
    id: "pages.forgotPassword.successTitle",
    defaultMessage: "Revisa el teu correu",
    description: "Títol de la pantalla de confirmació",
  },
  changeEmail: {
    id: "pages.forgotPassword.changeEmail",
    defaultMessage: "Prova amb una altra adreça",
    description:
      "Botó per tornar al formulari quan l'adreça escrita pot ser equivocada",
  },
  signupLink: {
    id: "pages.forgotPassword.signupLink",
    defaultMessage: "Encara no tens compte? Crea'n un",
    description: "Enllaç a la pàgina de creació de compte",
  },
  asideTitle: {
    id: "pages.forgotPassword.asideTitle",
    defaultMessage: "Què cal saber",
    description: "Encapçalament de la columna d'ajuda",
  },
  hintInboxTitle: {
    id: "pages.forgotPassword.hintInboxTitle",
    defaultMessage: "Mira també el correu brossa",
    description: "Títol de l'ajuda sobre la safata d'entrada",
  },
  hintInboxText: {
    id: "pages.forgotPassword.hintInboxText",
    defaultMessage:
      "L'enllaç surt de seguida. Si no el veus a la safata d'entrada, sol ser a la carpeta de brossa.",
    description: "Text de l'ajuda sobre la safata d'entrada",
  },
  hintExpiresTitle: {
    id: "pages.forgotPassword.hintExpiresTitle",
    defaultMessage: "L'enllaç dura una hora",
    description: "Títol de l'ajuda sobre la caducitat de l'enllaç",
  },
  hintExpiresText: {
    id: "pages.forgotPassword.hintExpiresText",
    defaultMessage:
      "Passada l'hora deixa de servir i n'has de demanar un altre. És curt a propòsit: obre el teu compte.",
    description: "Text de l'ajuda sobre la caducitat de l'enllaç",
  },
  hintMeanwhileTitle: {
    id: "pages.forgotPassword.hintMeanwhileTitle",
    defaultMessage: "Mentrestant pots treballar",
    description: "Títol de l'ajuda sobre treballar sense sessió",
  },
  hintMeanwhileText: {
    id: "pages.forgotPassword.hintMeanwhileText",
    defaultMessage:
      "L'aplicació funciona sencera sense sessió: només el desat al núvol demana entrar-hi.",
    description: "Text de l'ajuda sobre treballar sense sessió",
  },
  goToApp: {
    id: "pages.forgotPassword.goToApp",
    defaultMessage: "Ves a l'aplicació",
    description: "Botó per tornar a l'aplicació des de la pantalla d'èxit",
  },
});

export default messages;
