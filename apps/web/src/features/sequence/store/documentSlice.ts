import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PictSequence,
  Sequence,
  PictSequenceApplyAll,
  PictSequenceSettingsForEdit,
  PictApiAraForEdit,
  PictApiAraSettingsApplyAll,
} from "@/types/sequence";
import { DocumentSAAC, SequenceViewSettings } from "@/types/document";
import {
  SEQ_VIEW_DEFAULT_SIZE_PICT,
  SEQ_VIEW_DEFAULT_PICT_SPACE,
  SEQ_VIEW_DEFAULT_ALIGNMENT_H,
  SEQ_VIEW_DEFAULT_ALIGNMENT_V,
} from "@/configs/viewSettingsConfig";
import {
  createDocument,
  updateDocument,
  fetchDocument,
  listDocuments,
  isMongoId,
  DocumentSummary,
} from "@features/backend/documents/services/documentService";
import { classifyRequestFailure } from "@features/backend/api/requestFailure";
import { clearDraft } from "@features/sequence/storage/draftStorage";
import { documentStatusClearedActionCreator } from "@features/sequence/store/documentStatusSlice";
import { reportClientError } from "@features/backend/api/clientErrorReport";

const getUniqueId = () => {
  const randomString = Math.random().toString(36).substring(2, 9);
  const timeStamp = Date.now();
  const uniqueId = `${randomString}-${timeStamp}`;
  return uniqueId;
};

export const DEFAULT_SEQUENCE_VIEW: SequenceViewSettings = {
  sizePict: SEQ_VIEW_DEFAULT_SIZE_PICT,
  pictSpaceBetween: SEQ_VIEW_DEFAULT_PICT_SPACE,
  alignmentH: SEQ_VIEW_DEFAULT_ALIGNMENT_H,
  alignmentV: SEQ_VIEW_DEFAULT_ALIGNMENT_V,
};

const documentInitialState: DocumentSAAC = {
  id: getUniqueId(),
  title: undefined,
  content: { 0: [] },
  viewSettings: { 0: { ...DEFAULT_SEQUENCE_VIEW } },
  activeSAAC: 0,
  order: undefined,
  defaultSettings: undefined,
};

// Thunk: carrega un document del backend per id (declarat abans del slice per poder-lo usar a extraReducers)
export const loadDocumentThunk = createAsyncThunk<
  DocumentSAAC,
  string,
  { rejectValue: string }
>("document/load", async (id, { rejectWithValue }) => {
  try {
    return await fetchDocument(id);
  } catch {
    return rejectWithValue("No s'ha pogut carregar el document");
  }
});

