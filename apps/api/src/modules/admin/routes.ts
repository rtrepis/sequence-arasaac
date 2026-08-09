// Router Express del mòdul d'administració
// Totes les rutes requereixen sessió vàlida I rol d'administrador

import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requireAdmin } from "../../middleware/requireAdmin";
import {
  stats,
  users,
  patchUser,
  events,
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
adminRouter.get("/events", events);
adminRouter.get("/config", config);
adminRouter.put("/config", putConfig);

export { adminRouter };
