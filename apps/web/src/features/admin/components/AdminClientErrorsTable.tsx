// Últims errors que han arribat a un usuari, amb el que se'n pot fer: obrir-ne
// una issue a GitHub i treure'ls del registre quan ja estan mirats.
//
// Text en català i sense react-intl, com la resta del panell: és eina interna
// d'una sola persona (vegeu la nota del CLAUDE.md sobre /admin).
import { ReactElement, useCallback, useEffect, useState } from "react";
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
  Tooltip,
  Typography,
} from "@mui/material";
import { AiOutlineDelete, AiOutlineGithub } from "react-icons/ai";
import StyledButton from "@/style/StyledButton";
import StyledIconButton from "@/style/StyledIconButton";
import ConfirmDialog from "@components/ConfirmDialog/ConfirmDialog";
import {
  AdminClientError,
  deleteClientError,
  deleteClientErrorsBefore,
  listClientErrors,
} from "../services/adminService";
import { buildGithubIssueUrl } from "../utils/githubIssueUrl";

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
  const [actionError, setActionError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setLoadError(null);
    try {
      setErrors(await listClientErrors());
    } catch {
      setLoadError("No s'han pogut carregar els errors.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // El llistat arriba del més recent al més antic, així que el primer marca
  // fins on esborra el buidat en bloc
  const newest = errors[0]?.createdAt;

  const handleDelete = async (error: AdminClientError): Promise<void> => {
    setActionError(null);
    setResult(null);
    try {
      await deleteClientError(error.id);
      // Es treu de la taula sense recarregar-la: la resta de files no han
      // canviat i tornar-les a demanar només mouria la pantalla sota el ratolí
      setErrors((current) => current.filter((item) => item.id !== error.id));
    } catch {
      setActionError("No s'ha pogut esborrar l'error.");
    }
  };

  const handleClear = async (): Promise<void> => {
    setIsConfirmOpen(false);
    if (!newest) return;

    setActionError(null);
    setResult(null);
    setIsClearing(true);
    try {
      const deleted = await deleteClientErrorsBefore(newest);
      setResult(
        deleted === 1
          ? "S'ha esborrat 1 error del registre."
          : `S'han esborrat ${deleted} errors del registre.`,
      );
      // Es torna a demanar la llista perquè el buidat pot haver-se endut errors
      // que no hi sortien, i en pot haver arribat algun de nou mentrestant
      await load();
    } catch {
      setActionError("No s'ha pogut buidar el registre.");
    } finally {
      setIsClearing(false);
    }
  };

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
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {result && (
        <Alert severity="success" variant="outlined" sx={{ mb: 2 }}>
          {result}
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
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Quan</TableCell>
                  <TableCell>Codi</TableCell>
                  <TableCell>On</TableCell>
                  <TableCell>Usuari</TableCell>
                  <TableCell>Detall</TableCell>
                  <TableCell align="right">Accions</TableCell>
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
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {/* Obre el formulari d'issue de GitHub ja omplert: la
                          publica l'administrador amb el seu compte, després de
                          llegir-la i completar-la */}
                      <Tooltip title="Obre'n una issue a GitHub">
                        <StyledIconButton
                          component="a"
                          href={buildGithubIssueUrl(error)}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="inherit"
                          size="small"
                          aria-label={`Obre una issue a GitHub per ${error.code}`}
                        >
                          <AiOutlineGithub />
                        </StyledIconButton>
                      </Tooltip>
                      {/* Sense confirmació: és una línia de registre ja llegida
                          i el que es perd es refà sol la pròxima vegada que
                          l'error passi. Buidar-ho tot, això sí que es pregunta */}
                      <Tooltip title="Esborra l'error del registre">
                        <StyledIconButton
                          onClick={() => void handleDelete(error)}
                          color="inherit"
                          size="small"
                          aria-label={`Esborra l'error ${error.code} de ${formatMoment(error.createdAt)}`}
                        >
                          <AiOutlineDelete />
                        </StyledIconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Al final i a la dreta, com el peu d'un diàleg: afecta tot el que
              hi ha a sobre */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <StyledButton
              variant="outlined"
              color="error"
              // Guarda al handler i no `disabled`: un botó desactivat surt de
              // l'ordre de tabulació i qui navega amb teclat el perd sense avís
              onClick={() => {
                if (isClearing) return;
                setIsConfirmOpen(true);
              }}
              aria-busy={isClearing}
              aria-disabled={isClearing}
            >
              Buida el registre
            </StyledButton>
          </Box>
        </>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title="Buides el registre d'errors?"
        body={
          newest
            ? `S'esborraran tots els errors registrats fins a ${formatMoment(newest)}, també els que no caben en aquest llistat. Els que arribin a partir d'ara es conserven. No es pot desfer.`
            : ""
        }
        confirmLabel="Buida el registre"
        onConfirm={() => void handleClear()}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </Box>
  );
};

export default AdminClientErrorsTable;
