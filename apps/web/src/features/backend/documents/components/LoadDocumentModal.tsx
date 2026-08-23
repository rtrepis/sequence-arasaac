// Modal per llistar i carregar documents desats al backend.
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { AiOutlineClose, AiOutlineDelete } from "react-icons/ai";
import { useIntl } from "react-intl";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import messages from "./DocumentModals.lang";
import DocumentThumbnail from "./DocumentThumbnail";
import { useAppDispatch } from "@/app/hooks";
import {
  listDocumentsThunk,
  loadDocumentThunk,
} from "@features/sequence/store/documentSlice";
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="load-doc-modal-title"
    >
      <DialogTitle id="load-doc-modal-title">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {intl.formatMessage(authMessages.loadDocumentTitle)}
          <IconButton
            onClick={onClose}
            aria-label={intl.formatMessage(authMessages.close)}
            size="small"
          >
            <AiOutlineClose />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: 200 }}>
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
              >
                <ListItemAvatar sx={{ minWidth: 0, mr: 2 }}>
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
                      aria-label={intl.formatMessage(
                        authMessages.deleteDocument,
                      )}
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
      </DialogContent>

      {/* Progrés de la baixada: un document amb imatges pròpies pot pesar, i el
          servidor de Render pot trigar mig minut a despertar-se */}
      {isLoadingDocument && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {downloadMessage()}
          </Typography>
          {transfer.percent !== null ? (
            <LinearProgress variant="determinate" value={transfer.percent} />
          ) : (
            <LinearProgress />
          )}
        </Box>
      )}

      {hasLoadError && (
        <Alert severity="error" variant="outlined" sx={{ mx: 2, mt: 2 }}>
          {intl.formatMessage(authMessages.loadDocumentError)}
        </Alert>
      )}

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isLoadingDocument}>
          {intl.formatMessage(authMessages.close)}
        </Button>
        <Button
          onClick={handleLoad}
          variant="contained"
          disabled={!selectedId || isLoading || isLoadingDocument}
          // El servidor pot trigar mig minut a despertar-se: sense aquest indicador
          // el botó sembla espatllat i l'usuari el prem una vegada i una altra
          startIcon={
            isLoadingDocument ? <CircularProgress size={16} /> : undefined
          }
        >
          {intl.formatMessage(authMessages.loadAction)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoadDocumentModal;
