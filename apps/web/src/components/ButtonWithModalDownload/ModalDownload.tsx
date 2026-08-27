import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Input,
  InputLabel,
  Stack,
} from "@mui/material";
import React, { BaseSyntheticEvent, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./ModalDownload.lang";
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

  const onSaveFile = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <FormattedMessage {...messages.save} />
        ...
        <FormHelperText>
          <FormattedMessage {...messages.saveHelper} />
        </FormHelperText>
      </DialogTitle>

      <DialogContent>
        <form name="download-form">
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

          <FormControl sx={{ marginTop: 2 }}>
            <InputLabel>
              <FormattedMessage {...messages.filename} />
            </InputLabel>
            <Input onChange={onChangeFileName} value={fileName} />
          </FormControl>

          <Stack marginTop={2} alignItems={"flex-end"}>
            <Button type="submit" onClick={onSaveFile}>
              <FormattedMessage {...messages.save} /> &{" "}
              <FormattedMessage {...messages.download} />
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDownload;
