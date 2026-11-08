import React from "react";
import { Typography } from "@mui/material";
import { MdOutlineViewQuilt } from "react-icons/md";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { SequenceViewSettings } from "@/types/document";
import SettingsLevel from "@components/ViewSequencesSettings/SettingsLevel";
import levelMessages from "@components/ViewSequencesSettings/ViewLevels.lang";
import SequenceViewRows from "@components/ViewSequencesSettings/SequenceViewRows";
import { updateSequenceViewSettingsActionCreator } from "@features/sequence/store/documentSlice";
import { blockGrid } from "@features/free-layout/model/blockGrid";
import {
  selectPages,
  setPlacementViewThunk,
} from "@features/free-layout/store/freeLayoutThunks";
import {
  VIEW_BLOCK_LEVEL_ID,
  useViewSelection,
} from "@features/free-layout/hooks/useViewSelection";
import { useSelectedBlock } from "@features/free-layout/hooks/useSelectedBlock";
import { usePageUniform } from "@features/free-layout/hooks/usePageUniform";
import messages from "./ViewLevels.lang";

/** La icona del nivell: un bloc dins de la pàgina. */
export const BlockIcon = (): React.ReactElement => <MdOutlineViewQuilt />;

/** Prefix dels ids dels títols de fila, per lligar-los als controls. */
const LABEL_ID = "view-level-block";

interface BlockLevelProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

/**
 * El nivell «Bloc» de la columna de la vista: els ajustos del bloc
 * seleccionat al full (R5, R8). En una pàgina amb caixes, canvia **només
 * aquest bloc** (el seu retoc, M1) i la mida és un màxim (Q2). La mida i
 * l'espai dels pictogrames només es toquen aquí. Les accions (a totes les
 * pàgines, copiar, treure) són al menú del bloc, al full. A la disposició automàtica, cada
 * seqüència és el seu únic bloc, i el que canvia és la vista de la seqüència.
 * Sense res seleccionat, no hi és.
 */
const BlockLevel = ({
  expanded,
  onExpandedChange,
}: BlockLevelProps): React.ReactElement | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { cardSizes } = useViewSelection();
  const pages = useAppSelector(selectPages);
  const block = useSelectedBlock();
  // Si la pàgina del bloc té «la mateixa configuració a tots els blocs», la
  // mida, l'espai i l'alineació són al nivell «Pàgina», no aquí
  const page = usePageUniform(block?.kind === "block" ? block.sheetIndex : 0);
  const fromPage = page.uniform && page.blockCount > 1;
  if (!block) return null;

  /** El que diu el nivell en lloc dels ajustos, quan els porta la pàgina. */
  const pageRules = (
    <Typography variant="body2" color="text.secondary">
      <FormattedMessage {...messages.uniformBlock} />
    </Typography>
  );

  if (block.kind === "sequence") {
    const change = (settings: Partial<SequenceViewSettings>) =>
      dispatch(
        updateSequenceViewSettingsActionCreator({
          key: block.sequenceKey,
          settings,
          base: block.view,
        }),
      );
    return (
      <SettingsLevel
        id={VIEW_BLOCK_LEVEL_ID}
        icon={<BlockIcon />}
        kind={<FormattedMessage {...levelMessages.kindBlock} />}
        title={block.name}
        scope={intl.formatMessage(messages.sequenceScope)}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
      >
        {fromPage ? (
          pageRules
        ) : (
          <SequenceViewRows
            view={block.view}
            labelId={LABEL_ID}
            onChange={change}
          />
        )}
      </SettingsLevel>
    );
  }

  const { placement, common, name, pictograms, view, sheetIndex } = block;
  // En una pàgina contínua la mida és la mida; en blocs, un màxim (Q2)
  const continuous = pages?.sheets[sheetIndex]?.mode === "auto";
  const { grid, imageMm } = blockGrid({
    count: pictograms.length,
    card: cardSizes[placement.sequenceKey],
    view,
    box: { w: placement.w, h: placement.h },
    // Les columnes de dins d'un bloc, de moment, sempre automàtiques
    columns: "auto",
  });
  const mm = intl.formatNumber(imageMm, { maximumFractionDigits: 0 });

  return (
    <SettingsLevel
      id={VIEW_BLOCK_LEVEL_ID}
      icon={<BlockIcon />}
      kind={<FormattedMessage {...levelMessages.kindBlock} />}
      title={name}
      scope={intl.formatMessage(messages.blockScope, {
        common: String(common),
      })}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      {/* Un bloc comú surt a totes les pàgines: no segueix cap pàgina */}
      {fromPage && !common ? (
        pageRules
      ) : (
        <SequenceViewRows
          view={view}
          labelId={LABEL_ID}
          onChange={(change) =>
            dispatch(setPlacementViewThunk(placement.id, change))
          }
          sizeHelper={
            continuous
              ? undefined
              : intl.formatMessage(
                  grid.belowMinimum ? messages.sizeTooSmall : messages.sizeMax,
                  { mm },
                )
          }
        />
      )}
    </SettingsLevel>
  );
};

export default BlockLevel;
