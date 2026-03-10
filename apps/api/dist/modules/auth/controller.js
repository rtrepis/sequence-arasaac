"use strict";
// Handlers Express per al mòdul d'autenticació
// Delega tota la lògica al service — el controller només gestiona req/res
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const validators_1 = require("./validators");
const service_1 = require("./service");
// Durada de la cookie de refresh token en mil·lisegons (7 dies)
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
// Nom de la cookie del refresh token — constant per evitar typos
const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
// Helper privat per configurar la cookie httpOnly del refresh token
const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        // En producció requereix HTTPS; en dev funciona sense
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
    });
};
// POST /api/auth/register
// Crea un nou usuari i retorna un access token + cookie de refresh
const register = async (req, res, next) => {
    try {
        const parsed = validators_1.registerSchema.safeParse(req.body);
        if (!parsed.success) {
            const error = new Error(parsed.error.errors[0]?.message ?? "Dades invàlides");
            error.statusCode = 400;
            return next(error);
        }
        const { accessToken, refreshToken } = await (0, service_1.registerUser)(parsed.data);
        setRefreshTokenCookie(res, refreshToken);
        res.status(201).json({ accessToken });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
// POST /api/auth/login
// Autentica un usuari i retorna un access token + cookie de refresh
const login = async (req, res, next) => {
    try {
        const parsed = validators_1.loginSchema.safeParse(req.body);
        if (!parsed.success) {
            const error = new Error(parsed.error.errors[0]?.message ?? "Dades invàlides");
            error.statusCode = 400;
            return next(error);
        }
        const { accessToken, refreshToken } = await (0, service_1.loginUser)(parsed.data);
        setRefreshTokenCookie(res, refreshToken);
        res.status(200).json({ accessToken });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
// POST /api/auth/refresh
// Llegeix la cookie de refresh token i retorna un nou parell de tokens
const refresh = (req, res, next) => {
    try {
        const token = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
        if (!token) {
            const error = new Error("Token de refresc no trobat");
            error.statusCode = 401;
            return next(error);
        }
        const { accessToken, refreshToken } = (0, service_1.refreshTokens)(token);
        setRefreshTokenCookie(res, refreshToken);
        res.status(200).json({ accessToken });
    }
    catch (err) {
        next(err);
    }
};
exports.refresh = refresh;
// POST /api/auth/logout
// Esborra la cookie de refresh token — el client ha d'eliminar l'access token localment
const logout = (_req, res) => {
    // Cal les mateixes opcions que quan es va crear per garantir l'eliminació correcta
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(204).send();
};
exports.logout = logout;
