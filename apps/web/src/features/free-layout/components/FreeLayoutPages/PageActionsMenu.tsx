import React, { useId, useState } from "react";
import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdAdd,
  MdArrowDownward,
  MdArrowUpward,
  MdCheck,
  MdContentCopy,
  MdDeleteOutline,
  MdMoreVert,
  MdOutlineDashboard,
  MdOutlineLibraryAdd,
  MdTitle,
} from "react-icons/md";
import { MessageDescriptor, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import StyledIconButton from "@/style/StyledIconButton";
import type { SheetMode } from "@/types/document";
import {
  addSheetThunk,
  addTextBlockThunk,
  duplicateSheetThunk,
  moveSheetThunk,
  removeSheetThunk,
  selectPageLayout,
  selectPages,
  setSheetModeThunk,
} from "@features/free-layout/store/freeLayoutThunks";
import {
  SHAPED_TEMPLATES,
  arrangementOf,
} from "@features/free-layout/model/templates";
import { useViewSelection } from "@features/free-layout/hooks/useViewSelection";
import { useApplyTemplate } from "@features/free-layout/hooks/useApplyTemplate";
import TemplatePicker from "@features/free-layout/components/TemplatePicker";
import messages from "./FreeLayoutPages.lang";

interface PageActionsMenuProps {
  sheetIndex: number;
  sheetCount: number;
  /** Obre la llista de seqüències per afegir-ne a aquesta pàgina */
  onAddSequence: () => void;
}

/**
 * El menú «⋯» d'una pàgina, a la seva capçalera, damunt de la
 * previsualització: és l'únic lloc de les accions de la pàgina (la columna
 * no les repeteix). Hi ha la disposició (contínua o en blocs), afegir-hi una
 * seqüència o un bloc segons la disposició, les plantilles (les mateixes que
 * a la columna, amb miniatura) i duplicar, moure i esborrar la pàgina.
 */
const PageActionsMenu = ({
  sheetIndex,
  sheetCount,
  onAddSequence,
}: PageActionsMenuProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const { select, setTemplatePreview, setVisiblePage } = useViewSelection();
  const pages = useAppSelector(selectPages);
  const orientation = useAppSelector(selectPageLayout).orientation;
  const pageMenuId = useId();
  const templatesTitleId = useId();
  const [pageAnchor, setPageAnchor] = useState<HTMLElement | null>(null);
  const [templatesAnchor, setTemplatesAnchor] = useState<HTMLElement | null>(
    null,
  );
  const { apply, dialog } = useApplyTemplate(sheetIndex);
  const sheet = pages?.sheets[sheetIndex];
  const mode: SheetMode = sheet?.mode ?? "auto";
  const number = sheetIndex + 1;
  const arrangement = arrangementOf(sheet?.template);

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

  const changeMode = (next: SheetMode) =>
    pageAction(() => {
      if (next !== mode) dispatch(setSheetModeThunk(sheetIndex, next));
    });

  const closeTemplates = () => {
    setTemplatesAnchor(null);
    setTemplatePreview(null);
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
        <ListSubheader>
          {intl.formatMessage(messages.layoutSection)}
        </ListSubheader>
        {(["auto", "template"] as const).map((value) => (
          <MenuItem
            key={value}
            role="menuitemradio"
            aria-checked={mode === value}
            onClick={changeMode(value)}
          >
            <ListItemIcon>{mode === value && <MdCheck />}</ListItemIcon>
            <ListItemText>
              {intl.formatMessage(
                value === "auto"
                  ? messages.modeContinuous
                  : messages.modeBlocks,
              )}
            </ListItemText>
          </MenuItem>
        ))}

        <Divider />
        {mode === "auto" ? (
          <MenuItem onClick={pageAction(onAddSequence)}>
            <ListItemIcon>
              <MdOutlineLibraryAdd />
            </ListItemIcon>
            <ListItemText>
              {intl.formatMessage(messages.addSequence)}
            </ListItemText>
          </MenuItem>
        ) : (
          [
            <ListSubheader key="add">
              {intl.formatMessage(messages.addBlock)}
            </ListSubheader>,
            <MenuItem key="sequence" onClick={pageAction(onAddSequence)}>
              <ListItemIcon>
                <MdOutlineLibraryAdd />
              </ListItemIcon>
              <ListItemText>
                {intl.formatMessage(messages.addSequenceBlock)}
              </ListItemText>
            </MenuItem>,
            <MenuItem
              key="text"
              onClick={pageAction(() => {
                const placementId = dispatch(addTextBlockThunk(sheetIndex));
                select({ kind: "block", placementId, sheetIndex });
                confirm(messages.textBlockAdded, { number });
              })}
            >
              <ListItemIcon>
                <MdTitle />
              </ListItemIcon>
              <ListItemText>
                {intl.formatMessage(messages.addTextBlock)}
              </ListItemText>
            </MenuItem>,
          ]
        )}
        <MenuItem
          aria-haspopup="dialog"
          onClick={() => {
            setTemplatesAnchor(pageAnchor);
            setPageAnchor(null);
          }}
        >
          <ListItemIcon>
            <MdOutlineDashboard />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage(messages.chooseTemplate)}
          </ListItemText>
        </MenuItem>

        <Divider />
        <MenuItem
          onClick={pageAction(() => {
            // Una pàgina nova, darrere d'aquesta, i s'hi va
            dispatch(addSheetThunk(sheetIndex));
            setVisiblePage(sheetIndex + 1);
            confirm(messages.pageAdded, { number: number + 1 });
          })}
        >
          <ListItemIcon>
            <MdAdd />
          </ListItemIcon>
          <ListItemText>{intl.formatMessage(messages.addPage)}</ListItemText>
        </MenuItem>
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

      {/* Les plantilles, amb miniatura: les mateixes que a la columna */}
      <Popover
        open={templatesAnchor !== null}
        anchorEl={templatesAnchor}
        onClose={closeTemplates}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            role: "dialog",
            "aria-labelledby": templatesTitleId,
            sx: { width: 320, maxWidth: "calc(100vw - 32px)" },
          },
        }}
      >
        <Box sx={{ padding: 2 }}>
          <Typography
            id={templatesTitleId}
            variant="subtitle2"
            component="h2"
            sx={{ marginBottom: 1 }}
          >
            {intl.formatMessage(messages.templatesTitle, { number })}
          </Typography>
          <TemplatePicker
            templates={SHAPED_TEMPLATES}
            value={arrangement.kind === "template" ? arrangement.id : undefined}
            landscape={(orientation ?? "landscape") === "landscape"}
            labelId={templatesTitleId}
            onApply={(template) => {
              closeTemplates();
              apply(template);
            }}
            onPreview={(template) =>
              setTemplatePreview(template ? { sheetIndex, template } : null)
            }
          />
        </Box>
      </Popover>
      {dialog}
    </>
  );
};

export default PageActionsMenu;
