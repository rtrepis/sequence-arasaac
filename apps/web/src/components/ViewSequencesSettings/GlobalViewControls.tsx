import {
  FormGroup,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { MdTableRows, MdViewColumn } from "react-icons/md";
import { ViewSettings, SequenceDirection } from "@/types/ui";
import messages from "./ViewSequencesSettings.lang";

interface GlobalViewControlsProps {
  viewSettings: ViewSettings;
  author: string;
  pageSizeIndex: number;
  sequenceCount: number;
  onPageSizeChange: (event: SelectChangeEvent<number>) => void;
  onDirectionChange: (
    event: React.MouseEvent<HTMLElement>,
    newDirection: SequenceDirection | null,
  ) => void;
  onSequenceSpaceChange: (event: Event, value: number | number[]) => void;
  onAuthorChange: (value: string) => void;
  children?: React.ReactNode;
}

/**
 * Controls globals de visualització: format de pàgina, direcció i autor.
 * Accepta children per intercalar SequenceControlsPanel entre el format i la direcció.
 */
const GlobalViewControls = ({
  viewSettings,
  author,
  pageSizeIndex,
  sequenceCount,
  onPageSizeChange,
  onDirectionChange,
  onSequenceSpaceChange,
  onAuthorChange,
  children,
}: GlobalViewControlsProps): React.ReactElement => {
  const intl = useIntl();

  return (
    <>
      <FormGroup>
        <FormLabel>
          <FormattedMessage {...messages.pageSize} />
        </FormLabel>
        <Select<number>
          value={pageSizeIndex}
          onChange={onPageSizeChange}
          size="small"
        >
          <MenuItem value={0}>A4</MenuItem>
          <MenuItem value={1}>A3</MenuItem>
          <MenuItem value={2}>
            <FormattedMessage {...messages.fullScreen} />
          </MenuItem>
        </Select>
      </FormGroup>

      {children}

      {sequenceCount > 1 && (
        <FormGroup>
          <FormLabel>
            <FormattedMessage {...messages.sequenceSpaceBetween} />
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
          </FormLabel>
        </FormGroup>
      )}

      <FormGroup>
        <FormLabel component="legend">
          <FormattedMessage {...messages.direction} />
        </FormLabel>
        <ToggleButtonGroup
          value={viewSettings.direction}
          exclusive
          onChange={onDirectionChange}
          size="small"
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
        </ToggleButtonGroup>
      </FormGroup>

      <FormGroup>
        <FormLabel>
          <FormattedMessage {...messages.authSequence} />
          <TextField
            value={author}
            onChange={(event) => onAuthorChange(event.target.value)}
            variant="filled"
            fullWidth
            helperText={intl.formatMessage({ ...messages.authHelperText })}
            sx={{
              ".MuiInputBase-input": { paddingTop: 2 },
            }}
          />
        </FormLabel>
      </FormGroup>
    </>
  );
};

export default GlobalViewControls;
