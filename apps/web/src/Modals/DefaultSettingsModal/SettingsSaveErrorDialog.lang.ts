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
      "Els canvis es veuen a la pantalla, però no s'han desat al teu compte: si tanques l'aplicació ara, els perdràs.",
    description: "Explicació de l'error per a un usuari amb sessió iniciada",
  },
  bodyStorageFull: {
    id: "components.defaultSettings.saveError.bodyStorageFull",
    defaultMessage:
      "Aquest navegador s'ha quedat sense espai. Les paraules del teu vocabulari amb imatge pròpia són el que més ocupa: esborra'n alguna que ja no facis servir, o crea un compte per desar-ho tot en línia.",
    description:
      "Explicació quan l'emmagatzematge del navegador està ple (QuotaExceededError)",
  },
  bodyQuota: {
    id: "components.defaultSettings.saveError.bodyQuota",
    defaultMessage:
      "El teu compte s'ha quedat sense espai per a imatges, i per això la configuració no s'ha desat. A Configuració › Usuari veuràs què ocupa cada imatge del vocabulari i en podràs esborrar alguna.",
    description: "Explicació quan el desat topa amb la quota del compte",
  },
  bodyImageTooLarge: {
    id: "components.defaultSettings.saveError.bodyImageTooLarge",
    defaultMessage:
      "Alguna imatge del vocabulari pesa massa per desar-la al núvol. Torna-la a posar amb una qualitat més baixa: la tries a Configuració › Usuari › Qualitat de les imatges.",
    description: "Explicació quan una imatge passa del pes màxim per imatge",
  },
  bodyLocal: {
    id: "components.defaultSettings.saveError.bodyLocal",
    defaultMessage:
      "Els canvis es veuen a la pantalla, però no s'han pogut desar en aquest navegador: si tanques l'aplicació ara, els perdràs.",
    description: "Explicació de l'error per a un usuari sense sessió iniciada",
  },
  errorCode: {
    id: "components.defaultSettings.saveError.errorCode",
    defaultMessage: "Codi: {code}",
    description:
      "Codi tècnic de la fallada, per poder-lo dir a qui manté l'aplicació",
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
  understood: {
    id: "components.defaultSettings.saveError.understood",
    defaultMessage: "Entesos",
    description:
      "Botó per tancar el diàleg quan reintentar no serviria de res (espai ple)",
  },
});

export default messages;
