// Sub-schemas Mongoose compartits entre múltiples models
// Centralitza les definicions de Font, Border i DefaultSettings
// per evitar duplicació entre auth/model i documents/model

import { Schema } from "mongoose";

// Sub-schema per a Font (family, color, size)
export const fontSchema = new Schema(
  {
    family: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

// Sub-schema per a Border (color, radius, size)
export const borderSchema = new Schema(
  {
    color: { type: String, required: true },
    radius: { type: Number, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

// Sub-schema per a DefaultSettingsPictSequence
const pictSequenceSettingsSchema = new Schema(
  {
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
  },
  { _id: false }
);

// Sub-schema per a DefaultSettingsPictAra
const pictApiAraSettingsSchema = new Schema(
  {
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
  },
  { _id: false }
);

// Sub-schema per a DefaultSettings (pictSequence + pictApiAra)
export const defaultSettingsSchema = new Schema(
  {
    pictSequence: { type: pictSequenceSettingsSchema, required: true },
    pictApiAra: { type: pictApiAraSettingsSchema, required: true },
  },
  { _id: false }
);
