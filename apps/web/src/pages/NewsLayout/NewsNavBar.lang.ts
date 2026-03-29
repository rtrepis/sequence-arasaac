import { defineMessages } from "react-intl";

// Traduccions per a la barra de navegació de la secció de notícies
const messages = defineMessages({
  welcome: {
    id: "components.newsNavBar.welcome",
    defaultMessage: "Inici",
    description: "Enllaç a la pàgina de benvinguda",
  },
  start: {
    id: "components.newsNavBar.start",
    defaultMessage: "Crea una seqüència",
    description: "Enllaç a l'editor de seqüències",
  },
  langSelector: {
    id: "components.newsNavBar.langSelector",
    defaultMessage: "Idioma",
    description: "Etiqueta ARIA del selector d'idioma",
  },
  skipToContent: {
    id: "components.newsNavBar.skipToContent",
    defaultMessage: "Salta al contingut principal",
    description: "Enllaç d'accés ràpid al contingut principal (accessibilitat)",
  },
  mainNavigation: {
    id: "components.newsNavBar.mainNavigation",
    defaultMessage: "Navegació principal",
    description: "Etiqueta ARIA per a la barra de navegació",
  },
  news: {
    id: "components.newsNavBar.news",
    defaultMessage: "Novetats",
    description: "Enllaç a la llista de novetats (changelog)",
  },
  openMenu: {
    id: "components.newsNavBar.openMenu",
    defaultMessage: "Obrir menú de navegació",
    description: "Etiqueta ARIA per al botó del logotip que obre el menú en mobile",
  },
});

export default messages;
