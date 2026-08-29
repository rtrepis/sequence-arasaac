import React, { ReactElement, ReactNode } from "react";
import { Stack, Typography } from "@mui/material";
import { SETTINGS_ROW_GAP } from "./settingsLayout.styled";

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
}: SettingsActionsProps): ReactElement => (
  <Stack gap={0.5} sx={{ mt: SETTINGS_ROW_GAP }}>
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
