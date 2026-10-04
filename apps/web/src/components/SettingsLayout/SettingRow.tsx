import { Box, FormLabel, Stack, SxProps, Theme, Typography } from "@mui/material";
import React from "react";
import { settingRowInline, settingControlWidth } from "./settingsLayout.styled";
import { cardTitle } from "../SettingsCards/SettingsCards.styled";

/**
 * Com es dimensiona el control d'una fila:
 * - `sized` — slider, select, textfield: amplada acotada a 1/3; apila en mòbil.
 * - `wide` — grups de toggles: amplada lliure segons contingut; apila en mòbil.
 * - `compact` — switch, mostra de color: sempre en línia, també en mòbil
 *   (apilar-los només malgastaria alçada, mai els falta amplada).
 */
export type SettingControlVariant = "sized" | "wide" | "compact";

interface SettingRowProps {
  /** Títol de l'ajust: a l'esquerra en tauleta/escriptori, a dalt en mòbil. */
  title: React.ReactNode;
  /** Control de l'ajust. */
  children: React.ReactNode;
  /** id del títol, per associar-lo al control amb `aria-labelledby`. */
  labelId?: string;
  /** Dimensionat del control. Per defecte `sized`. */
  control?: SettingControlVariant;
  /**
   * Explicació visible **sota** la fila. Per al que l'usuari ha de llegir sense
   * haver de passar el ratolí per sobre: en tauleta no hi ha hover, i un tooltip
   * no el veu ningú que no el busqui.
   */
  helper?: React.ReactNode;
  /** id del text d'ajuda, per associar-lo al control amb `aria-describedby`. */
  helperId?: string;
}

// Mai per sota del contingut: sense això el grup de toggles es comprimeix
// contra el títol i les etiquetes llargues es parteixen en dues línies.
const wideControl: SxProps<Theme> = { flexShrink: 0, maxWidth: "100%" };

const controlStyles: Record<SettingControlVariant, SxProps<Theme>> = {
  sized: settingControlWidth,
  wide: wideControl,
  compact: wideControl,
};

/**
 * Fila canònica d'un ajust individual segons l'estàndard de configuracions:
 * títol a l'esquerra i control a la dreta en tauleta/escriptori, apilats en mòbil.
 * És la única implementació d'aquest patró; no reescriure'l a mà enlloc.
 */
const SettingRow = ({
  title,
  children,
  labelId,
  control = "sized",
  helper,
  helperId,
}: SettingRowProps): React.ReactElement => {
  const row = (
    <Box
      sx={
        control === "compact"
          ? { ...settingRowInline, flexDirection: "row", alignItems: "center" }
          : settingRowInline
      }
    >
      <FormLabel component="legend" id={labelId} sx={cardTitle}>
        {title}
      </FormLabel>
      <Box sx={controlStyles[control]}>{children}</Box>
    </Box>
  );

  if (!helper) return row;

  // L'ajuda va enganxada a la seva fila, no al `gap` entre files: ha de llegir-se
  // com a part de l'ajust, no com un ajust nou
  return (
    <Stack direction="column">
      {row}
      <Typography id={helperId} variant="caption" color="text.secondary">
        {helper}
      </Typography>
    </Stack>
  );
};

export default SettingRow;
