import Typography from "@mui/material/Typography";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { Stack } from "@mui/system";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import { PictSequence } from "../../types/sequence";
import { useState } from "react";
import messages from "./PictEdti.lang";
import { circlePictogramNumber } from "./PictEdit.styled";
import StyledButton from "../../style/StyledButton";
import { useAppDispatch } from "../../app/hooks";
import {
  renumberSequenceActionCreator,
  subtractPictogramActionCreator,
} from "../../app/slice/sequenceSlice";
import PictEditForm from "../../components/PictEditFrom/PictEditForm";

interface PictEditProps {
  pictogram: PictSequence;
  size?: number;
}

const PictEdit = ({ pictogram, size }: PictEditProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
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
        onClick={handleClickOpen}
        sx={{ textTransform: "none" }}
      >
        <PictogramCard view={"complete"} pictogram={pictogram} size={size} />
      </Button>

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
          <PictEditForm pictogram={pictogram} />
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

export default PictEdit;
