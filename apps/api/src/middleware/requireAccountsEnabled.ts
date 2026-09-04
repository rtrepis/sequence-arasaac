// Porter de les funcions de compte
//
// Company de l'interruptor de compilació del front (`configs/accountsConfig.ts`):
// aquell fa que l'app no ensenyi cap porta d'entrada, i aquest fa que tampoc no
// n'hi hagi cap d'oberta per a un client vell, una pestanya que fa dies que és
// oberta o algú que crida l'API directament.
//
// És una variable d'entorn i no un camp de la BD, a diferència de
// `registrationOpen`: tancar el registre és una decisió d'un dia i ha de ser un
// clic al panell; apagar els comptes sencers és una decisió de desplegament, i
// llegir-la de la BD voldria dir consultar-la a cada petició de tot el servei.

import { RequestHandler } from "express";
import { env } from "../config/env";

export const requireAccountsEnabled: RequestHandler = (_req, res, next) => {
  if (env.ACCOUNTS_ENABLED) {
    next();
    return;
  }

  // 503 i no 404: el servei existeix i tornarà: no s'ha mogut de lloc.
  res.status(503).json({ errorCode: "ACCOUNTS_DISABLED" });
};
