// Router Express per al mòdul d'autenticació
// Inclou rate limiters específics per prevenir força bruta i creació massiva de comptes

import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  refresh,
  logout,
  verify,
  resendVerificationEmail,
} from "./controller";
import { authMiddleware } from "../../middleware/authMiddleware";

// Rate limiter general d'autenticació — cobreix login i refresh.
// 30 per minut i IP deixa lloc de sobra a un ús legítim (inclosos els refresh
// automàtics cada 15 minuts) i redueix molt el marge de la força bruta.
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errorCode: "TOO_MANY_ATTEMPTS" },
});

// Rate limiter específic del registre — molt més estricte que la resta.
// Crear un compte és una acció rara: cinc en una hora des de la mateixa IP ja
// cobreix una família o una aula sencera donant-se d'alta alhora.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errorCode: "TOO_MANY_REGISTRATIONS" },
});

const authRouter = Router();

// Aplica el rate limiter general a totes les rutes d'autenticació
authRouter.use(authLimiter);

// El del registre s'hi suma: una petició de registre passa pels dos
authRouter.post("/register", registerLimiter, register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.get("/verify", verify);
// El reenviament requereix sessió: només es pot demanar per al propi compte.
// Els límits per compte (5 min entre correus, 3 al dia) són al service.
authRouter.post("/resend-verification", authMiddleware, resendVerificationEmail);

export { authRouter };
