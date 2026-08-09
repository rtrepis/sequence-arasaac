import { Alert } from "@mui/material";
import React from "react";

interface SettingsPanelHintProps {
  /** Text de la guia: què s'ajusta en aquest tab i sobre què tindrà efecte. */
  children: React.ReactNode;
}

/**
 * Guia d'un tab de configuracions: format únic per a tots els panells.
 * Va sempre al capdamunt de la columna de controls, abans de la primera secció,
 * i respon a la mateixa pregunta a tot arreu: què estic configurant aquí.
 */
const SettingsPanelHint = ({
  children,
}: SettingsPanelHintProps): React.ReactElement => (
  <Alert severity="info" variant="outlined" sx={{ py: 0 }}>
    {children}
  </Alert>
);

export default SettingsPanelHint;
