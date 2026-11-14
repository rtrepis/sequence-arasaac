import React from "react";
import { Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppSelector } from "@/app/hooks";
import { SettingRow } from "@/components/SettingsLayout";
import {
  namedStyleOf,
  styleUseCount,
} from "@features/free-layout/model/blockStyle";
import {
  selectNamedStyles,
  selectPages,
} from "@features/free-layout/store/freeLayoutThunks";
import messages from "./ViewLevels.lang";

interface BlockStyleRowProps {
  /** L'estil de bloc que fa servir el bloc (`styleId`), si en fa servir cap */
  styleId: string | undefined;
  /** Prefix dels ids, per lligar el títol amb el valor */
  labelId: string;
}

/**
 * La fila «Estil de bloc» del nivell «Bloc» (R7): quin estil de bloc fa servir
 * el bloc i quants blocs el comparteixen, o que fa servir l'estil del
 * document. Només ho diu: les accions (aplicar, actualitzar i treure) són al
 * menú «⋯» del bloc, al full, com totes les del bloc.
 */
const BlockStyleRow = ({
  styleId,
  labelId,
}: BlockStyleRowProps): React.ReactElement => {
  const intl = useIntl();
  const pages = useAppSelector(selectPages);
  const styles = useAppSelector(selectNamedStyles);
  const named = namedStyleOf(styles, styleId);
  const count = named ? styleUseCount(pages, named.id) : 0;

  return (
    <SettingRow
      title={<FormattedMessage {...messages.blockStyle} />}
      labelId={`${labelId}-block-style`}
      helperId={`${labelId}-block-style-helper`}
      helper={
        named ? (
          <FormattedMessage {...messages.blockStyleShared} values={{ count }} />
        ) : (
          <FormattedMessage {...messages.blockStyleNoneHelp} />
        )
      }
      control="wide"
    >
      <Typography variant="body2">
        {named ? named.name : intl.formatMessage(messages.blockStyleNone)}
      </Typography>
    </SettingRow>
  );
};

export default BlockStyleRow;
