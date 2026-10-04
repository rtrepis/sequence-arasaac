import { Switch } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { messages } from "./SettingCardBoolean.lang";
import SettingRow from "../../SettingsLayout/SettingRow";
import React, { useId } from "react";

interface SettingCardProps {
  setting: "numbered" | "corss" | "color";
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingCardBoolean = ({
  setting,
  state,
  setState,
}: SettingCardProps): React.ReactElement => {
  // Hi pot haver dues instàncies del mateix ajust alhora (formulari del
  // pictograma i estil del document): l'id ha de ser únic a la pàgina
  const labelId = useId();

  const handleSelected = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setState(checked);
  };

  return (
    <SettingRow
      title={<FormattedMessage {...messages[setting]} />}
      labelId={labelId}
      control="compact"
    >
      {/* El nom va a l'`input`, que és qui porta el rol: posat al `Switch`,
          MUI el deixa al `span` de fora i el lector de pantalla no el llegeix */}
      <Switch
        inputProps={{ "aria-labelledby": labelId }}
        checked={state}
        onChange={handleSelected}
      />
    </SettingRow>
  );
};

export default SettingCardBoolean;
