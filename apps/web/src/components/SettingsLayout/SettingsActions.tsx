import React, { ReactElement, ReactNode } from "react";
import { Stack, Typography } from "@mui/material";
import { SETTINGS_ROW_GAP } from "./settingsLayout.styled";
import { FLOATING_CONTROL_CLEARANCE } from "@/style/appShape";

interface SettingsActionsProps {
  /**
   * Acció que queda sola a l'esquerra, separada de la resta per tota l'amplada
   * del panell. Mateix criteri que el peu d'un diàleg: hi va el que no és ni
   * acceptar ni cancel·lar.
   */
  startAction?: ReactNode;
  /**
   * Secundària (text, `color="inherit"`) i, a la seva dreta, la principal
   * (`contained`). Sempre `StyledButton`.
   */
  children?: ReactNode;
  /**
   * Explicació d'una línia del que fan aquests botons, sota la fila. Va aquí i
   * no al costat del botó perquè la fila conservi el mateix ordre que el peu
   * d'un diàleg.
   */
  helper?: ReactNode;
  /**
   * Reserva a la dreta l'amplada del botó flotant d'estat. Cal allà on el panell
   * viu dins de la finestra amb el botó a sobre —la columna de la pàgina de
   * vista, que acaba al mateix racó—, no dins d'un diàleg que el tapa. És el
   * mateix criteri que ja fan servir els avisos, i el mateix token.
   */
  floatingClearance?: boolean;
}

/**
 * Fila d'accions d'un panell de configuració: **al final de tot i a la dreta**,
 * perquè afecten tot el que hi ha a sobre.
 *
 * És el mateix criteri que `AppDialogActions` —secundària en text a l'esquerra
 * de la principal plena, i el que no és cap de les dues, sol a l'esquerra—, en
 * un panell en comptes d'un diàleg. Vegeu `docs/ESTANDARD-capes-flotants.md`.
 */
const SettingsActions = ({
  startAction,
  children,
  helper,
  floatingClearance = false,
}: SettingsActionsProps): ReactElement => (
  <Stack
    gap={0.5}
    sx={{
      mt: SETTINGS_ROW_GAP,
      paddingRight: floatingClearance ? `${FLOATING_CONTROL_CLEARANCE}px` : 0,
    }}
  >
    <Stack
      direction="row"
      gap={1}
      flexWrap="wrap"
      alignItems="center"
      sx={{ justifyContent: startAction ? "space-between" : "flex-end" }}
    >
      {startAction}
      <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
        {children}
      </Stack>
    </Stack>

    {helper && (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: { xs: "left", sm: "right" } }}
      >
        {helper}
      </Typography>
    )}
  </Stack>
);

export default SettingsActions;
