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
  IconButton,
  Input,
  InputLabel,
  Stack,
  Tooltip,
} from "@mui/material";
import React, { BaseSyntheticEvent, useState } from "react";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { useAppSelector } from "/src/app/hooks";
import { Sequence } from "/src/types/sequence";
import { DefaultSettings } from "/src/types/ui";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./ButtonWithModalDonwload.lang";
import { trackEvent } from "/src/hooks/usePageTracking";

const ButtonWithModalDownload = (): React.ReactElement => {
  const {
    sequence,
    ui: { defaultSettings },
  } = useAppSelector((state) => state);
  const intl = useIntl();

  const [openModal, setOpenModal] = useState(false);
  const [fileName, setFileName] = useState("");
  const [save, setSave] = useState({
    sequence: sequence.length > 0,
    defaultSettings: sequence.length === 0,
  });

  const onClick = () => {
    setOpenModal(true);
  };

  const onChangeCheckbox = (event: BaseSyntheticEvent, checked: boolean) => {
    const name = event.target.name;
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

    const fileElement = document.createElement("a");
    const downloadObject: {
      sequence?: Sequence;
      defaultSettings?: DefaultSettings;
    } = {};
    if (save.defaultSettings) {
      downloadObject.defaultSettings = defaultSettings;
      valueEventsTrace.push("defaultSettings");
    }
    if (save.sequence) {
      downloadObject.sequence = sequence;
      valueEventsTrace.push("sequence");
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
  };

  return (
    <>
      <Tooltip title={intl.formatMessage(messages.download)}>
        <IconButton
          color="secondary"
          onClick={onClick}
          aria-label={intl.formatMessage(messages.download)}
        >
          <AiOutlineCloudDownload />
        </IconButton>
      </Tooltip>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
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
              {sequence.length > 0 && (
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label={intl.formatMessage(messages.sequence)}
                  onChange={onChangeCheckbox}
                  name="sequence"
                />
              )}

              <FormControlLabel
                control={<Checkbox />}
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
    </>
  );
};

export default ButtonWithModalDownload;
