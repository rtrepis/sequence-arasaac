import { FormattedMessage, useIntl } from "react-intl";
import { IconButton, Popover, Tooltip, Button } from "@mui/material";
import { MdMoreVert } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import { PictSequence } from "../../types/sequence";
import { useRef, useState } from "react";
import messages from "./PictEdit.lang";
import { pictogramTrigger } from "./PictEditModal.styled";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "../../style/StyledButton";
import { useAppSelector } from "../../app/hooks";
import { PictogramCardDefaults } from "../../types/sequence";
import PictEditForm from "../../components/PictEditFrom/PictEditForm";
import MouseActionList from "../../components/utils/MouseActionList/MouseActionList";
import {
  usePictogramActions,
  type PictogramActionKey,
} from "../../components/utils/MouseActionList/usePictogramActions";
import React from "react";

interface PictEditProps {
  pictogram: PictSequence;
  size?: number;
  copy?: PictSequence;
  setCopy?: React.Dispatch<React.SetStateAction<PictSequence>>;
}

/**
 * Accions que el diàleg ja ofereix pel seu compte: hi ets, a l'edició, i
 * «Eliminar» és el botó vermell del peu.
 */
const ACTIONS_IN_DIALOG: PictogramActionKey[] = ["edit", "delete"];

const PictEditModal = ({
  pictogram,
  copy,
  setCopy,
}: PictEditProps): React.ReactElement => {
  const intl = useIntl();
  const { pictSequence } = useAppSelector((state) => state.ui.defaultSettings);
  const defaults: PictogramCardDefaults = {
    numbered: pictSequence.numbered,
    font: pictSequence.font,
    numberFont: pictSequence.numberFont,
    borderIn: pictSequence.borderIn,
    borderOut: pictSequence.borderOut,
  };

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [submit, setSubmit] = useState(false);
  // Acció triada des del diàleg, pendent que el diàleg acabi de tancar-se
  const [pendingAction, setPendingAction] = useState<PictogramActionKey | null>(
    null,
  );
  // Ref per restaurar el focus al botó trigger quan el dialog es tanca
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handlerClickOpen = () => {
    setOpen(true);
  };

  const actions = usePictogramActions({
    pictogram,
    editAction: handlerClickOpen,
    copyAction: setCopy,
    pasteObject: copy,
  });

  const handlerClosePopover = () => {
    setAnchorEl(null);
  };

  const handlerContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setSubmit(true);
    setOpen(false);
    // Retorna el focus al botó que va obrir el dialog
    triggerRef.current?.focus();
  };

  /**
   * Les accions triades dins del diàleg s'executen quan ja ha sortit de
   * pantalla, mai abans: `PictEditForm` guarda els seus canvis en estat local
   * i només els desa en tancar-se. Executant-les aquí, l'acció treballa sobre
   * el pictograma al dia — i enganxar no queda desfet pel desat del formulari.
   */
  const handleExited = () => {
    if (!pendingAction) return;
    actions[pendingAction]();
    setPendingAction(null);
  };

  const handleSelectFromDialog = (action: PictogramActionKey) => {
    setMenuAnchorEl(null);
    setPendingAction(action);
    handleClose();
  };

  const handleDelete = () => {
    setOpen(false);
    // Retorna el focus al botó trigger fins i tot en cas d'esborrat
    triggerRef.current?.focus();
    actions.delete();
  };

  const openPopover = Boolean(anchorEl);
  const popoverId = `pictogram-menu-${pictogram.indexSequence}`;
  const dialogMenuId = `pictogram-dialog-menu-${pictogram.indexSequence}`;
  const moreActionsLabel = intl.formatMessage(messages.moreActions);

  return (
    <>
      <Button
        ref={triggerRef}
        aria-describedby={openPopover ? popoverId : undefined}
        variant="text"
        onClick={handlerClickOpen}
        onContextMenu={handlerContextMenu}
        sx={pictogramTrigger}
      >
        <PictogramCard
          view={"complete"}
          pictogram={pictogram}
          defaults={defaults}
          size={{ pictSize: 0.75 }}
        />
      </Button>
      <Popover
        id={popoverId}
        open={openPopover}
        anchorEl={anchorEl}
        sx={{ textAlign: "center" }}
        // El menú surt sota la targeta i no la tapa: quan diu «Pictograma 4»
        // s'ha de poder comprovar que el 4 és el que es tenia al davant
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={handlerClosePopover}
      >
        <MouseActionList
          pictogram={pictogram}
          editAction={handlerClickOpen}
          closeAction={handlerClosePopover}
          copyAction={setCopy}
          pasteObject={copy}
        />
      </Popover>

      <AppDialog
        open={open}
        onClose={handleClose}
        title={intl.formatMessage(messages.modal)}
        titleId="pict-edit-dialog-title"
        badge={pictogram.indexSequence + 1}
        headerAction={
          /* Única via a copiar, enganxar, inserir i duplicar allà on el
             navegador no dispara mai `contextmenu` (tot el WebKit d'iOS) */
          <Tooltip title={moreActionsLabel}>
            <IconButton
              aria-label={moreActionsLabel}
              aria-haspopup="true"
              aria-controls={menuAnchorEl ? dialogMenuId : undefined}
              onClick={(event) => setMenuAnchorEl(event.currentTarget)}
            >
              <MdMoreVert />
            </IconButton>
          </Tooltip>
        }
        transitionProps={{ onExited: handleExited }}
        contentSx={{ paddingInline: 1, paddingBlock: 0, overflowX: "hidden" }}
        actions={
          <AppDialogActions
            startAction={
              <StyledButton
                onClick={handleDelete}
                variant={"outlined"}
                color={"error"}
                startIcon={<AiOutlineDelete />}
              >
                <FormattedMessage {...messages.delete} />
              </StyledButton>
            }
          >
            <StyledButton onClick={handleClose} variant={"contained"}>
              <FormattedMessage {...messages.close} />
            </StyledButton>
          </AppDialogActions>
        }
      >
        <Popover
          id={dialogMenuId}
          open={Boolean(menuAnchorEl)}
          anchorEl={menuAnchorEl}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          onClose={() => setMenuAnchorEl(null)}
        >
          <MouseActionList
            pictogram={pictogram}
            editAction={handlerClickOpen}
            closeAction={() => setMenuAnchorEl(null)}
            copyAction={setCopy}
            pasteObject={copy}
            omit={ACTIONS_IN_DIALOG}
            onSelect={handleSelectFromDialog}
          />
        </Popover>

        <PictEditForm pictogram={pictogram} submit={submit} />
      </AppDialog>
    </>
  );
};

export default PictEditModal;
