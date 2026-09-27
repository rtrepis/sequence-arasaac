import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PictSequence,
  Sequence,
  PictSequenceApplyAll,
  PictSequenceSettingsForEdit,
  PictApiAraForEdit,
  PictApiAraSettingsApplyAll,
} from "@/types/sequence";
import {
  DocumentSAAC,
  SequenceStyle,
  SequenceStyleView,
  SequenceViewSettings,
} from "@/types/document";
import { DefaultSettings, ViewSettings } from "@/types/ui";
import {
  applyStyleToDocument,
  buildUserDefaultStyle,
  materializeDocumentStyle,
  pictStyleOf,
  resolveDocumentStyle,
  tabViewOf,
} from "@features/sequence/style/styleModel";
import { normalizeDocumentState } from "@features/sequence/style/saacFile";
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

// Un document nou no porta estil ni vista de pestanya: tots dos s'hereten de
// l'estil per defecte de l'usuari fins que es desa o se'n toca l'estil. Així
// neix amb l'estil de l'usuari encara que les preferències (les del compte, amb
// el servidor adormit) arribin després de crear-lo.
// Vegeu `docs/fonaments/sequencia-i-estil.md`.
const documentInitialState: DocumentSAAC = {
  id: getUniqueId(),
  title: undefined,
  content: { 0: [] },
  viewSettings: {},
  activeSAAC: 0,
  order: undefined,
  defaultSettings: undefined,
};

/**
 * El que els thunks del document necessiten de l'store. Es declara aquí i no
 * s'importa `RootState` perquè l'store importa aquest fitxer.
 */
interface StyleSourceState {
  document: DocumentSAAC;
  ui: { defaultSettings: DefaultSettings; viewSettings: ViewSettings };
}

const userDefaultStyleOf = (state: StyleSourceState): SequenceStyle =>
  buildUserDefaultStyle(state.ui.defaultSettings, state.ui.viewSettings);

// Thunk: carrega un document del backend per id (declarat abans del slice per poder-lo usar a extraReducers)
export const loadDocumentThunk = createAsyncThunk<
  DocumentSAAC,
  string,
  { rejectValue: string }
