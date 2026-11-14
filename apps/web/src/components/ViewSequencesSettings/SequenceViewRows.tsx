import React from "react";
import { Slider } from "@mui/material";
import { FormattedMessage } from "react-intl";
import {
  MdFormatAlignCenter,
  MdFormatAlignLeft,
  MdFormatAlignRight,
  MdVerticalAlignBottom,
  MdVerticalAlignCenter,
  MdVerticalAlignTop,
} from "react-icons/md";
import type {
  SequenceAlignmentH,
  SequenceAlignmentV,
  SequenceViewSettings,
} from "@/types/document";
import StyledToggleButtonGroup from "@/style/StyledToggleButtonGroup";
import { IconToggleButton, SettingRow } from "@/components/SettingsLayout";
import {
  SIZE_PICT_MAX,
  SIZE_PICT_MIN,
  SIZE_PICT_STEP,
} from "@/configs/viewSettingsConfig";
import messages from "./ViewSequencesSettings.lang";

interface SequenceViewRowsProps {
  view: SequenceViewSettings;
  /** Prefix únic dels ids dels títols: la columna en pot tenir més d'un joc */
  labelId: string;
  onChange: (change: Partial<SequenceViewSettings>) => void;
  /** La línia d'ajuda de la mida: en una plantilla, la mida que en surt (Q2) */
  sizeHelper?: React.ReactNode;
  /** Quines files: la mida i l'espai només són del bloc; per defecte, totes */
  rows?: readonly SequenceViewRow[];
}

/** Les files que es poden demanar. */
export type SequenceViewRow = "size" | "space" | "alignmentH" | "alignmentV";

const ALL_ROWS: readonly SequenceViewRow[] = [
  "size",
  "space",
  "alignmentH",
  "alignmentV",
];

/** El valor d'un lliscador, que MUI dona com a número o com a llista. */
const single = (value: number | number[]): number =>
  Array.isArray(value) ? value[0] : value;

/** Els decimals que fan soroll a l'etiqueta del lliscador. */
const rounded = (value: number): number => parseFloat(value.toFixed(2));

/**
 * Les files de la vista dels pictogrames d'una seqüència: mida, espai i
 * alineacions. Les fa servir el nivell «Bloc» (un bloc o, a la disposició
 * automàtica, una seqüència): la vista dels pictogrames és només del bloc. Només
 * files (`SettingRow`): qui les fa servir decideix la secció i què canvien.
 */
const SequenceViewRows = ({
  view,
  labelId,
  onChange,
  sizeHelper,
  rows = ALL_ROWS,
}: SequenceViewRowsProps): React.ReactElement => (
  <>
    {rows.includes("size") && (
      <SettingRow
        title={<FormattedMessage {...messages.size} />}
        labelId={`${labelId}-size`}
        helper={sizeHelper}
        helperId={sizeHelper ? `${labelId}-size-helper` : undefined}
      >
        <Slider
          name="sizePict"
          step={SIZE_PICT_STEP}
          min={SIZE_PICT_MIN}
          max={SIZE_PICT_MAX}
          value={view.sizePict}
          valueLabelDisplay="auto"
          valueLabelFormat={rounded}
          onChange={(_, value) => onChange({ sizePict: single(value) })}
          aria-labelledby={`${labelId}-size`}
          aria-describedby={sizeHelper ? `${labelId}-size-helper` : undefined}
        />
      </SettingRow>
    )}

    {rows.includes("space") && (
      <SettingRow
        title={<FormattedMessage {...messages.pictSpaceBetween} />}
        labelId={`${labelId}-space`}
      >
        <Slider
          name="pictSpaceBetween"
          step={0.5}
          min={-2}
          max={10}
          value={view.pictSpaceBetween}
          valueLabelDisplay="auto"
          valueLabelFormat={rounded}
          onChange={(_, value) => onChange({ pictSpaceBetween: single(value) })}
          aria-labelledby={`${labelId}-space`}
        />
      </SettingRow>
    )}

    {rows.includes("alignmentH") && (
      <SettingRow
        title={<FormattedMessage {...messages.alignmentH} />}
        labelId={`${labelId}-alignment-h`}
        control="wide"
      >
        <StyledToggleButtonGroup
          value={view.alignmentH}
          exclusive
          onChange={(_, value: SequenceAlignmentH | null) =>
            value && onChange({ alignmentH: value })
          }
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
          <IconToggleButton value="right" message={messages.tooltipAlignRight}>
            <MdFormatAlignRight />
          </IconToggleButton>
        </StyledToggleButtonGroup>
      </SettingRow>
    )}

    {rows.includes("alignmentV") && (
      <SettingRow
        title={<FormattedMessage {...messages.alignmentV} />}
        labelId={`${labelId}-alignment-v`}
        control="wide"
      >
        <StyledToggleButtonGroup
          value={view.alignmentV}
          exclusive
          onChange={(_, value: SequenceAlignmentV | null) =>
            value && onChange({ alignmentV: value })
          }
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
    )}
  </>
);

export default SequenceViewRows;
