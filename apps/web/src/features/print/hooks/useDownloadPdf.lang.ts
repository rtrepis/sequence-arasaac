import { defineMessages } from "react-intl";

// Missatges del feedback de generació del PDF: el backdrop mentre dura i el
// snackbar del final, tant si acaba bé com si falla
const messages = defineMessages({
  generating: {
    id: "features.print.pdf.generating",
    defaultMessage: "S'està generant el PDF…",
    description: "Missatge del backdrop mentre es genera el PDF",
  },
  generatingPage: {
    id: "features.print.pdf.generatingPage",
    defaultMessage: "S'està generant el PDF: pàgina {number} de {total}…",
    description:
      "Missatge del backdrop mentre es genera un PDF de diverses pàgines (mode lliure)",
  },
  downloaded: {
    id: "features.print.pdf.downloaded",
    defaultMessage: "PDF descarregat",
    description: "Confirmació quan el PDF s'ha generat i descarregat",
  },
  error: {
    id: "features.print.pdf.error",
    defaultMessage: "No s'ha pogut generar el PDF. (Codi: {code})",
    description:
      "Error quan la generació del PDF falla; el codi permet dir què ha passat sense obrir la consola",
  },
});

export default messages;
