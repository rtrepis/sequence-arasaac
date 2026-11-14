// Les accions sobre les pàgines del document (ADR-005): les fan servir la
// columna de la vista, la capçalera de cada pàgina i el menú de cada bloc.
// Calculen les pàgines noves amb les funcions pures de `model/` i les desen al
// document.
// Les que substitueixen feina es poden desfer amb el snackbar de sempre
// (`undoableStyleChangeThunk`), que és l'únic desfer de l'app.
import type { AnyAction } from "@reduxjs/toolkit";
import type { AppThunk, RootState } from "@/app/store";
import type {
  DocumentLayout,
  DocumentPages,
  LicenceOn,
  PlacementColumns,
  SequenceViewSettings,
  SheetMode,
  TextBlockStyle,
} from "@/types/document";
import type { PageDisposition, SequenceDirection } from "@/types/ui";
import {
  addNewSequenceActionCreator,
  newDocumentPagesInheritedActionCreator,
  pagesAndStylesChangedActionCreator,
  pagesChangedActionCreator,
  userLayoutOf,
} from "@features/sequence/store/documentSlice";
import {
  FreeLayoutChangeSource,
  undoableStyleChangeThunk,
} from "@features/sequence/store/styleSlice";
import { newSaacId } from "@features/sequence/saac/serialize";
import { SheetArea, sheetAreaMm } from "../model/placement";
import {
  addPlacementsToSheet,
  addSequencesToSheet,
  applyTemplateToSheet,
  newTextPlacement,
  sheetToTemplate,
} from "../model/distribute";
import {
  MyStyleTarget,
  applyNamedStyle,
  blockViewRetouch,
  namedStyleFrom,
  namedStyleOf,
  removeNamedStyle,
  resolveBlockView,
  targetStyleIds,
  updateNamedStyles,
} from "../model/blockStyle";
import {
  selectResolvedSequenceViews,
  selectUserDefaultStyle,
} from "@features/sequence/style/styleSelectors";
import {
  dispositionOf,
  explicitPages,
  initialPagesFor,
  newSheetWith,
} from "../model/pages";
import {
  NewLayoutId,
  copyPlacementToSheet,
  duplicateSheet,
  findPlacement,
  insertSheet,
  makeCommon,
  mapSheet,
  makeLocal,
  moveSheet,
  removePlacement,
  removeSheet,
  updatePlacement,
} from "../model/sheets";
import { FREE_TEMPLATE, LayoutTemplate } from "../model/templates";
import { fitSheetBlocks } from "../model/naturalBox";
import { naturalBoxOfState } from "./blockGrowth";

/** Identificadors nous de fulls i col·locacions: els mateixos que escriu el fitxer. */
const newLayoutId: NewLayoutId = (prefix) => newSaacId(prefix);

/** La pàgina del document: la seva, o la de les preferències si encara l'hereta. */
export const selectPageLayout = (state: RootState): DocumentLayout =>
  state.document.layout ?? userLayoutOf(state);

/**
 * Si el document té pàgines pròpies. Sense, és una sola pàgina contínua amb
 * totes les seqüències i es pinta com sempre; amb, cada pàgina es pinta amb
 * els seus blocs, contínua o en blocs.
 */
export const selectHasPages = (state: RootState): boolean =>
  state.document.pages !== undefined;

/** L'àrea útil d'un full del document, en mm. `null` amb la pantalla completa. */
export const selectSheetArea = (state: RootState): SheetArea | null => {
  const { pageSize, orientation } = selectPageLayout(state);
  return sheetAreaMm(pageSize ?? "A4", orientation ?? "landscape");
};

/** Les pàgines del document, si en té de pròpies. */
export const selectPages = (state: RootState): DocumentPages | undefined =>
  state.document.pages;

/** El títol del document, si en té. */
export const selectDocumentTitle = (state: RootState): string | undefined =>
  state.document.title;

/** Els estils amb nom del document. */
export const selectNamedStyles = (state: RootState) => state.document.styles;

