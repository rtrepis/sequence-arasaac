// Router Express per al mòdul de user-settings
import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { getUiSettings, updateUiSettings } from "./controller";

const userSettingsRouter = Router();

userSettingsRouter.use(authMiddleware);

userSettingsRouter.get("/ui-settings", getUiSettings);
userSettingsRouter.put("/ui-settings", updateUiSettings);

export { userSettingsRouter };
