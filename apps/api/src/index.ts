// Punt d'entrada del servidor Express
// Configura middleware global, rutes i arrenca el servidor

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/routes";

export const app = express();

// --- Middleware global ---

// CORS amb credencials per permetre cookies HttpOnly (Fase 3)
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Parser de JSON per al cos de les peticions
app.use(express.json());

// Parser de cookies — necessari per llegir el refresh token httpOnly a /api/auth/refresh
app.use(cookieParser());

// Limitador de velocitat global a /api — 300 peticions per minut per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Massa peticions, intenta-ho d'aquí a un moment" },
});
app.use("/api", globalLimiter);

// --- Rutes ---

// Endpoint de salut — comprova que el servidor és actiu
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rutes d'autenticació
app.use("/api/auth", authRouter);

// Handler global d'errors — ha d'anar al final, després de totes les rutes
app.use(errorHandler);

// --- Arrencada ---

const start = async (): Promise<void> => {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.log(`Servidor arrencat al port ${env.PORT}`);
  });
};

start();
