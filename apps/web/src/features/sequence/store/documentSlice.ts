import {
  createAsyncThunk,
  createSlice,
  Dispatch,
  PayloadAction,
} from "@reduxjs/toolkit";
import {
  PictSequence,
  Sequence,
  PictSequenceSettingsForEdit,
  PictApiAraForEdit,
  SaacExtraFields,
} from "@/types/sequence";
import {
  DocumentLayout,
  DocumentPages,
  DocumentSAAC,
  NamedStyle,
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
import { parseSaacValue } from "@features/sequence/saac/parse";
import {
  parseContextOf,
  userPageOf,
} from "@features/sequence/saac/saacContext";
import { newSaacId } from "@features/sequence/saac/serialize";
import {
  documentFromLegacyPictograms,
  documentToLegacyPictograms,
} from "@features/sequence/style/pictogramStyle";
import { DEFAULT_FITZGERALD_CATEGORY_COLORS } from "@features/sequence/saac/fitzgerald";
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
import { removeSequencePlacements } from "@features/free-layout/model/sheets";
import { addNewSequenceToPages } from "@features/free-layout/model/pages";
import { removeSequenceFromDocument } from "@features/sequence/utils/removeSequence";

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
// Vegeu `docs/fonaments/03-model-contingut-estil.md`.
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

/**
 * L'autor per defecte de l'usuari: el que hereta un document nou mentre no en
 * té cap de propi, com la pàgina (B21).
 */
export const userAuthorOf = (state: StyleSourceState): string =>
  state.ui.viewSettings.author ?? "";

/** La pàgina per defecte de l'usuari, amb la forma de `DocumentSAAC.layout`. */
export const userLayoutOf = (state: StyleSourceState): DocumentLayout => {
  const { size, orientation, direction } = userPageOf(state);
  return { pageSize: size, orientation, direction };
};

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
  // Mateixa lectura que un fitxer (`features/sequence/saac/parse.ts`): el
  // núvol conserva la forma de l'API, i el document es migra en llegir-lo. Els
  // documents desats abans no porten estil ni pàgina, i s'obren amb els de qui
  // els obre
  const parsed = parseSaacValue(
    { documentState: fetched },
    parseContextOf(getState() as StyleSourceState),
  );
  if (parsed.kind !== "document") return fetched;
  // L'id és el de MongoDB: si el document no en portava, és el de la petició
  return { ...parsed.document, id: fetched.id || id };
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

    // Crea una nova seqüència buida amb la clau indicada sense canviar l'actiu.
    // Si el document té pàgines i l'última és automàtica, hi va al final
    // (ADR-005): l'identificador del bloc es fa fora del reductor
    addNewSequence: {
      reducer: (
        previousDocument,
        action: PayloadAction<number, string, { blockId: string }>,
      ) => {
        previousDocument.content[action.payload] = [];
        delete previousDocument.viewSettings[action.payload];
        // Una seqüència nova no té nom ni estil propi: fa servir el del document
        delete previousDocument.sequenceNames?.[action.payload];
        delete previousDocument.sequenceStyleIds?.[action.payload];
        if (previousDocument.pages)
          previousDocument.pages = addNewSequenceToPages(
            previousDocument.pages,
            action.payload,
            () => action.meta.blockId,
          );
      },
      prepare: (key: number) => ({
        payload: key,
        meta: { blockId: newSaacId("pl") },
      }),
    },

    // Els pictogrames nous reben l'identificador del fitxer v3 en néixer: així
    // és el mateix a cada desat
    addPictogram: {
      reducer: (previousDocument, action: PayloadAction<PictSequence>) => {
        previousDocument.content[previousDocument.activeSAAC] = [
          ...previousDocument.content[previousDocument.activeSAAC],
          action.payload,
        ];
      },
      prepare: (pictogram: PictSequence) => ({
        payload: { ...pictogram, id: pictogram.id ?? newSaacId("p") },
      }),
    },

    // Un pictograma enganxat en porta un de nou: el de l'original ja hi és
    insertPictogram: {
      reducer: (previousDocument, action: PayloadAction<PictSequence>) => {
        previousDocument.content[previousDocument.activeSAAC].splice(
          action.payload.indexSequence,
          0,
          action.payload,
        );
      },
      prepare: (pictogram: PictSequence) => ({
        payload: { ...pictogram, id: newSaacId("p") },
      }),
    },

    subtractPictogram: (previousDocument, action: PayloadAction<number>) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac] = previousDocument.content[saac].filter(
        (pictogram) => pictogram.indexSequence !== action.payload,
      );
    },

    // Canvia de lloc un pictograma dins de la seqüència activa i renumera,
    // perquè `indexSequence` continuï sent la posició
    movePictogram: (
      previousDocument,
      action: PayloadAction<{ from: number; to: number }>,
    ) => {
      const saac = previousDocument.activeSAAC;
      const sequence = previousDocument.content[saac];
      const { from, to } = action.payload;
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= sequence.length ||
        to >= sequence.length
      )
        return;
      const [moved] = sequence.splice(from, 1);
      sequence.splice(to, 0, moved);
      sequence.forEach((pictogram, index) => {
        pictogram.indexSequence = index;
      });
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

    // Els pictogrames d'una seqüència, sencers (B35: «Restableix els
    // pictogrames d'aquesta seqüència», que no ha de ser l'activa)
    sequencePictogramsReplaced: (
      previousDocument,
      action: PayloadAction<{ key: number; pictograms: PictSequence[] }>,
    ) => {
      previousDocument.content[action.payload.key] = action.payload.pictograms;
    },

    settingsPictApiAra: (
      previousDocument,
      action: PayloadAction<PictApiAraForEdit>,
    ) => {
      const saac = previousDocument.activeSAAC;
      previousDocument.content[saac].forEach((pictogram, index) => {
        if (index !== action.payload.indexSequence) return;
        pictogram.img.settings = action.payload.settings!;
        if (action.payload.variants !== undefined)
          pictogram.img.variants = action.payload.variants;
        // Un altre pictograma d'ARASAAC pot ser d'una altra categoria
        if (action.payload.category !== undefined)
          pictogram.img.category = action.payload.category;
      });
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

    // «Aplica a tots»: canvia l'estil del document i treu aquestes propietats
    // dels retocs de tots els pictogrames (fonament 03, §5), que així les
    // hereten. `base` és l'estil que té ara el document (el seu o l'heretat)
    pictStyleAppliedToAll: (
      previousDocument,
      action: PayloadAction<{
        patch: {
          pictApiAra?: Partial<DefaultSettings["pictApiAra"]>;
          pictSequence?: Partial<DefaultSettings["pictSequence"]>;
        };
        base: DefaultSettings;
      }>,
    ) => {
      const { patch, base } = action.payload;
      previousDocument.defaultSettings = {
        pictApiAra: { ...base.pictApiAra, ...patch.pictApiAra },
        pictSequence: { ...base.pictSequence, ...patch.pictSequence },
      };

      Object.values(previousDocument.content).forEach((sequence) =>
        sequence.forEach((pict: PictSequence) => {
          Object.entries(patch.pictApiAra ?? {}).forEach(([key, value]) => {
            if (value !== undefined)
              delete (pict.img.settings as Record<string, unknown>)[key];
          });
          Object.entries(patch.pictSequence ?? {}).forEach(([key, value]) => {
            if (value !== undefined)
              delete (pict.settings as Record<string, unknown>)[key];
          });
        }),
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

    // Canvia la vista de totes les seqüències alhora: és tocar l'estil del
    // document, i per això també en mou la base. Les pestanyes que no tenen
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
      const {
        content,
        viewSettings,
        defaultSettings,
        styleView,
        fitzgeraldColors,
        pages,
        styles,
        sequenceStyleIds,
        sequenceNames,
      } = action.payload;
      previousDocument.content = content;
      previousDocument.viewSettings = viewSettings;
      previousDocument.defaultSettings = defaultSettings;
      previousDocument.styleView = styleView;
      previousDocument.fitzgeraldColors = fitzgeraldColors;
      // La pàgina del document només es desfà si la instantània la porta:
      // adaptar la pantalla sencera a una altra pantalla (la resta d'accions
      // que es poden desfer no en canvien la mida). Les pàgines i els seus
      // blocs, sempre
      if ("layout" in action.payload)
        previousDocument.layout = action.payload.layout;
      previousDocument.pages = pages;
      previousDocument.styles = styles;
      previousDocument.sequenceStyleIds = sequenceStyleIds;
      previousDocument.sequenceNames = sequenceNames;
    },

    // Fa explícit l'estil que el document heretava, en desar-lo: el que s'ha
    // desat ja no ha de canviar si després canvia l'estil per defecte. No
    // canvia res del que es veu, i per això no és un canvi de contingut
    // Les pàgines amb què comença un document nou, segons la disposició de les
    // preferències (pas 7b). No és un canvi de l'usuari: el document encara
    // hereta la pàgina de les preferències, com l'estil
    newDocumentPagesInherited: (
      previousDocument,
      action: PayloadAction<DocumentPages | undefined>,
    ) => {
      if (action.payload) previousDocument.pages = action.payload;
      else delete previousDocument.pages;
    },

    documentStyleMaterialized: (
      previousDocument,
      action: PayloadAction<{
        /**
         * L'estil que heretava. «Desa el document» ja no en passa: el document
         * en té des que neix (pla dels estils, D1). El desat al núvol, sí
         */
        style?: SequenceStyle;
        layout: DocumentLayout;
        author?: string;
      }>,
    ) => {
      // Només s'omple el que falta: el que ja hi era no es reescriu, perquè
      // un canvi de referència faria creure que el document s'ha tocat (i, per
      // exemple, ja no es podria desfer l'últim canvi d'estil)
      const { style, layout } = action.payload;
      if (style && previousDocument.defaultSettings === undefined)
        previousDocument.defaultSettings = pictStyleOf(style);
      if (style && previousDocument.styleView === undefined)
        previousDocument.styleView = style.view;
      if (style && previousDocument.fitzgeraldColors === undefined)
        previousDocument.fitzgeraldColors =
          style.fitzgeraldColors ?? DEFAULT_FITZGERALD_CATEGORY_COLORS;
      // La pàgina també és del document (B26): la que heretava, s'hi escriu
      if (previousDocument.layout === undefined)
        previousDocument.layout = layout;
      // I l'autor (B21): el que heretava de les preferències, ara és seu
      if (
        previousDocument.author === undefined &&
        action.payload.author !== undefined
      )
        previousDocument.author = action.payload.author;
      if (previousDocument.styleView === undefined) return;
      const tabBase = tabViewOf(previousDocument.styleView);
      Object.keys(previousDocument.content).forEach((key) => {
        if (previousDocument.viewSettings[Number(key)] === undefined)
          previousDocument.viewSettings[Number(key)] = { ...tabBase };
      });
    },

    // Un document nou neix amb una còpia del meu estil, amb el seu nom, i no
    // el segueix mai (pla dels estils, D1; fonament 03, §7). No és un canvi de
    // l'usuari: el document encara no té res seu. Només si no en té cap
    documentStyleAdopted: (
      previousDocument,
      action: PayloadAction<{ style: SequenceStyle; name: string }>,
    ) => {
      if (previousDocument.defaultSettings !== undefined) return;
      const { style, name } = action.payload;
      previousDocument.defaultSettings = JSON.parse(
        JSON.stringify(pictStyleOf(style)),
      ) as DefaultSettings;
      previousDocument.styleView = { ...style.view };
      previousDocument.fitzgeraldColors = {
        ...(style.fitzgeraldColors ?? DEFAULT_FITZGERALD_CATEGORY_COLORS),
      };
      previousDocument.styleName = name;
    },

    // Canvia l'autor del document (B21). Buit és «sense autor», i no torna a
    // heretar el de les preferències
    documentAuthorChanged: (
      previousDocument,
      action: PayloadAction<string>,
    ) => {
      previousDocument.author = action.payload;
    },

    // Canvia la pàgina del document (B26): mida, orientació o direcció. `base`
    // és la que té ara (la seva o, si l'hereta, la de les preferències)
    documentLayoutChanged: (
      previousDocument,
      action: PayloadAction<{
        layout: Partial<DocumentLayout>;
        base: DocumentLayout;
      }>,
    ) => {
      previousDocument.layout = {
        ...(previousDocument.layout ?? action.payload.base),
        ...action.payload.layout,
      };
    },

    // La pàgina del document i els blocs recol·locats alhora: en passar a la
    // pantalla sencera o tornar-ne, i en adaptar-la a una altra pantalla, el
    // full canvia de mida i els blocs s'hi recol·loquen (`rescalePages`)
    documentLayoutAndPagesChanged: (
      previousDocument,
      action: PayloadAction<{
        layout: DocumentLayout;
        pages: DocumentPages | undefined;
      }>,
    ) => {
      previousDocument.layout = action.payload.layout;
      previousDocument.pages = action.payload.pages;
    },

    // Les pàgines senceres, amb els seus blocs (ADR-005). Les operacions les
    // calcula `features/free-layout/model`, i aquí només es desa el resultat
    pagesChanged: (
      previousDocument,
      action: PayloadAction<DocumentPages | undefined>,
    ) => {
      previousDocument.pages = action.payload;
    },

    // Les pàgines i els estils amb nom alhora: «Aplica el meu estil» copia
    // l'estil al document i hi apunta els blocs en un sol pas, i en un sol
    // desfer (R10)
    pagesAndStylesChanged: (
      previousDocument,
      action: PayloadAction<{ pages: DocumentPages; styles: NamedStyle[] }>,
    ) => {
      previousDocument.pages = action.payload.pages;
      previousDocument.styles = action.payload.styles;
    },

    // L'estil d'una seqüència, triat a la Galeria d'estils (pla dels estils,
    // pas 5): l'estil ja és a `styles` (copiat o reaprofitat). Sense `styleId`,
    // la seqüència torna a l'estil del document. Els blocs amb un estil
    // reassignat no canvien: el reassignat substitueix el de la seqüència
    sequenceStyleChanged: (
      previousDocument,
      action: PayloadAction<{
        key: number;
        styleId?: string;
        styles: NamedStyle[];
      }>,
    ) => {
      const { key, styleId, styles } = action.payload;
      const ids = { ...previousDocument.sequenceStyleIds };
      if (styleId === undefined) delete ids[key];
      else ids[key] = styleId;
      previousDocument.sequenceStyleIds = ids;
      previousDocument.styles = styles;
    },

    // El nom d'una seqüència: és per a qui edita i no s'imprimeix (D16). Buit,
    // la seqüència torna a dir-se «Seqüència N»
    sequenceRenamed: (
      previousDocument,
      action: PayloadAction<{ key: number; name: string }>,
    ) => {
      const { key } = action.payload;
      const name = action.payload.name.trim();
      const names = { ...previousDocument.sequenceNames };
      if (name === "") delete names[key];
      else names[key] = name;
      previousDocument.sequenceNames = names;
    },

    // Treu una seqüència qualsevol, no només l'última (D21): les de després
    // baixen una clau, i amb elles tot el que hi apunta
    removeSequence: (previousDocument, action: PayloadAction<number>) =>
      removeSequenceFromDocument(previousDocument, action.payload),

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
    // rebre un document nou.
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
        delete previousDocument.sequenceNames?.[Number(lastKey)];
        delete previousDocument.sequenceStyleIds?.[Number(lastKey)];
        // I els seus blocs: no poden apuntar a una seqüència que no hi és
        if (previousDocument.pages)
          previousDocument.pages = removeSequencePlacements(
            previousDocument.pages,
            Number(lastKey),
          );

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

/**
 * El que toca un canvi que es pot desfer: l'estil i, des del mode lliure
 * (ADR-005), les pàgines. És l'únic desfer de l'app.
 */
export interface DocumentStyleSnapshot {
  content: DocumentSAAC["content"];
  viewSettings: DocumentSAAC["viewSettings"];
  defaultSettings: DocumentSAAC["defaultSettings"];
  styleView: DocumentSAAC["styleView"];
  fitzgeraldColors: DocumentSAAC["fitzgeraldColors"];
  pages: DocumentSAAC["pages"];
  /** Els estils amb nom: triar un estil n'hi copia un */
  styles: DocumentSAAC["styles"];
  /** L'estil de cada seqüència: triar-ne un a la galeria el canvia */
  sequenceStyleIds: DocumentSAAC["sequenceStyleIds"];
  /**
   * El nom de cada seqüència: canviar-lo després d'un canvi d'estil fa que ja
   * no es pugui desfer, perquè desfer el tornaria enrere
   */
  sequenceNames: DocumentSAAC["sequenceNames"];
  /**
   * La pàgina del document, només quan el canvi la toca (adaptar la pantalla
   * sencera). Sense la clau, desfer no la toca
   */
  layout?: DocumentSAAC["layout"];
}

export const takeDocumentStyleSnapshot = (
  document: DocumentSAAC,
): DocumentStyleSnapshot => ({
  content: document.content,
  viewSettings: document.viewSettings,
  defaultSettings: document.defaultSettings,
  styleView: document.styleView,
  fitzgeraldColors: document.fitzgeraldColors,
  pages: document.pages,
  styles: document.styles,
  sequenceStyleIds: document.sequenceStyleIds,
  sequenceNames: document.sequenceNames,
});

/**
 * El document tal com s'ha d'enviar a fora: amb l'estil que fa servir. Si
 * l'heretava, a partir d'ara el té propi.
 */
export const selectDocumentToSave = (
  state: StyleSourceState,
): DocumentSAAC => ({
  ...materializeDocumentStyle(
    state.document,
    resolveDocumentStyle(state.document, userDefaultStyleOf(state)),
    userLayoutOf(state),
  ),
  // L'autor que es veu: el seu, o el que hereta mentre no en té (B21)
  author: state.document.author ?? userAuthorOf(state),
});

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
        userLayoutOf(state),
      );
      // El núvol guarda la forma d'abans (els pictogrames amb l'estil
      // resolt), i el que torna es redueix als retocs, com un fitxer antic
      const style = resolveDocumentStyle(doc, userDefaultStyleOf(state));
      const { id, ...payload } = documentToLegacyPictograms(doc, style);
      const fromCloud = (returned: DocumentSAAC): DocumentSAAC =>
        documentFromLegacyPictograms(
          returned,
          resolveDocumentStyle(returned, userDefaultStyleOf(state)),
        );
      if (isMongoId(id) && !asCopy) {
        const updated = await updateDocument(id, payload);
        dispatch(documentSlice.actions.loadDocumentSaac(fromCloud(updated)));
        return id;
      } else {
        const saved = await createDocument(payload);
        dispatch(documentSlice.actions.loadDocumentSaac(fromCloud(saved)));
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

/** El que fan servir els thunks plans d'aquest fitxer (sense `AppThunk`, que és de l'store). */
type PlainThunk = (
  dispatch: Dispatch,
  getState: () => StyleSourceState,
) => void;

/**
 * Dona a un document nou la còpia del meu estil amb què neix (pla dels
 * estils, D1), amb el nom `name` («El meu estil», en l'idioma de la
 * interfície). Si el document ja té estil, no fa res.
 */
export const adoptMyStyleThunk =
  (name: string): PlainThunk =>
  (dispatch, getState) => {
    const state = getState();
    if (state.document.defaultSettings !== undefined) return;
    dispatch(
      documentSlice.actions.documentStyleAdopted({
        style: userDefaultStyleOf(state),
        name,
      }),
    );
  };

/**
 * Els esborranys d'abans del pas 4 del pla dels estils porten el nom de cada
 * seqüència (`title`) entre els camps desconeguts: passa a `sequenceNames`.
 */
export const withSequenceNamesFromExtras = (
  document: DocumentSAAC,
): DocumentSAAC => {
  const extras = document.saacExtra?.sequences;
  if (!extras) return document;
  const names: { [key: number]: string } = { ...document.sequenceNames };
  const sequences: { [key: number]: SaacExtraFields } = {};
  let moved = false;
  Object.entries(extras).forEach(([key, extra]) => {
    const { title, ...rest } = extra;
    if (typeof title !== "string") {
      sequences[Number(key)] = extra;
      return;
    }
    moved = true;
    if (names[Number(key)] === undefined) names[Number(key)] = title;
    if (Object.keys(rest).length > 0) sequences[Number(key)] = rest;
  });
  if (!moved) return document;
  const saacExtra = { ...document.saacExtra };
  if (Object.keys(sequences).length > 0) saacExtra.sequences = sequences;
  else delete saacExtra.sequences;
  return { ...document, sequenceNames: names, saacExtra };
};

/**
 * Obre l'esborrany del navegador. Els d'abans de la solució A porten l'estil
 * copiat a cada pictograma: es queden només amb els retocs, una sola vegada,
 * comparant amb l'estil del document en aquell moment (pla dels estils, §3.3).
 * Un document sense estil propi es compara amb el meu estil d'ara: no hi ha
 * manera de saber el de quan es va fer. Retorna el document que s'ha obert.
 */
export const restoreDraftDocumentThunk =
  (draft: { document: DocumentSAAC; retouchesOnly: boolean }) =>
  (dispatch: Dispatch, getState: () => StyleSourceState): DocumentSAAC => {
    const document = withSequenceNamesFromExtras(
      draft.retouchesOnly
        ? draft.document
        : documentFromLegacyPictograms(
            draft.document,
            resolveDocumentStyle(
              draft.document,
              userDefaultStyleOf(getState()),
            ),
          ),
    );
    dispatch(documentSlice.actions.loadDocumentSaac(document));
    return document;
  };

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
  movePictogram: movePictogramActionCreator,
  subtractLastPict: subtractLastPictActionCreator,
  addSequence: addSequenceActionCreator,
  renumberSequence: renumberSequenceActionCreator,
  sortSequence: sortSequenceActionCreator,
  updatePictSequence: updatePictSequenceActionCreator,
  sequencePictogramsReplaced: sequencePictogramsReplacedActionCreator,
  selectedId: selectedIdActionCreator,
  searched: searchedActionCreator,
  settingsPictApiAra: settingsPictApiAraActionCreator,
  settingsPictSequence: settingsPictSequenceActionCreator,
  updateSequenceViewSettings: updateSequenceViewSettingsActionCreator,
  applyViewSettingsToAll: applyViewSettingsToAllActionCreator,
  setSequenceSpaceBetween: setSequenceSpaceBetweenActionCreator,
  applyDocumentStyle: applyDocumentStyleActionCreator,
  restoreDocumentStyle: restoreDocumentStyleActionCreator,
  documentStyleMaterialized: documentStyleMaterializedActionCreator,
  documentStyleAdopted: documentStyleAdoptedActionCreator,
  newDocumentPagesInherited: newDocumentPagesInheritedActionCreator,
  documentLayoutChanged: documentLayoutChangedActionCreator,
  documentLayoutAndPagesChanged: documentLayoutAndPagesChangedActionCreator,
  pagesChanged: pagesChangedActionCreator,
  pagesAndStylesChanged: pagesAndStylesChangedActionCreator,
  documentAuthorChanged: documentAuthorChangedActionCreator,
  pictStyleAppliedToAll: pictStyleAppliedToAllActionCreator,
  deleteLastSequence: deleteLastSequenceActionCreator,
  sequenceStyleChanged: sequenceStyleChangedActionCreator,
  sequenceRenamed: sequenceRenamedActionCreator,
  removeSequence: removeSequenceActionCreator,
  removeCloudImage: removeCloudImageActionCreator,
  replaceCloudImage: replaceCloudImageActionCreator,
  setDocumentId: setDocumentIdActionCreator,
  setDocumentTitle: setDocumentTitleActionCreator,
} = documentSlice.actions;
