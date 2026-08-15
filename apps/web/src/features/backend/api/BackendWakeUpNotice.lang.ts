import { defineMessages } from "react-intl";

// Traduccions de l'avís que apareix mentre el servidor es desperta
const messages = defineMessages({
  title: {
    id: "features.backend.wakeUp.title",
    defaultMessage: "Estem despertant el servidor…",
    description: "Títol de l'avís mentre el servidor de Render es desperta",
  },
  description: {
    id: "features.backend.wakeUp.description",
    defaultMessage:
      "Pot trigar fins a un minut. Mentrestant pots seguir editant la seqüència.",
    description:
      "Explicació de l'espera i del que l'usuari pot fer mentrestant",
  },
});

export default messages;
