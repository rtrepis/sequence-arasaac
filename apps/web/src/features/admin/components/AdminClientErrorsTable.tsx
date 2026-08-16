// Últims errors que han arribat a un usuari.
//
// Text en català i sense react-intl, com la resta del panell: és eina interna
// d'una sola persona (vegeu la nota del CLAUDE.md sobre /admin).
import { ReactElement, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  AdminClientError,
  listClientErrors,
} from "../services/adminService";

const formatMoment = (isoDate: string): string =>
  new Date(isoDate).toLocaleString("ca-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const AdminClientErrorsTable = (): ReactElement => {
  const [errors, setErrors] = useState<AdminClientError[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    listClientErrors()
      .then(setErrors)
      .catch(() => setLoadError("No s'han pogut carregar els errors."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        Errors dels usuaris
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Només hi surt el que l'usuari ha acabat veient per pantalla: les fallades
        passatgeres que es resolen soles no s'hi registren. Es conserven 30 dies.
      </Typography>

      {loadError && (
        <Alert severity="error" variant="outlined">
          {loadError}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : errors.length === 0 ? (
        <Alert severity="success" variant="outlined">
          Cap error registrat.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Quan</TableCell>
                <TableCell>Codi</TableCell>
                <TableCell>On</TableCell>
                <TableCell>Usuari</TableCell>
                <TableCell>Detall</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errors.map((error) => (
                <TableRow key={error.id}>
                  <TableCell>{formatMoment(error.createdAt)}</TableCell>
                  <TableCell>
                    <Chip label={error.code} size="small" color="error" />
                  </TableCell>
                  <TableCell>{error.context}</TableCell>
                  <TableCell>{error.emailCanonical ?? "—"}</TableCell>
                  <TableCell
                    sx={{ maxWidth: 280, wordBreak: "break-word" }}
                    title={error.userAgent}
                  >
                    {error.detail ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminClientErrorsTable;
