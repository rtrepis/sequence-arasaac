import { List, Stack, TextField } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import PictogramSearch from "../PictogramSearch/PictogramSearch";
import { PictSequence } from "../../types/sequence";
import SettingAccordion from "../SettingAccordion/SettingAccordion";
import messages from "./PictEditForm.lang";
import SettingCard from "../SettingsCards/SettingCard/SettingCard";
import SettingCardNumber from "../SettingsCards/SettingCardNumber/SettingCardNumber";
import { useIntl } from "react-intl";
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { updatePictSequenceActionCreator } from "../../app/slice/sequenceSlice";

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
  const [textPosition, setTextPosition] = useState(
    pictogram.settings.textPosition!
  );
  const [text, setText] = useState(pictogram.text);

  const [skin, setSkin] = useState(pictogram.img.settings.skin!);
  const [hair, setHair] = useState(pictogram.img.settings.hair!);

  const initialSearch = {
    selectedId: pictogram.img.selectedId,
    fitzgerald: pictogram.img.settings.fitzgerald,
  };
  const [search, setSearch] = useState(initialSearch);
  const { fitzgerald, selectedId } = search;

  const pictogramGuide: PictSequence = {
    ...pictogram,
    img: {
      ...pictogram.img,
      selectedId,
      settings: { fitzgerald, skin, hair },
    },
    settings: { ...pictogram.settings, fontSize, textPosition },
    text,
  };

  const handlerSubmit = useCallback(() => {
    const newPictogram: PictSequence = {
      ...pictogram,
      img: {
        ...pictogram.img,
        selectedId,
        settings: { fitzgerald, skin, hair },
      },
      settings: { fontSize, textPosition },
      text,
    };

    dispatch(updatePictSequenceActionCreator(newPictogram));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    fontSize,
    textPosition,
    skin,
    selectedId,
    hair,
    fitzgerald,
    text,
  ]);

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
          pictogram={pictogramGuide}
          variant="plane"
          view="complete"
        />

        <PictogramSearch
          indexPict={pictogram.indexSequence}
          state={search}
          setState={setSearch}
        />
      </Stack>

      <SettingAccordion title={`${intl.formatMessage({ ...messages.title })}`}>
        <List>
          {pictogram.settings.textPosition && (
            <li>
              <SettingCard
                setting="textPosition"
                state={textPosition}
                setState={setTextPosition}
              />
            </li>
          )}
          <TextField
            value={text}
            onChange={(event) => setText(event.target.value)}
            helperText={"Custom Text"}
            variant="filled"
            fullWidth
          />
          {pictogram.settings.fontSize && (
            <li>
              <SettingCardNumber
                setting="fontSize"
                state={fontSize}
                setState={setFontSize}
              />
            </li>
          )}
          {pictogram.img.settings.skin && (
            <li>
              <SettingCard setting="skin" state={skin} setState={setSkin} />
            </li>
          )}
          {pictogram.img.settings.hair && (
            <li>
              <SettingCard setting="hair" state={hair} setState={setHair} />
            </li>
          )}
        </List>
      </SettingAccordion>
    </>
  );
};

export default PictEditForm;
