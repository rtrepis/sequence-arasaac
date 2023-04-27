import { List, Stack } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import SettingCardOptions from "../SettingsCards/SettingCardOptions/SettingCardOptions";
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

interface props {
  submit: boolean;
}

const DefaultForm = ({ submit }: props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const {
    lang,
    defaultSettings: {
      pictApiAra: { fitzgerald, skin: initialSkin, hair: initialHair },
      pictSequence: {
        borderIn: initialBorderIn,
        borderOut: initialBorderOut,
        fontSize: initialFontSize,
        numbered,
        textPosition: initialTextPosition,
      },
    },
  } = useAppSelector((state) => state.ui);

  const [fontSize, setFontSize] = useState(initialFontSize);
  const [textPosition, setTextPosition] = useState(initialTextPosition);
  const [skin, setSkin] = useState(initialSkin);
  const [borderIn, setBorderIn] = useState(initialBorderIn);
  const [borderOut, setBorderOut] = useState(initialBorderOut);
  const [hair, setHair] = useState(initialHair);

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
      },
    },
    settings: {
      textPosition: textPosition,
      fontSize: fontSize,
      borderIn: borderIn,
      borderOut: borderOut,
    },
  };

  const handlerSubmit = useCallback(() => {
    const newDefaultSettings: DefaultSettings = {
      pictApiAra: { fitzgerald, skin, hair },
      pictSequence: {
        borderIn,
        borderOut,
        fontSize,
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
    numbered,
    textPosition,
    dispatch,
  ]);

  useEffect(() => {
    !submit && handlerSubmit();
  }, [submit, handlerSubmit, borderIn]);

  return (
    <form onSubmit={handlerSubmit}>
      <Stack
        display={"flex"}
        direction={"row"}
        marginTop={1}
        rowGap={2}
        columnGap={2}
      >
        <Stack>
          <PictogramCard
            pictogram={pictogramGuide}
            view="complete"
            variant="plane"
          />
        </Stack>
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
              <SettingCardOptions
                setting="languages"
                selected={lang ? lang : "en"}
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
                <SettingCardBoolean setting={"numbered"} selected={numbered} />
              </li>
              <li>
                <SettingCard
                  setting={"textPosition"}
                  state={textPosition}
                  setState={setTextPosition}
                />
              </li>
              <li>
                <SettingCardNumber
                  setting="fontSize"
                  state={fontSize}
                  setState={setFontSize}
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
            >
              <li>
                <SettingCard setting={"skin"} state={skin} setState={setSkin} />
              </li>
              <li>
                <SettingCard setting={"hair"} state={hair} setState={setHair} />
              </li>
            </Stack>
          </Stack>
        </List>
      </Stack>
    </form>
  );
};

export default DefaultForm;
