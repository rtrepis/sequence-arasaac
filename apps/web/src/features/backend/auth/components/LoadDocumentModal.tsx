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
  List,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { AiOutlineClose, AiOutlineDelete } from "react-icons/ai";
import { useIntl } from "react-intl";
import messages from "./AuthModal.lang";
import { useAppDispatch } from "../../../../app/hooks";
import {
  listDocumentsThunk,
  loadDocumentThunk,
} from "@features/sequence/store/documentSlice";
import {
  deleteDocument,
  DocumentSummary,
} from "../../documents/services/documentService";
import { classifyRequestFailure } from "../../api/requestFailure";
import { reportClientError } from "../../api/clientErrorReport";

interface LoadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onLoaded: () => void;
}

const LoadDocumentModal = ({
  open,
  onClose,
  onLoaded,
}: LoadDocumentModalProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

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

  const handleLoad = async (): Promise<void> => {
    if (!selectedId) return;

    setIsLoadingDocument(true);
    setHasLoadError(false);
    const result = await dispatch(loadDocumentThunk(selectedId));
    setIsLoadingDocument(false);

    if (result.meta.requestStatus === "fulfilled") {
      onLoaded();
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
          {intl.formatMessage(messages.loadDocumentTitle)}
          <IconButton
            onClick={onClose}
            aria-label={intl.formatMessage(messages.close)}
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
                {intl.formatMessage(messages.retry)}
              </Button>
            }
          >
            {intl.formatMessage(messages.loadListError)}
          </Alert>
        ) : documents.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 4 }}
          >
            {intl.formatMessage(messages.noDocuments)}
          </Typography>
        ) : (
          <List disablePadding>
            {documents.map((doc) => (
              <ListItemButton
                key={doc.id}
                selected={selectedId === doc.id}
                onClick={() => setSelectedId(doc.id)}
              >
                <ListItemText
                  primary={doc.title ?? `Document ${doc.id.slice(-6)}`}
                  secondary={formatDate(doc.updatedAt)}
                />
                <ListItemSecondaryAction>
                  <Tooltip title={intl.formatMessage(messages.deleteDocument)}>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => handleDelete(e, doc.id)}
                      disabled={isDeleting === doc.id}
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

      {hasLoadError && (
        <Alert severity="error" variant="outlined" sx={{ mx: 2, mt: 2 }}>
          {intl.formatMessage(messages.loadDocumentError)}
        </Alert>
      )}

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isLoadingDocument}>
          {intl.formatMessage(messages.close)}
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
          {intl.formatMessage(messages.loadAction)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoadDocumentModal;
