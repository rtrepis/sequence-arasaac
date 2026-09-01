// Router Express per al mòdul de user-settings
import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import {
  getUiSettings,
  updateUiSettings,
  getQuotaStatus,
  listUserAssets,
  deleteUserAsset,
  replaceUserAsset,
  deleteAccount,
} from "./controller";

const userSettingsRouter = Router();

userSettingsRouter.use(authMiddleware);

userSettingsRouter.get("/ui-settings", getUiSettings);
userSettingsRouter.put("/ui-settings", updateUiSettings);

// Consum i límits del compte, i gestió de les imatges que hi ocupen espai.
// Esborrar una imatge sempre es permet, també amb el correu sense verificar:
// mai s'ha d'impedir a algú alliberar espai.
userSettingsRouter.get("/quota", getQuotaStatus);
userSettingsRouter.get("/assets", listUserAssets);
userSettingsRouter.delete("/assets", deleteUserAsset);
// Canviar de mida tampoc demana el correu verificat: allibera espai, com
// esborrar, i a més conserva la imatge
userSettingsRouter.patch("/assets", replaceUserAsset);
// Esborrat del propi compte (RGPD) — irreversible i sense confirmació al servidor:
// la confirmació és responsabilitat de la interfície
userSettingsRouter.delete("/me", deleteAccount);

export { userSettingsRouter };
