import {
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Switch,
} from "@mui/material";
import React, { useRef } from "react";
import { FormattedMessage } from "react-intl";
import { MdTableRows, MdViewColumn } from "react-icons/md";
import { MdScreenRotation } from "react-icons/md";
import {
  ViewSettings,
  SequenceDirection,
  PageOrientation,
  PageSize,
} from "@/types/ui";
import {
  PAGE_SIZES,
  PaperSize,
  regionalPaperSize,
} from "@features/print/utils/pageFormat";
import StyledToggleButtonGroup from "@/style/StyledToggleButtonGroup";
import { SettingRow, IconToggleButton } from "@/components/SettingsLayout";
import messages from "./ViewSequencesSettings.lang";

// L'A4 i l'A3 es diuen igual a tots els idiomes; la resta de mides es tradueixen
const PAGE_SIZE_LABELS: Record<PageSize, React.ReactNode> = {
  A4: "A4",
  A3: "A3",
  LETTER: <FormattedMessage {...messages.pageSizeLetter} />,
  TABLOID: <FormattedMessage {...messages.pageSizeTabloid} />,
  FULLSCREEN: <FormattedMessage {...messages.fullScreen} />,
};

// Prefix dels ids dels títols de fila, per lligar-los als controls amb aria-labelledby
const GLOBAL_CONTROLS_LABEL_ID = "global-view-controls";

interface GlobalViewControlsProps {
  viewSettings: ViewSettings;
  pageSize: PageSize;
  sequenceCount: number;
  onPageSizeChange: (pageSize: PageSize) => void;
  onDirectionChange: (
    event: React.MouseEvent<HTMLElement>,
    newDirection: SequenceDirection | null,
  ) => void;
  onSequenceSpaceChange: (event: Event, value: number | number[]) => void;
  onOrientationChange?: (orientation: PageOrientation) => void;
  /**
   * Només paper: amb pàgines en blocs, la pantalla sencera no s'hi pot triar
   * (els blocs es col·loquen en mil·límetres de paper). L'interruptor hi és,
   * però apagat i dient per què
   */
  paperOnly?: boolean;
  /** La fila de la mida del paper. A la columna de la vista és del nivell «Document» */
  showPaper?: boolean;
  /** La fila de la direcció. A la columna de la vista és del nivell «Pàgina» */
  showDirection?: boolean;
  /**
   * Files que van després de l'orientació i abans de l'espai entre
   * seqüències i la direcció: la disposició, al panell de la configuració
   */
  afterOrientation?: React.ReactNode;
}

/**
 * Controls globals de visualització: format de pàgina, orientació, separació
 * entre seqüències i direcció. Només files d'ajust (`SettingRow`); qui el
 * consumeix decideix la secció que l'embolcalla i els botons d'acció.
 */
const GlobalViewControls = ({
  viewSettings,
  pageSize,
  sequenceCount,
  onPageSizeChange,
  onDirectionChange,
  onSequenceSpaceChange,
  onOrientationChange,
  paperOnly = false,
  showPaper = true,
  showDirection = true,
  afterOrientation,
}: GlobalViewControlsProps): React.ReactElement => {
  const isFullscreen = pageSize === "FULLSCREEN";
  // El paper d'abans de la pantalla sencera: el selector el continua
  // ensenyant (apagat), i en treure la pantalla sencera s'hi torna. Si el
  // document ja venia a pantalla sencera, el paper de la regió
  const lastPaper = useRef<PaperSize | null>(null);
  if (!isFullscreen) lastPaper.current = pageSize;
  const paper: PaperSize =
    lastPaper.current ?? regionalPaperSize(navigator.languages ?? []);

  return (
    <>
      {showPaper && (
        <SettingRow
          title={<FormattedMessage {...messages.pageSize} />}
          labelId={`${GLOBAL_CONTROLS_LABEL_ID}-page-size`}
        >
          {/* Sense InputLabel flotant: el títol de la fila ja fa d'etiqueta.
              Amb la pantalla sencera no hi ha paper: el selector s'apaga */}
          <Select<PaperSize>
            value={paper}
            disabled={isFullscreen}
            onChange={(event: SelectChangeEvent<PaperSize>) =>
              onPageSizeChange(event.target.value as PaperSize)
            }
            size="small"
            fullWidth
            labelId={`${GLOBAL_CONTROLS_LABEL_ID}-page-size`}
          >
            {PAGE_SIZES.filter(
              (size): size is PaperSize => size !== "FULLSCREEN",
            ).map((size) => (
              <MenuItem key={size} value={size}>
                {PAGE_SIZE_LABELS[size]}
              </MenuItem>
            ))}
          </Select>
        </SettingRow>
      )}

      {/* La pantalla sencera, sota la mida: la previsualització segueix la
          proporció de la pantalla en comptes de la d'un paper */}
      {showPaper && (
        <SettingRow
          title={<FormattedMessage {...messages.fullScreen} />}
          labelId={`${GLOBAL_CONTROLS_LABEL_ID}-fullscreen`}
          helperId={`${GLOBAL_CONTROLS_LABEL_ID}-fullscreen-helper`}
          helper={
            <FormattedMessage
              {...(paperOnly && !isFullscreen
                ? messages.fullScreenBlocked
                : messages.fullScreenHelper)}
            />
          }
        >
          <Switch
            checked={isFullscreen}
            disabled={paperOnly && !isFullscreen}
            onChange={(_, checked) =>
              onPageSizeChange(checked ? "FULLSCREEN" : paper)
            }
            inputProps={{
              "aria-labelledby": `${GLOBAL_CONTROLS_LABEL_ID}-fullscreen`,
              "aria-describedby": `${GLOBAL_CONTROLS_LABEL_ID}-fullscreen-helper`,
            }}
          />
        </SettingRow>
      )}

      {/* Amb la pantalla sencera, l'orientació és la de la pantalla */}
      {onOrientationChange && !isFullscreen && (
        <SettingRow
          title={<FormattedMessage {...messages.tooltipOrientation} />}
          control="wide"
        >
          <StyledToggleButtonGroup
            value={viewSettings.orientation}
            exclusive
            onChange={(_, val: PageOrientation | null) =>
              val && onOrientationChange(val)
            }
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

      {afterOrientation}

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
            valueLabelFormat={(value: number) => parseFloat(value.toFixed(2))}
            onChange={onSequenceSpaceChange}
          />
        </SettingRow>
      )}

      {showDirection && (
        <SettingRow
          title={<FormattedMessage {...messages.direction} />}
          control="wide"
        >
          <StyledToggleButtonGroup
            value={viewSettings.direction}
            exclusive
            onChange={onDirectionChange}
          >
            <IconToggleButton
              value="row"
              message={messages.tooltipDirectionRow}
            >
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
      )}
    </>
  );
};

export default GlobalViewControls;
