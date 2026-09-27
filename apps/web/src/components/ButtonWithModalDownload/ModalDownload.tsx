import { DialogContentText, TextField } from "@mui/material";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import messages from "./ModalDownload.lang";
// «Cancel·la» és un sol missatge per a tota l'app i viu al ConfirmDialog
import confirmMessages from "@components/ConfirmDialog/ConfirmDialog.lang";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { documentMadeDurableActionCreator } from "@features/sequence/store/documentStatusSlice";
import { documentStyleMaterializedActionCreator } from "@features/sequence/store/documentSlice";
import { selectDocumentStyle } from "@features/sequence/style/styleSelectors";
import {
  buildDocumentFile,
  buildStyleFile,
  DOCUMENT_FILE_EXTENSION,
  STYLE_FILE_EXTENSION,
} from "@features/sequence/style/saacFile";
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
 * Desar a fitxer, amb una sola acció (`docs/fonaments/sequencia-i-estil.md`,
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
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();

  const [fileName, setFileName] = useState("");

  const onChangeFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
  };

  const download = (content: object, extension: string) => {
    const isoString = new Date().toISOString();
    const fileElement = window.document.createElement("a");
    const file = new Blob([JSON.stringify(content)], { type: "text/plain" });
    fileElement.href = URL.createObjectURL(file);
    fileElement.download =
      fileName !== ""
        ? `${fileName}${extension}`
        : `SequenciAAC_${isoString.slice(0, -5)}${extension}`;
    fileElement.click();

    showSnackbar({
      message: intl.formatMessage(feedbackMessages.saveSuccess),
      severity: "success",
    });
    onClose();
  };

  const onSaveDocument = () => {
    download(buildDocumentFile(documentSaac, style), DOCUMENT_FILE_EXTENSION);
    // El que s'ha desat ja té l'estil propi: si el document l'heretava, deixa
    // de seguir l'estil per defecte, com qualsevol document obert d'un fitxer
    dispatch(documentStyleMaterializedActionCreator(style));
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
    download(buildStyleFile(style), STYLE_FILE_EXTENSION);
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
