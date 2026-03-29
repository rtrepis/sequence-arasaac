// Router Express per al mòdul de user-settings
// Totes les rutes requereixen autenticació JWT via authMiddleware

import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { getSettings, updateSettings, updateLang } from "./controller";

const userSettingsRouter = Router();

// Aplica el middleware d'autenticació a totes les rutes del mòdul
userSettingsRouter.use(authMiddleware);

userSettingsRouter.get("/settings", getSettings);
userSettingsRouter.put("/settings", updateSettings);
userSettingsRouter.put("/lang", updateLang);

export { userSettingsRouter };
