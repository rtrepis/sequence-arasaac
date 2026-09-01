import { defineMessages } from "react-intl";

const messages = defineMessages({
  conflictError: {
    id: "features.sequence.draft.conflictError",
    defaultMessage:
      "Una altra pestanya té feina més nova. Aquesta ha deixat de desar sola per no esborrar-la: descarrega el que hi tens si el vols conservar.",
    description:
      "Avís quan una altra pestanya ha desat l'esborrany més tard que aquesta",
  },
  saveError: {
    id: "features.sequence.draft.saveError",
    defaultMessage:
      "The sequence could not be saved in this browser. Download the file so you don't lose your work.",
    description:
      "Avís quan el navegador no pot desar l'esborrany automàtic del document",
  },
});

export default messages;
