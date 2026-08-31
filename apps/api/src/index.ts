// Punt d'entrada del servidor Express
// Configura middleware global, rutes i arrenca el servidor

import express, { RequestHandler } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/routes";
import { documentsRouter } from "./modules/documents/routes";
import { userSettingsRouter } from "./modules/user-settings/routes";
import { adminRouter } from "./modules/admin/routes";
import { clientErrorsRouter } from "./modules/client-errors/routes";

export const app = express();

// --- Middleware global ---

// Render (i qualsevol PaaS) posa un proxy davant de l'aplicació: sense això,
// express-rate-limit veuria la IP del proxy a totes les peticions i els limitadors
// serien decoratius (o bloquejarien tothom alhora). L'1 vol dir "confia en un sol salt".
app.set("trust proxy", 1);

// CORS amb credencials per permetre cookies HttpOnly (Fase 3)
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Parser de JSON — límit de 20mb per admetre documents amb imatges base64 (substituïdes per Cloudinary al service)
// El sostre ha de quedar per sota dels 16 MB per document de MongoDB. Amb els
// 20 MB que hi havia, una petició massa grossa passava la porta i moria a
// Mongoose: l'usuari rebia un 500 sense causa en comptes d'un 413 explicat.
// 12 MB donen per a un lot d'imatges (~14 a 500 KB en base64) amb marge.
app.use(express.json({ limit: "12mb" }));

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

// Endpoint de salut — comprova que el servidor és actiu.
// Es publica també sota /api perquè el front hi pugui arribar: el rewrite de Vercel
// només reenvia /api/:path*, i el ping de desvetllament (warmUpBackend) el necessita.
const healthHandler: RequestHandler = (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
};
app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// Rutes d'autenticació
app.use("/api/auth", authRouter);

// Rutes de documents (Fase 4)
app.use("/api/documents", documentsRouter);

// Rutes de user-settings (Fase 5)
app.use("/api/user", userSettingsRouter);

// Report d'errors del client — obert, amb límit propi (vegeu el seu router)
app.use("/api/client-errors", clientErrorsRouter);

// Rutes d'administració — protegides per rol, no només per sessió
app.use("/api/admin", adminRouter);

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