const documentSlice = createSlice({
  name: "document",
  initialState: documentInitialState,
  reducers: {
    // Compatibilitat amb fitxers antics: si no tenen viewSettings, crear-ne per cada seqüència
    loadDocumentSaac: (
      previousDocument,
      action: PayloadAction<DocumentSAAC>,
    ) => {
      const doc = action.payload;
      if (!doc.viewSettings) {
        doc.viewSettings = {};
        Object.keys(doc.content).forEach((key) => {
          doc.viewSettings[Number(key)] = { ...DEFAULT_SEQUENCE_VIEW };
        });
      }
      return doc;
    },

    changeActiveSAAC: (previousDocument, action: PayloadAction<number>) => {
      previousDocument.activeSAAC = action.payload;

      if (previousDocument.content[action.payload] === undefined)
        previousDocument.content[action.payload] = [];

      if (previousDocument.viewSettings[action.payload] === undefined)
        previousDocument.viewSettings[action.payload] = {
          ...DEFAULT_SEQUENCE_VIEW,
        };

      return previousDocument;
    },

    // Crea una nova seqüència buida amb la clau indicada sense canviar l'actiu
    addNewSequence: (previousDocument, action: PayloadAction<number>) => {
      previousDocument.content[action.payload] = [];
      previousDocument.viewSettings[action.payload] = {
        ...DEFAULT_SEQUENCE_VIEW,
      };
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
      const allSequences = Object.values(previousDocument.content);

      allSequences.forEach((sequence) => {
        if (action.payload.skin)
          sequence.forEach((p) => (p.img.settings.skin = action.payload.skin));

        if (action.payload.hair)
          sequence.forEach((p) => (p.img.settings.hair = action.payload.hair));

        // Comprovació explícita: `color: false` és un valor vàlid (pictograma B/N)
        if (action.payload.color !== undefined)
          sequence.forEach(
            (p) => (p.img.settings.color = action.payload.color),
          );
      });
    },

    pictSequenceApplyAll: (
      previousDocument,
      action: PayloadAction<PictSequenceApplyAll>,
    ) => {
      const allSequences = Object.values(previousDocument.content);

      allSequences.forEach((sequence) => {
        if (action.payload.textPosition)
          sequence.forEach(
            (p) => (p.settings.textPosition = action.payload.textPosition),
          );

        if (action.payload.fontFamily)
          sequence.forEach(
            (p) => (p.settings.fontFamily = action.payload.fontFamily),
          );
      });
    },

    borderInApplyAll: (
      previousDocument,
      action: PayloadAction<PictSequenceApplyAll>,
    ) => {
      Object.values(previousDocument.content).forEach((sequence) =>
        sequence.forEach((p) => (p.settings.borderIn = action.payload.borderIn!)),
      );
    },

    borderOutApplyAll: (
      previousDocument,
      action: PayloadAction<PictSequenceApplyAll>,
    ) => {
      Object.values(previousDocument.content).forEach((sequence) =>
        sequence.forEach(
          (p) => (p.settings.borderOut = action.payload.borderOut!),
        ),
      );
    },

    fontSizeApplyAll: (
      previousDocument,
      action: PayloadAction<PictSequenceApplyAll>,
    ) => {
      Object.values(previousDocument.content).forEach((sequence) =>
        sequence.forEach((p) => (p.settings.fontSize = action.payload.fontSize)),
      );
    },

    // Actualitza viewSettings d'una seqüència concreta
    updateSequenceViewSettings: (
      previousDocument,
      action: PayloadAction<{
        key: number;
        settings: Partial<SequenceViewSettings>;
      }>,
    ) => {
      const { key, settings } = action.payload;
      const current =
        previousDocument.viewSettings[key] ?? DEFAULT_SEQUENCE_VIEW;
      previousDocument.viewSettings[key] = { ...current, ...settings };
    },

    // Aplica viewSettings a totes les seqüències
    applyViewSettingsToAll: (
      previousDocument,
      action: PayloadAction<Partial<SequenceViewSettings>>,
    ) => {
      const keys = Object.keys(previousDocument.content).map(Number);
      keys.forEach((key) => {
        const current =
          previousDocument.viewSettings[key] ?? DEFAULT_SEQUENCE_VIEW;
        previousDocument.viewSettings[key] = { ...current, ...action.payload };
      });
    },

    // Actualitza l'id del document (s'usa després de desar per primera vegada al backend)
    setDocumentId: (previousDocument, action: PayloadAction<string>) => {
      previousDocument.id = action.payload;
    },

    // Nom del document, tal com el tria l'usuari en desar-lo al núvol.
    // Viu al document i no al modal perquè sobreviu a l'esborrany (IndexedDB) i
    // al fitxer .saac: qui torna l'endemà retroba el nom que li havia posat.
    setDocumentTitle: (previousDocument, action: PayloadAction<string>) => {
      previousDocument.title = action.payload;
    },

    // Document nou: contingut buit, títol i id nous. La configuració per
    // defecte no s'hi toca — és de l'usuari, no del document, i qui comença un
    // treball nou no vol tornar a triar la lletra i les vores.
    resetDocument: () => ({
      id: getUniqueId(),
      title: undefined,
      content: { 0: [] },
      viewSettings: { 0: { ...DEFAULT_SEQUENCE_VIEW } },
      activeSAAC: 0,
      order: undefined,
      defaultSettings: undefined,
    }),

    // Elimina la darrera seqüència
    deleteLastSequence: (previousDocument) => {
      const keys = Object.keys(previousDocument.content);
      if (keys.length > 1) {
        const lastKey = keys[keys.length - 1];
        delete previousDocument.content[Number(lastKey)];
        delete previousDocument.viewSettings[Number(lastKey)];

        // Si la seqüència activa és la que s'ha eliminat, canviar a la penúltima
        if (previousDocument.activeSAAC === Number(lastKey)) {
          const remainingKeys = Object.keys(previousDocument.content);
          const lastRemainingKey = remainingKeys[remainingKeys.length - 1];
          previousDocument.activeSAAC = Number(lastRemainingKey);
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Quan el thunk de càrrega acaba, actualitza el document al store
    builder.addCase(loadDocumentThunk.fulfilled, (state, action) => {
      const doc = action.payload;
      if (!doc.viewSettings) {
        doc.viewSettings = {};
        Object.keys(doc.content).forEach((key) => {
          doc.viewSettings[Number(key)] = { ...DEFAULT_SEQUENCE_VIEW };
        });
      }
      return doc;
    });
  },
});

export const documentReducer = documentSlice.reducer;

/**
 * Desa el document al backend: PUT si ja té id de MongoDB, POST si no.
 * Actualitza el Redux amb el document retornat perquè les URLs base64 es
 * substitueixin per URLs de Cloudinary.
 *
 * Amb `asCopy`, el POST es força encara que el document ja sigui al núvol: és
 * el «Desa'n una còpia». L'id nou el porta la resposta i el recull el mateix
 * `loadDocumentSaac` de sempre, de manera que a partir d'aquell moment es
 * treballa sobre la còpia i l'original es queda tal com estava — que és
 * justament el que es demana en desar-ne una.
 */
export const saveDocumentThunk = createAsyncThunk<
  string,
  { document: DocumentSAAC; asCopy?: boolean },
  { rejectValue: string }
>(
  "document/save",
  async ({ document: doc, asCopy = false }, { dispatch, rejectWithValue }) => {
    try {
      const { id, ...payload } = doc;
      if (isMongoId(id) && !asCopy) {
        const updated = await updateDocument(id, payload);
        dispatch(documentSlice.actions.loadDocumentSaac(updated));
        return id;
      } else {
        const saved = await createDocument(payload);
        dispatch(documentSlice.actions.loadDocumentSaac(saved));
        return saved.id;
      }
    } catch (error: unknown) {
      // Es propaga el codi semàntic del backend, no un text fix: qui no pot desar
      // ha de saber per què (correu sense verificar, quota exhaurida) i què hi pot fer.
      // La traducció la fa qui mostra el missatge.
      const failure = classifyRequestFailure(error);
      const errorCode =
        (error as { response?: { data?: { errorCode?: string } } })?.response
          ?.data?.errorCode ?? "DOCUMENT_SAVE_ERROR";

      // Desar una seqüència és el que més li importa a l'usuari: si no ho aconsegueix,
      // val més saber-ho encara que la causa sigui passatgera i no es repeteixi.
      void reportClientError("document-save", { ...failure, code: errorCode });
      return rejectWithValue(errorCode);
    }
  },
);

// Thunk: comença un document nou.
//
// És l'única porta al reducer `resetDocument`, i per això no se n'exporta el
// creador d'acció: buidar la pantalla sense esborrar l'esborrany deixaria la
// feina antiga a punt de ressuscitar al primer refresc.
export const startNewDocumentThunk = createAsyncThunk<void, void>(
  "document/startNew",
  async (_, { dispatch }) => {
    dispatch(documentSlice.actions.resetDocument());
    dispatch(documentStatusClearedActionCreator());
    await clearDraft();
  },
);

// Thunk: obté la llista de documents de l'usuari del backend
export const listDocumentsThunk = createAsyncThunk<
  DocumentSummary[],
  void,
  { rejectValue: string }
>("document/list", async (_, { rejectWithValue }) => {
  try {
    return await listDocuments();
  } catch {
    return rejectWithValue("No s'ha pogut obtenir la llista de documents");
  }
});

export const {
  loadDocumentSaac: loadDocumentSaacActionCreator,
  changeActiveSAAC: changeActiveSAACActionCreator,
  addNewSequence: addNewSequenceActionCreator,
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
  updateSequenceViewSettings: updateSequenceViewSettingsActionCreator,
  applyViewSettingsToAll: applyViewSettingsToAllActionCreator,
  deleteLastSequence: deleteLastSequenceActionCreator,
  setDocumentId: setDocumentIdActionCreator,
  setDocumentTitle: setDocumentTitleActionCreator,
} = documentSlice.actions;
