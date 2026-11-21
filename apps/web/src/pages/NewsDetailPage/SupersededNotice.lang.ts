import { defineMessages } from "react-intl";

const messages = defineMessages({
  notice: {
    id: "news.superseded.notice",
    defaultMessage:
      "Aquesta notícia es va publicar el {date} i explica com era SequenciAAC aleshores. Des de llavors l'app ha canviat, i alguna cosa ja no és com aquí es diu.",
    description:
      "Avís a dalt d'una notícia superada. {date} és el dia que es va publicar, amb el mes en lletres",
  },
  replacedBy: {
    id: "news.superseded.replacedBy",
    defaultMessage: "Com funciona ara:",
    description:
      "Abans de l'enllaç a la notícia nova que substitueix una de superada",
  },
});

export default messages;
