"use strict";
// Handlers Express per al mòdul de user-settings
// Delega tota la lògica al service — el controller només gestiona req/res
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLang = exports.updateSettings = exports.getSettings = void 0;
const validators_1 = require("./validators");
const service_1 = require("./service");
// GET /api/user/settings
// Retorna els DefaultSettings i langSettings de l'usuari autenticat
const getSettings = async (req, res, next) => {
    try {
        const result = await (0, service_1.getSettings)(req.userId);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.getSettings = getSettings;
// PUT /api/user/settings
// Actualitza els DefaultSettings de l'usuari
const updateSettings = async (req, res, next) => {
    try {
        const parsed = validators_1.updateSettingsSchema.safeParse(req.body);
        if (!parsed.success) {
            const error = new Error(parsed.error.errors[0]?.message ?? "Dades invàlides");
            error.statusCode = 400;
            return next(error);
        }
        const result = await (0, service_1.updateSettings)(req.userId, parsed.data);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.updateSettings = updateSettings;
// PUT /api/user/lang
// Actualitza els langSettings de l'usuari
const updateLang = async (req, res, next) => {
    try {
        const parsed = validators_1.updateLangSchema.safeParse(req.body);
        if (!parsed.success) {
            const error = new Error(parsed.error.errors[0]?.message ?? "Dades invàlides");
            error.statusCode = 400;
            return next(error);
        }
        const result = await (0, service_1.updateLang)(req.userId, parsed.data);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.updateLang = updateLang;
