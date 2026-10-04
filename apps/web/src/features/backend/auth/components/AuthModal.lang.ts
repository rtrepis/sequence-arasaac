import { defineMessages } from "react-intl";

// Traduccions per al modal d'autenticació (login) i compartides per tot el
// mòdul d'auth (signup, set-password, forgot-password inclosos). Els textos dels
// codis d'error són al catàleg `errors` de @sequence-arasaac/i18n (errorMessageFor)
const messages = defineMessages({
  loginTitle: {
    id: "features.backend.auth.loginTitle",
    defaultMessage: "Inicia sessió",
    description: "Títol del formulari de login",
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
  toggleToRegister: {
    id: "features.backend.auth.toggleToRegister",
    defaultMessage: "No tens compte? Registra't",
    description: "Enllaç del formulari de login cap a la pàgina de signup",
  },
  forgotPassword: {
    id: "features.backend.auth.forgotPassword",
    defaultMessage: "Has oblidat la contrasenya?",
    description:
      "Enllaç del formulari de login cap a la recuperació de contrasenya",
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
  documentLoaded: {
    id: "features.backend.auth.documentLoaded",
    defaultMessage: "Document carregat",
    description:
      "Missatge de confirmació quan es carrega un document del backend",
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

  // El servidor el retorna des que hi ha sostre per imatge, però fins ara no
  // tenia missatge: arribava a l'usuari com un codi cru dins del text genèric
  errorWithCode: {
    id: "features.backend.auth.errorWithCode",
    defaultMessage: "{message} (Codi: {code})",
    description:
      "Missatge d'error amb el codi tècnic, per poder-lo dir sense obrir la consola",
  },
  savingDocument: {
    id: "features.backend.auth.savingDocument",
    defaultMessage: "Desant la seqüència al núvol…",
    description: "Missatge del backdrop mentre es desa el document",
  },
  loadListError: {
    id: "features.backend.auth.loadListError",
    defaultMessage:
      "No hem pogut recuperar els teus documents. Comprova la connexió i torna-ho a provar.",
    description: "Error en obtenir el llistat de documents desats",
  },
  loadDocumentError: {
    id: "features.backend.auth.loadDocumentError",
    defaultMessage:
      "No s'ha pogut carregar aquest document. Torna-ho a provar.",
    description: "Error en carregar un document concret del núvol",
  },
  retry: {
    id: "features.backend.auth.retry",
    defaultMessage: "Torna-ho a provar",
    description: "Botó per reintentar una operació fallida",
  },
});

export default messages;
