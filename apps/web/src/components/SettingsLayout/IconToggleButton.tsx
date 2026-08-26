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
const IconToggleButton = ({
  message,
  children,
  ...toggleButtonProps
}: IconToggleButtonProps): React.ReactElement => {
  const intl = useIntl();
  const label = intl.formatMessage(message);

  return (
    <Tooltip title={label}>
      <ToggleButton {...toggleButtonProps} aria-label={label}>
        {children}
      </ToggleButton>
    </Tooltip>
  );
};

export default IconToggleButton;
