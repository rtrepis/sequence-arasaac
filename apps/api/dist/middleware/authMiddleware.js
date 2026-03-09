"use strict";
// Middleware d'autenticació JWT
// Verifica el token Bearer a la capçalera Authorization
// Afegeix userId a req per als handlers posteriors
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Token d'autenticació no proporcionat" });
        return;
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch {
        res.status(401).json({ message: "Token d'autenticació invàlid o caducat" });
    }
};
exports.authMiddleware = authMiddleware;
