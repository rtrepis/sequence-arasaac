import { defineMessages } from "react-intl";

// Traduccions de la guia de requisits de contrasenya
const messages = defineMessages({
  minLength: {
    id: "features.backend.auth.password.minLength",
    defaultMessage: "Com a mínim 10 caràcters",
    description: "Requisit de contrasenya: longitud mínima",
  },
  hasLowercase: {
    id: "features.backend.auth.password.hasLowercase",
    defaultMessage: "Una lletra minúscula",
    description: "Requisit de contrasenya: minúscula",
  },
  hasUppercase: {
    id: "features.backend.auth.password.hasUppercase",
    defaultMessage: "Una lletra majúscula",
    description: "Requisit de contrasenya: majúscula",
  },
  hasNumber: {
    id: "features.backend.auth.password.hasNumber",
    defaultMessage: "Un número",
    description: "Requisit de contrasenya: número",
  },
});

export default messages;
