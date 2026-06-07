import { IconButton, Tooltip } from "@mui/material";
import { AiOutlineSetting } from "react-icons/ai";
import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import messages from "./DefaultSettingsModal.lang";
import DefaultSettingsDialog from "./DefaultSettingsDialog";
import React from "react";

const DefaultSettingsModal = (): React.ReactElement => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  // Ref per restaurar el focus al botó d'obertura quan el modal es tanca
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleClose = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <Tooltip title={intl.formatMessage(messages.settings)}>
        <IconButton
          ref={(el) => { triggerRef.current = el; }}
          color="secondary"
          component="label"
          aria-label={intl.formatMessage(messages.settings)}
          onClick={() => setOpen(true)}
        >
          <AiOutlineSetting />
        </IconButton>
      </Tooltip>
      <DefaultSettingsDialog open={open} onClose={handleClose} />
    </>
  );
};

export default DefaultSettingsModal;
