// «La mateixa configuració a tots els blocs» d'una pàgina (mida, espai entre
// pictogrames i alineació): el que feia «Aplica a totes» quan el document era
// una sola pàgina, ara pàgina a pàgina.
import { useAppSelector } from "@/app/hooks";
import type { SequenceViewSettings } from "@/types/document";
import {
  selectDocumentStyle,
  selectResolvedSequenceViews,
} from "@features/sequence/style/styleSelectors";
import { namedStyleOf, resolveBlockView } from "../model/blockStyle";
import {
  selectHasPages,
  selectNamedStyles,
  selectPages,
  selectSequenceKeys,
} from "../store/freeLayoutThunks";
import { useViewSelection } from "./useViewSelection";

/** La clau de la pàgina única de la disposició automàtica, que no té `id`. */
export const AUTO_PAGE_KEY = "auto";

/** Si totes les vistes són iguals en mida, espai i alineació. */
export const sameViews = (views: readonly SequenceViewSettings[]): boolean =>
  views.every(
    (view) =>
      view.sizePict === views[0].sizePict &&
      view.pictSpaceBetween === views[0].pictSpaceBetween &&
      view.alignmentH === views[0].alignmentH &&
      view.alignmentV === views[0].alignmentV,
  );

export interface PageUniform {
  /** La clau de la pàgina (el seu `id`, o la de la pàgina automàtica única) */
  pageKey: string;
  uniform: boolean;
  setUniform: (uniform: boolean) => void;
  /** Els valors que es mostren amb «la mateixa a tots»: els del primer bloc */
  view: SequenceViewSettings;
  /** Quants blocs de seqüència té la pàgina (sense els comuns) */
  blockCount: number;
}

/**
 * L'estat de «la mateixa configuració a tots els blocs» d'una pàgina. Sense
 * que l'usuari n'hagi triat res, és que sí si tots els blocs ja es veuen
 * igual, i que no si n'hi ha cap de diferent. Amb pàgines, `sheetIndex` és
 * la pàgina; a la disposició automàtica d'un sol full, és ignorat.
 */
export const usePageUniform = (sheetIndex: number): PageUniform => {
  const { uniformChoice, setUniformChoice } = useViewSelection();
  const isFree = useAppSelector(selectHasPages);
  const pages = useAppSelector(selectPages);
  const styles = useAppSelector(selectNamedStyles);
  const keys = useAppSelector(selectSequenceKeys);
  const sequenceViews = useAppSelector(selectResolvedSequenceViews);
  const documentView = useAppSelector(selectDocumentStyle).view;

  const sheet = isFree ? pages?.sheets[sheetIndex] : undefined;
  const pageKey = sheet?.id ?? AUTO_PAGE_KEY;
  const views: SequenceViewSettings[] = sheet
    ? sheet.placements.flatMap((placement) => {
        if (placement.kind !== "sequence") return [];
        const sequenceView = sequenceViews[placement.sequenceKey];
        if (!sequenceView) return [];
        return [
          resolveBlockView(
            sequenceView,
            namedStyleOf(styles, placement.styleId),
            placement.view,
          ),
        ];
      })
    : keys.flatMap((key) => (sequenceViews[key] ? [sequenceViews[key]] : []));

  return {
    pageKey,
    uniform: uniformChoice[pageKey] ?? sameViews(views),
    setUniform: (uniform) => setUniformChoice(pageKey, uniform),
    view: views[0] ?? documentView,
    blockCount: views.length,
  };
};