>("document/load", async (id, { getState, rejectWithValue }) => {
  let fetched: DocumentSAAC;
  try {
    fetched = await fetchDocument(id);
  } catch {
    return rejectWithValue("No s'ha pogut carregar el document");
  }
  // Mateixa lectura que un fitxer: els documents desats abans de l'esquema 2
  // no porten estil, i s'obren amb l'estil per defecte de qui els obre
  const normalized = normalizeDocumentState(fetched, {
    userDefault: userDefaultStyleOf(getState() as StyleSourceState),
  });
  return normalized?.document ?? fetched;
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
      // Els fitxers i el núvol arriben ja normalitzats (`saacFile.ts`); aquí
      // només hi passa a més l'esborrany, que pot ser d'un document nou i per
      // tant sense vista de pestanya: la pestanya sense vista hereta la de l'estil
      const doc = action.payload;
      if (!doc.viewSettings) doc.viewSettings = {};
      return doc;
    },

    changeActiveSAAC: (previousDocument, action: PayloadAction<number>) => {
      previousDocument.activeSAAC = action.payload;

      // Una pestanya nova no porta vista: segueix la de l'estil del document
      if (previousDocument.content[action.payload] === undefined)
        previousDocument.content[action.payload] = [];

      return previousDocument;
    },

    // Crea una nova seqüència buida amb la clau indicada sense canviar l'actiu
    addNewSequence: (previousDocument, action: PayloadAction<number>) => {
      previousDocument.content[action.payload] = [];
      delete previousDocument.viewSettings[action.payload];
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

    // Retoca la vista d'una seqüència concreta. `base` és la vista que té
    // ara (la seva o, si no en té, la de l'estil), perquè el reducer no sap
    // quin és l'estil per defecte de l'usuari
    updateSequenceViewSettings: (
      previousDocument,
      action: PayloadAction<{
        key: number;
        settings: Partial<SequenceViewSettings>;
        base: SequenceViewSettings;
      }>,
    ) => {
      const { key, settings, base } = action.payload;
      const current = previousDocument.viewSettings[key] ?? base;
      previousDocument.viewSettings[key] = { ...current, ...settings };
    },

    // Canvia la vista de totes les seqüències alhora: és tocar l'estil de la
    // seqüència, i per això també en mou la base. Les pestanyes que no tenen
    // vista pròpia la segueixen soles. `styleView` és la vista de l'estil que
    // té ara el document (la seva o la heretada)
    applyViewSettingsToAll: (
      previousDocument,
      action: PayloadAction<{
        settings: Partial<SequenceViewSettings>;
        styleView: SequenceStyleView;
      }>,
    ) => {
      const { settings, styleView } = action.payload;
      previousDocument.styleView = { ...styleView, ...settings };
      Object.keys(previousDocument.viewSettings).forEach((key) => {
        const current = previousDocument.viewSettings[Number(key)];
        previousDocument.viewSettings[Number(key)] = {
          ...current,
          ...settings,
        };
      });
    },

    // Espai entre seqüències: és part de l'estil del document
    setSequenceSpaceBetween: (
      previousDocument,
      action: PayloadAction<{ value: number; styleView: SequenceStyleView }>,
    ) => {
      previousDocument.styleView = {
        ...action.payload.styleView,
        sequenceSpaceBetween: action.payload.value,
      };
    },

    // Aplica un estil nou al document amb la regla dels retocs: el que
    // coincidia amb l'estil vell (`from`) segueix el nou, la resta es conserva
    applyDocumentStyle: (
      previousDocument,
      action: PayloadAction<{ from: SequenceStyle; to: SequenceStyle }>,
    ) => {
      applyStyleToDocument(
        previousDocument,
        action.payload.from,
        action.payload.to,
      );
    },

    // Desfà un canvi d'estil: torna el document a com era just abans
    restoreDocumentStyle: (
      previousDocument,
      action: PayloadAction<DocumentStyleSnapshot>,
    ) => {
      const { content, viewSettings, defaultSettings, styleView } =
        action.payload;
      previousDocument.content = content;
      previousDocument.viewSettings = viewSettings;
      previousDocument.defaultSettings = defaultSettings;
      previousDocument.styleView = styleView;
    },

    // Fa explícit l'estil que el document heretava, en desar-lo: el que s'ha
    // desat ja no ha de canviar si després canvia l'estil per defecte. No
    // canvia res del que es veu, i per això no és un canvi de contingut
    documentStyleMaterialized: (
      previousDocument,
      action: PayloadAction<SequenceStyle>,
    ) => {
      // Només s'omple el que falta: el que ja hi era no es reescriu, perquè
      // un canvi de referència faria creure que el document s'ha tocat (i, per
      // exemple, ja no es podria desfer l'últim canvi d'estil)
      const style = action.payload;
      if (previousDocument.defaultSettings === undefined)
        previousDocument.defaultSettings = pictStyleOf(style);
      if (previousDocument.styleView === undefined)
        previousDocument.styleView = style.view;
      const tabBase = tabViewOf(previousDocument.styleView);
      Object.keys(previousDocument.content).forEach((key) => {
        if (previousDocument.viewSettings[Number(key)] === undefined)
          previousDocument.viewSettings[Number(key)] = { ...tabBase };
      });
    },

    // Actualitza l'id del document (s'usa després de desar per primera vegada al backend)
    // Treu una imatge del núvol del document obert.
    //
    // La crida el gestor d'imatges del compte quan la imatge esborrada és d'una
    // seqüència que l'usuari té a pantalla: al núvol ja no hi és, i sense això
    // el document que s'està editant continuaria apuntant a una URL morta —i el
    // desat següent la tornaria a desar.
    removeCloudImage: (previousDocument, action: PayloadAction<string>) => {
      Object.values(previousDocument.content).forEach((sequence) => {
        sequence.forEach((pict) => {
          if (pict.img.url === action.payload) pict.img.url = undefined;
        });
      });
    },

    // Adopta la imatge nova quan una del núvol s'ha canviat de mida.
    //
    // Reduir una imatge al núvol vol dir pujar-ne una altra i esborrar la
    // vella: la URL canvia, i el document obert es quedaria apuntant a una
    // imatge que ja no existeix. Com `removeCloudImage`, no és un canvi de
    // contingut —la còpia de fora no s'ha quedat enrere, s'ha avançat.
    replaceCloudImage: (
      previousDocument,
      action: PayloadAction<{ from: string; to: string }>,
    ) => {
      Object.values(previousDocument.content).forEach((sequence) => {
        sequence.forEach((pict) => {
          if (pict.img.url === action.payload.from) {
            pict.img.url = action.payload.to;
          }
        });
      });
    },

    setDocumentId: (previousDocument, action: PayloadAction<string>) => {
      previousDocument.id = action.payload;
    },

    // Nom del document, tal com el tria l'usuari en desar-lo al núvol.
    // Viu al document i no al modal perquè sobreviu a l'esborrany (IndexedDB) i
    // al fitxer .saac: qui torna l'endemà retroba el nom que li havia posat.
    setDocumentTitle: (previousDocument, action: PayloadAction<string>) => {
      previousDocument.title = action.payload;
    },

    // Document nou: contingut buit, títol i id nous, i sense estil propi: el
    // torna a heretar de l'estil per defecte de l'usuari, que és el que ha de
    // rebre una seqüència nova.
    resetDocument: () => ({
      id: getUniqueId(),
      title: undefined,
      content: { 0: [] },
      viewSettings: {},
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
      return action.payload;
    });
  },
});