/** Els pictogrames de cada seqüència del document. */
export const selectDocumentContent = (state: RootState) =>
  state.document.content;

/** El que el fitxer portava de cada seqüència i l'app no fa servir (el títol…). */
export const selectSequenceExtras = (state: RootState) =>
  state.document.saacExtra?.sequences;

/** Les claus de les seqüències del document, en l'ordre de les pestanyes. */
export const selectSequenceKeys = (state: RootState): number[] =>
  Object.keys(state.document.content)
    .map(Number)
    .sort((a, b) => a - b);

/**
 * Canvia les pàgines amb `change`. Si es passa `source`, el canvi es pot
 * desfer i en surt el snackbar amb «Desfés»; si no, no substitueix res i qui
 * l'ha demanat diu el seu missatge.
 */
const changeFreeLayout =
  (
    change: (pages: DocumentPages, area: SheetArea) => DocumentPages,
    source?: FreeLayoutChangeSource,
  ): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const area = selectSheetArea(state);
    if (!area) return;
    // Un document sense pàgines té la seva sense dir-ho: una de contínua amb
    // totes les seqüències. Qualsevol canvi de pàgina la fa explícita
    const pages = explicitPages(
      state.document.pages,
      selectSequenceKeys(state),
      newLayoutId,
    );
    const action = (): AnyAction =>
      pagesChangedActionCreator(change(pages, area));
    if (source) dispatch(undoableStyleChangeThunk(action, source));
    else dispatch(action());
  };

/**
 * Com es col·loquen els blocs d'una pàgina: «Contínua» (`auto`, com sempre: un
 * darrere l'altre) o «En blocs» (`template`, cada bloc a la seva caixa). No
 * esborra res: en tornar a «Contínua», les caixes i la plantilla es
 * conserven, i tornar a «En blocs» les recupera. Un document sense pàgines
 * passa a tenir-ne (`explicitPages`), i la pantalla completa, que no té
 * mil·límetres, no ho admet.
 */
export const setSheetModeThunk =
  (sheetIndex: number, mode: SheetMode): AppThunk =>
  (dispatch, getState) => {
    const direction = selectPageLayout(getState()).direction ?? "row";
    dispatch(
      changeFreeLayout((layout, area) =>
        mapSheet(layout, sheetIndex, (sheet) =>
          mode === "template"
            ? sheetToTemplate(sheet, layout, { area, direction })
            : { ...sheet, mode: "auto" },
        ),
      ),
    );
  };

/** La direcció d'una pàgina contínua: les seqüències en files o en columnes. */
export const setSheetDirectionThunk = (
  sheetIndex: number,
  direction: SequenceDirection,
): AppThunk =>
  changeFreeLayout((layout) =>
    mapSheet(layout, sheetIndex, (sheet) => ({ ...sheet, direction })),
  );

/** L'espai entre seqüències d'una pàgina contínua. */
export const setSheetGapThunk = (
  sheetIndex: number,
  sequenceGap: number,
): AppThunk =>
  changeFreeLayout((layout) =>
    mapSheet(layout, sheetIndex, (sheet) => ({ ...sheet, sequenceGap })),
  );

/** A quines pàgines va el peu de llicència: a totes o només a l'última. */
export const setLicenceOnThunk = (licenceOn: LicenceOn): AppThunk =>
  changeFreeLayout((layout) => ({
    sheets: layout.sheets,
    common: layout.common,
    // A totes és el de sempre: no cal dir-ho
    ...(licenceOn === "last" && { licenceOn }),
  }));

/**
 * Afegeix seqüències a una pàgina i la torna a repartir (es pot desfer). Amb
 * `slot`, la primera va a aquell espai si és lliure (un bloc buit del full).
 */
