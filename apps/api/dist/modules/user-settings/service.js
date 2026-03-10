"use strict";
// Lògica de negoci del mòdul de user-settings
// Cap dependència d'Express — treballa únicament amb UserModel
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLang = exports.updateSettings = exports.getSettings = void 0;
const model_1 = require("../auth/model");
// Retorna els settings i langSettings de l'usuari autenticat
const getSettings = async (userId) => {
    const user = await model_1.UserModel.findById(userId).select("settings langSettings");
    if (!user) {
        const error = new Error("Usuari no trobat");
        error.statusCode = 404;
        throw error;
    }
    return {
        settings: user.settings,
        langSettings: user.langSettings,
    };
};
exports.getSettings = getSettings;
// Actualitza els DefaultSettings de l'usuari
const updateSettings = async (userId, settings) => {
    const user = await model_1.UserModel.findByIdAndUpdate(userId, { $set: { settings } }, { new: true, runValidators: true }).select("settings");
    if (!user) {
        const error = new Error("Usuari no trobat");
        error.statusCode = 404;
        throw error;
    }
    return { settings: user.settings };
};
exports.updateSettings = updateSettings;
// Actualitza els langSettings de l'usuari
const updateLang = async (userId, lang) => {
    const user = await model_1.UserModel.findByIdAndUpdate(userId, { $set: { langSettings: lang } }, { new: true }).select("langSettings");
    if (!user) {
        const error = new Error("Usuari no trobat");
        error.statusCode = 404;
        throw error;
    }
    return { langSettings: user.langSettings };
};
exports.updateLang = updateLang;
