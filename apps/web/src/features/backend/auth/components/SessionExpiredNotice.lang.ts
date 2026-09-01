import { defineMessages } from "react-intl";

const messages = defineMessages({
  titleExpired: {
    id: "features.backend.auth.sessionExpired.titleExpired",
    defaultMessage: "La sessió ha caducat",
    description: "Títol de l'avís quan la sessió ha caducat pel pas del temps",
  },
  titleMissing: {
    id: "features.backend.auth.sessionExpired.titleMissing",
    defaultMessage: "La sessió s'ha tancat en aquest navegador",
    description: "Títol de l'avís quan ja no hi ha la galeta de sessió",
  },
  titleInvalid: {
    id: "features.backend.auth.sessionExpired.titleInvalid",
    defaultMessage: "La sessió s'ha tancat des d'un altre dispositiu",
    description:
      "Títol de l'avís quan la sessió s'ha invalidat des d'un altre lloc",
  },
  titleSuspended: {
    id: "features.backend.auth.sessionExpired.titleSuspended",
    defaultMessage: "Aquest compte està suspès",
    description: "Títol de l'avís quan el compte ha estat suspès",
  },
  titleGone: {
    id: "features.backend.auth.sessionExpired.titleGone",
    defaultMessage: "Aquest compte ja no existeix",
    description: "Títol de l'avís quan el compte no es troba",
  },
  bodyCanReturn: {
    id: "features.backend.auth.sessionExpired.bodyCanReturn",
    defaultMessage:
      "La feina no s'ha perdut: continua desada en aquest dispositiu. Per desar-la al núvol, torna a entrar.",
    description:
      "Cos de l'avís de sessió caiguda quan es pot tornar a iniciar sessió",
  },
  bodyNoReturn: {
    id: "features.backend.auth.sessionExpired.bodyNoReturn",
    defaultMessage:
      "La feina no s'ha perdut: continua desada en aquest dispositiu. Descarrega-la si en vols una còpia, i contacta amb nosaltres si creus que és un error.",
    description:
      "Cos de l'avís de sessió caiguda quan tornar a entrar no serviria de res",
  },
  action: {
    id: "features.backend.auth.sessionExpired.action",
    defaultMessage: "Torna a entrar",
    description: "Botó de l'avís que obre el formulari d'inici de sessió",
  },
  dismiss: {
    id: "features.backend.auth.sessionExpired.dismiss",
    defaultMessage: "Tanca l'avís",
    description: "Botó per tancar l'avís de sessió caiguda",
  },
});

export default messages;
