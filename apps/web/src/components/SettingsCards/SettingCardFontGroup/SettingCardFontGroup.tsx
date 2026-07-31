import { Font } from "../../../types/sequence";
import SettingCardNumber from "../SettingCardNumber/SettingCardNumber";
import SettingCardFont from "../SettingCardOptions/font/SettingCardFont";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import SectionTitle from "../../SettingsLayout/SectionTitle";
import SettingRow from "../../SettingsLayout/SettingRow";
import { messages } from "./SettingCardFontGroup.lang";
import InputColor from "../InputColor/InputColor";
import React from "react";

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
  const [family, setFamily] = useState(state.family);
  const [size, setSize] = useState(state.size);
  const [color, setColor] = useState(state.color);

  useEffect(() => {
    setState({ color: color, family: family, size: size });
  }, [color, family, setState, size]);

  return (
    <SectionTitle title={title ?? <FormattedMessage {...messages.font} />}>
      <SettingCardFont
        setting="fontFamily"
        state={family}
        setState={setFamily}
      />

      <SettingCardNumber setting="fontSize" state={size} setState={setSize} />

      <SettingRow title={<FormattedMessage {...messages.color} />} control="compact">
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
