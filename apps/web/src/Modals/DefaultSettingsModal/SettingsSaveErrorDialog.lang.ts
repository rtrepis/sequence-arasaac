import { defineMessages } from "react-intl";

// Traduccions del diàleg que explica que la configuració no s'ha pogut desar
const messages = defineMessages({
  title: {
    id: "components.defaultSettings.saveError.title",
    defaultMessage: "No hem pogut desar la configuració",
    description: "Títol del diàleg d'error en desar la configuració",
  },
  bodyCloud: {
    id: "components.defaultSettings.saveError.bodyCloud",
    defaultMessage:
      "Els canvis es veuen a la pantalla, però no s'han desat al teu compte: si tanques l'aplicació ara, els perdràs. Sovint és perquè el servidor s'estava despertant i ha trigat massa a respondre.",
    description: "Explicació de l'error per a un usuari amb sessió iniciada",
  },
  bodyLocal: {
    id: "components.defaultSettings.saveError.bodyLocal",
    defaultMessage:
      "Els canvis es veuen a la pantalla, però no s'han pogut desar en aquest navegador: si tanques l'aplicació ara, els perdràs.",
    description: "Explicació de l'error per a un usuari sense sessió iniciada",
  },
  retry: {
    id: "components.defaultSettings.saveError.retry",
    defaultMessage: "Torna-ho a provar",
    description: "Botó per reintentar el desat de la configuració",
  },
  dismiss: {
    id: "components.defaultSettings.saveError.dismiss",
    defaultMessage: "Ara no",
    description: "Botó per tancar el diàleg sense reintentar el desat",
  },
});

export default messages;
