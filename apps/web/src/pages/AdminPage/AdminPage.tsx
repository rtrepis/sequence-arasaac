// Panell d'administració.
//
// Eina interna, en català i sense react-intl: la fa servir una sola persona i
// cinc fitxers de traducció no s'hi justifiquen (excepció documentada al CLAUDE.md).
//
// La protecció de veritat és al servidor (requireAdmin): la comprovació d'aquí
// només evita ensenyar una pantalla que no funcionaria.
import React, { ReactElement, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { Navigate } from "react-router-dom";
import type { AdminStats, AppConfig } from "@sequence-arasaac/shared-types";
import { useAppSelector } from "../../app/hooks";
import { getConfig, getStats } from "@features/admin/services/adminService";
import AdminStatsCards from "@features/admin/components/AdminStatsCards";
import AdminConfigPanel from "@features/admin/components/AdminConfigPanel";
import AdminUsersTable from "@features/admin/components/AdminUsersTable";

const AdminPage = (): ReactElement => {
  const { accessToken, isAdmin, isLoading: isAuthLoading } = useAppSelector(
    (state) => state.auth,
  );

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const [loadedStats, loadedConfig] = await Promise.all([
          getStats(),
          getConfig(),
        ]);
        setStats(loadedStats);
        setConfig(loadedConfig);
      } catch {
        setError("No s'han pogut carregar les dades del panell.");
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [isAdmin]);

  // Mentre es restaura la sessió encara no se sap si l'usuari és admin:
  // redirigir aquí trauria de la pàgina un administrador legítim en recarregar
  if (isAuthLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!accessToken || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Administració
      </Typography>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {config && (
            <AdminConfigPanel config={config} onConfigChange={setConfig} />
          )}
          {stats && <AdminStatsCards stats={stats} />}
          <AdminUsersTable />
        </Box>
      )}
    </Container>
  );
};

export default AdminPage;
