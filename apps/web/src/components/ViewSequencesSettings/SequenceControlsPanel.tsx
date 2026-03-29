import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Slider,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
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
import { SequenceAlignment, SequenceViewSettings } from "@/types/document";
import { SequenceDirection } from "@/types/ui";
import messages from "./ViewSequencesSettings.lang";
import {
  SEQ_VIEW_DEFAULT_SIZE_PICT,
  SEQ_VIEW_DEFAULT_PICT_SPACE,
  SEQ_VIEW_DEFAULT_ALIGNMENT,
  SIZE_PICT_MIN,
  SIZE_PICT_MAX,
  SIZE_PICT_STEP,
} from "@/configs/viewSettingsConfig";

interface SequenceControlsPanelProps {
  sequenceKeys: number[];
  sequenceViewSettings: { [key: number]: SequenceViewSettings };
  viewDirection: SequenceDirection;
  applyAll: boolean;
  expandedAccordion: number | null;
  onAccordionToggle: (
    key: number,
  ) => (e: React.SyntheticEvent, expanded: boolean) => void;
  onApplyAllChange: (e: React.SyntheticEvent, checked: boolean) => void;
  onSequenceSliderChange: (
    seqKey: number,
  ) => (event: Event, value: number | number[]) => void;
  onAlignmentChange: (
    seqKey: number,
  ) => (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: SequenceAlignment | null,
  ) => void;
}

/**
 * Panell de controls individuals per seqüència: switch apply-all i acordions
 */
const SequenceControlsPanel = ({
  sequenceKeys,
  sequenceViewSettings,
  viewDirection,
  applyAll,
  expandedAccordion,
  onAccordionToggle,
  onApplyAllChange,
  onSequenceSliderChange,
  onAlignmentChange,
}: SequenceControlsPanelProps): React.ReactElement => {
  const intl = useIntl();

  /**
   * Renderitza els controls interns d'una seqüència dins l'acordió
   */
  const renderSequenceControls = (seqKey: number) => {
    const seqView = sequenceViewSettings[seqKey] ?? {
      sizePict: SEQ_VIEW_DEFAULT_SIZE_PICT,
      pictSpaceBetween: SEQ_VIEW_DEFAULT_PICT_SPACE,
      alignment: SEQ_VIEW_DEFAULT_ALIGNMENT as SequenceAlignment,
    };

    // Mostrar icones d'alineació diferents segons la direcció global
    const isColumn = viewDirection === "column";

    return (
      <Stack spacing={1}>
        <FormGroup>
          <FormLabel>
            <FormattedMessage {...messages.size} />
            <Slider
              name="sizePict"
              step={SIZE_PICT_STEP}
              min={SIZE_PICT_MIN}
              max={SIZE_PICT_MAX}
              value={seqView.sizePict}
              valueLabelDisplay="auto"
              valueLabelFormat={(value: number) => parseFloat(value.toFixed(2))}
              onChange={onSequenceSliderChange(seqKey)}
            />
          </FormLabel>
        </FormGroup>
        <FormGroup>
          <FormLabel>
            <FormattedMessage {...messages.pictSpaceBetween} />
            <Slider
              name="pictSpaceBetween"
              step={0.5}
              min={-2}
              max={10}
              value={seqView.pictSpaceBetween}
              valueLabelDisplay="auto"
              valueLabelFormat={(value: number) => parseFloat(value.toFixed(2))}
              onChange={onSequenceSliderChange(seqKey)}
            />
          </FormLabel>
        </FormGroup>
        <FormGroup>
          <FormLabel component="legend">
            <FormattedMessage {...messages.alignment} />
          </FormLabel>
          <ToggleButtonGroup
            value={seqView.alignment}
            exclusive
            onChange={onAlignmentChange(seqKey)}
            size="small"
          >
            <Tooltip title={intl.formatMessage(messages.tooltipAlignLeft)}>
              <ToggleButton value="left" aria-label="left">
                {isColumn ? <MdVerticalAlignTop /> : <MdFormatAlignLeft />}
              </ToggleButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage(messages.tooltipAlignCenter)}>
              <ToggleButton value="center" aria-label="center">
                {isColumn ? <MdVerticalAlignCenter /> : <MdFormatAlignCenter />}
              </ToggleButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage(messages.tooltipAlignRight)}>
              <ToggleButton value="right" aria-label="right">
                {isColumn ? <MdVerticalAlignBottom /> : <MdFormatAlignRight />}
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </FormGroup>
      </Stack>
    );
  };

  return (
    <>
      {/* Switch aplicar a totes: només visible quan hi ha més d'una seqüència */}
      {sequenceKeys.length > 1 && (
        <FormGroup>
          <Tooltip title={intl.formatMessage(messages.tooltipApplyAll)}>
            <FormControlLabel
              control={
                <Switch
                  checked={applyAll}
                  onChange={onApplyAllChange}
                  size="small"
                />
              }
              label={intl.formatMessage(messages.applyAll)}
            />
          </Tooltip>
        </FormGroup>
      )}

      {/* Acordions per cada seqüència */}
      {sequenceKeys.map((seqKey) => (
        <Accordion
          key={seqKey}
          expanded={expandedAccordion === seqKey}
          onChange={onAccordionToggle(seqKey)}
          disableGutters
          sx={{
            // Quan applyAll, amagar totes menys la primera
            display:
              applyAll && seqKey !== sequenceKeys[0] ? "none" : "block",
          }}
        >
          <AccordionSummary expandIcon={<MdExpandMore />}>
            <Typography variant="subtitle2">
              {applyAll
                ? intl.formatMessage(messages.sequence)
                : `${intl.formatMessage(messages.sequence)} ${seqKey + 1}`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {renderSequenceControls(applyAll ? sequenceKeys[0] : seqKey)}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

export default SequenceControlsPanel;
