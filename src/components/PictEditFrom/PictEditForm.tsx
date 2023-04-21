import { Button, List, Stack } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import PictogramSearch from "../PictogramSearch/PictogramSearch";
import { PictSequence } from "../../types/sequence";
import SettingAccordion from "../SettingAccordion/SettingAccordion";
import messages from "./PictEditForm.lang";
import SettingCard from "../SettingCard/SettingCard";
import SettingCardNumber from "../SettingCardNumber/SettingCardNumber";
import { useIntl } from "react-intl";
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import {
  updatePictSequenceActionCreator,
} from "../../app/slice/sequenceSlice";

interface PictEditFormProps {
  pictogram: PictSequence;
  submit: boolean;
}

const PictEditForm = ({
  pictogram,
  submit,
}: PictEditFormProps): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [fontSize, setFontSize] = useState(pictogram.settings.fontSize!);

  const pictogramGuide2: PictSequence = {
    ...pictogram,
    settings: { ...pictogram.settings, fontSize },
  };

  const handlerSubmit = useCallback(() => {
    const newPictogram: PictSequence = {
      ...pictogram,
      settings: { ...pictogram.settings, fontSize },
    };

    dispatch(updatePictSequenceActionCreator(newPictogram));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, fontSize]);

  useEffect(() => {
    if (submit === false) handlerSubmit();
  }, [submit, handlerSubmit]);
  return (
    <>
      <Stack
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"start"}
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 3, sm: 2 }}
      >
        <PictogramCard
          pictogram={pictogramGuide2}
          variant="plane"
          view="complete"
        />

        <PictogramSearch indexPict={pictogram.indexSequence} />
      </Stack>
      <Button onClick={handlerSubmit}>Update</Button>

      <SettingAccordion title={`${intl.formatMessage({ ...messages.title })}`}>
        <List>
          {pictogram.settings.textPosition && (
            <li>
              <SettingCard
                setting="textPosition"
                indexPict={pictogram.indexSequence}
                selected={pictogram.settings.textPosition}
              />
            </li>
          )}
          {pictogram.settings.fontSize && (
            <li>
              <SettingCardNumber
                setting="fontSize"
                indexPict={pictogram.indexSequence}
                selected={pictogram.settings.fontSize}
                state={fontSize}
                setState={setFontSize}
              />
            </li>
          )}
          {pictogram.img.settings.skin && (
            <li>
              <SettingCard
                setting="skin"
                indexPict={pictogram.indexSequence}
                selected={pictogram.img.settings.skin}
              />
            </li>
          )}
        </List>
      </SettingAccordion>
    </>
  );
};

export default PictEditForm;
