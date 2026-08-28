import { defineMessages } from "react-intl";

// Traduccions per al modal d'autenticació (login) i codis d'error compartits
// per tot el mòdul d'auth (signup, set-password, forgot-password inclosos)
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

  // Errors retornats pel backend com a codis semàntics
  INVALID_CREDENTIALS: {
    id: "features.backend.auth.error.INVALID_CREDENTIALS",
    defaultMessage: "Correu electrònic o contrasenya incorrectes",
    description: "Error de login: credencials incorrectes",
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
  NAME_REQUIRED: {
    id: "features.backend.auth.error.NAME_REQUIRED",
    defaultMessage: "El nom és obligatori",
    description: "Validació: camp nom buit al signup",
  },
  NAME_TOO_LONG: {
    id: "features.backend.auth.error.NAME_TOO_LONG",
    defaultMessage: "El nom no pot superar els 120 caràcters",
    description: "Validació: nom massa llarg al signup",
  },
  USE_CASE_REQUIRED: {
    id: "features.backend.auth.error.USE_CASE_REQUIRED",
    defaultMessage: "Cal triar com faràs servir l'aplicació",
    description: "Validació: selector d'ús de l'aplicació buit al signup",
  },
  PASSWORD_REQUIRED: {
    id: "features.backend.auth.error.PASSWORD_REQUIRED",
    defaultMessage: "La contrasenya és obligatòria",
    description: "Validació: camp contrasenya buit",
  },
  PASSWORD_TOO_SHORT: {
    id: "features.backend.auth.error.PASSWORD_TOO_SHORT",
    defaultMessage: "La contrasenya ha de tenir com a mínim 10 caràcters",
    description: "Validació: contrasenya massa curta",
  },
  PASSWORD_TOO_LONG: {
    id: "features.backend.auth.error.PASSWORD_TOO_LONG",
    defaultMessage: "La contrasenya no pot superar els 128 caràcters",
    description: "Validació: contrasenya massa llarga",
  },
  PASSWORD_MISSING_LOWERCASE: {
    id: "features.backend.auth.error.PASSWORD_MISSING_LOWERCASE",
    defaultMessage:
      "La contrasenya ha de tenir com a mínim una lletra minúscula",
    description: "Validació: falta una minúscula a la contrasenya",
  },
  PASSWORD_MISSING_UPPERCASE: {
    id: "features.backend.auth.error.PASSWORD_MISSING_UPPERCASE",
    defaultMessage:
      "La contrasenya ha de tenir com a mínim una lletra majúscula",
    description: "Validació: falta una majúscula a la contrasenya",
  },
  PASSWORD_MISSING_NUMBER: {
    id: "features.backend.auth.error.PASSWORD_MISSING_NUMBER",
    defaultMessage: "La contrasenya ha de tenir com a mínim un número",
    description: "Validació: falta un número a la contrasenya",
  },
  PASSWORD_MISMATCH: {
    id: "features.backend.auth.error.PASSWORD_MISMATCH",
    defaultMessage: "Les contrasenyes no coincideixen",
    description: "Validació: la repetició no coincideix amb la contrasenya",
  },
  REGISTRATION_CLOSED: {
    id: "features.backend.auth.error.REGISTRATION_CLOSED",
    defaultMessage:
      "Els registres estan tancats temporalment. Torna-ho a provar més endavant.",
    description: "Error de registre: l'administrador ha tancat els registres",
  },
  MAX_USERS_REACHED: {
    id: "features.backend.auth.error.MAX_USERS_REACHED",
    defaultMessage:
      "Hem arribat al màxim de comptes disponibles. Torna-ho a provar més endavant.",
    description: "Error de registre: s'ha assolit el sostre d'usuaris",
  },
  DISPOSABLE_EMAIL: {
    id: "features.backend.auth.error.DISPOSABLE_EMAIL",
    defaultMessage:
      "Aquesta adreça és d'un servei de correu temporal. Fes servir el teu correu habitual.",
    description: "Error de registre: domini de correu descartable",
  },
  TOO_MANY_REGISTRATIONS: {
    id: "features.backend.auth.error.TOO_MANY_REGISTRATIONS",
    defaultMessage:
      "S'han creat massa comptes des d'aquesta connexió. Prova-ho d'aquí a una estona.",
    description: "Error de registre: massa registres des de la mateixa IP",
  },
  TOO_MANY_ATTEMPTS: {
    id: "features.backend.auth.error.TOO_MANY_ATTEMPTS",
    defaultMessage:
      "Massa intents seguits. Espera un moment i torna-ho a provar.",
    description: "Error: s'ha superat el límit de peticions",
  },
  ACCOUNT_SUSPENDED: {
    id: "features.backend.auth.error.ACCOUNT_SUSPENDED",
    defaultMessage:
      "Aquest compte està suspès. Contacta amb nosaltres si creus que és un error.",
    description: "Error: compte suspès per l'administració",
  },
  REFRESH_TOKEN_EXPIRED: {
    id: "features.backend.auth.error.REFRESH_TOKEN_EXPIRED",
    defaultMessage:
      "La sessió ha caducat. Torna a entrar per desar al núvol; la feina no s'ha perdut.",
    description: "Error: el token de refresc ha caducat",
  },
  REFRESH_TOKEN_MISSING: {
    id: "features.backend.auth.error.REFRESH_TOKEN_MISSING",
    defaultMessage:
      "La sessió s'ha tancat en aquest navegador. Torna a entrar per desar al núvol; la feina no s'ha perdut.",
    description: "Error: no hi ha galeta de sessió",
  },
  INVALID_REFRESH_TOKEN: {
    id: "features.backend.auth.error.INVALID_REFRESH_TOKEN",
    defaultMessage:
      "La sessió s'ha tancat des d'un altre dispositiu. Torna a entrar per desar al núvol; la feina no s'ha perdut.",
    description: "Error: la sessió s'ha invalidat des d'un altre lloc",
  },
  USER_NOT_FOUND: {
    id: "features.backend.auth.error.USER_NOT_FOUND",
    defaultMessage:
      "Aquest compte ja no existeix. La feina continua desada en aquest dispositiu: descarrega-la si en vols una còpia.",
    description: "Error: el compte de la sessió ja no hi és",
  },
  EMAIL_NOT_VERIFIED: {
    id: "features.backend.auth.error.EMAIL_NOT_VERIFIED",
    defaultMessage:
      "Has de verificar el teu correu abans de desar al núvol. Mira la teva safata d'entrada.",
    description: "Error en desar: el correu encara no està verificat",
  },
  EMAIL_ALREADY_VERIFIED: {
    id: "features.backend.auth.error.EMAIL_ALREADY_VERIFIED",
    defaultMessage: "Aquest correu ja està verificat.",
    description: "Error: s'ha demanat verificar un correu ja verificat",
  },
  VERIFICATION_TOKEN_INVALID: {
    id: "features.backend.auth.error.VERIFICATION_TOKEN_INVALID",
    defaultMessage:
      "Aquest enllaç de verificació no és vàlid o ha caducat. Demana'n un de nou.",
    description: "Error de verificació: token invàlid o caducat",
  },
  VERIFICATION_TOKEN_MISSING: {
    id: "features.backend.auth.error.VERIFICATION_TOKEN_MISSING",
    defaultMessage: "L'enllaç de verificació està incomplet.",
    description: "Error de verificació: falta el token a l'enllaç",
  },
  VERIFICATION_RESEND_TOO_SOON: {
    id: "features.backend.auth.error.VERIFICATION_RESEND_TOO_SOON",
    defaultMessage:
      "Ja t'hem enviat un correu fa poc. Espera uns minuts abans de demanar-ne un altre.",
    description: "Error: reenviament de verificació demanat massa aviat",
  },
  VERIFICATION_RESEND_LIMIT: {
    id: "features.backend.auth.error.VERIFICATION_RESEND_LIMIT",
    defaultMessage:
      "Has demanat el correu de verificació massa vegades avui. Torna-ho a provar demà.",
    description: "Error: límit diari de reenviaments de verificació",
  },
  VERIFICATION_EMAIL_FAILED: {
    id: "features.backend.auth.error.VERIFICATION_EMAIL_FAILED",
    defaultMessage:
      "No hem pogut enviar el correu de verificació. Torna-ho a provar d'aquí a una estona.",
    description: "Error: el proveïdor de correu ha rebutjat l'enviament",
  },
  QUOTA_DOCUMENTS_EXCEEDED: {
    id: "features.backend.auth.error.QUOTA_DOCUMENTS_EXCEEDED",
    defaultMessage:
      "Has arribat al màxim de documents desats. Esborra'n algun per desar-ne un de nou.",
    description: "Error en desar: límit de documents assolit",
  },
  QUOTA_STORAGE_EXCEEDED: {
    id: "features.backend.auth.error.QUOTA_STORAGE_EXCEEDED",
    defaultMessage:
      "Has arribat al màxim d'espai per a imatges. Esborra algun document amb imatges pròpies.",
    description: "Error en desar: límit d'emmagatzematge assolit",
  },
  QUOTA_WORD_PROFILES_EXCEEDED: {
    id: "features.backend.auth.error.QUOTA_WORD_PROFILES_EXCEEDED",
    defaultMessage:
      "Has arribat al màxim de paraules personalitzades. Esborra'n alguna per afegir-ne més.",
    description: "Error en desar: límit de perfils de paraula assolit",
  },
  DOCUMENT_SAVE_ERROR: {
    id: "features.backend.auth.error.DOCUMENT_SAVE_ERROR",
    defaultMessage: "No s'ha pogut desar el document. Torna-ho a provar.",
    description: "Error genèric en desar un document al núvol",
  },
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
  DOCUMENT_INVALID_FORMAT: {
    id: "features.backend.auth.error.DOCUMENT_INVALID_FORMAT",
    defaultMessage:
      "El servidor no ha entès el format d'aquesta seqüència. Descarrega-la al teu dispositiu per no perdre-la i avisa'ns.",
    description:
      "Error en desar: el document no ha passat la validació del servidor",
  },
  AUTH_ERROR: {
    id: "features.backend.auth.error.AUTH_ERROR",
    defaultMessage:
      "S'ha produït un error en iniciar sessió. Torna-ho a intentar.",
    description: "Error genèric de login",
  },
  REGISTER_ERROR: {
    id: "features.backend.auth.error.REGISTER_ERROR",
    defaultMessage:
      "S'ha produït un error en crear el compte. Torna-ho a intentar.",
    description: "Error genèric de signup",
  },
  SET_PASSWORD_ERROR: {
    id: "features.backend.auth.error.SET_PASSWORD_ERROR",
    defaultMessage:
      "S'ha produït un error en establir la contrasenya. Torna-ho a intentar.",
    description: "Error genèric d'establiment de contrasenya",
  },
  UNKNOWN_ERROR: {
    id: "features.backend.auth.error.UNKNOWN_ERROR",
    defaultMessage: "S'ha produït un error inesperat. Torna-ho a intentar.",
    description: "Error desconegut del servidor",
  },
});

export default messages;
