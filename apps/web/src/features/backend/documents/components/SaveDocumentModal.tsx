// Diàleg per desar el document al núvol amb un nom triat per l'usuari.
//
// Abans, «Desa al núvol» enviava el document directament i sense nom: al llistat
// tots es deien «Document» i sis caràcters d'identificador. Amb el sostre de
// documents per compte, saber quin és quin abans d'esborrar-ne cap deixa de ser
// una comoditat. La casella no comença en blanc — es proposa el nom a partir de
// les primeres paraules de la seqüència — perquè posar-hi nom no costi més que no
// posar-n'hi.
import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import messages from "./DocumentModals.lang";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  saveDocumentThunk,
  setDocumentTitleActionCreator,
} from "@features/sequence/store/documentSlice";
import {
  DOCUMENT_TITLE_MAX_LENGTH,
  suggestDocumentTitle,
} from "@features/sequence/utils/suggestDocumentTitle";
import { isMongoId } from "../services/documentService";
import { useDocumentTransfer } from "../hooks/useDocumentTransfer";
import { useFeedback } from "@/context/FeedbackContext";

interface SaveDocumentModalProps {
  open: boolean;
  onClose: () => void;
}

const SaveDocumentModal = ({
  open,
  onClose,
}: SaveDocumentModalProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const document = useAppSelector((state) => state.document);
  const transfer = useDocumentTransfer();

  // El component es munta en obrir-se, així que l'estat inicial ja és el bo:
  // el nom que ja tenia el document o, si no en tenia, el que se li proposa.
  const [name, setName] = useState(
    () => document.title ?? suggestDocumentTitle(document),
  );
  const [isNameMissing, setIsNameMissing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Ja desat al núvol: desar-lo ara en substitueix la versió, no en crea un de nou
  const isExisting = isMongoId(document.id);

  const handleClose = (): void => {
    // Tancar a mitja pujada deixaria l'usuari sense saber com ha acabat
    if (isSaving) return;
    onClose();
  };

  const handleSave = async (): Promise<void> => {
    const title = name.trim();
    if (!title) {
      setIsNameMissing(true);
      return;
    }

    setIsSaving(true);
    setErrorCode(null);
    dispatch(setDocumentTitleActionCreator(title));

    const result = await dispatch(saveDocumentThunk({ ...document, title }));
    setIsSaving(false);

    if (result.meta.requestStatus === "fulfilled") {
      showSnackbar({
        message: intl.formatMessage(messages.documentSavedNamed, { title }),
        severity: "success",
      });
      onClose();
      return;
    }

    // El thunk retorna el codi semàntic del backend; el diàleg es queda obert
    // perquè l'usuari pugui tornar-ho a provar sense reescriure el nom
    setErrorCode(String(result.payload ?? "DOCUMENT_SAVE_ERROR"));
  };

  // Missatge del progrés: mentre puja, el percentatge; quan ja ha arribat tot,
  // el que queda és feina del servidor (pujar imatges a Cloudinary i desar)
  const progressMessage = (): string => {
    if (transfer.phase === "upload" && transfer.percent !== null) {
      return transfer.percent < 100
        ? intl.formatMessage(messages.uploading, { percent: transfer.percent })
        : intl.formatMessage(authMessages.savingDocument);
    }
    if (transfer.phase === "upload") {
      return intl.formatMessage(messages.uploadingUnknown);
    }
    return intl.formatMessage(authMessages.savingDocument);
  };

  const errorMessage =
    authMessages[errorCode as keyof typeof authMessages] ??
    authMessages.DOCUMENT_SAVE_ERROR;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="save-doc-modal-title"
    >
      <DialogTitle id="save-doc-modal-title">
        {intl.formatMessage(
          isExisting ? messages.updateTitle : messages.saveTitle,
        )}
      </DialogTitle>

      <DialogContent>
        {isExisting && (
          <DialogContentText variant="body2" sx={{ mb: 2 }}>
            {intl.formatMessage(messages.updateHint)}
          </DialogContentText>
        )}

        <TextField
          autoFocus
          fullWidth
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setIsNameMissing(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !isSaving) void handleSave();
          }}
          disabled={isSaving}
          label={intl.formatMessage(messages.nameLabel)}
          error={isNameMissing}
          helperText={intl.formatMessage(
            isNameMissing ? messages.nameRequired : messages.nameHelper,
          )}
          inputProps={{ maxLength: DOCUMENT_TITLE_MAX_LENGTH }}
        />

        {isSaving && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {progressMessage()}
            </Typography>
            {/* Determinada mentre axios sàpiga la mida total; si no la sap, val
                més una barra indeterminada que un percentatge inventat */}
            {transfer.percent !== null ? (
              <LinearProgress variant="determinate" value={transfer.percent} />
            ) : (
              <LinearProgress />
            )}
          </Box>
        )}

        {errorCode && (
          <Alert severity="error" variant="outlined" sx={{ mt: 2 }}>
            {intl.formatMessage(authMessages.errorWithCode, {
              message: intl.formatMessage(errorMessage),
              code: errorCode,
            })}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={isSaving}>
          {intl.formatMessage(messages.cancel)}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {intl.formatMessage(
            isExisting ? messages.updateAction : messages.saveAction,
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveDocumentModal;
