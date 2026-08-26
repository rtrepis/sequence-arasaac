import { defineMessages } from "react-intl";

// L'única etiqueta de «no ho facis» de tota l'app: qualsevol confirmació la
// comparteix, com passa amb «Restaura [àmbit]» als botons de restaurar.
const messages = defineMessages({
  cancel: {
    id: "components.confirmDialog.cancel",
    defaultMessage: "Cancel",
    description: "Botó que tanca una confirmació sense fer l'acció",
  },
});

export default messages;
