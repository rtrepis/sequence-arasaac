import Typography from "@mui/material/Typography";
import { useIntl } from "react-intl";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { Stack } from "@mui/system";
import PictogramCard from "../PictogramCard/PictogramCard";
import { PictogramI } from "../../types/sequence";
import PictogramSearch from "../PictogramSearch/PictogramSearch";
import SettingsPictCardList from "../SettingPictCardList/SettingPictCardList";
import { useState } from "react";

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
        aria-labelledby={intl.formatMessage({
          id: "components.modal.pictogramEdit.label",
          defaultMessage: "Edit Pictogram",
          description: "Title modal",
        })}
        aria-describedby={intl.formatMessage({
          id: "components.modal.pictogramEdit.description",
          defaultMessage: "You can edit pictograms",
          description: "Description modal",
        })}
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
            {intl.formatMessage({
              id: "components.modal.pictogramEdit.label",
              defaultMessage: "Edit Pictogram",
              description: "Title modal",
            })}
          </Typography>

          <Typography
            variant="h4"
            component="h2"
            sx={{
              backgroundColor: "primary.main",
              borderRadius: "50%",
              color: "primary.contrastText",
              minWidth: "2.75rem",
              textAlign: "center",
            }}
          >
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
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PictEdit;
