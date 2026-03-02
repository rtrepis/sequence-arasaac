import { List, Stack, Box, Button } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import PictogramSearch from "../PictogramSearch/PictogramSearch";
import { PictSequence } from "../../types/sequence";
import SettingAccordion from "../SettingAccordion/SettingAccordion";
import messages from "./PictEditForm.lang";
import SettingCard from "../SettingsCards/SettingCard/SettingCard";
import { useIntl } from "react-intl";
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { updatePictSequenceActionCreator } from "../../app/slice/documentSlice";
import SettingCadTextFiled from "../SettingsCards/SettingCardTextFiled/SettingCardTextFiled";
import SettingCardBoolean from "../SettingsCards/SettingCardBoolean/SettingCardBoolean";
import React from "react";
import SettingCardBorder from "../SettingsCards/SettingCardBorder/SettingCardBorder";
import { MdSettingsBackupRestore } from "react-icons/md";

interface PictEditFormProps {
  pictogram: PictSequence;
  submit: boolean;
}

const PictEditForm = ({
  pictogram,
  submit,
}: PictEditFormProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const {
    pictSequence: {
      textPosition: defaultTextPosition,
      borderIn: defaultBorderIn,
      borderOut: defaultBorderOut,
    },
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
    url: pictogram.img.url,
    color: pictogram.img.settings.color,
    hair: pictogram.img.settings.hair,
    skin: pictogram.img.settings.skin,
  };
  const [search, setSearch] = useState(initialSearch);
  const { fitzgerald, selectedId, url } = search;

  const [cross, setCross] = useState(pictogram.cross);

  const initialColor = pictogram.img.settings.color ?? defaultColor;
  const [color, setColor] = useState(initialColor);

  const initialBorderIn = pictogram.settings.borderIn ?? defaultBorderIn;
  const [borderIn, setBorderIn] = useState(initialBorderIn);

  const initialBorderOut = pictogram.settings.borderOut ?? defaultBorderOut;
  const [borderOut, setBorderOut] = useState(initialBorderOut);

  const pictogramGuide: PictSequence = {
    ...pictogram,
    img: {
      ...pictogram.img,
      url,
      selectedId,
      settings: { fitzgerald, skin, hair, color },
    },
    settings: { ...pictogram.settings, textPosition, borderIn, borderOut },
    text,
    cross,
  };

  const handlerSubmit = useCallback(() => {
    const newPictogram: PictSequence = {
      indexSequence: pictogram.indexSequence,
      img: {
        searched: pictogram.img.searched,
        url,
        selectedId,
        settings: { fitzgerald, skin, hair, color },
      },
      settings: { textPosition, borderIn, borderOut },
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
    url,
    borderIn,
    borderOut,
  ]);

  useEffect(() => {
    if (submit) handlerSubmit();
  }, [submit, handlerSubmit]);

  // Restableix tots els settings als valors per defecte globals
  const handleReset = () => {
    setTextPosition(defaultTextPosition);
    setBorderIn(defaultBorderIn);
    setBorderOut(defaultBorderOut);
    setSkin(defaultSkin);
    setHair(defaultHair);
    setColor(defaultColor);
  };

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: "1fr", md: "0.5fr 1.5fr" }}
      gap={{ xs: 3, sm: 2 }}
      sx={{ minHeight: 0 }}
    >
      <Box
        sx={{
          alignSelf: "start",
          justifyItems: "center",
          width: { xs: "100%", md: "auto" },
          position: "sticky",
          top: 0,
          zIndex: 5,
          backgroundColor: "white",
          paddingBlock: { xs: 1 },
        }}
      >
        <PictogramCard
          pictogram={pictogramGuide}
          variant="plane"
          view="complete"
          size={{ scale: 0.8 }}
        />
      </Box>
      <Box paddingBlock={1} sx={{ minHeight: 0 }}>
        <PictogramSearch
          indexPict={pictogram.indexSequence}
          state={search}
          setState={setSearch}
        />
      </Box>

      <Box gridColumn={{ xs: "1", md: "1 / -1" }} sx={{ minHeight: 0 }}>
        <SettingAccordion
          title={`${intl.formatMessage({ ...messages.title })}`}
        >
          <List>
            <li>
              <SettingCadTextFiled
                setting="customText"
                state={text}
                setState={setText}
              />
            </li>

            {search.color && pictogram.settings.textPosition && (
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
              {!search.color && pictogram.settings.textPosition && (
                <li>
                  <SettingCard
                    setting="textPosition"
                    state={textPosition}
                    setState={setTextPosition}
                  />
                </li>
              )}

              {search.color && (
                <>
                  <li>
                    <SettingCardBoolean
                      setting="color"
                      state={color}
                      setState={setColor}
                      applyAll={"none"}
                    />
                  </li>
                  <li>
                    <SettingCardBoolean
                      setting="corss"
                      state={cross}
                      setState={setCross}
                    />
                  </li>
                </>
              )}
            </Stack>
            {search.color && search.skin && (
              <li>
                <SettingCard setting="skin" state={skin} setState={setSkin} />
              </li>
            )}
            {search.color && search.hair && (
              <li>
                <SettingCard setting="hair" state={hair} setState={setHair} />
              </li>
            )}
            <li>
              <SettingCardBorder
                border="borderIn"
                state={borderIn}
                setState={setBorderIn}
              />
            </li>
            <li>
              <SettingCardBorder
                border="borderOut"
                state={borderOut}
                setState={setBorderOut}
              />
            </li>
          </List>
          <Button
            variant="outlined"
            onClick={handleReset}
            startIcon={<MdSettingsBackupRestore />}
            sx={{ mt: 1, ml: "auto", display: "flex" }}
          >
            {intl.formatMessage({ ...messages.reset })}
          </Button>
        </SettingAccordion>
      </Box>
    </Box>
  );
};

export default PictEditForm;
