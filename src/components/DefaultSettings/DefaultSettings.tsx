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
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  updateDefaultSettingPictApiAraActionCreator,
  updateDefaultSettingPictSequenceActionCreator,
} from "../../app/slice/uiSlice";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./DefaultSettings.lang";
import { Container } from "@mui/system";
import { PictApiAraSettings, PictSequenceSettings } from "../../types/sequence";

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
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleUpDatePictApiAra = (toUpdate: PictApiAraSettings) => {
    dispatch(
      updateDefaultSettingPictApiAraActionCreator({ settings: toUpdate })
    );
  };

  const handleUpDatePictSequence = (toUpdate: PictSequenceSettings) => {
    dispatch(
      updateDefaultSettingPictSequenceActionCreator({ settings: toUpdate })
    );
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
                actionSelected={handleUpDatePictSequence}
                selected={defaultSetting.pictSequence.textPosition}
              />
            </ListItem>
            <ListItem>
              <SettingCard
                setting={"skin"}
                actionSelected={handleUpDatePictApiAra}
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