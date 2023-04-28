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
import { useAppSelector } from "../../../app/hooks";
import { PictSequence } from "../../../types/sequence";

interface MouseActionListProps {
  indexPict: number;
  editAction: () => void;
  closeAction: () => void;
}

const MouseActionList = ({
  indexPict,
  editAction,
  closeAction,
}: MouseActionListProps): JSX.Element => {
  const dispatch = useDispatch();
  const pictSequenceDefault = useAppSelector(
    (state) => state.ui.defaultSettings.pictSequence
  );

  let pictogramEmpty: PictSequence = {
    indexSequence: indexPict + 1,
    img: {
      searched: {
        word: `empty`,
        bestIdPicts: [],
      },
      selectedId: 26527,
      settings: { fitzgerald: "#2222ff" },
    },
    settings: {
      textPosition: pictSequenceDefault.textPosition,
      fontSize: pictSequenceDefault.fontSize,
    },
  };

  const handlerInset = () => {
    closeAction();
    dispatch(insertPictogramActionCreator(pictogramEmpty));
    dispatch(renumberSequenceActionCreator());
  };

  return (
    <List
      sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Pictogram {indexPict + 1}
        </ListSubheader>
      }
    >
      <ListItemButton disabled>
        <ListItemIcon>
          <AiOutlineCopy />
        </ListItemIcon>
        <ListItemText primary="Copy" />
      </ListItemButton>
      <ListItemButton disabled>
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
      <ListItemButton
        onClick={() => dispatch(subtractPictogramActionCreator(indexPict))}
      >
        <ListItemIcon>
          <AiOutlineDelete />
        </ListItemIcon>
        <ListItemText primary="Delete" />
      </ListItemButton>
      <ListItemButton disabled>
        <ListItemIcon>
          <AiOutlineCopy />
        </ListItemIcon>
        <ListItemText primary="Duplicate" />
      </ListItemButton>
      <ListItemButton onClick={handlerInset}>
        <ListItemIcon>
          <TbColumnInsertRight />
        </ListItemIcon>
        <ListItemText primary="Insert" />
      </ListItemButton>
    </List>
  );
};

export default MouseActionList;
