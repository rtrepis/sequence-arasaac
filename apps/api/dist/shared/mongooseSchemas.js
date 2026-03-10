"use strict";
// Sub-schemas Mongoose compartits entre múltiples models
// Centralitza les definicions de Font, Border i DefaultSettings
// per evitar duplicació entre auth/model i documents/model
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSettingsSchema = exports.borderSchema = exports.fontSchema = void 0;
const mongoose_1 = require("mongoose");
// Sub-schema per a Font (family, color, size)
exports.fontSchema = new mongoose_1.Schema({
    family: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: Number, required: true },
}, { _id: false });
// Sub-schema per a Border (color, radius, size)
exports.borderSchema = new mongoose_1.Schema({
    color: { type: String, required: true },
    radius: { type: Number, required: true },
    size: { type: Number, required: true },
}, { _id: false });
// Sub-schema per a DefaultSettingsPictSequence
const pictSequenceSettingsSchema = new mongoose_1.Schema({
    numbered: { type: Boolean, required: true },
    textPosition: {
        type: String,
        enum: ["top", "bottom", "none"],
        required: true,
    },
    font: { type: exports.fontSchema, required: true },
    numberFont: { type: exports.fontSchema, required: true },
    borderOut: { type: exports.borderSchema, required: true },
    borderIn: { type: exports.borderSchema, required: true },
}, { _id: false });
// Sub-schema per a DefaultSettingsPictAra
const pictApiAraSettingsSchema = new mongoose_1.Schema({
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
// Sub-schema per a DefaultSettings (pictSequence + pictApiAra)
exports.defaultSettingsSchema = new mongoose_1.Schema({
    pictSequence: { type: pictSequenceSettingsSchema, required: true },
    pictApiAra: { type: pictApiAraSettingsSchema, required: true },
}, { _id: false });
