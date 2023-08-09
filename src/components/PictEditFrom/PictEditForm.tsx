import { List, Stack } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import PictogramSearch from "../PictogramSearch/PictogramSearch";
import { PictSequence } from "../../types/sequence";
import SettingAccordion from "../SettingAccordion/SettingAccordion";
import messages from "./PictEditForm.lang";
import SettingCard from "../SettingsCards/SettingCard/SettingCard";
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
    pictSequence: { textPosition: defaultTextPosition },
    pictApiAra: { skin: defaultSkin, hair: defaultHair, color: defaultColor },
  } = useAppSelector((state) => state.ui.defaultSettings);

  const initialTextPosition =
    pictogram.settings.textPosition ?? defaultTextPosition;
  const [textPosition, setTextPosition] = useState(initialTextPosition);
  const [text, setText] = useState(pictogram.text);

  const initialSkin = pictogram.img.settings.skin ?? defaultSkin;
  const [skin, setSkin] = useState(initialSkin);

  const initialHair = pictogram.img.settings.hair ?? defaultHair;
  const [hair, setHair] = useState(initialHair);

  const initialSearch = {
    selectedId: pictogram.img.selectedId,
    fitzgerald: pictogram.img.settings.fitzgerald,
  };
  const [search, setSearch] = useState(initialSearch);
  const { fitzgerald, selectedId } = search;

  const [cross, setCross] = useState(pictogram.cross);

  const initialColor = pictogram.img.settings.color ?? defaultColor;
  const [color, setColor] = useState(initialColor);

  const pictogramGuide: PictSequence = {
    ...pictogram,
    img: {
      ...pictogram.img,
      selectedId,
      settings: { fitzgerald, skin, hair, color },
    },
    settings: { ...pictogram.settings, textPosition },
    text,
    cross,
  };

  const handlerSubmit = useCallback(() => {
    const newPictogram: PictSequence = {
      indexSequence: pictogram.indexSequence,
      img: {
        searched: pictogram.img.searched,
        selectedId,
        settings: { fitzgerald, skin, hair, color },
      },
      settings: { textPosition },
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
    color,
    textPosition,
    text,
    cross,
    dispatch,
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

          <Stack
            display={"flex"}
            direction={"row"}
            flexWrap={"wrap"}
            marginTop={1}
            rowGap={2}
            columnGap={2}
          >
            <li>
              <SettingCardBoolean
                setting="corss"
                state={cross}
                setState={setCross}
              />
            </li>

            <li>
              <SettingCardBoolean
                setting="color"
                state={color}
                setState={setColor}
              />
            </li>
          </Stack>
          {pictogram.img.settings.color && pictogram.img.settings.skin && (
            <li>
              <SettingCard setting="skin" state={skin} setState={setSkin} />
            </li>
          )}
          {pictogram.img.settings.hair && pictogram.img.settings.color && (
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
