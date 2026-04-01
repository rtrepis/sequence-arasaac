import { defineMessages } from "react-intl";

// Traduccions per al modal d'autenticació (login / registre)
const messages = defineMessages({
  loginTitle: {
    id: "features.backend.auth.loginTitle",
    defaultMessage: "Inicia sessió",
    description: "Títol del formulari de login",
  },
  registerTitle: {
    id: "features.backend.auth.registerTitle",
    defaultMessage: "Crea un compte",
    description: "Títol del formulari de registre",
  },
  email: {
    id: "features.backend.auth.email",
    defaultMessage: "Correu electrònic",
    description: "Etiqueta del camp email",
  },
  password: {
    id: "features.backend.auth.password",
    defaultMessage: "Contrasenya",
    description: "Etiqueta del camp contrasenya",
  },
  submitLogin: {
    id: "features.backend.auth.submitLogin",
    defaultMessage: "Entra",
    description: "Botó per enviar el formulari de login",
  },
  submitRegister: {
    id: "features.backend.auth.submitRegister",
    defaultMessage: "Registra'm",
    description: "Botó per enviar el formulari de registre",
  },
  toggleToRegister: {
    id: "features.backend.auth.toggleToRegister",
    defaultMessage: "No tens compte? Registra't",
    description: "Enllaç per canviar al formulari de registre",
  },
  toggleToLogin: {
    id: "features.backend.auth.toggleToLogin",
    defaultMessage: "Ja tens compte? Inicia sessió",
    description: "Enllaç per tornar al formulari de login",
  },
  close: {
    id: "features.backend.auth.close",
    defaultMessage: "Tancar",
    description: "Botó per tancar el modal d'autenticació",
  },
  showPassword: {
    id: "features.backend.auth.showPassword",
    defaultMessage: "Mostra la contrasenya",
    description: "Etiqueta ARIA per al botó de mostrar/amagar contrasenya",
  },
  loginItem: {
    id: "features.backend.auth.loginItem",
    defaultMessage: "Inicia sessió",
    description: "Ítem del drawer per obrir el modal de login",
  },
  saveDocument: {
    id: "features.backend.auth.saveDocument",
    defaultMessage: "Desa al núvol",
    description: "Ítem del drawer per desar el document al backend",
  },
  loadDocument: {
    id: "features.backend.auth.loadDocument",
    defaultMessage: "Carrega del núvol",
    description: "Ítem del drawer per carregar un document del backend",
  },
  logout: {
    id: "features.backend.auth.logout",
    defaultMessage: "Tanca sessió",
    description: "Ítem del drawer per tancar la sessió",
  },
  documentSaved: {
    id: "features.backend.auth.documentSaved",
    defaultMessage: "Document desat al núvol",
    description: "Missatge de confirmació quan el document es desa al backend",
  },
  documentLoaded: {
    id: "features.backend.auth.documentLoaded",
    defaultMessage: "Document carregat",
    description: "Missatge de confirmació quan es carrega un document del backend",
  },
  loadDocumentTitle: {
    id: "features.backend.auth.loadDocumentTitle",
    defaultMessage: "Carrega un document",
    description: "Títol del modal de càrrega de documents del backend",
  },
  noDocuments: {
    id: "features.backend.auth.noDocuments",
    defaultMessage: "No tens cap document desat",
    description: "Missatge quan l'usuari no té documents al backend",
  },
  deleteDocument: {
    id: "features.backend.auth.deleteDocument",
    defaultMessage: "Eliminar",
    description: "Botó per eliminar un document del backend",
  },
  loadAction: {
    id: "features.backend.auth.loadAction",
    defaultMessage: "Carrega",
    description: "Botó per carregar un document seleccionat del backend",
  },

  // Errors retornats pel backend com a codis semàntics
  INVALID_CREDENTIALS: {
    id: "features.backend.auth.error.INVALID_CREDENTIALS",
    defaultMessage: "Correu electrònic o contrasenya incorrectes",
    description: "Error de login: credencials incorrectes",
  },
  EMAIL_ALREADY_EXISTS: {
    id: "features.backend.auth.error.EMAIL_ALREADY_EXISTS",
    defaultMessage: "Aquest correu electrònic ja està registrat",
    description: "Error de registre: email ja existent",
  },
  EMAIL_REQUIRED: {
    id: "features.backend.auth.error.EMAIL_REQUIRED",
    defaultMessage: "El correu electrònic és obligatori",
    description: "Validació: camp email buit",
  },
  EMAIL_INVALID_FORMAT: {
    id: "features.backend.auth.error.EMAIL_INVALID_FORMAT",
    defaultMessage: "El format del correu electrònic no és vàlid",
    description: "Validació: format d'email incorrecte",
  },
  PASSWORD_REQUIRED: {
    id: "features.backend.auth.error.PASSWORD_REQUIRED",
    defaultMessage: "La contrasenya és obligatòria",
    description: "Validació: camp contrasenya buit",
  },
  PASSWORD_TOO_SHORT: {
    id: "features.backend.auth.error.PASSWORD_TOO_SHORT",
    defaultMessage: "La contrasenya ha de tenir com a mínim 8 caràcters",
    description: "Validació: contrasenya massa curta (registre)",
  },
  PASSWORD_TOO_LONG: {
    id: "features.backend.auth.error.PASSWORD_TOO_LONG",
    defaultMessage: "La contrasenya no pot superar els 128 caràcters",
    description: "Validació: contrasenya massa llarga (registre)",
  },
  AUTH_ERROR: {
    id: "features.backend.auth.error.AUTH_ERROR",
    defaultMessage: "S'ha produït un error en iniciar sessió. Torna-ho a intentar.",
    description: "Error genèric de login",
  },
  REGISTER_ERROR: {
    id: "features.backend.auth.error.REGISTER_ERROR",
    defaultMessage: "S'ha produït un error en crear el compte. Torna-ho a intentar.",
    description: "Error genèric de registre",
  },
  UNKNOWN_ERROR: {
    id: "features.backend.auth.error.UNKNOWN_ERROR",
    defaultMessage: "S'ha produït un error inesperat. Torna-ho a intentar.",
    description: "Error desconegut del servidor",
  },
});

export default messages;
