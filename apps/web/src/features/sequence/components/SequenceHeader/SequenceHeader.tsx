// La capçalera de la seqüència oberta a l'edició (pla dels estils, pas 5; D13,
// D16, D21 i D23): el nom, l'estil i el menú «⋯» de la seqüència.
//
// - **El nom** és per a qui edita i no s'imprimeix; sense, «Seqüència _N_». Es
//   canvia des del mateix nom (el llapis) o des del «⋯».
// - **L'estil**: el nom de l'estil de la seqüència o, si algun pictograma té
//   retocs, «Personalitzat» amb la **mateixa marca** que la targeta i una ajuda
//   que diu l'estil de base i quants pictogrames en tenen (fonament 03, §6).
// - **El «⋯»**: «Estil: _nom_ — Canvia…» (obre la Galeria d'estils), «Canvia el
//   nom», «Restableix els pictogrames» i «Treu aquesta seqüència», que treu
//   l'oberta, no l'última.
//
// Ni la marca ni el nom no surten mai a la vista, la impressió ni el PDF: la
// capçalera és només de l'edició.
import React, { FormEvent, useId, useRef, useState } from "react";
import {
  Box,
  DialogContentText,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdEdit,
  MdHelpOutline,
  MdMoreHoriz,
  MdOutlineDriveFileRenameOutline,
  MdOutlinePalette,
  MdOutlineRemoveCircleOutline,
  MdSettingsBackupRestore,
  MdTune,
} from "react-icons/md";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import StyledButton from "@/style/StyledButton";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import ConfirmDialog from "@components/ConfirmDialog/ConfirmDialog";
import confirmMessages from "@components/ConfirmDialog/ConfirmDialog.lang";
import {
  removeSequenceActionCreator,
  sequenceRenamedActionCreator,
} from "@features/sequence/store/documentSlice";
import { resetSequencePictogramsThunk } from "@features/sequence/store/styleSlice";
import { retouchedCountOf } from "@features/sequence/store/sequenceStyleThunks";
import { namedStyleOf } from "@features/sequence/style/namedStyle";
import { customizedMark } from "@features/sequence/components/PictEdit/PictEditModal.styled";
import StyleGallery from "@features/sequence/components/StyleGallery/StyleGallery";
import galleryMessages from "@features/sequence/components/StyleGallery/StyleGallery.lang";
import freeLayoutMessages from "@features/free-layout/components/FreeLayoutPages/FreeLayoutPages.lang";
import messages from "./SequenceHeader.lang";

interface SequenceHeaderProps {
  /** La clau de la seqüència oberta */
  sequenceKey: number;
}

