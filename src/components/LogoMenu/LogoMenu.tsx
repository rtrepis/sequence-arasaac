import React, { ChangeEvent, forwardRef, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  Slide,
} from "@mui/material";
import { Container } from "@mui/system";
import { Stack } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import {
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineSetting,
  AiOutlineCloudDownload,
  AiOutlineCloudUpload,
  AiOutlineClose,
} from "react-icons/ai";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./LogoMenu.lang";
import settingsMessages from "../../Modals/DefaultSettingsModal/DefaultSettingsModal.lang";
import DefaultForm from "../DefaultsForm/DefaultForm";
import ModalDownload from "../ButtonWithModalDownload/ModalDownload";
import { useAppDispatch } from "../../app/hooks";
import {
  addSequenceActionCreator,
  loadDocumentSaacActionCreator,
} from "../../app/slice/documentSlice";
import { updateDefaultSettingsActionCreator } from "../../app/slice/uiSlice";
import { trackEvent } from "../../hooks/usePageTracking";
import { useFeedback } from "../../context/FeedbackContext";
import feedbackMessages from "../../context/FeedbackContext/FeedbackContext.lang";

// Transició per al dialog de settings (des de l'esquerra)
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const LogoMenu = (): React.ReactElement => {
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSnackbar, showBackdrop, hideBackdrop } = useFeedback();

  // Estat del menú
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Estat dels modals
  const [openSettings, setOpenSettings] = useState(false);
  const [openDownload, setOpenDownload] = useState(false);

  // Ref per l'input de fitxer ocult
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers del menú
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Navegació
  const handleEditView = () => {
    handleMenuClose();
    navigate("create-sequence");
  };

  const handlePreviewView = () => {
    handleMenuClose();
    navigate("view-sequence");
  };

  // Settings
  const handleSettings = () => {
    handleMenuClose();
    setOpenSettings(true);
  };

  // Download
  const handleDownload = () => {
    handleMenuClose();
    setOpenDownload(true);
  };

  // Load: clic programàtic a l'input ocult
  const handleLoad = () => {
    handleMenuClose();
    fileInputRef.current?.click();
  };

  // Lògica de càrrega de fitxer (mateixa que ButtonWithFileLoad)
  const loadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const valueTrackEvent: string[] = [];
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file) {
        showBackdrop({
          message: intl.formatMessage(feedbackMessages.loading),
        });

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsedJson = JSON.parse(e.target?.result as string);

            // Compatibilitat amb format antic {sequence: {}, defaults...}
            if ("sequence" in parsedJson) {
              dispatch(addSequenceActionCreator(parsedJson.sequence));
              valueTrackEvent.push("sequence");
            }

            if ("documentState" in parsedJson) {
              dispatch(
                loadDocumentSaacActionCreator(parsedJson.documentState),
              );
              valueTrackEvent.push("documentState");
            }

            if ("defaultSettings" in parsedJson) {
              dispatch(
                updateDefaultSettingsActionCreator(parsedJson.defaultSettings),
              );
              valueTrackEvent.push("defaultSettings");
            }

            hideBackdrop();
            showSnackbar({
              message: intl.formatMessage(feedbackMessages.loadSuccess),
              severity: "success",
            });
          } catch (error) {
            console.error(error);
            hideBackdrop();
            showSnackbar({
              message: intl.formatMessage(feedbackMessages.loadError),
              severity: "error",
            });
          }
        };
        reader.readAsText(file);
      }
    }

    trackEvent({
      event: "load-event",
      event_category: "file",
      event_label: "load",
      value: valueTrackEvent.join(" "),
    });

    // Netejar l'input per permetre carregar el mateix fitxer dues vegades
    if (input) input.value = "";
  };

  return (
    <>
      {/* Logo com a trigger del menú */}
      <IconButton
        onClick={handleMenuOpen}
        aria-label={intl.formatMessage(messages.menuAriaLabel)}
        aria-controls={menuOpen ? "logo-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? "true" : undefined}
        sx={{ padding: 0 }}
      >
        <img src="/favicon.png" alt="logo" height={25} width={34.16} />
      </IconButton>

      {/* Menú desplegable */}
      <Menu
        id="logo-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditView}>
          <ListItemIcon>
            <AiOutlineEdit />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage {...messages.editView} />
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={handlePreviewView}>
          <ListItemIcon>
            <AiOutlineEye />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage {...messages.previewView} />
          </ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <AiOutlineSetting />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage {...messages.settings} />
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <AiOutlineCloudDownload />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage {...messages.download} />
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={handleLoad}>
          <ListItemIcon>
            <AiOutlineCloudUpload />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage {...messages.load} />
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Input ocult per carregar fitxers */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={loadFile}
        accept="text/plain,.saac,application/json"
      />

      {/* Dialog de configuracions per defecte */}
      <Dialog
        fullScreen
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        slots={{ transition: Transition }}
      >
        <AppBar
          sx={{ position: { xs: "fixed", md: "relative" } }}
          elevation={1}
        >
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              <FormattedMessage {...settingsMessages.settings} />
            </Typography>
            <IconButton
              edge="start"
              color="secondary"
              onClick={() => setOpenSettings(false)}
              aria-label={intl.formatMessage(settingsMessages.close)}
            >
              <AiOutlineClose />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container sx={{ marginTop: 2 }}>
          <Stack sx={{ height: 40, display: { md: "none" } }} />
          <DefaultForm submit={openSettings} />
        </Container>
      </Dialog>

      {/* Modal de descàrrega */}
      {openDownload && (
        <ModalDownload
          open={openDownload}
          onClose={() => setOpenDownload(false)}
        />
      )}
    </>
  );
};

export default LogoMenu;
