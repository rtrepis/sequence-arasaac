import { SxProps } from "@mui/material";
import StyledButton from "../../../style/StyledButton";
import { FormattedMessage, useIntl } from "react-intl";
import React from "react";
import { useFeedback } from "@/context/FeedbackContext";
import feedbackMessages from "@/context/FeedbackContext/FeedbackContext.lang";
import { useAppSelector } from "@/app/hooks";

interface ApplyAllProps {
  sx: SxProps;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

const ApplyAll = ({ onClick, sx }: ApplyAllProps): React.ReactElement => {
  const intl = useIntl();
  const { showSnackbar } = useFeedback();

  // Obtenim el nombre de pictogrames de la seqüència activa
  const pictogramCount = useAppSelector((state) => {
    const activeSaac = state.document.activeSAAC;
    return state.document.content[activeSaac].length;
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Executem l'acció original
    onClick?.(event);

    // Mostrem el feedback de confirmació
    showSnackbar({
      message: intl.formatMessage(feedbackMessages.applyAllSuccess, {
        count: pictogramCount,
      }),
      severity: "success",
    });
  };

  return (
    <StyledButton variant="outlined" sx={sx} onClick={handleClick}>
      <FormattedMessage
        id={"components.settingCard.applyAll.label"}
        defaultMessage={"Apply All"}
        description={"apply to all pictograms"}
      />
    </StyledButton>
  );
};
export default ApplyAll;
