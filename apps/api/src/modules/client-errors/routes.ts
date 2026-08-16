// Router del report d'errors del client

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { reportError } from "./controller";

const clientErrorsRouter = Router();

// Límit propi i estret: és un endpoint obert i el seu ús legítim són uns pocs
// informes per sessió. Qui n'enviï més no està informant d'un error.
const reportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Massa informes d'error seguits" },
});

// Sense authMiddleware: un error pot passar abans d'iniciar sessió, i llavors
// és quan més interessa saber-ho. Si hi ha sessió, el userId l'aporta el token
// en peticions posteriors del panell, no aquesta.
clientErrorsRouter.post("/", reportLimiter, reportError);

export { clientErrorsRouter };
