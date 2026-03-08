import { Box, List, Stack } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import SettingCardLang from "../SettingsCards/SettingCardOptions/lang/SettingCardLang";
import SettingCardBoolean from "../SettingsCards/SettingCardBoolean/SettingCardBoolean";
import SettingCard from "../SettingsCards/SettingCard/SettingCard";
import SettingCardBorder from "../SettingsCards/SettingCardBorder/SettingCardBorder";
import {
  Border,
  Font,
  Hair,
  PictogramCardDefaults,
  PictSequence,
  Skin,
  TextPosition,
} from "../../types/sequence";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./DefaultForm.lang";
import SettingCardFontGroup from "../SettingsCards/SettingCardFontGroup/SettingCardFontGroup";
import { messages as fontGroupMessages } from "../SettingsCards/SettingCardFontGroup/SettingCardFontGroup.lang";
import React, { Dispatch, SetStateAction } from "react";

interface DefaultFormProps {
  font: Font;
  setFont: Dispatch<SetStateAction<Font>>;
  numberFont: Font;
  setNumberFont: Dispatch<SetStateAction<Font>>;
  textPosition: TextPosition;
  setTextPosition: Dispatch<SetStateAction<TextPosition>>;
  skin: Skin;
  setSkin: Dispatch<SetStateAction<Skin>>;
  borderIn: Border;
  setBorderIn: Dispatch<SetStateAction<Border>>;
  borderOut: Border;
  setBorderOut: Dispatch<SetStateAction<Border>>;
  hair: Hair;
  setHair: Dispatch<SetStateAction<Hair>>;
  color: boolean;
  setColor: Dispatch<SetStateAction<boolean>>;
  numbered: boolean;
  setNumbered: Dispatch<SetStateAction<boolean>>;
  onApplyAllColor: () => void;
  onApplyAllTextPosition: () => void;
  onApplyAllSkin: () => void;
  onApplyAllHair: () => void;
  onApplyAllBorderIn: () => void;
  onApplyAllBorderOut: () => void;
  onSubmit: () => void;
}

/**
 * Component de presentació pur: renderitza el formulari de configuració per defecte.
 * Sense accés a Redux ni a persistència — tota la lògica és al DefaultSettingsPanel.
 */
const DefaultForm = ({
  font,
  setFont,
  numberFont,
  setNumberFont,
  textPosition,
  setTextPosition,
  skin,
  setSkin,
  borderIn,
  setBorderIn,
  borderOut,
  setBorderOut,
  hair,
  setHair,
  color,
  setColor,
  numbered,
  setNumbered,
  onApplyAllColor,
  onApplyAllTextPosition,
  onApplyAllSkin,
  onApplyAllHair,
  onApplyAllBorderIn,
  onApplyAllBorderOut,
  onSubmit,
}: DefaultFormProps) => {
  const intl = useIntl();

  const defaults: PictogramCardDefaults = {
    numbered,
    font,
    numberFont,
    borderIn,
    borderOut,
  };

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

  return (
    <form onSubmit={onSubmit}>
      <Stack
        display={"flex"}
        direction={{ xs: "column", md: "row" }}
        marginTop={1}
        rowGap={2}
        columnGap={2}
        sx={{ alignItems: "flex-start" }}
      >
        <Box
          minWidth={200}
          sx={{
            position: { xs: "sticky", md: "static" },
            top: { xs: 0, md: "auto" },
            zIndex: { xs: 10, md: "auto" },
            width: { xs: "100%", md: "auto" },
          }}
        >
          <PictogramCard
            pictogram={pictogramGuide}
            defaults={defaults}
            view="complete"
            variant="plane"
          />
        </Box>

        <List
          sx={{
            width: { xs: "100%", md: "auto" },
            overflowY: { xs: "auto", md: "visible" },
            maxHeight: { xs: "60vh", md: "none" },
            pr: 1,
          }}
        >
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
              <SettingCardBoolean
                setting={"numbered"}
                state={numbered}
                setState={setNumbered}
              />
            </li>
            <li>
              <SettingCardBoolean
                setting="color"
                state={color}
                setState={setColor}
                onApplyAll={onApplyAllColor}
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
                  onApplyAll={onApplyAllTextPosition}
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
                  title={<FormattedMessage {...fontGroupMessages.numberFont} />}
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
                  onApplyAll={onApplyAllBorderOut}
                />
              </li>
              <li>
                <SettingCardBorder
                  border="borderIn"
                  state={borderIn}
                  setState={setBorderIn}
                  onApplyAll={onApplyAllBorderIn}
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
                    onApplyAll={onApplyAllSkin}
                  />
                </li>
                <li>
                  <SettingCard
                    setting={"hair"}
                    state={hair}
                    setState={setHair}
                    onApplyAll={onApplyAllHair}
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
