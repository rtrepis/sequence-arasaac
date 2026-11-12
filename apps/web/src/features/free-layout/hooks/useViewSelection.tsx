// La pàgina que segueix la columna de la vista i el bloc seleccionat (R5,
// `docs/PLA-mode-lliure.md`). Són estat de la pàgina de vista: no van a Redux,
// no es desen i no surten mai al paper ni al PDF.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAppSelector } from "@/app/hooks";
import { findPlacement } from "../model/sheets";
import type { CardPx } from "../model/blockGrid";
import type { LayoutTemplate } from "../model/templates";
import {
  selectHasPages,
  selectPages,
  selectSequenceKeys,
} from "../store/freeLayoutThunks";

/** L'`id` del nivell «Bloc» de la columna: l'enllaç del mòbil hi porta. */
export const VIEW_BLOCK_LEVEL_ID = "view-level-block";

/**
 * El que hi ha seleccionat: un bloc d'una pàgina amb caixes (amb la pàgina on
 * s'ha clicat, perquè un bloc comú surt a totes) o, a la disposició
 * automàtica, una seqüència, que és l'únic bloc que hi té.
 */
export type ViewSelection =
  | { kind: "block"; placementId: string; sheetIndex: number }
  | { kind: "sequence"; sequenceKey: number };

/**
 * La plantilla que es previsualitza a una pàgina (R4): en passar per damunt
 * d'una opció del selector, en anar-hi amb el teclat o en mantenir-la premuda.
 * La pàgina en dibuixa els espais com a guies, sense moure res.
 */
export interface TemplatePreview {
  sheetIndex: number;
  template: LayoutTemplate;
}

interface ViewSelectionValue {
  selection: ViewSelection | null;
  select: (selection: ViewSelection) => void;
  clear: () => void;
  /** La pàgina que segueix la columna: la del bloc seleccionat o la que es veu més */
  activePage: number;
  /** La pàgina que ocupa més pantalla, segons l'`IntersectionObserver` */
  setVisiblePage: (index: number) => void;
  /**
   * Les targetes de cada seqüència a mida 1, per `cardMeasureKey` (la
   * seqüència, o la seqüència amb un estil amb nom): les mesura el full, les
   * llegeix la columna
   */
  cardSizes: Record<string, CardPx>;
  setCardSizes: (sizes: Record<string, CardPx>) => void;
  /**
   * El que l'usuari ha triat a «La mateixa configuració a tots els blocs» de
   * cada pàgina (per l'`id` de la pàgina). Sense entrada, es dedueix dels
   * blocs (`usePageUniform`). És un mode d'edició, com l'antic «Aplica a
   * totes»: no es desa
   */
  uniformChoice: Record<string, boolean>;
  setUniformChoice: (pageId: string, uniform: boolean) => void;
  templatePreview: TemplatePreview | null;
  setTemplatePreview: (preview: TemplatePreview | null) => void;
}

const noop = (): void => undefined;

/** Sense proveïdor (proves d'una peça sola): res seleccionat i la primera pàgina. */
const ViewSelectionContext = createContext<ViewSelectionValue>({
  selection: null,
  select: noop,
  clear: noop,
  activePage: 0,
  setVisiblePage: noop,
  cardSizes: {},
  setCardSizes: noop,
  uniformChoice: {},
  setUniformChoice: noop,
  templatePreview: null,
  setTemplatePreview: noop,
});

/** El mateix element seleccionat? Serveix per saber si una caixa està marcada. */
export const sameSelection = (
  a: ViewSelection | null,
  b: ViewSelection,
): boolean => {
  if (!a || a.kind !== b.kind) return false;
  if (a.kind === "block" && b.kind === "block")
    return a.placementId === b.placementId && a.sheetIndex === b.sheetIndex;
  if (a.kind === "sequence" && b.kind === "sequence")
    return a.sequenceKey === b.sequenceKey;
  return false;
};

/** Una clau de text per a la selecció: canvia quan canvia el que hi ha seleccionat. */
export const selectionKey = (selection: ViewSelection | null): string => {
  if (!selection) return "";
  return selection.kind === "block"
    ? `block:${selection.placementId}:${selection.sheetIndex}`
    : `sequence:${selection.sequenceKey}`;
};

export const ViewSelectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => {
  const pages = useAppSelector(selectPages);
  const isFree = useAppSelector(selectHasPages);
  const keys = useAppSelector(selectSequenceKeys);
  const [selection, setSelection] = useState<ViewSelection | null>(null);
  const [visiblePage, setVisiblePage] = useState(0);
  const [cardSizes, setCardSizes] = useState<Record<string, CardPx>>({});
  const [uniformChoice, setUniformChoices] = useState<Record<string, boolean>>(
    {},
  );
  const setUniformChoice = useCallback(
    (pageId: string, uniform: boolean) =>
      setUniformChoices((current) => ({ ...current, [pageId]: uniform })),
    [],
  );

  const [templatePreview, setTemplatePreview] =
    useState<TemplatePreview | null>(null);

  const sheetCount = isFree && pages ? pages.sheets.length : 1;

  // Un bloc tret, una seqüència esborrada o un canvi de disposició deixen la
  // selecció sense res a què apuntar: es treu
  const stale = useMemo(() => {
    if (!selection) return false;
    if (selection.kind === "sequence")
      return isFree || !keys.includes(selection.sequenceKey);
    return (
      !isFree ||
      !pages ||
      selection.sheetIndex >= pages.sheets.length ||
      !findPlacement(pages, selection.placementId)
    );
  }, [selection, isFree, keys, pages]);
  useEffect(() => {
    if (stale) setSelection(null);
  }, [stale]);

  const clear = useCallback(() => setSelection(null), []);

  const current = stale ? null : selection;
  const activePage =
    current?.kind === "block"
      ? current.sheetIndex
      : Math.min(visiblePage, sheetCount - 1);

  const value = useMemo(
    () => ({
      selection: current,
      select: setSelection,
      clear,
      activePage,
      setVisiblePage,
      cardSizes,
      setCardSizes,
      uniformChoice,
      setUniformChoice,
      templatePreview,
      setTemplatePreview,
    }),
    [
      current,
      clear,
      activePage,
      cardSizes,
      uniformChoice,
      setUniformChoice,
      templatePreview,
    ],
  );

  return (
    <ViewSelectionContext.Provider value={value}>
      {children}
    </ViewSelectionContext.Provider>
  );
};

export const useViewSelection = (): ViewSelectionValue =>
  useContext(ViewSelectionContext);

/**
 * Escape treu la selecció. Va al `onKeyDown` del full o de la columna; el que
 * arriba d'un menú o d'un diàleg (que són fora, en un portal) no compta, perquè
 * allà Escape ja vol dir «tanca el menú».
 */
export const useClearOnEscape = (): ((
  event: React.KeyboardEvent<HTMLElement>,
) => void) => {
  const { selection, clear } = useViewSelection();
  return useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key !== "Escape" || !selection) return;
      if (!event.currentTarget.contains(event.target as Node)) return;
      clear();
    },
    [selection, clear],
  );
};
