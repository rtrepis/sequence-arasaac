import { SxProps } from "@mui/material";
import StyledButton from "../../../style/StyledButton";
import { FormattedMessage } from "react-intl";
import React from "react";

/**
 * Límit d'amplada d'aquest botó, que abans vivia dins de `StyledButton`. Hi és
 * perquè «Aplica a tots» comparteix fila amb el títol de secció i no se l'ha de
 * menjar; els botons dels peus de diàleg, en canvi, han de poder ser llargs.
 */
const APPLY_ALL_MAX_WIDTH = 130;

interface ApplyAllProps {
  sx: SxProps;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

// El missatge el dona qui aplica el canvi: el snackbar amb «Desfés» de l'estil
// del document (`applyToAllPictogramsThunk`)
const ApplyAll = ({ onClick, sx }: ApplyAllProps): React.ReactElement => {
  return (
    <StyledButton
      variant="outlined"
      // `inherit` i no el primary: un `outlined` verd sobre el paper de
      // configuració es queda a 2,1:1 i no es llegeix en tema clar (F11)
      color="inherit"
      sx={[
        { maxWidth: APPLY_ALL_MAX_WIDTH },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      onClick={onClick}
    >
      <FormattedMessage
        id={"components.settingCard.applyAll.label"}
        defaultMessage={"Apply All"}
        description={"apply to all pictograms"}
      />
    </StyledButton>
  );
};
export default ApplyAll;
