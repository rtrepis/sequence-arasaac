// L'estil d'una seqüència, triat a la Galeria d'estils des de l'edició (pla
// dels estils, pas 5; fonament 03, §5).
//
// Triar un estil el **copia** al document (`styles`; si n'hi ha un d'igual, el
// reaprofita) i hi apunta la seqüència (`sequenceStyleIds`). Canvien tots els
// blocs de la seqüència llevat dels que tenen un estil reassignat (D15). Es pot
// desfer, i el snackbar diu quants pictogrames conserven els seus retocs, amb
// «Treu els retocs» (D3), i quants blocs no han canviat.
import type { AppThunk } from "@/app/store";
import type {
  DocumentPages,
  DocumentSAAC,
  NamedStyle,
  SequenceStyle,
} from "@/types/document";
import { newSaacId } from "@features/sequence/saac/serialize";
import {
  addNamedStyle,
  namedStyleFrom,
  namedStyleOf,
} from "@features/sequence/style/namedStyle";
import {
  isPictogramCustomized,
  resetPictogramStyle,
} from "@features/sequence/style/pictogramStyle";
import { findPlacement } from "@features/free-layout/model/sheets";
import { withPlacementStyle } from "@features/free-layout/model/blockStyle";
import {
  pagesAndStylesChangedActionCreator,
  sequencePictogramsReplacedActionCreator,
  sequenceStyleChangedActionCreator,
  takeDocumentStyleSnapshot,
} from "./documentSlice";
import {
  selectCanUndoStyle,
  styleUndoRecordedActionCreator,
  styleUndoSnackbarShownActionCreator,
  undoableStyleChangeThunk,
} from "./styleSlice";

/**
 * Què es tria a la galeria: un estil (el meu, un de l'app o un de carregat d'un
 * fitxer), o «L'estil del document» (`style` buit), que treu l'estil de la
 * seqüència. `name` és el nom que veu l'usuari, en el seu idioma: és el que
 * queda escrit al document, com a contingut.
 */
export interface GalleryChoice {
  name: string;
  style?: SequenceStyle;
}

/** Tots els blocs de les pàgines, els comuns inclosos. */
const allPlacements = (pages: DocumentPages | undefined) =>
  pages
    ? [...pages.sheets.flatMap((sheet) => sheet.placements), ...pages.common]
    : [];

/** Pictogrames de la seqüència amb retocs propis. */
export const retouchedCountOf = (
  document: Pick<DocumentSAAC, "content">,
  sequenceKey: number,
): number =>
  (document.content[sequenceKey] ?? []).filter(isPictogramCustomized).length;

/** Blocs de la seqüència amb un estil reassignat que existeix. */
export const reassignedBlocksOf = (
  document: Pick<DocumentSAAC, "pages" | "styles">,
  sequenceKey: number,
): number =>
  allPlacements(document.pages).filter(
    (placement) =>
      placement.kind === "sequence" &&
      placement.sequenceKey === sequenceKey &&
      namedStyleOf(document.styles, placement.styleId) !== undefined,
  ).length;

/**
 * Els estils amb nom sense `styleId` si ja no el fa servir cap seqüència ni
 * cap bloc (també els que l'app no entén, que el porten a `namedStyle`). Així
 * canviar d'estil diverses vegades no hi deixa còpies orfes, que farien sortir
 * «El meu estil 2» quan el meu estil torna a entrar.
 */
const withoutUnused = (
  styles: NamedStyle[],
  styleId: string | undefined,
  sequenceStyleIds: { [key: number]: string },
  pages: DocumentPages | undefined,
): NamedStyle[] => {
  if (styleId === undefined) return styles;
  const used =
    Object.values(sequenceStyleIds).includes(styleId) ||
    allPlacements(pages).some((placement) =>
      placement.kind === "unknown"
        ? placement.raw.namedStyle === styleId
        : placement.styleId === styleId,
    );
  return used ? styles : styles.filter(({ id }) => id !== styleId);
};

/**
 * L'estil triat, copiat als estils amb nom del document (o reaprofitat). Sense
 * `style`, cap: la primera opció de la galeria treu l'estil propi.
 */
