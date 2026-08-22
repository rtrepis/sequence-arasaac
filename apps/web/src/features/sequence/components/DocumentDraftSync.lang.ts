import { defineMessages } from "react-intl";

const messages = defineMessages({
  saveError: {
    id: "features.sequence.draft.saveError",
    defaultMessage:
      "The sequence could not be saved in this browser. Download the file so you don't lose your work.",
    description:
      "Avís quan el navegador no pot desar l'esborrany automàtic del document",
  },
});

export default messages;
