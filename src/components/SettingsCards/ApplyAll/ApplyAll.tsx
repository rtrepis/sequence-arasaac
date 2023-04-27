import { SxProps } from "@mui/material";
import StyledButton from "../../../style/StyledButton";
import { FormattedMessage } from "react-intl";

interface ApplyAllProps {
  sx: SxProps;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

const ApplyAll = ({ onClick, sx }: ApplyAllProps): JSX.Element => {
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
