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
import { SequenceAlignmentH, SequenceAlignmentV, SequenceViewSettings } from "@/types/document";
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
  onAccordionToggle: (key: number) => (e: React.SyntheticEvent, expanded: boolean) => void;
  onApplyAllChange: (e: React.SyntheticEvent, checked: boolean) => void;
  onSequenceSliderChange: (seqKey: number) => (event: Event, value: number | number[]) => void;
  onAlignmentHChange: (seqKey: number) => (event: React.MouseEvent<HTMLElement>, value: SequenceAlignmentH | null) => void;
  onAlignmentVChange: (seqKey: number) => (event: React.MouseEvent<HTMLElement>, value: SequenceAlignmentV | null) => void;
}

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
            <FormattedMessage {...messages.alignmentH} />
          </FormLabel>
          <ToggleButtonGroup
            value={seqView.alignmentH}
            exclusive
            onChange={onAlignmentHChange(seqKey)}
            size="small"
          >
            <Tooltip title={intl.formatMessage(messages.tooltipAlignLeft)}>
              <ToggleButton value="left" aria-label="left">
                <MdFormatAlignLeft />
              </ToggleButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage(messages.tooltipAlignHCenter)}>
              <ToggleButton value="center" aria-label="center">
                <MdFormatAlignCenter />
              </ToggleButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage(messages.tooltipAlignRight)}>
              <ToggleButton value="right" aria-label="right">
                <MdFormatAlignRight />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </FormGroup>

        <FormGroup>
          <FormLabel component="legend">
            <FormattedMessage {...messages.alignmentV} />
          </FormLabel>
          <ToggleButtonGroup
            value={seqView.alignmentV}
            exclusive
            onChange={onAlignmentVChange(seqKey)}
            size="small"
          >
            <Tooltip title={intl.formatMessage(messages.tooltipAlignTop)}>
              <ToggleButton value="top" aria-label="top">
                <MdVerticalAlignTop />
              </ToggleButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage(messages.tooltipAlignVCenter)}>
              <ToggleButton value="center" aria-label="center">
                <MdVerticalAlignCenter />
              </ToggleButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage(messages.tooltipAlignBottom)}>
              <ToggleButton value="bottom" aria-label="bottom">
                <MdVerticalAlignBottom />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </FormGroup>
      </Stack>
    );
  };

  return (
    <>
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

      {sequenceKeys.map((seqKey) => (
        <Accordion
          key={seqKey}
          expanded={expandedAccordion === seqKey}
          onChange={onAccordionToggle(seqKey)}
          disableGutters
          sx={{
            display: applyAll && seqKey !== sequenceKeys[0] ? "none" : "block",
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
