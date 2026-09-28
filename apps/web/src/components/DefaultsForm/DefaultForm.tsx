import { Box, Button, Tooltip } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
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
import { MdSettingsBackupRestore } from "react-icons/md";
import {
  SettingsPanelLayout,
  SettingsPreviewFrame,
  SectionTitle,
  SettingsPanelHint,
  ScaleToFit,
  SETTINGS_PREVIEW_FIT_MAX_HEIGHT,
} from "../SettingsLayout";

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
  onApplyAllAppearance: () => void;
  onApplyAllBorderIn: () => void;
  onApplyAllBorderOut: () => void;
  onSubmit: () => void;
  onReset?: () => void;
  /**
   * Capçalera del panell (títol, ajuda i accions), al lloc de la guia del tab.
   * Sense, es pinta la guia de sempre.
   */
  header?: React.ReactNode;
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
  onApplyAllAppearance,
  onApplyAllBorderIn,
  onApplyAllBorderOut,
  onSubmit,
  onReset,
  header,
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
      <SettingsPanelLayout
        preview={
          // Excepció del patró de zones: mostra d'un sol Card sobre el panell.
          // El card ja és paper blanc; el fons "paper" li fa de passe-partout
          // perquè no es fongui amb el marc
          // A tota l'amplada de la columna, i la mostra escalada a dins: amb
          // vores amples o lletra gran, el pictograma sobresortia del marc
          <SettingsPreviewFrame
            background="paper"
            sx={{ padding: 1, width: "100%" }}
          >
            <ScaleToFit maxHeight={SETTINGS_PREVIEW_FIT_MAX_HEIGHT}>
              <PictogramCard
                pictogram={pictogramGuide}
                defaults={defaults}
                view="complete"
                variant="plane"
              />
            </ScaleToFit>
          </SettingsPreviewFrame>
        }
        hint={
          // Guia del tab: què s'ajusta aquí
          header ?? (
            <SettingsPanelHint>
              <FormattedMessage {...messages.panelHint} />
            </SettingsPanelHint>
          )
        }
      >
        <SectionTitle
          title={<FormattedMessage {...messages.sectionPictogram} />}
          onApplyAll={onApplyAllColor}
        >
          <SettingCardBoolean
            setting={"numbered"}
            state={numbered}
            setState={setNumbered}
          />
          <SettingCardBoolean
            setting="color"
            state={color}
            setState={setColor}
          />
        </SectionTitle>

        <SectionTitle
          title={<FormattedMessage {...messages.sectionText} />}
          onApplyAll={onApplyAllTextPosition}
        >
          <SettingCard
            setting={"textPosition"}
            state={textPosition}
            setState={setTextPosition}
          />
        </SectionTitle>

        {/* Les tipografies i les vores es titulen elles mateixes com a secció */}
        <SettingCardFontGroup state={font} setState={setFont} />
        {numbered && (
          <SettingCardFontGroup
            state={numberFont}
            setState={setNumberFont}
            title={<FormattedMessage {...fontGroupMessages.numberFont} />}
          />
        )}

        <SettingCardBorder
          border="borderOut"
          state={borderOut}
          setState={setBorderOut}
          onApplyAll={onApplyAllBorderOut}
        />
        <SettingCardBorder
          border="borderIn"
          state={borderIn}
          setState={setBorderIn}
          onApplyAll={onApplyAllBorderIn}
        />

        {color && (
          <SectionTitle
            title={<FormattedMessage {...messages.sectionAppearance} />}
            onApplyAll={onApplyAllAppearance}
          >
            <SettingCard setting={"skin"} state={skin} setState={setSkin} />
            <SettingCard setting={"hair"} state={hair} setState={setHair} />
          </SectionTitle>
        )}

        {onReset && (
          <Box sx={{ pt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Tooltip
              title={intl.formatMessage(messages.tooltipReset)}
              describeChild
            >
              <Button
                variant="text"
                color="inherit"
                endIcon={<MdSettingsBackupRestore />}
                onClick={onReset}
              >
                <FormattedMessage {...messages.reset} />
              </Button>
            </Tooltip>
          </Box>
        )}
      </SettingsPanelLayout>
    </form>
  );
};

export default DefaultForm;
