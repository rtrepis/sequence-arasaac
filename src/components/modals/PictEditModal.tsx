import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { FormattedMessage, useIntl } from "react-intl";
import { Divider } from "@mui/material";
import { Stack } from "@mui/system";
import PictogramCard from "../PictogramCard/PictogramCard";
import SettingItem from "../SettingItem/SettingItem";
import Settings from "../../model/Settings";
import { pictEditModalActionCreator } from "../../app/slice/uiSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { PictEditI } from "../../types/ui";
import { upDateSettingItemActionCreator } from "../../app/slice/sequenceSlice";
import { UpdateSettingItemI } from "../../types/sequence";

const ModalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: 640,
  bgcolor: "background.paper",
  border: "5px solid",
  borderColor: "primary.dark",
  borderRadius: 5,
  boxShadow: 24,
  p: 2,
};

const PictEditModal = (): JSX.Element => {
  const { isOpen, indexPict } = useAppSelector(
    (state) => state.ui.modal.pictEdit
  );
  const pictogramToEdit = useAppSelector((state) => state.sequence[indexPict]);
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const closePictEdit: PictEditI = { isOpen: false, indexPict: NaN };
  const handleClose = () => dispatch(pictEditModalActionCreator(closePictEdit));

  const handleUpDateSettingItem = (toUpdate: UpdateSettingItemI) => {
    dispatch(upDateSettingItemActionCreator(toUpdate));
  };

  return (
    <Modal
      open={isOpen}
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
    >
      <Box sx={ModalStyle}>
        <Stack direction={"row"} marginBottom={1} alignItems="center">
          <Typography variant="h5" component="h2">
            {intl.formatMessage({
              id: "components.modal.pictogramEdit.label",
              defaultMessage: "Edit Pictogram",
              description: "Title modal",
            })}
          </Typography>
          <Divider variant="inset" />
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
            {indexPict + 1}
          </Typography>
        </Stack>
        <Divider sx={{ marginBottom: 1 }} />
        <Stack alignItems={"center"}>
          <PictogramCard
            pictogram={pictogramToEdit}
            variant="plane"
            view="complete"
          />
          <SettingItem
            item={Settings.skins}
            action={handleUpDateSettingItem}
            indexPict={indexPict}
          />
        </Stack>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          <FormattedMessage
            id={"components.modal.pictogramEdit.describe"}
            defaultMessage={"You can edit pictograms"}
            description={"Description modal"}
          />
        </Typography>
      </Box>
    </Modal>
  );
};

export default PictEditModal;
