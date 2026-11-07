import React from "react";
import { MenuItem, Select, Switch } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import StyledButton from "@/style/StyledButton";
import type { PlacementColumns, SequenceViewSettings } from "@/types/document";
import { SectionTitle, SettingRow } from "@/components/SettingsLayout";
import SettingsLevel from "@components/ViewSequencesSettings/SettingsLevel";
import SequenceViewRows from "@components/ViewSequencesSettings/SequenceViewRows";
import { updateSequenceViewSettingsActionCreator } from "@features/sequence/store/documentSlice";
import { blockGrid } from "@features/free-layout/model/blockGrid";
import {
  copyPlacementToSheetThunk,
  removePlacementThunk,
  selectPages,
  setPlacementColumnsThunk,
  setPlacementCommonThunk,
  setPlacementViewThunk,
} from "@features/free-layout/store/freeLayoutThunks";
import {
  VIEW_BLOCK_LEVEL_ID,
  useViewSelection,
} from "@features/free-layout/hooks/useViewSelection";
import { useSelectedBlock } from "@features/free-layout/hooks/useSelectedBlock";
import { columnChoicesFor } from "@features/free-layout/components/FreeLayoutPages/PlacementBox";
import pageMessages from "@features/free-layout/components/FreeLayoutPages/FreeLayoutPages.lang";
import messages from "./ViewLevels.lang";

/** Prefix dels ids dels títols de fila, per lligar-los als controls. */
const LABEL_ID = "view-level-block";

interface BlockLevelProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

/**
 * El nivell «Bloc» de la columna de la vista: els ajustos del bloc
 * seleccionat al full (R5, R8). En una pàgina amb caixes, canvia **només
 * aquest bloc** (el seu retoc, M1) i la mida és un màxim (Q2); les accions del
 * menú del bloc hi són a la secció «Lloc». A la disposició automàtica, cada
 * seqüència és el seu únic bloc, i el que canvia és la vista de la seqüència.
 * Sense res seleccionat, no hi és.
 */
const BlockLevel = ({
  expanded,
  onExpandedChange,
}: BlockLevelProps): React.ReactElement | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const { cardSizes } = useViewSelection();
  const pages = useAppSelector(selectPages);
  const block = useSelectedBlock();
  if (!block) return null;

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
        title={block.name}
        scope={intl.formatMessage(messages.sequenceScope)}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
      >
        <SequenceViewRows
          view={block.view}
          labelId={LABEL_ID}
          onChange={change}
        />
      </SettingsLevel>
    );
  }

  const { placement, sheetIndex, common, name, pictograms, view } = block;
  const sheetCount = pages?.sheets.length ?? 1;
  const { grid, imageMm } = blockGrid({
    count: pictograms.length,
    card: cardSizes[placement.sequenceKey],
    view,
    box: { w: placement.w, h: placement.h },
    columns: placement.columns,
  });
  const mm = intl.formatNumber(imageMm, { maximumFractionDigits: 0 });
  const otherPages = Array.from(
    { length: sheetCount },
    (_, index) => index,
  ).filter((index) => index !== sheetIndex);

  return (
    <SettingsLevel
      id={VIEW_BLOCK_LEVEL_ID}
      title={name}
      scope={intl.formatMessage(messages.blockScope, {
        common: String(common),
      })}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      <SequenceViewRows
        view={view}
        labelId={LABEL_ID}
        onChange={(change) =>
          dispatch(setPlacementViewThunk(placement.id, change))
        }
        sizeHelper={intl.formatMessage(
          grid.belowMinimum ? messages.sizeTooSmall : messages.sizeMax,
          { mm },
        )}
      />

      <SettingRow
        title={<FormattedMessage {...pageMessages.columns} />}
        labelId={`${LABEL_ID}-columns`}
      >
        <Select<string>
          value={String(placement.columns)}
          onChange={(event) => {
            const value = event.target.value;
            const columns: PlacementColumns =
              value === "auto" ? "auto" : Number(value);
            dispatch(setPlacementColumnsThunk(placement.id, columns));
          }}
          size="small"
          fullWidth
          labelId={`${LABEL_ID}-columns`}
        >
          {columnChoicesFor(pictograms.length).map((columns) => (
            <MenuItem key={columns} value={String(columns)}>
              {columns === "auto"
                ? intl.formatMessage(pageMessages.columnsAuto)
                : columns}
            </MenuItem>
          ))}
        </Select>
      </SettingRow>

      <SectionTitle title={<FormattedMessage {...messages.place} />}>
        <SettingRow
          title={<FormattedMessage {...pageMessages.onEveryPage} />}
          labelId={`${LABEL_ID}-common`}
          control="compact"
        >
          <Switch
            checked={common}
            onChange={(_, checked) => {
              dispatch(
                setPlacementCommonThunk(placement.id, checked, sheetIndex),
              );
              // Treure'l de totes té el seu propi snackbar, amb «Desfés»
              if (checked)
                showSnackbar({
                  message: intl.formatMessage(pageMessages.madeCommon, {
                    name,
                  }),
                  severity: "success",
                });
            }}
            inputProps={{ "aria-labelledby": `${LABEL_ID}-common` }}
          />
        </SettingRow>

        {!common && otherPages.length > 0 && (
          <SettingRow
            title={<FormattedMessage {...pageMessages.copyToPage} />}
            labelId={`${LABEL_ID}-copy`}
          >
            <Select<string>
              value=""
              displayEmpty
              renderValue={() => intl.formatMessage(messages.choosePage)}
              onChange={(event) => {
                const index = Number(event.target.value);
                if (Number.isNaN(index)) return;
                dispatch(copyPlacementToSheetThunk(placement.id, index));
                showSnackbar({
                  message: intl.formatMessage(pageMessages.copiedToPage, {
                    name,
                    number: index + 1,
                  }),
                  severity: "success",
                });
              }}
              size="small"
              fullWidth
              labelId={`${LABEL_ID}-copy`}
            >
              {otherPages.map((index) => (
                <MenuItem key={index} value={String(index)}>
                  {intl.formatMessage(pageMessages.pageNumber, {
                    number: index + 1,
                  })}
                </MenuItem>
              ))}
            </Select>
          </SettingRow>
        )}

        <SettingRow
          title={
            <FormattedMessage
              {...(common
                ? pageMessages.removeFromEveryPage
                : pageMessages.removeFromPage)}
            />
          }
          labelId={`${LABEL_ID}-remove`}
          control="compact"
        >
          {/* Surt el snackbar amb «Desfés» */}
          <StyledButton
            color="inherit"
            aria-describedby={`${LABEL_ID}-remove`}
            onClick={() => dispatch(removePlacementThunk(placement.id))}
          >
            <FormattedMessage {...messages.remove} />
          </StyledButton>
        </SettingRow>
      </SectionTitle>
    </SettingsLevel>
  );
};

export default BlockLevel;