export const addSequencesToSheetThunk =
  (
    sheetIndex: number,
    sequenceKeys: readonly number[],
    slot?: number,
  ): AppThunk =>
  (dispatch, getState) => {
    const direction = selectPageLayout(getState()).direction ?? "row";
    dispatch(
      changeFreeLayout(
        (layout, area) =>
          addSequencesToSheet(
            layout,
            sheetIndex,
            sequenceKeys,
            { area, direction, newId: newLayoutId },
            slot,
          ),
        "layoutAddSequences",
      ),
    );
  };

/**
 * Afegeix un rètol buit a una pàgina (un bloc de text, R9): al primer espai de
 * rètol lliure o, amb `slot`, a aquell espai. Torna l'`id` del rètol nou, per
 * seleccionar-lo i escriure-hi a la columna.
 */
export const addTextBlockThunk =
  (sheetIndex: number, slot?: number): AppThunk<string> =>
  (dispatch, getState) => {
    const direction = selectPageLayout(getState()).direction ?? "row";
    const placement = newTextPlacement("", newLayoutId);
    dispatch(
      changeFreeLayout((layout, area) =>
        addPlacementsToSheet(
          layout,
          sheetIndex,
          [placement],
          { area, direction, newId: newLayoutId },
          slot,
        ),
      ),
    );
    return placement.id;
  };

/**
 * Aplica una plantilla a una pàgina (es pot desfer). Amb `labelText`, els
 * espais de rètol que queden buits n'estrenen un amb aquell text («Primer»,
 * «Dilluns»…), que és qui crida el que el tradueix.
 */
export const applyTemplateThunk = (
  sheetIndex: number,
  template: LayoutTemplate,
  labelText?: (label: string) => string,
): AppThunk =>
  changeFreeLayout(
    (layout, area) =>
      applyTemplateToSheet(
        layout,
        sheetIndex,
        template,
        area,
        labelText && { text: labelText, newId: newLayoutId },
      ),
    "layoutTemplate",
  );

/** El que es pot canviar d'un rètol des de la columna. */
export interface TextPlacementChange {
  text?: string;
  textStyle?: TextBlockStyle;
}

/**
 * Canvia el text o l'aspecte d'un rètol (el nivell «Bloc» de la columna). Del
 * retoc d'aspecte, només es desa el que porta: sense res, el rètol pren la
 * lletra del document, centrat i sense negreta.
 */
export const setTextPlacementThunk = (
  placementId: string,
  change: TextPlacementChange,
): AppThunk =>
  changeFreeLayout((layout) =>
    updatePlacement(layout, placementId, (placement) => {
      if (placement.kind !== "text") return placement;
      const next = { ...placement, ...change };
      if (next.textStyle && Object.keys(next.textStyle).length === 0)
        delete next.textStyle;
      return next;
    }),
  );

/**
 * Una pàgina nova, buida, darrere de `afterIndex`. És contínua, com la de
 * sempre: passar-la a blocs és de l'usuari.
 */
export const addSheetThunk =
  (afterIndex: number): AppThunk =>
  (dispatch, getState) => {
    // Neix amb la disposició de les preferències (pas 7b)
    const disposition = selectDefaultDisposition(getState());
    dispatch(
      changeFreeLayout((layout) =>
        insertSheet(layout, afterIndex, newSheetWith(newLayoutId, disposition)),
      ),
    );
  };

/** Una còpia de la pàgina, darrere de l'original. */
export const duplicateSheetThunk = (index: number): AppThunk =>
  changeFreeLayout((layout) => duplicateSheet(layout, index, newLayoutId));

/** Canvia una pàgina de lloc. */
export const moveSheetThunk = (from: number, to: number): AppThunk =>
  changeFreeLayout((layout) => moveSheet(layout, from, to));

/** Esborra una pàgina i les seves col·locacions (es pot desfer). */
export const removeSheetThunk = (index: number): AppThunk =>
  changeFreeLayout(
    (layout) => removeSheet(layout, index, newLayoutId),
    "layoutRemoveSheet",
  );

/** Treu aquesta col·locació, i prou (es pot desfer). */
export const removePlacementThunk = (placementId: string): AppThunk =>
  changeFreeLayout(
    (layout) => removePlacement(layout, placementId),
    "layoutRemovePlacement",
  );

