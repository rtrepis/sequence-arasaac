import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { AiOutlineClose, AiOutlineSetting } from "react-icons/ai";
import { forwardRef, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./DefaultSettingsModal.lang";
import { Container } from "@mui/system";
import DefaultSettingsPanel from "../../components/DefaultsForm/DefaultSettingsPanel";
import { Stack, Tooltip } from "@mui/material";
import React from "react";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="right" ref={ref} {...props} />;
});

const DefaultSettingsModal = (): React.ReactElement => {
  const intl = useIntl();

  const [open, setOpen] = useState(false);
  // Ref per restaurar el focus al botó d'obertura quan el modal es tanca
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Retorna el focus al botó que va obrir el modal
    triggerRef.current?.focus();
  };

  return (
    <>
      <Tooltip title={intl.formatMessage(messages.settings)}>
        <IconButton
          ref={(el) => { triggerRef.current = el; }}
          color="secondary"
          component="label"
          aria-label={`${intl.formatMessage({ ...messages.settings })}`}
          onClick={handleClickOpen}
        >
          <AiOutlineSetting />
        </IconButton>
      </Tooltip>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        slots={{ transition: Transition }}
      >
        <AppBar
          sx={{ position: { xs: "fixed", md: "relative" } }}
          elevation={1}
        >
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              <FormattedMessage {...messages.settings} />
            </Typography>

            <IconButton
              edge="start"
              color="secondary"
              onClick={handleClose}
              aria-label={intl.formatMessage({ ...messages.close })}
            >
              <AiOutlineClose />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container sx={{ marginTop: 2 }}>
          <Stack sx={{ height: 40, display: { md: "none" } }} />
          <DefaultSettingsPanel submit={open} />
        </Container>
      </Dialog>
    </>
  );
};

export default DefaultSettingsModal;
