// Marca el document com a canviat sense haver de tocar cap dels reducers de
// `documentSlice`: n'hi ha una vintena i afegir-hi una línia a cadascun només
// serviria per oblidar-se'n al següent.
import { createListenerMiddleware } from "@reduxjs/toolkit";
import { documentChangedActionCreator } from "./documentStatusSlice";

/**
 * Accions de `document/` que NO són un canvi de contingut:
 * - `changeActiveSAAC` és navegació entre pestanyes de seqüència; marcar-la
 *   faria passar un document acabat de desar a «canvis sense desar» només per
 *   mirar-se'l.
 * - `loadDocumentSaac` la fa servir qui carrega un document (fitxer, núvol o
 *   esborrany) i és qui sap d'on ve; ho diu ell mateix tot seguit.
 * - `removeCloudImage` i `replaceCloudImage` només posen el document obert al
 *   dia d'un esborrat o d'un canvi de mida que ja s'ha fet al núvol: la còpia
 *   de fora no s'ha quedat enrere, s'ha avançat, i demanar de tornar-la a desar
 *   seria demanar de desar el mateix.
 */
const NOT_A_CONTENT_CHANGE = new Set([
  "document/changeActiveSAAC",
  "document/loadDocumentSaac",
  "document/resetDocument",
  "document/removeCloudImage",
  "document/replaceCloudImage",
]);

/**
 * Els reducers del slice tenen dos segments (`document/addPictogram`); les
 * accions de cicle de vida dels thunks en tenen tres (`document/save/pending`)
 * i no són canvis de l'usuari.
 */
const isContentChange = (type: string): boolean =>
  type.startsWith("document/") &&
  type.split("/").length === 2 &&
  !NOT_A_CONTENT_CHANGE.has(type);

export const documentStatusListener = createListenerMiddleware();

documentStatusListener.startListening({
  predicate: (action) => isContentChange(action.type),
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(documentChangedActionCreator());
  },
});

// Exportat només perquè els tests puguin comprovar la classificació sense
// muntar tot l'store
export const isDocumentContentAction = isContentChange;
