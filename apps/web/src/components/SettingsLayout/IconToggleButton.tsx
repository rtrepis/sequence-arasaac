import { ToggleButton, ToggleButtonProps, Tooltip } from "@mui/material";
import React from "react";
import { MessageDescriptor, useIntl } from "react-intl";

interface IconToggleButtonProps extends Omit<ToggleButtonProps, "aria-label"> {
  /** Únic missatge del qual surten el tooltip i el nom accessible. */
  message: MessageDescriptor;
}

/**
 * Botó d'un `StyledToggleButtonGroup` que només mostra una icona.
 *
 * Pren **un sol** missatge i en deriva el tooltip i l'`aria-label`, de manera
 * que no puguin tornar a divergir: la icona sola no diu res a un lector de
 * pantalla i, escrivint-ho a mà a cada botó, l'`aria-label` acabava en anglès
 * mentre el tooltip anava traduït.
 */
/**
 * La icona, més gran que la lletra del botó: el botó fa 55 px i, amb la mida
 * per defecte de MUI, la icona en feia 14 i costava de distingir. El botó no
 * canvia de mida.
 */
const ICON_SIZE = 26;

const IconToggleButton = ({
  message,
  children,
  sx,
  ...toggleButtonProps
}: IconToggleButtonProps): React.ReactElement => {
  const intl = useIntl();
  const label = intl.formatMessage(message);

  return (
    <Tooltip title={label}>
      <ToggleButton
        {...toggleButtonProps}
        aria-label={label}
        sx={[
          { "& > svg": { fontSize: ICON_SIZE } },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </ToggleButton>
    </Tooltip>
  );
};

export default IconToggleButton;
