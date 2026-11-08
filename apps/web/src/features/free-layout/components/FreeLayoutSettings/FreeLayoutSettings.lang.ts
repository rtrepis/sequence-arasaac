import { defineMessages } from "react-intl";

const messages = defineMessages({
  unplaced: {
    id: "features.freeLayout.settings.unplaced",
    defaultMessage: "Not on any page",
    description:
      "Títol de la fila amb les seqüències del document que no surten a cap pàgina",
  },
  unplacedHint: {
    id: "features.freeLayout.settings.unplacedHint",
    defaultMessage:
      "They are not printed: put them on the page you are looking at with the button next to each one, or with “Add a sequence”.",
    description:
      "Explicació sota el nombre de seqüències sense col·locar, damunt de la llista amb el botó de cada una",
  },
});

export default messages;
