import React from "react";
import { Tooltip } from "@mui/material";
import { MdOutlinePalette } from "react-icons/md";
import { useIntl } from "react-intl";
import StyledButton from "@/style/StyledButton";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import { useAppDispatch } from "@/app/hooks";
import { changeStyleOpenedActionCreator } from "@features/sequence/store/styleSlice";
import messages from "./ChangeStyle.lang";

/**
 * Obre «Canvia l'estil». El diàleg és un de sol per a tota l'app i viu al
 * costat del menú lateral, que és a totes les pàgines.
 */
const ChangeStyleButton = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  return (
    <Tooltip
      title={intl.formatMessage(messages.changeStyleTooltip)}
      describeChild
    >
      {/* `inherit` i no el primary: el verd de la casa sobre el paper es queda
          a 2,1:1 i no es llegeix (F11) */}
      <StyledButton
        color="inherit"
        endIcon={<MdOutlinePalette aria-hidden />}
        onClick={() => dispatch(changeStyleOpenedActionCreator())}
        sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
      >
        {intl.formatMessage(messages.changeStyle)}
      </StyledButton>
    </Tooltip>
  );
};

export default ChangeStyleButton;
