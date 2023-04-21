import { List, Stack } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import SettingCardOptions from "../SettingCardOptions/SettingCardOptions";
import SettingCardBoolean from "../SettingCardBoolean/SettingCardBoolean";
import SettingCard from "../SettingCard/SettingCard";
import SettingCardNumber from "../SettingCardNumber/SettingCardNumber";
import SettingCardBorder from "../SettingCardBorder/SettingCardBorder";
import { PictSequence } from "../../types/sequence";
import { preloadedState } from "../../utils/test-utils";
import { useIntl } from "react-intl";
import messages from "./DefaultForm.lang";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useCallback, useEffect, useState } from "react";
import { DefaultSettings } from "../../types/ui";
import { updateDefaultSettingsActionCreator } from "../../app/slice/uiSlice";

interface props {
  submit: boolean;
}

const DefaultForm = (props: props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const {
    lang,
    defaultSettings: {
      pictApiAra: { fitzgerald, skin },
      pictSequence: {
        borderIn,
        borderOut,
        fontSize: DSfontSize,
        numbered,
        textPosition,
      },
    },
  } = useAppSelector((state) => state.ui);

  const [fontSize, setFontSize] = useState(DSfontSize);

  const pictogramGuide: PictSequence = {
    ...preloadedState.sequence[0],
    indexSequence: 0,
    img: {
      ...preloadedState.sequence[0].img,
      searched: {
        word: `${intl.formatMessage(messages.pictGuide)}`,
        bestIdPicts: [],
      },
      selectedId: 6009,
      settings: {
        fitzgerald: fitzgerald,
        skin: skin,
      },
    },
    settings: {
      textPosition: textPosition,
      fontSize: fontSize,
      borderIn: borderIn,
      borderOut: borderOut,
      numbered: numbered,
    },
  };

  const handlerSubmit = useCallback(() => {
    const newDefaultSettings: DefaultSettings = {
      pictApiAra: { fitzgerald, skin },
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
    borderIn,
    borderOut,
    fontSize,
    numbered,
    textPosition,
    dispatch,
  ]);

  useEffect(() => {
    !props.submit && handlerSubmit();
  }, [props.submit, handlerSubmit]);

  return (
    <form onSubmit={handlerSubmit}>
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
            <PictogramCard pictogram={pictogramGuide} view="complete" />
          </li>
          <li>
            <SettingCardOptions
              setting="languages"
              selected={lang ? lang : "en"}
            />
          </li>
          <li>
            <SettingCardBoolean setting={"numbered"} selected={numbered} />
          </li>
          <li>
            <SettingCard setting={"textPosition"} selected={textPosition} />
          </li>
          <li>
            <SettingCardNumber
              setting="fontSize"
              selected={DSfontSize}
              state={fontSize}
              setState={setFontSize}
            />
          </li>
          <li>
            <SettingCardBorder border="borderOut" selected={borderOut} />
          </li>
          <li>
            <SettingCardBorder border="borderIn" selected={borderIn} />
          </li>
          <li>
            <SettingCard setting={"skin"} selected={skin} />
          </li>
        </Stack>
      </List>
    </form>
  );
};

export default DefaultForm;
