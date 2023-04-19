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
import { Stack } from "@mui/material";
import SettingCard from "../../components/SettingCard/SettingCard";
import { useAppSelector } from "../../app/hooks";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./DefaultSettings.lang";
import { Container } from "@mui/system";
import SettingCardBorder from "../../components/SettingCardBorder/SettingCardBorder";
import SettingCardBoolean from "../../components/SettingCardBoolean/SettingCardBoolean";
import SettingCardOptions from "../../components/SettingCardOptions/SettingCardOptions";
import SettingCardNumber from "../../components/SettingCardNumber/SettingCardNumber";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import { PictSequence } from "../../types/sequence";
import { preloadedState } from "../../utils/test-utils";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const DefaultSettings = (): JSX.Element => {
  const {
    defaultSettings: { pictApiAra, pictSequence },
    lang,
  } = useAppSelector((state) => state.ui);
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const pictogramGuide: PictSequence = {
    ...preloadedState.sequence[0],
    indexSequence: 1,
    img: {
      ...preloadedState.sequence[0].img,
      searched: {
        word: `${intl.formatMessage(messages.pictGuide)}`,
        bestIdPicts: [],
      },
      selectedId: 6009,
      settings: { fitzgerald: pictApiAra.fitzgerald, skin: pictApiAra.skin },
    },
    settings: {
      textPosition: pictSequence.textPosition,
      fontSize: pictSequence.fontSize,
      borderIn: pictSequence.borderIn,
      borderOut: pictSequence.borderOut,
    },
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
        <Container maxWidth={"xl"}>
          <Stack
            display={"flex"}
            direction={"row"}
            flexWrap={"wrap"}
            marginTop={1}
            rowGap={2}
            columnGap={2}
          >
            <PictogramCard pictogram={pictogramGuide} view="complete" />

            <SettingCardOptions
              setting="languages"
              selected={lang ? lang : "en"}
            />

            <SettingCardBoolean
              setting={"numbered"}
              selected={pictSequence.numbered}
            />
            <SettingCard
              setting={"textPosition"}
              selected={pictSequence.textPosition}
            />
            <SettingCardNumber
              setting="fontSize"
              selected={pictSequence.fontSize}
            />
            <SettingCardBorder
              border="borderOut"
              selected={pictSequence.borderOut}
            />
            <SettingCardBorder
              border="borderIn"
              selected={pictSequence.borderIn}
            />
            <SettingCard setting={"skin"} selected={pictApiAra.skin} />
          </Stack>
        </Container>
      </Dialog>
    </>
  );
};

export default DefaultSettings;
