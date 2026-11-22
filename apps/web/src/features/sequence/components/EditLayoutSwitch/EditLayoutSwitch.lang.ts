import { defineMessages } from "react-intl";

// Textos de l'interruptor de la pantalla d'edició (pla dels estils, pas 10)
const messages = defineMessages({
  tryNew: {
    id: "features.sequence.editLayout.tryNew",
    defaultMessage: "Prova l'edició nova",
    description:
      "Botó de l'edició, a l'escriptori: passa a la pantalla d'edició nova (la del mòbil: capçalera amb el nom de la seqüència i barra de baix). Es pot tornar enrere",
  },
  backToClassic: {
    id: "features.sequence.editLayout.backToClassic",
    defaultMessage: "Torna a l'edició d'abans",
    description:
      "Botó de l'edició nova, a l'escriptori: torna a la pantalla d'edició d'abans, amb les pestanyes de les seqüències",
  },
});

export default messages;
