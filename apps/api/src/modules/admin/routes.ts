// Router Express del mòdul d'administració
// Totes les rutes requereixen sessió vàlida I rol d'administrador

import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requireAdmin } from "../../middleware/requireAdmin";
import {
  stats,
  users,
  patchUser,
  userPasswordLink,
  events,
  clientErrors,
  deleteClientError,
  deleteClientErrors,
  config,
  putConfig,
} from "./controller";

const adminRouter = Router();

// L'ordre importa: primer identificar l'usuari, després comprovar-ne el rol
adminRouter.use(authMiddleware);
adminRouter.use(requireAdmin);

adminRouter.get("/stats", stats);
adminRouter.get("/users", users);
adminRouter.patch("/users/:id", patchUser);
// Enllaç d'accés d'un usuari, generat a petició i d'un en un: és una
// credencial, i per això no viatja mai amb el llistat
adminRouter.post("/users/:id/password-link", userPasswordLink);
adminRouter.get("/events", events);
adminRouter.get("/client-errors", clientErrors);
// Esborrar un error i buidar el registre fins a una data: dos camins diferents
// de la mateixa eina, declarats junts
adminRouter.delete("/client-errors", deleteClientErrors);
adminRouter.delete("/client-errors/:id", deleteClientError);
adminRouter.get("/config", config);
adminRouter.put("/config", putConfig);

export { adminRouter };
