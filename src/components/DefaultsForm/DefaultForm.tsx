import { Box, List, Stack } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import SettingCardLang from "../SettingsCards/SettingCardOptions/lang/SettingCardLang";
import SettingCardBoolean from "../SettingsCards/SettingCardBoolean/SettingCardBoolean";
import SettingCard from "../SettingsCards/SettingCard/SettingCard";
import SettingCardBorder from "../SettingsCards/SettingCardBorder/SettingCardBorder";
import { PictSequence } from "../../types/sequence";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./DefaultForm.lang";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useCallback, useEffect, useState } from "react";
import { DefaultSettings } from "../../types/ui";
import { updateDefaultSettingsActionCreator } from "../../app/slice/uiSlice";
import SettingCardFontGroup from "../SettingsCards/SettingCardFontGroup/SettingCardFontGroup";
import { messages as fontGroupMessages } from "../SettingsCards/SettingCardFontGroup/SettingCardFontGroup.lang";
import React from "react";

interface DefaultFormProps {
  submit: boolean | "save";
}

const DefaultForm = ({ submit }: DefaultFormProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const {
    defaultSettings: {
      pictApiAra: {
        fitzgerald,
        skin: initialSkin,
        hair: initialHair,
        color: initialColor,
      },
      pictSequence: {
        borderIn: initialBorderIn,
        borderOut: initialBorderOut,
        font: initialFont,
        numberFont: initialNumberFont,
        numbered,
        textPosition: initialTextPosition,
      },
    },
  } = useAppSelector((state) => state.ui);

  const [font, setFont] = useState(initialFont);
  // Si no hi ha numberFont guardat (dades antigues), usa el font del text com a base
  const [numberFont, setNumberFont] = useState(initialNumberFont ?? initialFont);
  const [textPosition, setTextPosition] = useState(initialTextPosition);
  const [skin, setSkin] = useState(initialSkin);
  const [borderIn, setBorderIn] = useState(initialBorderIn);
  const [borderOut, setBorderOut] = useState(initialBorderOut);
  const [hair, setHair] = useState(initialHair);
  const [color, setColor] = useState(initialColor);

  const pictogramGuide: PictSequence = {
    indexSequence: 0,
    img: {
      searched: {
        word: `${intl.formatMessage(messages.pictGuide)}`,
        bestIdPicts: [],
      },
      selectedId: 6009,
      settings: {
        fitzgerald: "#CC00BB",
        skin: skin,
        hair: hair,
        color: color,
      },
    },
    settings: {
      textPosition: textPosition,
      font: font,
      numberFont: numberFont,
      borderIn: borderIn,
      borderOut: borderOut,
    },
    cross: false,
  };

  const handlerSubmit = useCallback(() => {
    const newDefaultSettings: DefaultSettings = {
      pictApiAra: { fitzgerald, skin, hair, color },
      pictSequence: {
        borderIn,
        borderOut,
        font,
        numberFont,
        numbered,
        textPosition,
      },
    };

    dispatch(updateDefaultSettingsActionCreator(newDefaultSettings));

    sessionStorage.setItem(
      "pictDefaultSettings",
      JSON.stringify(newDefaultSettings),
    );
    localStorage.setItem(
      "pictDefaultSettings",
      JSON.stringify(newDefaultSettings),
    );
  }, [
    fitzgerald,
    skin,
    hair,
    borderIn,
    borderOut,
    numbered,
    numberFont,
    textPosition,
    dispatch,
    color,
    font,
  ]);

  useEffect(() => {
    if (!submit) handlerSubmit();
    if (submit === "save") handlerSubmit();
  }, [submit, handlerSubmit]);

  return (
    <form onSubmit={handlerSubmit}>
      <Stack
        display={"flex"}
        direction={{ xs: "column", md: "row" }}
        marginTop={1}
        rowGap={2}
        columnGap={2}
      >
        <Box minWidth={200}>
          <PictogramCard
            pictogram={pictogramGuide}
            view="complete"
            variant="plane"
          />
        </Box>

        <List>
          <Stack
            display={"flex"}
            direction={"row"}
            flexWrap={"wrap"}
            marginTop={1}
            rowGap={2}
            columnGap={2}
          >
            <li>
              <SettingCardLang setting="languagesApp" />
            </li>
            <li>
              <SettingCardLang setting="languagesSearch" />
            </li>
            <li>
              <SettingCardBoolean setting={"numbered"} state={numbered} />
            </li>
            <li>
              <SettingCardBoolean
                setting="color"
                state={color}
                setState={setColor}
              />
            </li>
            <Stack
              display={"flex"}
              direction={"row"}
              flexWrap={"wrap"}
              marginTop={1}
              rowGap={2}
              columnGap={2}
            >
              <li>
                <SettingCard
                  setting={"textPosition"}
                  state={textPosition}
                  setState={setTextPosition}
                  applyAll
                />
              </li>
            </Stack>
            <li>
              <SettingCardFontGroup state={font} setState={setFont} />
            </li>
            {numbered && (
              <li>
                <SettingCardFontGroup
                  state={numberFont}
                  setState={setNumberFont}
                  title={
                    <FormattedMessage {...fontGroupMessages.numberFont} />
                  }
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
                <SettingCardBorder
                  border="borderOut"
                  state={borderOut}
                  setState={setBorderOut}
                  applyAll
                />
              </li>
              <li>
                <SettingCardBorder
                  border="borderIn"
                  state={borderIn}
                  setState={setBorderIn}
                  applyAll
                />
              </li>
            </Stack>

            <Stack
              display={"flex"}
              direction={"row"}
              flexWrap={"wrap"}
              marginTop={1}
              rowGap={2}
              columnGap={2}
            ></Stack>

            {color && (
              <Stack
                display={"flex"}
                direction={"row"}
                flexWrap={"wrap"}
                marginTop={1}
                rowGap={2}
                columnGap={2}
              >
                <li>
                  <SettingCard
                    setting={"skin"}
                    state={skin}
                    setState={setSkin}
                    applyAll
                  />
                </li>
                <li>
                  <SettingCard
                    setting={"hair"}
                    state={hair}
                    setState={setHair}
                    applyAll
                  />
                </li>
              </Stack>
            )}
          </Stack>
        </List>
      </Stack>
    </form>
  );
};

export default DefaultForm;