/** Una còpia independent de la col·locació a una altra pàgina. */
export const copyPlacementToSheetThunk = (
  placementId: string,
  sheetIndex: number,
): AppThunk =>
  changeFreeLayout((layout) =>
    copyPlacementToSheet(layout, placementId, sheetIndex, newLayoutId),
  );

/**
 * «A totes les pàgines». Posar-la-hi no treu res; treure-la la deixa només a
 * la pàgina on s'és i la treu de les altres, i per això es pot desfer.
 */
export const setPlacementCommonThunk =
  (placementId: string, common: boolean, sheetIndex: number): AppThunk =>
  (dispatch, getState) => {
    const { pages } = getState().document;
    const found = pages && findPlacement(pages, placementId);
    if (!found || (found.location === "common") === common) return;
    dispatch(
      common
        ? changeFreeLayout((layout) => makeCommon(layout, placementId))
        : changeFreeLayout(
            (layout) => makeLocal(layout, placementId, sheetIndex),
            "layoutUncommon",
          ),
    );
  };

/** Les columnes de dins d'un bloc: automàtiques o un nombre fix. */
export const setPlacementColumnsThunk = (
  placementId: string,
  columns: PlacementColumns,
): AppThunk =>
  changeFreeLayout((layout) =>
    updatePlacement(layout, placementId, (placement) =>
      placement.kind === "sequence" ? { ...placement, columns } : placement,
    ),
  );

/**
 * Canvia la vista d'un bloc de seqüència (el nivell «Bloc» de la columna, M1).
 * Es desa només el retoc: el que es diferencia de la vista de la seqüència
 * retocada per l'estil amb nom del bloc. Les altres còpies de la seqüència no
 * canvien.
 */
export const setPlacementViewThunk =
  (placementId: string, change: Partial<SequenceViewSettings>): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { pages, styles } = state.document;
    const found = pages && findPlacement(pages, placementId);
    if (!found || found.placement.kind !== "sequence") return;
    const sequenceView =
      selectResolvedSequenceViews(state)[found.placement.sequenceKey];
    if (!sequenceView) return;
    const base = resolveBlockView(
      sequenceView,
      namedStyleOf(styles, found.placement.styleId),
      undefined,
    );
    const view = blockViewRetouch(base, {
      ...resolveBlockView(base, undefined, found.placement.view),
      ...change,
    });
    dispatch(
      changeFreeLayout((layout) =>
        updatePlacement(layout, placementId, (placement) => {
          if (placement.kind !== "sequence") return placement;
          const next = { ...placement, view };
          // Sense retoc, el bloc no en porta cap: el fitxer no l'escriu
          if (!view) delete next.view;
          return next;
        }),
      ),
    );
  };

/**
 * «La mateixa configuració a tots els blocs» d'una pàgina: posa els mateixos
 * valors a tots els blocs de seqüència propis de la pàgina (els comuns no, que
 * surten a totes). Cada bloc desa només el seu retoc, com amb
 * `setPlacementViewThunk`; si la seqüència ja hi coincideix, no en porta cap.
 */
export const setSheetViewThunk =
  (sheetIndex: number, change: Partial<SequenceViewSettings>): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { pages, styles } = state.document;
    const sheet = pages?.sheets[sheetIndex];
    if (!sheet) return;
    const views = selectResolvedSequenceViews(state);
    const ids = new Set(
      sheet.placements
        .filter((placement) => placement.kind === "sequence")
        .map(({ id }) => id),
    );
    if (ids.size === 0) return;
    dispatch(
      changeFreeLayout((layout) => ({
        ...layout,
        sheets: layout.sheets.map((current, index) =>
          index !== sheetIndex
            ? current
            : {
                ...current,
                placements: current.placements.map((placement) => {
                  if (placement.kind !== "sequence" || !ids.has(placement.id))
                    return placement;
                  const sequenceView = views[placement.sequenceKey];
                  if (!sequenceView) return placement;
                  const base = resolveBlockView(
                    sequenceView,
                    namedStyleOf(styles, placement.styleId),
                    undefined,
                  );
                  const view = blockViewRetouch(base, {
                    ...resolveBlockView(base, undefined, placement.view),
                    ...change,
                  });
                  const next = { ...placement, view };
                  if (!view) delete next.view;
                  return next;
                }),
              },
        ),
      })),
    );
  };

