// L'interruptor de la pantalla d'edició, a l'escriptori (pla dels estils, pas
// 10; D26 i Q4): passa a la nova o torna a la d'abans. La tria la recorda
// `useEditLayout`; aquí només hi ha el botó.
import React from "react";
import { useIntl } from "react-intl";
import { MdOutlineFiberNew, MdUndo } from "react-icons/md";
import StyledButton from "@/style/StyledButton";
import type { EditLayout } from "@features/sequence/hooks/useEditLayout";
import messages from "./EditLayoutSwitch.lang";

interface EditLayoutSwitchProps {
  /** La pantalla que es veu ara */
  current: EditLayout;
  onChoose: (layout: EditLayout) => void;
}

const EditLayoutSwitch = ({
  current,
  onChoose,
}: EditLayoutSwitchProps): React.ReactElement => {
  const intl = useIntl();
  const isNew = current === "new";
  return (
    <StyledButton
      variant="outlined"
      color="inherit"
      startIcon={
        isNew ? <MdUndo aria-hidden /> : <MdOutlineFiberNew aria-hidden />
      }
      onClick={() => onChoose(isNew ? "classic" : "new")}
    >
      {intl.formatMessage(isNew ? messages.backToClassic : messages.tryNew)}
    </StyledButton>
  );
};

export default EditLayoutSwitch;