export const documentReducer = documentSlice.reducer;

/** El que toca un canvi d'estil, per poder-lo desfer. */
export interface DocumentStyleSnapshot {
  content: DocumentSAAC["content"];
  viewSettings: DocumentSAAC["viewSettings"];
  defaultSettings: DocumentSAAC["defaultSettings"];
  styleView: DocumentSAAC["styleView"];
}

export const takeDocumentStyleSnapshot = (
  document: DocumentSAAC,
): DocumentStyleSnapshot => ({
  content: document.content,
  viewSettings: document.viewSettings,
  defaultSettings: document.defaultSettings,
  styleView: document.styleView,
});

/**
 * El document tal com s'ha d'enviar a fora: amb l'estil que fa servir. Si
 * l'heretava, a partir d'ara el té propi.
 */
export const selectDocumentToSave = (state: StyleSourceState): DocumentSAAC =>
  materializeDocumentStyle(
    state.document,
    resolveDocumentStyle(state.document, userDefaultStyleOf(state)),
  );

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
  async (
    { document: requested, asCopy = false },
    { dispatch, getState, rejectWithValue },
  ) => {
    try {
      // Desar al núvol també inclou sempre l'estil: si el document l'heretava,
      // se li escriu el que fa servir ara
      const state = getState() as StyleSourceState;
      const doc = materializeDocumentStyle(
        requested,
        resolveDocumentStyle(requested, userDefaultStyleOf(state)),
      );
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
  setSequenceSpaceBetween: setSequenceSpaceBetweenActionCreator,
  applyDocumentStyle: applyDocumentStyleActionCreator,
  restoreDocumentStyle: restoreDocumentStyleActionCreator,
  documentStyleMaterialized: documentStyleMaterializedActionCreator,
  deleteLastSequence: deleteLastSequenceActionCreator,
  removeCloudImage: removeCloudImageActionCreator,
  replaceCloudImage: replaceCloudImageActionCreator,
  setDocumentId: setDocumentIdActionCreator,
  setDocumentTitle: setDocumentTitleActionCreator,
} = documentSlice.actions;
