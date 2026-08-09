import { defineMessages } from "react-intl";

// Traduccions de l'avís de verificació i de la pàgina de confirmació
const messages = defineMessages({
  bannerPending: {
    id: "features.backend.auth.verification.bannerPending",
    defaultMessage:
      "Verifica el teu correu per poder desar al núvol. T'hem enviat un enllaç a {email}.",
    description: "Avís permanent mentre el correu no està verificat",
  },
  bannerFailed: {
    id: "features.backend.auth.verification.bannerFailed",
    defaultMessage:
      "No hem pogut enviar-te el correu de verificació. Prova de demanar-lo de nou.",
    description: "Avís quan l'enviament del correu de verificació ha fallat",
  },
  resend: {
    id: "features.backend.auth.verification.resend",
    defaultMessage: "Torna a enviar-me'l",
    description: "Botó per demanar un altre correu de verificació",
  },
  resendSuccess: {
    id: "features.backend.auth.verification.resendSuccess",
    defaultMessage: "Correu enviat. Mira la teva safata d'entrada.",
    description: "Confirmació que el correu de verificació s'ha reenviat",
  },
  pageTitle: {
    id: "features.backend.auth.verification.pageTitle",
    defaultMessage: "Verificació del correu",
    description: "Títol de la pàgina que processa l'enllaç de verificació",
  },
  verifying: {
    id: "features.backend.auth.verification.verifying",
    defaultMessage: "Estem verificant la teva adreça…",
    description: "Missatge mentre es processa el token de verificació",
  },
  verified: {
    id: "features.backend.auth.verification.verified",
    defaultMessage:
      "Correu verificat! Ja pots desar les teves seqüències al núvol.",
    description: "Missatge d'èxit després de verificar el correu",
  },
  goToApp: {
    id: "features.backend.auth.verification.goToApp",
    defaultMessage: "Ves a l'aplicació",
    description: "Botó per tornar a l'app després de verificar el correu",
  },
});

export default messages;
