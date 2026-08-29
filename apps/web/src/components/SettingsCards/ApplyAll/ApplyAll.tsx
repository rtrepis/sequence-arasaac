import { SxProps } from "@mui/material";
import StyledButton from "../../../style/StyledButton";
import { FormattedMessage, useIntl } from "react-intl";
import React from "react";
import { useFeedback } from "@/context/FeedbackContext";
import feedbackMessages from "@/context/FeedbackContext/FeedbackContext.lang";
import { useAppSelector } from "@/app/hooks";

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

const ApplyAll = ({ onClick, sx }: ApplyAllProps): React.ReactElement => {
  const intl = useIntl();
  const { showSnackbar } = useFeedback();

  // Obtenim el nombre total de pictogrames de totes les seqüències
  const pictogramCount = useAppSelector((state) =>
    Object.values(state.document.content).reduce(
      (total, sequence) => total + sequence.length,
      0,
    ),
  );

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
    <StyledButton
      variant="outlined"
      sx={[
        { maxWidth: APPLY_ALL_MAX_WIDTH },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      onClick={handleClick}
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
