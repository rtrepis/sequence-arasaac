import Typography from "@mui/material/Typography";
import { useIntl } from "react-intl";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";
import { Stack } from "@mui/system";
import PictogramCard from "../PictogramCard/PictogramCard";
import SettingItem from "../SettingItem/SettingItem";
import Settings from "../../model/Settings";
import { pictEditModalActionCreator } from "../../app/slice/uiSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { PictEditI } from "../../types/ui";
import {
  upDatePictNumberActionCreator,
  upDatePictWordActionCreator,
  upDateSettingItemActionCreator,
} from "../../app/slice/sequenceSlice";
import {
  ProtoPictogramI,
  UpdatePictWordI,
  UpdateSettingItemI,
} from "../../types/sequence";
import PictogramSearch from "../PictogramSearch/PictogramSearch";
import { useEffect, useRef } from "react";
import { AiOutlineSetting } from "react-icons/ai";

const PictEditModal = (): JSX.Element => {
  const { isOpen, indexPict } = useAppSelector(
    (state) => state.ui.modal.pictEdit
  );
  const pictogramToEdit = useAppSelector((state) => state.sequence[indexPict]);
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const closePictEdit: PictEditI = { isOpen: false, indexPict: indexPict };
  const handleClose = () => {
    dispatch(pictEditModalActionCreator(closePictEdit));
  };

  const handleUpDatePictNumber = (upDateNumber: number, word: string) => {
    const upDatePictNum: ProtoPictogramI = {
      index: indexPict,
      number: upDateNumber,
    };
    dispatch(upDatePictNumberActionCreator(upDatePictNum));

    const upDatePictWord: UpdatePictWordI = {
      indexPict: indexPict,
      word: { keyWord: word },
    };
    dispatch(upDatePictWordActionCreator(upDatePictWord));
  };

  const handleUpDateSettingItem = (toUpdate: UpdateSettingItemI) => {
    dispatch(upDateSettingItemActionCreator(toUpdate));
  };

  return (
    <Dialog
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
          {indexPict + 1}
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
            pictogram={pictogramToEdit}
            variant="plane"
            view="complete"
          />

          <PictogramSearch action={handleUpDatePictNumber} />
        </Stack>

        <Accordion sx={{ marginBlock: 2 }}>
          <AccordionSummary
            aria-label="Settings"
            sx={{
              ".MuiAccordionSummary-content": {
                fontSize: "2rem",
                margin: 0,
                justifyContent: "center",
              },
            }}
          >
            <AiOutlineSetting />
          </AccordionSummary>
          <AccordionDetails>
            <SettingItem
              item={Settings.skins}
              action={handleUpDateSettingItem}
              indexPict={indexPict}
            />
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PictEditModal;
