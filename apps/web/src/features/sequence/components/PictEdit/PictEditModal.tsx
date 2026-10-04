import { FormattedMessage, useIntl } from "react-intl";
import { Box, IconButton, Popover, Tooltip, Button } from "@mui/material";
import { MdMoreVert, MdTune } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import PictogramCard from "@components/PictogramCard/PictogramCard";
import { PictSequence } from "@/types/sequence";
import { useRef, useState } from "react";
import messages from "./PictEdit.lang";
import { pictogramTrigger } from "./PictEditModal.styled";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { updatePictSequenceActionCreator } from "@features/sequence/store/documentSlice";
import CardTextEditor from "./CardTextEditor";
import { PictogramCardDefaults } from "@/types/sequence";
import PictEditForm from "./PictEditForm";
import MouseActionList from "@components/utils/MouseActionList/MouseActionList";
import {
  usePictogramActions,
  type PictogramActionKey,
} from "@components/utils/MouseActionList/usePictogramActions";
import {
  selectDocumentCardDefaults,
  selectDocumentStyle,
} from "@features/sequence/style/styleSelectors";
import { isPictogramCustomized } from "@features/sequence/style/pictogramStyle";
import { customizedMark } from "./PictEditModal.styled";
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
  const dispatch = useAppDispatch();
  // L'estil del document, no les preferències de qui el mira
  const defaults: PictogramCardDefaults = useAppSelector(
    selectDocumentCardDefaults,
  );
  const documentStyle = useAppSelector(selectDocumentStyle);
  // Té retocs propis? Ho diuen la marca de la targeta, el seu nom accessible i
  // el menú contextual, que llavors ofereix «Restableix l'estil»
  const customized = isPictogramCustomized(pictogram, documentStyle);
  // El mateix, però del formulari obert, que encara no s'ha desat
  const [formCustomized, setFormCustomized] = useState(customized);
  // «Restableix l'estil» triat al menú del diàleg: el fa el formulari
  const [resetRequest, setResetRequest] = useState(0);

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

  // El text s'edita damunt de la targeta allà on la targeta el pinta: a dalt
  // o a baix. Sense text visible, no hi ha on editar-lo (queda el diàleg)
  const { textPosition } = pictogram.settings;
  const textEditPosition =
    textPosition === "top" || textPosition === "bottom"
      ? textPosition
      : undefined;
  const [editingText, setEditingText] = useState(false);

  const handlerEditText = () => {
    if (textEditPosition) setEditingText(true);
  };

  // Des del menú contextual, el camp surt quan el menú ja s'ha tancat: en
  // tancar-se torna el focus a la targeta, i el camp el perdria i es tancaria
  const editTextOnMenuExited = useRef(false);
  const handlerEditTextFromMenu = () => {
    editTextOnMenuExited.current = true;
  };
  const handlerMenuExited = () => {
    if (!editTextOnMenuExited.current) return;
    editTextOnMenuExited.current = false;
    handlerEditText();
  };

  const handlerCommitText = (value: string, fromKeyboard: boolean) => {
    setEditingText(false);
    if (fromKeyboard) triggerRef.current?.focus();
    const newText = value.trim();
    // Sense canvis, no es toca el document
    if (newText === (pictogram.text || pictogram.img.searched.word)) return;
    dispatch(
      updatePictSequenceActionCreator({
        ...pictogram,
        // Buit: la targeta torna a mostrar la paraula cercada
        text: newText === "" ? undefined : newText,
      }),
    );
  };

  const handlerCancelText = () => {
    setEditingText(false);
    triggerRef.current?.focus();
  };

  // Un clic damunt del text de la targeta l'edita allà mateix; a la resta de
  // la targeta, obre el diàleg com sempre
  const handlerClickCard = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (
      textEditPosition &&
      event.target instanceof Element &&
      event.target.closest("[data-card-text]")
    ) {
      setEditingText(true);
      return;
    }
    handlerClickOpen();
  };

  const actions = usePictogramActions({
    pictogram,
    editAction: handlerClickOpen,
    editTextAction: handlerEditText,
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

  // El menú contextual amb el teclat: Maj+F10 i la tecla de menú. Windows i
  // Linux ja hi disparen `contextmenu`, però macOS no; aquí val a tot arreu.
  // F2, com a tot arreu per reanomenar, edita el text a la targeta
  const handlerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "F2" && textEditPosition) {
      event.preventDefault();
      setEditingText(true);
      return;
    }
    if (
      event.key === "ContextMenu" ||
      (event.shiftKey && event.key === "F10")
    ) {
      event.preventDefault();
      setAnchorEl(event.currentTarget);
    }
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
    // Dins del diàleg, restablir és una edició més del formulari: no el tanca
    if (action === "resetStyle") {
      setResetRequest((request) => request + 1);
      return;
    }
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

  // Nom accessible de la targeta: «esmorzar, pictograma 3, personalitzat»
  const cardText = pictogram.text || pictogram.img.searched.word;
  const cardNumber = pictogram.indexSequence + 1;
  const cardName = cardText
    ? intl.formatMessage(messages.cardName, {
        text: cardText,
        number: cardNumber,
      })
    : intl.formatMessage(messages.cardNameNoText, { number: cardNumber });
  const cardLabel = customized
    ? intl.formatMessage(messages.cardNameCustomized, { name: cardName })
    : cardName;

  return (
    <>
      {/* L'editor del text va fora del botó: un camp no pot anar dins d'un
          botó. L'embolcall li dona on posar-se, damunt de la targeta */}
      <Box sx={{ position: "relative" }}>
        <Button
          ref={triggerRef}
          aria-label={cardLabel}
          aria-describedby={openPopover ? popoverId : undefined}
          aria-keyshortcuts={textEditPosition ? "F2" : undefined}
          variant="text"
          onClick={handlerClickCard}
          onContextMenu={handlerContextMenu}
          onKeyDown={handlerKeyDown}
          sx={pictogramTrigger}
        >
          {/* La marca va fora de la targeta, que talla el que en sobresurt, i
            només a la graella d'edició: la vista, la pantalla completa, la
            impressió i el PDF pinten la targeta sense aquest embolcall */}
          <Box sx={{ position: "relative" }}>
            <PictogramCard
              view={"complete"}
              pictogram={pictogram}
              defaults={defaults}
              size={{ pictSize: 0.75 }}
            />
            {customized && (
              <Box
                data-testid="customized-mark"
                data-html2canvas-ignore
                aria-hidden
                sx={customizedMark}
              >
                <MdTune />
              </Box>
            )}
          </Box>
        </Button>
        {editingText && textEditPosition && (
          <CardTextEditor
            initialText={cardText}
            label={intl.formatMessage(messages.cardTextInput, {
              number: cardNumber,
            })}
            position={textEditPosition}
            onCommit={handlerCommitText}
            onCancel={handlerCancelText}
          />
        )}
      </Box>
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
        TransitionProps={{ onExited: handlerMenuExited }}
      >
        <MouseActionList
          pictogram={pictogram}
          editAction={handlerClickOpen}
          editTextAction={
            textEditPosition ? handlerEditTextFromMenu : undefined
          }
          closeAction={handlerClosePopover}
          copyAction={setCopy}
          pasteObject={copy}
          customized={customized}
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
            customized={formCustomized}
            onSelect={handleSelectFromDialog}
          />
        </Popover>

        <PictEditForm
          pictogram={pictogram}
          submit={submit}
          onCustomizedChange={setFormCustomized}
          resetRequest={resetRequest}
        />
      </AppDialog>
    </>
  );
};

export default PictEditModal;
