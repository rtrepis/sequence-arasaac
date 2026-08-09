// Interruptor de registre i sostre d'usuaris.
//
// Va a dalt de tot del panell i ben visible: és el fre d'emergència. Si un dia
// hi ha una allau d'altes, aquest és el control que s'ha de trobar sense buscar.
import React, { ReactElement, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { AppConfig } from "@sequence-arasaac/shared-types";
import { updateConfig } from "../services/adminService";

interface AdminConfigPanelProps {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
}

const AdminConfigPanel = ({
  config,
  onConfigChange,
}: AdminConfigPanelProps): ReactElement => {
  const [maxUsers, setMaxUsers] = useState(String(config.maxUsers));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyChange = async (update: {
    registrationOpen?: boolean;
    maxUsers?: number;
  }): Promise<void> => {
    setIsSaving(true);
    setError(null);
    try {
      onConfigChange(await updateConfig(update));
    } catch {
      setError("No s'ha pogut desar la configuració.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMaxUsersSave = async (): Promise<void> => {
    const parsed = Number(maxUsers);
    if (!Number.isInteger(parsed) || parsed < 0) {
      setError("El màxim d'usuaris ha de ser un nombre enter positiu.");
      return;
    }
    await applyChange({ maxUsers: parsed });
  };

  return (
    <Card>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6">Control de registre</Typography>

        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}

        {!config.registrationOpen && (
          <Alert severity="warning" variant="outlined">
            El registre està tancat: ningú pot crear comptes nous.
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography sx={{ fontWeight: "bold" }}>Registre obert</Typography>
          <Switch
            checked={config.registrationOpen}
            disabled={isSaving}
            onChange={(event) =>
              applyChange({ registrationOpen: event.target.checked })
            }
            inputProps={{ "aria-label": "Registre obert" }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontWeight: "bold" }}>Màxim d'usuaris</Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size="small"
              type="number"
              value={maxUsers}
              onChange={(event) => setMaxUsers(event.target.value)}
              disabled={isSaving}
              sx={{ width: 120 }}
              inputProps={{ min: 0, "aria-label": "Màxim d'usuaris" }}
            />
            <Button
              variant="outlined"
              onClick={handleMaxUsersSave}
              disabled={isSaving || maxUsers === String(config.maxUsers)}
            >
              Desa
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdminConfigPanel;
