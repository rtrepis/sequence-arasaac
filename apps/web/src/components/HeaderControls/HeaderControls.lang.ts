import { defineMessages } from "react-intl";

// Traduccions dels botons d'accés (login/registre) i del selector d'idioma
// de la barra de navegació, i del menú clàssic que els plega en mòbil.
const messages = defineMessages({
  loginButton: {
    id: "components.headerControls.loginButton",
    defaultMessage: "Inicia sessió",
    description: "Botó de la barra de navegació per obrir el modal de login",
  },
  registerButton: {
    id: "components.headerControls.registerButton",
    defaultMessage: "Registra't",
    description:
      "Botó de la barra de navegació per anar a la pàgina de registre",
  },
  languageSelector: {
    id: "components.headerControls.languageSelector",
    defaultMessage: "Selector d'idioma",
    description:
      "Etiqueta ARIA del botó que obre el desplegable d'idioma a la barra de navegació",
  },
  openMenu: {
    id: "components.headerControls.openMenu",
    defaultMessage: "Obrir menú de compte i idioma",
    description:
      "Etiqueta ARIA del botó que plega inici de sessió, registre i idioma en mòbil",
  },
});

export default messages;