/**
 * Mou un bloc o en canvia la mida (fase 4): la caixa nova, ja enganxada a la
 * quadrícula de punts (`grid.ts`). El bloc es queda l'espai de la plantilla
 * que ocupava: afegir-ne un altre no omple el lloc d'on ha marxat, i tornar a
 * aplicar la plantilla treu el retoc (amb Desfés).
 */
export const setPlacementBoxThunk = (
  placementId: string,
  box: { x: number; y: number; w: number; h: number },
): AppThunk =>
  changeFreeLayout((layout) =>
    updatePlacement(layout, placementId, (placement) =>
      placement.kind === "unknown" ? placement : { ...placement, ...box },
    ),
  );

/**
 * Passa una pàgina en blocs al repartiment lliure, sense moure res: els blocs
 * es queden on són, i un bloc nou anirà a l'espai buit més gran.
 */
export const setSheetFreeThunk =
  (sheetIndex: number): AppThunk =>
  (dispatch, getState) => {
    // Les caixes prenen la mida justa dels seus pictogrames (pas 7c)
    const naturalOf = naturalBoxOfState(getState());
    dispatch(
      changeFreeLayout((layout, area) => {
        const free = mapSheet(layout, sheetIndex, (sheet) => ({
          ...sheet,
          template: FREE_TEMPLATE.id,
        }));
        return naturalOf
          ? fitSheetBlocks(free, sheetIndex, naturalOf, area)
          : free;
      }),
    );
  };

/**
 * «Aplica el meu estil» del menú «⋯» d'una pàgina o d'un bloc (R10): el meu
 * estil es copia al document com a estil amb nom i hi apunta els blocs. Es pot
 * desfer, i el snackbar amb «Desfés» n'és el missatge. Els estils van en una
 * sola direcció: res del document no torna mai cap a les preferències.
 * `name` és «El meu estil» a l'idioma de la interfície, i queda escrit al
 * document com a contingut.
 */
export const applyMyStyleThunk =
  (target: MyStyleTarget, name: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const pages = explicitPages(
      state.document.pages,
      selectSequenceKeys(state),
      newLayoutId,
    );
    const entry = namedStyleFrom(selectUserDefaultStyle(state), {
      id: newSaacId("st"),
      name,
    });
    dispatch(
      undoableStyleChangeThunk(
        () =>
          pagesAndStylesChangedActionCreator(
            applyNamedStyle(pages, state.document.styles, entry, target),
          ),
        target.kind === "sheet" ? "myStyleSheet" : "myStyleBlock",
      ),
    );
  };

/**
 * «Actualitza amb el meu estil» del menú «⋯» d'una pàgina o d'un bloc (R7): els
 * estils de bloc que fan servir passen a tenir el meu estil, i canvien tots els
 * blocs que els comparteixen, a qualsevol pàgina. És l'estil per grup: el grup
 * són els blocs amb el mateix estil de bloc. Es pot desfer, i el snackbar amb
 * «Desfés» n'és el missatge. Sense cap estil de bloc, no fa res.
 */
export const updateMyStyleThunk =
  (target: MyStyleTarget): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { pages, styles } = state.document;
    const ids = targetStyleIds(pages, styles, target);
    if (!pages || ids.length === 0) return;
    const entry = namedStyleFrom(selectUserDefaultStyle(state), {
      id: "",
      name: "",
    });
    dispatch(
      undoableStyleChangeThunk(
        () =>
          pagesAndStylesChangedActionCreator({
            pages,
            styles: updateNamedStyles(styles, ids, entry),
          }),
        "myStyleUpdate",
      ),
    );
  };

