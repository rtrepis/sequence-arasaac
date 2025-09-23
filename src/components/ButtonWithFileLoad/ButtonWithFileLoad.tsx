import * as React from "react";
import { styled } from "@mui/material/styles";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { IconButton, Tooltip } from "@mui/material";
import { ChangeEvent } from "react";
import { useAppDispatch } from "/src/app/hooks";
import { addSequenceActionCreator } from "/src/app/slice/sequenceSlice";
import { updateDefaultSettingsActionCreator } from "/src/app/slice/uiSlice";
import { useIntl } from "react-intl";
import messages from "./ButtonWithFileLoad.lang";
import { trackEvent } from "/src/hooks/usePageTracking";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ButtonWithFileLoad = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const loadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const valueTrackEvent: string[] = [];
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsedJson = JSON.parse(e.target?.result as string);

            if ("sequence" in parsedJson) {
              dispatch(addSequenceActionCreator(parsedJson.sequence));
              valueTrackEvent.push("sequence");
            }

            if ("defaultSettings" in parsedJson) {
              dispatch(
                updateDefaultSettingsActionCreator(parsedJson.defaultSettings),
              );
              valueTrackEvent.push("defaultSettings");
            }
          } catch (error) {
            console.error(error);
          }
        };
        reader.readAsText(file);
      }
    }

    trackEvent({
      event: "load-event",
      event_category: "file",
      event_label: "load",
      value: valueTrackEvent.join(" "),
    });
  };

  return (
    <Tooltip title={intl.formatMessage(messages.load)}>
      <IconButton color="secondary" component="label">
        <AiOutlineCloudUpload />
        <VisuallyHiddenInput
          type="file"
          onChange={loadFile}
          accept="text/plain,.saac,application/json"
        />
      </IconButton>
    </Tooltip>
  );
};

export default ButtonWithFileLoad;
