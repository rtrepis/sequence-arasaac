import {
  Checkbox,
  DialogContentText,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@mui/material";
import React, { BaseSyntheticEvent, useState } from "react";
import { useIntl } from "react-intl";
import messages from "./ModalDownload.lang";
// «Cancel·la» és un sol missatge per a tota l'app i viu al ConfirmDialog
import confirmMessages from "@components/ConfirmDialog/ConfirmDialog.lang";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { documentMadeDurableActionCreator } from "@features/sequence/store/documentStatusSlice";
import { trackEvent } from "@shared/hooks/usePageTracking";
import { DefaultSettings } from "@/types/ui";
import { DocumentSAAC } from "@/types/document";
import { useFeedback } from "@/context/FeedbackContext";
import feedbackMessages from "@/context/FeedbackContext/FeedbackContext.lang";

interface ModalDownloadProps {
  open: boolean;
  onClose: () => void;
}

const ModalDownload = ({
  open,
  onClose,
}: ModalDownloadProps): React.ReactElement => {
  const {
    document: documentSaac,
    ui: { defaultSettings },
  } = useAppSelector((state) => state);
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();

  const [fileName, setFileName] = useState("");

  const documentSaacIsNotEmpty = documentSaac.content[0].length > 0;
  // Les caselles són controlades: el que es pinta i el que se n'endú el fitxer
  // surten del mateix valor. Amb `defaultChecked` i un estat inicial a part,
  // la configuració es colava dins del `.saac` amb la casella desmarcada
  // (troballa C8 de l'auditoria d'UX).
  const [save, setSave] = useState({
    documentState: documentSaacIsNotEmpty,
    defaultSettings: false,
  });

  const onChangeCheckbox = (event: BaseSyntheticEvent, checked: boolean) => {
    const name = event.target.name as keyof typeof save;

    setSave((previous) => {
      return { ...previous, [name]: checked };
    });
  };

  const onChangeFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFileName(value);
  };

  const onSaveFile = () => {
    const valueEventsTrace: string[] = [];
    const isoString = new Date().toISOString();

    const fileElement = window.document.createElement("a");
    const downloadObject: {
      documentState?: DocumentSAAC;
      defaultSettings?: DefaultSettings;
    } = {};

    if (save.defaultSettings) {
      downloadObject.defaultSettings = defaultSettings;
      valueEventsTrace.push("defaultSettings");
    }

    if (save.documentState) {
      downloadObject.documentState = documentSaac;
      valueEventsTrace.push("documentState");
      // Només compta com a còpia externa si el fitxer se'n duu la seqüència:
      // baixar-se la configuració sola no salva cap feina
      dispatch(documentMadeDurableActionCreator({ kind: "file" }));
    }

    const file = new Blob([JSON.stringify(downloadObject)], {
      type: "text/plain",
    });
    fileElement.href = URL.createObjectURL(file);
    fileElement.download =
      fileName !== ""
        ? `${fileName}.saac`
        : `SequenciAAC_${isoString.slice(0, -5)}.saac`;
    fileElement.click();

    trackEvent({
      event: "safe-event",
      event_category: "file",
      event_label: "safe:",
      value: valueEventsTrace.join(" "),
    });

    // Mostrem el snackbar de confirmació
    showSnackbar({
      message: intl.formatMessage(feedbackMessages.saveSuccess),
      severity: "success",
    });

    onClose();
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      // Un sol missatge, i no «Desa» + «&» + «Descarregar» ajuntats a mà: en
      // cinc idiomes, l'ordre i la conjunció no són nostres per decidir (F4)
      title={intl.formatMessage(messages.dialogTitle)}
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
          <StyledButton onClick={onSaveFile} variant="contained">
            {intl.formatMessage(messages.download)}
          </StyledButton>
        </AppDialogActions>
      }
    >
      {/* L'ajuda, fora del títol: dins de l'encapçalament es llegia com si en
          formés part */}
      <DialogContentText variant="body2" sx={{ mb: 2 }}>
        {intl.formatMessage(messages.saveHelper)}
      </DialogContentText>

      <FormGroup>
        {documentSaacIsNotEmpty && (
          <FormControlLabel
            control={<Checkbox checked={save.documentState} />}
            label={intl.formatMessage(messages.sequence)}
            onChange={onChangeCheckbox}
            name="documentState"
          />
        )}

        <FormControlLabel
          control={<Checkbox checked={save.defaultSettings} />}
          label={intl.formatMessage(messages.defaultSettings)}
          onChange={onChangeCheckbox}
          name="defaultSettings"
        />
      </FormGroup>

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
