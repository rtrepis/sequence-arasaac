// El bloc seleccionat a la vista, amb el que en necessiten la columna i les
// molles: el nom, on és i la vista que se li aplica amb la cascada.
import { useAppSelector } from "@/app/hooks";
import type {
  SequencePlacement,
  SequenceViewSettings,
  TextPlacement,
} from "@/types/document";
import type { Sequence } from "@/types/sequence";
import {
  selectDocumentCardDefaults,
  selectResolvedSequenceViews,
} from "@features/sequence/style/styleSelectors";
import {
  ResolvedTextStyle,
  namedStyleOf,
  resolveBlockView,
  resolveTextBlockStyle,
} from "../model/blockStyle";
import { findPlacement } from "../model/sheets";
import {
  selectDocumentContent,
  selectNamedStyles,
  selectPages,
} from "../store/freeLayoutThunks";
import { useSequenceName } from "../components/FreeLayoutPages/useSequenceName";
import { useTextBlockName } from "../components/FreeLayoutPages/TextBlock";
import { useViewSelection } from "./useViewSelection";

export type SelectedBlock =
  | {
      kind: "block";
      placement: SequencePlacement;
      sheetIndex: number;
      common: boolean;
      name: string;
      pictograms: Sequence;
      /** La vista del bloc, amb la cascada sencera */
      view: SequenceViewSettings;
    }
  | {
      kind: "sequence";
      sequenceKey: number;
      name: string;
      view: SequenceViewSettings;
    }
  | {
      /** Un rètol (R9) */
      kind: "text";
      placement: TextPlacement;
      sheetIndex: number;
      common: boolean;
      name: string;
      /** L'aspecte del rètol, amb la cascada sencera */
      style: ResolvedTextStyle;
    };

/** El bloc seleccionat, o `null` si no n'hi ha cap (o ja no hi és). */
export const useSelectedBlock = (): SelectedBlock | null => {
  const { selection } = useViewSelection();
  const pages = useAppSelector(selectPages);
  const content = useAppSelector(selectDocumentContent);
  const views = useAppSelector(selectResolvedSequenceViews);
  const styles = useAppSelector(selectNamedStyles);
  const defaults = useAppSelector(selectDocumentCardDefaults);
  const sequenceName = useSequenceName();
  const textName = useTextBlockName();
  if (!selection) return null;

  if (selection.kind === "sequence") {
    const view = views[selection.sequenceKey];
    if (!view) return null;
    return {
      kind: "sequence",
      sequenceKey: selection.sequenceKey,
      name: sequenceName(selection.sequenceKey),
      view,
    };
  }

  const found = pages && findPlacement(pages, selection.placementId);
  if (found?.placement.kind === "text")
    return {
      kind: "text",
      placement: found.placement,
      sheetIndex: selection.sheetIndex,
      common: found.location === "common",
      name: textName(found.placement.text),
      style: resolveTextBlockStyle(
        defaults.font,
        namedStyleOf(styles, found.placement.styleId),
        found.placement,
      ),
    };
  if (!found || found.placement.kind !== "sequence") return null;
  const { placement } = found;
  const sequenceView = views[placement.sequenceKey];
  const pictograms = content[placement.sequenceKey];
  if (!sequenceView || !pictograms) return null;
  return {
    kind: "block",
    placement,
    sheetIndex: selection.sheetIndex,
    common: found.location === "common",
    name: sequenceName(placement.sequenceKey),
    pictograms,
    view: resolveBlockView(
      sequenceView,
      namedStyleOf(styles, placement.styleId),
      placement.view,
    ),
  };
};
