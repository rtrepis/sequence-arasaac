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
import {
  insertPictogramActionCreator,
  renumberSequenceActionCreator,
  subtractPictogramActionCreator,
} from "../../../app/slice/sequenceSlice";
import useNewPictogram from "../../../hooks/useNewPictogram";
import { PictSequence } from "../../../types/sequence";
import { updatePictSequenceActionCreator } from "../../../app/slice/sequenceSlice";

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
}: MouseActionListProps): JSX.Element => {
  const dispatch = useDispatch();
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
        })
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
          Pictogram {pictogram.indexSequence + 1}
        </ListSubheader>
      }
    >
      <ListItemButton onClick={handlerCopy}>
        <ListItemIcon>
          <AiOutlineCopy />
        </ListItemIcon>
        <ListItemText primary="Copy" />
      </ListItemButton>
      <ListItemButton
        disabled={pasteObject ? false : true}
        onClick={handlerPaste}
      >
        <ListItemIcon>
          <AiOutlinePaperClip />
        </ListItemIcon>
        <ListItemText primary="Paste" />
      </ListItemButton>
      <ListItemButton onClick={editAction}>
        <ListItemIcon>
          <AiOutlineEdit />
        </ListItemIcon>
        <ListItemText primary="Edit" />
      </ListItemButton>
      <ListItemButton onClick={handlerDelete}>
        <ListItemIcon>
          <AiOutlineDelete />
        </ListItemIcon>
        <ListItemText primary="Delete" />
      </ListItemButton>
      <ListItemButton
        onClick={() =>
          handlerInset(pictogramEmpty(pictogram.indexSequence + 1))
        }
      >
        <ListItemIcon>
          <TbColumnInsertRight />
        </ListItemIcon>
        <ListItemText primary="Insert" />
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
        <ListItemText primary="Duplicate" />
      </ListItemButton>
    </List>
  );
};

export default MouseActionList;
