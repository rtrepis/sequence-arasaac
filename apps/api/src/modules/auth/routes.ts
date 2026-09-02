// Router Express per al mòdul d'autenticació
// Inclou rate limiters específics per prevenir força bruta i creació massiva de comptes

import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  registrationStatus,
  signup,
  login,
  refresh,
  logout,
  setPasswordHandler,
  passwordLinkInfo,
  forgotPassword,
  resendVerificationEmail,
} from "./controller";

// Rate limiter general d'autenticació — cobreix login, refresh i set-password.
// 30 per minut i IP deixa lloc de sobra a un ús legítim (inclosos els refresh
// automàtics cada 15 minuts) i redueix molt el marge de la força bruta.
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errorCode: "TOO_MANY_ATTEMPTS" },
});

// Rate limiter específic del signup — molt més estricte que la resta.
// Crear un compte és una acció rara: cinc en una hora des de la mateixa IP ja
// cobreix una família o una aula sencera donant-se d'alta alhora.
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errorCode: "TOO_MANY_REGISTRATIONS" },
});

// Rate limiter de forgot-password i del reenviament de verificació — mateix
// criteri que el signup: cap dels dos hauria de fer-se muntanyes de vegades
// des del mateix origen, i el límit per compte ja el porta el service.
const emailRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errorCode: "TOO_MANY_ATTEMPTS" },
});

const authRouter = Router();

// Aplica el rate limiter general a totes les rutes d'autenticació
authRouter.use(authLimiter);

// Estat del registre: l'única ruta d'auth que es llegeix sense enviar res.
// Va abans del signup perquè és el que es consulta abans de provar-ho.
authRouter.get("/registration-status", registrationStatus);

// El del signup s'hi suma: una petició de signup passa pels dos
authRouter.post("/signup", signupLimiter, signup);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.post("/set-password", setPasswordHandler);
// Només llegeix el token de l'enllaç; el limitador general d'auth ja hi és
authRouter.post("/password-link-info", passwordLinkInfo);
authRouter.post("/forgot-password", emailRequestLimiter, forgotPassword);
authRouter.post("/resend-verification", emailRequestLimiter, resendVerificationEmail);

export { authRouter };
