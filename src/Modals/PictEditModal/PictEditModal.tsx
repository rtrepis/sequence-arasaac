import Typography from "@mui/material/Typography";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Popover,
} from "@mui/material";
import { Stack } from "@mui/system";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import { PictSequence } from "../../types/sequence";
import { useState } from "react";
import messages from "./PictEdti.lang";
import { circlePictogramNumber } from "./PictEditModal.styled";
import StyledButton from "../../style/StyledButton";
import { useAppDispatch } from "../../app/hooks";
import {
  renumberSequenceActionCreator,
  subtractPictogramActionCreator,
} from "../../app/slice/sequenceSlice";
import PictEditForm from "../../components/PictEditFrom/PictEditForm";
import MouseActionList from "../../components/utils/MouseActionList/MouseActionList";

interface PictEditProps {
  pictogram: PictSequence;
  size?: number;
  copy?: PictSequence;
  setCopy?: React.Dispatch<React.SetStateAction<PictSequence>>;
}

const PictEditModal = ({
  pictogram,
  size,
  copy,
  setCopy,
}: PictEditProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const [open, setOpen] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handlerClickOpen = () => {
    setOpenPopover(false);
    setOpen(true);
  };

  const handlerClosePopover = () => {
    setOpenPopover(false);
  };

  const handlerContextMenu = (event: any) => {
    event.preventDefault();
    setMousePosition({ x: event.clientX, y: event.clientY });
    setOpenPopover(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    setOpen(false);
    dispatch(subtractPictogramActionCreator(pictogram.indexSequence));
    dispatch(renumberSequenceActionCreator());
  };

  return (
    <>
      <Button
        variant="text"
        onClick={handlerClickOpen}
        onContextMenu={handlerContextMenu}
        sx={{ textTransform: "none" }}
      >
        <PictogramCard view={"complete"} pictogram={pictogram} size={size} />
      </Button>
      <Popover
        open={openPopover}
        anchorOrigin={{
          vertical: mousePosition.y,
          horizontal: mousePosition.x,
        }}
        anchorEl={undefined}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{ textAlign: "center" }}
      >
        <MouseActionList
          pictogram={pictogram}
          editAction={handlerClickOpen}
          closeAction={handlerClosePopover}
          copyAction={setCopy}
          pasteObject={copy}
        />
        <Button onClick={() => setOpenPopover(false)}>Close</Button>
      </Popover>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby={intl.formatMessage({ ...messages.modal })}
        aria-describedby={intl.formatMessage({ ...messages.description })}
        maxWidth={"sm"}
        fullWidth
        sx={{ ".MuiDialog-paperScrollPaper": { borderRadius: 5 } }}
      >
        <Stack
          display="flex"
          flexDirection={"row"}
          justifyContent={"space-around"}
          alignItems={"center"}
          padding={1.5}
          onClick={() => setOpenPopover(false)}
        >
          <Typography variant="h5" component="h2">
            <FormattedMessage {...messages.modal} />
          </Typography>

          <Typography variant="h4" component="h2" sx={circlePictogramNumber}>
            {pictogram.indexSequence + 1}
          </Typography>
        </Stack>

        <DialogContent dividers={true} sx={{ padding: 2 }}>
          <PictEditForm pictogram={pictogram} submit={open} />
        </DialogContent>

        <DialogActions
          sx={{ justifyContent: "space-between", paddingInline: 3 }}
        >
          <StyledButton
            onClick={handleDelete}
            variant={"outlined"}
            color={"error"}
          >
            <FormattedMessage {...messages.delete} />
          </StyledButton>
          <StyledButton onClick={handleClose} variant={"contained"}>
            <FormattedMessage {...messages.close} />
          </StyledButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PictEditModal;
