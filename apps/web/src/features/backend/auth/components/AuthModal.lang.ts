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
});

export default messages;
