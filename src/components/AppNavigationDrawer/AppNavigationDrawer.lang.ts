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
  editView: {
    id: "components.appNavigationDrawer.editView",
    defaultMessage: "Edita",
    description: "Ítem de navegació a la pàgina d'edició de seqüències",
  },
  previewView: {
    id: "components.appNavigationDrawer.previewView",
    defaultMessage: "Previsualitza",
    description: "Ítem de navegació a la pàgina de previsualització",
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
  settingsTitle: {
    id: "components.appNavigationDrawer.settingsTitle",
    defaultMessage: "Configuració per defecte",
    description: "Títol del diàleg de configuració per defecte",
  },
  settingsClose: {
    id: "components.appNavigationDrawer.settingsClose",
    defaultMessage: "Tancar",
    description: "Botó per tancar el diàleg de configuració",
  },
  langSelector: {
    id: "components.appNavigationDrawer.langSelector",
    defaultMessage: "Idioma",
    description: "Etiqueta ARIA del selector d'idioma dins el drawer",
  },
  openMenu: {
    id: "components.appNavigationDrawer.openMenu",
    defaultMessage: "Obrir menú",
    description: "Etiqueta ARIA per al botó que obre el drawer de navegació",
  },
});

export default messages;
