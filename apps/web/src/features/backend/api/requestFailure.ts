// Classificació de les fallades de petició.
//
// La distinció que importa és una de sola: val la pena tornar-ho a provar tot sol?
// Un servidor que encara s'està engegant, una connexió que cau o una passarel·la que
// no contesta es resolen sols en segons. Un rebuig del servidor (dades invàlides,
// sessió caducada, quota) no canviarà per insistir-hi, i amagar-lo darrere reintents
// només endarrereix el moment en què l'usuari se n'assabenta.

/** Codis d'error propis que no venen de cap petició HTTP. */
export const STORAGE_FULL = "STORAGE_FULL";

export interface RequestFailure {
  /** Codi semàntic per triar el missatge que veurà l'usuari. */
  code: string;
  /** Cert si val la pena reintentar sol abans de molestar ningú. */
  isTransient: boolean;
  /** Detall per al registre d'errors; mai es mostra tal qual. */
  detail?: string;
}

// Estats que indiquen "ara mateix no, torna-hi": encara arrencant, saturat o
// darrere d'una passarel·la que no ha pogut arribar al servei.
const TRANSIENT_STATUS = new Set([408, 425, 429, 502, 503, 504]);

// Codis d'axios per a "la petició no ha arribat enlloc"
const TRANSIENT_AXIOS_CODES = new Set([
  "ECONNABORTED", // timeout de la petició
  "ETIMEDOUT",
  "ERR_NETWORK",
]);

interface AxiosLikeError {
  code?: string;
  message?: string;
  response?: { status?: number; data?: { errorCode?: string } };
}

export const classifyRequestFailure = (error: unknown): RequestFailure => {
  const failure = error as AxiosLikeError & { code?: string };

  // Errors propis del client (no HTTP): mai són transitoris
  if (failure?.code === STORAGE_FULL) {
    return { code: STORAGE_FULL, isTransient: false };
  }

  if (failure?.code && TRANSIENT_AXIOS_CODES.has(failure.code)) {
    return {
      code: "NETWORK_ERROR",
      isTransient: true,
      detail: `${failure.code}: ${failure.message ?? ""}`.trim(),
    };
  }

  const status = failure?.response?.status;

  // Sense resposta no hi ha hagut rebuig: la petició no ha arribat a destí
  if (status === undefined) {
    return {
      code: "NETWORK_ERROR",
      isTransient: true,
      detail: failure?.message,
    };
  }

  return {
    code: failure.response?.data?.errorCode ?? `HTTP_${status}`,
    isTransient: TRANSIENT_STATUS.has(status),
    detail: `HTTP ${status}`,
  };
};
