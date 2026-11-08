import React from "react";
import { Stack } from "@mui/material";
import { useAppSelector } from "@/app/hooks";
import PictogramCard from "@components/PictogramCard/PictogramCard";
import type { PagePlacement } from "@/types/document";
import type { SequenceDirection } from "@/types/ui";
import {
  selectDocumentCardDefaults,
  selectResolvedSequenceViews,
} from "@features/sequence/style/styleSelectors";
import {
  namedStyleOf,
  resolveBlockView,
} from "@features/free-layout/model/blockStyle";
import {
  selectDocumentContent,
  selectNamedStyles,
} from "@features/free-layout/store/freeLayoutThunks";
import SelectableSequence from "@features/free-layout/components/SelectableSequence";
import { ALIGN_H, ALIGN_V } from "@shared/constants/alignmentMaps";

interface AutoSheetFlowProps {
  sheetIndex: number;
  placements: readonly PagePlacement[];
  direction: SequenceDirection;
  /** L'espai entre seqüències, en unitats del tema, com al flux de sempre */
  gap: number;
}

/**
 * Una pàgina contínua del document: les seves seqüències una darrere l'altra,
 * com el full de sempre (`ViewSequencePage`), amb la direcció i l'espai de la
 * pàgina. Cada seqüència és un bloc i es pot seleccionar (R5). Els rètols i
 * els blocs que l'app no entén encara no es pinten.
 */
const AutoSheetFlow = ({
  sheetIndex,
  placements,
  direction,
  gap,
}: AutoSheetFlowProps): React.ReactElement => {
  const content = useAppSelector(selectDocumentContent);
  const views = useAppSelector(selectResolvedSequenceViews);
  const styles = useAppSelector(selectNamedStyles);
  const defaults = useAppSelector(selectDocumentCardDefaults);

  const blocks = placements.flatMap((placement) => {
    if (placement.kind !== "sequence") return [];
    const pictograms = content[placement.sequenceKey];
    const sequenceView = views[placement.sequenceKey];
    if (!pictograms || !sequenceView) return [];
    const view = resolveBlockView(
      sequenceView,
      namedStyleOf(styles, placement.styleId),
      placement.view,
    );
    return [{ placement, pictograms, view }];
  });

  const isRow = direction === "row";
  // Com al full de sempre: la primera seqüència diu on va el conjunt a l'eix creuat
  const first = blocks[0]?.view;
  const blockAlign = first
    ? isRow
      ? ALIGN_V[first.alignmentV]
      : ALIGN_H[first.alignmentH]
    : undefined;

  return (
    <Stack
      direction={direction}
      flexWrap="wrap"
      alignContent={blockAlign}
      alignItems={blockAlign}
      columnGap={isRow ? 0 : gap}
      rowGap={isRow ? gap : 0}
      width="100%"
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        padding: 2,
        paddingInline: 1.5,
      }}
    >
      {blocks.map(({ placement, pictograms, view }) => (
        <SelectableSequence
          key={placement.id}
          sequenceKey={placement.sequenceKey}
          pictogramCount={pictograms.length}
          selectable
          target={{ kind: "block", placementId: placement.id, sheetIndex }}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: isRow ? "row" : "column",
            justifyContent: isRow
              ? ALIGN_H[view.alignmentH]
              : ALIGN_V[view.alignmentV],
            alignItems: "flex-start",
            // En unitats del tema, com al full de sempre
            columnGap: view.pictSpaceBetween * view.sizePict,
            rowGap: view.pictSpaceBetween * view.sizePict,
            height: isRow ? "auto" : "100%",
            width: isRow ? "100%" : "auto",
          }}
        >
          {pictograms.map((pictogram) => (
            <PictogramCard
              key={`${pictogram.indexSequence}_${pictogram.img.selectedId}`}
              pictogram={pictogram}
              view="complete"
              defaults={defaults}
              variant="plane"
              size={{ pictSize: view.sizePict, scale: 1 }}
            />
          ))}
        </SelectableSequence>
      ))}
    </Stack>
  );
};

export default AutoSheetFlow;
