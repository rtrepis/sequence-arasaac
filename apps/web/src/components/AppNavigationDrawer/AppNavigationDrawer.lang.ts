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
  logoutConfirmTitle: {
    id: "components.appNavigationDrawer.logoutConfirmTitle",
    defaultMessage: "Tanques la sessió?",
    description:
      "Títol de la confirmació de tancar sessió amb feina sense còpia",
  },
  logoutConfirmBody: {
    id: "components.appNavigationDrawer.logoutConfirmBody",
    defaultMessage:
      "En sortir també es tanca el document, i el que hi ha a pantalla no és desat al núvol: es perd.",
    description: "Cos de la confirmació de tancar sessió amb feina sense còpia",
  },
  logoutSaveFirst: {
    id: "components.appNavigationDrawer.logoutSaveFirst",
    defaultMessage: "Desa al núvol abans",
    description: "Botó per desar la feina al núvol abans de tancar la sessió",
  },
  logoutDocumentClosed: {
    id: "components.appNavigationDrawer.logoutDocumentClosed",
    defaultMessage:
      "Sessió tancada. El document també s'ha tancat: no es queda en aquest dispositiu.",
    description: "Confirmació de tancar sessió quan hi havia un document obert",
  },
});

export default messages;
