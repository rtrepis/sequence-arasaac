import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PictSequence,
  Sequence,
  PictSequenceApplyAll,
  PictSequenceSettingsForEdit,
  PictApiAraForEdit,
  PictApiAraSettingsApplyAll,
} from "../../types/sequence";
import { DocumentSAAC } from "@/types/document";
import { useActionData } from "react-router-dom";

const getUniqueId = () => {
  const randomString = Math.random().toString(36).substring(2, 9);
  const timeStamp = Date.now();
  const uniqueId = `${randomString}-${timeStamp}`;
  return uniqueId;
};

const documentInitialState: DocumentSAAC = {
  id: getUniqueId(),
  title: undefined,
  content: { 0: [] },
  activeSAAC: 0,
  order: undefined,
  defaultSettings: undefined,
};
const documentSlice = createSlice({
  name: "document",
  initialState: documentInitialState,
  reducers: {
    loadDocumentSaac: (previousDocument, action: PayloadAction<DocumentSAAC>) =>
      action.payload,

    changeActiveSAAC: (previousDocument, action: PayloadAction<number>) => {
      previousDocument.activeSAAC = action.payload;

      if (previousDocument.content[action.payload] === undefined)
        previousDocument.content[action.payload] = [];

      return previousDocument;
    },

    addPictogram: (previousDocument, action: PayloadAction<PictSequence>) => {
      previousDocument.content[previousDocument.activeSAAC] = [
        ...previousDocument.content[previousDocument.activeSAAC],
        action.payload,
      ];
    },

    insertPictogram: (
      previousDocument,
      action: PayloadAction<PictSequence>,
    ) => {
      previousDocument.content[previousDocument.activeSAAC].splice(
        action.payload.indexSequence,
        0,
        action.payload,
      );
    },

    subtractPictogram: (previousDocument, action: PayloadAction<number>) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac] = previousDocument.content[saac].filter(
        (pictogram) => pictogram.indexSequence !== action.payload,
      );
    },

    subtractLastPict: (previousDocument) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac] = previousDocument.content[saac].slice(
        0,
        -1,
      );
    },

    addSequence: (previousDocument, action: PayloadAction<Sequence>) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac] = action.payload;
    },

    renumberSequence: (previousDocument) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac] = previousDocument.content[saac].map(
        (pictogram, index) => ({
          ...pictogram,
          indexSequence: index,
        }),
      );
    },

    sortSequence: (previousDocument) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac].sort(
        (a, b) => a.indexSequence - b.indexSequence,
      );
    },

    selectedId: (
      previousDocument,
      action: PayloadAction<PictApiAraForEdit>,
    ) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac].map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.img.selectedId = action.payload.selectedId!),
      );
    },

    searched: (previousDocument, action: PayloadAction<PictApiAraForEdit>) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac].map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.img.searched = action.payload.searched!),
      );
    },

    updatePictSequence: (
      previousDocument,
      action: PayloadAction<PictSequence>,
    ) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac] = previousDocument.content[saac].map(
        (pictogram, index) =>
          index === action.payload.indexSequence ? action.payload : pictogram,
      );
    },

    settingsPictApiAra: (
      previousDocument,
      action: PayloadAction<PictApiAraForEdit>,
    ) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac].map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.img.settings = action.payload.settings!),
      );
    },

    settingsPictSequence: (
      previousDocument,
      action: PayloadAction<PictSequenceSettingsForEdit>,
    ) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac].map(
        (pictogram, index) =>
          index === action.payload.indexSequence &&
          (pictogram.settings = action.payload),
      );
    },

    pictAraSettingsApplyAll: (
      previousDocument,
      action: PayloadAction<PictApiAraSettingsApplyAll>,
    ) => {
      const saac = previousDocument.activeSAAC;
      const sequence = previousDocument.content[saac];

      if (action.payload.skin)
        sequence.map((p) => (p.img.settings.skin = action.payload.skin));

      if (action.payload.hair)
        sequence.map((p) => (p.img.settings.hair = action.payload.hair));

      if (action.payload.color)
        sequence.map((p) => (p.img.settings.color = action.payload.color));
    },

    pictSequenceApplyAll: (
      previousDocument,
      action: PayloadAction<PictSequenceApplyAll>,
    ) => {
      const saac = previousDocument.activeSAAC;
      const sequence = previousDocument.content[saac];

      if (action.payload.textPosition)
        sequence.map(
          (p) => (p.settings.textPosition = action.payload.textPosition),
        );

      if (action.payload.fontFamily)
        sequence.map(
          (p) => (p.settings.fontFamily = action.payload.fontFamily),
        );
    },

    borderInApplyAll: (
      previousDocument,
      action: PayloadAction<PictSequenceApplyAll>,
    ) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac].map(
        (p) => (p.settings.borderIn = action.payload.borderIn!),
      );
    },

    borderOutApplyAll: (
      previousDocument,
      action: PayloadAction<PictSequenceApplyAll>,
    ) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac].map(
        (p) => (p.settings.borderOut = action.payload.borderOut!),
      );
    },

    fontSizeApplyAll: (
      previousDocument,
      action: PayloadAction<PictSequenceApplyAll>,
    ) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac].map(
        (p) => (p.settings.fontSize = action.payload.fontSize),
      );
    },
  },
});

export const documentReducer = documentSlice.reducer;

export const {
  loadDocumentSaac: loadDocumentSaacActionCreator,
  changeActiveSAAC: changeActiveSAACActionCreator,
  addPictogram: addPictogramActionCreator,
  insertPictogram: insertPictogramActionCreator,
  subtractPictogram: subtractPictogramActionCreator,
  subtractLastPict: subtractLastPictActionCreator,
  addSequence: addSequenceActionCreator,
  renumberSequence: renumberSequenceActionCreator,
  sortSequence: sortSequenceActionCreator,
  updatePictSequence: updatePictSequenceActionCreator,
  selectedId: selectedIdActionCreator,
  searched: searchedActionCreator,
  pictAraSettingsApplyAll: pictAraSettingsApplyAllActionCreator,
  pictSequenceApplyAll: pictSequenceApplyAllActionCreator,
  borderInApplyAll: borderInApplyAllActionCreator,
  borderOutApplyAll: borderOutApplyAllActionCreator,
  fontSizeApplyAll: fontSizeApplyAllActionCreator,
  settingsPictApiAra: settingsPictApiAraActionCreator,
  settingsPictSequence: settingsPictSequenceActionCreator,
} = documentSlice.actions;
