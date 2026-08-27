import { MenuItem, Select, SelectChangeEvent, Slider } from "@mui/material";
import React from "react";
import { FormattedMessage } from "react-intl";
import { MdTableRows, MdViewColumn } from "react-icons/md";
import { MdScreenRotation } from "react-icons/md";
import { ViewSettings, SequenceDirection, PageOrientation } from "@/types/ui";
import StyledToggleButtonGroup from "@/style/StyledToggleButtonGroup";
import { SettingRow, IconToggleButton } from "@/components/SettingsLayout";
import messages from "./ViewSequencesSettings.lang";

// Prefix dels ids dels títols de fila, per lligar-los als controls amb aria-labelledby
const GLOBAL_CONTROLS_LABEL_ID = "global-view-controls";

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
}: GlobalViewControlsProps): React.ReactElement => (
  <>
    <SettingRow
      title={<FormattedMessage {...messages.pageSize} />}
      labelId={`${GLOBAL_CONTROLS_LABEL_ID}-page-size`}
    >
      {/* Sense InputLabel flotant: el títol de la fila ja fa d'etiqueta */}
      <Select<number>
        value={pageSizeIndex}
        onChange={onPageSizeChange}
        size="small"
        fullWidth
        labelId={`${GLOBAL_CONTROLS_LABEL_ID}-page-size`}
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
          <IconToggleButton
            value="landscape"
            message={messages.tooltipOrientationLandscape}
          >
            <MdScreenRotation style={{ transform: "rotate(90deg)" }} />
          </IconToggleButton>
          <IconToggleButton
            value="portrait"
            message={messages.tooltipOrientationPortrait}
          >
            <MdScreenRotation />
          </IconToggleButton>
        </StyledToggleButtonGroup>
      </SettingRow>
    )}

    {sequenceCount > 1 && (
      <SettingRow
        title={<FormattedMessage {...messages.sequenceSpaceBetween} />}
        labelId={`${GLOBAL_CONTROLS_LABEL_ID}-sequence-space`}
      >
        <Slider
          aria-labelledby={`${GLOBAL_CONTROLS_LABEL_ID}-sequence-space`}
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
        <IconToggleButton value="row" message={messages.tooltipDirectionRow}>
          <MdTableRows />
        </IconToggleButton>
        <IconToggleButton
          value="column"
          message={messages.tooltipDirectionColumn}
        >
          <MdViewColumn />
        </IconToggleButton>
      </StyledToggleButtonGroup>
    </SettingRow>
  </>
);

export default GlobalViewControls;
