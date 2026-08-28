import { defineMessages } from "react-intl";

// Traduccions per al drawer de navegació compartit (LogoMenu + NewsNavBar)
const messages = defineMessages({
  welcome: {
    id: "components.appNavigationDrawer.welcome",
    defaultMessage: "Inici",
    description: "Ítem de navegació a la pàgina de benvinguda",
  },
  news: {
    id: "components.appNavigationDrawer.news",
    defaultMessage: "Novetats",
    description: "Ítem de navegació a la llista de novetats",
  },
  download: {
    id: "components.appNavigationDrawer.download",
    defaultMessage: "Descarrega",
    description: "Ítem per descarregar la seqüència com a fitxer",
  },
  load: {
    id: "components.appNavigationDrawer.load",
    defaultMessage: "Carrega",
    description: "Ítem per carregar una seqüència des d'un fitxer",
  },
  settings: {
    id: "components.appNavigationDrawer.settings",
    defaultMessage: "Configuració",
    description: "Ítem per obrir la configuració per defecte",
  },
  admin: {
    id: "components.appNavigationDrawer.admin",
    defaultMessage: "Administració",
    description: "Ítem d'accés al panell d'administració (només per a admins)",
  },
});

export default messages;
