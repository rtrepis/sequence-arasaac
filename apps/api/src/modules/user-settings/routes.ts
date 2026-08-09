// Router Express per al mòdul de user-settings
import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { getUiSettings, updateUiSettings, deleteAccount } from "./controller";

const userSettingsRouter = Router();

userSettingsRouter.use(authMiddleware);

userSettingsRouter.get("/ui-settings", getUiSettings);
userSettingsRouter.put("/ui-settings", updateUiSettings);
// Esborrat del propi compte (RGPD) — irreversible i sense confirmació al servidor:
// la confirmació és responsabilitat de la interfície
userSettingsRouter.delete("/me", deleteAccount);

export { userSettingsRouter };
