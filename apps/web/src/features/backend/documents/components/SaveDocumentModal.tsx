// Diàleg per desar el document al núvol amb un nom triat per l'usuari, i
// l'única porta al «Desa'n una còpia».
//
// Abans, «Desa al núvol» enviava el document directament i sense nom: al llistat
// tots es deien «Document» i sis caràcters d'identificador. Amb el sostre de
// documents per compte, saber quin és quin abans d'esborrar-ne cap deixa de ser
// una comoditat. La casella no comença en blanc — es proposa el nom a partir de
// les primeres paraules de la seqüència — perquè posar-hi nom no costi més que no
// posar-n'hi.
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  DialogContentText,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import { useIntl } from "react-intl";
import messages from "./DocumentModals.lang";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  saveDocumentThunk,
  setDocumentTitleActionCreator,
} from "@features/sequence/store/documentSlice";
import { documentMadeDurableActionCreator } from "@features/sequence/store/documentStatusSlice";
import { refreshQuotaThunk } from "@features/backend/user-settings/store/quotaSlice";
import { warmUpBackend } from "@features/backend/api/warmUpBackend";
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

  // Obrir el diàleg és el primer senyal que vindrà una petició: mentre s'escriu
  // el nom, el servidor ja s'està despertant. Al de carregar no caldria —demana
  // el llistat en obrir-se i la petició de debò surt al mateix instant.
  useEffect(() => {
    if (open) void warmUpBackend();
  }, [open]);

  // El component es munta en obrir-se, així que l'estat inicial ja és el bo:
  // el nom que ja tenia el document o, si no en tenia, el que se li proposa.
  const [name, setName] = useState(
    () => document.title ?? suggestDocumentTitle(document),
  );
  // Un sol estat per als dos motius pels quals el nom no serveix: així el camp
  // no pot quedar mai en error sense dir quin és
  const [nameError, setNameError] = useState<
    "missing" | "sameAsOriginal" | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Ja desat al núvol: desar-lo ara en substitueix la versió, no en crea un de nou
  const isExisting = isMongoId(document.id);

  const handleClose = (): void => {
    // Tancar a mitja pujada deixaria l'usuari sense saber com ha acabat
    if (isSaving) return;
    onClose();
  };

  const handleSave = async (asCopy = false): Promise<void> => {
    const title = name.trim();
    if (!title) {
      setNameError("missing");
      return;
    }

    // Una còpia amb el nom de l'original deixaria dues files iguals al llistat,
    // i el llistat és l'únic lloc on es tria quin document es carrega o
    // s'esborra. Es demana el nom aquí, que és quan encara se'n sap la
    // diferència, i no després
    if (asCopy && title === document.title) {
      setNameError("sameAsOriginal");
      return;
    }

    setIsSaving(true);
    setErrorCode(null);
    dispatch(setDocumentTitleActionCreator(title));

    const result = await dispatch(
      saveDocumentThunk({ document: { ...document, title }, asCopy }),
    );
    setIsSaving(false);

    if (result.meta.requestStatus === "fulfilled") {
      // Ho declara qui desa i no qui l'ha cridat: així el botó flotant d'estat
      // diu la veritat vingui la crida del drawer o d'ell mateix
      dispatch(documentMadeDurableActionCreator({ kind: "cloud" }));
      // El consum acaba de canviar: si no es refresca, el comptador d'espai
      // continuaria dient el d'abans de pujar les imatges d'aquest document
      void dispatch(refreshQuotaThunk());
      showSnackbar({
        // La còpia diu, a més, sobre què es treballa a partir d'ara: el thunk
        // ha canviat l'id del document per la còpia, i qui no ho sap acabaria
        // desant a la còpia pensant que desa a l'original
        message: intl.formatMessage(
          asCopy ? messages.documentCopiedNamed : messages.documentSavedNamed,
          { title },
        ),
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
    <AppDialog
      open={open}
      onClose={handleClose}
      title={intl.formatMessage(
        isExisting ? messages.updateTitle : messages.saveTitle,
      )}
      titleId="save-doc-modal-title"
      actions={
        <AppDialogActions
          startAction={
            // Ni acceptar ni cancel·lar: desa, però no on l'usuari ve de desar.
            // Va sol a l'esquerra, separat de l'acció que substitueix la versió
            // del núvol, perquè no s'hi premi per inèrcia
            isExisting ? (
              <StyledButton
                onClick={() => void handleSave(true)}
                variant="outlined"
                color="inherit"
                disabled={isSaving}
              >
                {intl.formatMessage(messages.saveCopyAction)}
              </StyledButton>
            ) : undefined
          }
        >
          <StyledButton
            onClick={handleClose}
            color="inherit"
            disabled={isSaving}
          >
            {intl.formatMessage(messages.cancel)}
          </StyledButton>
          <StyledButton
            onClick={() => void handleSave()}
            variant="contained"
            disabled={isSaving}
          >
            {intl.formatMessage(
              isExisting ? messages.updateAction : messages.saveAction,
            )}
          </StyledButton>
        </AppDialogActions>
      }
    >
      {isExisting && (
        <DialogContentText variant="body2" sx={{ mb: 2 }}>
          {intl.formatMessage(messages.updateHint)}{" "}
          {intl.formatMessage(messages.copyHint)}
        </DialogContentText>
      )}

      <TextField
        autoFocus
        fullWidth
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setNameError(null);
        }}
        onKeyDown={(event) => {
          // Enter fa l'acció principal, mai la còpia: el que es prem sense
          // mirar ha de ser el que el diàleg diu al títol
          if (event.key === "Enter" && !isSaving) void handleSave();
        }}
        disabled={isSaving}
        label={intl.formatMessage(messages.nameLabel)}
        error={nameError !== null}
        helperText={intl.formatMessage(
          nameError === "missing"
            ? messages.nameRequired
            : nameError === "sameAsOriginal"
              ? messages.nameSameAsOriginal
              : messages.nameHelper,
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
    </AppDialog>
  );
};

export default SaveDocumentModal;
