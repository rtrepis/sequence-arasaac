"use strict";
// Punt d'entrada del servidor Express
// Configura middleware global, rutes i arrenca el servidor
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
exports.app = (0, express_1.default)();
// --- Middleware global ---
// CORS amb credencials per permetre cookies HttpOnly (Fase 3)
exports.app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
}));
// Parser de JSON per al cos de les peticions
exports.app.use(express_1.default.json());
// Limitador de velocitat global a /api — 300 peticions per minut per IP
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Massa peticions, intenta-ho d'aquí a un moment" },
});
exports.app.use("/api", globalLimiter);
// --- Rutes ---
// Endpoint de salut — comprova que el servidor és actiu
exports.app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Handler global d'errors — ha d'anar al final, després de totes les rutes
exports.app.use(errorHandler_1.errorHandler);
// --- Arrencada ---
const start = async () => {
    await (0, database_1.connectDatabase)();
    exports.app.listen(env_1.env.PORT, () => {
        console.log(`Servidor arrencat al port ${env_1.env.PORT}`);
    });
};
start();
