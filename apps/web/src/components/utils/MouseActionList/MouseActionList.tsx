/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import {
  AiOutlineCopy,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlinePaperClip,
} from "react-icons/ai";
import { TbColumnInsertRight } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { useIntl } from "react-intl";
import {
  renumberSequenceActionCreator,
  subtractPictogramActionCreator,
  updatePictSequenceActionCreator,
  insertPictogramActionCreator,
} from "@features/sequence/store/documentSlice";
import useNewPictogram from "@features/pictogram/hooks/useNewPictogram";
import { PictSequence } from "../../../types/sequence";
import messages from "./MouseActionList.lang";
import React from "react";

interface MouseActionListProps {
  pictogram: PictSequence;
  editAction: () => void;
  closeAction: () => void;
  copyAction: React.Dispatch<React.SetStateAction<PictSequence>> | undefined;
  pasteObject: PictSequence | undefined;
}

const MouseActionList = ({
  pictogram,
  editAction,
  closeAction,
  copyAction,
  pasteObject,
}: MouseActionListProps): React.ReactElement => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const { getPictogramEmptyWithDefaultSettings: pictogramEmpty } =
    useNewPictogram();

  const handlerInset = (newPictogram: PictSequence) => {
    closeAction();
    dispatch(insertPictogramActionCreator(newPictogram));
    dispatch(renumberSequenceActionCreator());
  };

  const handlerCopy = () => {
    closeAction();
    copyAction && copyAction(pictogram);
  };

  const handlerPaste = () => {
    closeAction();
    pasteObject &&
      dispatch(
        updatePictSequenceActionCreator({
          ...pasteObject,
          indexSequence: pictogram.indexSequence,
        }),
      );
  };

  const handlerDelete = () => {
    dispatch(subtractPictogramActionCreator(pictogram.indexSequence));
    dispatch(renumberSequenceActionCreator());
    closeAction();
  };

  return (
    <List
      sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader
          component="span"
          id="nested-list-subheader"
          color="primary"
        >
          {intl.formatMessage(messages.header, {
            number: pictogram.indexSequence + 1,
          })}
        </ListSubheader>
      }
    >
      <ListItemButton onClick={handlerCopy}>
        <ListItemIcon>
          <AiOutlineCopy />
        </ListItemIcon>
        <ListItemText primary={intl.formatMessage(messages.copy)} />
      </ListItemButton>
      <ListItemButton
        disabled={pasteObject ? false : true}
        onClick={handlerPaste}
      >
        <ListItemIcon>
          <AiOutlinePaperClip />
        </ListItemIcon>
        <ListItemText primary={intl.formatMessage(messages.paste)} />
      </ListItemButton>
      <ListItemButton onClick={editAction}>
        <ListItemIcon>
          <AiOutlineEdit />
        </ListItemIcon>
        <ListItemText primary={intl.formatMessage(messages.edit)} />
      </ListItemButton>
      <ListItemButton onClick={handlerDelete}>
        <ListItemIcon>
          <AiOutlineDelete />
        </ListItemIcon>
        <ListItemText primary={intl.formatMessage(messages.delete)} />
      </ListItemButton>
      <ListItemButton
        onClick={() =>
          handlerInset(pictogramEmpty(pictogram.indexSequence + 1))
        }
      >
        <ListItemIcon>
          <TbColumnInsertRight />
        </ListItemIcon>
        <ListItemText primary={intl.formatMessage(messages.insert)} />
      </ListItemButton>
      <ListItemButton
        onClick={() =>
          handlerInset({
            ...pictogram,
            indexSequence: pictogram.indexSequence + 1,
          })
        }
      >
        <ListItemIcon>
          <AiOutlineCopy />
        </ListItemIcon>
        <ListItemText primary={intl.formatMessage(messages.duplicate)} />
      </ListItemButton>
    </List>
  );
};

export default MouseActionList;