const copyChoice = (
  styles: NamedStyle[] | undefined,
  choice: GalleryChoice,
): { styles: NamedStyle[]; styleId: string | undefined } =>
  choice.style
    ? addNamedStyle(
        styles,
        namedStyleFrom(choice.style, {
          id: newSaacId("st"),
          name: choice.name,
        }),
      )
    : { styles: [...(styles ?? [])], styleId: undefined };

/** Tria l'estil d'una seqüència. Es pot desfer. */
export const chooseSequenceStyleThunk =
  (sequenceKey: number, choice: GalleryChoice): AppThunk =>
  (dispatch, getState) => {
    const { document } = getState();
    if (document.content[sequenceKey] === undefined) return;

    const previousId = document.sequenceStyleIds?.[sequenceKey];
    const added = copyChoice(document.styles, choice);

    const sequenceStyleIds = { ...document.sequenceStyleIds };
    if (added.styleId === undefined) delete sequenceStyleIds[sequenceKey];
    else sequenceStyleIds[sequenceKey] = added.styleId;
    const styles = withoutUnused(
      added.styles,
      previousId,
      sequenceStyleIds,
      document.pages,
    );

    dispatch(
      undoableStyleChangeThunk(
        () =>
          sequenceStyleChangedActionCreator({
            key: sequenceKey,
            ...(added.styleId !== undefined && { styleId: added.styleId }),
            styles,
          }),
        "sequenceStyle",
        {
          sequenceKey,
          styleName: namedStyleOf(styles, added.styleId)?.name ?? choice.name,
          toBase: added.styleId === undefined,
          retouched: retouchedCountOf(document, sequenceKey),
          unchangedBlocks: reassignedBlocksOf(
            { ...document, styles },
            sequenceKey,
          ),
        },
      ),
    );
  };

/**
 * Tria l'estil d'un bloc de seqüència, a la vista (D12, D14): el **reassigna**.
 * Només canvia aquell bloc, encara que la seqüència surti en d'altres; si és
 * comú, canvia a totes les pàgines, i el missatge ho diu (Q3). Sense `style`
 * («L'estil de la seqüència»), treu la reassignació: és el mateix que «Torna a
 * l'estil de la seqüència». Es pot desfer.
 */
export const chooseBlockStyleThunk =
  (placementId: string, choice: GalleryChoice): AppThunk =>
  (dispatch, getState) => {
    const { document } = getState();
    const found = document.pages && findPlacement(document.pages, placementId);
    if (!document.pages || !found || found.placement.kind !== "sequence")
      return;
    const { placement } = found;

    const added = copyChoice(document.styles, choice);
    const pages = withPlacementStyle(
      document.pages,
      placementId,
      added.styleId,
    );
    const styles = withoutUnused(
      added.styles,
      placement.styleId,
      document.sequenceStyleIds ?? {},
      pages,
    );

    dispatch(
      undoableStyleChangeThunk(
        () => pagesAndStylesChangedActionCreator({ pages, styles }),
        "blockStyle",
        {
          sequenceKey: placement.sequenceKey,
          styleName: namedStyleOf(styles, added.styleId)?.name ?? choice.name,
          toBase: added.styleId === undefined,
          retouched: retouchedCountOf(document, placement.sequenceKey),
          unchangedBlocks: 0,
          common: found.location === "common",
        },
      ),
    );
  };

/**
 * «Treu els retocs» del snackbar de triar un estil (D3): treu els retocs de
 * tots els pictogrames de la seqüència, com «Restableix els pictogrames
 * d'aquesta seqüència». Si l'estil encara es pot desfer, el «Desfés» d'ara
 * torna enrere totes dues coses: l'usuari les ha fet com una de sola.
 */
export const removeSequenceRetouchesThunk =
  (sequenceKey: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const pictograms = state.document.content[sequenceKey];
    if (!pictograms) return;
    const before =
      selectCanUndoStyle(state) && state.style.undo
        ? state.style.undo.before
        : takeDocumentStyleSnapshot(state.document);

    dispatch(
      sequencePictogramsReplacedActionCreator({
        key: sequenceKey,
        pictograms: pictograms.map(resetPictogramStyle),
      }),
    );

    const after = takeDocumentStyleSnapshot(getState().document);
    dispatch(styleUndoRecordedActionCreator({ before, after }));
    dispatch(styleUndoSnackbarShownActionCreator("sequenceRetouchesRemoved"));
  };
