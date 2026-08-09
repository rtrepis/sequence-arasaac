// Xifres de capçalera del panell d'administració.
// Text en català sense react-intl: el panell és eina interna d'una sola persona
// (vegeu la nota de l'estàndard al CLAUDE.md).
import React, { ReactElement } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import type { AdminStats } from "@sequence-arasaac/shared-types";
import { formatBytes } from "../utils/formatBytes";

interface AdminStatsCardsProps {
  stats: AdminStats;
}

// Una xifra amb el seu retol
const StatCard = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}): ReactElement => (
  <Card sx={{ flex: "1 1 160px", minWidth: 160 }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", color: highlight ? "error.main" : undefined }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const AdminStatsCards = ({ stats }: AdminStatsCardsProps): ReactElement => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
    <StatCard label="Usuaris totals" value={stats.totalUsers} />
    <StatCard label="Altes (7 dies)" value={stats.newUsersLast7Days} />
    <StatCard label="Altes (30 dies)" value={stats.newUsersLast30Days} />
    <StatCard
      label="Sense verificar"
      value={stats.pendingVerification}
      highlight={stats.pendingVerification > 0}
    />
    <StatCard
      label="Suspesos"
      value={stats.suspendedUsers}
      highlight={stats.suspendedUsers > 0}
    />
    <StatCard label="Documents" value={stats.totalDocuments} />
    <StatCard label="Espai ocupat" value={formatBytes(stats.totalStorageBytes)} />
  </Box>
);

export default AdminStatsCards;
