import Typography from "@mui/material/Typography";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { Stack } from "@mui/system";
import PictogramCard from "../PictogramCard/PictogramCard";
import { PictogramI } from "../../types/sequence";
import PictogramSearch from "../PictogramSearch/PictogramSearch";
import SettingsPictCardList from "../SettingPictCardList/SettingPictCardList";
import { useState } from "react";
import messages from "./PictEdti.lang";
import { circlePictogramNumber } from "./PictEdit.styled";
import StyledButton from "../../style/StyledButton";

interface PictEditProps {
  pictogram: PictogramI;
}

const PictEdit = ({ pictogram }: PictEditProps): JSX.Element => {
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
        variant="text"
        onClick={handleClickOpen}
        sx={{ textTransform: "none" }}
      >
        <PictogramCard view={"complete"} pictogram={pictogram} />
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby={intl.formatMessage({ ...messages.modal })}
        aria-describedby={intl.formatMessage({ ...messages.description })}
        maxWidth={"xl"}
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
            {pictogram.index + 1}
          </Typography>
        </Stack>
        <DialogContent dividers={true}>
          <Stack
            display={"flex"}
            flexWrap={"wrap"}
            flexDirection={"row"}
            justifyContent={"space-around"}
          >
            <PictogramCard
              pictogram={pictogram}
              variant="plane"
              view="complete"
            />

            <PictogramSearch indexPict={pictogram.index} />
          </Stack>

          <SettingsPictCardList indexPict={pictogram.index} />
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center" }}>
          <StyledButton onClick={handleClose} variant={"outlined"}>
            Close
          </StyledButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PictEdit;
