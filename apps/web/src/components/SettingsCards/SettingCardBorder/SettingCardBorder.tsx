import { Slider, ToggleButton, Tooltip } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import StyledToggleButtonGroup from "../../../style/StyledToggleButtonGroup";
import { Border } from "../../../types/sequence";
import { cardColor } from "../SettingsCards.styled";
import SectionTitle from "../../SettingsLayout/SectionTitle";
import SettingRow from "../../SettingsLayout/SettingRow";
import "./SettingCardBorder.css";
import { messages } from "./SettingCardBorder.lang";
import { useState } from "react";
import InputColor from "../InputColor/InputColor";
import React from "react";

interface SettingCardBorderProps {
  border: "borderIn" | "borderOut";
  state: Border;
  setState: React.Dispatch<React.SetStateAction<Border>>;
  indexPict?: number;
  onApplyAll?: () => void;
}

/**
 * Secció autotitulada d'una vora: tipus, gruix i radi com a files independents.
 * Es titula ella mateixa perquè els contextos que no l'embolcallen amb un
 * `SectionTitle` (com el modal d'edició de pictograma) obtinguin la mateixa
 * presentació sense canvis.
 */
const SettingCardBorder = ({
  border,
  state: { color, size, radius },
  setState,
  onApplyAll,
}: SettingCardBorderProps): React.ReactElement => {
  const intl = useIntl();

  const [colorSelect, setColorSelect] = useState(color);

  // El tooltip "Selecció" es controla per poder-lo tancar mentre la paleta és
  // oberta: el popover s'ancora just a sota del botó, on el tooltip captura els
  // clics dels primers colors i els deixa inseleccionables.
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleChangesSize = (event: Event, newValue: number | number[]) => {
    const border: Border = {
      color: color,
      radius: radius,
      size: newValue as number,
    };

    setState(border);
  };

  const handleChangesRadius = (event: Event, newValue: number | number[]) => {
    const border: Border = {
      color: color,
      radius: newValue as number,
      size: size,
    };

    setState(border);
  };

  const handlerUpdateColor = (
    toUpdateColor?: string,
    toUpDateSize?: boolean,
  ) => {
    const newBorder: Border = {
      color: toUpdateColor ?? colorSelect,
      radius: toUpDateSize ? 0 : radius === 0 ? 20 : radius,
      size: toUpDateSize ? 0 : size === 0 ? 2 : size,
    };

    setState(newBorder);
  };

  // Propaga el color al pare a l'instant perquè el preview s'actualitzi en seleccionar,
  // sense esperar el blur del ToggleButton
  const handleChangeColor: React.Dispatch<React.SetStateAction<string>> = (
    value,
  ) => {
    setColorSelect(value);
    const newColor = typeof value === "function" ? value(colorSelect) : value;
    // "input" és el valor transitori mentre s'obre el selector natiu de color
    if (newColor !== "input") handlerUpdateColor(newColor);
  };

  return (
    <SectionTitle
      title={<FormattedMessage {...messages[border]} />}
      onApplyAll={onApplyAll}
    >
      <SettingRow title={<FormattedMessage {...messages.type} />} control="wide">
        <StyledToggleButtonGroup
          exclusive
          aria-label={`${intl.formatMessage(messages[border])}`}
        >
          <ToggleButton
            value={"Fitzgerald Key"}
            sx={cardColor}
            selected={color === "fitzgerald" && size > 0}
            onClick={() => handlerUpdateColor("fitzgerald")}
          >
            <FormattedMessage {...messages.fitzgeraldKey} />
          </ToggleButton>

          <Tooltip
            title={intl.formatMessage(messages.selected)}
            open={tooltipOpen && !paletteOpen}
            onOpen={() => setTooltipOpen(true)}
            onClose={() => setTooltipOpen(false)}
          >
            <ToggleButton
              value={"Selected Color"}
              selected={color !== "fitzgerald" && size > 0}
            >
              <InputColor
                color={colorSelect}
                setColor={handleChangeColor}
                onOpenChange={setPaletteOpen}
                inputBorder={1}
                inputSize={35}
              />
            </ToggleButton>
          </Tooltip>

          <ToggleButton
            value={"whitOutBorder"}
            onClick={() => handlerUpdateColor(undefined, true)}
            selected={size === 0}
          >
            <Tooltip title={intl.formatMessage(messages.withoutBorder)}>
              <img
                src={`../img/settings/x.png`}
                alt={intl.formatMessage(messages.withoutBorder)}
                width={40}
                height={40}
              />
            </Tooltip>
          </ToggleButton>
        </StyledToggleButtonGroup>
      </SettingRow>

      <SettingRow title={<FormattedMessage {...messages.size} />}>
        <Slider
          aria-label={`${intl.formatMessage(messages.size)}`}
          valueLabelDisplay="auto"
          max={10}
          min={1}
          value={size}
          onChange={handleChangesSize}
          disabled={size === 0}
        />
      </SettingRow>

      <SettingRow title={<FormattedMessage {...messages.radius} />}>
        <Slider
          aria-label={`${intl.formatMessage(messages.radius)}`}
          valueLabelDisplay="auto"
          max={70}
          min={1}
          value={radius}
          onChange={handleChangesRadius}
          disabled={size === 0}
        />
      </SettingRow>
    </SectionTitle>
  );
};
export default SettingCardBorder;
