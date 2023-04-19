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
import { DefaultSettings } from "../../types/ui";
import { useAppSelector } from "../../app/hooks";
import { useState } from "react";

const DefaultForm = (): JSX.Element => {
  const intl = useIntl();
  const {
    lang,
    defaultSettings: {
      pictApiAra: { fitzgerald, skin },
      pictSequence: { borderIn, borderOut, fontSize, numbered, textPosition },
    },
  } = useAppSelector((state) => state.ui);

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

  return (
    <form>
      <Stack
        display={"flex"}
        direction={"row"}
        flexWrap={"wrap"}
        marginTop={1}
        rowGap={2}
        columnGap={2}
      >
        <List>
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
            <SettingCardNumber setting="fontSize" selected={fontSize} />
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
        </List>
      </Stack>
    </form>
  );
};

export default DefaultForm;
