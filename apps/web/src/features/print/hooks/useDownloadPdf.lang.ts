import { defineMessages } from "react-intl";

// Missatges del feedback de generació del PDF: el backdrop mentre dura i el
// snackbar del final, tant si acaba bé com si falla
const messages = defineMessages({
  generating: {
    id: "features.print.pdf.generating",
    defaultMessage: "S'està generant el PDF…",
    description: "Missatge del backdrop mentre es genera el PDF",
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
