import React, { useId, useState } from "react";
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdContentCopy,
  MdDeleteOutline,
  MdMoreVert,
} from "react-icons/md";
import { MessageDescriptor, useIntl } from "react-intl";
import { useAppDispatch } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import StyledIconButton from "@/style/StyledIconButton";
import {
  duplicateSheetThunk,
  moveSheetThunk,
  removeSheetThunk,
} from "@features/free-layout/store/freeLayoutThunks";
import messages from "./FreeLayoutPages.lang";

interface PageActionsMenuProps {
  sheetIndex: number;
  sheetCount: number;
}

/**
 * El menú d'una pàgina (duplicar, moure, esborrar): el mateix a la capçalera
 * de la pàgina, al full, i al nivell «Pàgina» de la columna (P3 de l'esbós).
 */
const PageActionsMenu = ({
  sheetIndex,
  sheetCount,
}: PageActionsMenuProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const pageMenuId = useId();
  const [pageAnchor, setPageAnchor] = useState<HTMLElement | null>(null);
  const number = sheetIndex + 1;

  const confirm = (
    message: MessageDescriptor,
    values: Record<string, number>,
  ) =>
    showSnackbar({
      message: intl.formatMessage(message, values),
      severity: "success",
    });

  const pageAction = (action: () => void) => () => {
    setPageAnchor(null);
    action();
  };

  return (
    <>
      <Tooltip title={intl.formatMessage(messages.pageMoreActions)}>
        <StyledIconButton
          color="inherit"
          aria-label={intl.formatMessage(messages.pageMoreActions)}
          aria-haspopup="menu"
          aria-expanded={pageAnchor !== null}
          aria-controls={pageAnchor ? pageMenuId : undefined}
          onClick={(event) => setPageAnchor(event.currentTarget)}
        >
          <MdMoreVert />
        </StyledIconButton>
      </Tooltip>
      <Menu
        id={pageMenuId}
        anchorEl={pageAnchor}
        open={pageAnchor !== null}
        onClose={() => setPageAnchor(null)}
      >
        <MenuItem
          onClick={pageAction(() => {
            dispatch(duplicateSheetThunk(sheetIndex));
            confirm(messages.pageDuplicated, { number: number + 1 });
          })}
        >
          <ListItemIcon>
            <MdContentCopy />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage(messages.duplicatePage)}
          </ListItemText>
        </MenuItem>
        {sheetIndex > 0 && (
          <MenuItem
            onClick={pageAction(() => {
              dispatch(moveSheetThunk(sheetIndex, sheetIndex - 1));
              confirm(messages.pageMoved, { number: number - 1 });
            })}
          >
            <ListItemIcon>
              <MdArrowUpward />
            </ListItemIcon>
            <ListItemText>
              {intl.formatMessage(messages.movePageUp)}
            </ListItemText>
          </MenuItem>
        )}
        {sheetIndex < sheetCount - 1 && (
          <MenuItem
            onClick={pageAction(() => {
              dispatch(moveSheetThunk(sheetIndex, sheetIndex + 1));
              confirm(messages.pageMoved, { number: number + 1 });
            })}
          >
            <ListItemIcon>
              <MdArrowDownward />
            </ListItemIcon>
            <ListItemText>
              {intl.formatMessage(messages.movePageDown)}
            </ListItemText>
          </MenuItem>
        )}
        {/* La destructiva, sola i l'última (`feedback-i-accions.md`) */}
        <Divider />
        <MenuItem
          onClick={pageAction(() => dispatch(removeSheetThunk(sheetIndex)))}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <MdDeleteOutline />
          </ListItemIcon>
          <ListItemText>{intl.formatMessage(messages.deletePage)}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default PageActionsMenu;
