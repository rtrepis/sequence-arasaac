// Modal per llistar i carregar documents desats al backend.
import React, { useEffect, useState } from "react";
import {
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

  // Carrega la llista en obrir el modal
  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    dispatch(listDocumentsThunk())
      .unwrap()
      .then((docs) => setDocuments(docs))
      .catch(() => setDocuments([]))
      .finally(() => setIsLoading(false));
  }, [open, dispatch]);

  const handleLoad = async (): Promise<void> => {
    if (!selectedId) return;
    const result = await dispatch(loadDocumentThunk(selectedId));
    if (result.meta.requestStatus === "fulfilled") {
      onLoaded();
      onClose();
    }
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

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {intl.formatMessage(messages.close)}
        </Button>
        <Button
          onClick={handleLoad}
          variant="contained"
          disabled={!selectedId || isLoading}
        >
          {intl.formatMessage(messages.loadAction)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoadDocumentModal;
