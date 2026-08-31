// Els tres nivells de qualitat, amb la icona i el nom amb què es diuen sempre.
//
// Viuen a part perquè els fan servir dos llocs —el triador de la configuració i
// el diàleg que canvia de mida una imatge ja pujada— i el nivell «Compacta» no
// pot dir-se ni dibuixar-se de dues maneres segons per on s'hi arribi.
import React from "react";
import {
  MdOutlineImage,
  MdOutlinePhotoSizeSelectSmall,
  MdOutlinePrint,
} from "react-icons/md";
import type { MessageDescriptor } from "react-intl";
import type { SxProps, Theme } from "@mui/material";
import type { ImageQuality } from "@/types/ui";
import { APP_CONTROL_SIZE } from "@/style/appShape";
import messages from "./SettingCardImageQuality.lang";

/** Mida de la icona dins del botó de 55×55 de StyledToggleButtonGroup. */
export const QUALITY_ICON_SIZE = 22;

export interface ImageQualityOption {
  value: ImageQuality;
  icon: React.ReactNode;
  label: MessageDescriptor;
}

export const IMAGE_QUALITY_OPTIONS: ImageQualityOption[] = [
  {
    value: "print",
    icon: <MdOutlinePrint size={QUALITY_ICON_SIZE} />,
    label: messages.print,
  },
  {
    value: "standard",
    icon: <MdOutlineImage size={QUALITY_ICON_SIZE} />,
    label: messages.standard,
  },
  {
    value: "compact",
    icon: <MdOutlinePhotoSizeSelectSmall size={QUALITY_ICON_SIZE} />,
    label: messages.compact,
  },
];

/**
 * Forma del botó de nivell: la icona a dalt i el nom a sota.
 *
 * És l'única cosa que se separa del toggle quadrat de la casa, i només en
 * amplada: «Estàndard» no cap als 55 px i les tres etiquetes se sobreposaven
 * fins a llegir-se com una sola paraula. L'alçada, el radi i la vora són els de
 * sempre, i el mínim continua sent el costat del control, de manera que la
 * diana tàctil no baixa mai del que marca el WCAG.
 */
export const qualityToggleSx: SxProps<Theme> = {
  flexDirection: "column",
  gap: 0.25,
  fontSize: "0.6rem",
  whiteSpace: "nowrap",
  // El `&&` hi és perquè l'amplada fixa la posa el grup amb dues classes
  // (`& .MuiToggleButtonGroup-grouped`) i una regla d'`sx` sola no hi arriba
  "&&": {
    width: "auto",
    minWidth: APP_CONTROL_SIZE,
    paddingLeft: 1,
    paddingRight: 1,
  },
};
