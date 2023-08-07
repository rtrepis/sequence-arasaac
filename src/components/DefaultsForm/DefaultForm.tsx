import { Box, List, Stack } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import SettingCardLang from "../SettingsCards/SettingCardOptions/lang/SettingCardLang";
import SettingCardBoolean from "../SettingsCards/SettingCardBoolean/SettingCardBoolean";
import SettingCard from "../SettingsCards/SettingCard/SettingCard";
import SettingCardNumber from "../SettingsCards/SettingCardNumber/SettingCardNumber";
import SettingCardBorder from "../SettingsCards/SettingCardBorder/SettingCardBorder";
import { PictSequence } from "../../types/sequence";
import { useIntl } from "react-intl";
import messages from "./DefaultForm.lang";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useCallback, useEffect, useState } from "react";
import { DefaultSettings } from "../../types/ui";
import { updateDefaultSettingsActionCreator } from "../../app/slice/uiSlice";
import SettingCardFont from "../SettingsCards/SettingCardOptions/font/SettingCardFont";

interface DefaultFormProps {
  submit: boolean;
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
        fontSize: initialFontSize,
        fontFamily: initialFontFamily,
        numbered,
        textPosition: initialTextPosition,
      },
    },
  } = useAppSelector((state) => state.ui);

  const [fontSize, setFontSize] = useState(initialFontSize);
  const [fontFamily, setFontFamily] = useState(initialFontFamily);
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
      fontSize: fontSize,
      borderIn: borderIn,
      borderOut: borderOut,
      fontFamily: fontFamily,
    },
    cross: false,
  };

  const handlerSubmit = useCallback(() => {
    const newDefaultSettings: DefaultSettings = {
      pictApiAra: { fitzgerald, skin, hair, color },
      pictSequence: {
        borderIn,
        borderOut,
        fontSize,
        fontFamily,
        numbered,
        textPosition,
      },
    };

    dispatch(updateDefaultSettingsActionCreator(newDefaultSettings));
  }, [
    fitzgerald,
    skin,
    hair,
    borderIn,
    borderOut,
    fontSize,
    fontFamily,
    numbered,
    textPosition,
    dispatch,
    color,
  ]);

  useEffect(() => {
    !submit && handlerSubmit();
  }, [submit, handlerSubmit, borderIn]);

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
              <SettingCardLang setting="languages" />
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
            >
              <li>
                <SettingCardNumber
                  setting="fontSize"
                  state={fontSize}
                  setState={setFontSize}
                />
              </li>
              <li>
                <SettingCardFont
                  setting="fontFamily"
                  state={fontFamily}
                  setState={setFontFamily}
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
            >
              <li>
                <SettingCardBorder
                  border="borderOut"
                  state={borderOut}
                  setState={setBorderOut}
                />
              </li>
              <li>
                <SettingCardBorder
                  border="borderIn"
                  state={borderIn}
                  setState={setBorderIn}
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
                  />
                </li>
                <li>
                  <SettingCard
                    setting={"hair"}
                    state={hair}
                    setState={setHair}
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
