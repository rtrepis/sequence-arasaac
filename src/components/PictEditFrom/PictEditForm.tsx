import { List, Stack } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import PictogramSearch from "../PictogramSearch/PictogramSearch";
import { PictSequence } from "../../types/sequence";
import SettingAccordion from "../SettingAccordion/SettingAccordion";
import messages from "./PictEditForm.lang";
import SettingCard from "../SettingsCards/SettingCard/SettingCard";
import SettingCardNumber from "../SettingsCards/SettingCardNumber/SettingCardNumber";
import { useIntl } from "react-intl";
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { updatePictSequenceActionCreator } from "../../app/slice/sequenceSlice";
import SettingCadTextFiled from "../SettingsCards/SettingCardTextFiled/SettingCardTextFiled";
import SettingCardBoolean from "../SettingsCards/SettingCardBoolean/SettingCardBoolean";

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
  const {
    pictSequence: {
      fontSize: defaultFontSize,
      textPosition: defaultTextPosition,
    },
    pictApiAra: { hair: defaultHair, skin: defaultSkin },
  } = useAppSelector((state) => state.ui.defaultSettings);

  const initialFontSize = pictogram.settings.fontSize
    ? pictogram.settings.fontSize
    : defaultFontSize;
  const [fontSize, setFontSize] = useState(initialFontSize);

  const initialTextPosition = pictogram.settings.textPosition
    ? pictogram.settings.textPosition
    : defaultTextPosition;
  const [textPosition, setTextPosition] = useState(initialTextPosition);
  const [text, setText] = useState(pictogram.text);

  const initialSkin = pictogram.img.settings.skin
    ? pictogram.img.settings.skin
    : undefined;
  const [skin, setSkin] = useState(initialSkin);

  const initialHair = pictogram.img.settings.hair
    ? pictogram.img.settings.hair
    : undefined;
  const [hair, setHair] = useState(initialHair);

  const initialSearch = {
    selectedId: pictogram.img.selectedId,
    fitzgerald: pictogram.img.settings.fitzgerald,
  };
  const [search, setSearch] = useState(initialSearch);
  const { fitzgerald, selectedId } = search;

  const [cross, setCross] = useState(pictogram.cross);

  const pictogramGuide: PictSequence = {
    ...pictogram,
    img: {
      ...pictogram.img,
      selectedId,
      settings: { fitzgerald, skin, hair },
    },
    settings: { ...pictogram.settings, fontSize, textPosition },
    text,
    cross,
  };

  const handlerSubmit = useCallback(() => {
    const newPictogram: PictSequence = {
      indexSequence: pictogram.indexSequence,
      img: {
        searched: pictogram.img.searched,
        selectedId,
        settings: { fitzgerald, skin, hair },
      },
      settings: { fontSize, textPosition },
      text,
      cross,
    };

    dispatch(updatePictSequenceActionCreator(newPictogram));
  }, [
    pictogram.indexSequence,
    pictogram.img.searched,
    selectedId,
    fitzgerald,
    skin,
    hair,
    fontSize,
    textPosition,
    text,
    dispatch,
    cross,
  ]);

  useEffect(() => {
    if (submit) handlerSubmit();
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
          <li>
            <SettingCadTextFiled
              setting="customText"
              state={text}
              setState={setText}
            />
          </li>
          {pictogram.settings.textPosition && (
            <li>
              <SettingCard
                setting="textPosition"
                state={textPosition}
                setState={setTextPosition}
              />
            </li>
          )}
          {pictogram.settings.fontSize && (
            <li>
              <SettingCardNumber
                setting="fontSize"
                state={fontSize}
                setState={setFontSize}
              />
            </li>
          )}
          <li>
            <SettingCardBoolean
              setting="corss"
              state={cross}
              setState={setCross}
            />
          </li>
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