/**
 * Treu l'estil de bloc d'un bloc (el nivell «Bloc» de la columna): torna a
 * l'estil del document. Es pot desfer.
 */
export const removeBlockStyleThunk =
  (placementId: string): AppThunk =>
  (dispatch, getState) => {
    const { pages, styles } = getState().document;
    if (!pages) return;
    dispatch(
      undoableStyleChangeThunk(
        () =>
          pagesAndStylesChangedActionCreator(
            removeNamedStyle(pages, styles, placementId),
          ),
        "blockStyleRemove",
      ),
    );
  };

// --- La disposició de les preferències (pas 7b) ---

/**
 * La disposició amb què comencen els documents nous i les pàgines noves, de
 * les preferències («Pàgina i distribució»). Sense valor, simple.
 */
export const selectDefaultDisposition = (state: RootState): PageDisposition =>
  state.ui.viewSettings.disposition ?? "auto";

/**
 * Un document nou i buit: encara hereta la pàgina de les preferències (no té
 * `layout` propi), té una sola seqüència i cap pictograma ni estil de bloc.
 * És el que pot canviar de disposició quan canvien les preferències sense
 * que l'usuari perdi res.
 */
export const selectIsBlankNewDocument = (state: RootState): boolean => {
  const { layout, content, styles } = state.document;
  const sequences = Object.values(content);
  return (
    layout === undefined &&
    sequences.length === 1 &&
    sequences[0].length === 0 &&
    (styles === undefined || styles.length === 0)
  );
};

/**
 * Dona a un document nou i buit la disposició de les preferències: una sola
 * pàgina, simple (sense pàgines pròpies) o en columnes, files o lliure. Si el
 * document ja té feina, o ja té aquesta disposició, no fa res. Amb la pantalla
 * completa no hi ha mil·límetres, i la pàgina es queda simple.
 */
export const syncNewDocumentPagesThunk =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    if (!selectIsBlankNewDocument(state)) return;
    const { pages } = state.document;
    const wanted = selectDefaultDisposition(state);
    const current =
      pages === undefined
        ? "auto"
        : pages.sheets.length === 1 && pages.common.length === 0
          ? dispositionOf(pages.sheets[0])
          : undefined;
    if (current === wanted) return;
    const area = selectSheetArea(state);
    if (wanted !== "auto" && !area) return;
    const direction = selectPageLayout(state).direction ?? "row";
    const initial = area
      ? initialPagesFor(wanted, selectSequenceKeys(state), {
          area,
          direction,
          newId: newLayoutId,
        })
      : undefined;
    // En lliure, la caixa fa la mida justa dels pictogrames (pas 7c)
    const naturalOf = naturalBoxOfState(state);
    dispatch(
      newDocumentPagesInheritedActionCreator(
        initial && area && naturalOf && wanted === "free"
          ? fitSheetBlocks(initial, 0, naturalOf, area)
          : initial,
      ),
    );
  };

/**
 * Una seqüència nova, creada a l'edició (una pestanya més). Va a l'última
 * pàgina: al final si és simple, i si va en blocs, com «Afegeix un bloc»
 * (una columna o una fila més, o l'espai buit més gran). Així un document que
 * comença en columnes no deixa les seqüències noves sense col·locar.
 */
export const addNewSequenceThunk =
  (sequenceKey: number): AppThunk =>
  (dispatch, getState) => {
    // La pàgina simple ja la té al final (el reductor)
    dispatch(addNewSequenceActionCreator(sequenceKey));
    const pages = getState().document.pages;
    const last = pages ? pages.sheets.length - 1 : -1;
    if (!pages || pages.sheets[last]?.mode !== "template") return;
    const direction = selectPageLayout(getState()).direction ?? "row";
    dispatch(
      changeFreeLayout((layout, area) =>
        addSequencesToSheet(layout, last, [sequenceKey], {
          area,
          direction,
          newId: newLayoutId,
        }),
      ),
    );
  };
