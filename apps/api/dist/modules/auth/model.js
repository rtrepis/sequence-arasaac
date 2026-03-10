"use strict";
// Model Mongoose per a l'usuari
// Defineix l'esquema complet amb sub-schemas explícits per a cada sub-document
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
// --- Sub-schemas explícits (sense Schema.Types.Mixed) ---
// Sub-schema per a Font
const fontSchema = new mongoose_1.Schema({
    family: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: Number, required: true },
}, { _id: false });
// Sub-schema per a Border
const borderSchema = new mongoose_1.Schema({
    color: { type: String, required: true },
    radius: { type: Number, required: true },
    size: { type: Number, required: true },
}, { _id: false });
// Sub-schema per a DefaultSettingsPictSequence
const pictSequenceSchema = new mongoose_1.Schema({
    numbered: { type: Boolean, required: true },
    textPosition: {
        type: String,
        enum: ["top", "bottom", "none"],
        required: true,
    },
    font: { type: fontSchema, required: true },
    numberFont: { type: fontSchema, required: true },
    borderOut: { type: borderSchema, required: true },
    borderIn: { type: borderSchema, required: true },
}, { _id: false });
// Sub-schema per a DefaultSettingsPictAra
const pictApiAraSchema = new mongoose_1.Schema({
    hair: {
        type: String,
        enum: ["black", "blonde", "brown", "darkBrown", "gray", "darkGray", "red"],
        required: true,
    },
    skin: {
        type: String,
        enum: ["asian", "aztec", "black", "mulatto", "white"],
        required: true,
    },
    fitzgerald: { type: String, required: true },
    color: { type: Boolean, required: true },
}, { _id: false });
// Sub-schema per a DefaultSettings
const defaultSettingsSchema = new mongoose_1.Schema({
    pictSequence: { type: pictSequenceSchema, required: true },
    pictApiAra: { type: pictApiAraSchema, required: true },
}, { _id: false });
// Sub-schema per a langSettings
const langSettingsSchema = new mongoose_1.Schema({
    app: { type: String, enum: ["ca", "en", "es"], required: true },
    search: { type: String, required: true },
}, { _id: false });
// --- Valors per defecte per a nous usuaris ---
// Coherents amb els valors inicials de uiSlice al frontend
const DEFAULT_SETTINGS = {
    pictSequence: {
        numbered: false,
        textPosition: "bottom",
        font: {
            family: "Roboto",
            color: "#000000",
            size: 1.0,
        },
        numberFont: {
            family: "Roboto",
            color: "#000000",
            size: 1.0,
        },
        borderOut: {
            color: "#000000",
            radius: 4,
            size: 2,
        },
        borderIn: {
            color: "#000000",
            radius: 4,
            size: 0,
        },
    },
    pictApiAra: {
        hair: "brown",
        skin: "white",
        fitzgerald: "#FFCD94",
        color: true,
    },
};
// --- Esquema principal de l'usuari ---
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    settings: {
        type: defaultSettingsSchema,
        required: true,
        // Arrow function per evitar que Mongoose comparteixi la mateixa referència entre documents
        default: () => DEFAULT_SETTINGS,
    },
    langSettings: {
        type: langSettingsSchema,
        required: true,
        default: () => ({ app: "ca", search: "ca" }),
    },
}, {
    timestamps: true, // afegeix createdAt i updatedAt automàticament
    versionKey: false, // elimina el camp __v dels documents
});
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
