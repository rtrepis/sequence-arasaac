// Registre d'errors del client i avís per correu a l'administració

import { ClientErrorModel } from "./model";
import { sendClientErrorAlert } from "../../shared/mailer";
import { env } from "../../config/env";

// Finestra durant la qual un mateix codi d'error no torna a generar correu.
// Sense això, una fallada que afecti tothom alhora (el backend caigut, una
// versió dolenta) enviaria un correu per usuari i esgotaria la quota diària
// del proveïdor just el dia que més falta fa poder escriure als usuaris.
const ALERT_THROTTLE_MS = 60 * 60 * 1000;

export interface RecordClientErrorInput {
  code: string;
  context: string;
  detail?: string;
  userAgent?: string;
  userId?: string;
  emailCanonical?: string;
  ipHash: string;
}

export interface ClientErrorSummary {
  id: string;
  code: string;
  context: string;
  detail?: string;
  userAgent?: string;
  emailCanonical?: string;
  createdAt: Date;
}

// Decideix si aquest codi ja ha generat un avís fa poc
const hasRecentAlert = async (code: string): Promise<boolean> => {
  const since = new Date(Date.now() - ALERT_THROTTLE_MS);
  const previous = await ClientErrorModel.exists({
    code,
    alertSent: true,
    createdAt: { $gte: since },
  });
  return previous !== null;
};

// Desa l'error i, si escau, n'avisa per correu.
// No llança mai: si el registre d'un error fallés i tombés la petició, un problema
// menor de l'usuari es convertiria en un de gros.
export const recordClientError = async (
  input: RecordClientErrorInput
): Promise<void> => {
  try {
    const shouldAlert =
      env.ADMIN_ALERT_EMAIL !== "" && !(await hasRecentAlert(input.code));

    await ClientErrorModel.create({ ...input, alertSent: shouldAlert });

    if (!shouldAlert) return;

    await sendClientErrorAlert(env.ADMIN_ALERT_EMAIL, {
      code: input.code,
      context: input.context,
      detail: input.detail,
      userAgent: input.userAgent,
      emailCanonical: input.emailCanonical,
    });
  } catch (error) {
    console.error("No s'ha pogut registrar l'error del client:", error);
  }
};

// Últims errors per al panell d'administració, del més recent al més antic
export const listClientErrors = async (
  limit: number
): Promise<ClientErrorSummary[]> => {
  const errors = await ClientErrorModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return errors.map((error) => ({
    id: String(error._id),
    code: error.code,
    context: error.context,
    detail: error.detail,
    userAgent: error.userAgent,
    emailCanonical: error.emailCanonical,
    createdAt: error.createdAt,
  }));
};
