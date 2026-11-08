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

/** Un bloc d'una pàgina contínua: una seqüència o un rètol. */
type FlowBlock =
  | {
      kind: "sequence";
      placement: SequencePlacement;
      pictograms: Sequence;
      view: SequenceViewSettings;
    }
  | { kind: "text"; placement: TextPlacement };
import {
  selectDocumentContent,
  selectNamedStyles,
} from "@features/free-layout/store/freeLayoutThunks";
import SelectableSequence from "@features/free-layout/components/SelectableSequence";
import { ALIGN_H, ALIGN_V } from "@shared/constants/alignmentMaps";
import type {
  SequencePlacement,
  SequenceViewSettings,
  TextPlacement,
} from "@/types/document";
import type { Sequence } from "@/types/sequence";
import { useIntl } from "react-intl";
import { resolveTextBlockStyle } from "@features/free-layout/model/blockStyle";
import { TextContent, useTextBlockName } from "./TextBlock";
import messages from "./FreeLayoutPages.lang";

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
 * pàgina. Cada seqüència és un bloc i es pot seleccionar (R5). Un rètol (R9)
 * ocupa una línia sencera en una pàgina en files, i es pot seleccionar igual.
 * Els blocs que l'app no entén no es pinten.
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
  const intl = useIntl();
  const textName = useTextBlockName();

  const blocks = placements.flatMap((placement): FlowBlock[] => {
    if (placement.kind === "text") return [{ kind: "text", placement }];
    if (placement.kind !== "sequence") return [];
    const pictograms = content[placement.sequenceKey];
    const sequenceView = views[placement.sequenceKey];
    if (!pictograms || !sequenceView) return [];
    const view = resolveBlockView(
      sequenceView,
      namedStyleOf(styles, placement.styleId),
      placement.view,
    );
    return [{ kind: "sequence", placement, pictograms, view }];
  });

  const isRow = direction === "row";
  // Com al full de sempre: la primera seqüència diu on va el conjunt a l'eix creuat
  const first = blocks.flatMap((block) =>
    block.kind === "sequence" ? [block.view] : [],
  )[0];
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
      {blocks.map((block) => {
        if (block.kind === "text") {
          const { placement } = block;
          const name = textName(placement.text);
          return (
            <SelectableSequence
              key={placement.id}
              // No compten: el rètol porta el seu nom i la seva selecció
              sequenceKey={-1}
              pictogramCount={0}
              label={intl.formatMessage(messages.textBlockLabel, {
                text: name,
                common: "false",
              })}
              selectable
              target={{ kind: "block", placementId: placement.id, sheetIndex }}
              sx={{ width: isRow ? "100%" : "auto" }}
            >
              <TextContent
                text={placement.text}
                style={resolveTextBlockStyle(
                  defaults.font,
                  namedStyleOf(styles, placement.styleId),
                  placement,
                )}
              />
            </SelectableSequence>
          );
        }
        const { placement, pictograms, view } = block;
        return (
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
        );
      })}
    </Stack>
  );
};

export default AutoSheetFlow;
