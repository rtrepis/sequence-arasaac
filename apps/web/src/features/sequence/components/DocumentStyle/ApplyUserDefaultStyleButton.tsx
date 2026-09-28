import React from "react";
import { Tooltip } from "@mui/material";
import { MdSettingsBackupRestore } from "react-icons/md";
import { useIntl } from "react-intl";
import StyledButton from "@/style/StyledButton";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { changeDocumentStyleThunk } from "@features/sequence/store/styleSlice";
import { selectUserDefaultStyle } from "@features/sequence/style/styleSelectors";
import messages from "./DocumentStyle.lang";

/**
 * «Aplica el meu estil per defecte» a la columna de la vista. És el successor de
 * «Restaura les seqüències»: fa el mateix —tornar al que l'usuari té desat—,
 * però amb tot l'estil del document i amb desfer. La mateixa acció és també la
 * primera de la capçalera del panell «Estil del document».
 */
const ApplyUserDefaultStyleButton = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const userDefault = useAppSelector(selectUserDefaultStyle);

  return (
    <Tooltip
      title={intl.formatMessage(messages.applyUserDefaultTooltip)}
      describeChild
    >
      {/* `inherit` i no el primary: el verd de la casa sobre el paper es queda
          a 2,1:1 i no es llegeix (F11) */}
      <StyledButton
        color="inherit"
        endIcon={<MdSettingsBackupRestore aria-hidden />}
        onClick={() =>
          dispatch(changeDocumentStyleThunk(userDefault, "userDefault"))
        }
        sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
      >
        {intl.formatMessage(messages.applyUserDefault)}
      </StyledButton>
    </Tooltip>
  );
};

export default ApplyUserDefaultStyleButton;
