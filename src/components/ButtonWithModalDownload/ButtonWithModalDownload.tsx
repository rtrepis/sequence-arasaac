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
} from "@mui/material";
import React, { BaseSyntheticEvent, useState } from "react";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { useAppSelector } from "/src/app/hooks";
import { Sequence } from "/src/types/sequence";
import { DefaultSettings } from "/src/types/ui";

const ButtonWithModalDownload = (): React.ReactElement => {
  const {
    sequence,
    ui: { defaultSettings },
  } = useAppSelector((state) => state);
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
    const isoString = new Date().toISOString();

    const fileElement = document.createElement("a");
    const downloadObject: {
      sequence?: Sequence;
      defaultSettings?: DefaultSettings;
    } = {};
    if (save.defaultSettings) downloadObject.sequence = sequence;
    if (save.sequence) downloadObject.defaultSettings = defaultSettings;

    const file = new Blob([JSON.stringify(downloadObject)], {
      type: "text/plain",
    });
    fileElement.href = URL.createObjectURL(file);
    fileElement.download =
      fileName !== ""
        ? `${fileName}.saac`
        : `SequenciAAC_${isoString.slice(0, -5)}.saac`;
    fileElement.click();
  };

  return (
    <>
      <IconButton
        color="secondary"
        onClick={onClick}
        // aria-label={intl.formatMessage({ ...messages.download })}
      >
        <AiOutlineCloudDownload />
      </IconButton>
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>
          Save...
          <FormHelperText>Save you sequence and load it later</FormHelperText>
        </DialogTitle>
        <DialogContent>
          <form name="download-form">
            <FormGroup>
              {sequence.length > 0 && (
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label={"Sequence"}
                  onChange={onChangeCheckbox}
                  name="sequence"
                />
              )}
              <FormControlLabel
                control={<Checkbox />}
                label={"Default Settings"}
                onChange={onChangeCheckbox}
                name="defaultSettings"
              />
            </FormGroup>
            <FormControl sx={{ marginTop: 2 }}>
              <InputLabel>FileName</InputLabel>
              <Input onChange={onChangeFileName} value={fileName} />
            </FormControl>
            <Stack marginTop={2} alignItems={"flex-end"}>
              <Button type="submit" onClick={onSaveFile}>
                Save & Download
              </Button>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ButtonWithModalDownload;
