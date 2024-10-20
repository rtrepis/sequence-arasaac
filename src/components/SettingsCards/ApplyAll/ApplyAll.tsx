import { SxProps } from "@mui/material";
import StyledButton from "../../../style/StyledButton";
import { FormattedMessage } from "react-intl";
import React from "react";

interface ApplyAllProps {
  sx: SxProps;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

const ApplyAll = ({ onClick, sx }: ApplyAllProps): React.ReactElement => {
  return (
    <StyledButton variant="outlined" sx={sx} onClick={onClick}>
      <FormattedMessage
        id={"components.settingCard.applyAll.label"}
        defaultMessage={"Apply All"}
        description={"apply to all pictograms"}
      />
    </StyledButton>
  );
};
export default ApplyAll;
