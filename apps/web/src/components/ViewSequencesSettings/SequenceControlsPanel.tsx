import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Slider,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  MdExpandMore,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdVerticalAlignTop,
  MdVerticalAlignCenter,
  MdVerticalAlignBottom,
} from "react-icons/md";
import {
  SequenceAlignmentH,
  SequenceAlignmentV,
  SequenceViewSettings,
} from "@/types/document";
import StyledToggleButtonGroup from "@/style/StyledToggleButtonGroup";
import {
  SettingRow,
  IconToggleButton,
  SETTINGS_ROW_GAP,
  settingsAccordion,
} from "@/components/SettingsLayout";
import messages from "./ViewSequencesSettings.lang";
import {
  SEQ_VIEW_DEFAULT_SIZE_PICT,
  SEQ_VIEW_DEFAULT_PICT_SPACE,
  SEQ_VIEW_DEFAULT_ALIGNMENT_H,
  SEQ_VIEW_DEFAULT_ALIGNMENT_V,
  SIZE_PICT_MIN,
  SIZE_PICT_MAX,
  SIZE_PICT_STEP,
} from "@/configs/viewSettingsConfig";

interface SequenceControlsPanelProps {
  sequenceKeys: number[];
  sequenceViewSettings: { [key: number]: SequenceViewSettings };
  applyAll: boolean;
  expandedAccordion: number | null;
  onAccordionToggle: (
    key: number,
  ) => (e: React.SyntheticEvent, expanded: boolean) => void;
  onApplyAllChange: (e: React.SyntheticEvent, checked: boolean) => void;
  onSequenceSliderChange: (
    seqKey: number,
  ) => (event: Event, value: number | number[]) => void;
  onAlignmentHChange: (
    seqKey: number,
  ) => (
    event: React.MouseEvent<HTMLElement>,
    value: SequenceAlignmentH | null,
  ) => void;
  onAlignmentVChange: (
    seqKey: number,
  ) => (
    event: React.MouseEvent<HTMLElement>,
    value: SequenceAlignmentV | null,
  ) => void;
}

/**
 * Ajustos d'una seqüència concreta (mida, separació i alineació dels pictogrames),
 * dins d'un acordió per seqüència. Segueix l'estàndard de configuracions:
 * cada ajust és un `SettingRow` i els selectors d'opcions són `StyledToggleButtonGroup`.
 */
const SequenceControlsPanel = ({
  sequenceKeys,
  sequenceViewSettings,
  applyAll,
  expandedAccordion,
  onAccordionToggle,
  onApplyAllChange,
  onSequenceSliderChange,
  onAlignmentHChange,
  onAlignmentVChange,
}: SequenceControlsPanelProps): React.ReactElement => {
  const intl = useIntl();

  const renderSequenceControls = (seqKey: number) => {
    const seqView = sequenceViewSettings[seqKey] ?? {
      sizePict: SEQ_VIEW_DEFAULT_SIZE_PICT,
      pictSpaceBetween: SEQ_VIEW_DEFAULT_PICT_SPACE,
      alignmentH: SEQ_VIEW_DEFAULT_ALIGNMENT_H,
      alignmentV: SEQ_VIEW_DEFAULT_ALIGNMENT_V,
    };
    // Prefix únic per als ids dels títols: cada acordió repeteix els mateixos ajustos
    const labelId = `sequence-${seqKey}`;

    return (
      <Stack direction="column" gap={SETTINGS_ROW_GAP}>
        <SettingRow
          title={<FormattedMessage {...messages.size} />}
          labelId={`${labelId}-size`}
        >
          <Slider
            name="sizePict"
            step={SIZE_PICT_STEP}
            min={SIZE_PICT_MIN}
            max={SIZE_PICT_MAX}
            value={seqView.sizePict}
            valueLabelDisplay="auto"
            valueLabelFormat={(value: number) => parseFloat(value.toFixed(2))}
            onChange={onSequenceSliderChange(seqKey)}
            aria-labelledby={`${labelId}-size`}
          />
        </SettingRow>

        <SettingRow
          title={<FormattedMessage {...messages.pictSpaceBetween} />}
          labelId={`${labelId}-space`}
        >
          <Slider
            name="pictSpaceBetween"
            step={0.5}
            min={-2}
            max={10}
            value={seqView.pictSpaceBetween}
            valueLabelDisplay="auto"
            valueLabelFormat={(value: number) => parseFloat(value.toFixed(2))}
            onChange={onSequenceSliderChange(seqKey)}
            aria-labelledby={`${labelId}-space`}
          />
        </SettingRow>

        <SettingRow
          title={<FormattedMessage {...messages.alignmentH} />}
          labelId={`${labelId}-alignment-h`}
          control="wide"
        >
          <StyledToggleButtonGroup
            value={seqView.alignmentH}
            exclusive
            onChange={onAlignmentHChange(seqKey)}
            aria-labelledby={`${labelId}-alignment-h`}
          >
            <IconToggleButton value="left" message={messages.tooltipAlignLeft}>
              <MdFormatAlignLeft />
            </IconToggleButton>
            <IconToggleButton
              value="center"
              message={messages.tooltipAlignHCenter}
            >
              <MdFormatAlignCenter />
            </IconToggleButton>
            <IconToggleButton
              value="right"
              message={messages.tooltipAlignRight}
            >
              <MdFormatAlignRight />
            </IconToggleButton>
          </StyledToggleButtonGroup>
        </SettingRow>

        <SettingRow
          title={<FormattedMessage {...messages.alignmentV} />}
          labelId={`${labelId}-alignment-v`}
          control="wide"
        >
          <StyledToggleButtonGroup
            value={seqView.alignmentV}
            exclusive
            onChange={onAlignmentVChange(seqKey)}
            aria-labelledby={`${labelId}-alignment-v`}
          >
            <IconToggleButton value="top" message={messages.tooltipAlignTop}>
              <MdVerticalAlignTop />
            </IconToggleButton>
            <IconToggleButton
              value="center"
              message={messages.tooltipAlignVCenter}
            >
              <MdVerticalAlignCenter />
            </IconToggleButton>
            <IconToggleButton
              value="bottom"
              message={messages.tooltipAlignBottom}
            >
              <MdVerticalAlignBottom />
            </IconToggleButton>
          </StyledToggleButtonGroup>
        </SettingRow>
      </Stack>
    );
  };

  return (
    <>
      {sequenceKeys.length > 1 && (
        <SettingRow
          title={<FormattedMessage {...messages.applyAll} />}
          control="compact"
        >
          <Tooltip title={intl.formatMessage(messages.tooltipApplyAll)}>
            <Switch
              checked={applyAll}
              onChange={onApplyAllChange}
              inputProps={{
                "aria-label": intl.formatMessage(messages.applyAll),
              }}
            />
          </Tooltip>
        </SettingRow>
      )}

      {sequenceKeys.map((seqKey) => (
        <Accordion
          key={seqKey}
          expanded={expandedAccordion === seqKey}
          onChange={onAccordionToggle(seqKey)}
          disableGutters
          elevation={0}
          sx={{
            ...settingsAccordion,
            display: applyAll && seqKey !== sequenceKeys[0] ? "none" : "block",
          }}
        >
          <AccordionSummary expandIcon={<MdExpandMore />} sx={{ px: 0 }}>
            <Typography variant="subtitle2">
              {applyAll
                ? intl.formatMessage(messages.sequence)
                : `${intl.formatMessage(messages.sequence)} ${seqKey + 1}`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            {renderSequenceControls(applyAll ? sequenceKeys[0] : seqKey)}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

export default SequenceControlsPanel;
