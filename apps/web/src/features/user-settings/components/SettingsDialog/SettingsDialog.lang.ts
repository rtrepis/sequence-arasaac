import { defineMessages } from "react-intl";

const messages = defineMessages({
  settings: {
    id: "components.defaultSettings.settings.title",
    defaultMessage: "Settings",
    description: "Settings Default ",
  },
  settingsLoggedIn: {
    id: "components.defaultSettings.settings.loggedIn",
    defaultMessage: "Settings · signed in as {email}",
    description:
      "Nom del botó de configuracions quan hi ha sessió: també diu amb quin compte",
  },
  close: {
    id: "components.defaultSettings.close",
    defaultMessage: "close",
    description: "close Settings Default ",
  },
  pictGuide: {
    id: "components.defaultSettings.pictGuide",
    defaultMessage: "Preview",
    description: "Paraula del pictograma de mostra dels settings per defecte",
  },
  tabUser: {
    id: "components.defaultSettings.tab.user",
    defaultMessage: "User",
    description: "Tab d'ajustos d'usuari (idioma, compte...)",
  },
  tabPictograms: {
    id: "components.defaultSettings.tab.pictograms",
    defaultMessage: "El meu estil",
    description:
      "Tab del panell «El meu estil»: l'estil dels pictogrames amb què neixen els documents nous i que s'aplica des del menú «⋯» de la vista",
  },
  tabView: {
    id: "components.defaultSettings.tab.view",
    defaultMessage: "Pàgina i distribució",
    description:
      "Tab de les preferències amb què comencen els documents nous: la pàgina i la distribució dels pictogrames",
  },
  tabVocabulary: {
    id: "components.defaultSettings.tab.vocabulary",
    defaultMessage: "Personal vocabulary",
    description: "Tab de vocabulari personal (paraules personalitzades)",
  },
});

export default messages;
