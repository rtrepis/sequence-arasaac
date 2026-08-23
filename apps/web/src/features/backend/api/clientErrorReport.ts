// Informe dels errors que l'usuari ha acabat veient.
//
// Només s'informa del que ha sobreviscut als reintents: si una fallada s'ha resolt
// sola, no és un problema, i informar-ne convertiria el registre en soroll. La idea
// és que qui manté l'aplicació se n'assabenti sense dependre que l'usuari ho expliqui.
import apiClient from "./apiClient";
import { RequestFailure } from "./requestFailure";

/** Lloc del producte on ha passat, per poder llegir el registre sense endevinar. */
export type ClientErrorContext =
  | "settings-save"
  | "document-save"
  | "document-load"
  | "document-list"
  | "document-delete"
  // No ve de cap petició: la generació del PDF passa sencera al navegador. Hi entra
  // igualment perquè és una fallada que l'usuari veu i que ningú explicaria altrament.
  | "pdf-export";

export const reportClientError = async (
  context: ClientErrorContext,
  failure: RequestFailure,
): Promise<void> => {
  try {
    await apiClient.post(
      "/client-errors",
      { code: failure.code, context, detail: failure.detail },
      // De fons: aquesta petició no l'ha demanada l'usuari i no ha d'encendre
      // cap avís d'espera mentre ell ja està mirant un missatge d'error.
      { isBackgroundRequest: true },
    );
  } catch (error) {
    // Que l'informe no arribi no pot empitjorar la situació de qui ja té un error
    // a la pantalla. Queda a la consola i prou.
    console.debug("No s'ha pogut informar de l'error:", error);
  }
};
