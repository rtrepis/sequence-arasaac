import {
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { MdTableRows, MdViewColumn } from "react-icons/md";
import { MdScreenRotation } from "react-icons/md";
import { ViewSettings, SequenceDirection, PageOrientation } from "@/types/ui";
import StyledToggleButtonGroup from "@/style/StyledToggleButtonGroup";
import { SettingRow } from "@/components/SettingsLayout";
import messages from "./ViewSequencesSettings.lang";

interface GlobalViewControlsProps {
  viewSettings: ViewSettings;
  pageSizeIndex: number;
  sequenceCount: number;
  onPageSizeChange: (event: SelectChangeEvent<number>) => void;
  onDirectionChange: (
    event: React.MouseEvent<HTMLElement>,
    newDirection: SequenceDirection | null,
  ) => void;
  onSequenceSpaceChange: (event: Event, value: number | number[]) => void;
  onOrientationChange?: (orientation: PageOrientation) => void;
}

/**
 * Controls globals de visualització: format de pàgina, orientació, separació
 * entre seqüències i direcció. Només files d'ajust (`SettingRow`); qui el
 * consumeix decideix la secció que l'embolcalla i els botons d'acció.
 */
const GlobalViewControls = ({
  viewSettings,
  pageSizeIndex,
  sequenceCount,
  onPageSizeChange,
  onDirectionChange,
  onSequenceSpaceChange,
  onOrientationChange,
}: GlobalViewControlsProps): React.ReactElement => {
  const intl = useIntl();

  return (
    <>
      <SettingRow title={<FormattedMessage {...messages.pageSize} />}>
        <Select<number>
          value={pageSizeIndex}
          onChange={onPageSizeChange}
          size="small"
          fullWidth
        >
          <MenuItem value={0}>A4</MenuItem>
          <MenuItem value={1}>A3</MenuItem>
          <MenuItem value={2}>
            <FormattedMessage {...messages.fullScreen} />
          </MenuItem>
        </Select>
      </SettingRow>

      {onOrientationChange && (
        <SettingRow
          title={<FormattedMessage {...messages.tooltipOrientation} />}
          control="wide"
        >
          <StyledToggleButtonGroup
            value={viewSettings.orientation}
            exclusive
            onChange={(_, val: PageOrientation | null) => val && onOrientationChange(val)}
          >
            <Tooltip title={intl.formatMessage(messages.tooltipDirectionRow)}>
              <ToggleButton value="landscape" aria-label="landscape">
                <MdScreenRotation style={{ transform: "rotate(90deg)" }} />
              </ToggleButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage(messages.tooltipDirectionColumn)}>
              <ToggleButton value="portrait" aria-label="portrait">
                <MdScreenRotation />
              </ToggleButton>
            </Tooltip>
          </StyledToggleButtonGroup>
        </SettingRow>
      )}

      {sequenceCount > 1 && (
        <SettingRow title={<FormattedMessage {...messages.sequenceSpaceBetween} />}>
          <Slider
            name="sequenceSpaceBetween"
            step={0.5}
            min={0}
            max={10}
            value={viewSettings.sequenceSpaceBetween}
            valueLabelDisplay="auto"
            valueLabelFormat={(value: number) =>
              parseFloat(value.toFixed(2))
            }
            onChange={onSequenceSpaceChange}
          />
        </SettingRow>
      )}

      <SettingRow
        title={<FormattedMessage {...messages.direction} />}
        control="wide"
      >
        <StyledToggleButtonGroup
          value={viewSettings.direction}
          exclusive
          onChange={onDirectionChange}
        >
          <Tooltip title={intl.formatMessage(messages.tooltipDirectionRow)}>
            <ToggleButton value="row" aria-label="row">
              <MdTableRows />
            </ToggleButton>
          </Tooltip>
          <Tooltip
            title={intl.formatMessage(messages.tooltipDirectionColumn)}
          >
            <ToggleButton value="column" aria-label="column">
              <MdViewColumn />
            </ToggleButton>
          </Tooltip>
        </StyledToggleButtonGroup>
      </SettingRow>
    </>
  );
};

export default GlobalViewControls;
