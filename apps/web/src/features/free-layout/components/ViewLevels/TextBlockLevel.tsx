import React from "react";
import { Slider, Switch, TextField } from "@mui/material";
import { MdTitle } from "react-icons/md";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch } from "@/app/hooks";
import type { TextBlockStyle, TextPlacement } from "@/types/document";
import { SettingRow } from "@/components/SettingsLayout";
import SettingsLevel from "@components/ViewSequencesSettings/SettingsLevel";
import SequenceViewRows from "@components/ViewSequencesSettings/SequenceViewRows";
import type { ResolvedTextStyle } from "@features/free-layout/model/blockStyle";
import { setTextPlacementThunk } from "@features/free-layout/store/freeLayoutThunks";
import { VIEW_BLOCK_LEVEL_ID } from "@features/free-layout/hooks/useViewSelection";
import messages from "./ViewLevels.lang";

/** Prefix dels ids dels títols de fila, per lligar-los als controls. */
const LABEL_ID = "view-level-text";

/** La mida de la lletra d'un rètol, sobre la base del text de les targetes. */
const FONT_SIZE_MIN = 0.5;
const FONT_SIZE_MAX = 5;
const FONT_SIZE_STEP = 0.25;

interface TextBlockLevelProps {
  placement: TextPlacement;
  name: string;
  common: boolean;
  /** L'aspecte del rètol, amb la cascada sencera */
  style: ResolvedTextStyle;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

/**
 * El nivell «Rètol» de la columna de la vista (R9): el text i l'aspecte del
 * rètol seleccionat al full. Per defecte, un rètol té la lletra de les
 * targetes del document; aquí se'n retoca la mida (com a màxim, Q2), la
 * negreta i l'alineació, i només es desa el retoc. Les accions (a totes les
 * pàgines, copiar, treure) són al menú del rètol, al full.
 */
const TextBlockLevel = ({
  placement,
  name,
  common,
  style,
  expanded,
  onExpandedChange,
}: TextBlockLevelProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const retouch = placement.textStyle ?? {};
  const changeStyle = (change: TextBlockStyle) =>
    dispatch(
      setTextPlacementThunk(placement.id, {
        textStyle: { ...retouch, ...change },
      }),
    );

  return (
    <SettingsLevel
      id={VIEW_BLOCK_LEVEL_ID}
      icon={<MdTitle />}
      kind={<FormattedMessage {...messages.kindText} />}
      title={name}
      scope={intl.formatMessage(messages.blockScope, {
        common: String(common),
      })}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      <SettingRow
        title={<FormattedMessage {...messages.text} />}
        labelId={`${LABEL_ID}-text`}
        helperId={`${LABEL_ID}-text-helper`}
        helper={<FormattedMessage {...messages.textHelp} />}
      >
        <TextField
          value={placement.text}
          onChange={(event) =>
            dispatch(
              setTextPlacementThunk(placement.id, {
                text: event.target.value,
              }),
            )
          }
          multiline
          minRows={1}
          maxRows={4}
          size="small"
          fullWidth
          inputProps={{
            "aria-labelledby": `${LABEL_ID}-text`,
            "aria-describedby": `${LABEL_ID}-text-helper`,
          }}
        />
      </SettingRow>

      <SettingRow
        title={<FormattedMessage {...messages.fontSize} />}
        labelId={`${LABEL_ID}-size`}
        helperId={`${LABEL_ID}-size-helper`}
        helper={<FormattedMessage {...messages.fontSizeHelp} />}
      >
        <Slider
          step={FONT_SIZE_STEP}
          min={FONT_SIZE_MIN}
          max={FONT_SIZE_MAX}
          value={style.font.size}
          valueLabelDisplay="auto"
          onChange={(_, value) =>
            changeStyle({
              font: {
                ...retouch.font,
                size: Array.isArray(value) ? value[0] : value,
              },
            })
          }
          aria-labelledby={`${LABEL_ID}-size`}
          aria-describedby={`${LABEL_ID}-size-helper`}
        />
      </SettingRow>

      <SettingRow
        title={<FormattedMessage {...messages.bold} />}
        labelId={`${LABEL_ID}-bold`}
        control="compact"
      >
        <Switch
          checked={style.bold}
          onChange={(_, bold) => changeStyle({ bold })}
          inputProps={{ "aria-labelledby": `${LABEL_ID}-bold` }}
        />
      </SettingRow>

      {/* Les alineacions, les mateixes files que les dels pictogrames. La mida
          i l'espai de la vista no hi surten (`rows`): no són d'un rètol */}
      <SequenceViewRows
        view={{
          sizePict: 1,
          pictSpaceBetween: 0,
          alignmentH: style.alignmentH,
          alignmentV: style.alignmentV,
        }}
        labelId={LABEL_ID}
        rows={["alignmentH", "alignmentV"]}
        onChange={({ alignmentH, alignmentV }) =>
          changeStyle({
            ...(alignmentH && { alignmentH }),
            ...(alignmentV && { alignmentV }),
          })
        }
      />
    </SettingsLevel>
  );
};

export default TextBlockLevel;
