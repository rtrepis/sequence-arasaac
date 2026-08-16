import { defineMessages } from "react-intl";

// Traduccions de l'avís que apareix mentre el servidor es desperta
// El text mai parla de servidors adormits ni de Render: a qui fa servir l'app això
// no li diu res. Diu què està passant (s'està connectant), quant pot durar i què pot
// fer mentrestant, que és tot el que necessita per no pensar que s'ha espatllat.
const messages = defineMessages({
  title: {
    id: "features.backend.wakeUp.title",
    defaultMessage: "Connectant amb el teu compte…",
    description: "Títol de l'avís mentre s'espera la primera resposta del servei",
  },
  description: {
    id: "features.backend.wakeUp.description",
    defaultMessage:
      "La primera connexió del dia pot trigar fins a un minut. Mentrestant pots seguir editant la seqüència.",
    description:
      "Explicació de l'espera i del que l'usuari pot fer mentrestant",
  },
  descriptionBlocking: {
    id: "features.backend.wakeUp.descriptionBlocking",
    defaultMessage:
      "La primera connexió del dia pot trigar fins a un minut. No tanquis l'aplicació.",
    description:
      "Explicació de l'espera quan hi ha una operació que bloqueja la pantalla",
  },
});

export default messages;
