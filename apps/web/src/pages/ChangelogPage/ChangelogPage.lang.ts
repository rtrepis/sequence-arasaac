import { defineMessages } from "react-intl";

const messages = defineMessages({
  pageTitle: {
    id: "changelog.page.title",
    defaultMessage: "Novetats",
    description: "Títol de la pàgina de changelog",
  },
  categoryNova: {
    id: "changelog.category.nova",
    defaultMessage: "Nova",
    description: "Badge de categoria: funcionalitat nova",
  },
  categoryMillora: {
    id: "changelog.category.millora",
    defaultMessage: "Millora",
    description: "Badge de categoria: millora d'una funcionalitat existent",
  },
  categoryCorreccio: {
    id: "changelog.category.correccio",
    defaultMessage: "Correcció",
    description: "Badge de categoria: correcció d'un error",
  },
  superseded: {
    id: "changelog.superseded",
    defaultMessage: "Superada",
    description:
      "Etiqueta d'una notícia que explica com era l'app abans i que ja no és del tot certa",
  },
  readMore: {
    id: "changelog.readMore",
    defaultMessage: "Llegir més",
    description: "Botó per anar al detall de la notícia",
  },
});

export default messages;
