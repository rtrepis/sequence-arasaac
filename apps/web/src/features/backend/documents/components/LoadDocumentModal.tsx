// Modal per llistar i carregar documents desats al backend.
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { AiOutlineDelete } from "react-icons/ai";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import { useIntl } from "react-intl";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import messages from "./DocumentModals.lang";
import DocumentThumbnail from "./DocumentThumbnail";
import { useAppDispatch } from "@/app/hooks";
import {
  listDocumentsThunk,
  loadDocumentThunk,
} from "@features/sequence/store/documentSlice";
import { documentMadeDurableActionCreator } from "@features/sequence/store/documentStatusSlice";
import { deleteDocument, DocumentSummary } from "../services/documentService";
import { useDocumentTransfer } from "../hooks/useDocumentTransfer";
import { classifyRequestFailure } from "@features/backend/api/requestFailure";
import { reportClientError } from "@features/backend/api/clientErrorReport";
import { useFeedback } from "@/context/FeedbackContext";

interface LoadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onLoaded: (title: string) => void;
}

const LoadDocumentModal = ({
  open,
  onClose,
  onLoaded,
}: LoadDocumentModalProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const transfer = useDocumentTransfer();

  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  // Es distingeix de la llista buida a propòsit: davant d'una fallada de xarxa,
  // dir "no tens cap document" és pitjor que no dir res — l'usuari es pensa que
  // ha perdut la feina quan només és que el servidor no ha contestat.
  const [hasListError, setHasListError] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  const fetchDocuments = useCallback((): void => {
    setIsLoading(true);
    setHasListError(false);
    dispatch(listDocumentsThunk())
      .unwrap()
      .then((docs) => setDocuments(docs))
      .catch((error: unknown) => {
        setDocuments([]);
        setHasListError(true);
        void reportClientError("document-list", classifyRequestFailure(error));
      })
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  // Carrega la llista en obrir el modal
  useEffect(() => {
    if (!open) return;
    fetchDocuments();
  }, [open, fetchDocuments]);

  // Nom visible d'un document: el seu, o el genèric traduït si es va desar sense
  const documentName = (doc: DocumentSummary): string =>
    doc.title ?? intl.formatMessage(messages.untitled);

  const handleLoad = async (): Promise<void> => {
    if (!selectedId) return;

    const selected = documents.find((doc) => doc.id === selectedId);

    setIsLoadingDocument(true);
    setHasLoadError(false);
    const result = await dispatch(loadDocumentThunk(selectedId));
    setIsLoadingDocument(false);

    if (result.meta.requestStatus === "fulfilled") {
      // El document que s'acaba de carregar continua sent al núvol: no és feina
      // que només visqui en aquest navegador
      dispatch(documentMadeDurableActionCreator({ kind: "cloud" }));
      onLoaded(selected ? documentName(selected) : "");
      onClose();
      return;
    }
    // Abans no es deia res: el botó semblava no fer res i el document no arribava
    setHasLoadError(true);
    void reportClientError("document-load", {
      code: String(result.payload ?? "DOCUMENT_LOAD_ERROR"),
      isTransient: false,
    });
  };

  const handleDelete = async (
    event: React.MouseEvent,
    id: string,
  ): Promise<void> => {
    event.stopPropagation();
    setIsDeleting(id);
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedId === id) setSelectedId(null);
      showSnackbar({
        message: intl.formatMessage(messages.documentDeleted),
        severity: "success",
      });
    } catch (error: unknown) {
      // Esborrar allibera quota: si ha fallat, l'usuari ho ha de saber, perquè
      // altrament tornarà a topar amb el sostre de documents sense entendre res
      showSnackbar({
        message: intl.formatMessage(messages.deleteError),
        severity: "error",
        duration: 10000,
      });
      void reportClientError("document-delete", classifyRequestFailure(error));
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (isoDate: string): string =>
    new Date(isoDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Missatge de la baixada: amb percentatge quan el servidor diu la mida
  const downloadMessage = (): string =>
    transfer.percent !== null
      ? intl.formatMessage(messages.downloading, { percent: transfer.percent })
      : intl.formatMessage(messages.downloadingUnknown);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={intl.formatMessage(authMessages.loadDocumentTitle)}
      titleId="load-doc-modal-title"
      contentSx={{ minHeight: 200 }}
      // Progrés i error entre la llista i el peu: amb la llista plena, a dins
      // quedarien fora de pantalla justament mentre s'espera
      statusSlot={
        <>
          {/* Un document amb imatges pròpies pot pesar, i el servidor de Render
              pot trigar mig minut a despertar-se */}
          {isLoadingDocument && (
            <Box sx={{ px: 3, pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {downloadMessage()}
              </Typography>
              {transfer.percent !== null ? (
                <LinearProgress
                  variant="determinate"
                  value={transfer.percent}
                />
              ) : (
                <LinearProgress />
              )}
            </Box>
          )}

          {hasLoadError && (
            <Alert severity="error" variant="outlined" sx={{ mx: 3, mt: 2 }}>
              {intl.formatMessage(authMessages.loadDocumentError)}
            </Alert>
          )}
        </>
      }
      actions={
        <AppDialogActions>
          <StyledButton
            onClick={onClose}
            color="inherit"
            disabled={isLoadingDocument}
          >
            {intl.formatMessage(authMessages.close)}
          </StyledButton>
          <StyledButton
            onClick={handleLoad}
            variant="contained"
            disabled={!selectedId || isLoading || isLoadingDocument}
            // El servidor pot trigar mig minut a despertar-se: sense aquest
            // indicador el botó sembla espatllat i l'usuari el prem un cop i un altre
            startIcon={
              isLoadingDocument ? <CircularProgress size={16} /> : undefined
            }
          >
            {intl.formatMessage(authMessages.loadAction)}
          </StyledButton>
        </AppDialogActions>
      }
    >
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 150,
          }}
        >
          <CircularProgress />
        </Box>
      ) : hasListError ? (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchDocuments}>
              {intl.formatMessage(authMessages.retry)}
            </Button>
          }
        >
          {intl.formatMessage(authMessages.loadListError)}
        </Alert>
      ) : documents.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 4 }}
        >
          {intl.formatMessage(authMessages.noDocuments)}
        </Typography>
      ) : (
        <List disablePadding>
          {documents.map((doc) => (
            <ListItemButton
              key={doc.id}
              selected={selectedId === doc.id}
              onClick={() => setSelectedId(doc.id)}
              disabled={isLoadingDocument}
              // Per sota de sm la fila s'apila: la miniatura a dalt i el nom a
              // sota. En un telèfon de 360px, el diàleg deixa uns 216px de fila
              // i la miniatura se'n menja 148: al nom li'n quedaven menys de
              // trenta i quedava tallat sempre. És la mateixa regla que
              // settingRowInline —apilat predictible abans que wrap accidental—
              // i el mateix breakpoint, que no se'n multipliquen.
              sx={{
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
              }}
            >
              <ListItemAvatar
                sx={{ minWidth: 0, mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}
              >
                <DocumentThumbnail
                  thumbnail={doc.thumbnail}
                  label={intl.formatMessage(messages.thumbnailLabel, {
                    title: documentName(doc),
                  })}
                />
              </ListItemAvatar>
              <ListItemText
                primary={documentName(doc)}
                secondary={formatDate(doc.updatedAt)}
                // width al 100% en apilat: amb alignItems flex-start, un fill
                // de columna s'encongeix al contingut i el nom quedaria centrat
                // a l'esquerra en comptes d'ocupar la fila (mateix motiu que la
                // mostra del panell de vocabulari a l'estàndard de settings).
                //
                // El pr reserva el botó d'esborrar, que va posicionat a sobre de
                // la fila i no hi ocupa lloc: sense la reserva, un nom llarg li
                // passa per sota — i amb la fila apilada hi passaria sempre.
                sx={{ pr: 5, my: 0, width: { xs: "100%", sm: "auto" } }}
              />
              <ListItemSecondaryAction>
                <Tooltip
                  title={intl.formatMessage(authMessages.deleteDocument)}
                >
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleDelete(e, doc.id)}
                    disabled={isDeleting === doc.id || isLoadingDocument}
                    aria-label={intl.formatMessage(authMessages.deleteDocument)}
                  >
                    {isDeleting === doc.id ? (
                      <CircularProgress size={16} />
                    ) : (
                      <AiOutlineDelete />
                    )}
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItemButton>
          ))}
        </List>
      )}
    </AppDialog>
  );
};

export default LoadDocumentModal;
