// Taula d'usuaris amb cerca, filtre d'estat, suspensió i enllaç d'accés.
//
// No hi ha edició de preferències ni accés al contingut: el panell serveix per
// moderar comptes. L'enllaç d'accés és l'excepció a la regla de només moderar,
// i hi és perquè el correu és un servei de tercers que pot no estar disponible
// (domini per verificar, quota diària esgotada): mentre no ho estigui, un
// compte nou sense el seu enllaç no té contrasenya i no s'hi pot entrar de cap
// altra manera.
import React, { ReactElement, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { AiOutlineCopy, AiOutlineMail } from "react-icons/ai";
import type {
  AdminPasswordLink,
  AdminUserSummary,
  UserStatus,
} from "@sequence-arasaac/shared-types";
import StyledIconButton from "@/style/StyledIconButton";
import { useFeedback } from "@/context/FeedbackContext";
import {
  getUserPasswordLink,
  listUsers,
  updateUser,
} from "../services/adminService";
import { formatBytes } from "../utils/formatBytes";

const PAGE_SIZE = 25;

// Color del distintiu segons l'estat del compte
const STATUS_COLOR: Record<UserStatus, "success" | "warning" | "error"> = {
  active: "success",
  pending: "warning",
  suspended: "error",
};

const STATUS_LABEL: Record<UserStatus, string> = {
  active: "Actiu",
  pending: "Sense verificar",
  suspended: "Suspès",
};

const formatDate = (iso?: string): string =>
  iso ? new Date(iso).toLocaleDateString("ca-ES") : "—";

// Amb l'hora: d'un enllaç que es passa a mà, el que cal saber és fins quan serveix
const formatExpiry = (iso: string): string =>
  new Date(iso).toLocaleString("ca-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

// "verify" estableix la primera contrasenya i dona el correu per verificat;
// "reset" en substitueix una que ja existeix. Qui el passa ho ha de poder dir.
const LINK_TYPE_LABEL: Record<AdminPasswordLink["type"], string> = {
  verify: "Primer accés",
  reset: "Nova contrasenya",
};

// Caducitat per al cos del missatge: dins d'una frase, el "05/09 18:30" de la
// taula es llegeix com un codi. Allà hi va sol, en una línia d'estat al costat
// de l'enllaç, i com més curt millor; aquí va enmig d'un text.
const formatExpiryLong = (iso: string): string =>
  new Date(iso).toLocaleString("ca-ES", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

// Construeix un mailto: per enviar l'enllaç d'accés des del client de correu.
//
// El cos és text pla i no pot ser cap altra cosa: un mailto: només porta text
// (RFC 6068), de manera que la plantilla amb marca dels correus del servidor
// (apps/api/src/shared/emailLayout.ts) aquí no hi té cabuda. El que sí que ha
// de dir és el mateix que diu aquella: a qui va, per què arriba i fins quan
// serveix l'enllaç. Qui el rep no ha demanat res i no espera cap correu d'una
// persona: un enllaç sol, sense nom ni context, s'assembla massa a una estafa
// —i el que hi ha darrere és establir la contrasenya d'un compte.
//
// Va en català, com tot el panell: l'idioma de l'usuari no arriba fins aquí.
const buildMailtoUrl = (
  user: AdminUserSummary,
  link: AdminPasswordLink,
): string => {
  const subject =
    link.type === "verify"
      ? "Completa el registre a SequenciAAC"
      : "Nova contrasenya de SequenciAAC";

  const body = [
    user.name ? `Hola, ${user.name}!` : "Hola!",
    "",
    link.type === "verify"
      ? "T'envio a mà l'enllaç per activar el teu compte de SequenciAAC i triar la contrasenya:"
      : "T'envio a mà l'enllaç per triar una contrasenya nova a SequenciAAC:",
    "",
    link.url,
    "",
    `L'enllaç caduca el ${formatExpiryLong(link.expiresAt)}. Si ha caducat, respon aquest correu i te'n passo un altre.`,
  ];

  if (link.type === "reset") {
    // El de "verify" no hi va: aquell compte s'acaba de crear i qui el rep sap
    // que s'hi ha registrat. Un canvi de contrasenya, en canvi, el pot haver
    // engegat el panell sense que l'usuari hagi demanat res.
    body.push(
      "Si no has demanat cap canvi de contrasenya, ignora aquest missatge: la teva contrasenya actual continua funcionant.",
    );
  }

  return `mailto:${encodeURIComponent(user.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.join("\n"))}`;
};

const LINK_ERROR: Record<string, string> = {
  ACCOUNT_SUSPENDED:
    "El compte està suspès: reactiva'l abans de generar-li l'enllaç.",
  USER_NOT_FOUND: "Aquest usuari ja no existeix.",
};

const AdminUsersTable = (): ReactElement => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Els enllaços es demanen d'un en un i només viuen mentre la pantalla és
  // oberta: són credencials, i no han de sobreviure a la sessió del panell
  const [links, setLinks] = useState<Record<string, AdminPasswordLink>>({});
  const [pendingLinkId, setPendingLinkId] = useState<string | null>(null);
  const { showSnackbar } = useFeedback();

  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await listUsers({
          page,
          pageSize: PAGE_SIZE,
          search: search || undefined,
          status: statusFilter || undefined,
        });
        setUsers(result.users);
        setTotal(result.total);
      } catch {
        setError("No s'han pogut carregar els usuaris.");
      } finally {
        setIsLoading(false);
      }
    };

    // Petit retard perquè escriure a la cerca no dispari una crida per lletra
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  const handleToggleSuspension = async (
    user: AdminUserSummary,
  ): Promise<void> => {
    // Reactivar deixa el compte en "pending" si encara no ha verificat el correu:
    // aixecar la suspensió no ha de saltar-se la verificació
    const nextStatus: UserStatus =
      user.status === "suspended"
        ? user.emailVerified
          ? "active"
          : "pending"
        : "suspended";

    try {
      const updated = await updateUser(user.id, { status: nextStatus });
      setUsers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch {
      setError("No s'ha pogut canviar l'estat del compte.");
    }
  };

  const handleGenerateLink = async (userId: string): Promise<void> => {
    setPendingLinkId(userId);
    setError(null);

    try {
      const link = await getUserPasswordLink(userId);
      setLinks((current) => ({ ...current, [userId]: link }));
    } catch (err: unknown) {
      const code =
        (err as { response?: { data?: { errorCode?: string } } })?.response
          ?.data?.errorCode ?? "";
      setError(LINK_ERROR[code] ?? "No s'ha pogut generar l'enllaç.");
    } finally {
      setPendingLinkId(null);
    }
  };

  // El porta-retalls no hi és sempre (sense HTTPS, o amb el permís denegat), i
  // aquí ja no hi ha cap camp d'on treure l'enllaç a mà. Per això, quan falla,
  // l'URL surt sencer a l'avís de dalt: es pot seleccionar igualment, i no
  // ocupa amplada de la taula perquè només hi és quan alguna cosa ha anat mal.
  const handleCopy = async (url: string): Promise<void> => {
    setError(null);

    try {
      await navigator.clipboard.writeText(url);
      showSnackbar({
        message: "Enllaç copiat al porta-retalls.",
        severity: "success",
      });
    } catch {
      setError(`El navegador no ha deixat copiar. Copia'l a mà: ${url}`);
    }
  };

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">Usuaris ({total})</Typography>

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Cerca per correu"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 240 }}
        />
        <TextField
          size="small"
          select
          label="Estat"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as UserStatus | "");
            setPage(1);
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Tots</MenuItem>
          <MenuItem value="active">Actius</MenuItem>
          <MenuItem value="pending">Sense verificar</MenuItem>
          <MenuItem value="suspended">Suspesos</MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Correu</TableCell>
                <TableCell>Estat</TableCell>
                <TableCell align="right">Documents</TableCell>
                <TableCell align="right">Espai</TableCell>
                <TableCell>Alta</TableCell>
                <TableCell>Últim accés</TableCell>
                <TableCell>Enllaç d&apos;accés</TableCell>
                <TableCell align="right">Acció</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Cap usuari amb aquests filtres.
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.email}
                    {user.role === "admin" && (
                      <Chip label="admin" size="small" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABEL[user.status]}
                      color={STATUS_COLOR[user.status]}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {user.usage.documentsCount}
                  </TableCell>
                  <TableCell align="right">
                    {formatBytes(user.usage.storageBytes)}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {links[user.id] ? (
                      <>
                        {/* L'enllaç no es pinta: és una credencial i, dibuixat,
                            es menjava mitja taula sense que ningú l'hagi de
                            llegir mai —el que se'n fa és copiar-lo. El que
                            l'enllaç és i fins quan val, que abans ocupava una
                            línia pròpia sota el camp, va al tooltip i al nom
                            accessible dels dos botons */}
                        <Tooltip
                          title={`Copia l'enllaç · ${LINK_TYPE_LABEL[links[user.id].type]} · caduca el ${formatExpiry(links[user.id].expiresAt)}`}
                        >
                          <StyledIconButton
                            onClick={() => void handleCopy(links[user.id].url)}
                            color="inherit"
                            size="small"
                            aria-label={`Copia l'enllaç d'accés de ${user.email} (${LINK_TYPE_LABEL[links[user.id].type]}, caduca el ${formatExpiry(links[user.id].expiresAt)})`}
                          >
                            <AiOutlineCopy />
                          </StyledIconButton>
                        </Tooltip>
                        <Tooltip title="Envia'l per correu">
                          <StyledIconButton
                            component="a"
                            href={buildMailtoUrl(user, links[user.id])}
                            color="inherit"
                            size="small"
                            aria-label={`Envia l'enllaç d'accés a ${user.email}`}
                          >
                            <AiOutlineMail />
                          </StyledIconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => handleGenerateLink(user.id)}
                        disabled={pendingLinkId === user.id}
                      >
                        {pendingLinkId === user.id ? "Generant…" : "Genera"}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color={user.status === "suspended" ? "primary" : "error"}
                      onClick={() => handleToggleSuspension(user)}
                      // Un administrador no s'ha de poder suspendre a si mateix
                      // ni a un altre des d'aquí: es fa a mà, i amb intenció
                      disabled={user.role === "admin"}
                    >
                      {user.status === "suspended" ? "Reactiva" : "Suspèn"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_event, value) => setPage(value)}
          />
        </Box>
      )}
    </Box>
  );
};

export default AdminUsersTable;
