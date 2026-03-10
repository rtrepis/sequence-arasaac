"use strict";
// Router Express per al mòdul de user-settings
// Totes les rutes requereixen autenticació JWT via authMiddleware
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSettingsRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const controller_1 = require("./controller");
const userSettingsRouter = (0, express_1.Router)();
exports.userSettingsRouter = userSettingsRouter;
// Aplica el middleware d'autenticació a totes les rutes del mòdul
userSettingsRouter.use(authMiddleware_1.authMiddleware);
userSettingsRouter.get("/settings", controller_1.getSettings);
userSettingsRouter.put("/settings", controller_1.updateSettings);
userSettingsRouter.put("/lang", controller_1.updateLang);
