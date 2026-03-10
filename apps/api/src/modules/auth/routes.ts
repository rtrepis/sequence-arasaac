// Router Express per al mòdul d'autenticació
// Inclou rate limiter específic per prevenir atacs de força bruta

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, refresh, logout } from "./controller";

// Rate limiter específic per a rutes d'autenticació — més restrictiu que el global
// 100 peticions per minut per IP cobreix casos legítims sense permetre força bruta
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Massa intents d'autenticació, intenta-ho d'aquí a un moment",
  },
});

const authRouter = Router();

// Aplica el rate limiter a totes les rutes d'autenticació
authRouter.use(authLimiter);

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

export { authRouter };
