import { defineMessages } from "react-intl";

// Traduccions de l'avís de verificació i de la pàgina de confirmació
const messages = defineMessages({
  bannerPending: {
    id: "features.backend.auth.verification.bannerPending",
    defaultMessage:
      "Verifica el teu correu per poder desar al núvol. T'hem enviat un enllaç a {email}.",
    description: "Avís permanent mentre el correu no està verificat",
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
});

export default messages;
