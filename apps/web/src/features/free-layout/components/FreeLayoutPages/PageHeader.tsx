import React, { useId, useState } from "react";
import {
  Divider,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdContentCopy,
  MdDeleteOutline,
  MdMoreVert,
  MdOutlineDashboard,
  MdOutlineLibraryAdd,
} from "react-icons/md";
import { MessageDescriptor, useIntl } from "react-intl";
import { useAppDispatch } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import StyledButton from "@/style/StyledButton";
import StyledIconButton from "@/style/StyledIconButton";
import { templatesFor } from "@features/free-layout/model/templates";
import {
  applyTemplateThunk,
  duplicateSheetThunk,
  moveSheetThunk,
  removeSheetThunk,
} from "@features/free-layout/store/freeLayoutThunks";
import messages from "./FreeLayoutPages.lang";

/** El nom de cada plantilla del selector, per l'`id` de la plantilla. */
const TEMPLATE_NAMES: Record<string, MessageDescriptor> = {
  full: messages.templateFull,
  "rows-2": messages.templateRows2,
  "columns-2": messages.templateColumns2,
  "rows-3": messages.templateRows3,
  "grid-2x2": messages.templateGrid2x2,
  "strip-top": messages.templateStripTop,
};

interface PageHeaderProps {
  sheetIndex: number;
  sheetCount: number;
  /** Les caixes pròpies de la pàgina, sense les comunes */
  placementCount: number;
  onAddSequence: () => void;
}

/**
 * La capçalera d'una pàgina del mode lliure, a sobre del full: quina pàgina
 * és, «Afegeix una seqüència», les plantilles i el menú de la pàgina
 * (duplicar, moure, esborrar). No s'imprimeix: és fora del full.
 */
const PageHeader = ({
  sheetIndex,
  sheetCount,
  placementCount,
  onAddSequence,
}: PageHeaderProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const templateMenuId = useId();
  const pageMenuId = useId();
  const [templateAnchor, setTemplateAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [pageAnchor, setPageAnchor] = useState<HTMLElement | null>(null);
  const templates = templatesFor(placementCount);
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
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      gap={1}
      sx={{ "@media print": { display: "none" } }}
    >
      <Typography component="h2" variant="subtitle1" sx={{ flexGrow: 1 }}>
        {intl.formatMessage(messages.pageLabel, {
          number,
          total: sheetCount,
        })}
      </Typography>

      <StyledButton
        color="inherit"
        startIcon={<MdOutlineLibraryAdd />}
        onClick={onAddSequence}
      >
        {intl.formatMessage(messages.addSequence)}
      </StyledButton>

      {placementCount > 0 && (
        <StyledButton
          color="inherit"
          startIcon={<MdOutlineDashboard />}
          aria-haspopup="menu"
          aria-expanded={templateAnchor !== null}
          aria-controls={templateAnchor ? templateMenuId : undefined}
          onClick={(event) => setTemplateAnchor(event.currentTarget)}
        >
          {intl.formatMessage(messages.template)}
        </StyledButton>
      )}
      <Menu
        id={templateMenuId}
        anchorEl={templateAnchor}
        open={templateAnchor !== null}
        onClose={() => setTemplateAnchor(null)}
      >
        <ListSubheader>
          {intl.formatMessage(messages.templateMenuTitle)}
        </ListSubheader>
        {templates.length === 0 && (
          <MenuItem disabled>
            {intl.formatMessage(messages.templateNone)}
          </MenuItem>
        )}
        {templates.map((template) => (
          <MenuItem
            key={template.id}
            onClick={() => {
              setTemplateAnchor(null);
              // Substitueix els retocs de la pàgina: surt el snackbar amb «Desfés»
              dispatch(applyTemplateThunk(sheetIndex, template));
            }}
          >
            {intl.formatMessage(TEMPLATE_NAMES[template.id])}
          </MenuItem>
        ))}
      </Menu>

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
    </Stack>
  );
};

export default PageHeader;
