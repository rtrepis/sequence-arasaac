import React from "react";
import { useIntl } from "react-intl";
import PictogramCard from "@components/PictogramCard/PictogramCard";
import type { PictogramCardDefaults, Sequence } from "@/types/sequence";
import type { SequencePlacement, SequenceViewSettings } from "@/types/document";
import {
  blockGrid,
  resolveColumns,
} from "@features/free-layout/model/blockGrid";
import type { Arrangement } from "@features/free-layout/model/templates";
import { ALIGN_H, ALIGN_V } from "@shared/constants/alignmentMaps";
import type { CardBaseSize } from "./CardBaseMeasurer";
import type { SheetArea } from "@features/free-layout/model/placement";
import PlacementBox from "./PlacementBox";
import messages from "./FreeLayoutPages.lang";

interface SequenceBlockProps {
  placement: SequencePlacement;
  sheetIndex: number;
  sheetCount: number;
  common: boolean;
  name: string;
  pictograms: Sequence;
  /** La vista del bloc, ja resolta amb la cascada: la mida hi és el màxim (Q2) */
  view: SequenceViewSettings;
  cardBase: CardBaseSize | undefined;
  defaults: PictogramCardDefaults;
  /** El repartiment de la pàgina: decideix les columnes automàtiques del bloc */
  arrangement?: Arrangement["kind"];
  scale: number;
  /** L'àrea útil del full: amb ella, el bloc es pot moure (fase 4) */
  area?: SheetArea;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Un bloc de seqüència en una pàgina: la graella de pictogrames que hi cap
 * sense passar de la mida del bloc (Q2, ADR-005), dins de la caixa.
 */
const SequenceBlock = ({
  placement,
  name,
  pictograms,
  view,
  cardBase,
  defaults,
  arrangement,
  common,
  ...box
}: SequenceBlockProps): React.ReactElement => {
  const intl = useIntl();
  const { grid, gapPx } = blockGrid({
    count: pictograms.length,
    card: cardBase,
    view,
    box: { w: placement.w, h: placement.h },
    columns: resolveColumns(placement.columns, arrangement, pictograms.length),
  });

  return (
    <PlacementBox
      {...box}
      placement={placement}
      common={common}
      name={name}
      label={intl.formatMessage(messages.placementLabel, {
        name,
        count: pictograms.length,
        common: String(common),
      })}
      actionsLabel={intl.formatMessage(messages.placementActions, { name })}
      belowMinimum={grid.belowMinimum}
      contentSx={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.max(1, grid.columns)}, max-content)`,
        columnGap: `${gapPx}px`,
        rowGap: `${gapPx}px`,
        justifyContent: ALIGN_H[view.alignmentH],
        alignContent: ALIGN_V[view.alignmentV],
        alignItems: "start",
      }}
    >
      {pictograms.map((pictogram) => (
        <PictogramCard
          key={`${pictogram.indexSequence}_${pictogram.img.selectedId}`}
          pictogram={pictogram}
          view="complete"
          defaults={defaults}
          variant="plane"
          size={{ pictSize: grid.size, scale: 1 }}
        />
      ))}
    </PlacementBox>
  );
};

export default SequenceBlock;
