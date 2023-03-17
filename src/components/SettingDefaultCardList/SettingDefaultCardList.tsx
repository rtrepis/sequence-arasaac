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
import Settings from "../../model/Settings";
import { useAppDispatch } from "../../app/hooks";
import { UpdateSettingItemI } from "../../types/sequence";
import { updateSkinActionCreator } from "../../app/slice/uiSlice";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const SettingsDefaultCardList = (): JSX.Element => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const dispatch = useAppDispatch();

  const handleUpDateSkin = (toUpdate: UpdateSettingItemI) => {
    dispatch(updateSkinActionCreator(toUpdate));
  };

  return (
    <>
      <Button
        aria-label="setting default"
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
            <IconButton
              edge="start"
              color="secondary"
              onClick={handleClose}
              aria-label="close"
            >
              <AiOutlineClose />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Settings default
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <List>
          <ListItem>
            <SettingCard item={Settings.skins} action={handleUpDateSkin} />
          </ListItem>
          <Divider />
        </List>
      </Dialog>
    </>
  );
};

export default SettingsDefaultCardList;
