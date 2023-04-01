import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { AiOutlineClose, AiOutlineSetting } from "react-icons/ai";
import { forwardRef, useState } from "react";
import { Divider, List, ListItem } from "@mui/material";
import SettingCard from "../SettingCard/SettingCard";
import { useAppSelector } from "../../app/hooks";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./DefaultSettings.lang";
import { Container } from "@mui/system";
import SettingCardBorder from "../SettingCardBorder/SettingCardBorder";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const DefaultSettings = (): JSX.Element => {
  const defaultSetting = useAppSelector((state) => state.ui.defaultSettings);
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        aria-label={`${intl.formatMessage({ ...messages.settings })}`}
        variant="text"
        color="secondary"
        size="large"
        onClick={handleClickOpen}
        sx={{ fontSize: "1.75rem" }}
      >
        <AiOutlineSetting />
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
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
        <Container>
          <List>
            <ListItem>
              <SettingCard
                setting={"textPosition"}
                selected={defaultSetting.pictSequence.textPosition}
              />
            </ListItem>
            <ListItem>
              <SettingCardBorder
                border="borderOut"
                selected={defaultSetting.pictSequence.borderOut!}
              />
            </ListItem>
            <ListItem>
              <SettingCardBorder
                border="borderIn"
                selected={defaultSetting.pictSequence.borderIn!}
              />
            </ListItem>
            <ListItem>
              <SettingCard
                setting={"skin"}
                selected={defaultSetting.pictApiAra.skin!}
              />
            </ListItem>
            <Divider />
          </List>
        </Container>
      </Dialog>
    </>
  );
};

export default DefaultSettings;
