import { defineMessages } from "react-intl";

const messages = defineMessages({
  pageTitle: {
    id: "randomNames.page.title",
    defaultMessage: "Noms aleatoris",
    description: "Títol de la pàgina de noms aleatoris",
  },
  cardTitle: {
    id: "randomNames.card.title",
    defaultMessage: "Noms Disney",
    description: "Títol de la targeta amb la llista de noms",
  },
  cardSubtitle: {
    id: "randomNames.card.subtitle",
    defaultMessage: "Una tria a l'atzar de personatges Disney",
    description: "Subtítol de la targeta amb la llista de noms",
  },
  shuffle: {
    id: "randomNames.shuffle",
    defaultMessage: "Genera'n uns altres",
    description: "Botó que torna a triar els noms de la llista",
  },
});

export default messages;
