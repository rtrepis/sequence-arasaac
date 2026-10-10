import { Box, DialogContentText, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import messages from "./ModalDownload.lang";
// «Cancel·la» és un sol missatge per a tota l'app i viu al ConfirmDialog
import confirmMessages from "@components/ConfirmDialog/ConfirmDialog.lang";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import { useStore } from "react-redux";
import type { RootState } from "@/app/store";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { documentMadeDurableActionCreator } from "@features/sequence/store/documentStatusSlice";
import { documentStyleMaterializedActionCreator } from "@features/sequence/store/documentSlice";
import { selectDocumentStyle } from "@features/sequence/style/styleSelectors";
import {
  DOCUMENT_FILE_EXTENSION,
  STYLE_FILE_EXTENSION,
} from "@features/sequence/saac/types";
import {
  buildStyleFileV3,
  documentToV3,
  serializeSaac,
} from "@features/sequence/saac/serialize";
import { serializeContextOf } from "@features/sequence/saac/saacContext";
import {
  downloadSaac,
  SaacFileExtension,
} from "@features/sequence/saac/download";
import { trackEvent } from "@shared/hooks/usePageTracking";
import { useFeedback } from "@/context/FeedbackContext";
import feedbackMessages from "@/context/FeedbackContext/FeedbackContext.lang";

interface ModalDownloadProps {
  open: boolean;
  onClose: () => void;
  /**
   * Què es desa: el document (per defecte; sempre amb el seu estil) o només
   * l'estil. El segon només s'obre des del panell «Estil del document».
   */
  kind?: "document" | "style";
}

/**
 * Desar a fitxer, amb una sola acció (`docs/fonaments/03-model-contingut-estil.md`,
 * punt 2): «Desa el document» se n'endú sempre l'estil. Abans hi havia dues
 * caselles —seqüència i configuració— que donaven tres combinacions, i la del
 * document sense estil feia que en obrir-lo es veiés amb les preferències de
 * qui l'obria. Desar només l'estil és una altra acció i viu al panell «Estil
 * del document», que obre aquest mateix diàleg amb `kind="style"`.
 */
const ModalDownload = ({
  open,
  onClose,
  kind = "document",
}: ModalDownloadProps): React.ReactElement => {
  const documentSaac = useAppSelector((state) => state.document);
  const style = useAppSelector(selectDocumentStyle);
  const store = useStore<RootState>();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();

  const [fileName, setFileName] = useState("");

  const onChangeFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
  };

  const download = (json: string, extension: SaacFileExtension) => {
    downloadSaac(json, fileName, extension);

    showSnackbar({
      message: intl.formatMessage(feedbackMessages.saveSuccess),
      severity: "success",
    });
    onClose();
  };

  const onSaveDocument = () => {
    // El document sencer en format v3: contingut, estil, pàgina i imatges
    const file = documentToV3(
      documentSaac,
      serializeContextOf(store.getState()),
    );
    download(serializeSaac(file), DOCUMENT_FILE_EXTENSION);
    // El que s'ha desat ja té l'estil i la pàgina propis: si el document els
    // heretava, deixa de seguir els de l'usuari, com qualsevol document obert
    // d'un fitxer
    dispatch(
      documentStyleMaterializedActionCreator({
        style,
        layout: {
          pageSize: file.page.size,
          orientation: file.page.orientation,
          direction: file.page.direction,
        },
        // L'autor que s'hi ha escrit (B21): buit si el fitxer no en porta
        author: file.meta.author ?? "",
      }),
    );
    dispatch(documentMadeDurableActionCreator({ kind: "file" }));
    trackEvent({
      event: "safe-event",
      event_category: "file",
      event_label: "safe:",
      value: "documentState",
    });
  };

  const onSaveStyle = () => {
    // Desar l'estil no salva cap feina: no compta com a còpia del document
    download(serializeSaac(buildStyleFileV3(style)), STYLE_FILE_EXTENSION);
    trackEvent({
      event: "safe-event",
      event_category: "file",
      event_label: "safe:",
      value: "style",
    });
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      // Un sol missatge, i no «Desa» + «&» + «Descarregar» ajuntats a mà: en
      // cinc idiomes, l'ordre i la conjunció no són nostres per decidir (F4)
      title={intl.formatMessage(
        kind === "style" ? messages.styleDialogTitle : messages.dialogTitle,
      )}
      titleId="download-dialog-title"
      maxWidth="xs"
      actions={
        <AppDialogActions>
          {/* Fins ara aquest diàleg no tenia cap manera de tancar-se: en tàctil,
              on no hi ha ESC, l'única sortida era clicar fora i no ho deia
              ningú (F1) */}
          <StyledButton onClick={onClose} color="inherit">
            {intl.formatMessage(confirmMessages.cancel)}
          </StyledButton>
          {kind === "style" ? (
            <StyledButton onClick={onSaveStyle} variant="contained">
              {intl.formatMessage(messages.saveStyle)}
            </StyledButton>
          ) : (
            <StyledButton onClick={onSaveDocument} variant="contained">
              {intl.formatMessage(messages.saveDocument)}
            </StyledButton>
          )}
        </AppDialogActions>
      }
    >
      {/* L'ajuda, fora del títol: dins de l'encapçalament es llegia com si en
          formés part */}
      <DialogContentText variant="body2" sx={{ mb: 2 }}>
        {intl.formatMessage(
          kind === "style" ? messages.styleHelper : messages.saveHelper,
        )}
      </DialogContentText>

      {/* Què es guarda i què no: el document és autocontingut, i les
          preferències de l'app no hi van mai (fonament 03, §3) */}
      {kind === "document" && (
        <Box
          component="section"
          aria-labelledby="download-dialog-what-is-saved"
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            id="download-dialog-what-is-saved"
            component="h3"
            variant="subtitle2"
          >
            {intl.formatMessage(messages.whatIsSavedTitle)}
          </Typography>
          <Typography component="ul" variant="body2" sx={{ pl: 2.5, my: 1 }}>
            <li>{intl.formatMessage(messages.whatIsSavedSequences)}</li>
            <li>{intl.formatMessage(messages.whatIsSavedStyle)}</li>
            <li>{intl.formatMessage(messages.whatIsSavedPage)}</li>
            <li>{intl.formatMessage(messages.whatIsSavedImages)}</li>
          </Typography>
          <Typography variant="body2">
            {intl.formatMessage(messages.whatIsNotSaved)}
          </Typography>
        </Box>
      )}

      {/* `TextField` i no `InputLabel` + `Input`: així el nom del camp queda
          lligat al camp, que abans no ho estava */}
      <TextField
        fullWidth
        value={fileName}
        onChange={onChangeFileName}
        label={intl.formatMessage(messages.filename)}
        sx={{ mt: 2 }}
      />
    </AppDialog>
  );
};

export default ModalDownload;
