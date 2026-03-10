"use strict";
// Router Express per al mòdul d'autenticació
// Inclou rate limiter específic per prevenir atacs de força bruta
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const controller_1 = require("./controller");
// Rate limiter específic per a rutes d'autenticació — més restrictiu que el global
// 100 peticions per minut per IP cobreix casos legítims sense permetre força bruta
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Massa intents d'autenticació, intenta-ho d'aquí a un moment",
    },
});
const authRouter = (0, express_1.Router)();
exports.authRouter = authRouter;
// Aplica el rate limiter a totes les rutes d'autenticació
authRouter.use(authLimiter);
authRouter.post("/register", controller_1.register);
authRouter.post("/login", controller_1.login);
authRouter.post("/refresh", controller_1.refresh);
authRouter.post("/logout", controller_1.logout);