const SequenceHeader = ({
  sequenceKey,
}: SequenceHeaderProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const menuId = useId();
  const menuButtonId = useId();
  const renameTitleId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const amount = useAppSelector(
    (state) => Object.keys(state.document.content).length,
  );
  const savedName = useAppSelector(
    (state) => state.document.sequenceNames?.[sequenceKey],
  );
  const styleName = useAppSelector((state) => {
    const named = namedStyleOf(
      state.document.styles,
      state.document.sequenceStyleIds?.[sequenceKey],
    );
    return named?.name ?? state.document.styleName;
  });
  const retouched = useAppSelector((state) =>
    retouchedCountOf(state.document, sequenceKey),
  );
  // Quants pictogrames amb contingut té: és el que es perdria en treure-la.
  // Els buits no compten: tornar-los a posar és un clic
  const filled = useAppSelector(
    (state) =>
      (state.document.content[sequenceKey] ?? []).filter(
        (pict) => pict.img.selectedId > 0 || pict.img.url || pict.text,
      ).length,
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  const name =
    savedName?.trim() ||
    intl.formatMessage(freeLayoutMessages.sequenceName, {
      number: sequenceKey + 1,
    });
  // L'estil del document d'un document d'abans pot no tenir nom
  const baseStyleName =
    styleName ?? intl.formatMessage(galleryMessages.documentStyle);
  const customized = retouched > 0;
  const shownStyleName = customized
    ? intl.formatMessage(messages.customized)
    : baseStyleName;
  const customizedHelp = intl.formatMessage(messages.customizedHelp, {
    name: baseStyleName,
    count: retouched,
  });

  const run = (action: () => void) => {
    // El menú es tanca primer: així el focus torna al «⋯» abans que l'acció
    // obri un diàleg, que en tancar-se hi tornarà
    setMenuOpen(false);
    action();
  };

  const openRename = () => {
    setDraftName(savedName ?? "");
    setRenaming(true);
  };

  const handleRename = (event: FormEvent) => {
    event.preventDefault();
    dispatch(
      sequenceRenamedActionCreator({ key: sequenceKey, name: draftName }),
    );
    setRenaming(false);
    showSnackbar({
      message: intl.formatMessage(messages.renamed),
      severity: "success",
    });
  };

  const removeSequence = () => {
    setConfirmRemove(false);
    dispatch(removeSequenceActionCreator(sequenceKey));
    showSnackbar({
      message: intl.formatMessage(messages.removed, { name }),
      severity: "success",
    });
  };

  // Treure una seqüència s'endú els seus pictogrames i no es pot desfer. Si no
  // en té cap, no hi ha res a perdre i la confirmació només seria fricció
  const handleRemove = () => {
    if (filled > 0) setConfirmRemove(true);
    else removeSequence();
  };

  const renameLabel = intl.formatMessage(messages.rename);
  const actionsLabel = intl.formatMessage(messages.sequenceActions, { name });

  return (
    <Box
      component="header"
      data-testid="sequence-header"
      sx={{ px: 1, py: 0.5, "@media print": { display: "none" } }}
    >
      {/* El «⋯» sempre a la dreta de la primera línia; el nom i l'estil es
          parteixen en dues línies si no hi caben */}
      <Stack direction="row" alignItems="flex-start" gap={0.5}>
        <Stack
          direction="row"
          alignItems="center"
          gap={0.5}
          flexWrap="wrap"
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
          <Typography
            component="h2"
            variant="h6"
            sx={{ overflowWrap: "anywhere", minWidth: 0 }}
          >
            {name}
          </Typography>
          <Tooltip title={renameLabel}>
            <IconButton
              aria-label={renameLabel}
              onClick={openRename}
              sx={{
                minWidth: APP_TOUCH_TARGET_MIN,
                minHeight: APP_TOUCH_TARGET_MIN,
              }}
            >
              <MdEdit aria-hidden size={20} />
            </IconButton>
          </Tooltip>

          <Stack
            direction="row"
            alignItems="center"
            gap={0.75}
            sx={{ ml: { xs: 0, sm: 1 } }}
          >
            <Typography color="text.secondary" data-testid="sequence-style">
              {intl.formatMessage(messages.styleLabel, {
                name: shownStyleName,
              })}
            </Typography>
            {customized && (
              <>
                {/* La mateixa marca que la targeta: un sol símbol per a la
                  mateixa cosa. Informativa: el text ja ho diu */}
                <Box aria-hidden sx={customizedMark}>
                  <MdTune />
                </Box>
                <Tooltip title={customizedHelp} enterTouchDelay={0}>
                  <IconButton
                    aria-label={customizedHelp}
                    size="small"
                    sx={{
                      minWidth: APP_TOUCH_TARGET_MIN,
                      minHeight: APP_TOUCH_TARGET_MIN,
                    }}
                  >
                    <MdHelpOutline aria-hidden />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>

        <Tooltip title={actionsLabel}>
          <IconButton
            ref={menuButtonRef}
            id={menuButtonId}
            aria-label={actionsLabel}
            aria-haspopup="menu"
            aria-controls={menuOpen ? menuId : undefined}
            aria-expanded={menuOpen ? "true" : undefined}
            onClick={() => setMenuOpen(true)}
            sx={{
              minWidth: APP_TOUCH_TARGET_MIN,
              minHeight: APP_TOUCH_TARGET_MIN,
            }}
          >
            <MdMoreHoriz aria-hidden />
          </IconButton>
        </Tooltip>
      </Stack>

      <Menu
        id={menuId}
        anchorEl={menuButtonRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        slotProps={{ list: { "aria-labelledby": menuButtonId } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
          onClick={() => run(() => setGalleryOpen(true))}
        >
          <ListItemIcon>
            <MdOutlinePalette aria-hidden />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage(messages.changeStyle, { name: shownStyleName })}
          </ListItemText>
        </MenuItem>
        <MenuItem
          sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
          onClick={() => run(openRename)}
        >
          <ListItemIcon>
            <MdOutlineDriveFileRenameOutline aria-hidden />
          </ListItemIcon>
          <ListItemText>{renameLabel}</ListItemText>
        </MenuItem>
        {/* Només si hi ha retocs, com «Restableix l'estil» del pictograma */}
        {customized && (
          <MenuItem
            sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
            onClick={() =>
              run(() => dispatch(resetSequencePictogramsThunk(sequenceKey)))
            }
          >
            <ListItemIcon>
              <MdSettingsBackupRestore aria-hidden />
            </ListItemIcon>
            <ListItemText>
              {intl.formatMessage(messages.resetPictograms)}
            </ListItemText>
          </MenuItem>
        )}
        {/* L'acció que treu, sola i l'última (`feedback-i-accions.md`). Un
            document té sempre una seqüència */}
        {amount > 1 && <Divider />}
        {amount > 1 && (
          <MenuItem
            sx={{ minHeight: APP_TOUCH_TARGET_MIN, color: "error.main" }}
            onClick={() => run(handleRemove)}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <MdOutlineRemoveCircleOutline aria-hidden />
            </ListItemIcon>
            <ListItemText>{intl.formatMessage(messages.remove)}</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {galleryOpen && (
        <StyleGallery
          open
          onClose={() => setGalleryOpen(false)}
          sequenceKey={sequenceKey}
          sequenceName={name}
        />
      )}

      <AppDialog
        open={renaming}
        onClose={() => setRenaming(false)}
        title={renameLabel}
        titleId={renameTitleId}
        maxWidth="xs"
        actions={
          <AppDialogActions>
            <StyledButton color="inherit" onClick={() => setRenaming(false)}>
              {intl.formatMessage(confirmMessages.cancel)}
            </StyledButton>
            <StyledButton
              variant="contained"
              type="submit"
              form={`${renameTitleId}-form`}
            >
              {intl.formatMessage(messages.renameSave)}
            </StyledButton>
          </AppDialogActions>
        }
      >
        <DialogContentText variant="body2" sx={{ mb: 2 }}>
          {intl.formatMessage(messages.renameHelp, {
            number: sequenceKey + 1,
          })}
        </DialogContentText>
        <form id={`${renameTitleId}-form`} onSubmit={handleRename}>
          <TextField
            autoFocus
            fullWidth
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            label={intl.formatMessage(messages.nameField)}
            placeholder={intl.formatMessage(freeLayoutMessages.sequenceName, {
              number: sequenceKey + 1,
            })}
          />
        </form>
      </AppDialog>

      <ConfirmDialog
        open={confirmRemove}
        title={intl.formatMessage(messages.confirmRemoveTitle, { name })}
        body={intl.formatMessage(messages.confirmRemoveBody, {
          count: filled,
        })}
        confirmLabel={intl.formatMessage(messages.confirmRemove)}
        onConfirm={removeSequence}
        onCancel={() => setConfirmRemove(false)}
      />
    </Box>
  );
};

export default SequenceHeader;
