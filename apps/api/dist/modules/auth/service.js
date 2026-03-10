"use strict";
// Lògica de negoci del mòdul d'autenticació
// Cap dependència d'Express — treballa únicament amb models i JWT
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokens = exports.loginUser = exports.registerUser = exports.generateTokens = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const model_1 = require("./model");
// Durades dels tokens
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const BCRYPT_ROUNDS = 12;
// Genera el parell de tokens per a un userId donat
const generateTokens = (userId) => {
    const accessTokenPayload = { userId };
    const refreshTokenPayload = { userId, type: "refresh" };
    const accessToken = jsonwebtoken_1.default.sign(accessTokenPayload, env_1.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = jsonwebtoken_1.default.sign(refreshTokenPayload, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
// Registra un nou usuari — llança AppError si el correu ja existeix
const registerUser = async (input) => {
    // Comprovar si ja existeix un usuari amb aquest email
    const existing = await model_1.UserModel.findOne({ email: input.email });
    if (existing) {
        const error = new Error("Aquest correu electrònic ja està registrat");
        error.statusCode = 409;
        throw error;
    }
    // Hash de la contrasenya — 12 rounds és el mínim recomanat per a producció
    const passwordHash = await bcryptjs_1.default.hash(input.password, BCRYPT_ROUNDS);
    const user = await model_1.UserModel.create({
        email: input.email,
        passwordHash,
        // settings i langSettings prenen els valors per defecte definits al model
    });
    return (0, exports.generateTokens)(String(user._id));
};
exports.registerUser = registerUser;
// Autentica un usuari existent — missatge genèric per no revelar si l'email existeix o no
const loginUser = async (input) => {
    const user = await model_1.UserModel.findOne({ email: input.email });
    // Missatge genèric intencionat — no revela si l'email existeix
    const invalidError = new Error("Credencials incorrectes");
    invalidError.statusCode = 401;
    if (!user) {
        // Hash fictici per evitar timing attacks (bcrypt.compare és lent)
        // Sense això, un atacant podria enumerar emails per la diferència de temps
        await bcryptjs_1.default.hash(input.password, BCRYPT_ROUNDS);
        throw invalidError;
    }
    const isValid = await bcryptjs_1.default.compare(input.password, user.passwordHash);
    if (!isValid) {
        throw invalidError;
    }
    return (0, exports.generateTokens)(String(user._id));
};
exports.loginUser = loginUser;
// Verifica un refresh token i retorna un nou parell de tokens
// Funció síncrona — jwt.verify és sincronic, no cal accedir a la BD
const refreshTokens = (refreshToken) => {
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        // Verificar que és realment un refresh token (no un access token reutilitzat)
        if (payload.type !== "refresh") {
            const error = new Error("Token de refresc invàlid");
            error.statusCode = 401;
            throw error;
        }
        return (0, exports.generateTokens)(payload.userId);
    }
    catch (err) {
        // Si ja és un AppError amb statusCode, el relancem directament
        if (err.statusCode) {
            throw err;
        }
        const error = new Error("Token de refresc invàlid o caducat");
        error.statusCode = 401;
        throw error;
    }
};
exports.refreshTokens = refreshTokens;
