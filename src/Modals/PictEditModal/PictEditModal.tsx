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
import messages from "./PictEdit.lang";
import { circlePictogramNumber } from "./PictEditModal.styled";
import StyledButton from "../../style/StyledButton";
import { useAppDispatch } from "../../app/hooks";
import {
  renumberSequenceActionCreator,
  subtractPictogramActionCreator,
} from "../../app/slice/sequenceSlice";
import PictEditForm from "../../components/PictEditFrom/PictEditForm";
import MouseActionList from "../../components/utils/MouseActionList/MouseActionList";
import React from "react";

interface PictEditProps {
  pictogram: PictSequence;
  size?: number;
  copy?: PictSequence;
  setCopy?: React.Dispatch<React.SetStateAction<PictSequence>>;
}

const PictEditModal = ({
  pictogram,
  copy,
  setCopy,
}: PictEditProps): React.ReactElement => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [submit, setSubmit] = useState(false);

  const handlerClickOpen = () => {
    setOpen(true);
  };

  const handlerClosePopover = () => {
    setAnchorEl(null);
  };

  const handlerContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setSubmit(true);
    setOpen(false);
  };

  const handleDelete = () => {
    setOpen(false);
    dispatch(subtractPictogramActionCreator(pictogram.indexSequence));
    dispatch(renumberSequenceActionCreator());
  };

  const openPopover = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <Button
        aria-describedby={id}
        id={id}
        variant="text"
        onClick={handlerClickOpen}
        onContextMenu={handlerContextMenu}
        sx={{ textTransform: "none" }}
      >
        <PictogramCard
          view={"complete"}
          pictogram={pictogram}
          size={{ pictSize: 0.75 }}
        />
      </Button>
      <Popover
        id={id}
        open={openPopover}
        anchorEl={anchorEl}
        sx={{ textAlign: "center" }}
        onClose={() => setAnchorEl(null)}
      >
        <MouseActionList
          pictogram={pictogram}
          editAction={handlerClickOpen}
          closeAction={handlerClosePopover}
          copyAction={setCopy}
          pasteObject={copy}
        />
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
        >
          <Typography variant="h5" component="h2">
            <FormattedMessage {...messages.modal} />
          </Typography>

          <Typography variant="h4" component="h2" sx={circlePictogramNumber}>
            {pictogram.indexSequence + 1}
          </Typography>
        </Stack>

        <DialogContent dividers={true} sx={{ padding: 2 }}>
          <PictEditForm pictogram={pictogram} submit={submit} />
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
