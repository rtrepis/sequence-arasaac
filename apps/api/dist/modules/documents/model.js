"use strict";
// Model Mongoose per a documents SAAC
// Emmagatzema DocumentSAAC amb les seqüències de pictogrames de l'usuari
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDocument = exports.DocumentModel = void 0;
const mongoose_1 = require("mongoose");
const mongooseSchemas_1 = require("../../shared/mongooseSchemas");
// --- Sub-schemas específics del document ---
// Sub-schema per a Word
const wordSchema = new mongoose_1.Schema({
    word: { type: String, required: true },
    bestIdPicts: [{ type: Number }],
    keyWords: [{ type: String }],
}, { _id: false });
// Sub-schema per a PictApiAraSettings (tots els camps opcionals)
const pictApiAraSettingsDocSchema = new mongoose_1.Schema({
    hair: {
        type: String,
        enum: ["black", "blonde", "brown", "darkBrown", "gray", "darkGray", "red"],
    },
    skin: {
        type: String,
        enum: ["asian", "aztec", "black", "mulatto", "white"],
    },
    fitzgerald: { type: String },
    color: { type: Boolean },
}, { _id: false });
// Sub-schema per a PictApiAra (sense camp url — es regenera al frontend)
const pictApiAraDocSchema = new mongoose_1.Schema({
    searched: { type: wordSchema, required: true },
    selectedId: { type: Number, required: true },
    settings: { type: pictApiAraSettingsDocSchema, required: true },
}, { _id: false });
// Sub-schema per a PictSequenceSettings (tots els camps opcionals)
const pictSequenceSettingsDocSchema = new mongoose_1.Schema({
    numbered: { type: Boolean },
    textPosition: { type: String, enum: ["top", "bottom", "none"] },
    font: { type: mongooseSchemas_1.fontSchema },
    numberFont: { type: mongooseSchemas_1.fontSchema },
    fontSize: { type: Number },
    fontFamily: { type: String },
    borderOut: { type: mongooseSchemas_1.borderSchema },
    borderIn: { type: mongooseSchemas_1.borderSchema },
}, { _id: false });
// Sub-schema per a PictSequence
const pictSequenceDocSchema = new mongoose_1.Schema({
    indexSequence: { type: Number, required: true },
    img: { type: pictApiAraDocSchema, required: true },
    text: { type: String },
    cross: { type: Boolean, required: true },
    settings: { type: pictSequenceSettingsDocSchema, required: true },
}, { _id: false });
// Sub-schema per a SequenceViewSettings
const sequenceViewSettingsSchema = new mongoose_1.Schema({
    sizePict: { type: Number, required: true },
    pictSpaceBetween: { type: Number, required: true },
    alignment: {
        type: String,
        enum: ["left", "center", "right"],
        required: true,
    },
}, { _id: false });
// --- Esquema principal del document ---
const documentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: { type: String },
    // Map<string, PictSequence[]> — claus numèriques com a strings ("0", "1", ...)
    content: { type: Map, of: [pictSequenceDocSchema] },
    // Map<string, SequenceViewSettings>
    viewSettings: { type: Map, of: sequenceViewSettingsSchema },
    activeSAAC: { type: Number, required: true, default: 0 },
    order: [{ type: Number }],
    author: { type: String },
    defaultSettings: { type: mongooseSchemas_1.defaultSettingsSchema },
}, {
    timestamps: true,
    versionKey: false,
});
exports.DocumentModel = (0, mongoose_1.model)("Document", documentSchema);
// Converteix un document Mongoose a DocumentSAAC per a la resposta JSON
// flattenMaps: true transforma les Maps de Mongoose a objectes plans
const serializeDocument = (doc) => {
    const obj = doc.toObject({ flattenMaps: true });
    return {
        id: String(obj._id),
        title: obj.title,
        content: (obj.content ?? {}),
        viewSettings: (obj.viewSettings ?? {}),
        activeSAAC: obj.activeSAAC,
        order: obj.order,
        author: obj.author,
        defaultSettings: obj.defaultSettings,
    };
};
exports.serializeDocument = serializeDocument;
