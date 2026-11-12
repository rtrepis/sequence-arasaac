import { Font } from "../../../types/sequence";
import SettingCardNumber from "../SettingCardNumber/SettingCardNumber";
import SettingCardFont from "../SettingCardOptions/font/SettingCardFont";
import { FormattedMessage } from "react-intl";
import SectionTitle from "../../SettingsLayout/SectionTitle";
import SettingRow from "../../SettingsLayout/SettingRow";
import { messages } from "./SettingCardFontGroup.lang";
import InputColor from "../InputColor/InputColor";
import React, { Dispatch, SetStateAction } from "react";

interface SettingCardFontGroupProps {
  state: Font;
  setState: React.Dispatch<React.SetStateAction<Font>>;
  title?: React.ReactNode;
}

/**
 * Secció autotitulada d'una tipografia: família, mida i color com a files
 * independents. Igual que `SettingCardBorder`, es titula ella mateixa.
 */
const SettingCardFontGroup = ({
  state,
  setState,
  title,
}: SettingCardFontGroupProps): React.ReactElement => {
  // Controlat del tot: abans en guardava una còpia pròpia i, si la lletra
  // canviava des de fora (carregar un estil d'un fitxer), els controls
  // continuaven ensenyant la d'abans
  const { family, size, color } = state;
  // Cada control canvia només el seu camp, sobre la lletra d'aquell moment
  const fieldSetter =
    <K extends keyof Font>(field: K): Dispatch<SetStateAction<Font[K]>> =>
    (value) =>
      setState((previous) => ({
        ...previous,
        [field]:
          typeof value === "function"
            ? (value as (current: Font[K]) => Font[K])(previous[field])
            : value,
      }));
  const setFamily = fieldSetter("family");
  const setSize = fieldSetter("size");
  const setColor = fieldSetter("color");

  return (
    <SectionTitle title={title ?? <FormattedMessage {...messages.font} />}>
      <SettingCardFont
        setting="fontFamily"
        state={family}
        setState={setFamily}
      />

      <SettingCardNumber setting="fontSize" state={size} setState={setSize} />

      <SettingRow
        title={<FormattedMessage {...messages.color} />}
        control="compact"
      >
        <InputColor
          inputBorder={4}
          inputSize={45}
          color={color}
          setColor={setColor}
        />
      </SettingRow>
    </SectionTitle>
  );
};

export default SettingCardFontGroup;
